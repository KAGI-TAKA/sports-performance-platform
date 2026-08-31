import { describe, it, expect } from "vitest";
import {
  isFeedbackWindowValid,
  isAttendanceEligibleForFeedback,
  canMemberReviewFeedback,
  calculateAverageRating,
} from "./engine";
import {
  submitParentFeedbackSchema,
  reviewParentFeedbackSchema,
} from "./schema";

describe("Parent Feedback Engine — Feedback Time Window (7 Days)", () => {
  const sessionEndTime = new Date("2026-08-20T10:00:00Z");

  it("permits feedback within the 7-day window", () => {
    // 3 days later
    const currentTime = new Date("2026-08-23T10:00:00Z");
    const res = isFeedbackWindowValid(sessionEndTime, currentTime);
    expect(res.valid).toBe(true);
  });

  it("permits feedback on the 7th day boundary", () => {
    // exactly 7 days later
    const currentTime = new Date("2026-08-27T10:00:00Z");
    const res = isFeedbackWindowValid(sessionEndTime, currentTime);
    expect(res.valid).toBe(true);
  });

  it("REJECTS feedback after 7 days have passed", () => {
    // 7 days and 1 minute later
    const currentTime = new Date("2026-08-27T10:01:00Z");
    const res = isFeedbackWindowValid(sessionEndTime, currentTime);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("7 hari");
  });
});

describe("Parent Feedback Engine — Attendance Status Eligibility", () => {
  it("allows feedback for PRESENT attendance status", () => {
    expect(isAttendanceEligibleForFeedback("PRESENT")).toBe(true);
  });

  it("allows feedback for LATE attendance status", () => {
    expect(isAttendanceEligibleForFeedback("LATE")).toBe(true);
  });

  it("REJECTS feedback for UNMARKED attendance status", () => {
    expect(isAttendanceEligibleForFeedback("UNMARKED")).toBe(false);
  });

  it("REJECTS feedback for ABSENT attendance status", () => {
    expect(isAttendanceEligibleForFeedback("ABSENT")).toBe(false);
  });

  it("REJECTS feedback for EXCUSED attendance status", () => {
    expect(isAttendanceEligibleForFeedback("EXCUSED")).toBe(false);
  });

  it("REJECTS feedback for RESCHEDULED attendance status", () => {
    expect(isAttendanceEligibleForFeedback("RESCHEDULED")).toBe(false);
  });

  it("REJECTS feedback for null or undefined attendance status", () => {
    expect(isAttendanceEligibleForFeedback(null)).toBe(false);
    expect(isAttendanceEligibleForFeedback(undefined)).toBe(false);
  });
});

describe("Parent Feedback Engine — Head Coach Supervisory Authority", () => {
  it("allows Owner to review feedback", () => {
    expect(canMemberReviewFeedback("owner")).toBe(true);
    expect(canMemberReviewFeedback("OWNER")).toBe(true);
  });

  it("allows Admin to review feedback", () => {
    expect(canMemberReviewFeedback("admin")).toBe(true);
    expect(canMemberReviewFeedback("ADMIN")).toBe(true);
  });

  it("allows Head Coach to review feedback", () => {
    expect(canMemberReviewFeedback("head_coach")).toBe(true);
    expect(canMemberReviewFeedback("HEAD_COACH")).toBe(true);
  });

  it("REJECTS Assistant Coach from reviewing feedback", () => {
    expect(canMemberReviewFeedback("assistant_coach")).toBe(false);
    expect(canMemberReviewFeedback("ASSISTANT_COACH")).toBe(false);
  });

  it("REJECTS unknown or unauthorized roles", () => {
    expect(canMemberReviewFeedback("athlete")).toBe(false);
    expect(canMemberReviewFeedback("guest")).toBe(false);
  });
});

describe("Parent Feedback Engine — Composite Average Calculation", () => {
  it("calculates accurate composite average rating", () => {
    const avg = calculateAverageRating({
      sessionRating: 5,
      communicationRating: 4,
      athleteAttentionRating: 4,
    });
    expect(avg).toBe(4.3);
  });

  it("calculates whole number composite average rating", () => {
    const avg = calculateAverageRating({
      sessionRating: 5,
      communicationRating: 5,
      athleteAttentionRating: 5,
    });
    expect(avg).toBe(5.0);
  });
});

describe("Parent Feedback Engine — Zod Schema Validations", () => {
  it("validates valid submitParentFeedback input", () => {
    const valid = submitParentFeedbackSchema.safeParse({
      token: "valid-portal-token-abc",
      scheduleSessionId: "session-123",
      sessionRating: 5,
      communicationRating: 4,
      athleteAttentionRating: 5,
      comment: "Latihan sangat bermanfaat untuk anak saya.",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects ratings outside 1..5 range", () => {
    expect(
      submitParentFeedbackSchema.safeParse({
        token: "token",
        scheduleSessionId: "s-1",
        sessionRating: 0,
        communicationRating: 4,
        athleteAttentionRating: 5,
      }).success
    ).toBe(false);

    expect(
      submitParentFeedbackSchema.safeParse({
        token: "token",
        scheduleSessionId: "s-1",
        sessionRating: 6,
        communicationRating: 4,
        athleteAttentionRating: 5,
      }).success
    ).toBe(false);

    expect(
      submitParentFeedbackSchema.safeParse({
        token: "token",
        scheduleSessionId: "s-1",
        sessionRating: -1,
        communicationRating: 4,
        athleteAttentionRating: 5,
      }).success
    ).toBe(false);
  });

  it("rejects non-integer ratings", () => {
    expect(
      submitParentFeedbackSchema.safeParse({
        token: "token",
        scheduleSessionId: "s-1",
        sessionRating: 4.5,
        communicationRating: 4,
        athleteAttentionRating: 5,
      }).success
    ).toBe(false);
  });

  it("rejects comments longer than 1000 characters", () => {
    const longComment = "x".repeat(1001);
    expect(
      submitParentFeedbackSchema.safeParse({
        token: "token",
        scheduleSessionId: "s-1",
        sessionRating: 5,
        communicationRating: 5,
        athleteAttentionRating: 5,
        comment: longComment,
      }).success
    ).toBe(false);
  });

  it("validates reviewParentFeedbackSchema", () => {
    const valid = reviewParentFeedbackSchema.safeParse({
      feedbackId: "feedback-123",
      isReviewed: true,
      headCoachNotes: "Evaluasi ditindaklanjuti pada rapat mingguan.",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects review notes longer than 1000 characters", () => {
    const longNotes = "x".repeat(1001);
    expect(
      reviewParentFeedbackSchema.safeParse({
        feedbackId: "feedback-123",
        isReviewed: true,
        headCoachNotes: longNotes,
      }).success
    ).toBe(false);
  });
});
