import type { ScheduleStatus } from "@prisma/client";
import { parseLocalDateTimeToUTC, DEFAULT_SCHEDULE_TIMEZONE } from "./utils";
import {
  isStatusConflictEligible,
  buildScheduleConflictReport,
  type ExistingConflictSession,
  type CoachConflictResult,
  type AthleteConflictResult,
} from "./conflict-engine";

export interface SourceSessionData {
  id: string;
  title: string;
  status: ScheduleStatus;
  startTime: Date;
  endTime: Date;
  location?: string | null;
  notes?: string | null;
  coachId: string;
  coachName?: string;
  trainingPlanId?: string | null;
  trainingPlanTitle?: string;
  athletes: {
    athleteId: string;
    athleteName?: string;
    isActive?: boolean;
  }[];
}

export interface CloneSessionPreview {
  sourceSessionId: string;
  sourceTitle: string;
  targetStartTime: Date;
  targetEndTime: Date;
  durationMinutes: number;
  isAlreadyExists: boolean;
  hasCoachConflict: boolean;
  coachConflict: CoachConflictResult | null;
  hasAthleteWarning: boolean;
  athleteConflicts: AthleteConflictResult[];
  canProceed: boolean; // false if ALREADY_EXISTS or coach collision
  reason?: string;
}

/**
 * Returns dynamic contextual label for clone vs reschedule based on source status.
 */
export function getCloneActionLabel(status: ScheduleStatus): {
  actionLabel: string;
  titleLabel: string;
  buttonLabel: string;
} {
  if (status === "CANCELLED" || status === "NO_SHOW") {
    return {
      actionLabel: "Jadwalkan Ulang",
      titleLabel: "Jadwalkan Ulang Sesi",
      buttonLabel: "Jadwalkan Ulang Sesi Ini",
    };
  }
  return {
    actionLabel: "Duplikasi Sesi",
    titleLabel: "Duplikasi Sesi Latihan",
    buttonLabel: "Duplikasi Sesi Ini",
  };
}

/**
 * Calculates duration in milliseconds and minutes from start and end dates.
 */
export function calculateSourceDuration(
  startTime: Date,
  endTime: Date
): { durationMs: number; durationMinutes: number } {
  const s = new Date(startTime).getTime();
  const e = new Date(endTime).getTime();

  if (isNaN(s) || isNaN(e) || e <= s) {
    // Default fallback: 60 minutes
    const defaultMs = 60 * 60 * 1000;
    return { durationMs: defaultMs, durationMinutes: 60 };
  }

  const durationMs = e - s;
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  return { durationMs, durationMinutes };
}

/**
 * Prepares target start and end dates based on input date, time, and source duration.
 */
export function prepareCloneTargetDates(params: {
  targetDateStr: string;     // YYYY-MM-DD
  targetStartTimeStr: string; // HH:mm
  durationMs: number;
  timeZone?: string;
}): { success: true; targetStartTime: Date; targetEndTime: Date } | { success: false; error: string } {
  const { targetDateStr, targetStartTimeStr, durationMs, timeZone = DEFAULT_SCHEDULE_TIMEZONE } = params;

  if (!targetDateStr || !targetStartTimeStr) {
    return { success: false, error: "Tanggal target dan jam mulai wajib diisi" };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(targetDateStr)) {
    return { success: false, error: "Format tanggal target tidak valid (diharapkan YYYY-MM-DD)" };
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(targetStartTimeStr)) {
    return { success: false, error: "Format jam mulai tidak valid (diharapkan HH:mm)" };
  }

  if (durationMs <= 0) {
    return { success: false, error: "Durasi sesi sumber tidak valid" };
  }

  try {
    const isoLocal = `${targetDateStr}T${targetStartTimeStr}`;
    const targetStartTime = parseLocalDateTimeToUTC(isoLocal, timeZone);
    const targetEndTime = new Date(targetStartTime.getTime() + durationMs);

    return { success: true, targetStartTime, targetEndTime };
  } catch (err: unknown) {
    return {
      success: false,
      error: `Gagal memproses waktu target: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Pure evaluator for clone session preview against candidate conflict sessions.
 */
export function evaluateCloneSessionPreview(params: {
  sourceSessionId: string;
  sourceTitle: string;
  targetCoachId: string;
  targetAthleteIds: string[];
  targetStartTime: Date;
  targetEndTime: Date;
  durationMinutes: number;
  candidateSessions: ExistingConflictSession[];
}): CloneSessionPreview {
  const {
    sourceSessionId,
    sourceTitle,
    targetCoachId,
    targetAthleteIds,
    targetStartTime,
    targetEndTime,
    durationMinutes,
    candidateSessions,
  } = params;

  // 1. Check EXACT DUPLICATE (Active session with same coach, start, and end)
  const exactDuplicate = candidateSessions.find(
    (s) =>
      isStatusConflictEligible(s.status) &&
      s.coachId === targetCoachId &&
      s.startTime.getTime() === targetStartTime.getTime() &&
      s.endTime.getTime() === targetEndTime.getTime()
  );

  if (exactDuplicate) {
    return {
      sourceSessionId,
      sourceTitle,
      targetStartTime,
      targetEndTime,
      durationMinutes,
      isAlreadyExists: true,
      hasCoachConflict: false,
      coachConflict: null,
      hasAthleteWarning: false,
      athleteConflicts: [],
      canProceed: false,
      reason: `Sesi identik "${exactDuplicate.title}" sudah terdaftar pada tanggal dan jam ini.`,
    };
  }

  // 2. Cross-reference conflicts via P7-B1 Conflict Engine
  const report = buildScheduleConflictReport(
    {
      coachId: targetCoachId,
      athleteIds: targetAthleteIds,
      startTime: targetStartTime,
      endTime: targetEndTime,
      // If duplicating a CANCELLED session to exact same time, exclude itself
      excludeSessionId: sourceSessionId,
    },
    candidateSessions
  );

  let reason: string | undefined;
  if (report.hasCoachConflict && report.coachConflict) {
    const timeStr = `${report.coachConflict.existingStart.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${report.coachConflict.existingEnd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    reason = `Pelatih sudah memiliki sesi "${report.coachConflict.existingTitle}" (${timeStr}) pada rentang waktu yang sama.`;
  } else if (report.athleteConflicts.length > 0) {
    const names = report.athleteConflicts.map((a) => a.athleteName || a.athleteId).join(", ");
    reason = `Peringatan: Atlet (${names}) memiliki sesi lain yang tumpang tindih.`;
  }

  return {
    sourceSessionId,
    sourceTitle,
    targetStartTime,
    targetEndTime,
    durationMinutes,
    isAlreadyExists: false,
    hasCoachConflict: report.hasCoachConflict,
    coachConflict: report.coachConflict,
    hasAthleteWarning: report.athleteConflicts.length > 0,
    athleteConflicts: report.athleteConflicts,
    canProceed: !report.hasCoachConflict, // Coach collision is a hard block; athlete warnings allow user to proceed
    reason,
  };
}
