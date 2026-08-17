"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { createSessionLogSchema } from "./schema";

export async function createSessionLog(formData: FormData) {
  const ctx = await requireOrgContext();

  const scheduleSessionIdVal = formData.get("scheduleSessionId") as string;
  const rawData = {
    athleteId: formData.get("athleteId") as string,
    sessionDate: formData.get("sessionDate") as string,
    activitiesDone: formData.get("activitiesDone") as string,
    coachFeedback: (formData.get("coachFeedback") as string) || undefined,
    videoUrl: (formData.get("videoUrl") as string) || undefined,
    scheduleSessionId:
      scheduleSessionIdVal && scheduleSessionIdVal !== "NONE"
        ? scheduleSessionIdVal
        : undefined,
  };

  const parseResult = createSessionLogSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi data log sesi gagal",
    };
  }

  const {
    athleteId,
    sessionDate,
    activitiesDone,
    coachFeedback,
    videoUrl,
    scheduleSessionId,
  } = parseResult.data;

  // 1. Verifikasi active status atlet & kepemilikan organisasi
  const athleteCheck = await prisma.athlete.findFirst({
    where: {
      id: athleteId,
      organizationId: ctx.organizationId,
      isActive: true,
    },
    select: { id: true },
  });

  if (!athleteCheck) {
    return {
      success: false,
      error: "Atlet tidak ditemukan atau tidak aktif di organisasi ini",
    };
  }

  // 2. Jika terhubung ke ScheduleSession, verifikasi kepemilikan organisasi DAN pendaftaran atlet pada sesi tersebut
  if (scheduleSessionId) {
    const sessionCheck = await prisma.scheduleSession.findFirst({
      where: {
        id: scheduleSessionId,
        organizationId: ctx.organizationId,
      },
      include: {
        athletes: {
          where: { athleteId },
          select: { athleteId: true },
        },
      },
    });

    if (!sessionCheck) {
      return {
        success: false,
        error: "Sesi jadwal tidak ditemukan atau akses ditolak",
      };
    }

    // Jika sesi jadwal memiliki daftar atlet terdaftar, verifikasi pendaftaran atlet
    if (sessionCheck.athletes.length === 0) {
      return {
        success: false,
        error: "Atlet tidak terdaftar pada sesi jadwal operasional tersebut",
      };
    }
  }

  try {
    const log = await prisma.sessionLog.create({
      data: {
        organizationId: ctx.organizationId,
        athleteId,
        createdByMemberId: ctx.memberId,
        sessionDate: new Date(sessionDate),
        activitiesDone,
        coachFeedback,
        videoUrl: videoUrl || null,
        scheduleSessionId: scheduleSessionId || null,
      },
    });

    revalidatePath("/session-logs");
    revalidatePath("/athletes");
    revalidatePath(`/athletes/${athleteId}`);
    revalidatePath("/dashboard");
    return { success: true, logId: log.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal membuat catatan sesi latihan";
    return { success: false, error: errorMsg };
  }
}

export async function deleteSessionLog(logId: string) {
  const ctx = await requireOrgContext();

  const existingLog = await prisma.sessionLog.findFirst({
    where: { id: logId, organizationId: ctx.organizationId },
  });

  if (!existingLog) {
    return { success: false, error: "Catatan sesi tidak ditemukan atau akses ditolak" };
  }

  try {
    await prisma.sessionLog.delete({
      where: { id: logId },
    });

    revalidatePath("/session-logs");
    revalidatePath("/athletes");
    revalidatePath(`/athletes/${existingLog.athleteId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus catatan sesi";
    return { success: false, error: errorMsg };
  }
}
