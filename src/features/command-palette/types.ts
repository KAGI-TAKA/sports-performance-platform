import React from "react";

export type CommandItemCategory =
  | "ACTION"
  | "NAVIGATION"
  | "ATHLETE"
  | "SCHEDULE"
  | "ASSESSMENT"
  | "TRAINING_PLAN"
  | "RECENT";

export interface CommandPaletteItem {
  id: string;
  category: CommandItemCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  href: string;
  icon?: React.ElementType;
  avatarUrl?: string | null;
  badge?: string;
  keywords?: string[];
  roleRequired?: string[];
}

export interface DynamicAthleteResult {
  id: string;
  fullName: string;
  sportCategory: string | null;
  trainingLevel: string;
  jerseyNumber: number | null;
  photoUrl: string | null;
}

export interface DynamicScheduleResult {
  id: string;
  title: string;
  startTime: Date;
  location: string | null;
  status: string;
  coachName: string;
}

export interface DynamicTrainingPlanResult {
  id: string;
  title: string;
  status: string;
  exerciseCount: number;
}

export interface DynamicAssessmentResult {
  id: string;
  athleteId: string;
  athleteName: string;
  assessmentDate: Date;
  overallScore: number | null;
  overallGrade: string | null;
}

export interface CommandPaletteSearchResult {
  athletes: DynamicAthleteResult[];
  sessions: DynamicScheduleResult[];
  trainingPlans: DynamicTrainingPlanResult[];
  assessments: DynamicAssessmentResult[];
}

export interface RecentCommandItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: CommandItemCategory;
  timestamp: number;
}
