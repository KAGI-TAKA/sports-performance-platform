import { describe, it, expect } from "vitest";
import {
  canMemberExecuteSession,
  isSessionEligibleForExecution,
  formatActivitiesDoneFromExecution,
  validateSessionCompletionPreconditions,
} from "./engine";
import type { SessionExecutionPlanExercise } from "./types";

describe("P7-A1 Session Execution Engine", () => {
  describe("canMemberExecuteSession (RBAC)", () => {
    it("allows OWNER, ADMIN, and HEAD_COACH regardless of assigned coachId", () => {
      expect(canMemberExecuteSession("owner", "member-1", "coach-999")).toBe(true);
      expect(canMemberExecuteSession("admin", "member-1", "coach-999")).toBe(true);
      expect(canMemberExecuteSession("head_coach", "member-1", "coach-999")).toBe(true);
    });

    it("allows ASSISTANT_COACH ONLY if they are the assigned session coach", () => {
      expect(canMemberExecuteSession("assistant_coach", "asst-1", "asst-1")).toBe(true);
      expect(canMemberExecuteSession("assistant_coach", "asst-1", "asst-2")).toBe(false);
    });

    it("rejects ATHLETE and PARENT roles", () => {
      expect(canMemberExecuteSession("athlete", "user-1", "user-1")).toBe(false);
      expect(canMemberExecuteSession("parent", "user-2", "user-2")).toBe(false);
    });
  });

  describe("isSessionEligibleForExecution (Lifecycle)", () => {
    it("allows SCHEDULED and NO_SHOW sessions for execution", () => {
      expect(isSessionEligibleForExecution("SCHEDULED")).toEqual({
        eligible: true,
        readOnly: false,
      });
      expect(isSessionEligibleForExecution("NO_SHOW")).toEqual({
        eligible: true,
        readOnly: false,
      });
    });

    it("marks CANCELLED sessions as ineligible and read-only", () => {
      const res = isSessionEligibleForExecution("CANCELLED");
      expect(res.eligible).toBe(false);
      expect(res.readOnly).toBe(true);
      expect(res.reason).toContain("dibatalkan");
    });

    it("marks COMPLETED sessions as read-only archive", () => {
      const res = isSessionEligibleForExecution("COMPLETED");
      expect(res.eligible).toBe(false);
      expect(res.readOnly).toBe(true);
      expect(res.reason).toContain("selesai");
    });
  });

  describe("formatActivitiesDoneFromExecution (Default PLANNED & Strict State)", () => {
    const sampleExercises: SessionExecutionPlanExercise[] = [
      {
        id: "ex-1",
        name: "Ladder Drill (Fast Feet)",
        category: "Agility",
        sets: 3,
        reps: "5 reps",
        restSeconds: 60,
        notes: null,
        order: 1,
      },
      {
        id: "ex-2",
        name: "Sprint 20m Accelerations",
        category: "Speed",
        sets: 4,
        reps: "20 meter",
        restSeconds: 90,
        notes: null,
        order: 2,
      },
      {
        id: "ex-3",
        name: "Vertical Jump Depth Jumps",
        category: "Power",
        sets: 3,
        reps: "6 reps",
        restSeconds: 120,
        notes: null,
        order: 3,
      },
    ];

    it("defaults to 'Belum Dilakukan' if no state has been selected by coach", () => {
      // Empty execution map = all exercises are in default PLANNED state
      const summary = formatActivitiesDoneFromExecution(
        "Speed & Agility Master",
        sampleExercises,
        {}
      );

      expect(summary).toContain("1. Ladder Drill (Fast Feet) — Belum Dilakukan (3 sets x 5 reps)");
      expect(summary).toContain("2. Sprint 20m Accelerations — Belum Dilakukan (4 sets x 20 meter)");
      expect(summary).toContain("3. Vertical Jump Depth Jumps — Belum Dilakukan (3 sets x 6 reps)");
    });

    it("formats execution correctly when coach explicitly marks DONE", () => {
      const athleteExec = {
        "ex-1": { status: "DONE" as const },
        "ex-2": { status: "DONE" as const },
        "ex-3": { status: "DONE" as const },
      };

      const summary = formatActivitiesDoneFromExecution(
        "Speed & Agility Master",
        sampleExercises,
        athleteExec
      );

      expect(summary).toContain("Program: Speed & Agility Master");
      expect(summary).toContain("1. Ladder Drill (Fast Feet) — Selesai (3 sets x 5 reps)");
      expect(summary).toContain("2. Sprint 20m Accelerations — Selesai (4 sets x 20 meter)");
      expect(summary).toContain("3. Vertical Jump Depth Jumps — Selesai (3 sets x 6 reps)");
    });

    it("formats execution with MODIFIED and SKIPPED status and custom notes", () => {
      const athleteExec = {
        "ex-1": { status: "DONE" as const },
        "ex-2": {
          status: "MODIFIED" as const,
          actualSets: 2,
          actualReps: "15 meter",
          notes: "Beban dikurangi karena recovery hamstring",
        },
        "ex-3": {
          status: "SKIPPED" as const,
          notes: "Dilewati karena atlet kelelahan",
        },
      };

      const summary = formatActivitiesDoneFromExecution(
        "Speed & Agility Master",
        sampleExercises,
        athleteExec
      );

      expect(summary).toContain("1. Ladder Drill (Fast Feet) — Selesai");
      expect(summary).toContain("2. Sprint 20m Accelerations — Modifikasi (2 sets x 15 meter) [Catatan: Beban dikurangi karena recovery hamstring]");
      expect(summary).toContain("3. Vertical Jump Depth Jumps — Dilewati (3 sets x 6 reps) [Catatan: Dilewati karena atlet kelelahan]");
    });

    it("produces independent execution logs for different athletes in the same session", () => {
      const athlete1Exec = {
        "ex-1": { status: "DONE" as const },
        "ex-2": { status: "DONE" as const },
        "ex-3": { status: "DONE" as const },
      };

      const athlete2Exec = {
        "ex-1": { status: "DONE" as const },
        "ex-2": { status: "MODIFIED" as const, notes: "Kecepatan 80%" },
        "ex-3": { status: "SKIPPED" as const, notes: "Cedera ringan" },
      };

      const summary1 = formatActivitiesDoneFromExecution("Program A", sampleExercises, athlete1Exec);
      const summary2 = formatActivitiesDoneFromExecution("Program A", sampleExercises, athlete2Exec);

      expect(summary1).not.toBe(summary2);
      expect(summary1).toContain("2. Sprint 20m Accelerations — Selesai");
      expect(summary2).toContain("2. Sprint 20m Accelerations — Modifikasi");
      expect(summary2).toContain("3. Vertical Jump Depth Jumps — Dilewati");
    });

    it("returns fallback text if no exercises in training plan", () => {
      const summary = formatActivitiesDoneFromExecution(null, [], {}, "Latihan drill taktis manual");
      expect(summary).toBe("Latihan drill taktis manual");
    });
  });

  describe("validateSessionCompletionPreconditions", () => {
    it("fails when athlete list is empty", () => {
      const res = validateSessionCompletionPreconditions([]);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("tidak memiliki atlet");
    });

    it("fails when any athlete attendance is UNMARKED", () => {
      const res = validateSessionCompletionPreconditions([
        { athleteId: "ath-1", attendanceStatus: "PRESENT" },
        { athleteId: "ath-2", attendanceStatus: "UNMARKED" },
      ]);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("harus memiliki status presensi");
    });

    it("fails when all athletes are ABSENT / EXCUSED (participatedCount === 0)", () => {
      const res = validateSessionCompletionPreconditions([
        { athleteId: "ath-1", attendanceStatus: "ABSENT" },
        { athleteId: "ath-2", attendanceStatus: "EXCUSED" },
      ]);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Tidak ada atlet yang hadir");
      expect(res.participatedCount).toBe(0);
    });

    it("succeeds when at least one athlete is PRESENT or LATE", () => {
      const res = validateSessionCompletionPreconditions([
        { athleteId: "ath-1", attendanceStatus: "PRESENT" },
        { athleteId: "ath-2", attendanceStatus: "LATE" },
        { athleteId: "ath-3", attendanceStatus: "ABSENT" },
      ]);
      expect(res.valid).toBe(true);
      expect(res.participatedCount).toBe(2);
    });
  });
});
