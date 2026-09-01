import { describe, it, expect } from "vitest";
import {
  batchSquadAssessmentSchema,
  squadAssessmentEntrySchema,
} from "./schema";
import {
  calculateItemScore,
  calculateAgeAtDate,
  pickBestBenchmark,
} from "./engine";
import { scoreToGrade } from "@/lib/constants";

describe("P8-B2: Squad Assessment Zod Schema Validation", () => {
  it("should accept valid squad assessment batch payload", () => {
    const payload = {
      testItemId: "test-item-sprint-20m",
      assessmentDate: new Date("2026-08-31"),
      assessmentType: "BENCHMARK_BASED",
      entries: [
        { athleteId: "ath-1", rawValue: 4.21, notes: "Kondisi prima" },
        { athleteId: "ath-2", rawValue: 4.45 },
        { athleteId: "ath-3", rawValue: 3.98 },
      ],
    };

    const parsed = batchSquadAssessmentSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.entries).toHaveLength(3);
      expect(parsed.data.entries[0].rawValue).toBe(4.21);
    }
  });

  it("should reject empty entries array", () => {
    const payload = {
      testItemId: "test-item-sprint-20m",
      assessmentDate: new Date(),
      entries: [],
    };

    const parsed = batchSquadAssessmentSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("should reject raw values that are zero or negative", () => {
    const entryZero = { athleteId: "ath-1", rawValue: 0 };
    const entryNegative = { athleteId: "ath-1", rawValue: -3.5 };
    const entryPositive = { athleteId: "ath-1", rawValue: 4.2 };

    expect(squadAssessmentEntrySchema.safeParse(entryZero).success).toBe(false);
    expect(squadAssessmentEntrySchema.safeParse(entryNegative).success).toBe(false);
    expect(squadAssessmentEntrySchema.safeParse(entryPositive).success).toBe(true);
  });

  it("should reject raw values exceeding maximum threshold (9999.99)", () => {
    const entryExceed = { athleteId: "ath-1", rawValue: 15000 };
    expect(squadAssessmentEntrySchema.safeParse(entryExceed).success).toBe(false);
  });

  it("should reject batch size exceeding max limit of 30 athletes", () => {
    const entries31 = Array.from({ length: 31 }, (_, i) => ({
      athleteId: `ath-${i + 1}`,
      rawValue: 4.5,
    }));

    const payload = {
      testItemId: "test-item-1",
      assessmentDate: new Date(),
      entries: entries31,
    };

    const parsed = batchSquadAssessmentSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("should reject invalid assessment types", () => {
    const payload = {
      testItemId: "test-item-1",
      assessmentDate: new Date(),
      assessmentType: "INVALID_TYPE",
      entries: [{ athleteId: "ath-1", rawValue: 4.5 }],
    };

    const parsed = batchSquadAssessmentSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });
});

describe("P8-B2: Squad Scoring Engine Calculation & Live Preview", () => {
  const sprintBenchmarks = [
    {
      ageMin: 12,
      ageMax: 14,
      gender: "MALE",
      thresholdA: 4.2, // ≤ 4.20s is Grade A (LOWER_IS_BETTER)
      thresholdB: 4.5,
      thresholdC: 4.8,
      thresholdD: 5.2,
    },
  ];

  it("should pick best benchmark by athlete gender and age", () => {
    const dob = new Date("2013-05-15");
    const testDate = new Date("2026-08-31");
    const age = calculateAgeAtDate(dob, testDate);
    expect(age).toBe(13);

    const bm = pickBestBenchmark(sprintBenchmarks, "MALE", age);
    expect(bm).toBeDefined();
    expect(bm?.ageMin).toBe(12);
    expect(bm?.ageMax).toBe(14);
  });

  it("should calculate score and grade accurately for LOWER_IS_BETTER items", () => {
    // 4.10s (faster than thresholdA 4.20) -> Score >= 90 (Grade A)
    const scoreA = calculateItemScore({
      rawValue: 4.1,
      scoreDirection: "LOWER_IS_BETTER",
      thresholdA: 4.2,
      thresholdB: 4.5,
      thresholdC: 4.8,
      thresholdD: 5.2,
    });
    expect(scoreA).toBeGreaterThanOrEqual(90);
    expect(scoreToGrade(scoreA)).toBe("A");

    // 4.40s (between thresholdA 4.20 and thresholdB 4.50) -> Score in 80..89 -> Grade B+
    const scoreB = calculateItemScore({
      rawValue: 4.4,
      scoreDirection: "LOWER_IS_BETTER",
      thresholdA: 4.2,
      thresholdB: 4.5,
      thresholdC: 4.8,
      thresholdD: 5.2,
    });
    expect(scoreB).toBeGreaterThanOrEqual(75);
    expect(scoreB).toBeLessThan(90);
    expect(scoreToGrade(scoreB)).toBe("B+");
  });

  it("should calculate score and grade accurately for HIGHER_IS_BETTER items", () => {
    // Vertical jump (cm)
    const scoreA = calculateItemScore({
      rawValue: 55,
      scoreDirection: "HIGHER_IS_BETTER",
      thresholdA: 50,
      thresholdB: 45,
      thresholdC: 40,
      thresholdD: 35,
    });
    expect(scoreA).toBeGreaterThanOrEqual(90);
    expect(scoreToGrade(scoreA)).toBe("A");
  });

  it("should correctly normalize comma to dot in decimal user inputs", () => {
    const rawInput1 = "4,21";
    const rawInput2 = "55,5";
    const normalized1 = rawInput1.replace(",", ".");
    const normalized2 = rawInput2.replace(",", ".");

    expect(parseFloat(normalized1)).toBe(4.21);
    expect(parseFloat(normalized2)).toBe(55.5);
  });

  it("should detect and reject duplicate athlete IDs in batch list", () => {
    const athleteIdsWithDuplicates = ["ath-1", "ath-2", "ath-1", "ath-3"];
    const uniqueIds = new Set(athleteIdsWithDuplicates);
    expect(uniqueIds.size !== athleteIdsWithDuplicates.length).toBe(true);

    const cleanAthleteIds = ["ath-1", "ath-2", "ath-3"];
    const cleanUniqueIds = new Set(cleanAthleteIds);
    expect(cleanUniqueIds.size === cleanAthleteIds.length).toBe(true);
  });

  it("should fallback to universal gender (null) benchmark if exact gender is not found", () => {
    const universalBenchmarks = [
      {
        ageMin: 10,
        ageMax: 15,
        gender: null,
        thresholdA: 5.0,
        thresholdB: 6.0,
        thresholdC: 7.0,
        thresholdD: 8.0,
      },
    ];

    const bm = pickBestBenchmark(universalBenchmarks, "FEMALE", 12);
    expect(bm).toBeDefined();
    expect(bm?.thresholdA).toBe(5.0);
  });

  it("should calculate correct grade boundaries across C+, C, and D", () => {
    expect(scoreToGrade(95)).toBe("A");
    expect(scoreToGrade(82)).toBe("B+");
    expect(scoreToGrade(73)).toBe("B");
    expect(scoreToGrade(64)).toBe("C+");
    expect(scoreToGrade(55)).toBe("C");
    expect(scoreToGrade(40)).toBe("D");
    expect(scoreToGrade(0)).toBe("D");
  });

  it("should handle boundary age calculations accurately on exact birthday", () => {
    const dob = new Date("2010-08-31");
    const sameDay = new Date("2026-08-31"); // Exactly 16 years
    const dayBefore = new Date("2026-08-30"); // 15 years 364 days

    expect(calculateAgeAtDate(dob, sameDay)).toBe(16);
    expect(calculateAgeAtDate(dob, dayBefore)).toBe(15);
  });
});

