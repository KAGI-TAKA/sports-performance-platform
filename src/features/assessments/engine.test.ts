import { describe, it, expect } from "vitest";
import {
  calculateItemScore,
  calculateAssessmentEngine,
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

// ─── calculateItemScore — HIGHER_IS_BETTER ───────────────────────────────────

describe("calculateItemScore() — HIGHER_IS_BETTER", () => {
  const baseItem = {
    testItemId: "test-1",
    physicalComponent: "SPEED" as const,
    scoreDirection: "HIGHER_IS_BETTER" as const,
    thresholdA: 80,
    thresholdB: 60,
    thresholdC: 40,
    thresholdD: 20,
  };

  it("should return >= 90 when rawValue >= thresholdA", () => {
    const score = calculateItemScore({ ...baseItem, rawValue: 80 });
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it("should return continuous interpolated score between thresholdB and thresholdA", () => {
    const score = calculateItemScore({ ...baseItem, rawValue: 70 });
    expect(score).toBeGreaterThanOrEqual(75);
    expect(score).toBeLessThan(90);
  });

  it("should clamp scores strictly between 0 and 100", () => {
    expect(calculateItemScore({ ...baseItem, rawValue: 999 })).toBeLessThanOrEqual(100);
    expect(calculateItemScore({ ...baseItem, rawValue: -50 })).toBeGreaterThanOrEqual(0);
  });

  it("should return 0 for invalid numbers like NaN or Infinity", () => {
    expect(calculateItemScore({ ...baseItem, rawValue: NaN })).toBe(0);
    expect(calculateItemScore({ ...baseItem, rawValue: Infinity })).toBe(0);
  });
});

// ─── calculateItemScore — LOWER_IS_BETTER ────────────────────────────────────

describe("calculateItemScore() — LOWER_IS_BETTER", () => {
  const timedItem = {
    testItemId: "test-2",
    physicalComponent: "SPEED" as const,
    scoreDirection: "LOWER_IS_BETTER" as const,
    thresholdA: 5,   // 5 detik = Grade A
    thresholdB: 7,
    thresholdC: 9,
    thresholdD: 11,
  };

  it("should return >= 90 when rawValue <= thresholdA (very fast)", () => {
    const score = calculateItemScore({ ...timedItem, rawValue: 5 });
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it("should return lower score when rawValue is higher (slow)", () => {
    const fastScore = calculateItemScore({ ...timedItem, rawValue: 5 });
    const slowScore = calculateItemScore({ ...timedItem, rawValue: 15 });
    expect(fastScore).toBeGreaterThan(slowScore);
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
});
