"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { getPotentialConflictSessions } from "./conflict-queries";
import {
  calculateSourceDuration,
  prepareCloneTargetDates,
  evaluateCloneSessionPreview,
  type CloneSessionPreview,
  type SourceSessionData,
} from "./clone-engine";

export interface PreviewCloneSessionResult {
  success: boolean;
  error?: string;
  preview?: CloneSessionPreview;
  sourceSession?: SourceSessionData;
}

export interface CloneScheduleSessionInput {
  sourceSessionId: string;
  targetDateStr: string;     // YYYY-MM-DD
  targetStartTimeStr: string; // HH:mm
  includeAthleteWarnings?: boolean;
}

export interface CloneScheduleSessionResult {
  success: boolean;
  error?: string;
  newSessionId?: string;
  targetDateFormatted?: string;
}

/**
 * Validates and previews a clone session target against potential conflicts and duplicates.
 */
export async function previewCloneSessionAction(
  sourceSessionId: string,
  targetDateStr: string,
  targetStartTimeStr: string
): Promise<PreviewCloneSessionResult> {
  const ctx = await requireOrgContext();

  if (!sourceSessionId) {
    return { success: false, error: "ID sesi sumber wajib disertakan" };
  }

  // 1. Fetch source session scoped to organization
  const source = await prisma.scheduleSession.findFirst({
    where: { id: sourceSessionId, organizationId: ctx.organizationId },
    include: {
      coach: {
        include: {
          user: { select: { name: true } },
        },
      },
      trainingPlan: {
        select: { id: true, title: true, isActive: true },
      },
      athletes: {
        include: {
          athlete: {
            select: { id: true, fullName: true, isActive: true },
          },
        },
      },
    },
  });

  if (!source) {
    return { success: false, error: "Sesi sumber tidak ditemukan atau akses ditolak" };
  }

  // 2. Permission Check: Assistant Coach can only clone their own sessions
  if (ctx.role === "assistant_coach" && source.coachId !== ctx.memberId) {
    return {
      success: false,
      error: "Asisten pelatih hanya dapat menduplikasi sesi yang ditugaskan kepada diri sendiri",
    };
  }

  // 3. Coach Validation: Coach must still be an active member in organization
  const coachMember = await prisma.member.findFirst({
    where: { id: source.coachId, organizationId: ctx.organizationId },
  });
  if (!coachMember) {
    return {
      success: false,
      error: "Pelatih pada sesi sumber sudah tidak aktif sehingga sesi tidak dapat diduplikasi",
    };
  }

  // 4. Training Plan Validation: If source had a training plan, it must still be active
  if (source.trainingPlanId) {
    if (!source.trainingPlan || !source.trainingPlan.isActive) {
      return {
        success: false,
        error: "Program latihan pada sesi sumber sudah tidak tersedia. Pilih sesi lain atau perbarui program sebelum menduplikasi.",
      };
    }
  }

  // 5. Athlete Roster Validation: All athletes must exist and be active
  if (source.athletes.length === 0) {
    return {
      success: false,
      error: "Sesi sumber tidak memiliki atlet terdaftar sehingga tidak dapat diduplikasi",
    };
  }

  for (const a of source.athletes) {
    if (!a.athlete || !a.athlete.isActive) {
      return {
        success: false,
        error: `Atlet ${a.athlete?.fullName || "terdaftar"} sudah tidak aktif. Sesi tidak dapat diduplikasi.`,
      };
    }
  }

  // 6. Calculate target datetime
  const { durationMs, durationMinutes } = calculateSourceDuration(
    source.startTime,
    source.endTime
  );

  const datePrep = prepareCloneTargetDates({
    targetDateStr,
    targetStartTimeStr,
    durationMs,
  });

  if (!datePrep.success) {
    return { success: false, error: datePrep.error };
  }

  const { targetStartTime, targetEndTime } = datePrep;

  // 7. Fetch candidate conflict sessions in a single batch query
  const candidateSessions = await getPotentialConflictSessions(ctx.organizationId, [
    { startTime: targetStartTime, endTime: targetEndTime },
  ]);

  // 8. Evaluate preview in memory
  const preview = evaluateCloneSessionPreview({
    sourceSessionId: source.id,
    sourceTitle: source.title,
    targetCoachId: source.coachId,
    targetAthleteIds: source.athletes.map((a) => a.athlete.id),
    targetStartTime,
    targetEndTime,
    durationMinutes,
    candidateSessions,
  });

  const sourceSessionData: SourceSessionData = {
    id: source.id,
    title: source.title,
    status: source.status,
    startTime: source.startTime,
    endTime: source.endTime,
    location: source.location,
    notes: source.notes,
    coachId: source.coachId,
    coachName: source.coach.user.name,
    trainingPlanId: source.trainingPlanId,
    trainingPlanTitle: source.trainingPlan?.title,
    athletes: source.athletes.map((a) => ({
      athleteId: a.athlete.id,
      athleteName: a.athlete.fullName,
      isActive: a.athlete.isActive,
    })),
  };

  return {
    success: true,
    preview,
    sourceSession: sourceSessionData,
  };
}

/**
 * Executes atomic cloning of a source session to a new target date and time.
 */
export async function cloneScheduleSessionAction(
  input: CloneScheduleSessionInput
): Promise<CloneScheduleSessionResult> {
  const ctx = await requireOrgContext();

  const {
    sourceSessionId,
    targetDateStr,
    targetStartTimeStr,
    includeAthleteWarnings = false,
  } = input;

  if (!sourceSessionId) {
    return { success: false, error: "ID sesi sumber wajib disertakan" };
  }

  // 1. Fetch and validate source session
  const source = await prisma.scheduleSession.findFirst({
    where: { id: sourceSessionId, organizationId: ctx.organizationId },
    include: {
      coach: true,
      trainingPlan: { select: { id: true, title: true, isActive: true } },
      athletes: {
        include: {
          athlete: { select: { id: true, fullName: true, isActive: true } },
        },
      },
    },
  });

  if (!source) {
    return { success: false, error: "Sesi sumber tidak ditemukan atau akses ditolak" };
  }

  // 2. Permission Check
  if (ctx.role === "assistant_coach" && source.coachId !== ctx.memberId) {
    return {
      success: false,
      error: "Asisten pelatih hanya dapat menduplikasi sesi yang ditugaskan kepada diri sendiri",
    };
  }

  // 3. Coach Validation
  const coachMember = await prisma.member.findFirst({
    where: { id: source.coachId, organizationId: ctx.organizationId },
  });
  if (!coachMember) {
    return {
      success: false,
      error: "Pelatih pada sesi sumber sudah tidak aktif sehingga sesi tidak dapat diduplikasi",
    };
  }

  // 4. Training Plan Validation
  if (source.trainingPlanId) {
    if (!source.trainingPlan || !source.trainingPlan.isActive) {
      return {
        success: false,
        error: "Program latihan pada sesi sumber sudah tidak tersedia. Perbarui program sebelum menduplikasi.",
      };
    }
  }

  // 5. Athlete Roster Validation
  if (source.athletes.length === 0) {
    return {
      success: false,
      error: "Sesi sumber tidak memiliki atlet terdaftar sehingga tidak dapat diduplikasi",
    };
  }

  for (const a of source.athletes) {
    if (!a.athlete || !a.athlete.isActive) {
      return {
        success: false,
        error: `Atlet ${a.athlete?.fullName || "terdaftar"} sudah tidak aktif. Sesi tidak dapat diduplikasi.`,
      };
    }
  }

  // 6. Compute target dates
  const { durationMs, durationMinutes } = calculateSourceDuration(
    source.startTime,
    source.endTime
  );

  const datePrep = prepareCloneTargetDates({
    targetDateStr,
    targetStartTimeStr,
    durationMs,
  });

  if (!datePrep.success) {
    return { success: false, error: datePrep.error };
  }

  const { targetStartTime, targetEndTime } = datePrep;

  // 7. Fresh Conflict & Duplicate Check
  const candidateSessions = await getPotentialConflictSessions(ctx.organizationId, [
    { startTime: targetStartTime, endTime: targetEndTime },
  ]);

  const preview = evaluateCloneSessionPreview({
    sourceSessionId: source.id,
    sourceTitle: source.title,
    targetCoachId: source.coachId,
    targetAthleteIds: source.athletes.map((a) => a.athlete.id),
    targetStartTime,
    targetEndTime,
    durationMinutes,
    candidateSessions,
  });

  if (preview.isAlreadyExists) {
    return {
      success: false,
      error: "Sesi dengan waktu tersebut sudah tersedia.",
    };
  }

  if (preview.hasCoachConflict) {
    return {
      success: false,
      error: preview.reason || "Pelatih sudah memiliki sesi lain pada rentang waktu yang sama.",
    };
  }

  if (preview.hasAthleteWarning && !includeAthleteWarnings) {
    return {
      success: false,
      error: "Terdapat bentrok jadwal atlet yang belum dikonfirmasi.",
    };
  }

  try {
    // 8. Atomic Creation in Prisma Transaction
    const newSession = await prisma.$transaction(async (tx) => {
      // Re-verify exact duplicate inside transaction to prevent race conditions
      const duplicateInTx = await tx.scheduleSession.findFirst({
        where: {
          organizationId: ctx.organizationId,
          coachId: source.coachId,
          startTime: targetStartTime,
          endTime: targetEndTime,
          status: { in: ["SCHEDULED", "COMPLETED"] },
        },
        select: { id: true },
      });

      if (duplicateInTx) {
        return duplicateInTx;
      }

      // Create new clean ScheduleSession
      return tx.scheduleSession.create({
        data: {
          organizationId: ctx.organizationId,
          coachId: source.coachId,
          trainingPlanId: source.trainingPlanId,
          title: source.title,
          startTime: targetStartTime,
          endTime: targetEndTime,
          location: source.location,
          notes: source.notes,
          status: "SCHEDULED", // Always resets to SCHEDULED
          athletes: {
            create: source.athletes.map((a) => ({
              athleteId: a.athlete.id,
            })),
          },
        },
        select: { id: true, startTime: true },
      });
    });

    revalidatePath("/schedule");
    revalidatePath("/dashboard");

    const targetFormatted = targetStartTime.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      success: true,
      newSessionId: newSession.id,
      targetDateFormatted: targetFormatted,
    };
  } catch (err: unknown) {
    console.error("Failed to execute clone session transaction:", err);
    return {
      success: false,
      error: "Gagal menduplikasi sesi latihan di database transaksi.",
    };
  }
}
