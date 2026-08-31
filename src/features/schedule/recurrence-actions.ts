"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { getPotentialConflictSessions } from "./conflict-queries";
import {
  generateRecurringOccurrences,
  evaluateRecurringSchedulePreview,
  type RecurringSchedulePreview,
  type RecurrenceGenerationParams,
} from "./recurrence-engine";

export interface PreviewRecurringScheduleInput {
  startDateStr: string;
  endDateStr: string;
  weekdays: number[];
  startTimeStr: string;
  endTimeStr: string;
  coachId: string;
  athleteIds: string[];
  trainingPlanId?: string | null;
}

export interface CreateRecurringScheduleInput extends PreviewRecurringScheduleInput {
  title: string;
  location?: string;
  notes?: string;
  includeAthleteWarnings?: boolean; // If true, creates sessions with athlete warnings; if false, skips them
}

export type PreviewRecurringScheduleResult =
  | { success: true; preview: RecurringSchedulePreview }
  | { success: false; error: string };

export type CreateRecurringScheduleResult =
  | {
      success: true;
      createdCount: number;
      skippedCount: number;
      totalRequested: number;
    }
  | { success: false; error: string };

/**
 * Generates an interactive preview of recurring sessions with conflict and duplicate detection.
 */
export async function previewRecurringScheduleAction(
  input: PreviewRecurringScheduleInput
): Promise<PreviewRecurringScheduleResult> {
  const ctx = await requireOrgContext();

  const {
    startDateStr,
    endDateStr,
    weekdays,
    startTimeStr,
    endTimeStr,
    coachId,
    athleteIds,
    trainingPlanId,
  } = input;

  if (!coachId) {
    return { success: false, error: "Pelatih wajib dipilih" };
  }

  if (!Array.isArray(athleteIds) || athleteIds.length === 0) {
    return { success: false, error: "Pilih minimal satu atlet" };
  }

  // Assistant coach scoping: Assistant can only preview/schedule for self
  if (ctx.role === "assistant_coach" && ctx.memberId !== coachId) {
    return {
      success: false,
      error: "Asisten pelatih hanya dapat membuat jadwal untuk diri sendiri",
    };
  }

  // Verify coach belongs to tenant
  const coachMember = await prisma.member.findFirst({
    where: { id: coachId, organizationId: ctx.organizationId },
  });
  if (!coachMember) {
    return { success: false, error: "Pelatih tidak ditemukan di organisasi ini" };
  }

  // Verify athletes belong to tenant
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
      error: "Beberapa atlet yang dipilih tidak aktif atau bukan milik organisasi Anda",
    };
  }

  // Verify training plan if provided
  if (trainingPlanId && trainingPlanId !== "NONE") {
    const targetPlan = await prisma.trainingPlan.findFirst({
      where: { id: trainingPlanId, organizationId: ctx.organizationId, isActive: true },
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
        error: "Program latihan spesifik atlet tidak cocok dengan daftar atlet yang dipilih",
      };
    }
  }

  // 1. Generate occurrences
  const genResult = generateRecurringOccurrences({
    startDateStr,
    endDateStr,
    weekdays,
    startTimeStr,
    endTimeStr,
  });

  if (!genResult.success) {
    return { success: false, error: genResult.error };
  }

  const { occurrences } = genResult;

  // 2. Fetch candidate conflict sessions in a single batch query
  const ranges = occurrences.map((o) => ({
    startTime: o.startTime,
    endTime: o.endTime,
  }));

  const candidateSessions = await getPotentialConflictSessions(
    ctx.organizationId,
    ranges
  );

  // 3. Evaluate preview in memory
  const preview = evaluateRecurringSchedulePreview(
    {
      targetCoachId: coachId,
      targetAthleteIds: athleteIds,
      occurrences,
    },
    candidateSessions
  );

  return { success: true, preview };
}

/**
 * Creates valid recurring sessions in an atomic transaction, skipping duplicates and coach-blocked slots.
 */
export async function createRecurringScheduleAction(
  input: CreateRecurringScheduleInput
): Promise<CreateRecurringScheduleResult> {
  const ctx = await requireOrgContext();

  const {
    title,
    startDateStr,
    endDateStr,
    weekdays,
    startTimeStr,
    endTimeStr,
    coachId,
    athleteIds,
    trainingPlanId,
    location,
    notes,
    includeAthleteWarnings = false,
  } = input;

  if (!title || title.trim().length < 2) {
    return { success: false, error: "Judul sesi minimal 2 karakter" };
  }

  if (!coachId) {
    return { success: false, error: "Pelatih wajib dipilih" };
  }

  if (!Array.isArray(athleteIds) || athleteIds.length === 0) {
    return { success: false, error: "Pilih minimal satu atlet" };
  }

  // Assistant coach scoping
  if (ctx.role === "assistant_coach" && ctx.memberId !== coachId) {
    return {
      success: false,
      error: "Asisten pelatih hanya dapat membuat jadwal untuk diri sendiri",
    };
  }

  // Verify coach
  const coachMember = await prisma.member.findFirst({
    where: { id: coachId, organizationId: ctx.organizationId },
  });
  if (!coachMember) {
    return { success: false, error: "Pelatih tidak ditemukan di organisasi ini" };
  }

  // Verify athletes
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
      error: "Beberapa atlet yang dipilih tidak aktif atau bukan milik organisasi Anda",
    };
  }

  // Verify training plan
  const effectivePlanId =
    trainingPlanId && trainingPlanId !== "NONE" ? trainingPlanId : null;

  if (effectivePlanId) {
    const targetPlan = await prisma.trainingPlan.findFirst({
      where: { id: effectivePlanId, organizationId: ctx.organizationId, isActive: true },
    });

    if (!targetPlan) {
      return {
        success: false,
        error: "Program latihan tidak ditemukan atau tidak aktif",
      };
    }

    if (targetPlan.athleteId && !athleteIds.includes(targetPlan.athleteId)) {
      return {
        success: false,
        error: "Program latihan spesifik atlet tidak cocok dengan daftar atlet",
      };
    }
  }

  // 1. Generate occurrences
  const genResult = generateRecurringOccurrences({
    startDateStr,
    endDateStr,
    weekdays,
    startTimeStr,
    endTimeStr,
  });

  if (!genResult.success) {
    return { success: false, error: genResult.error };
  }

  const { occurrences } = genResult;

  // 2. Fetch fresh candidates for conflict & duplicate verification
  const ranges = occurrences.map((o) => ({
    startTime: o.startTime,
    endTime: o.endTime,
  }));

  const candidateSessions = await getPotentialConflictSessions(
    ctx.organizationId,
    ranges
  );

  // 3. Evaluate occurrences
  const preview = evaluateRecurringSchedulePreview(
    {
      targetCoachId: coachId,
      targetAthleteIds: athleteIds,
      occurrences,
    },
    candidateSessions
  );

  // 4. Filter occurrences that are valid to create
  const occurrencesToCreate = preview.occurrences.filter((occ) => {
    if (occ.status === "ALREADY_EXISTS" || occ.status === "COACH_BLOCKED") {
      return false; // Hard blocked & duplicates are never created
    }
    if (occ.status === "ATHLETE_WARNING" && !includeAthleteWarnings) {
      return false; // Skipped if user did not accept warnings
    }
    return true; // SAFE or accepted ATHLETE_WARNING
  });

  if (occurrencesToCreate.length === 0) {
    return {
      success: false,
      error: "Tidak ada sesi yang dapat dibuat (semua sesi bentrok atau sudah ada)",
    };
  }

  try {
    // 5. Atomic Batch Creation in Prisma Transaction
    await prisma.$transaction(async (tx) => {
      for (const occ of occurrencesToCreate) {
        await tx.scheduleSession.create({
          data: {
            organizationId: ctx.organizationId,
            coachId,
            trainingPlanId: effectivePlanId,
            title: title.trim(),
            startTime: occ.startTime,
            endTime: occ.endTime,
            location: location?.trim() || null,
            notes: notes?.trim() || null,
            status: "SCHEDULED",
            athletes: {
              create: athleteIds.map((athleteId) => ({
                athleteId,
              })),
            },
          },
        });
      }
    });

    revalidatePath("/schedule");
    revalidatePath("/dashboard");

    return {
      success: true,
      createdCount: occurrencesToCreate.length,
      skippedCount: occurrences.length - occurrencesToCreate.length,
      totalRequested: occurrences.length,
    };
  } catch (err: unknown) {
    console.error("Failed to create recurring sessions in transaction:", err);
    return {
      success: false,
      error: "Gagal membuat sesi berulang dalam database transaksi.",
    };
  }
}
