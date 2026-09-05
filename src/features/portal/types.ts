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
  sportCategory?: string | null;
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
  coachRole?: string | null;
  executorName?: string | null;
  executorRole?: string | null;
  trainingPlanTitle: string | null;
  attendanceStatus?: "PRESENT" | "LATE" | "EXCUSED" | "ABSENT" | "RESCHEDULED" | "UNMARKED" | null;
  notes?: string | null;
}

export interface PortalSessionLog {
  id: string;
  sessionDate: string;
  activitiesDone: string;
  coachFeedback: string | null;
  videoUrl: string | null;
  coachName?: string | null;
  coachRole?: string | null;
  sessionTitle?: string | null;
}

export interface PortalAttendanceHistoryItem {
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  startTime: string;
  status: "PRESENT" | "LATE" | "EXCUSED" | "ABSENT" | "RESCHEDULED" | "UNMARKED";
  coachName: string;
  notes: string | null;
}

export interface PortalAttendanceSummary {
  thisMonthRate: number | null; // e.g. 92%
  thisMonthTotal: number;
  thisMonthPresent: number;
  overallRate: number | null;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  absentCount: number;
  history: PortalAttendanceHistoryItem[];
}

export interface PortalSiblingItem {
  id: string;
  fullName: string;
  sportCategory: string | null;
  jerseyNumber: number | null;
  dateOfBirth: string;
  age: number;
  photoUrl: string | null;
  competitionLevel: string | null;
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

export type { CoachGuidanceItem } from "../guidance/types";

// ── P6-B4: Portal-Safe Personal Best & Goal Types ─────────────────────────────

/**
 * Portal-safe Personal Best item.
 * Stripped: organizationId, createdByMemberId, internal flags.
 */
export interface PortalPersonalBestItem {
  testItemId: string;
  testItemName: string;
  unit: string;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  physicalComponent: string | null;
  pbValue: number;
  achievedDate: string; // ISO date string
  currentValue: number | null;
  currentDate: string | null;
}

/**
 * Portal-safe Athlete Goal item.
 * Stripped: organizationId, createdByMemberId, internal coaching notes.
 * Notes (internal staff coaching notes) are NOT exposed to portal.
 */
export interface PortalAthleteGoalItem {
  id: string;
  testItemName: string;
  unit: string;
  title: string | null;
  baselineValue: number;
  targetValue: number;
  currentValue: number | null;
  targetDate: string | null;
  status: "ACTIVE" | "ACHIEVED" | "PAUSED" | "EXPIRED" | "CANCELLED";
  progressPercent: number;
  deltaFromBaseline: number;
  isImproving: boolean;
  state: "NO_CURRENT_VALUE" | "IN_PROGRESS" | "ACHIEVED";
  achievedAt: string | null;
  /** assessmentId of the assessment that achieved this goal, if any.
   *  Used to resolve PDF link if available in portal reports. */
  achievedAssessmentId: string | null;
}

