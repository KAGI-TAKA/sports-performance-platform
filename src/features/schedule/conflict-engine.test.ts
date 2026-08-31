import { describe, it, expect } from "vitest";
import {
  detectTimeOverlap,
  isStatusConflictEligible,
  detectCoachConflicts,
  detectAthleteConflicts,
  buildScheduleConflictReport,
  type ExistingConflictSession,
} from "./conflict-engine";

describe("Schedule Conflict Detection Engine (P7-B1)", () => {
  const baseDate = "2026-09-01T";

  const makeDate = (timeStr: string) => new Date(`${baseDate}${timeStr}:00.000Z`);

  describe("detectTimeOverlap (Pure Mathematical Overlap Rule)", () => {
    it("1. returns false for completely separate non-overlapping time ranges", () => {
      const sA = makeDate("08:00");
      const eA = makeDate("09:00");
      const sB = makeDate("10:00");
      const eB = makeDate("11:00");

      expect(detectTimeOverlap(sA, eA, sB, eB)).toBe(false);
      expect(detectTimeOverlap(sB, eB, sA, eA)).toBe(false);
    });

    it("2. returns false for exact boundary adjacency (e.g. 16:00-17:00 and 17:00-18:00)", () => {
      const sA = makeDate("16:00");
      const eA = makeDate("17:00");
      const sB = makeDate("17:00");
      const eB = makeDate("18:00");

      expect(detectTimeOverlap(sA, eA, sB, eB)).toBe(false);
      expect(detectTimeOverlap(sB, eB, sA, eA)).toBe(false);
    });

    it("3. returns true for partial overlap (starts before, ends during)", () => {
      const sA = makeDate("16:00");
      const eA = makeDate("17:30");
      const sB = makeDate("17:00");
      const eB = makeDate("18:00");

      expect(detectTimeOverlap(sA, eA, sB, eB)).toBe(true);
      expect(detectTimeOverlap(sB, eB, sA, eA)).toBe(true);
    });

    it("4. returns true for full overlap (A completely wraps B)", () => {
      const sA = makeDate("14:00");
      const eA = makeDate("19:00");
      const sB = makeDate("16:00");
      const eB = makeDate("17:00");

      expect(detectTimeOverlap(sA, eA, sB, eB)).toBe(true);
      expect(detectTimeOverlap(sB, eB, sA, eA)).toBe(true);
    });

    it("5. returns true for nested overlap (A is completely inside B)", () => {
      const sA = makeDate("16:15");
      const eA = makeDate("16:45");
      const sB = makeDate("16:00");
      const eB = makeDate("17:00");

      expect(detectTimeOverlap(sA, eA, sB, eB)).toBe(true);
      expect(detectTimeOverlap(sB, eB, sA, eA)).toBe(true);
    });

    it("6. returns false for invalid time ranges (e.g. end <= start)", () => {
      const sA = makeDate("17:00");
      const eA = makeDate("16:00"); // invalid
      const sB = makeDate("16:00");
      const eB = makeDate("17:00");

      expect(detectTimeOverlap(sA, eA, sB, eB)).toBe(false);
    });
  });

  describe("isStatusConflictEligible (Status Lifecycle Rules)", () => {
    it("7. considers SCHEDULED and COMPLETED as conflict eligible", () => {
      expect(isStatusConflictEligible("SCHEDULED")).toBe(true);
      expect(isStatusConflictEligible("COMPLETED")).toBe(true);
    });

    it("8. ignores CANCELLED and NO_SHOW status from conflict calculation", () => {
      expect(isStatusConflictEligible("CANCELLED")).toBe(false);
      expect(isStatusConflictEligible("NO_SHOW")).toBe(false);
    });
  });

  describe("Coach Conflict Detection (Hard Block)", () => {
    const existingSessions: ExistingConflictSession[] = [
      {
        id: "sess-1",
        title: "Sprint Routine",
        startTime: makeDate("16:00"),
        endTime: makeDate("17:30"),
        status: "SCHEDULED",
        coachId: "coach-zulfi",
        coachName: "Coach Zulfi",
        athletes: [{ athleteId: "ath-1", athleteName: "Rangga Pratama" }],
      },
      {
        id: "sess-2",
        title: "Agility Drill",
        startTime: makeDate("09:00"),
        endTime: makeDate("10:30"),
        status: "COMPLETED",
        coachId: "coach-zulfi",
        coachName: "Coach Zulfi",
        athletes: [{ athleteId: "ath-2", athleteName: "Budi Santoso" }],
      },
      {
        id: "sess-cancelled",
        title: "Cancelled Training",
        startTime: makeDate("16:00"),
        endTime: makeDate("17:30"),
        status: "CANCELLED",
        coachId: "coach-budi",
        coachName: "Coach Budi",
        athletes: [{ athleteId: "ath-3", athleteName: "Citra Dewi" }],
      },
    ];

    it("9. detects coach conflict when coach has overlapping SCHEDULED session", () => {
      const result = detectCoachConflicts(
        {
          coachId: "coach-zulfi",
          startTime: makeDate("16:30"),
          endTime: makeDate("18:00"),
        },
        existingSessions
      );

      expect(result).not.toBeNull();
      expect(result?.conflictType).toBe("COACH");
      expect(result?.existingSessionId).toBe("sess-1");
      expect(result?.coachId).toBe("coach-zulfi");
    });

    it("10. detects coach conflict when coach has overlapping COMPLETED session", () => {
      const result = detectCoachConflicts(
        {
          coachId: "coach-zulfi",
          startTime: makeDate("09:30"),
          endTime: makeDate("11:00"),
        },
        existingSessions
      );

      expect(result).not.toBeNull();
      expect(result?.existingSessionId).toBe("sess-2");
    });

    it("11. ignores overlapping CANCELLED session for coach", () => {
      const result = detectCoachConflicts(
        {
          coachId: "coach-budi",
          startTime: makeDate("16:00"),
          endTime: makeDate("17:30"),
        },
        existingSessions
      );

      expect(result).toBeNull();
    });

    it("12. returns null for a different coach on the same time", () => {
      const result = detectCoachConflicts(
        {
          coachId: "coach-ahmad",
          startTime: makeDate("16:00"),
          endTime: makeDate("17:30"),
        },
        existingSessions
      );

      expect(result).toBeNull();
    });

    it("13. ignores self when excludeSessionId matches (for update operation)", () => {
      const result = detectCoachConflicts(
        {
          coachId: "coach-zulfi",
          startTime: makeDate("16:00"),
          endTime: makeDate("17:30"),
          excludeSessionId: "sess-1",
        },
        existingSessions
      );

      expect(result).toBeNull();
    });
  });

  describe("Athlete Conflict Detection (Soft Warning)", () => {
    const existingSessions: ExistingConflictSession[] = [
      {
        id: "sess-group",
        title: "Squad Conditioning",
        startTime: makeDate("16:00"),
        endTime: makeDate("17:30"),
        status: "SCHEDULED",
        coachId: "coach-1",
        athletes: [
          { athleteId: "ath-1", athleteName: "Rangga Pratama" },
          { athleteId: "ath-2", athleteName: "Budi Santoso" },
        ],
      },
    ];

    it("14. detects athlete conflict when enrolled in overlapping session", () => {
      const result = detectAthleteConflicts(
        {
          athleteIds: ["ath-1", "ath-99"],
          startTime: makeDate("17:00"),
          endTime: makeDate("18:00"),
        },
        existingSessions
      );

      expect(result).toHaveLength(1);
      expect(result[0].athleteId).toBe("ath-1");
      expect(result[0].athleteName).toBe("Rangga Pratama");
      expect(result[0].existingSessionId).toBe("sess-group");
    });

    it("15. detects multiple athlete conflicts in multi-athlete target session", () => {
      const result = detectAthleteConflicts(
        {
          athleteIds: ["ath-1", "ath-2", "ath-3"],
          startTime: makeDate("16:15"),
          endTime: makeDate("17:15"),
        },
        existingSessions
      );

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.athleteId)).toEqual(["ath-1", "ath-2"]);
    });

    it("16. returns empty array for different non-overlapping athletes", () => {
      const result = detectAthleteConflicts(
        {
          athleteIds: ["ath-3", "ath-4"],
          startTime: makeDate("16:00"),
          endTime: makeDate("17:30"),
        },
        existingSessions
      );

      expect(result).toHaveLength(0);
    });
  });

  describe("buildScheduleConflictReport (Unified Report Evaluator)", () => {
    const existingSessions: ExistingConflictSession[] = [
      {
        id: "sess-coach-conflict",
        title: "Senior Squad",
        startTime: makeDate("16:00"),
        endTime: makeDate("17:30"),
        status: "SCHEDULED",
        coachId: "coach-head",
        coachName: "Coach Zulfi",
        athletes: [{ athleteId: "ath-1", athleteName: "Rangga" }],
      },
    ];

    it("17. blocks progression (canProceed = false) when coach has conflict", () => {
      const report = buildScheduleConflictReport(
        {
          coachId: "coach-head",
          athleteIds: ["ath-99"],
          startTime: makeDate("16:30"),
          endTime: makeDate("18:00"),
        },
        existingSessions
      );

      expect(report.hasConflict).toBe(true);
      expect(report.hasCoachConflict).toBe(true);
      expect(report.canProceed).toBe(false);
      expect(report.coachConflict?.existingTitle).toBe("Senior Squad");
    });

    it("18. allows progression (canProceed = true) with warnings when only athlete has conflict", () => {
      const report = buildScheduleConflictReport(
        {
          coachId: "coach-assistant",
          athleteIds: ["ath-1"],
          startTime: makeDate("16:30"),
          endTime: makeDate("18:00"),
        },
        existingSessions
      );

      expect(report.hasConflict).toBe(true);
      expect(report.hasCoachConflict).toBe(false);
      expect(report.canProceed).toBe(true); // Warning only, not a hard block
      expect(report.athleteConflicts).toHaveLength(1);
    });

    it("19. returns clean report (canProceed = true, hasConflict = false) when completely safe", () => {
      const report = buildScheduleConflictReport(
        {
          coachId: "coach-assistant",
          athleteIds: ["ath-99"],
          startTime: makeDate("08:00"),
          endTime: makeDate("09:00"),
        },
        existingSessions
      );

      expect(report.hasConflict).toBe(false);
      expect(report.hasCoachConflict).toBe(false);
      expect(report.canProceed).toBe(true);
      expect(report.athleteConflicts).toHaveLength(0);
    });
  });
});
