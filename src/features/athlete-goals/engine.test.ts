import { describe, it, expect } from "vitest";
import {
  calculatePersonalBest,
  resolveCurrentValue,
  validateGoalTarget,
  calculateGoalProgress,
  isGoalTargetAchieved,
  canMemberManageGoals,
} from "./engine";

describe("Athlete Goals & Personal Best Engine Unit Tests", () => {
  /* =========================================================================
   * 1. PERSONAL BEST (PB) ENGINE
   * ========================================================================= */
  describe("1. Personal Best Calculation", () => {
    it("HIGHER_IS_BETTER: selects the maximum rawValue", () => {
      const results = [
        { rawValue: 45, assessmentDate: new Date("2026-06-01"), assessmentId: "a1" },
        { rawValue: 52, assessmentDate: new Date("2026-07-01"), assessmentId: "a2" },
        { rawValue: 48, assessmentDate: new Date("2026-08-01"), assessmentId: "a3" },
      ];
      const pb = calculatePersonalBest("HIGHER_IS_BETTER", results);
      expect(pb).not.toBeNull();
      expect(pb?.pbValue).toBe(52);
      expect(pb?.assessmentId).toBe("a2");
    });

    it("LOWER_IS_BETTER: selects the minimum rawValue", () => {
      const results = [
        { rawValue: 4.55, assessmentDate: new Date("2026-06-01"), assessmentId: "a1" },
        { rawValue: 4.21, assessmentDate: new Date("2026-07-01"), assessmentId: "a2" },
        { rawValue: 4.38, assessmentDate: new Date("2026-08-01"), assessmentId: "a3" },
      ];
      const pb = calculatePersonalBest("LOWER_IS_BETTER", results);
      expect(pb).not.toBeNull();
      expect(pb?.pbValue).toBe(4.21);
      expect(pb?.assessmentId).toBe("a2");
    });

    it("Resolves tied values by selecting the latest assessment date", () => {
      const results = [
        { rawValue: 50, assessmentDate: new Date("2026-05-01"), assessmentId: "a1" },
        { rawValue: 50, assessmentDate: new Date("2026-08-01"), assessmentId: "a2" },
      ];
      const pb = calculatePersonalBest("HIGHER_IS_BETTER", results);
      expect(pb?.assessmentId).toBe("a2");
    });

    it("Returns null for empty results array", () => {
      expect(calculatePersonalBest("HIGHER_IS_BETTER", [])).toBeNull();
    });
  });

  /* =========================================================================
   * 2. CURRENT VALUE RESOLUTION
   * ========================================================================= */
  describe("2. Current Value Resolution", () => {
    it("Resolves the latest assessment date regardless of rawValue", () => {
      const results = [
        { rawValue: 52, assessmentDate: new Date("2026-06-01"), assessmentId: "a1" },
        { rawValue: 48, assessmentDate: new Date("2026-08-15"), assessmentId: "a2" },
      ];
      const current = resolveCurrentValue(results);
      expect(current).not.toBeNull();
      expect(current?.currentValue).toBe(48);
      expect(current?.assessmentId).toBe("a2");
    });

    it("Returns null for empty results", () => {
      expect(resolveCurrentValue([])).toBeNull();
    });
  });

  /* =========================================================================
   * 3. TARGET DIRECTION VALIDATION
   * ========================================================================= */
  describe("3. Goal Target Validation", () => {
    it("Rejects baseline == target", () => {
      const res = validateGoalTarget(50, 50, "HIGHER_IS_BETTER");
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("sama dengan");
    });

    it("HIGHER_IS_BETTER: accepts target > baseline and rejects target < baseline", () => {
      expect(validateGoalTarget(50, 55, "HIGHER_IS_BETTER").valid).toBe(true);
      const invalid = validateGoalTarget(50, 45, "HIGHER_IS_BETTER");
      expect(invalid.valid).toBe(false);
      expect(invalid.reason).toContain("lebih tinggi");
    });

    it("LOWER_IS_BETTER: accepts target < baseline and rejects target > baseline", () => {
      expect(validateGoalTarget(4.50, 4.20, "LOWER_IS_BETTER").valid).toBe(true);
      const invalid = validateGoalTarget(4.50, 4.80, "LOWER_IS_BETTER");
      expect(invalid.valid).toBe(false);
      expect(invalid.reason).toContain("lebih rendah");
    });
  });

  /* =========================================================================
   * 4. GOAL PROGRESS CALCULATION & CLAMPING
   * ========================================================================= */
  describe("4. Goal Progress Calculation", () => {
    it("HIGHER_IS_BETTER: calculates accurate progress percentage", () => {
      // Baseline 50, Target 60, Current 55 -> 50%
      const prog = calculateGoalProgress(50, 60, 55, "HIGHER_IS_BETTER");
      expect(prog.progressPercent).toBe(50);
      expect(prog.deltaFromBaseline).toBe(5);
      expect(prog.isImproving).toBe(true);
      expect(prog.isTargetReached).toBe(false);
      expect(prog.state).toBe("IN_PROGRESS");
    });

    it("LOWER_IS_BETTER: calculates accurate progress percentage", () => {
      // Baseline 4.50, Target 4.10 (diff 0.40), Current 4.30 (diff 0.20) -> 50%
      const prog = calculateGoalProgress(4.50, 4.10, 4.30, "LOWER_IS_BETTER");
      expect(prog.progressPercent).toBe(50);
      expect(prog.deltaFromBaseline).toBe(-0.20);
      expect(prog.isImproving).toBe(true);
      expect(prog.isTargetReached).toBe(false);
      expect(prog.state).toBe("IN_PROGRESS");
    });

    it("Clamps progress to 0% when current performance is worse than baseline", () => {
      // Baseline 50, Target 60, Current 45 -> raw -50% -> clamped 0%
      const progHigher = calculateGoalProgress(50, 60, 45, "HIGHER_IS_BETTER");
      expect(progHigher.progressPercent).toBe(0);
      expect(progHigher.deltaFromBaseline).toBe(-5);
      expect(progHigher.isImproving).toBe(false);

      // Baseline 4.40, Target 4.20, Current 4.60 (slower) -> clamped 0%
      const progLower = calculateGoalProgress(4.40, 4.20, 4.60, "LOWER_IS_BETTER");
      expect(progLower.progressPercent).toBe(0);
      expect(progLower.deltaFromBaseline).toBe(0.20);
      expect(progLower.isImproving).toBe(false);
    });

    it("Sets progress to 100% and state ACHIEVED when target is met or exceeded", () => {
      // Higher: Baseline 50, Target 60, Current 60 -> 100%
      const exact = calculateGoalProgress(50, 60, 60, "HIGHER_IS_BETTER");
      expect(exact.progressPercent).toBe(100);
      expect(exact.isTargetReached).toBe(true);
      expect(exact.state).toBe("ACHIEVED");

      // Higher overshoot: Baseline 50, Target 60, Current 65 -> 100%
      const overHigher = calculateGoalProgress(50, 60, 65, "HIGHER_IS_BETTER");
      expect(overHigher.progressPercent).toBe(100);
      expect(overHigher.isTargetReached).toBe(true);
      expect(overHigher.state).toBe("ACHIEVED");

      // Lower overshoot: Baseline 4.50, Target 4.20, Current 4.15 -> 100%
      const overLower = calculateGoalProgress(4.50, 4.20, 4.15, "LOWER_IS_BETTER");
      expect(overLower.progressPercent).toBe(100);
      expect(overLower.isTargetReached).toBe(true);
      expect(overLower.state).toBe("ACHIEVED");
    });

    it("Handles NO_CURRENT_VALUE when current is null", () => {
      const prog = calculateGoalProgress(50, 60, null, "HIGHER_IS_BETTER");
      expect(prog.progressPercent).toBe(0);
      expect(prog.state).toBe("NO_CURRENT_VALUE");
      expect(prog.isTargetReached).toBe(false);
    });
  });

  /* =========================================================================
   * 5. GOAL ACHIEVEMENT DETECTION
   * ========================================================================= */
  describe("5. Achievement Detection Helper", () => {
    it("HIGHER_IS_BETTER achievement", () => {
      expect(isGoalTargetAchieved(50, 50, "HIGHER_IS_BETTER")).toBe(true);
      expect(isGoalTargetAchieved(50, 52, "HIGHER_IS_BETTER")).toBe(true);
      expect(isGoalTargetAchieved(50, 48, "HIGHER_IS_BETTER")).toBe(false);
      expect(isGoalTargetAchieved(50, null, "HIGHER_IS_BETTER")).toBe(false);
    });

    it("LOWER_IS_BETTER achievement", () => {
      expect(isGoalTargetAchieved(4.20, 4.20, "LOWER_IS_BETTER")).toBe(true);
      expect(isGoalTargetAchieved(4.20, 4.15, "LOWER_IS_BETTER")).toBe(true);
      expect(isGoalTargetAchieved(4.20, 4.25, "LOWER_IS_BETTER")).toBe(false);
      expect(isGoalTargetAchieved(4.20, null, "LOWER_IS_BETTER")).toBe(false);
    });
  });

  /* =========================================================================
   * 6. PERMISSIONS
   * ========================================================================= */
  describe("6. Permissions", () => {
    it("Allows coaching staff roles to manage goals", () => {
      expect(canMemberManageGoals("owner")).toBe(true);
      expect(canMemberManageGoals("admin")).toBe(true);
      expect(canMemberManageGoals("head_coach")).toBe(true);
      expect(canMemberManageGoals("assistant_coach")).toBe(true);
      expect(canMemberManageGoals("athlete")).toBe(false);
      expect(canMemberManageGoals("parent")).toBe(false);
    });
  });
});
