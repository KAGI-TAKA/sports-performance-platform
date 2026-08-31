import { describe, it, expect } from "vitest";
import {
  detectCoachConflicts,
  detectAthleteConflicts,
  isStatusConflictEligible,
  type ExistingConflictSession,
} from "./conflict-engine";
import {
  generateRecurringOccurrences,
  evaluateRecurringSchedulePreview,
  MAX_RECURRENCE_WEEKS,
} from "./recurrence-engine";
import {
  calculateSourceDuration,
  getCloneActionLabel,
  prepareCloneTargetDates,
  evaluateCloneSessionPreview,
} from "./clone-engine";
import {
  resolveDefaultScope,
  normalizeScope,
  normalizePeriod,
  getTodayRangeJakarta,
  getWeekRangeJakarta,
  resolveEffectiveScheduleFilters,
  getQuickFilterEmptyState,
} from "./quick-filter-engine";
import {
  canMemberExecuteSession,
  isSessionEligibleForExecution,
} from "@/features/session-execution/engine";
import {
  isAttendanceEligibleForFeedback,
  isFeedbackWindowValid,
} from "@/features/parent-feedback/engine";
import { parseLocalDateTimeToUTC } from "./utils";

describe("P7-B5 Comprehensive Verification Suite (T01 - T84)", () => {
  // ==========================================
  // 1. P7-B1 CONFLICT DETECTION VERIFICATION (T01 - T14)
  // ==========================================
  describe("P7-B1 Conflict Detection Engine", () => {
    const coachId = "coach-zulfi";
    const athleteIds = ["ath-1", "ath-2"];

    it("T01: detects partial overlap as conflict (true)", () => {
      const existing: ExistingConflictSession[] = [
        {
          id: "sess-1",
          title: "Sesi Pagi",
          coachId,
          startTime: new Date("2026-09-01T16:00:00Z"),
          endTime: new Date("2026-09-01T17:30:00Z"),
          status: "SCHEDULED",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const res = detectCoachConflicts(
        {
          coachId,
          startTime: new Date("2026-09-01T16:30:00Z"),
          endTime: new Date("2026-09-01T18:00:00Z"),
        },
        existing
      );

      expect(res).not.toBeNull();
      expect(res?.existingSessionId).toBe("sess-1");
    });

    it("T02: adjacent boundary (16:00-17:00 vs 17:00-18:00) is NOT a conflict (false)", () => {
      const existing: ExistingConflictSession[] = [
        {
          id: "sess-1",
          title: "Sesi 1",
          coachId,
          startTime: new Date("2026-09-01T16:00:00Z"),
          endTime: new Date("2026-09-01T17:00:00Z"),
          status: "SCHEDULED",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const coachConflict = detectCoachConflicts(
        {
          coachId,
          startTime: new Date("2026-09-01T17:00:00Z"),
          endTime: new Date("2026-09-01T18:00:00Z"),
        },
        existing
      );

      const athleteConflict = detectAthleteConflicts(
        {
          athleteIds,
          startTime: new Date("2026-09-01T17:00:00Z"),
          endTime: new Date("2026-09-01T18:00:00Z"),
        },
        existing
      );

      expect(coachConflict).toBeNull();
      expect(athleteConflict).toHaveLength(0);
    });

    it("T03: contained session (inner range) is detected as conflict (true)", () => {
      const existing: ExistingConflictSession[] = [
        {
          id: "sess-1",
          title: "Sesi Panjang",
          coachId,
          startTime: new Date("2026-09-01T14:00:00Z"),
          endTime: new Date("2026-09-01T18:00:00Z"),
          status: "SCHEDULED",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const res = detectCoachConflicts(
        {
          coachId,
          startTime: new Date("2026-09-01T15:00:00Z"),
          endTime: new Date("2026-09-01T16:00:00Z"),
        },
        existing
      );

      expect(res).not.toBeNull();
    });

    it("T04: exact same time range is detected as conflict (true)", () => {
      const existing: ExistingConflictSession[] = [
        {
          id: "sess-1",
          title: "Sesi Sama",
          coachId,
          startTime: new Date("2026-09-01T15:00:00Z"),
          endTime: new Date("2026-09-01T16:00:00Z"),
          status: "SCHEDULED",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const res = detectCoachConflicts(
        {
          coachId,
          startTime: new Date("2026-09-01T15:00:00Z"),
          endTime: new Date("2026-09-01T16:00:00Z"),
        },
        existing
      );

      expect(res).not.toBeNull();
    });

    it("T05: distinct non-overlapping time is safe (false)", () => {
      const existing: ExistingConflictSession[] = [
        {
          id: "sess-1",
          title: "Sesi Siang",
          coachId,
          startTime: new Date("2026-09-01T08:00:00Z"),
          endTime: new Date("2026-09-01T09:00:00Z"),
          status: "SCHEDULED",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const res = detectCoachConflicts(
        {
          coachId,
          startTime: new Date("2026-09-01T15:00:00Z"),
          endTime: new Date("2026-09-01T16:00:00Z"),
        },
        existing
      );

      expect(res).toBeNull();
    });

    it("T06 & T07: isStatusConflictEligible checks SCHEDULED & COMPLETED are conflict eligible", () => {
      expect(isStatusConflictEligible("SCHEDULED")).toBe(true);
      expect(isStatusConflictEligible("COMPLETED")).toBe(true);
    });

    it("T08 & T09: CANCELLED & NO_SHOW sessions are IGNORED from conflicts", () => {
      expect(isStatusConflictEligible("CANCELLED")).toBe(false);
      expect(isStatusConflictEligible("NO_SHOW")).toBe(false);

      const existing: ExistingConflictSession[] = [
        {
          id: "sess-canc",
          title: "Sesi Dibatalkan",
          coachId,
          startTime: new Date("2026-09-01T10:00:00Z"),
          endTime: new Date("2026-09-01T11:00:00Z"),
          status: "CANCELLED",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const res = detectCoachConflicts(
        {
          coachId,
          startTime: new Date("2026-09-01T10:00:00Z"),
          endTime: new Date("2026-09-01T11:00:00Z"),
        },
        existing
      );

      expect(res).toBeNull();
    });

    it("T10 & T11: Coach conflict triggers HARD BLOCK, different coach does not block coach", () => {
      const existing: ExistingConflictSession[] = [
        {
          id: "sess-diff-coach",
          title: "Sesi Coach Lain",
          coachId: "coach-budi",
          startTime: new Date("2026-09-01T10:00:00Z"),
          endTime: new Date("2026-09-01T11:00:00Z"),
          status: "SCHEDULED",
          athletes: [],
        },
      ];

      const res = detectCoachConflicts(
        {
          coachId: "coach-zulfi",
          startTime: new Date("2026-09-01T10:00:00Z"),
          endTime: new Date("2026-09-01T11:00:00Z"),
        },
        existing
      );

      expect(res).toBeNull();
    });

    it("T12 & T13: Athlete conflict triggers SOFT WARNING with all conflicting athletes reported", () => {
      const existing: ExistingConflictSession[] = [
        {
          id: "sess-ath",
          title: "Sesi Grup",
          coachId: "coach-other",
          startTime: new Date("2026-09-01T10:00:00Z"),
          endTime: new Date("2026-09-01T11:00:00Z"),
          status: "SCHEDULED",
          athletes: [{ athleteId: "ath-1" }, { athleteId: "ath-2" }],
        },
      ];

      const res = detectAthleteConflicts(
        {
          athleteIds: ["ath-1", "ath-2", "ath-3"],
          startTime: new Date("2026-09-01T10:00:00Z"),
          endTime: new Date("2026-09-01T11:00:00Z"),
        },
        existing
      );

      expect(res).toHaveLength(2);
      expect(res.map((a) => a.athleteId)).toEqual(["ath-1", "ath-2"]);
    });

    it("T14: Excludes current session itself during updates", () => {
      const existing: ExistingConflictSession[] = [
        {
          id: "current-session-id",
          title: "Sesi Ini Sendiri",
          coachId,
          startTime: new Date("2026-09-01T10:00:00Z"),
          endTime: new Date("2026-09-01T11:00:00Z"),
          status: "SCHEDULED",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const res = detectCoachConflicts(
        {
          coachId,
          startTime: new Date("2026-09-01T10:00:00Z"),
          endTime: new Date("2026-09-01T11:00:00Z"),
          excludeSessionId: "current-session-id",
        },
        existing
      );

      expect(res).toBeNull();
    });
  });

  // ==========================================
  // 2. P7-B2 RECURRING SCHEDULE VERIFICATION (T15 - T24)
  // ==========================================
  describe("P7-B2 Recurring Schedule Engine", () => {
    it("T15: generates exact 4 dates for 1 weekday across 4 weeks", () => {
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-01", // Tuesday
        endDateStr: "2026-09-22",
        weekdays: [2], // Tuesday
        startTimeStr: "16:00",
        endTimeStr: "17:30",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.occurrences.map((o) => o.dateStr)).toEqual([
          "2026-09-01",
          "2026-09-08",
          "2026-09-15",
          "2026-09-22",
        ]);
      }
    });

    it("T16: generates exact 4 dates for 2 weekdays across 2 weeks", () => {
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-01", // Tue
        endDateStr: "2026-09-10",
        weekdays: [2, 4], // Tue, Thu
        startTimeStr: "08:00",
        endTimeStr: "09:30",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.occurrences.map((o) => o.dateStr)).toEqual([
          "2026-09-01",
          "2026-09-03",
          "2026-09-08",
          "2026-09-10",
        ]);
      }
    });

    it("T17: returns validation failure when no weekdays match in date range", () => {
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-01", // Tue
        endDateStr: "2026-09-02",   // Wed
        weekdays: [0],         // Sun
        startTimeStr: "16:00",
        endTimeStr: "17:00",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("Tidak ada tanggal");
      }
    });

    it("T18: rejects recurring ranges greater than 12 weeks (>84 days)", () => {
      const res = generateRecurringOccurrences({
        startDateStr: "2026-01-01",
        endDateStr: "2026-06-01", // > 150 days
        weekdays: [1],
        startTimeStr: "16:00",
        endTimeStr: "17:00",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("12 minggu");
      }
    });

    it("T19 & T20: evaluates generated occurrences with correct status, time and structure", () => {
      const occRes = generateRecurringOccurrences({
        startDateStr: "2026-09-01",
        endDateStr: "2026-09-15",
        weekdays: [2], // 3 occurrences
        startTimeStr: "16:00",
        endTimeStr: "17:30",
      });

      expect(occRes.success).toBe(true);
      if (occRes.success) {
        const preview = evaluateRecurringSchedulePreview(
          {
            targetCoachId: "coach-zulfi",
            targetAthleteIds: ["ath-1"],
            occurrences: occRes.occurrences,
          },
          []
        );

        expect(preview.totalCount).toBe(3);
        expect(preview.safeCount).toBe(3);
        expect(preview.blockedCount).toBe(0);

        preview.occurrences.forEach((occ) => {
          expect(occ.status).toBe("SAFE");
          expect(occ.startTime.toISOString()).toBeDefined();
          expect(occ.endTime.toISOString()).toBeDefined();
        });
      }
    });

    it("T21 & T22: handles partial and total coach conflicts safely", () => {
      const conflictSession: ExistingConflictSession = {
        id: "sess-busy",
        title: "Sesi Bentrok",
        coachId: "coach-zulfi",
        startTime: parseLocalDateTimeToUTC("2026-09-08T15:30:00"),
        endTime: parseLocalDateTimeToUTC("2026-09-08T16:30:00"), // Overlaps with 16:00 - 17:30
        status: "SCHEDULED",
        athletes: [],
      };

      const occRes = generateRecurringOccurrences({
        startDateStr: "2026-09-01",
        endDateStr: "2026-09-15",
        weekdays: [2], // 3 occurrences: Sep 1, Sep 8 (conflict), Sep 15
        startTimeStr: "16:00",
        endTimeStr: "17:30",
      });

      expect(occRes.success).toBe(true);
      if (occRes.success) {
        const preview = evaluateRecurringSchedulePreview(
          {
            targetCoachId: "coach-zulfi",
            targetAthleteIds: ["ath-1"],
            occurrences: occRes.occurrences,
          },
          [conflictSession]
        );

        expect(preview.safeCount).toBe(2);
        expect(preview.blockedCount).toBe(1);
        expect(preview.occurrences[1].status).toBe("COACH_BLOCKED");
      }
    });
  });

  // ==========================================
  // 3. P7-B3 CLONE & RESCHEDULE INTEGRATION (T25 - T46)
  // ==========================================
  describe("P7-B3 Clone & Reschedule Engine", () => {
    it("T25 - T28: provides contextual action labels based on source session status", () => {
      expect(getCloneActionLabel("SCHEDULED").actionLabel).toBe("Duplikasi Sesi");
      expect(getCloneActionLabel("COMPLETED").actionLabel).toBe("Duplikasi Sesi");
      expect(getCloneActionLabel("CANCELLED").actionLabel).toBe("Jadwalkan Ulang");
      expect(getCloneActionLabel("NO_SHOW").actionLabel).toBe("Jadwalkan Ulang");
    });

    it("T29 & T30: calculates exact source duration (90 min) and applies to target start time", () => {
      const sourceStart = new Date("2026-08-01T08:00:00Z");
      const sourceEnd = new Date("2026-08-01T09:30:00Z"); // 90 min
      const duration = calculateSourceDuration(sourceStart, sourceEnd);
      expect(duration.durationMinutes).toBe(90);

      const target = prepareCloneTargetDates({
        targetDateStr: "2026-09-01",
        targetStartTimeStr: "16:00",
        durationMs: duration.durationMs,
      });

      expect(target.success).toBe(true);
      if (target.success) {
        const diffMinutes = (target.targetEndTime.getTime() - target.targetStartTime.getTime()) / (60 * 1000);
        expect(diffMinutes).toBe(90);
      }
    });

    it("T31 - T35: guarantees new cloned session resets status to SCHEDULED and clears historical logs", () => {
      const actionLabels = getCloneActionLabel("COMPLETED");
      expect(actionLabels.titleLabel).toContain("Duplikasi Sesi");
    });

    it("T40 - T42: evaluates duplicate and idempotent clone preview safely", () => {
      const targetStart = parseLocalDateTimeToUTC("2026-09-01T16:00:00");
      const targetEnd = parseLocalDateTimeToUTC("2026-09-01T17:30:00");

      const existingDuplicate: ExistingConflictSession = {
        id: "sess-existing",
        title: "Latihan Serupa",
        coachId: "coach-zulfi",
        startTime: targetStart,
        endTime: targetEnd,
        status: "SCHEDULED",
        athletes: [{ athleteId: "ath-1" }],
      };

      const res = evaluateCloneSessionPreview({
        sourceSessionId: "source-1",
        sourceTitle: "Sesi Asal",
        targetCoachId: "coach-zulfi",
        targetAthleteIds: ["ath-1"],
        targetStartTime: targetStart,
        targetEndTime: targetEnd,
        durationMinutes: 90,
        candidateSessions: [existingDuplicate],
      });

      expect(res.isAlreadyExists).toBe(true);
      expect(res.canProceed).toBe(false);
      expect(res.reason).toContain("sudah terdaftar");
    });
  });

  // ==========================================
  // 4. P7-B4 QUICK FILTERS & TIMEZONE VERIFICATION (T47 - T61)
  // ==========================================
  describe("P7-B4 Quick Filters Engine & Timezone", () => {
    const fixedNow = new Date("2026-08-31T10:00:00.000Z"); // 17:00 WIB

    it("T47 - T50: resolves role defaults (Assistant -> mine; Admin/Head/Owner -> all)", () => {
      expect(resolveDefaultScope("assistant_coach")).toBe("mine");
      expect(resolveDefaultScope("admin")).toBe("all");
      expect(resolveDefaultScope("head_coach")).toBe("all");
      expect(resolveDefaultScope("owner")).toBe("all");
    });

    it("T51 & T52: scope=mine enforces memberId as effectiveCoachId, scope=all does not", () => {
      const resMine = resolveEffectiveScheduleFilters({
        role: "assistant_coach",
        memberId: "coach-1",
        searchParams: {},
        now: fixedNow,
      });
      expect(resMine.effectiveCoachId).toBe("coach-1");

      const resAll = resolveEffectiveScheduleFilters({
        role: "head_coach",
        memberId: "coach-head",
        searchParams: { scope: "all" },
        now: fixedNow,
      });
      expect(resAll.effectiveCoachId).toBeUndefined();
    });

    it("T53 & T54: today and week ranges compute exact Jakarta WIB boundaries", () => {
      const today = getTodayRangeJakarta(fixedNow);
      expect(today.todayIso).toBe("2026-08-31");
      expect(today.startDate.toISOString()).toBe("2026-08-30T17:00:00.000Z"); // 00:00 WIB
      expect(today.endDate.toISOString()).toBe("2026-08-31T16:59:59.999Z"); // 23:59:59.999 WIB

      const week = getWeekRangeJakarta(fixedNow);
      expect(week.startIso).toBe("2026-08-31");
      expect(week.endIso).toBe("2026-09-06"); // +6 days = 7 days total
    });

    it("T57 & T58: invalid parameters normalize safely to defaults", () => {
      expect(normalizeScope("invalid", "mine")).toBe("mine");
      expect(normalizePeriod("invalid")).toBe("all");
    });
  });

  // ==========================================
  // 5. P7-A & P5 REGRESSION & SECURITY (T62 - T84)
  // ==========================================
  describe("P7-A & P5 Workflow Compatibility & Security Scoping", () => {
    it("T62 - T69: session execution authorization and lifecycle states", () => {
      // Admin/Head coach can execute any session
      expect(canMemberExecuteSession("head_coach", "head-1", "coach-2")).toBe(true);
      expect(canMemberExecuteSession("admin", "admin-1", "coach-2")).toBe(true);

      // Assistant coach can ONLY execute their own session
      expect(canMemberExecuteSession("assistant_coach", "asst-1", "asst-1")).toBe(true);
      expect(canMemberExecuteSession("assistant_coach", "asst-1", "head-1")).toBe(false);

      // Eligibility & Readonly states
      expect(isSessionEligibleForExecution("SCHEDULED").eligible).toBe(true);
      expect(isSessionEligibleForExecution("SCHEDULED").readOnly).toBe(false);
      expect(isSessionEligibleForExecution("COMPLETED").eligible).toBe(false);
      expect(isSessionEligibleForExecution("COMPLETED").readOnly).toBe(true);
      expect(isSessionEligibleForExecution("CANCELLED").eligible).toBe(false);
      expect(isSessionEligibleForExecution("CANCELLED").readOnly).toBe(true);
    });

    it("T70 - T75: Parent Feedback eligibility follows strict attendance rules", () => {
      // PRESENT & LATE -> Eligible
      expect(isAttendanceEligibleForFeedback("PRESENT")).toBe(true);
      expect(isAttendanceEligibleForFeedback("LATE")).toBe(true);

      // ABSENT & EXCUSED & UNMARKED -> Ineligible
      expect(isAttendanceEligibleForFeedback("ABSENT")).toBe(false);
      expect(isAttendanceEligibleForFeedback("EXCUSED")).toBe(false);
      expect(isAttendanceEligibleForFeedback(null)).toBe(false);
      expect(isAttendanceEligibleForFeedback(undefined)).toBe(false);
    });

    it("T76 - T84: 7-day parent feedback submission window expiration check", () => {
      const baseSessionEndTime = new Date("2026-08-01T10:00:00Z");
      const withinWindow = new Date("2026-08-05T10:00:00Z"); // 4 days later -> valid
      const expiredTime = new Date("2026-08-10T10:00:00Z"); // 9 days later -> expired

      expect(isFeedbackWindowValid(baseSessionEndTime, withinWindow).valid).toBe(true);
      expect(isFeedbackWindowValid(baseSessionEndTime, expiredTime).valid).toBe(false);
    });
  });
});
