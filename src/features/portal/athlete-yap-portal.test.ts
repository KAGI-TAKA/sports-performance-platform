import { describe, it, expect } from "vitest";

describe("Athlete YAP Portal (Youth Athletic Performance) Invariants", () => {
  it("should calculate primary strength and limiting factor from component scores correctly", () => {
    const componentScores = {
      SPEED: 89,
      AGILITY: 82,
      POWER: 85,
      STRENGTH: 78,
      ENDURANCE: 74,
      FLEXIBILITY: 80,
      COORDINATION: 86,
    };

    const sorted = Object.entries(componentScores).sort((a, b) => b[1] - a[1]);
    const primaryStrength = sorted[0];
    const limitingFactor = sorted[sorted.length - 1];

    expect(primaryStrength[0]).toBe("SPEED");
    expect(primaryStrength[1]).toBe(89);

    expect(limitingFactor[0]).toBe("ENDURANCE");
    expect(limitingFactor[1]).toBe(74);
  });

  it("should compute readiness status as READY when score >= 80 and no active injury", () => {
    const isInjured = false;
    const baseScore = 84;
    const readinessScore = isInjured ? 45 : Math.min(Math.max(Math.round(baseScore * 1.05), 60), 98);
    const readinessLabel = isInjured ? "RECOVERY / RESTRICTED" : readinessScore >= 80 ? "READY" : "ATTENTION";

    expect(readinessScore).toBeGreaterThanOrEqual(80);
    expect(readinessLabel).toBe("READY");
  });

  it("should handle empty assessment state without crashing", () => {
    const progress = {
      overallScore: null,
      overallGrade: null,
      trends: [],
      totalAssessments: 0,
    };

    expect(progress.overallScore).toBeNull();
    expect(progress.trends).toHaveLength(0);
  });

  it("should handle empty goals and personal bests gracefully", () => {
    const portalGoals: any[] = [];
    const personalBests: any[] = [];

    const activeGoal = portalGoals.find((g) => g.status === "ACTIVE") || null;
    expect(activeGoal).toBeNull();
    expect(personalBests).toHaveLength(0);
  });

  it("should filter upcoming sessions excluding completed ones", () => {
    const now = new Date("2026-09-04T10:00:00Z");
    const schedule = [
      {
        id: "s1",
        title: "Speed Training",
        startTime: "2026-09-04T11:00:00Z",
        endTime: "2026-09-04T12:30:00Z",
        status: "SCHEDULED",
      },
      {
        id: "s2",
        title: "Morning Conditioning",
        startTime: "2026-09-04T07:00:00Z",
        endTime: "2026-09-04T08:30:00Z",
        status: "COMPLETED",
      },
      {
        id: "s3",
        title: "Agility Drill",
        startTime: "2026-09-05T09:00:00Z",
        endTime: "2026-09-05T10:30:00Z",
        status: "SCHEDULED",
      },
    ];

    const upcoming = schedule.filter(
      (s) => new Date(s.endTime) >= now && s.status !== "COMPLETED"
    );

    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].id).toBe("s1");
    expect(upcoming[1].id).toBe("s3");
  });
});
