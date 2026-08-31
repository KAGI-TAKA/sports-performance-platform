import type { GoalStatus, MeasurementUnit, ScoreDirection } from "@prisma/client";

export type { GoalStatus, MeasurementUnit, ScoreDirection };

export interface PersonalBestItem {
  testItemId: string;
  testItemName: string;
  unit: MeasurementUnit;
  scoreDirection: ScoreDirection;
  physicalComponent?: string | null;
  pbValue: number;
  achievedDate: Date;
  assessmentId: string;
}

export interface CurrentPerformanceItem {
  testItemId: string;
  testItemName: string;
  unit: MeasurementUnit;
  scoreDirection: ScoreDirection;
  physicalComponent?: string | null;
  currentValue: number;
  assessmentDate: Date;
  assessmentId: string;
}

export type GoalProgressState = "NO_CURRENT_VALUE" | "IN_PROGRESS" | "ACHIEVED";

export interface GoalProgressResult {
  progressPercent: number; // 0 to 100 clamped
  deltaFromBaseline: number; // raw difference: current - baseline
  isImproving: boolean; // whether current is in the desired direction vs baseline
  isTargetReached: boolean; // whether current meets or exceeds target
  state: GoalProgressState;
}

export interface AthleteGoalDetail {
  id: string;
  organizationId: string;
  athleteId: string;
  athleteName: string;
  testItemId: string;
  testItemName: string;
  physicalComponent?: string | null;
  scoreDirection: ScoreDirection;
  unit: MeasurementUnit;
  title?: string | null;
  baselineValue: number;
  targetValue: number;
  currentValue: number | null;
  targetDate?: Date | null;
  status: GoalStatus;
  notes?: string | null;
  progress: GoalProgressResult;
  achievedAt?: Date | null;
  achievedAssessmentId?: string | null;
  createdByMemberId: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}
