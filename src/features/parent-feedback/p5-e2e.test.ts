import { describe, it, expect } from "vitest";
import {
  isFeedbackWindowValid,
  isAttendanceEligibleForFeedback,
  canMemberReviewFeedback,
  calculateAverageRating,
} from "./engine";
import {
  calculateOverallSatisfaction,
  calculateComponentAverages,
  calculateResponseRate,
  calculateTrend,
} from "@/features/assistant-performance/engine";
import {
  canMemberMarkAttendance,
  resolveCheckInTime,
  isSessionEligibleForAttendance,
  calculateAttendanceMetrics,
} from "@/features/attendance/engine";

describe("P5 Full System End-to-End Verification Matrix", () => {
  /* =========================================================================
   * 1. ATTENDANCE STATUS & CHECK-IN TIME INTEGRITY
   * ========================================================================= */
  describe("1. Attendance Status Matrix", () => {
    const fixedNow = new Date("2026-08-30T10:00:00Z");

    it("PRESENT: sets checkInTime and attended count increases", () => {
      const checkIn = resolveCheckInTime("PRESENT", fixedNow);
      expect(checkIn).toEqual(fixedNow);
    });

    it("LATE: sets checkInTime and attended count increases", () => {
      const checkIn = resolveCheckInTime("LATE", fixedNow);
      expect(checkIn).toEqual(fixedNow);
    });

    it("EXCUSED: clears checkInTime to null", () => {
      const checkIn = resolveCheckInTime("EXCUSED", fixedNow);
      expect(checkIn).toBeNull();
    });

    it("ABSENT: clears checkInTime to null", () => {
      const checkIn = resolveCheckInTime("ABSENT", fixedNow);
      expect(checkIn).toBeNull();
    });

    it("RESCHEDULED: clears checkInTime to null", () => {
      const checkIn = resolveCheckInTime("RESCHEDULED", fixedNow);
      expect(checkIn).toBeNull();
    });

    it("UNMARKED: clears checkInTime to null", () => {
      const checkIn = resolveCheckInTime("UNMARKED", fixedNow);
      expect(checkIn).toBeNull();
    });

    it("calculates accurate attendance metrics across mixed statuses", () => {
      const metrics = calculateAttendanceMetrics([
        "PRESENT",
        "LATE",
        "EXCUSED",
        "ABSENT",
        "UNMARKED",
      ]);
      expect(metrics.totalAthletes).toBe(5);
      expect(metrics.presentCount).toBe(1);
      expect(metrics.lateCount).toBe(1);
      expect(metrics.attendedCount).toBe(2);
      expect(metrics.attendanceRate).toBe(40);
    });
  });

  /* =========================================================================
   * 2. ROLE AUTHORIZATION MATRIX FOR ATTENDANCE & REVIEW
   * ========================================================================= */
  describe("2. Role Authorization Matrix", () => {
    const assignedCoachId = "member-assistant-1";

    it("Owner / Admin / Head Coach can mark attendance for any session in org", () => {
      expect(canMemberMarkAttendance("owner", "member-owner", assignedCoachId)).toBe(true);
      expect(canMemberMarkAttendance("admin", "member-admin", assignedCoachId)).toBe(true);
      expect(canMemberMarkAttendance("head_coach", "member-head", assignedCoachId)).toBe(true);
    });

    it("Assistant Coach can ONLY mark attendance for their own assigned session", () => {
      // Own session
      expect(canMemberMarkAttendance("assistant_coach", "member-assistant-1", "member-assistant-1")).toBe(true);
      // Another coach's session -> REJECTED
      expect(canMemberMarkAttendance("assistant_coach", "member-assistant-1", "member-assistant-2")).toBe(false);
    });

    it("Session Eligibility: CANCELLED sessions reject attendance, SCHEDULED/COMPLETED allow it", () => {
      expect(isSessionEligibleForAttendance("CANCELLED").eligible).toBe(false);
      expect(isSessionEligibleForAttendance("SCHEDULED").eligible).toBe(true);
      expect(isSessionEligibleForAttendance("COMPLETED").eligible).toBe(true);
    });

    it("Review Authorization: Owner, Admin, Head Coach can review; Assistant cannot", () => {
      expect(canMemberReviewFeedback("owner")).toBe(true);
      expect(canMemberReviewFeedback("admin")).toBe(true);
      expect(canMemberReviewFeedback("head_coach")).toBe(true);
      expect(canMemberReviewFeedback("assistant_coach")).toBe(false);
    });
  });

  /* =========================================================================
   * 3. PARENT FEEDBACK ELIGIBILITY RULES
   * ========================================================================= */
  describe("3. Parent Feedback Eligibility Rules", () => {
    const now = new Date("2026-08-30T12:00:00Z");
    const twoDaysAgo = new Date("2026-08-28T10:00:00Z");
    const eightDaysAgo = new Date("2026-08-22T10:00:00Z");

    it("Attendance PRESENT and LATE are eligible; other statuses are not", () => {
      expect(isAttendanceEligibleForFeedback("PRESENT")).toBe(true);
      expect(isAttendanceEligibleForFeedback("LATE")).toBe(true);
      expect(isAttendanceEligibleForFeedback("UNMARKED")).toBe(false);
      expect(isAttendanceEligibleForFeedback("EXCUSED")).toBe(false);
      expect(isAttendanceEligibleForFeedback("ABSENT")).toBe(false);
      expect(isAttendanceEligibleForFeedback("RESCHEDULED")).toBe(false);
      expect(isAttendanceEligibleForFeedback(null)).toBe(false);
      expect(isAttendanceEligibleForFeedback(undefined)).toBe(false);
    });

    it("Feedback window within 7 days is valid", () => {
      const validRes = isFeedbackWindowValid(twoDaysAgo, now);
      expect(validRes.valid).toBe(true);
    });

    it("Feedback window beyond 7 days is expired and rejected", () => {
      const expiredRes = isFeedbackWindowValid(eightDaysAgo, now);
      expect(expiredRes.valid).toBe(false);
      expect(expiredRes.reason).toContain("7 hari");
    });
  });

  /* =========================================================================
   * 4. ASSISTANT ANALYTICS & PARTICIPATION SEPARATION
   * ========================================================================= */
  describe("4. Assistant Performance & Participation Math", () => {
    it("Calculates exact composite average for individual feedback", () => {
      expect(calculateAverageRating({ sessionRating: 5, communicationRating: 4, athleteAttentionRating: 3 })).toBe(4.0);
      expect(calculateAverageRating({ sessionRating: 5, communicationRating: 5, athleteAttentionRating: 5 })).toBe(5.0);
    });

    it("Calculates aggregate quality metrics across feedback items", () => {
      const items = [
        { sessionRating: 5, communicationRating: 5, athleteAttentionRating: 5 },
        { sessionRating: 4, communicationRating: 4, athleteAttentionRating: 4 },
      ];
      expect(calculateOverallSatisfaction(items)).toBe(4.5);
      const comp = calculateComponentAverages(items);
      expect(comp.sessionQuality).toBe(4.5);
      expect(comp.communication).toBe(4.5);
      expect(comp.athleteAttention).toBe(4.5);
    });

    it("Calculates response rate accurately without divide-by-zero", () => {
      expect(calculateResponseRate(8, 10)).toBe(80.0);
      expect(calculateResponseRate(0, 10)).toBe(0.0);
      expect(calculateResponseRate(0, 0)).toBeNull();
      expect(calculateResponseRate(5, 0)).toBeNull();
    });

    it("Enforces dual minimum sample rule (current >= 3 AND prev >= 3) for trend", () => {
      // Case: current 3, prev 0 -> INSUFFICIENT
      expect(calculateTrend(4.5, null, 3, 0).status).toBe("INSUFFICIENT_DATA");
      // Case: current 2, prev 5 -> INSUFFICIENT
      expect(calculateTrend(4.5, 4.0, 2, 5).status).toBe("INSUFFICIENT_DATA");
      // Case: current 4, prev 3, diff +0.4 -> HIGHER
      const higher = calculateTrend(4.6, 4.2, 4, 3);
      expect(higher.status).toBe("HIGHER");
      expect(higher.diff).toBe(0.4);
      // Case: current 4, prev 3, diff -0.3 -> LOWER
      const lower = calculateTrend(3.9, 4.2, 4, 3);
      expect(lower.status).toBe("LOWER");
      expect(lower.diff).toBe(-0.3);
      // Case: current 4, prev 4, diff 0.05 -> SIMILAR
      const similar = calculateTrend(4.25, 4.2, 4, 4);
      expect(similar.status).toBe("SIMILAR");
    });
  });
});
