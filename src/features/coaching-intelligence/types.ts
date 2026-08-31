export type ReTestStatus = "FRESH" | "DUE_SOON" | "DUE" | "OVERDUE" | "NO_ASSESSMENT";

export interface AthleteReTestInsight {
  athleteId: string;
  athleteName: string;
  category: string | null;
  jerseyNumber: number | null;
  position: string | null;
  photoUrl: string | null;
  latestAssessmentId: string | null;
  latestAssessmentDate: Date | null;
  latestAssessmentDateStr: string | null;
  latestOverallScore: number | null;
  latestOverallGrade: string | null;
  daysSinceAssessment: number | null;
  reTestStatus: ReTestStatus;
  statusLabel: string;
  message: string;
  recommendedAction: string;
}

export interface AthleteReTestSummary {
  totalAthletes: number;
  freshCount: number;
  dueSoonCount: number;
  dueCount: number;
  overdueCount: number;
  noAssessmentCount: number;
  insights: AthleteReTestInsight[];
}

// ==========================================
// P7-C2: WORKLOAD INTELLIGENCE TYPES
// ==========================================

export type WorkloadPeriod = "month" | "last30" | "last90";

export interface AssistantWorkloadItem {
  coachId: string;
  coachName: string;
  coachEmail: string | null;
  coachPhotoUrl: string | null;
  role: string;

  // Actual Delivery (COMPLETED sessions only)
  completedSessions: number;
  deliveredMinutes: number;
  deliveredHours: number;

  // Planned Load (Future SCHEDULED sessions only)
  plannedSessions: number;
  plannedMinutes: number;
  plannedHours: number;

  // Operational anomaly count (e.g. invalid duration or past scheduled)
  anomaliesCount: number;
}

export interface CoachingWorkloadSummary {
  period: WorkloadPeriod;
  periodLabel: string;
  startDate: Date;
  endDate: Date;
  startDateStr: string;
  endDateStr: string;

  totalAssistants: number;
  totalCompletedSessions: number;
  totalDeliveredMinutes: number;
  totalDeliveredHours: number;
  totalPlannedSessions: number;
  totalPlannedMinutes: number;
  totalPlannedHours: number;

  assistants: AssistantWorkloadItem[];
}

// ==========================================
// P7-C3: SESSION HEALTH INTELLIGENCE TYPES
// ==========================================

export type SessionHealthType =
  | "PAST_SCHEDULED"
  | "COMPLETED_MISSING_LOG"
  | "UNMARKED_ATTENDANCE"
  | "TODAY_UPCOMING"
  | "COMPLETED_HEALTHY";

export type AnomalySeverity = "ATTENTION" | "INFO" | "NORMAL";

export interface SessionHealthItem {
  sessionId: string;
  sessionTitle: string;
  coachId: string;
  coachName: string;
  startTime: Date;
  endTime: Date;
  startTimeFormatted: string;
  endTimeFormatted: string;
  status: string;
  healthType: SessionHealthType;
  severity: AnomalySeverity;
  title: string;
  description: string;
  affectedAthleteNames: string[];
  ctaLabel: string;
  ctaUrl: string;
}

export interface SessionHealthSummary {
  totalSessionsAudited: number;
  healthyCount: number;
  pastScheduledCount: number;
  missingLogCount: number;
  unmarkedAttendanceCount: number;
  todayUpcomingCount: number;
  anomalies: SessionHealthItem[];
  todayUpcoming: SessionHealthItem[];
}
