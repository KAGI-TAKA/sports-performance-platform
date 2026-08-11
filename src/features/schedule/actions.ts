"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { createScheduleSchema } from "./schema";
import type { ScheduleStatus } from "@prisma/client";

export async function createScheduleSession(formData: FormData) {
  const ctx = await requireOrgContext();

  const athleteIdsRaw = formData.getAll("athleteIds");
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

  try {
    await prisma.scheduleSession.create({
      data: {
        organizationId: ctx.organizationId,
        coachId,
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
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
    return { success: true };
  } catch (err: any) {
    console.error("Failed to create schedule session:", err);
    return { success: false, error: "Gagal membuat jadwal sesi latihan" };
  }
}

export async function updateScheduleStatus(
  sessionId: string,
  status: ScheduleStatus
) {
  const ctx = await requireOrgContext();

  const session = await prisma.scheduleSession.findFirst({
    where: { id: sessionId, organizationId: ctx.organizationId },
  });

  if (!session) {
    return { success: false, error: "Jadwal tidak ditemukan atau akses ditolak" };
  }

  try {
    await prisma.scheduleSession.update({
      where: { id: sessionId },
      data: { status },
    });

    revalidatePath("/schedule");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update schedule status:", err);
    return { success: false, error: "Gagal mengubah status jadwal" };
  }
}

export async function deleteScheduleSession(sessionId: string) {
  const ctx = await requireOrgContext();

  const session = await prisma.scheduleSession.findFirst({
    where: { id: sessionId, organizationId: ctx.organizationId },
  });

  if (!session) {
    return { success: false, error: "Jadwal tidak ditemukan atau akses ditolak" };
  }

  try {
    await prisma.scheduleSession.delete({
      where: { id: sessionId },
    });

    revalidatePath("/schedule");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete schedule session:", err);
    return { success: false, error: "Gagal menghapus jadwal" };
  }
}
