"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getPortalContextByToken } from "@/features/portal/queries";
import { requireOrgContext } from "@/lib/auth-context";
import {
  submitParentFeedbackSchema,
  reviewParentFeedbackSchema,
  type SubmitParentFeedbackInput,
  type ReviewParentFeedbackInput,
} from "./schema";
import {
  isFeedbackWindowValid,
  isAttendanceEligibleForFeedback,
  canMemberReviewFeedback,
} from "./engine";

/**
 * Submits feedback from a parent for a completed training session.
 * All identity, tenant, and coach assignments are determined strictly server-side.
 */
export async function submitParentFeedbackAction(
  rawInput: SubmitParentFeedbackInput
): Promise<{ success: boolean; error?: string; feedbackId?: string }> {
  // 1. Zod Validation
  const parseResult = submitParentFeedbackSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi feedback gagal",
    };
  }

  const {
    token,
    scheduleSessionId,
    sessionRating,
    communicationRating,
    athleteAttentionRating,
    comment,
  } = parseResult.data;

  // 2. Validate Portal Authentication Context
  const authRes = await getPortalContextByToken(token);
  if (!authRes.success) {
    return {
      success: false,
      error: "Akses portal tidak valid atau telah berakhir",
    };
  }

  const { context } = authRes;

  // 3. Confirm Access Type is PARENT
  if (context.accessType !== "PARENT") {
    return {
      success: false,
      error: "Hanya portal orang tua yang memiliki wewenang untuk mengirimkan feedback sesi",
    };
  }

  // 4. Fetch Session and verify multi-tenant isolation & athlete registration
  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: scheduleSessionId,
      organizationId: context.organizationId,
    },
    include: {
      athletes: {
        where: { athleteId: context.athleteId },
        select: { athleteId: true },
      },
      coach: {
        select: { id: true, organizationId: true },
      },
      executor: {
        select: { id: true, organizationId: true },
      },
    },
  });

  if (!session) {
    return {
      success: false,
      error: "Sesi latihan tidak ditemukan atau akses ditolak",
    };
  }

  // 5. Verify Session Status
  if (session.status !== "COMPLETED") {
    return {
      success: false,
      error: "Feedback hanya dapat diberikan untuk sesi latihan yang telah selesai",
    };
  }

  // 6. Verify Feedback Time Window (7 days)
  const windowCheck = isFeedbackWindowValid(session.endTime);
  if (!windowCheck.valid) {
    return {
      success: false,
      error: windowCheck.reason || "Batas waktu pengisian feedback untuk sesi ini telah berakhir",
    };
  }

  // 7. Verify Athlete Enrollment in this Session
  if (session.athletes.length === 0) {
    return {
      success: false,
      error: "Atlet tidak terdaftar pada sesi latihan ini",
    };
  }

  // 8. Verify Attendance Status (Must be PRESENT or LATE)
  const attendance = await prisma.attendance.findUnique({
    where: {
      sessionId_athleteId: {
        sessionId: scheduleSessionId,
        athleteId: context.athleteId,
      },
    },
    select: { status: true, organizationId: true },
  });

  if (
    !attendance ||
    attendance.organizationId !== context.organizationId ||
    !isAttendanceEligibleForFeedback(attendance.status)
  ) {
    return {
      success: false,
      error: "Feedback tersedia setelah sesi yang diikuti selesai",
    };
  }

  // 9. Verify Actual Coach / Executor Tenant Integrity
  const actualCoachMember = session.executor ?? session.coach;
  if (actualCoachMember.organizationId !== context.organizationId) {
    return {
      success: false,
      error: "Integritas data pelatih sesi tidak valid",
    };
  }

  // 10. Check for Existing Duplicate Feedback
  const existingFeedback = await prisma.parentFeedback.findUnique({
    where: {
      scheduleSessionId_athleteId: {
        scheduleSessionId,
        athleteId: context.athleteId,
      },
    },
    select: { id: true },
  });

  if (existingFeedback) {
    return {
      success: false,
      error: "Feedback untuk sesi ini sudah pernah dikirimkan",
    };
  }

  // 11. Create Parent Feedback Record with Actual Executor Attribution
  try {
    const newFeedback = await prisma.parentFeedback.create({
      data: {
        organizationId: context.organizationId,
        scheduleSessionId,
        athleteId: context.athleteId,
        portalAccessId: context.portalAccessId,
        coachMemberId: actualCoachMember.id, // Strictly server-determined: Actual Executor
        sessionRating,
        communicationRating,
        athleteAttentionRating,
        comment: comment?.trim() ? comment.trim() : null,
      },
    });

    revalidatePath(`/portal/${token}`);
    revalidatePath("/dashboard");
    return { success: true, feedbackId: newFeedback.id };
  } catch (err: any) {
    // Handle concurrent duplicate submission gracefully
    if (err?.code === "P2002") {
      return {
        success: false,
        error: "Feedback untuk sesi ini sudah pernah dikirimkan",
      };
    }
    console.error("Gagal menyimpan parent feedback:", err);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat menyimpan feedback",
    };
  }
}

/**
 * Server Action for Head Coach / Admin to review a parent feedback and optionally add supervisory notes.
 */
export async function reviewParentFeedbackAction(
  rawInput: ReviewParentFeedbackInput
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  // 1. Verify Member Authority
  if (!canMemberReviewFeedback(ctx.role)) {
    return {
      success: false,
      error: "Anda tidak memiliki wewenang untuk meninjau feedback pelatih",
    };
  }

  // 2. Validate Input
  const parseResult = reviewParentFeedbackSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi tinjauan feedback gagal",
    };
  }

  const { feedbackId, isReviewed, headCoachNotes } = parseResult.data;

  // 3. Fetch Feedback within the same Organization
  const feedback = await prisma.parentFeedback.findFirst({
    where: {
      id: feedbackId,
      organizationId: ctx.organizationId,
    },
    select: { id: true },
  });

  if (!feedback) {
    return {
      success: false,
      error: "Data feedback tidak ditemukan atau akses ditolak",
    };
  }

  // 4. Update Review Status and Supervisory Notes
  try {
    await prisma.parentFeedback.update({
      where: { id: feedbackId },
      data: {
        isReviewed,
        reviewedAt: isReviewed ? new Date() : null,
        headCoachNotes: headCoachNotes?.trim() ? headCoachNotes.trim() : null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal memperbarui tinjauan feedback:", err);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat memperbarui tinjauan",
    };
  }
}
