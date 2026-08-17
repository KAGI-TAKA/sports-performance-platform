export type PortalAccessType = "ATHLETE" | "PARENT";

export type PortalAccessErrorCode =
  | "INVALID_TOKEN"
  | "EXPIRED_TOKEN"
  | "REVOKED_TOKEN"
  | "INACTIVE_ATHLETE";

export interface PortalAccessContext {
  portalAccessId: string;
  organizationId: string;
  organizationName: string;
  athleteId: string;
  athleteName: string;
  accessType: PortalAccessType;
  expiresAt: Date;
}

export interface PortalAthleteProfile {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  photoUrl: string | null;
  parentName: string | null;
  competitionLevel: string | null;
}

export interface PortalAssessmentSnapshot {
  assessmentId: string;
  assessmentDate: string;
  overallScore: number | null;
  overallGrade: string | null;
  bestComponent: string | null;
  weakestComponents: string[];
  insightText: string | null;
  recommendationText: string | null;
}

export interface PortalComponentTrend {
  component: string;
  latestScore: number | null;
  previousScore: number | null;
  change: number | null;
  status: "IMPROVING" | "DECLINING" | "STABLE" | "INSUFFICIENT_DATA";
}

export interface PortalExerciseItem {
  id: string;
  name: string;
  category: string | null;
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  notes: string | null;
  order: number;
}

export interface PortalTrainingPlan {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  exercises: PortalExerciseItem[];
}

export interface PortalScheduleSession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  location: string | null;
  coachName: string;
  trainingPlanTitle: string | null;
}

export interface PortalSessionLog {
  id: string;
  sessionDate: string;
  activitiesDone: string;
  coachFeedback: string | null;
  videoUrl: string | null;
}

export interface PortalReportItem {
  assessmentId: string;
  assessmentDate: string;
  overallScore: number | null;
  overallGrade: string | null;
  pdfUrl: string;
}

export interface PortalBadge {
  id: string;
  name: string;
  description: string;
  category: "MILESTONE" | "PERFORMANCE" | "CONSISTENCY" | "PROGRESS" | "MASTERY";
  earned: boolean;
  earnedDate: string | null;
  iconKey: "ShieldCheck" | "Award" | "Zap" | "TrendingUp" | "Dumbbell";
}

export interface PortalAchievementData {
  starRating: number; // 0 to 5 stars
  starLabel: string;
  totalAssessments: number;
  completedSessions: number;
  badges: PortalBadge[];
}

