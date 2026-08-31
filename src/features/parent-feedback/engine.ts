const FEEDBACK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Validates if the feedback submission is within the 7-day window after session completion.
 */
export function isFeedbackWindowValid(
  sessionEndTime: Date,
  currentTime: Date = new Date()
): { valid: boolean; reason?: string; expiryDate: Date } {
  const endTimeMs = new Date(sessionEndTime).getTime();
  const nowMs = new Date(currentTime).getTime();
  const expiryDate = new Date(endTimeMs + FEEDBACK_WINDOW_MS);

  if (nowMs > endTimeMs + FEEDBACK_WINDOW_MS) {
    return {
      valid: false,
      reason: "Batas waktu pengisian feedback untuk sesi ini telah berakhir (maksimal 7 hari setelah sesi selesai).",
      expiryDate,
    };
  }

  return {
    valid: true,
    expiryDate,
  };
}

/**
 * Checks if athlete's attendance status permits parent feedback.
 * Only PRESENT and LATE allow feedback.
 */
export function isAttendanceEligibleForFeedback(status?: string | null): boolean {
  if (!status) return false;
  return status === "PRESENT" || status === "LATE";
}

/**
 * Validates whether a member has authorization to review and add notes to parent feedback.
 * Only OWNER, ADMIN, and HEAD_COACH have supervisory review authority.
 */
export function canMemberReviewFeedback(memberRole: string): boolean {
  const role = memberRole.toLowerCase();
  return role === "owner" || role === "admin" || role === "head_coach";
}

/**
 * Calculates the composite average score from the 3 rating dimensions.
 */
export function calculateAverageRating(ratings: {
  sessionRating: number;
  communicationRating: number;
  athleteAttentionRating: number;
}): number {
  const sum =
    ratings.sessionRating +
    ratings.communicationRating +
    ratings.athleteAttentionRating;
  return Number((sum / 3).toFixed(1));
}
