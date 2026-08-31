import type { AttendanceStatus, ScheduleStatus } from "./types";

/**
 * Determines whether a given member role has permission to mark attendance for a session.
 * - OWNER, ADMIN, HEAD_COACH: Can mark attendance for any session in their organization.
 * - ASSISTANT_COACH: Can only mark attendance for sessions where they are the assigned coach.
 */
export function canMemberMarkAttendance(
  memberRole: string,
  memberId: string,
  sessionCoachId: string
): boolean {
  const normalizedRole = memberRole.toLowerCase();

  if (
    normalizedRole === "owner" ||
    normalizedRole === "admin" ||
    normalizedRole === "head_coach"
  ) {
    return true;
  }

  if (normalizedRole === "assistant_coach") {
    return memberId === sessionCoachId;
  }

  return false;
}

/**
 * Validates if the session macro status allows attendance operations.
 * - CANCELLED sessions cannot have attendance recorded or modified.
 * - SCHEDULED, COMPLETED, NO_SHOW sessions allow attendance tracking.
 */
export function isSessionEligibleForAttendance(sessionStatus: ScheduleStatus): {
  eligible: boolean;
  reason?: string;
} {
  if (sessionStatus === "CANCELLED") {
    return {
      eligible: false,
      reason: "Presensi tidak dapat dicatat atau diubah untuk sesi yang telah dibatalkan.",
    };
  }

  return { eligible: true };
}

/**
 * Resolves the check-in timestamp based on attendance status.
 * - PRESENT / LATE: Returns the provided current time (server-side).
 * - UNMARKED / EXCUSED / ABSENT / RESCHEDULED: Returns null.
 */
export function resolveCheckInTime(
  status: AttendanceStatus,
  currentTime: Date = new Date()
): Date | null {
  if (status === "PRESENT" || status === "LATE") {
    return currentTime;
  }
  return null;
}

/**
 * Computes aggregated attendance counts and rates for a session.
 */
export function calculateAttendanceMetrics(
  statuses: AttendanceStatus[]
): {
  totalAthletes: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  absentCount: number;
  rescheduledCount: number;
  unmarkedCount: number;
  attendedCount: number;
  attendanceRate: number;
} {
  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let absentCount = 0;
  let rescheduledCount = 0;
  let unmarkedCount = 0;

  for (const s of statuses) {
    switch (s) {
      case "PRESENT":
        presentCount++;
        break;
      case "LATE":
        lateCount++;
        break;
      case "EXCUSED":
        excusedCount++;
        break;
      case "ABSENT":
        absentCount++;
        break;
      case "RESCHEDULED":
        rescheduledCount++;
        break;
      case "UNMARKED":
      default:
        unmarkedCount++;
        break;
    }
  }

  const totalAthletes = statuses.length;
  const attendedCount = presentCount + lateCount;
  const attendanceRate =
    totalAthletes > 0
      ? Number(((attendedCount / totalAthletes) * 100).toFixed(1))
      : 0;

  return {
    totalAthletes,
    presentCount,
    lateCount,
    excusedCount,
    absentCount,
    rescheduledCount,
    unmarkedCount,
    attendedCount,
    attendanceRate,
  };
}
