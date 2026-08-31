export type TimeRangeFilter = "30d" | "90d" | "all";

export type TrendStatus = "HIGHER" | "SIMILAR" | "LOWER" | "INSUFFICIENT_DATA";

export interface AssistantPerformanceSummary {
  coachMemberId: string;
  coachName: string;
  coachEmail: string;
  role: string;
  totalSessions: number;
  eligibleOpportunities: number;
  feedbackVolume: number;
  responseRate: number | null; // percentage e.g. 75, null if 0 eligible
  overallSatisfaction: number | null; // 1..5 scale
  sessionQualityRating: number | null;
  communicationRating: number | null;
  athleteAttentionRating: number | null;
  trendDiff: number | null;
  trendStatus: TrendStatus;
  trendLabel: string;
  sampleSizeSufficient: boolean;
  unreviewedCount?: number;
}

export interface AssistantFeedbackItem {
  id: string;
  createdAt: string;
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  athleteName: string | null; // null if requester is assistant_coach
  overallRating: number;
  sessionRating: number;
  communicationRating: number;
  athleteAttentionRating: number;
  comment: string | null; // null if requester is assistant_coach
  isReviewed: boolean;
  reviewedAt: string | null;
  headCoachNotes: string | null; // null if requester is assistant_coach
}

export interface AssistantPerformanceDetail {
  summary: AssistantPerformanceSummary;
  feedbackItems: AssistantFeedbackItem[];
  canReview: boolean;
}
