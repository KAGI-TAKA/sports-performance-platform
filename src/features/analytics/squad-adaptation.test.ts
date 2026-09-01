import { describe, it, expect } from "vitest";
import {
  computeSquadAdaptationSummary,
  resolveSquadAdaptationalInsights,
  type RawAthleteAssessmentForSquad,
  type SquadComponentAdaptation,
} from "./squad-adaptation-engine";

describe("P8-C5: Squad Adaptational Insight Engine", () => {
  const now = new Date("2026-08-31T00:00:00.000Z");
  const currentStart = new Date("2026-08-01T00:00:00.000Z");
  const previousStart = new Date("2026-07-01T00:00:00.000Z");

  const createMockAthlete = (
    id: string,
    fullName: string,
    currentScores?: Record<string, number>,
    previousScores?: Record<string, number>
  ): RawAthleteAssessmentForSquad => {
    const assessments: RawAthleteAssessmentForSquad["assessments"] = [];

    if (previousScores) {
      assessments.push({
        id: `ass-prev-${id}`,
        assessmentDate: new Date("2026-07-15T00:00:00.000Z"),
        overallScore: 78.0,
        analysis: { componentScores: previousScores },
      });
    }

    if (currentScores) {
      assessments.push({
        id: `ass-curr-${id}`,
        assessmentDate: new Date("2026-08-15T00:00:00.000Z"),
        overallScore: 82.5,
        analysis: { componentScores: currentScores },
      });
    }

    return { id, fullName, assessments };
  };

  it("should enforce Anti-Domination: count only the latest assessment per athlete per period", () => {
    const hyperAssessedAthlete: RawAthleteAssessmentForSquad = {
      id: "ath-1",
      fullName: "Atlet Sering Tes",
      assessments: [
        {
          id: "ass-1",
          assessmentDate: new Date("2026-08-02T00:00:00.000Z"),
          overallScore: 70,
          analysis: { componentScores: { SPEED: 70 } },
        },
        {
          id: "ass-2",
          assessmentDate: new Date("2026-08-10T00:00:00.000Z"),
          overallScore: 75,
          analysis: { componentScores: { SPEED: 75 } },
        },
        {
          id: "ass-3",
          assessmentDate: new Date("2026-08-25T00:00:00.000Z"), // Latest
          overallScore: 90,
          analysis: { componentScores: { SPEED: 90 } },
        },
      ],
    };

    const regularAthlete = createMockAthlete("ath-2", "Atlet Reguler", { SPEED: 80 });

    const summary = computeSquadAdaptationSummary(
      [hyperAssessedAthlete, regularAthlete],
      currentStart,
      previousStart,
      now
    );

    const speedComp = summary.components.find((c) => c.component === "SPEED");
    expect(speedComp).toBeDefined();
    // Average of latest values: (90 + 80) / 2 = 85.0
    expect(speedComp?.currentAverageScore).toBe(85.0);
    expect(speedComp?.assessedCount).toBe(2);
  });

  it("should calculate correct delta and trend when previous period data exists", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 85, POWER: 80 }, { SPEED: 80, POWER: 80 }),
      createMockAthlete("ath-2", "A2", { SPEED: 85, POWER: 82 }, { SPEED: 80, POWER: 84 }),
      createMockAthlete("ath-3", "A3", { SPEED: 90, POWER: 75 }, { SPEED: 80, POWER: 79 }),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);

    const speedComp = summary.components.find((c) => c.component === "SPEED");
    expect(speedComp?.currentAverageScore).toBe(86.7);
    expect(speedComp?.previousAverageScore).toBe(80.0);
    expect(speedComp?.delta).toBe(6.7);
    expect(speedComp?.trend).toBe("IMPROVING");

    const powerComp = summary.components.find((c) => c.component === "POWER");
    expect(powerComp?.currentAverageScore).toBe(79.0);
    expect(powerComp?.previousAverageScore).toBe(81.0);
    expect(powerComp?.delta).toBe(-2.0);
    expect(powerComp?.trend).toBe("DECLINING");
  });

  it("should classify trend as STABLE when absolute delta is less than 1.0", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { AGILITY: 80.5 }, { AGILITY: 80.0 }),
      createMockAthlete("ath-2", "A2", { AGILITY: 79.8 }, { AGILITY: 80.0 }),
      createMockAthlete("ath-3", "A3", { AGILITY: 80.2 }, { AGILITY: 80.0 }),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    const agilityComp = summary.components.find((c) => c.component === "AGILITY");

    expect(agilityComp?.delta).toBe(0.2);
    expect(agilityComp?.trend).toBe("STABLE");
  });

  it("should trigger INSUFFICIENT_SAMPLE when assessed athlete count is less than 3", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 80 }),
      createMockAthlete("ath-2", "A2", { SPEED: 85 }),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    expect(summary.assessedAthletesCount).toBe(2);
    expect(summary.dataQualityStatus).toBe("INSUFFICIENT_SAMPLE");
    expect(summary.actionableInsights.what).toContain("tahap awal pengumpulan");
  });

  it("should trigger LOW_COVERAGE when assessed athlete count >= 3 but coverage < 50%", () => {
    // 3 assessed out of 10 total athletes = 30% coverage
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 80 }),
      createMockAthlete("ath-2", "A2", { SPEED: 85 }),
      createMockAthlete("ath-3", "A3", { SPEED: 90 }),
      createMockAthlete("ath-4", "A4"),
      createMockAthlete("ath-5", "A5"),
      createMockAthlete("ath-6", "A6"),
      createMockAthlete("ath-7", "A7"),
      createMockAthlete("ath-8", "A8"),
      createMockAthlete("ath-9", "A9"),
      createMockAthlete("ath-10", "A10"),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    expect(summary.assessedAthletesCount).toBe(3);
    expect(summary.totalAthletesCount).toBe(10);
    expect(summary.coveragePercentage).toBe(30);
    expect(summary.dataQualityStatus).toBe("LOW_COVERAGE");
    expect(summary.actionableInsights.what).toContain("di bawah 50%");
  });

  it("should trigger ROBUST_DATA when assessed athlete count >= 3 and coverage >= 50%", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 80 }, { SPEED: 75 }),
      createMockAthlete("ath-2", "A2", { SPEED: 85 }, { SPEED: 80 }),
      createMockAthlete("ath-3", "A3", { SPEED: 90 }, { SPEED: 85 }),
      createMockAthlete("ath-4", "A4", { SPEED: 88 }, { SPEED: 82 }),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    expect(summary.assessedAthletesCount).toBe(4);
    expect(summary.totalAthletesCount).toBe(4);
    expect(summary.coveragePercentage).toBe(100);
    expect(summary.dataQualityStatus).toBe("ROBUST_DATA");
    expect(summary.strongestAdaptiveComponent).toBe("Kecepatan (Speed)");
  });

  it("should generate WHAT-WHY-ACTION actionable coaching recommendations", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 85, FLEXIBILITY: 60 }, { SPEED: 80, FLEXIBILITY: 65 }),
      createMockAthlete("ath-2", "A2", { SPEED: 90, FLEXIBILITY: 62 }, { SPEED: 82, FLEXIBILITY: 64 }),
      createMockAthlete("ath-3", "A3", { SPEED: 88, FLEXIBILITY: 61 }, { SPEED: 81, FLEXIBILITY: 63 }),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);

    expect(summary.actionableInsights.what).toContain("Kecepatan (Speed)");
    expect(summary.actionableInsights.why).toContain("3 atlet (100% skuad)");
    expect(summary.actionableInsights.action).toContain("Pertahankan stimulus latihan");
    expect(summary.actionableInsights.action).toContain("Fleksibilitas");
  });

  it("should never contain punitive, shaming, or leaderboard language in any insight text", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 60 }, { SPEED: 80 }),
      createMockAthlete("ath-2", "A2", { SPEED: 55 }, { SPEED: 75 }),
      createMockAthlete("ath-3", "A3", { SPEED: 50 }, { SPEED: 70 }),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    const textAll = `${summary.actionableInsights.what} ${summary.actionableInsights.why} ${summary.actionableInsights.action}`;

    expect(textAll).not.toContain("terburuk");
    expect(textAll).not.toContain("kalah");
    expect(textAll).not.toContain("pemenang");
    expect(textAll).not.toContain("ranking");
    expect(textAll).not.toContain("weakest");
    expect(textAll).not.toContain("loser");
  });

  it("should handle empty athlete list gracefully without NaN or division by zero", () => {
    const summary = computeSquadAdaptationSummary([], currentStart, previousStart, now);

    expect(summary.totalAthletesCount).toBe(0);
    expect(summary.assessedAthletesCount).toBe(0);
    expect(summary.coveragePercentage).toBe(0);
    expect(summary.dataQualityStatus).toBe("INSUFFICIENT_SAMPLE");

    summary.components.forEach((c) => {
      expect(c.currentAverageScore).toBeNull();
      expect(c.previousAverageScore).toBeNull();
      expect(c.delta).toBeNull();
      expect(c.trend).toBe("INSUFFICIENT_DATA");
    });
  });

  it("should handle athletes with no completed assessments gracefully", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1"),
      createMockAthlete("ath-2", "A2"),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    expect(summary.assessedAthletesCount).toBe(0);
    expect(summary.coveragePercentage).toBe(0);
    expect(summary.dataQualityStatus).toBe("INSUFFICIENT_SAMPLE");
  });

  it("should ignore assessments with future dates outside currentEnd", () => {
    const futureDate = new Date("2026-09-15T00:00:00.000Z");
    const futureAthlete: RawAthleteAssessmentForSquad = {
      id: "ath-fut",
      fullName: "Atlet Masa Depan",
      assessments: [
        {
          id: "ass-fut",
          assessmentDate: futureDate,
          overallScore: 99,
          analysis: { componentScores: { SPEED: 99 } },
        },
      ],
    };

    const summary = computeSquadAdaptationSummary([futureAthlete], currentStart, previousStart, now);
    expect(summary.assessedAthletesCount).toBe(0);
  });

  it("should calculate correct athlete distribution (improving, stable, declining)", () => {
    const athletes = [
      // Improving: 85 - 80 = +5.0 >= +0.5
      createMockAthlete("ath-1", "A1", { SPEED: 85 }, { SPEED: 80 }),
      // Declining: 75 - 80 = -5.0 <= -0.5
      {
        id: "ath-2",
        fullName: "A2",
        assessments: [
          {
            id: "ass-p2",
            assessmentDate: new Date("2026-07-15T00:00:00.000Z"),
            overallScore: 80.0,
            analysis: { componentScores: { SPEED: 80 } },
          },
          {
            id: "ass-c2",
            assessmentDate: new Date("2026-08-15T00:00:00.000Z"),
            overallScore: 75.0,
            analysis: { componentScores: { SPEED: 75 } },
          },
        ],
      },
      // Stable: 80.2 - 80.0 = +0.2 < +0.5
      {
        id: "ath-3",
        fullName: "A3",
        assessments: [
          {
            id: "ass-p3",
            assessmentDate: new Date("2026-07-15T00:00:00.000Z"),
            overallScore: 80.0,
            analysis: { componentScores: { SPEED: 80 } },
          },
          {
            id: "ass-c3",
            assessmentDate: new Date("2026-08-15T00:00:00.000Z"),
            overallScore: 80.2,
            analysis: { componentScores: { SPEED: 80.2 } },
          },
        ],
      },
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    expect(summary.squadDistribution.improvingCount).toBe(1);
    expect(summary.squadDistribution.decliningCount).toBe(1);
    expect(summary.squadDistribution.stableCount).toBe(1);
  });

  it("should support custom period duration dynamically", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 85 }),
      createMockAthlete("ath-2", "A2", { SPEED: 85 }),
      createMockAthlete("ath-3", "A3", { SPEED: 85 }),
    ];

    const customStart = new Date("2026-08-10T00:00:00.000Z");
    const summary = computeSquadAdaptationSummary(athletes, customStart, previousStart, now);
    expect(summary.assessedAthletesCount).toBe(3);
  });

  it("should correctly handle partial component assessments across athletes", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 80 }), // only SPEED
      createMockAthlete("ath-2", "A2", { POWER: 90 }), // only POWER
      createMockAthlete("ath-3", "A3", { SPEED: 84, POWER: 86 }), // both
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);

    const speedComp = summary.components.find((c) => c.component === "SPEED");
    expect(speedComp?.assessedCount).toBe(2);
    expect(speedComp?.currentAverageScore).toBe(82.0);

    const powerComp = summary.components.find((c) => c.component === "POWER");
    expect(powerComp?.assessedCount).toBe(2);
    expect(powerComp?.currentAverageScore).toBe(88.0);
  });

  it("should preserve periodLabel and date strings in ISO format", () => {
    const summary = computeSquadAdaptationSummary([], currentStart, previousStart, now);
    expect(summary.periodLabel).toBe("30 Hari Terakhir vs 30 Hari Sebelumnya");
    expect(summary.startDate).toBe("2026-08-01");
    expect(summary.endDate).toBe("2026-08-31");
  });

  it("should handle parseComponentScores JSON string input cleanly in squad engine", () => {
    const athleteWithJson: RawAthleteAssessmentForSquad = {
      id: "ath-json",
      fullName: "Atlet JSON",
      assessments: [
        {
          id: "ass-json",
          assessmentDate: new Date("2026-08-10T00:00:00.000Z"),
          overallScore: 88,
          analysis: {
            componentScores: JSON.stringify({ SPEED: 92, AGILITY: 88 }),
          },
        },
      ],
    };

    const summary = computeSquadAdaptationSummary(
      [athleteWithJson, createMockAthlete("ath-2", "A2", { SPEED: 88 }), createMockAthlete("ath-3", "A3", { SPEED: 90 })],
      currentStart,
      previousStart,
      now
    );

    const speed = summary.components.find((c) => c.component === "SPEED");
    expect(speed?.currentAverageScore).toBe(90.0);
  });

  it("should handle resolveSquadAdaptationalInsights directly with customized component inputs", () => {
    const mockComponents: SquadComponentAdaptation[] = [
      {
        component: "POWER",
        componentNameID: "Daya Ledak (Power)",
        currentAverageScore: 85,
        previousAverageScore: 80,
        delta: 5,
        trend: "IMPROVING",
        assessedCount: 10,
      },
      {
        component: "FLEXIBILITY",
        componentNameID: "Fleksibilitas",
        currentAverageScore: 60,
        previousAverageScore: 65,
        delta: -5,
        trend: "DECLINING",
        assessedCount: 10,
      },
    ];

    const result = resolveSquadAdaptationalInsights(
      mockComponents,
      "ROBUST_DATA",
      10,
      10,
      100
    );

    expect(result.strongestAdaptiveComponent).toBe("Daya Ledak (Power)");
    expect(result.focusDevelopmentComponent).toBe("Fleksibilitas");
    expect(result.actionableInsights.what).toContain("Daya Ledak (Power)");
  });

  it("should correctly identify focusDevelopmentComponent when multiple components decline", () => {
    const mockComponents: SquadComponentAdaptation[] = [
      {
        component: "SPEED",
        componentNameID: "Kecepatan (Speed)",
        currentAverageScore: 80,
        previousAverageScore: 78,
        delta: 2,
        trend: "IMPROVING",
        assessedCount: 5,
      },
      {
        component: "POWER",
        componentNameID: "Daya Ledak (Power)",
        currentAverageScore: 75,
        previousAverageScore: 78,
        delta: -3,
        trend: "DECLINING",
        assessedCount: 5,
      },
      {
        component: "FLEXIBILITY",
        componentNameID: "Fleksibilitas",
        currentAverageScore: 60,
        previousAverageScore: 68,
        delta: -8, // lowest
        trend: "DECLINING",
        assessedCount: 5,
      },
    ];

    const result = resolveSquadAdaptationalInsights(
      mockComponents,
      "ROBUST_DATA",
      5,
      5,
      100
    );

    expect(result.focusDevelopmentComponent).toBe("Fleksibilitas");
  });

  it("should handle athlete assessments with null or missing overallScore gracefully", () => {
    const athletes: RawAthleteAssessmentForSquad[] = [
      {
        id: "ath-null-score",
        fullName: "Atlet Skor Null",
        assessments: [
          {
            id: "ass-1",
            assessmentDate: new Date("2026-08-10T00:00:00.000Z"),
            overallScore: null,
            analysis: { componentScores: { SPEED: 80 } },
          },
        ],
      },
      createMockAthlete("ath-2", "A2", { SPEED: 85 }),
      createMockAthlete("ath-3", "A3", { SPEED: 90 }),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    expect(summary.assessedAthletesCount).toBe(3);
    expect(summary.squadDistribution.stableCount).toBe(3);
  });

  it("should correctly populate all 7 physical components in summary", () => {
    const athletes = [
      createMockAthlete("ath-1", "A1", { SPEED: 80 }),
      createMockAthlete("ath-2", "A2", { SPEED: 85 }),
      createMockAthlete("ath-3", "A3", { SPEED: 90 }),
    ];

    const summary = computeSquadAdaptationSummary(athletes, currentStart, previousStart, now);
    expect(summary.components.length).toBe(7);

    const names = summary.components.map((c) => c.componentNameID);
    expect(names).toContain("Fleksibilitas");
    expect(names).toContain("Kecepatan (Speed)");
    expect(names).toContain("Daya Ledak (Power)");
    expect(names).toContain("Kelincahan (Agility)");
    expect(names).toContain("Daya Tahan Otot");
    expect(names).toContain("Daya Tahan Anaerobik");
    expect(names).toContain("Daya Tahan Aerobik");
  });

  it("should tie-break components deterministically when deltas are identical", () => {
    const mockComponents: SquadComponentAdaptation[] = [
      {
        component: "SPEED",
        componentNameID: "Kecepatan (Speed)",
        currentAverageScore: 85,
        previousAverageScore: 80,
        delta: 5,
        trend: "IMPROVING",
        assessedCount: 5,
      },
      {
        component: "POWER",
        componentNameID: "Daya Ledak (Power)",
        currentAverageScore: 85,
        previousAverageScore: 80,
        delta: 5,
        trend: "IMPROVING",
        assessedCount: 5,
      },
    ];

    const result = resolveSquadAdaptationalInsights(
      mockComponents,
      "ROBUST_DATA",
      5,
      5,
      100
    );

    // Alphabetical tie-breaker: POWER comes before SPEED
    expect(result.strongestAdaptiveComponent).toBe("Daya Ledak (Power)");
  });

  it("should produce a clean DTO without leaking raw DB or private models", () => {
    const summary = computeSquadAdaptationSummary([], currentStart, previousStart, now);
    const serialized = JSON.stringify(summary);

    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("healthNotes");
    expect(serialized).not.toContain("internalCoachNotes");
  });
});
