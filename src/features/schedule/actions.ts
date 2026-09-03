"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { createScheduleSchema, updateScheduleSchema } from "./schema";
import { parseLocalDateTimeToUTC } from "./utils";
import { buildScheduleConflictReport } from "./conflict-engine";
import { getPotentialConflictSessions } from "./conflict-queries";
import type { ScheduleStatus } from "@prisma/client";

/**
 * Conservative Status Transition Matrix Rules:
 * Defines valid status transitions to protect historical data integrity.
 */
const VALID_TRANSITIONS: Record<ScheduleStatus, ScheduleStatus[]> = {
  SCHEDULED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  CANCELLED: ["SCHEDULED"],
  NO_SHOW: ["SCHEDULED", "COMPLETED", "CANCELLED"],
  COMPLETED: ["SCHEDULED"], // Allowed ONLY if NO sessionLog is attached!
};

export async function createScheduleSession(formData: FormData) {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin" && ctx.role !== "head_coach") {
    return {
      success: false,
      error: "Hanya Admin dan Head Coach yang dapat membuat jadwal sesi baru.",
    };
  }

  const athleteIdsRaw = formData.getAll("athleteIds");
  const trainingPlanIdVal = formData.get("trainingPlanId") as string;
  const trainingPlanId =
    trainingPlanIdVal && trainingPlanIdVal !== "NONE"
      ? trainingPlanIdVal
      : undefined;

  const rawData = {
    title: formData.get("title") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
    coachId: formData.get("coachId") as string,
    athleteIds: athleteIdsRaw.map(String),
    location: (formData.get("location") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parseResult = createScheduleSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi gagal",
    };
  }

  const { title, startTime, endTime, coachId, athleteIds, location, notes } =
    parseResult.data;

  // Validate start vs end time using centralized timezone conversion (Asia/Jakarta -> UTC)
  let start: Date;
  let end: Date;
  try {
    start = parseLocalDateTimeToUTC(startTime);
    end = parseLocalDateTimeToUTC(endTime);
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Format waktu tidak valid",
    };
  }

  if (end <= start) {
    return {
      success: false,
      error: "Waktu selesai harus setelah waktu mulai",
    };
  }

  // Verify server-side that coach belongs to organization
  const coachMember = await prisma.member.findFirst({
    where: { id: coachId, organizationId: ctx.organizationId },
  });
  if (!coachMember) {
    return { success: false, error: "Pelatih tidak ditemukan di organisasi ini" };
  }

  // Verify server-side that all assigned athlete IDs belong to this organization & are active
  const validAthletes = await prisma.athlete.findMany({
    where: {
      organizationId: ctx.organizationId,
      id: { in: athleteIds },
      isActive: true,
    },
    select: { id: true },
  });

  if (validAthletes.length !== athleteIds.length) {
    return {
      success: false,
      error: "Beberapa atlet yang dipilih tidak aktif, tidak valid, atau bukan milik organisasi Anda",
    };
  }

  // Verify training plan & athlete compatibility if provided
  if (trainingPlanId) {
    const targetPlan = await prisma.trainingPlan.findFirst({
      where: { id: trainingPlanId, organizationId: ctx.organizationId, isActive: true },
    });

    if (!targetPlan) {
      return {
        success: false,
        error: "Program latihan tidak ditemukan atau tidak aktif di organisasi Anda",
      };
    }

    // If athlete-specific plan, ensure target athlete is enrolled in session
    if (targetPlan.athleteId && !athleteIds.includes(targetPlan.athleteId)) {
      return {
        success: false,
        error: "Program latihan spesifik atlet tidak cocok dengan daftar atlet terdaftar pada sesi ini",
      };
    }
  }

  // Conflict Detection: Coach collision is a HARD BLOCK
  const candidateSessions = await getPotentialConflictSessions(ctx.organizationId, [
    { startTime: start, endTime: end },
  ]);
  const conflictReport = buildScheduleConflictReport(
    { coachId, athleteIds, startTime: start, endTime: end },
    candidateSessions
  );

  if (conflictReport.hasCoachConflict && conflictReport.coachConflict) {
    const cf = conflictReport.coachConflict;
    const timeStr = `${cf.existingStart.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${cf.existingEnd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    return {
      success: false,
      error: `Bentrok Jadwal: Pelatih sudah memiliki sesi "${cf.existingTitle}" (${timeStr}) pada rentang waktu yang sama.`,
    };
  }

  try {
    await prisma.scheduleSession.create({
      data: {
        organizationId: ctx.organizationId,
        coachId,
        trainingPlanId: trainingPlanId || null,
        title,
        startTime: start,
        endTime: end,
        location,
        notes,
        athletes: {
          create: athleteIds.map((athleteId) => ({
            athleteId,
          })),
        },
      },
    });

    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to create schedule session:", err);
    return { success: false, error: "Gagal membuat jadwal sesi latihan" };
  }
}

export async function updateScheduleSession(sessionId: string, formData: FormData) {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin" && ctx.role !== "head_coach") {
    return {
      success: false,
      error: "Hanya Admin dan Head Coach yang dapat mengubah jadwal sesi latihan.",
    };
  }

  const session = await prisma.scheduleSession.findFirst({
    where: { id: sessionId, organizationId: ctx.organizationId },
  });

  if (!session) {
    return { success: false, error: "Jadwal tidak ditemukan atau akses ditolak" };
  }

  const athleteIdsRaw = formData.getAll("athleteIds");
  const trainingPlanIdVal = formData.get("trainingPlanId") as string;

  const rawData = {
    title: formData.get("title") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
    coachId: formData.get("coachId") as string,
    athleteIds: athleteIdsRaw.map(String),
    location: (formData.get("location") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    status: (formData.get("status") as ScheduleStatus) || undefined,
  };

  const parseResult = updateScheduleSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi gagal",
    };
  }

  const { title, startTime, endTime, coachId, athleteIds, location, notes, status } =
    parseResult.data;

  // Validate start vs end time using centralized timezone conversion (Asia/Jakarta -> UTC)
  let start: Date;
  let end: Date;
  try {
    start = parseLocalDateTimeToUTC(startTime);
    end = parseLocalDateTimeToUTC(endTime);
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Format waktu tidak valid",
    };
  }

  if (end <= start) {
    return {
      success: false,
      error: "Waktu selesai harus setelah waktu mulai",
    };
  }

  // Verify coach
  const coachMember = await prisma.member.findFirst({
    where: { id: coachId, organizationId: ctx.organizationId },
  });
  if (!coachMember) {
    return { success: false, error: "Pelatih tidak ditemukan di organisasi ini" };
  }

  // Verify active athletes
  const validAthletes = await prisma.athlete.findMany({
    where: {
      organizationId: ctx.organizationId,
      id: { in: athleteIds },
      isActive: true,
    },
    select: { id: true },
  });

  if (validAthletes.length !== athleteIds.length) {
    return {
      success: false,
      error: "Beberapa atlet yang dipilih tidak aktif, tidak valid, atau bukan milik organisasi Anda",
    };
  }

  // Determine effective trainingPlanId for validation & update
  const effectivePlanId = formData.has("trainingPlanId")
    ? (trainingPlanIdVal && trainingPlanIdVal !== "NONE" ? trainingPlanIdVal : null)
    : session.trainingPlanId;

  if (effectivePlanId) {
    const targetPlan = await prisma.trainingPlan.findFirst({
      where: { id: effectivePlanId, organizationId: ctx.organizationId, isActive: true },
    });

    if (!targetPlan) {
      return {
        success: false,
        error: "Program latihan tidak ditemukan atau tidak aktif di organisasi Anda",
      };
    }

    if (targetPlan.athleteId && !athleteIds.includes(targetPlan.athleteId)) {
      return {
        success: false,
        error: "Program latihan spesifik atlet tidak cocok dengan daftar atlet terdaftar pada sesi ini",
      };
    }
  }

  // Conflict Detection: Coach collision is a HARD BLOCK (excluding self)
  const candidateSessions = await getPotentialConflictSessions(ctx.organizationId, [
    { startTime: start, endTime: end },
  ]);
  const conflictReport = buildScheduleConflictReport(
    { coachId, athleteIds, startTime: start, endTime: end, excludeSessionId: sessionId },
    candidateSessions
  );

  if (conflictReport.hasCoachConflict && conflictReport.coachConflict) {
    const cf = conflictReport.coachConflict;
    const timeStr = `${cf.existingStart.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${cf.existingEnd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    return {
      success: false,
      error: `Bentrok Jadwal: Pelatih sudah memiliki sesi "${cf.existingTitle}" (${timeStr}) pada rentang waktu yang sama.`,
    };
  }

  try {
    await prisma.$transaction([
      // 1. Delete previous athlete assignments
      prisma.scheduleSessionAthlete.deleteMany({
        where: { sessionId },
      }),
      // 2. Update session data & recreate assignments
      prisma.scheduleSession.update({
        where: { id: sessionId },
        data: {
          title,
          coachId,
          trainingPlanId: effectivePlanId,
          startTime: start,
          endTime: end,
          location,
          notes,
          ...(status ? { status } : {}),
          athletes: {
            create: athleteIds.map((athleteId) => ({
              athleteId,
            })),
          },
        },
      }),
    ]);

    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update schedule session:", err);
    return { success: false, error: "Gagal memperbarui jadwal sesi latihan" };
  }
}

export async function updateScheduleStatus(
  sessionId: string,
  targetStatus: ScheduleStatus
) {
  const ctx = await requireOrgContext();

  const session = await prisma.scheduleSession.findFirst({
    where: { id: sessionId, organizationId: ctx.organizationId },
    include: { sessionLogs: { select: { id: true } } },
  });

  if (!session) {
    return { success: false, error: "Jadwal tidak ditemukan atau akses ditolak" };
  }

  const currentStatus = session.status;

  // No-op if status is unchanged
  if (currentStatus === targetStatus) {
    return { success: true };
  }

  // Check status transition matrix
  const allowedTargets = VALID_TRANSITIONS[currentStatus] ?? [];
  if (!allowedTargets.includes(targetStatus)) {
    return {
      success: false,
      error: `Perubahan status dari "${currentStatus}" ke "${targetStatus}" tidak diizinkan untuk menjaga integritas riwayat latihan.`,
    };
  }

  // Extra check for COMPLETED -> SCHEDULED transition: Must not have linked SessionLog
  if (currentStatus === "COMPLETED" && targetStatus === "SCHEDULED" && session.sessionLogs.length > 0) {
    return {
      success: false,
      error: "Sesi ini sudah memiliki Catatan Latihan (Session Log) dan tidak dapat dikembalikan ke status Terjadwal.",
    };
  }

  try {
    await prisma.scheduleSession.update({
      where: { id: sessionId },
      data: { status: targetStatus },
    });

    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update schedule status:", err);
    return { success: false, error: "Gagal mengubah status jadwal" };
  }
}

export async function deleteScheduleSession(sessionId: string) {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin" && ctx.role !== "head_coach") {
    return {
      success: false,
      error: "Hanya Admin dan Head Coach yang dapat menghapus jadwal sesi latihan.",
    };
  }

  const session = await prisma.scheduleSession.findFirst({
    where: { id: sessionId, organizationId: ctx.organizationId },
    include: { sessionLogs: { select: { id: true } } },
  });

  if (!session) {
    return { success: false, error: "Jadwal tidak ditemukan atau akses ditolak" };
  }

  // HISTORICAL DATA INTEGRITY DELETION POLICY:
  // 1. If session has a linked SessionLog, reject deletion!
  if (session.sessionLogs.length > 0) {
    return {
      success: false,
      error: "Sesi ini telah memiliki Catatan Latihan (Session Log) dan tidak dapat dihapus. Gunakan status Dibatalkan untuk mengarsip.",
    };
  }

  // 2. If session status is COMPLETED, reject deletion!
  if (session.status === "COMPLETED") {
    return {
      success: false,
      error: "Sesi yang sudah Selesai tidak dapat dihapus untuk menjaga riwayat operasional. Gunakan status Dibatalkan jika diperlukan.",
    };
  }

  try {
    await prisma.scheduleSession.delete({
      where: { id: sessionId },
    });

    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete schedule session:", err);
    return { success: false, error: "Gagal menghapus jadwal sesi latihan" };
  }
}
