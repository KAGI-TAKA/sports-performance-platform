export interface ParentFeedbackSubmissionInput {
  token: string;
  scheduleSessionId: string;
  sessionRating: number;
  communicationRating: number;
  athleteAttentionRating: number;
  comment?: string | null;
}

export interface ReviewFeedbackInput {
  feedbackId: string;
  isReviewed: boolean;
  headCoachNotes?: string | null;
}

export interface EligibleFeedbackSessionItem {
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  coachName: string;
  location: string | null;
  attendanceStatus: "PRESENT" | "LATE";
  hasSubmittedFeedback: boolean;
  canSubmitFeedback: boolean;
  expiryDate: string;
}

export interface ParentFeedbackPublicSummary {
  feedbackId: string;
  scheduleSessionId: string;
  sessionTitle: string;
  sessionDate: string;
  coachName: string;
  sessionRating: number;
  communicationRating: number;
  athleteAttentionRating: number;
  comment: string | null;
  createdAt: string;
}

export interface InternalFeedbackQueueItem {
  id: string;
  organizationId: string;
  scheduleSessionId: string;
  sessionTitle: string;
  sessionDate: string;
  athleteId: string;
  athleteName: string;
  coachMemberId: string;
  coachName: string;
  sessionRating: number;
  communicationRating: number;
  athleteAttentionRating: number;
  comment: string | null;
  isReviewed: boolean;
  reviewedAt: string | null;
  headCoachNotes: string | null;
  createdAt: string;
  updatedAt: string;
}
