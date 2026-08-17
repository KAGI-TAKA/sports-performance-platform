export type ProgressTrend =
  | "IMPROVING"
  | "DECLINING"
  | "STABLE"
  | "INSUFFICIENT_DATA";

export const PHYSICAL_COMPONENTS = [
  "FLEXIBILITY",
  "SPEED",
  "POWER",
  "AGILITY",
  "MUSCULAR_ENDURANCE",
  "ANAEROBIC_ENDURANCE",
  "AEROBIC_ENDURANCE",
] as const;

export type PhysicalComponentType = (typeof PHYSICAL_COMPONENTS)[number];

export interface ComponentTrendDetail {
  component: PhysicalComponentType;
  latestScore: number | null;
  previousScore: number | null;
  delta: number | null;
  trend: ProgressTrend;
  assessmentCount: number;
}

export interface AthleteProgressSummary {
  athleteId: string;
  fullName: string;
  isActive: boolean;
  totalAssessments: number;
  latestAssessmentDate: Date | null;
  latestScore: number | null;
  latestGrade: string | null;
  previousScore: number | null;
  previousGrade: string | null;
  overallDelta: number | null;
  overallPercentageChange: number | null;
  overallTrend: ProgressTrend;
  componentTrends: Record<PhysicalComponentType, ComponentTrendDetail>;
  strongestImprovingComponent: PhysicalComponentType | null;
  largestDecliningComponent: PhysicalComponentType | null;
  currentBestComponent: PhysicalComponentType | null;
  currentWeakestComponent: PhysicalComponentType | null;
  assessmentTimeline: Array<{
    id: string;
    assessmentDate: Date;
    overallScore: number;
    overallGrade: string | null;
    componentScores: Record<string, number>;
  }>;
}

export interface ScoreDistribution {
  gradeA: number;
  gradeBPlus: number;
  gradeB: number;
  gradeCPlus: number;
  gradeC: number;
  gradeD: number;
}

export interface OrganizationAnalyticsReport {
  totalAssessments: number;
  totalAssessedAthletes: number;
  latestAssessmentDate: Date | null;
  averageOverallScore: number;
  scoreDistribution: ScoreDistribution;
  componentAverages: Record<PhysicalComponentType, number>;
  strongestOrgComponent: PhysicalComponentType | null;
  weakestOrgComponent: PhysicalComponentType | null;
  progressSummary: {
    improvingCount: number;
    decliningCount: number;
    stableCount: number;
    insufficientDataCount: number;
  };
  trainingSummary: {
    activePlansCount: number;
    completedSessionLogsCount: number;
    recentLogCount: number;
  };
}

export interface AthleteComparisonResult {
  athleteA: {
    id: string;
    fullName: string;
    position: string;
    jerseyNumber: number | null;
    isActive: boolean;
    latestScore: number | null;
    latestGrade: string | null;
    assessmentDate: Date | null;
    componentScores: Record<string, number>;
  };
  athleteB: {
    id: string;
    fullName: string;
    position: string;
    jerseyNumber: number | null;
    isActive: boolean;
    latestScore: number | null;
    latestGrade: string | null;
    assessmentDate: Date | null;
    componentScores: Record<string, number>;
  };
  scoreDelta: number | null;
  scoreLeader: "A" | "B" | "TIE" | null;
  componentAdvantages: Array<{
    component: PhysicalComponentType;
    scoreA: number | null;
    scoreB: number | null;
    advantage: "A" | "B" | "TIE" | null;
    delta: number | null;
  }>;
}
