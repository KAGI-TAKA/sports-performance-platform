import type { AttendanceStatus, ScheduleStatus } from "@prisma/client";

export type { AttendanceStatus, ScheduleStatus };

export interface AttendanceRecord {
  id: string;
  organizationId: string;
  sessionId: string;
  athleteId: string;
  status: AttendanceStatus;
  checkInTime: string | null;
  notes: string | null;
  markedByMemberId: string | null;
  markedByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionAthleteAttendanceItem {
  athleteId: string;
  athleteName: string;
  jerseyNumber: number | null;
  photoUrl: string | null;
  attendanceId: string | null;
  status: AttendanceStatus;
  checkInTime: string | null;
  notes: string | null;
  markedByMemberId: string | null;
  markedByName: string | null;
  updatedAt: string | null;
}

export interface SessionAttendanceSummary {
  sessionId: string;
  sessionTitle: string;
  sessionStatus: ScheduleStatus;
  startTime: string;
  endTime: string;
  coachId: string;
  coachName: string;
  totalAthletes: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  absentCount: number;
  rescheduledCount: number;
  unmarkedCount: number;
  attendanceRate: number; // percentage (PRESENT + LATE) / totalAthletes
}

export interface AthleteAttendanceHistoryItem {
  attendanceId: string;
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: AttendanceStatus;
  checkInTime: string | null;
  notes: string | null;
  coachName: string;
}
