import { describe, it, expect } from "vitest";
import {
  calculateSourceDuration,
  getCloneActionLabel,
  prepareCloneTargetDates,
  evaluateCloneSessionPreview,
} from "./clone-engine";
import type { ExistingConflictSession } from "./conflict-engine";

describe("Clone / Duplicate Session Engine (P7-B3)", () => {
  const baseDate = "2026-09-01T";
  const makeDate = (timeStr: string) => new Date(`${baseDate}${timeStr}:00.000Z`);

  describe("calculateSourceDuration", () => {
    it("1. calculates 30-minute duration correctly", () => {
      const s = makeDate("16:00");
      const e = makeDate("16:30");
      const { durationMs, durationMinutes } = calculateSourceDuration(s, e);
      expect(durationMinutes).toBe(30);
      expect(durationMs).toBe(30 * 60 * 1000);
    });

    it("2. calculates 60-minute duration correctly", () => {
      const s = makeDate("14:00");
      const e = makeDate("15:00");
      const { durationMinutes } = calculateSourceDuration(s, e);
      expect(durationMinutes).toBe(60);
    });

    it("3. calculates 90-minute duration correctly", () => {
      const s = makeDate("16:00");
      const e = makeDate("17:30");
      const { durationMinutes } = calculateSourceDuration(s, e);
      expect(durationMinutes).toBe(90);
    });

    it("4. calculates 120-minute duration correctly", () => {
      const s = makeDate("08:00");
      const e = makeDate("10:00");
      const { durationMinutes } = calculateSourceDuration(s, e);
      expect(durationMinutes).toBe(120);
    });

    it("5. safely falls back to 60 minutes for invalid or negative duration", () => {
      const s = makeDate("17:00");
      const e = makeDate("16:00");
      const { durationMinutes } = calculateSourceDuration(s, e);
      expect(durationMinutes).toBe(60);
    });
  });

  describe("getCloneActionLabel (Dynamic Labels)", () => {
    it("6. returns 'Duplikasi Sesi' for SCHEDULED status", () => {
      const labels = getCloneActionLabel("SCHEDULED");
      expect(labels.actionLabel).toBe("Duplikasi Sesi");
      expect(labels.buttonLabel).toContain("Duplikasi");
    });

    it("7. returns 'Duplikasi Sesi' for COMPLETED status", () => {
      const labels = getCloneActionLabel("COMPLETED");
      expect(labels.actionLabel).toBe("Duplikasi Sesi");
    });

    it("8. returns 'Jadwalkan Ulang' for CANCELLED status", () => {
      const labels = getCloneActionLabel("CANCELLED");
      expect(labels.actionLabel).toBe("Jadwalkan Ulang");
      expect(labels.buttonLabel).toContain("Jadwalkan Ulang");
    });

    it("9. returns 'Jadwalkan Ulang' for NO_SHOW status", () => {
      const labels = getCloneActionLabel("NO_SHOW");
      expect(labels.actionLabel).toBe("Jadwalkan Ulang");
    });
  });

  describe("prepareCloneTargetDates", () => {
    it("10. calculates target start and end dates accurately", () => {
      const res = prepareCloneTargetDates({
        targetDateStr: "2026-09-07",
        targetStartTimeStr: "16:00",
        durationMs: 90 * 60 * 1000,
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.targetStartTime).toBeInstanceOf(Date);
        expect(res.targetEndTime.getTime() - res.targetStartTime.getTime()).toBe(90 * 60 * 1000);
      }
    });

    it("11. rejects invalid date or time strings", () => {
      const res1 = prepareCloneTargetDates({
        targetDateStr: "invalid-date",
        targetStartTimeStr: "16:00",
        durationMs: 60 * 60 * 1000,
      });
      expect(res1.success).toBe(false);

      const res2 = prepareCloneTargetDates({
        targetDateStr: "2026-09-07",
        targetStartTimeStr: "25:99",
        durationMs: 60 * 60 * 1000,
      });
      expect(res2.success).toBe(false);
    });
  });

  describe("evaluateCloneSessionPreview (Conflict & Duplicate Evaluation)", () => {
    const targetStart = makeDate("16:00");
    const targetEnd = makeDate("17:30");

    it("12. marks preview as clean and runnable when no candidates overlap", () => {
      const preview = evaluateCloneSessionPreview({
        sourceSessionId: "source-1",
        sourceTitle: "Speed & Agility",
        targetCoachId: "coach-zulfi",
        targetAthleteIds: ["ath-1", "ath-2"],
        targetStartTime: targetStart,
        targetEndTime: targetEnd,
        durationMinutes: 90,
        candidateSessions: [],
      });

      expect(preview.canProceed).toBe(true);
      expect(preview.isAlreadyExists).toBe(false);
      expect(preview.hasCoachConflict).toBe(false);
      expect(preview.hasAthleteWarning).toBe(false);
    });

    it("13. marks preview as ALREADY_EXISTS when exact active session is present", () => {
      const candidateSessions: ExistingConflictSession[] = [
        {
          id: "existing-exact",
          title: "Speed Routine",
          startTime: targetStart,
          endTime: targetEnd,
          status: "SCHEDULED",
          coachId: "coach-zulfi",
          athletes: [],
        },
      ];

      const preview = evaluateCloneSessionPreview({
        sourceSessionId: "source-1",
        sourceTitle: "Speed & Agility",
        targetCoachId: "coach-zulfi",
        targetAthleteIds: ["ath-1"],
        targetStartTime: targetStart,
        targetEndTime: targetEnd,
        durationMinutes: 90,
        candidateSessions,
      });

      expect(preview.isAlreadyExists).toBe(true);
      expect(preview.canProceed).toBe(false);
      expect(preview.reason).toContain("sudah terdaftar");
    });

    it("14. hard blocks (canProceed = false) when target coach has overlapping session", () => {
      const candidateSessions: ExistingConflictSession[] = [
        {
          id: "existing-coach-overlap",
          title: "Private Strength",
          startTime: makeDate("16:30"),
          endTime: makeDate("18:00"),
          status: "SCHEDULED",
          coachId: "coach-zulfi",
          coachName: "Coach Zulfi",
          athletes: [],
        },
      ];

      const preview = evaluateCloneSessionPreview({
        sourceSessionId: "source-1",
        sourceTitle: "Speed & Agility",
        targetCoachId: "coach-zulfi",
        targetAthleteIds: ["ath-1"],
        targetStartTime: targetStart,
        targetEndTime: targetEnd,
        durationMinutes: 90,
        candidateSessions,
      });

      expect(preview.hasCoachConflict).toBe(true);
      expect(preview.canProceed).toBe(false);
      expect(preview.reason).toContain("Pelatih sudah memiliki sesi");
    });

    it("15. triggers soft warning (canProceed = true) when athlete has overlapping session", () => {
      const candidateSessions: ExistingConflictSession[] = [
        {
          id: "existing-athlete-overlap",
          title: "Squad Conditioning",
          startTime: makeDate("16:30"),
          endTime: makeDate("17:30"),
          status: "SCHEDULED",
          coachId: "coach-other",
          athletes: [{ athleteId: "ath-1", athleteName: "Rangga Pratama" }],
        },
      ];

      const preview = evaluateCloneSessionPreview({
        sourceSessionId: "source-1",
        sourceTitle: "Speed & Agility",
        targetCoachId: "coach-zulfi",
        targetAthleteIds: ["ath-1", "ath-2"],
        targetStartTime: targetStart,
        targetEndTime: targetEnd,
        durationMinutes: 90,
        candidateSessions,
      });

      expect(preview.hasCoachConflict).toBe(false);
      expect(preview.hasAthleteWarning).toBe(true);
      expect(preview.canProceed).toBe(true); // Warning allows progression upon confirmation
      expect(preview.athleteConflicts).toHaveLength(1);
    });

    it("16. ignores CANCELLED sessions from conflict evaluation", () => {
      const candidateSessions: ExistingConflictSession[] = [
        {
          id: "cancelled-session",
          title: "Cancelled Training",
          startTime: targetStart,
          endTime: targetEnd,
          status: "CANCELLED",
          coachId: "coach-zulfi",
          athletes: [{ athleteId: "ath-1" }],
        },
      ];

      const preview = evaluateCloneSessionPreview({
        sourceSessionId: "source-1",
        sourceTitle: "Speed & Agility",
        targetCoachId: "coach-zulfi",
        targetAthleteIds: ["ath-1"],
        targetStartTime: targetStart,
        targetEndTime: targetEnd,
        durationMinutes: 90,
        candidateSessions,
      });

      expect(preview.canProceed).toBe(true);
      expect(preview.isAlreadyExists).toBe(false);
      expect(preview.hasCoachConflict).toBe(false);
    });
  });
});
