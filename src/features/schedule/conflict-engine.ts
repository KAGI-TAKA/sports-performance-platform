import type { ScheduleStatus } from "@prisma/client";

export interface ExistingConflictSession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  coachId: string;
  coachName?: string;
  athletes: {
    athleteId: string;
    athleteName?: string;
  }[];
}

export interface CoachConflictResult {
  conflictType: "COACH";
  existingSessionId: string;
  existingTitle: string;
  existingStart: Date;
  existingEnd: Date;
  coachId: string;
  coachName?: string;
}

export interface AthleteConflictResult {
  conflictType: "ATHLETE";
  athleteId: string;
  athleteName?: string;
  existingSessionId: string;
  existingTitle: string;
  existingStart: Date;
  existingEnd: Date;
}

export interface ScheduleConflictReport {
  hasConflict: boolean;
  hasCoachConflict: boolean;
  coachConflict: CoachConflictResult | null;
  athleteConflicts: AthleteConflictResult[];
  canProceed: boolean; // false if coach conflict (hard block), true if safe or only athlete warnings
}

/**
 * Pure function to check if two time ranges overlap.
 * Overlap formula: startA < endB AND endA > startB
 * Adjacent boundary times (e.g. 16:00–17:00 and 17:00–18:00) DO NOT overlap.
 */
export function detectTimeOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  if (isNaN(sA) || isNaN(eA) || isNaN(sB) || isNaN(eB) || eA <= sA || eB <= sB) {
    return false;
  }

  return sA < eB && eA > sB;
}

/**
 * Validates if an existing session's status should be considered active for conflict calculation.
 * - SCHEDULED & COMPLETED: Considered active collisions.
 * - CANCELLED & NO_SHOW: Ignored (no active physical occupation of coach/athlete).
 */
export function isStatusConflictEligible(status: ScheduleStatus): boolean {
  return status === "SCHEDULED" || status === "COMPLETED";
}

/**
 * Detects whether a coach is double-booked on an overlapping time window.
 */
export function detectCoachConflicts(
  targetSession: {
    coachId: string;
    startTime: Date;
    endTime: Date;
    excludeSessionId?: string;
  },
  existingSessions: ExistingConflictSession[]
): CoachConflictResult | null {
  for (const session of existingSessions) {
    // Skip the session itself if updating an existing record
    if (targetSession.excludeSessionId && session.id === targetSession.excludeSessionId) {
      continue;
    }

    if (!isStatusConflictEligible(session.status)) {
      continue;
    }

    if (session.coachId === targetSession.coachId) {
      const isOverlapping = detectTimeOverlap(
        targetSession.startTime,
        targetSession.endTime,
        session.startTime,
        session.endTime
      );

      if (isOverlapping) {
        return {
          conflictType: "COACH",
          existingSessionId: session.id,
          existingTitle: session.title,
          existingStart: session.startTime,
          existingEnd: session.endTime,
          coachId: session.coachId,
          coachName: session.coachName,
        };
      }
    }
  }

  return null;
}

/**
 * Detects whether any enrolled athletes have overlapping sessions.
 */
export function detectAthleteConflicts(
  targetSession: {
    athleteIds: string[];
    startTime: Date;
    endTime: Date;
    excludeSessionId?: string;
  },
  existingSessions: ExistingConflictSession[]
): AthleteConflictResult[] {
  const conflicts: AthleteConflictResult[] = [];
  const targetAthleteSet = new Set(targetSession.athleteIds);

  for (const session of existingSessions) {
    // Skip self
    if (targetSession.excludeSessionId && session.id === targetSession.excludeSessionId) {
      continue;
    }

    if (!isStatusConflictEligible(session.status)) {
      continue;
    }

    const isOverlapping = detectTimeOverlap(
      targetSession.startTime,
      targetSession.endTime,
      session.startTime,
      session.endTime
    );

    if (isOverlapping) {
      for (const athlete of session.athletes) {
        if (targetAthleteSet.has(athlete.athleteId)) {
          conflicts.push({
            conflictType: "ATHLETE",
            athleteId: athlete.athleteId,
            athleteName: athlete.athleteName,
            existingSessionId: session.id,
            existingTitle: session.title,
            existingStart: session.startTime,
            existingEnd: session.endTime,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Comprehensive conflict evaluator returning a unified conflict report.
 */
export function buildScheduleConflictReport(
  targetSession: {
    coachId: string;
    athleteIds: string[];
    startTime: Date;
    endTime: Date;
    excludeSessionId?: string;
  },
  existingSessions: ExistingConflictSession[]
): ScheduleConflictReport {
  const coachConflict = detectCoachConflicts(
    {
      coachId: targetSession.coachId,
      startTime: targetSession.startTime,
      endTime: targetSession.endTime,
      excludeSessionId: targetSession.excludeSessionId,
    },
    existingSessions
  );

  const athleteConflicts = detectAthleteConflicts(
    {
      athleteIds: targetSession.athleteIds,
      startTime: targetSession.startTime,
      endTime: targetSession.endTime,
      excludeSessionId: targetSession.excludeSessionId,
    },
    existingSessions
  );

  const hasCoachConflict = coachConflict !== null;
  const hasConflict = hasCoachConflict || athleteConflicts.length > 0;

  return {
    hasConflict,
    hasCoachConflict,
    coachConflict,
    athleteConflicts,
    canProceed: !hasCoachConflict, // Coach collision is a HARD BLOCK; athlete warnings allow review
  };
}
