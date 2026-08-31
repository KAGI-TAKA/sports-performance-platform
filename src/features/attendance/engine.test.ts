import { describe, it, expect } from "vitest";
import {
  canMemberMarkAttendance,
  isSessionEligibleForAttendance,
  resolveCheckInTime,
  calculateAttendanceMetrics,
} from "./engine";
import {
  markAttendanceSchema,
  batchMarkAttendanceSchema,
  resetAttendanceSchema,
} from "./schema";
import type { AttendanceStatus, ScheduleStatus } from "./types";

describe("Attendance Engine — Permissions & Authorization", () => {
  const sessionCoachId = "coach-assistant-1";

  it("allows Admin to mark attendance for any session in the organization", () => {
    expect(canMemberMarkAttendance("admin", "admin-user", sessionCoachId)).toBe(true);
    expect(canMemberMarkAttendance("ADMIN", "admin-user", sessionCoachId)).toBe(true);
  });

  it("allows Owner to mark attendance for any session in the organization", () => {
    expect(canMemberMarkAttendance("owner", "owner-user", sessionCoachId)).toBe(true);
  });

  it("allows Head Coach to mark attendance for any session in the organization", () => {
    expect(canMemberMarkAttendance("head_coach", "head-coach-user", sessionCoachId)).toBe(true);
  });

  it("allows Assistant Coach to mark attendance ONLY for their assigned session", () => {
    expect(
      canMemberMarkAttendance("assistant_coach", "coach-assistant-1", sessionCoachId)
    ).toBe(true);
  });

  it("REJECTS Assistant Coach attempting to mark another coach's session", () => {
    expect(
      canMemberMarkAttendance("assistant_coach", "coach-assistant-2", sessionCoachId)
    ).toBe(false);
  });

  it("rejects unauthorized or unknown roles", () => {
    expect(canMemberMarkAttendance("guest", "guest-user", sessionCoachId)).toBe(false);
    expect(canMemberMarkAttendance("athlete", "athlete-user", sessionCoachId)).toBe(false);
  });
});

describe("Attendance Engine — Session Status Eligibility", () => {
  it("allows attendance operations on SCHEDULED sessions", () => {
    const res = isSessionEligibleForAttendance("SCHEDULED" as ScheduleStatus);
    expect(res.eligible).toBe(true);
  });

  it("allows attendance operations on COMPLETED sessions", () => {
    const res = isSessionEligibleForAttendance("COMPLETED" as ScheduleStatus);
    expect(res.eligible).toBe(true);
  });

  it("allows attendance operations on NO_SHOW sessions", () => {
    const res = isSessionEligibleForAttendance("NO_SHOW" as ScheduleStatus);
    expect(res.eligible).toBe(true);
  });

  it("REJECTS attendance operations on CANCELLED sessions", () => {
    const res = isSessionEligibleForAttendance("CANCELLED" as ScheduleStatus);
    expect(res.eligible).toBe(false);
    expect(res.reason).toContain("dibatalkan");
  });
});

describe("Attendance Engine — Check-In Time Resolution", () => {
  const fixedTime = new Date("2026-08-30T10:00:00Z");

  it("assigns server timestamp for PRESENT and LATE status", () => {
    expect(resolveCheckInTime("PRESENT", fixedTime)).toEqual(fixedTime);
    expect(resolveCheckInTime("LATE", fixedTime)).toEqual(fixedTime);
  });

  it("assigns null timestamp for non-attended or reset statuses", () => {
    expect(resolveCheckInTime("UNMARKED", fixedTime)).toBeNull();
    expect(resolveCheckInTime("EXCUSED", fixedTime)).toBeNull();
    expect(resolveCheckInTime("ABSENT", fixedTime)).toBeNull();
    expect(resolveCheckInTime("RESCHEDULED", fixedTime)).toBeNull();
  });
});

describe("Attendance Engine — Metrics & Aggregation Calculation", () => {
  it("calculates correct counts and attendance rate for mixed roster", () => {
    const statuses: AttendanceStatus[] = [
      "PRESENT",
      "PRESENT",
      "LATE",
      "EXCUSED",
      "ABSENT",
      "RESCHEDULED",
      "UNMARKED",
      "UNMARKED",
    ];

    const metrics = calculateAttendanceMetrics(statuses);

    expect(metrics.totalAthletes).toBe(8);
    expect(metrics.presentCount).toBe(2);
    expect(metrics.lateCount).toBe(1);
    expect(metrics.attendedCount).toBe(3); // PRESENT (2) + LATE (1)
    expect(metrics.excusedCount).toBe(1);
    expect(metrics.absentCount).toBe(1);
    expect(metrics.rescheduledCount).toBe(1);
    expect(metrics.unmarkedCount).toBe(2);
    expect(metrics.attendanceRate).toBe(37.5); // (3 / 8) * 100%
  });

  it("handles empty statuses list without divide-by-zero", () => {
    const metrics = calculateAttendanceMetrics([]);
    expect(metrics.totalAthletes).toBe(0);
    expect(metrics.attendedCount).toBe(0);
    expect(metrics.attendanceRate).toBe(0);
  });
});

describe("Attendance Engine — Zod Schema Validation", () => {
  it("validates valid markAttendance input", () => {
    const valid = markAttendanceSchema.safeParse({
      sessionId: "session-123",
      athleteId: "athlete-456",
      status: "PRESENT",
      notes: "Hadir tepat waktu",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const invalid = markAttendanceSchema.safeParse({
      sessionId: "session-123",
      athleteId: "athlete-456",
      status: "INVALID_STATUS",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects empty sessionId or athleteId", () => {
    const invalidSession = markAttendanceSchema.safeParse({
      sessionId: "",
      athleteId: "athlete-456",
      status: "PRESENT",
    });
    expect(invalidSession.success).toBe(false);

    const invalidAthlete = markAttendanceSchema.safeParse({
      sessionId: "session-123",
      athleteId: "   ",
      status: "PRESENT",
    });
    expect(invalidAthlete.success).toBe(false);
  });

  it("rejects notes longer than 500 characters", () => {
    const longNotes = "a".repeat(501);
    const invalid = markAttendanceSchema.safeParse({
      sessionId: "session-123",
      athleteId: "athlete-456",
      status: "EXCUSED",
      notes: longNotes,
    });
    expect(invalid.success).toBe(false);
  });

  it("validates batchMarkAttendanceSchema with multiple athletes", () => {
    const validBatch = batchMarkAttendanceSchema.safeParse({
      sessionId: "session-123",
      items: [
        { athleteId: "ath-1", status: "PRESENT" },
        { athleteId: "ath-2", status: "LATE", notes: "Macet 10 menit" },
        { athleteId: "ath-3", status: "EXCUSED", notes: "Sakit demam" },
      ],
    });
    expect(validBatch.success).toBe(true);
  });

  it("rejects empty batch list", () => {
    const invalidBatch = batchMarkAttendanceSchema.safeParse({
      sessionId: "session-123",
      items: [],
    });
    expect(invalidBatch.success).toBe(false);
  });

  it("validates resetAttendanceSchema", () => {
    const validReset = resetAttendanceSchema.safeParse({
      sessionId: "session-123",
      athleteId: "ath-1",
    });
    expect(validReset.success).toBe(true);
  });
});
