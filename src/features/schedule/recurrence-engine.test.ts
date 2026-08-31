import { describe, it, expect } from "vitest";
import {
  generateRecurringOccurrences,
  evaluateRecurringSchedulePreview,
  MAX_RECURRENCE_WEEKS,
} from "./recurrence-engine";
import type { ExistingConflictSession } from "./conflict-engine";

describe("Recurring Schedule Generator Engine (P7-B2)", () => {
  describe("generateRecurringOccurrences (Pure Date Math)", () => {
    it("1. generates weekly single weekday occurrences correctly", () => {
      // 2026-09-01 (Tuesday) to 2026-09-15 (Tuesday), weekday 2 (Tuesday)
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-01",
        endDateStr: "2026-09-15",
        weekdays: [2],
        startTimeStr: "16:00",
        endTimeStr: "17:30",
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.occurrences).toHaveLength(3); // 1 Sep, 8 Sep, 15 Sep
        expect(res.occurrences[0].dateStr).toBe("2026-09-01");
        expect(res.occurrences[0].dayName).toBe("Selasa");
        expect(res.occurrences[1].dateStr).toBe("2026-09-08");
        expect(res.occurrences[2].dateStr).toBe("2026-09-15");
      }
    });

    it("2. generates weekly multiple weekdays occurrences (e.g. Monday + Thursday)", () => {
      // 2026-09-01 (Tue) to 2026-09-14 (Mon)
      // Mondays (1): 7 Sep, 14 Sep. Thursdays (4): 3 Sep, 10 Sep. Total = 4
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-01",
        endDateStr: "2026-09-14",
        weekdays: [1, 4],
        startTimeStr: "08:00",
        endTimeStr: "09:30",
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.occurrences).toHaveLength(4);
        expect(res.occurrences.map((o) => o.dateStr)).toEqual([
          "2026-09-03",
          "2026-09-07",
          "2026-09-10",
          "2026-09-14",
        ]);
      }
    });

    it("3. handles start date = end date for matching weekday", () => {
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-01",
        endDateStr: "2026-09-01",
        weekdays: [2], // Tuesday
        startTimeStr: "16:00",
        endTimeStr: "17:00",
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.occurrences).toHaveLength(1);
        expect(res.occurrences[0].dateStr).toBe("2026-09-01");
      }
    });

    it("4. rejects when no matching weekdays are found within range", () => {
      // 2026-09-01 (Tue) to 2026-09-02 (Wed), but asking for Sunday (0)
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-01",
        endDateStr: "2026-09-02",
        weekdays: [0],
        startTimeStr: "16:00",
        endTimeStr: "17:00",
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("Tidak ada tanggal");
      }
    });

    it("5. rejects range exceeding maximum 12 weeks limit", () => {
      const res = generateRecurringOccurrences({
        startDateStr: "2026-01-01",
        endDateStr: "2026-06-30", // ~26 weeks
        weekdays: [1],
        startTimeStr: "16:00",
        endTimeStr: "17:00",
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain(`${MAX_RECURRENCE_WEEKS} minggu`);
      }
    });

    it("6. rejects when endDate < startDate", () => {
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-15",
        endDateStr: "2026-09-01",
        weekdays: [1],
        startTimeStr: "16:00",
        endTimeStr: "17:00",
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("Tanggal selesai tidak boleh sebelum tanggal mulai");
      }
    });

    it("7. rejects when endTime <= startTime", () => {
      const res = generateRecurringOccurrences({
        startDateStr: "2026-09-01",
        endDateStr: "2026-09-15",
        weekdays: [1],
        startTimeStr: "17:00",
        endTimeStr: "16:00",
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("Jam selesai harus setelah jam mulai");
      }
    });
  });

  describe("evaluateRecurringSchedulePreview (Conflict & Duplicate Classification)", () => {
    const makeDate = (dateStr: string, timeStr: string) =>
      new Date(`${dateStr}T${timeStr}:00.000Z`);

    const genResult = generateRecurringOccurrences({
      startDateStr: "2026-09-01",
      endDateStr: "2026-09-08",
      weekdays: [2], // Tue 1 Sep, Tue 8 Sep
      startTimeStr: "16:00",
      endTimeStr: "17:30",
    });

    const occurrences = (genResult as { success: true; occurrences: any[] }).occurrences;

    it("8. classifies clean occurrences as SAFE", () => {
      const preview = evaluateRecurringSchedulePreview(
        {
          targetCoachId: "coach-zulfi",
          targetAthleteIds: ["ath-1", "ath-2"],
          occurrences,
        },
        [] // No existing candidate sessions
      );

      expect(preview.totalCount).toBe(2);
      expect(preview.safeCount).toBe(2);
      expect(preview.blockedCount).toBe(0);
      expect(preview.warningCount).toBe(0);
      expect(preview.alreadyExistsCount).toBe(0);
      expect(preview.occurrences[0].status).toBe("SAFE");
      expect(preview.occurrences[1].status).toBe("SAFE");
    });

    it("9. classifies exact duplicate as ALREADY_EXISTS", () => {
      const candidateSessions: ExistingConflictSession[] = [
        {
          id: "sess-dup",
          title: "Speed Routine",
          startTime: occurrences[0].startTime,
          endTime: occurrences[0].endTime,
          status: "SCHEDULED",
          coachId: "coach-zulfi",
          athletes: [],
        },
      ];

      const preview = evaluateRecurringSchedulePreview(
        {
          targetCoachId: "coach-zulfi",
          targetAthleteIds: ["ath-1"],
          occurrences,
        },
        candidateSessions
      );

      expect(preview.totalCount).toBe(2);
      expect(preview.alreadyExistsCount).toBe(1);
      expect(preview.safeCount).toBe(1);
      expect(preview.occurrences[0].status).toBe("ALREADY_EXISTS");
      expect(preview.occurrences[1].status).toBe("SAFE");
    });

    it("10. classifies coach collision as COACH_BLOCKED (Hard Block)", () => {
      // Overlapping session on 1 Sep: 16:30 to 18:00
      const candidateSessions: ExistingConflictSession[] = [
        {
          id: "sess-coach-block",
          title: "Private Session",
          startTime: new Date(occurrences[0].startTime.getTime() + 30 * 60 * 1000),
          endTime: new Date(occurrences[0].endTime.getTime() + 30 * 60 * 1000),
          status: "SCHEDULED",
          coachId: "coach-zulfi",
          coachName: "Coach Zulfi",
          athletes: [],
        },
      ];

      const preview = evaluateRecurringSchedulePreview(
        {
          targetCoachId: "coach-zulfi",
          targetAthleteIds: ["ath-1"],
          occurrences,
        },
        candidateSessions
      );

      expect(preview.blockedCount).toBe(1);
      expect(preview.safeCount).toBe(1);
      expect(preview.occurrences[0].status).toBe("COACH_BLOCKED");
      expect(preview.occurrences[0].reason).toContain("Pelatih bentrok");
    });

    it("11. classifies athlete collision as ATHLETE_WARNING (Soft Warning)", () => {
      const candidateSessions: ExistingConflictSession[] = [
        {
          id: "sess-ath-warn",
          title: "Squad Gym",
          startTime: occurrences[1].startTime,
          endTime: occurrences[1].endTime,
          status: "SCHEDULED",
          coachId: "coach-other",
          athletes: [{ athleteId: "ath-1", athleteName: "Rangga Pratama" }],
        },
      ];

      const preview = evaluateRecurringSchedulePreview(
        {
          targetCoachId: "coach-zulfi",
          targetAthleteIds: ["ath-1"],
          occurrences,
        },
        candidateSessions
      );

      expect(preview.warningCount).toBe(1);
      expect(preview.safeCount).toBe(1);
      expect(preview.occurrences[1].status).toBe("ATHLETE_WARNING");
      expect(preview.occurrences[1].reason).toContain("Rangga Pratama");
    });

    it("12. ignores CANCELLED candidate sessions during evaluation", () => {
      const candidateSessions: ExistingConflictSession[] = [
        {
          id: "sess-cancelled",
          title: "Old Cancelled Session",
          startTime: occurrences[0].startTime,
          endTime: occurrences[0].endTime,
          status: "CANCELLED",
          coachId: "coach-zulfi",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const preview = evaluateRecurringSchedulePreview(
        {
          targetCoachId: "coach-zulfi",
          targetAthleteIds: ["ath-1"],
          occurrences,
        },
        candidateSessions
      );

      expect(preview.safeCount).toBe(2);
      expect(preview.blockedCount).toBe(0);
      expect(preview.alreadyExistsCount).toBe(0);
    });
  });
});
