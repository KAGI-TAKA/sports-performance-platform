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
      error: parseResult.error.issues[0]?.message ?? "Validasi gagal",
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

  try {
    await prisma.sessionLog.create({
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
    return { success: true };
  } catch (err: any) {
    console.error("Failed to create session log:", err);
    return { success: false, error: "Gagal membuat catatan sesi latihan" };
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
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete session log:", err);
    return { success: false, error: "Gagal menghapus catatan sesi" };
  }
}
