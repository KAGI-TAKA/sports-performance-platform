"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";

/**
 * Submit a reschedule request for an overdue session.
 * Only assistant_coach can call this.
 */
export async function submitRescheduleRequestAction(
  sessionId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  if (ctx.role !== "assistant_coach") {
    return { success: false, error: "Hanya asisten pelatih yang dapat mengajukan permintaan reschedule." };
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason || trimmedReason.length < 5) {
    return { success: false, error: "Alasan reschedule minimal harus 5 karakter." };
  }

  // Verify session exists and belongs to this org and is assigned to this coach/executor
  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: sessionId,
      organizationId: ctx.organizationId,
      OR: [
        { executorId: ctx.memberId },
        { executorId: null, coachId: ctx.memberId },
      ],
    },
    select: { id: true, status: true },
  });

  if (!session) {
    return { success: false, error: "Sesi tidak ditemukan atau tidak ditugaskan kepada Anda." };
  }

  if (session.status !== "SCHEDULED") {
    return { success: false, error: "Hanya sesi dengan status TERJADWAL yang dapat diminta reschedule." };
  }

  // Check for existing request
  const existing = await prisma.rescheduleRequest.findUnique({
    where: {
      scheduleSessionId_requestedByMemberId: {
        scheduleSessionId: sessionId,
        requestedByMemberId: ctx.memberId,
      },
    },
  });

  if (existing) {
    if (existing.status === "PENDING") {
      return { success: false, error: "Permintaan reschedule untuk sesi ini sedang menunggu persetujuan." };
    }
    if (existing.status === "APPROVED") {
      return { success: false, error: "Permintaan reschedule untuk sesi ini telah disetujui." };
    }
    // If rejected, allow re-submission by updating
    await prisma.rescheduleRequest.update({
      where: { id: existing.id },
      data: {
        reason: trimmedReason,
        status: "PENDING",
        reviewedByMemberId: null,
        reviewNote: null,
        reviewedAt: null,
      },
    });
    revalidatePath("/schedule");
    return { success: true };
  }

  await prisma.rescheduleRequest.create({
    data: {
      organizationId: ctx.organizationId,
      scheduleSessionId: sessionId,
      requestedByMemberId: ctx.memberId,
      reason: trimmedReason,
    },
  });

  revalidatePath("/schedule");
  return { success: true };
}

/**
 * Head Coach / Admin reviews a reschedule request.
 */
export async function reviewRescheduleRequestAction(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  reviewNote: string
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin" && ctx.role !== "head_coach") {
    return { success: false, error: "Hanya Head Coach atau Admin yang dapat meninjau permintaan reschedule." };
  }

  const request = await prisma.rescheduleRequest.findFirst({
    where: { id: requestId, organizationId: ctx.organizationId },
    select: { id: true, status: true },
  });

  if (!request) {
    return { success: false, error: "Permintaan tidak ditemukan." };
  }

  if (request.status !== "PENDING") {
    return { success: false, error: "Permintaan ini sudah ditinjau sebelumnya." };
  }

  await prisma.rescheduleRequest.update({
    where: { id: requestId },
    data: {
      status,
      reviewedByMemberId: ctx.memberId,
      reviewNote: reviewNote.trim() || null,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}
