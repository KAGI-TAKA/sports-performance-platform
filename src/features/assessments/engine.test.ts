import { describe, it, expect } from "vitest";
import {
  calculateItemScore,
  calculateItemGap,
  calculateAssessmentEngine,
  calculateProgressAssessmentEngine,
  calculateAgeAtDate,
  pickBestBenchmark,
} from "./engine";
import { scoreToGrade } from "@/lib/constants";

// ─── scoreToGrade ─────────────────────────────────────────────────────────────

describe("scoreToGrade()", () => {
  it("should return A for score >= 90", () => {
    expect(scoreToGrade(90)).toBe("A");
    expect(scoreToGrade(100)).toBe("A");
    expect(scoreToGrade(95)).toBe("A");
  });

  it("should return B+ for score >= 80 and < 90", () => {
    expect(scoreToGrade(80)).toBe("B+");
    expect(scoreToGrade(89)).toBe("B+");
  });

  it("should return B for score >= 70 and < 80", () => {
    expect(scoreToGrade(70)).toBe("B");
    expect(scoreToGrade(79)).toBe("B");
  });

  it("should return C+ for score >= 60 and < 70", () => {
    expect(scoreToGrade(60)).toBe("C+");
    expect(scoreToGrade(69)).toBe("C+");
  });

  it("should return C for score >= 50 and < 60", () => {
    expect(scoreToGrade(50)).toBe("C");
    expect(scoreToGrade(59)).toBe("C");
  });

  it("should return D for score < 50", () => {
    expect(scoreToGrade(49)).toBe("D");
    expect(scoreToGrade(0)).toBe("D");
  });
});

// ─── calculateAgeAtDate ────────────────────────────────────────────────────────

describe("calculateAgeAtDate()", () => {
  it("should calculate exact age relative to target assessment date", () => {
    const dob = new Date("2012-08-15");
    expect(calculateAgeAtDate(dob, new Date("2026-08-14"))).toBe(13);
    expect(calculateAgeAtDate(dob, new Date("2026-08-15"))).toBe(14);
    expect(calculateAgeAtDate(dob, new Date("2026-08-16"))).toBe(14);
  });

  it("should handle year boundaries and invalid dates safely", () => {
    const dob = new Date("2010-01-01");
    expect(calculateAgeAtDate(dob, new Date("2026-01-01"))).toBe(16);
    expect(calculateAgeAtDate(new Date("invalid"), new Date())).toBe(0);
  });
});

// ─── pickBestBenchmark ─────────────────────────────────────────────────────────

describe("pickBestBenchmark()", () => {
  const benchmarks = [
    { ageMin: 12, ageMax: 14, gender: "MALE", thresholdA: 70, thresholdB: 60, thresholdC: 50, thresholdD: 40 },
    { ageMin: 12, ageMax: 14, gender: "FEMALE", thresholdA: 60, thresholdB: 50, thresholdC: 40, thresholdD: 30 },
    { ageMin: 15, ageMax: 18, gender: null, thresholdA: 80, thresholdB: 70, thresholdC: 60, thresholdD: 50 },
  ];

  it("should pick exact gender and age match first", () => {
    const picked = pickBestBenchmark(benchmarks, "FEMALE", 13);
    expect(picked?.gender).toBe("FEMALE");
    expect(picked?.thresholdA).toBe(60);
  });

  it("should fallback to co-ed/universal benchmark when gender is null", () => {
    const picked = pickBestBenchmark(benchmarks, "MALE", 16);
    expect(picked?.gender).toBeNull();
    expect(picked?.thresholdA).toBe(80);
  });

  it("should handle empty benchmarks array safely", () => {
    const picked = pickBestBenchmark([], "MALE", 14);
    expect(picked).toBeUndefined();
  });
});

// ─── calculateItemScore & calculateItemGap — HIGHER_IS_BETTER ─────────────

describe("calculateItemScore() & calculateItemGap() — HIGHER_IS_BETTER", () => {
  const baseItem = {
    testItemId: "test-1",
    physicalComponent: "SPEED" as const,
    scoreDirection: "HIGHER_IS_BETTER" as const,
    thresholdA: 29,
  };

  it("Kasus Wajib: 29 / 29 -> Score 100% -> GAP 0%", () => {
    const score = calculateItemScore({ ...baseItem, rawValue: 29 });
    const gap = calculateItemGap({ ...baseItem, rawValue: 29 });

    expect(score).toBe(100);
    expect(gap).toBe(0);
    expect(scoreToGrade(score)).toBe("A");
  });

  it("should cap score at 100 and GAP at 0 when rawValue > thresholdA", () => {
    const score = calculateItemScore({ ...baseItem, rawValue: 35 });
    const gap = calculateItemGap({ ...baseItem, rawValue: 35 });

    expect(score).toBe(100);
    expect(gap).toBe(0);
  });

  it("should calculate proportional score and gap when rawValue < thresholdA", () => {
    // 20 / 29 = 0.68965... -> 69%
    const score = calculateItemScore({ ...baseItem, rawValue: 20 });
    const gap = calculateItemGap({ ...baseItem, rawValue: 20 });

    expect(score).toBe(69);
    expect(gap).toBe(31);
    expect(score + gap).toBe(100);
  });

  it("should clamp scores strictly between 0 and 100 and GAP >= 0", () => {
    expect(calculateItemScore({ ...baseItem, rawValue: 999 })).toBe(100);
    expect(calculateItemGap({ ...baseItem, rawValue: 999 })).toBe(0);
    expect(calculateItemScore({ ...baseItem, rawValue: -50 })).toBe(0);
    expect(calculateItemGap({ ...baseItem, rawValue: -50 })).toBe(100);
  });

  it("should return 0 score and 100 gap for invalid numbers like NaN or Infinity", () => {
    expect(calculateItemScore({ ...baseItem, rawValue: NaN })).toBe(0);
    expect(calculateItemGap({ ...baseItem, rawValue: NaN })).toBe(100);
    expect(calculateItemScore({ ...baseItem, rawValue: Infinity })).toBe(0);
  });
});

// ─── calculateItemScore & calculateItemGap — LOWER_IS_BETTER ──────────────

describe("calculateItemScore() & calculateItemGap() — LOWER_IS_BETTER", () => {
  const timedItem = {
    testItemId: "test-2",
    physicalComponent: "SPEED" as const,
    scoreDirection: "LOWER_IS_BETTER" as const,
    thresholdA: 5.0, // 5.0 detik = Target
  };

  it("should return score 100 and GAP 0 when rawValue == thresholdA (exact target)", () => {
    const score = calculateItemScore({ ...timedItem, rawValue: 5.0 });
    const gap = calculateItemGap({ ...timedItem, rawValue: 5.0 });

    expect(score).toBe(100);
    expect(gap).toBe(0);
  });

  it("should return score 100 and GAP 0 when rawValue < thresholdA (faster than target)", () => {
    const score = calculateItemScore({ ...timedItem, rawValue: 4.2 });
    const gap = calculateItemGap({ ...timedItem, rawValue: 4.2 });

    expect(score).toBe(100);
    expect(gap).toBe(0);
  });

  it("should calculate GAP and score accurately when rawValue > thresholdA (slower)", () => {
    // 6.0s vs target 5.0s -> diff = 1.0s / 5.0s = 20% GAP -> score = 100 - 20 = 80
    const score = calculateItemScore({ ...timedItem, rawValue: 6.0 });
    const gap = calculateItemGap({ ...timedItem, rawValue: 6.0 });

    expect(gap).toBe(20);
    expect(score).toBe(80);
    expect(scoreToGrade(score)).toBe("B+");
  });

  it("should clamp minimum score to 0 and GAP >= 0 for extremely slow values", () => {
    // 15.0s vs target 5.0s -> gap = 200%, score = max(0, 100 - 200) = 0
    const score = calculateItemScore({ ...timedItem, rawValue: 15.0 });
    const gap = calculateItemGap({ ...timedItem, rawValue: 15.0 });

    expect(gap).toBe(200);
    expect(score).toBe(0);
  });
});

// ─── calculateAssessmentEngine ───────────────────────────────────────────────

describe("calculateAssessmentEngine()", () => {
  it("should return overallScore of 0 when given empty items array", () => {
    const result = calculateAssessmentEngine([]);
    expect(result.overallScore).toBe(0);
    expect(result.bestComponent).toBeNull();
  });

  it("should calculate componentScores only for components with items", () => {
    const items = [
      {
        testItemId: "t1",
        physicalComponent: "SPEED" as const,
        rawValue: 80,
        scoreDirection: "HIGHER_IS_BETTER" as const,
        thresholdA: 80,
        thresholdB: 60,
        thresholdC: 40,
        thresholdD: 20,
      },
    ];
    const result = calculateAssessmentEngine(items);
    expect(result.componentScores["SPEED"]).toBeDefined();
    expect(result.componentScores["POWER"]).toBeUndefined();
  });

  it("should correctly identify bestComponent as highest-scoring component", () => {
    const items = [
      {
        testItemId: "t1",
        physicalComponent: "SPEED" as const,
        rawValue: 90,
        scoreDirection: "HIGHER_IS_BETTER" as const,
        thresholdA: 80, thresholdB: 60, thresholdC: 40, thresholdD: 20,
      },
      {
        testItemId: "t2",
        physicalComponent: "POWER" as const,
        rawValue: 30,
        scoreDirection: "HIGHER_IS_BETTER" as const,
        thresholdA: 80, thresholdB: 60, thresholdC: 40, thresholdD: 20,
      },
    ];
    const result = calculateAssessmentEngine(items);
    expect(result.bestComponent).toBe("SPEED");
  });

  it("should return overallGrade consistent with overallScore", () => {
    const items = [
      {
        testItemId: "t1",
        physicalComponent: "AGILITY" as const,
        rawValue: 80,
        scoreDirection: "HIGHER_IS_BETTER" as const,
        thresholdA: 80, thresholdB: 60, thresholdC: 40, thresholdD: 20,
      },
    ];
    const result = calculateAssessmentEngine(items);
    expect(result.overallGrade).toBe(scoreToGrade(result.overallScore));
  });

  it("should handle COORDINATION component seamlessly without breaking calculation", () => {
    const items = [
      {
        testItemId: "t-coord-1",
        physicalComponent: "COORDINATION" as const,
        rawValue: 10,
        scoreDirection: "HIGHER_IS_BETTER" as const,
        thresholdA: 10,
      },
    ];
    const result = calculateAssessmentEngine(items);
    expect(result.componentScores["COORDINATION"]).toBe(100);
    expect(result.overallScore).toBe(100);
    expect(result.overallGrade).toBe("A");
    expect(result.bestComponent).toBe("COORDINATION");
  });
});

// ─── calculateProgressAssessmentEngine ───────────────────────────────────────

describe("calculateProgressAssessmentEngine()", () => {
  it("should mark trend as BASELINE when no previous test items are provided", () => {
    const currentItems = [
      {
        testItemId: "item-1",
        testItemName: "Push Up",
        unit: "REPETITION",
        scoreDirection: "HIGHER_IS_BETTER" as const,
        rawValue: 15,
      },
    ];
    const result = calculateProgressAssessmentEngine(currentItems);
    expect(result.totalItemsTested).toBe(1);
    expect(result.itemProgress[0].trend).toBe("BASELINE");
    expect(result.itemProgress[0].delta).toBeNull();
  });

  it("should correctly identify IMPROVED trend for HIGHER_IS_BETTER items", () => {
    const currentItems = [
      {
        testItemId: "item-1",
        testItemName: "Push Up",
        unit: "REPETITION",
        scoreDirection: "HIGHER_IS_BETTER" as const,
        rawValue: 20,
      },
    ];
    const previousItems = [{ testItemId: "item-1", rawValue: 15 }];
    const result = calculateProgressAssessmentEngine(currentItems, previousItems);
    expect(result.improvedCount).toBe(1);
    expect(result.itemProgress[0].delta).toBe(5);
    expect(result.itemProgress[0].trend).toBe("IMPROVED");
  });

  it("should correctly identify IMPROVED trend for LOWER_IS_BETTER timed items", () => {
    const currentItems = [
      {
        testItemId: "item-2",
        testItemName: "20m Sprint",
        unit: "SECOND",
        scoreDirection: "LOWER_IS_BETTER" as const,
        rawValue: 3.2,
      },
    ];
    const previousItems = [{ testItemId: "item-2", rawValue: 3.6 }];
    const result = calculateProgressAssessmentEngine(currentItems, previousItems);
    expect(result.improvedCount).toBe(1);
    expect(result.itemProgress[0].trend).toBe("IMPROVED");
    expect(result.itemProgress[0].delta).toBe(-0.4);
  });
});
