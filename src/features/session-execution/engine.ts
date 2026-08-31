import type { AttendanceStatus, ScheduleStatus } from "@prisma/client";
import type { ExecutionItemStatus, SessionExecutionPlanExercise } from "./types";

/**
 * Checks whether a given member role has authority to execute a specific session.
 * - OWNER, ADMIN, HEAD_COACH: Organization-wide execution authority.
 * - ASSISTANT_COACH: Authority strictly restricted to sessions where they are the assigned coach.
 * - Others: Access denied.
 */
export function canMemberExecuteSession(
  memberRole: string,
  memberId: string,
  sessionCoachId: string
): boolean {
  const role = memberRole.toLowerCase();

  if (role === "owner" || role === "admin" || role === "head_coach") {
    return true;
  }

  if (role === "assistant_coach") {
    return memberId === sessionCoachId;
  }

  return false;
}

/**
 * Evaluates session execution lifecycle eligibility based on ScheduleStatus.
 */
export function isSessionEligibleForExecution(sessionStatus: ScheduleStatus): {
  eligible: boolean;
  readOnly: boolean;
  reason?: string;
} {
  if (sessionStatus === "CANCELLED") {
    return {
      eligible: false,
      readOnly: true,
      reason: "Sesi latihan ini telah dibatalkan dan tidak dapat dieksekusi.",
    };
  }

  if (sessionStatus === "COMPLETED") {
    return {
      eligible: false,
      readOnly: true,
      reason: "Sesi latihan telah selesai dan berstatus arsip/read-only.",
    };
  }

  return {
    eligible: true,
    readOnly: false,
  };
}

/**
 * Pure function to format a structured, human-readable summary of executed exercises
 * for an athlete to be stored in SessionLog.activitiesDone.
 *
 * NOTE: Default initial state is PLANNED ("Belum Dilakukan").
 * Coach / Assistant Coach explicitly marks:
 * - DONE: Selesai
 * - MODIFIED: Modifikasi
 * - SKIPPED: Dilewati
 */
export function formatActivitiesDoneFromExecution(
  trainingPlanTitle: string | null,
  exercises: SessionExecutionPlanExercise[],
  athleteExecution: Record<
    string,
    {
      status: ExecutionItemStatus;
      notes?: string;
      actualSets?: number;
      actualReps?: string;
    }
  >,
  fallbackText?: string
): string {
  if (exercises.length === 0) {
    return fallbackText?.trim() || "Sesi latihan umum tanpa program terstruktur.";
  }

  const lines: string[] = [];
  if (trainingPlanTitle) {
    lines.push(`Program: ${trainingPlanTitle}`);
  }

  exercises.forEach((ex, idx) => {
    const exec = athleteExecution[ex.id];
    // Strict default: PLANNED (Belum Dilakukan)
    const status: ExecutionItemStatus = exec?.status ?? "PLANNED";

    let statusLabel = "Belum Dilakukan";
    if (status === "DONE") statusLabel = "Selesai";
    else if (status === "MODIFIED") statusLabel = "Modifikasi";
    else if (status === "SKIPPED") statusLabel = "Dilewati";

    let detailStr = "";
    if (ex.sets || ex.reps) {
      const setsStr = exec?.actualSets ? `${exec.actualSets} sets` : ex.sets ? `${ex.sets} sets` : "";
      const repsStr = exec?.actualReps ? `${exec.actualReps}` : ex.reps ? `${ex.reps}` : "";
      detailStr = [setsStr, repsStr].filter(Boolean).join(" x ");
    }

    let line = `${idx + 1}. ${ex.name} — ${statusLabel}`;
    if (detailStr) {
      line += ` (${detailStr})`;
    }
    if (exec?.notes?.trim()) {
      line += ` [Catatan: ${exec.notes.trim()}]`;
    }

    lines.push(line);
  });

  return lines.join("\n");
}

/**
 * Validates session completion preconditions.
 * - Every enrolled athlete must have a non-UNMARKED attendance status.
 * - At least 1 athlete must be PRESENT or LATE.
 */
export function validateSessionCompletionPreconditions(
  athletes: { athleteId: string; attendanceStatus: AttendanceStatus }[]
): {
  valid: boolean;
  error?: string;
  participatedCount: number;
} {
  if (athletes.length === 0) {
    return {
      valid: false,
      error: "Sesi tidak memiliki atlet terdaftar.",
      participatedCount: 0,
    };
  }

  const hasUnmarked = athletes.some((a) => a.attendanceStatus === "UNMARKED");
  if (hasUnmarked) {
    return {
      valid: false,
      error: "Semua atlet terdaftar harus memiliki status presensi sebelum sesi diselesaikan.",
      participatedCount: 0,
    };
  }

  const participatedCount = athletes.filter(
    (a) => a.attendanceStatus === "PRESENT" || a.attendanceStatus === "LATE"
  ).length;

  if (participatedCount === 0) {
    return {
      valid: false,
      error: "Tidak ada atlet yang hadir (Present/Late). Gunakan status Tidak Hadir (NO_SHOW) atau Batalkan Sesi jika sesi tidak terlaksana.",
      participatedCount: 0,
    };
  }

  return {
    valid: true,
    participatedCount,
  };
}
