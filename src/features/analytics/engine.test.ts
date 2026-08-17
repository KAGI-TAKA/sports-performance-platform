import { describe, it, expect } from "vitest";
import {
  calculateTrend,
  calculateAthleteProgress,
  calculateHeadToHeadComparison,
  calculateOrganizationReport,
  filterRecordsByPeriod,
} from "./engine";

describe("Analytics Engine Domain Unit Tests", () => {
  const dummyAthleteActive = { id: "ath-1", fullName: "Budi Santoso", isActive: true };
  const dummyAthleteInactive = { id: "ath-2", fullName: "Siti Rahma", isActive: false };

  it("1. calculates overall progress delta correctly", () => {
    const assessments = [
      { id: "a1", assessmentDate: new Date("2026-01-01"), overallScore: 70, overallGrade: "B" },
      { id: "a2", assessmentDate: new Date("2026-02-01"), overallScore: 85, overallGrade: "B+" },
    ];
    const res = calculateAthleteProgress(dummyAthleteActive, assessments);
    expect(res.overallDelta).toBe(15);
    expect(res.overallPercentageChange).toBeCloseTo(21.428, 2);
  });

  it("2. classifies positive progress (IMPROVING)", () => {
    expect(calculateTrend(85, 70)).toBe("IMPROVING");
  });

  it("3. classifies negative progress (DECLINING)", () => {
    expect(calculateTrend(60, 75)).toBe("DECLINING");
  });

  it("4. classifies stable progress (STABLE for delta < 0.5)", () => {
    expect(calculateTrend(75.2, 75.0)).toBe("STABLE");
  });

  it("5. classifies insufficient data (INSUFFICIENT_DATA)", () => {
    expect(calculateTrend(80, null)).toBe("INSUFFICIENT_DATA");
    expect(calculateTrend(null, 70)).toBe("INSUFFICIENT_DATA");
  });

  it("6. performs 7-component head-to-head comparison correctly", () => {
    const assA = {
      id: "a1",
      assessmentDate: new Date("2026-02-01"),
      overallScore: 88,
      overallGrade: "B+",
      analysis: {
        componentScores: { SPEED: 90, POWER: 85 },
      },
    };
    const assB = {
      id: "b1",
      assessmentDate: new Date("2026-02-01"),
      overallScore: 78,
      overallGrade: "B",
      analysis: {
        componentScores: { SPEED: 80, POWER: 92 },
      },
    };

    const compRes = calculateHeadToHeadComparison(
      { id: "a", fullName: "Athlete A", position: "FORWARD", jerseyNumber: 10, isActive: true },
      { id: "b", fullName: "Athlete B", position: "DEFENDER", jerseyNumber: 4, isActive: true },
      assA,
      assB
    );

    expect(compRes.scoreLeader).toBe("A");
    const speedComp = compRes.componentAdvantages.find((c) => c.component === "SPEED");
    expect(speedComp?.advantage).toBe("A");
    const powerComp = compRes.componentAdvantages.find((c) => c.component === "POWER");
    expect(powerComp?.advantage).toBe("B");
  });

  it("7. handles missing component scores safely", () => {
    const assA = {
      id: "a1",
      assessmentDate: new Date("2026-02-01"),
      overallScore: 80,
      overallGrade: "B+",
      analysis: null,
    };
    const res = calculateAthleteProgress(dummyAthleteActive, [assA]);
    expect(res.latestScore).toBe(80);
    expect(res.currentBestComponent).toBeNull();
  });

  it("8. identifies strongest improving component", () => {
    const assessments = [
      {
        id: "a1",
        assessmentDate: new Date("2026-01-01"),
        overallScore: 70,
        overallGrade: "B",
        analysis: { componentScores: { SPEED: 60, POWER: 70 } },
      },
      {
        id: "a2",
        assessmentDate: new Date("2026-02-01"),
        overallScore: 85,
        overallGrade: "B+",
        analysis: { componentScores: { SPEED: 90, POWER: 75 } },
      },
    ];
    const res = calculateAthleteProgress(dummyAthleteActive, assessments);
    expect(res.strongestImprovingComponent).toBe("SPEED"); // delta SPEED = +30, POWER = +5
  });

  it("9. identifies largest declining component", () => {
    const assessments = [
      {
        id: "a1",
        assessmentDate: new Date("2026-01-01"),
        overallScore: 80,
        overallGrade: "B+",
        analysis: { componentScores: { AGILITY: 90, FLEXIBILITY: 70 } },
      },
      {
        id: "a2",
        assessmentDate: new Date("2026-02-01"),
        overallScore: 75,
        overallGrade: "B",
        analysis: { componentScores: { AGILITY: 70, FLEXIBILITY: 68 } },
      },
    ];
    const res = calculateAthleteProgress(dummyAthleteActive, assessments);
    expect(res.largestDecliningComponent).toBe("AGILITY"); // AGILITY delta = -20 vs FLEXIBILITY -2
  });

  it("10. calculates organization aggregation metrics accurately", () => {
    const assessments = [
      { id: "a1", athleteId: "ath-1", assessmentDate: new Date("2026-01-01"), overallScore: 92, overallGrade: "A" },
      { id: "a2", athleteId: "ath-1", assessmentDate: new Date("2026-02-01"), overallScore: 95, overallGrade: "A" },
      { id: "b1", athleteId: "ath-2", assessmentDate: new Date("2026-01-01"), overallScore: 80, overallGrade: "B+" },
      { id: "b2", athleteId: "ath-2", assessmentDate: new Date("2026-02-01"), overallScore: 70, overallGrade: "B" },
    ];
    const orgReport = calculateOrganizationReport(assessments, 2, 3, 5);
    expect(orgReport.totalAssessments).toBe(4);
    expect(orgReport.averageOverallScore).toBe(84.25);
    expect(orgReport.progressSummary.improvingCount).toBe(1); // ath-1 (92->95)
    expect(orgReport.progressSummary.decliningCount).toBe(1); // ath-2 (80->70)
  });

  it("11. handles empty datasets gracefully without crash", () => {
    const emptyRes = calculateAthleteProgress(dummyAthleteActive, []);
    expect(emptyRes.latestScore).toBeNull();
    expect(emptyRes.overallDelta).toBeNull();
    expect(emptyRes.overallTrend).toBe("INSUFFICIENT_DATA");

    const emptyReport = calculateOrganizationReport([], 0, 0, 0);
    expect(emptyReport.totalAssessments).toBe(0);
    expect(emptyReport.averageOverallScore).toBe(0);
  });

  it("12. includes inactive athlete historical data in progress calculations", () => {
    const assessments = [
      { id: "a1", assessmentDate: new Date("2025-06-01"), overallScore: 75, overallGrade: "B" },
      { id: "a2", assessmentDate: new Date("2025-12-01"), overallScore: 82, overallGrade: "B+" },
    ];
    const res = calculateAthleteProgress(dummyAthleteInactive, assessments);
    expect(res.isActive).toBe(false);
    expect(res.latestScore).toBe(82);
    expect(res.overallDelta).toBe(7);
  });

  it("13. filters records by period boundaries accurately", () => {
    const now = new Date();
    const recentDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    const oldDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000); // 100 days ago

    const records = [
      { id: "r1", date: recentDate },
      { id: "r2", date: oldDate },
    ];

    const last30Days = filterRecordsByPeriod(records, 30, "date");
    expect(last30Days.length).toBe(1);
    expect(last30Days[0].id).toBe("r1");

    const allTime = filterRecordsByPeriod(records, "ALL", "date");
    expect(allTime.length).toBe(2);
  });
});
