import { describe, it, expect } from "vitest";
import {
  createAthleteGoalSchema,
  updateAthleteGoalSchema,
} from "./schemas";
import {
  calculatePersonalBest,
  resolveCurrentValue,
  validateGoalTarget,
  calculateGoalProgress,
  isGoalTargetAchieved,
} from "./engine";

describe("P6-B2 Backend Schema & Integration Logic Tests", () => {
  /* =========================================================================
   * 1. ZOD SCHEMA VALIDATIONS
   * ========================================================================= */
  describe("1. Schema Validations", () => {
    it("Validates proper create goal payload", () => {
      const valid = createAthleteGoalSchema.safeParse({
        athleteId: "ath_123",
        testItemId: "test_speed_30m",
        targetValue: 4.15,
        baselineValue: 4.45,
        title: "Target Kecepatan Lari Sprint",
        targetDate: "2026-10-15",
        notes: "Fokus pada akselerasi 10 meter pertama",
      });
      expect(valid.success).toBe(true);
    });

    it("Rejects missing athleteId or testItemId", () => {
      const invalid = createAthleteGoalSchema.safeParse({
        athleteId: "",
        testItemId: "test_speed_30m",
        targetValue: 4.15,
      });
      expect(invalid.success).toBe(false);
    });

    it("Rejects negative targetValue", () => {
      const invalid = createAthleteGoalSchema.safeParse({
        athleteId: "ath_123",
        testItemId: "test_speed_30m",
        targetValue: -4.15,
      });
      expect(invalid.success).toBe(false);
    });

    it("Rejects invalid targetDate string format", () => {
      const invalid = createAthleteGoalSchema.safeParse({
        athleteId: "ath_123",
        testItemId: "test_speed_30m",
        targetValue: 4.15,
        targetDate: "invalid-date-format-xyz",
      });
      expect(invalid.success).toBe(false);
    });

    it("Validates proper update goal payload", () => {
      const valid = updateAthleteGoalSchema.safeParse({
        goalId: "goal_999",
        title: "Updated Target Title",
        targetValue: 4.10,
        notes: "Updated coaching notes",
      });
      expect(valid.success).toBe(true);
    });
  });

  /* =========================================================================
   * 2. PARTIAL ASSESSMENT EVALUATION LOGIC
   * ========================================================================= */
  describe("2. Partial Assessment & Target Matching", () => {
    it("Only evaluates active goals for testItems present in assessment", () => {
      const assessmentResults = [
        { testItemId: "speed_30m", rawValue: 4.18, scoreDirection: "LOWER_IS_BETTER" as const },
        { testItemId: "vertical_jump", rawValue: 55, scoreDirection: "HIGHER_IS_BETTER" as const },
      ];

      const activeGoals = [
        { id: "g1", testItemId: "speed_30m", targetValue: 4.20 }, // Achieved (4.18 <= 4.20)
        { id: "g2", testItemId: "vertical_jump", targetValue: 60 }, // Not achieved (55 < 60)
        { id: "g3", testItemId: "agility_505", targetValue: 2.10 }, // Not present in assessment
      ];

      const evaluated = activeGoals.map((g) => {
        const matchingResult = assessmentResults.find((r) => r.testItemId === g.testItemId);
        if (!matchingResult) return { ...g, status: "ACTIVE" };

        const isAchieved = isGoalTargetAchieved(
          g.targetValue,
          matchingResult.rawValue,
          matchingResult.scoreDirection
        );
        return { ...g, status: isAchieved ? "ACHIEVED" : "ACTIVE" };
      });

      expect(evaluated.find((e) => e.id === "g1")?.status).toBe("ACHIEVED");
      expect(evaluated.find((e) => e.id === "g2")?.status).toBe("ACTIVE");
      expect(evaluated.find((e) => e.id === "g3")?.status).toBe("ACTIVE"); // Untouched
    });
  });

  /* =========================================================================
   * 3. MULTI-DIRECTIONAL PROGRESS & EDGE CASES
   * ========================================================================= */
  describe("3. Progress Metrics & Clamping", () => {
    it("HIGHER_IS_BETTER: accurately clamps between 0% and 100%", () => {
      // 0% when worse than baseline
      const worse = calculateGoalProgress(50, 60, 48, "HIGHER_IS_BETTER");
      expect(worse.progressPercent).toBe(0);
      expect(worse.isImproving).toBe(false);
      expect(worse.deltaFromBaseline).toBe(-2);

      // 70% in progress
      const mid = calculateGoalProgress(50, 60, 57, "HIGHER_IS_BETTER");
      expect(mid.progressPercent).toBe(70);
      expect(mid.isImproving).toBe(true);

      // 100% when exceeding target
      const over = calculateGoalProgress(50, 60, 65, "HIGHER_IS_BETTER");
      expect(over.progressPercent).toBe(100);
      expect(over.state).toBe("ACHIEVED");
    });

    it("LOWER_IS_BETTER: accurately clamps between 0% and 100%", () => {
      // 0% when slower than baseline
      const worse = calculateGoalProgress(4.40, 4.10, 4.52, "LOWER_IS_BETTER");
      expect(worse.progressPercent).toBe(0);
      expect(worse.isImproving).toBe(false);
      expect(worse.deltaFromBaseline).toBe(0.12);

      // 50% in progress (4.40 -> 4.25 with target 4.10)
      const mid = calculateGoalProgress(4.40, 4.10, 4.25, "LOWER_IS_BETTER");
      expect(mid.progressPercent).toBe(50);
      expect(mid.isImproving).toBe(true);
      expect(mid.deltaFromBaseline).toBe(-0.15);

      // 100% when faster than target (4.05 <= 4.10)
      const over = calculateGoalProgress(4.40, 4.10, 4.05, "LOWER_IS_BETTER");
      expect(over.progressPercent).toBe(100);
      expect(over.state).toBe("ACHIEVED");
    });
  });
});
