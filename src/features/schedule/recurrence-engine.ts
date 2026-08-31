import { parseLocalDateTimeToUTC, DEFAULT_SCHEDULE_TIMEZONE } from "./utils";
import {
  detectCoachConflicts,
  detectAthleteConflicts,
  isStatusConflictEligible,
  type ExistingConflictSession,
  type CoachConflictResult,
  type AthleteConflictResult,
} from "./conflict-engine";

export const MAX_RECURRENCE_WEEKS = 12;
export const MAX_RECURRENCE_DAYS = MAX_RECURRENCE_WEEKS * 7; // 84 days

export const INDONESIAN_DAY_NAMES = [
  "Minggu", // 0
  "Senin",  // 1
  "Selasa", // 2
  "Rabu",   // 3
  "Kamis",  // 4
  "Jumat",  // 5
  "Sabtu",  // 6
];

export interface RecurrenceGenerationParams {
  startDateStr: string; // YYYY-MM-DD
  endDateStr: string;   // YYYY-MM-DD
  weekdays: number[];   // 0 (Sun) to 6 (Sat)
  startTimeStr: string; // HH:mm
  endTimeStr: string;   // HH:mm
  timeZone?: string;
}

export interface GeneratedOccurrence {
  dateStr: string;
  dayName: string;
  weekdayIndex: number;
  startTime: Date;
  endTime: Date;
}

export type EvaluatedOccurrenceStatus =
  | "SAFE"
  | "ALREADY_EXISTS"
  | "COACH_BLOCKED"
  | "ATHLETE_WARNING";

export interface EvaluatedOccurrence {
  dateStr: string;
  dayName: string;
  weekdayIndex: number;
  startTime: Date;
  endTime: Date;
  status: EvaluatedOccurrenceStatus;
  reason?: string;
  coachConflict?: CoachConflictResult | null;
  athleteConflicts?: AthleteConflictResult[];
}

export interface RecurringSchedulePreview {
  totalCount: number;
  safeCount: number;
  blockedCount: number;
  warningCount: number;
  alreadyExistsCount: number;
  canCreateCount: number; // safeCount + warningCount (if user accepts warnings)
  occurrences: EvaluatedOccurrence[];
}

/**
 * Pure generator to calculate all date occurrences within a date window matching chosen weekdays.
 */
export function generateRecurringOccurrences(
  params: RecurrenceGenerationParams
): { success: true; occurrences: GeneratedOccurrence[] } | { success: false; error: string } {
  const {
    startDateStr,
    endDateStr,
    weekdays,
    startTimeStr,
    endTimeStr,
    timeZone = DEFAULT_SCHEDULE_TIMEZONE,
  } = params;

  if (!startDateStr || !endDateStr) {
    return { success: false, error: "Tanggal mulai dan tanggal selesai wajib diisi" };
  }

  if (!startTimeStr || !endTimeStr) {
    return { success: false, error: "Jam mulai dan jam selesai wajib diisi" };
  }

  // Validate HH:mm
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTimeStr) || !timeRegex.test(endTimeStr)) {
    return { success: false, error: "Format jam tidak valid (diharapkan HH:mm)" };
  }

  if (startTimeStr >= endTimeStr) {
    return { success: false, error: "Jam selesai harus setelah jam mulai" };
  }

  if (!Array.isArray(weekdays) || weekdays.length === 0) {
    return { success: false, error: "Pilih minimal satu hari dalam seminggu" };
  }

  // Normalize weekdays (0..6)
  const normalizedWeekdays = new Set(
    weekdays.map((d) => (d === 7 ? 0 : d)).filter((d) => d >= 0 && d <= 6)
  );

  if (normalizedWeekdays.size === 0) {
    return { success: false, error: "Hari yang dipilih tidak valid" };
  }

  // Validate YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
    return { success: false, error: "Format tanggal tidak valid (diharapkan YYYY-MM-DD)" };
  }

  const [sY, sM, sD] = startDateStr.split("-").map(Number);
  const [eY, eM, eD] = endDateStr.split("-").map(Number);

  const startUtcMidnight = Date.UTC(sY, sM - 1, sD);
  const endUtcMidnight = Date.UTC(eY, eM - 1, eD);

  if (endUtcMidnight < startUtcMidnight) {
    return { success: false, error: "Tanggal selesai tidak boleh sebelum tanggal mulai" };
  }

  const diffDays = Math.round((endUtcMidnight - startUtcMidnight) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays > MAX_RECURRENCE_DAYS) {
    return {
      success: false,
      error: `Rentang jadwal berulang maksimal ${MAX_RECURRENCE_WEEKS} minggu (${MAX_RECURRENCE_DAYS} hari)`,
    };
  }

  const occurrences: GeneratedOccurrence[] = [];
  let currentMidnight = startUtcMidnight;

  while (currentMidnight <= endUtcMidnight) {
    const d = new Date(currentMidnight);
    const dayOfWeek = d.getUTCDay(); // 0 = Sun, 1 = Mon ...

    if (normalizedWeekdays.has(dayOfWeek)) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dayNum = String(d.getUTCDate()).padStart(2, "0");
      const curDateStr = `${y}-${m}-${dayNum}`;

      try {
        const startIsoLocal = `${curDateStr}T${startTimeStr}`;
        const endIsoLocal = `${curDateStr}T${endTimeStr}`;

        const startTime = parseLocalDateTimeToUTC(startIsoLocal, timeZone);
        const endTime = parseLocalDateTimeToUTC(endIsoLocal, timeZone);

        occurrences.push({
          dateStr: curDateStr,
          dayName: INDONESIAN_DAY_NAMES[dayOfWeek] || "Hari",
          weekdayIndex: dayOfWeek,
          startTime,
          endTime,
        });
      } catch (err: unknown) {
        return {
          success: false,
          error: `Gagal mengonversi tanggal ${curDateStr}: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    }

    currentMidnight += 1000 * 60 * 60 * 24;
  }

  if (occurrences.length === 0) {
    return {
      success: false,
      error: "Tidak ada tanggal dalam rentang yang cocok dengan hari yang dipilih",
    };
  }

  return { success: true, occurrences };
}

/**
 * Pure evaluator that cross-references generated occurrences against existing candidate sessions.
 */
export function evaluateRecurringSchedulePreview(
  params: {
    targetCoachId: string;
    targetAthleteIds: string[];
    occurrences: GeneratedOccurrence[];
  },
  candidateSessions: ExistingConflictSession[]
): RecurringSchedulePreview {
  const { targetCoachId, targetAthleteIds, occurrences } = params;

  let safeCount = 0;
  let blockedCount = 0;
  let warningCount = 0;
  let alreadyExistsCount = 0;

  const evaluatedList: EvaluatedOccurrence[] = occurrences.map((occ) => {
    // 1. Check EXACT DUPLICATE (same coach, exact same startTime & endTime, and active status)
    const exactDuplicate = candidateSessions.find(
      (s) =>
        isStatusConflictEligible(s.status) &&
        s.coachId === targetCoachId &&
        s.startTime.getTime() === occ.startTime.getTime() &&
        s.endTime.getTime() === occ.endTime.getTime()
    );

    if (exactDuplicate) {
      alreadyExistsCount++;
      return {
        ...occ,
        status: "ALREADY_EXISTS",
        reason: `Sesi serupa "${exactDuplicate.title}" sudah terdaftar pada jam ini.`,
      };
    }

    // 2. Check Coach Overlap (Hard Block)
    const coachConflict = detectCoachConflicts(
      {
        coachId: targetCoachId,
        startTime: occ.startTime,
        endTime: occ.endTime,
      },
      candidateSessions
    );

    if (coachConflict) {
      blockedCount++;
      const timeFormatted = `${coachConflict.existingStart.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${coachConflict.existingEnd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
      return {
        ...occ,
        status: "COACH_BLOCKED",
        reason: `Pelatih bentrok dengan sesi "${coachConflict.existingTitle}" (${timeFormatted}).`,
        coachConflict,
      };
    }

    // 3. Check Athlete Overlap (Soft Warning)
    const athleteConflicts = detectAthleteConflicts(
      {
        athleteIds: targetAthleteIds,
        startTime: occ.startTime,
        endTime: occ.endTime,
      },
      candidateSessions
    );

    if (athleteConflicts.length > 0) {
      warningCount++;
      const athleteNames = athleteConflicts.map((a) => a.athleteName || a.athleteId).join(", ");
      return {
        ...occ,
        status: "ATHLETE_WARNING",
        reason: `Atlet bentrok (${athleteNames}) dengan sesi lain.`,
        athleteConflicts,
      };
    }

    // 4. Clean Safe Occurrence
    safeCount++;
    return {
      ...occ,
      status: "SAFE",
    };
  });

  return {
    totalCount: occurrences.length,
    safeCount,
    blockedCount,
    warningCount,
    alreadyExistsCount,
    canCreateCount: safeCount + warningCount,
    occurrences: evaluatedList,
  };
}
