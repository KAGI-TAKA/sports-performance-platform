import type { ScoreDirection } from "@prisma/client";

export interface ComparedAthleteDTO {
  id: string;
  fullName: string;
  position: string;
  jerseyNumber: number | null;
  age: number;
  gender: string;
  color: string;
  assessmentId: string | null;
  assessmentDate: Date | null;
  overallScore: number | null;
  overallGrade: string | null;
  componentScores: Record<string, number>;
  bestComponent: string | null;
}

export interface ComparedTestItemRow {
  testItemId: string;
  testItemName: string;
  unit: string;
  scoreDirection: ScoreDirection;
  physicalComponent: string | null;
  athleteValues: Record<
    string,
    {
      rawValue: number | null;
      score: number | null;
      isNotTested: boolean;
    }
  >;
}

export interface AthleteComplementaryStrength {
  athleteId: string;
  athleteName: string;
  color: string;
  strengthComponent: string | null;
  focusComponent: string | null;
  summaryText: string;
}

export interface MultiAthleteComparisonResult {
  athletes: ComparedAthleteDTO[];
  comparisonTable: ComparedTestItemRow[];
  complementaryStrengths: AthleteComplementaryStrength[];
}

export const COMPARE_COLORS = [
  "#3b82f6", // Accent Blue
  "#f97316", // Vivid Orange
  "#10b981", // Emerald Green
  "#8b5cf6", // Royal Purple
] as const;
