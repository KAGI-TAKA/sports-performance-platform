import {
  PHYSICAL_COMPONENTS,
  type PhysicalComponentType,
  type ProgressTrend,
  type ComponentTrendDetail,
  type AthleteProgressSummary,
  type OrganizationAnalyticsReport,
  type ScoreDistribution,
  type AthleteComparisonResult,
} from "./types";

export interface AssessmentRecordInput {
  id: string;
  athleteId?: string;
  assessmentDate: Date;
  overallScore: number | null;
  overallGrade: string | null;
  analysis?: {
    componentScores: unknown;
    bestComponent?: string | null;
    weakestComponents?: string[] | null;
  } | null;
}

export function parseComponentScores(
  componentScoresRaw: unknown
): Record<string, number> {
  if (!componentScoresRaw) return {};
  if (typeof componentScoresRaw === "string") {
    try {
      const parsed = JSON.parse(componentScoresRaw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof componentScoresRaw === "object" && componentScoresRaw !== null
    ? (componentScoresRaw as Record<string, number>)
    : {};
}

export function calculateTrend(latest: number | null, previous: number | null): ProgressTrend {
  if (latest === null || previous === null) return "INSUFFICIENT_DATA";
  const delta = latest - previous;
  if (Math.abs(delta) < 0.5) return "STABLE";
  return delta > 0 ? "IMPROVING" : "DECLINING";
}

export function calculateAthleteProgress(
  athlete: {
    id: string;
    fullName: string;
    isActive: boolean;
  },
  assessments: AssessmentRecordInput[]
): AthleteProgressSummary {
  // Sort ascending by assessmentDate for timeline analysis; tie-break deterministically by id
  const sorted = [...assessments].sort((a, b) => {
    const timeA = new Date(a.assessmentDate).getTime();
    const timeB = new Date(b.assessmentDate).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.id.localeCompare(b.id);
  });

  const totalAssessments = sorted.length;
  const latestAssessment = sorted[totalAssessments - 1] ?? null;
  const previousAssessment = totalAssessments >= 2 ? sorted[totalAssessments - 2] : null;

  const latestScore = latestAssessment?.overallScore != null ? Number(latestAssessment.overallScore) : null;
  const previousScore = previousAssessment?.overallScore != null ? Number(previousAssessment.overallScore) : null;

  let overallDelta: number | null = null;
  let overallPercentageChange: number | null = null;

  if (latestScore !== null && previousScore !== null) {
    overallDelta = latestScore - previousScore;
    overallPercentageChange = previousScore > 0 ? (overallDelta / previousScore) * 100 : 0;
  }

  const overallTrend = calculateTrend(latestScore, previousScore);

  const latestCompScores = parseComponentScores(latestAssessment?.analysis?.componentScores);
  const prevCompScores = parseComponentScores(previousAssessment?.analysis?.componentScores);

  const componentTrends = {} as Record<PhysicalComponentType, ComponentTrendDetail>;

  let strongestImprovingComponent: PhysicalComponentType | null = null;
  let largestDecliningComponent: PhysicalComponentType | null = null;
  let maxImprovementDelta = -Infinity;
  let maxDeclineDelta = Infinity;

  let currentBestComponent: PhysicalComponentType | null = null;
  let currentWeakestComponent: PhysicalComponentType | null = null;
  let maxBestScore = -Infinity;
  let minWeakestScore = Infinity;

  for (const comp of PHYSICAL_COMPONENTS) {
    const latestComp = latestCompScores[comp] != null ? Number(latestCompScores[comp]) : null;
    const prevComp = prevCompScores[comp] != null ? Number(prevCompScores[comp]) : null;

    let delta: number | null = null;
    if (latestComp !== null && prevComp !== null) {
      delta = latestComp - prevComp;
    }

    const trend = calculateTrend(latestComp, prevComp);

    componentTrends[comp] = {
      component: comp,
      latestScore: latestComp,
      previousScore: prevComp,
      delta,
      trend,
      assessmentCount: totalAssessments,
    };

    if (delta !== null) {
      if (delta > 0 && delta > maxImprovementDelta) {
        maxImprovementDelta = delta;
        strongestImprovingComponent = comp;
      }
      if (delta < 0 && delta < maxDeclineDelta) {
        maxDeclineDelta = delta;
        largestDecliningComponent = comp;
      }
    }

    if (latestComp !== null) {
      if (latestComp > maxBestScore) {
        maxBestScore = latestComp;
        currentBestComponent = comp;
      }
      if (latestComp < minWeakestScore) {
        minWeakestScore = latestComp;
        currentWeakestComponent = comp;
      }
    }
  }

  const assessmentTimeline = sorted.map((a) => ({
    id: a.id,
    assessmentDate: new Date(a.assessmentDate),
    overallScore: Number(a.overallScore ?? 0),
    overallGrade: a.overallGrade,
    componentScores: parseComponentScores(a.analysis?.componentScores),
  }));

  return {
    athleteId: athlete.id,
    fullName: athlete.fullName,
    isActive: athlete.isActive,
    totalAssessments,
    latestAssessmentDate: latestAssessment ? new Date(latestAssessment.assessmentDate) : null,
    latestScore,
    latestGrade: latestAssessment?.overallGrade ?? null,
    previousScore,
    previousGrade: previousAssessment?.overallGrade ?? null,
    overallDelta,
    overallPercentageChange,
    overallTrend,
    componentTrends,
    strongestImprovingComponent,
    largestDecliningComponent,
    currentBestComponent,
    currentWeakestComponent,
    assessmentTimeline,
  };
}

export function calculateHeadToHeadComparison(
  athleteA: { id: string; fullName: string; position: string; jerseyNumber: number | null; isActive: boolean },
  athleteB: { id: string; fullName: string; position: string; jerseyNumber: number | null; isActive: boolean },
  assessmentA: AssessmentRecordInput | null,
  assessmentB: AssessmentRecordInput | null
): AthleteComparisonResult {
  const scoreA = assessmentA?.overallScore != null ? Number(assessmentA.overallScore) : null;
  const scoreB = assessmentB?.overallScore != null ? Number(assessmentB.overallScore) : null;

  let scoreDelta: number | null = null;
  let scoreLeader: "A" | "B" | "TIE" | null = null;

  if (scoreA !== null && scoreB !== null) {
    scoreDelta = Math.abs(scoreA - scoreB);
    if (Math.abs(scoreA - scoreB) < 0.1) scoreLeader = "TIE";
    else scoreLeader = scoreA > scoreB ? "A" : "B";
  }

  const compScoresA = parseComponentScores(assessmentA?.analysis?.componentScores);
  const compScoresB = parseComponentScores(assessmentB?.analysis?.componentScores);

  const componentAdvantages = PHYSICAL_COMPONENTS.map((comp) => {
    const valA = compScoresA[comp] != null ? Number(compScoresA[comp]) : null;
    const valB = compScoresB[comp] != null ? Number(compScoresB[comp]) : null;

    let advantage: "A" | "B" | "TIE" | null = null;
    let delta: number | null = null;

    if (valA !== null && valB !== null) {
      delta = Math.abs(valA - valB);
      if (Math.abs(valA - valB) < 0.1) advantage = "TIE";
      else advantage = valA > valB ? "A" : "B";
    }

    return {
      component: comp,
      scoreA: valA,
      scoreB: valB,
      advantage,
      delta,
    };
  });

  return {
    athleteA: {
      id: athleteA.id,
      fullName: athleteA.fullName,
      position: athleteA.position,
      jerseyNumber: athleteA.jerseyNumber,
      isActive: athleteA.isActive,
      latestScore: scoreA,
      latestGrade: assessmentA?.overallGrade ?? null,
      assessmentDate: assessmentA ? new Date(assessmentA.assessmentDate) : null,
      componentScores: compScoresA,
    },
    athleteB: {
      id: athleteB.id,
      fullName: athleteB.fullName,
      position: athleteB.position,
      jerseyNumber: athleteB.jerseyNumber,
      isActive: athleteB.isActive,
      latestScore: scoreB,
      latestGrade: assessmentB?.overallGrade ?? null,
      assessmentDate: assessmentB ? new Date(assessmentB.assessmentDate) : null,
      componentScores: compScoresB,
    },
    scoreDelta,
    scoreLeader,
    componentAdvantages,
  };
}

export function calculateOrganizationReport(
  assessments: AssessmentRecordInput[],
  totalAthletesCount: number,
  activePlansCount: number,
  sessionLogsCount: number
): OrganizationAnalyticsReport {
  const totalAssessments = assessments.length;

  let totalScoreSum = 0;
  let scoreCount = 0;
  let latestDate: Date | null = null;

  const scoreDistribution: ScoreDistribution = {
    gradeA: 0,
    gradeBPlus: 0,
    gradeB: 0,
    gradeCPlus: 0,
    gradeC: 0,
    gradeD: 0,
  };

  const componentSums: Record<PhysicalComponentType, number> = {
    FLEXIBILITY: 0,
    SPEED: 0,
    POWER: 0,
    AGILITY: 0,
    MUSCULAR_ENDURANCE: 0,
    ANAEROBIC_ENDURANCE: 0,
    AEROBIC_ENDURANCE: 0,
  };

  const componentCounts: Record<PhysicalComponentType, number> = {
    FLEXIBILITY: 0,
    SPEED: 0,
    POWER: 0,
    AGILITY: 0,
    MUSCULAR_ENDURANCE: 0,
    ANAEROBIC_ENDURANCE: 0,
    AEROBIC_ENDURANCE: 0,
  };

  // Group assessments by athlete to compute organizational trend counts
  const athleteAssessmentsMap: Record<string, AssessmentRecordInput[]> = {};

  for (const a of assessments) {
    if (a.athleteId) {
      if (!athleteAssessmentsMap[a.athleteId]) {
        athleteAssessmentsMap[a.athleteId] = [];
      }
      athleteAssessmentsMap[a.athleteId].push(a);
    }

    if (a.overallScore != null) {
      totalScoreSum += Number(a.overallScore);
      scoreCount++;
    }

    if (a.overallGrade) {
      switch (a.overallGrade) {
        case "A":
          scoreDistribution.gradeA++;
          break;
        case "B+":
          scoreDistribution.gradeBPlus++;
          break;
        case "B":
          scoreDistribution.gradeB++;
          break;
        case "C+":
          scoreDistribution.gradeCPlus++;
          break;
        case "C":
          scoreDistribution.gradeC++;
          break;
        case "D":
          scoreDistribution.gradeD++;
          break;
      }
    }

    const d = new Date(a.assessmentDate);
    if (!latestDate || d.getTime() > latestDate.getTime()) {
      latestDate = d;
    }

    const comps = parseComponentScores(a.analysis?.componentScores);
    for (const comp of PHYSICAL_COMPONENTS) {
      if (comps[comp] != null) {
        componentSums[comp] += Number(comps[comp]);
        componentCounts[comp]++;
      }
    }
  }

  // Calculate dynamic progress counts
  let improvingCount = 0;
  let decliningCount = 0;
  let stableCount = 0;
  let insufficientDataCount = 0;

  for (const [athId, athAsses] of Object.entries(athleteAssessmentsMap)) {
    const summary = calculateAthleteProgress(
      { id: athId, fullName: "Athlete", isActive: true },
      athAsses
    );
    switch (summary.overallTrend) {
      case "IMPROVING":
        improvingCount++;
        break;
      case "DECLINING":
        decliningCount++;
        break;
      case "STABLE":
        stableCount++;
        break;
      case "INSUFFICIENT_DATA":
        insufficientDataCount++;
        break;
    }
  }

  const averageOverallScore = scoreCount > 0 ? totalScoreSum / scoreCount : 0;

  const componentAverages = {} as Record<PhysicalComponentType, number>;
  let strongestOrgComponent: PhysicalComponentType | null = null;
  let weakestOrgComponent: PhysicalComponentType | null = null;
  let maxCompAvg = -Infinity;
  let minCompAvg = Infinity;

  for (const comp of PHYSICAL_COMPONENTS) {
    const avg = componentCounts[comp] > 0 ? componentSums[comp] / componentCounts[comp] : 0;
    componentAverages[comp] = avg;

    if (componentCounts[comp] > 0) {
      if (avg > maxCompAvg) {
        maxCompAvg = avg;
        strongestOrgComponent = comp;
      }
      if (avg < minCompAvg) {
        minCompAvg = avg;
        weakestOrgComponent = comp;
      }
    }
  }

  return {
    totalAssessments,
    totalAssessedAthletes: totalAthletesCount,
    latestAssessmentDate: latestDate,
    averageOverallScore,
    scoreDistribution,
    componentAverages,
    strongestOrgComponent,
    weakestOrgComponent,
    progressSummary: {
      improvingCount,
      decliningCount,
      stableCount,
      insufficientDataCount,
    },
    trainingSummary: {
      activePlansCount,
      completedSessionLogsCount: sessionLogsCount,
      recentLogCount: sessionLogsCount,
    },
  };
}

export function filterRecordsByPeriod<T extends { [key: string]: unknown }>(
  records: T[],
  periodDays: number | "ALL",
  dateField: keyof T
): T[] {
  if (periodDays === "ALL" || !periodDays) return records;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);

  return records.filter((r) => {
    const dateVal = r[dateField];
    if (!dateVal) return false;
    const d = new Date(dateVal as string | number | Date);
    return d.getTime() >= cutoff.getTime();
  });
}
