import { describe, it, expect } from "vitest";
import { calculatePersonalBest } from "../athlete-goals/engine";
import { calculateProgressAssessmentEngine } from "../assessments/engine";
import { calculateTrend } from "./engine";

describe("P8-C1: Personal Best Extraction & Tie-Breaking", () => {
  it("should return null for empty assessment results history", () => {
    const pb = calculatePersonalBest("HIGHER_IS_BETTER", []);
    expect(pb).toBeNull();
  });

  it("should extract maximum rawValue as PB for HIGHER_IS_BETTER items (e.g. Vertical Jump)", () => {
    const results = [
      { rawValue: 38, assessmentDate: new Date("2026-06-01"), assessmentId: "ass-1" },
      { rawValue: 44, assessmentDate: new Date("2026-07-01"), assessmentId: "ass-2" },
      { rawValue: 42, assessmentDate: new Date("2026-08-01"), assessmentId: "ass-3" },
    ];

    const pb = calculatePersonalBest("HIGHER_IS_BETTER", results);
    expect(pb).toBeDefined();
    expect(pb?.pbValue).toBe(44);
    expect(pb?.assessmentId).toBe("ass-2");
    expect(pb?.achievedDate).toEqual(new Date("2026-07-01"));
  });

  it("should extract minimum rawValue as PB for LOWER_IS_BETTER items (e.g. Sprint 20m)", () => {
    const results = [
      { rawValue: 4.82, assessmentDate: new Date("2026-06-01"), assessmentId: "ass-1" },
      { rawValue: 4.61, assessmentDate: new Date("2026-07-01"), assessmentId: "ass-2" },
      { rawValue: 4.49, assessmentDate: new Date("2026-08-01"), assessmentId: "ass-3" },
      { rawValue: 4.55, assessmentDate: new Date("2026-08-20"), assessmentId: "ass-4" },
    ];

    const pb = calculatePersonalBest("LOWER_IS_BETTER", results);
    expect(pb).toBeDefined();
    expect(pb?.pbValue).toBe(4.49);
    expect(pb?.assessmentId).toBe("ass-3");
    expect(pb?.achievedDate).toEqual(new Date("2026-08-01"));
  });

  it("should break ties deterministically by selecting the latest assessment date", () => {
    const results = [
      { rawValue: 4.50, assessmentDate: new Date("2026-05-01"), assessmentId: "ass-1" },
      { rawValue: 4.50, assessmentDate: new Date("2026-08-15"), assessmentId: "ass-2" },
    ];

    const pb = calculatePersonalBest("LOWER_IS_BETTER", results);
    expect(pb).toBeDefined();
    expect(pb?.pbValue).toBe(4.50);
    expect(pb?.assessmentId).toBe("ass-2");
    expect(pb?.achievedDate).toEqual(new Date("2026-08-15"));
  });
});

describe("P8-C2: Universal Progress Delta & Direction-Aware Trend Engine", () => {
  it("should mark first assessment as BASELINE with null delta and null percentChange", () => {
    const currentItems = [
      {
        testItemId: "item-sprint",
        testItemName: "Sprint 20m",
        unit: "SECOND",
        scoreDirection: "LOWER_IS_BETTER" as const,
        rawValue: 4.82,
      },
    ];

    const result = calculateProgressAssessmentEngine(currentItems, undefined);
    expect(result.totalItemsTested).toBe(1);
    expect(result.itemProgress[0].trend).toBe("BASELINE");
    expect(result.itemProgress[0].delta).toBeNull();
    expect(result.itemProgress[0].percentChange).toBeNull();
  });

  it("should accurately compute delta, % change, and IMPROVED trend for LOWER_IS_BETTER (Sprint 4.82s -> 4.49s)", () => {
    const currentItems = [
      {
        testItemId: "item-sprint",
        testItemName: "Sprint 20m",
        unit: "SECOND",
        scoreDirection: "LOWER_IS_BETTER" as const,
        rawValue: 4.49,
      },
    ];
    const previousItems = [
      {
        testItemId: "item-sprint",
        rawValue: 4.82,
      },
    ];

    const result = calculateProgressAssessmentEngine(currentItems, previousItems);
    const item = result.itemProgress[0];

    expect(item.delta).toBe(-0.33); // 4.49 - 4.82 = -0.33s
    expect(item.percentChange).toBeCloseTo(-6.8, 1);
    expect(item.trend).toBe("IMPROVED");
    expect(result.improvedCount).toBe(1);
  });

  it("should accurately compute delta, % change, and IMPROVED trend for HIGHER_IS_BETTER (Push-up 20 -> 24 reps)", () => {
    const currentItems = [
      {
        testItemId: "item-pushup",
        testItemName: "Push-up 1 Min",
        unit: "REPETITION",
        scoreDirection: "HIGHER_IS_BETTER" as const,
        rawValue: 24,
      },
    ];
    const previousItems = [
      {
        testItemId: "item-pushup",
        rawValue: 20,
      },
    ];

    const result = calculateProgressAssessmentEngine(currentItems, previousItems);
    const item = result.itemProgress[0];

    expect(item.delta).toBe(4);
    expect(item.percentChange).toBe(20.0);
    expect(item.trend).toBe("IMPROVED");
    expect(result.improvedCount).toBe(1);
  });

  it("should mark minimal changes within tolerance (delta <= 0.05) as STABLE", () => {
    const currentItems = [
      {
        testItemId: "item-sprint",
        testItemName: "Sprint 20m",
        unit: "SECOND",
        scoreDirection: "LOWER_IS_BETTER" as const,
        rawValue: 4.51,
      },
    ];
    const previousItems = [
      {
        testItemId: "item-sprint",
        rawValue: 4.50,
      },
    ];

    const result = calculateProgressAssessmentEngine(currentItems, previousItems);
    const item = result.itemProgress[0];

    expect(item.delta).toBe(0.01);
    expect(item.trend).toBe("STABLE");
    expect(result.stableCount).toBe(1);
  });

  it("should identify DECLINING metric accurately for HIGHER_IS_BETTER (Vertical Jump 44 -> 39 cm)", () => {
    const currentItems = [
      {
        testItemId: "item-vjump",
        testItemName: "Vertical Jump",
        unit: "CM",
        scoreDirection: "HIGHER_IS_BETTER" as const,
        rawValue: 39,
      },
    ];
    const previousItems = [
      {
        testItemId: "item-vjump",
        rawValue: 44,
      },
    ];

    const result = calculateProgressAssessmentEngine(currentItems, previousItems);
    const item = result.itemProgress[0];

    expect(item.delta).toBe(-5);
    expect(item.percentChange).toBeCloseTo(-11.4, 1);
    expect(item.trend).toBe("DECLINING");
    expect(result.decliningCount).toBe(1);
  });

  it("should identify DECLINING metric accurately for LOWER_IS_BETTER (Sprint 4.49 -> 4.75 s)", () => {
    const currentItems = [
      {
        testItemId: "item-sprint",
        testItemName: "Sprint 20m",
        unit: "SECOND",
        scoreDirection: "LOWER_IS_BETTER" as const,
        rawValue: 4.75,
      },
    ];
    const previousItems = [
      {
        testItemId: "item-sprint",
        rawValue: 4.49,
      },
    ];

    const result = calculateProgressAssessmentEngine(currentItems, previousItems);
    const item = result.itemProgress[0];

    expect(item.delta).toBe(0.26);
    expect(item.trend).toBe("DECLINING");
    expect(result.decliningCount).toBe(1);
  });
});

describe("P8-C: Overall Score Trend Analysis", () => {
  it("should calculate trend as IMPROVING when score increases by >= 0.5 points", () => {
    expect(calculateTrend(85.5, 80.0)).toBe("IMPROVING");
    expect(calculateTrend(75.5, 75.0)).toBe("IMPROVING");
  });

  it("should calculate trend as STABLE when score difference is less than 0.5 points", () => {
    expect(calculateTrend(80.2, 80.0)).toBe("STABLE");
    expect(calculateTrend(75.0, 75.4)).toBe("STABLE");
  });

  it("should calculate trend as DECLINING when score decreases by >= 0.5 points", () => {
    expect(calculateTrend(78.0, 80.0)).toBe("DECLINING");
    expect(calculateTrend(70.0, 75.0)).toBe("DECLINING");
  });

  it("should return INSUFFICIENT_DATA when either score is null", () => {
    expect(calculateTrend(85.0, null)).toBe("INSUFFICIENT_DATA");
    expect(calculateTrend(null, 80.0)).toBe("INSUFFICIENT_DATA");
    expect(calculateTrend(null, null)).toBe("INSUFFICIENT_DATA");
  });
});
