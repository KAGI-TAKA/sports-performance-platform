import "server-only";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { calculateAttendanceMetrics } from "./engine";
import type {
  SessionAthleteAttendanceItem,
  SessionAttendanceSummary,
  AthleteAttendanceHistoryItem,
  AttendanceStatus,
} from "./types";

/**
 * Retrieves the full attendance roster for a specific scheduled session.
 * Merges enrolled athletes with their current attendance record.
 */
export async function getSessionAttendanceList(
  sessionId: string
): Promise<{
  session: {
    id: string;
    title: string;
    status: string;
    startTime: string;
    endTime: string;
    coachId: string;
    coachName: string;
    location: string | null;
  };
  roster: SessionAthleteAttendanceItem[];
} | null> {
  const ctx = await requireOrgContext();

  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: sessionId,
      organizationId: ctx.organizationId,
    },
    include: {
      coach: {
        include: {
          user: { select: { name: true } },
        },
      },
      athletes: {
        include: {
          athlete: {
            select: {
              id: true,
              fullName: true,
              jerseyNumber: true,
              photoUrl: true,
              isActive: true,
            },
          },
        },
      },
      attendances: {
        include: {
          markedBy: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  // Build a lookup map of attendance records by athleteId
  const attendanceMap = new Map(
    session.attendances.map((att) => [att.athleteId, att])
  );

  const roster: SessionAthleteAttendanceItem[] = session.athletes
    .filter((sa) => sa.athlete.isActive)
    .map((sa) => {
      const att = attendanceMap.get(sa.athleteId);
      return {
        athleteId: sa.athlete.id,
        athleteName: sa.athlete.fullName,
        jerseyNumber: sa.athlete.jerseyNumber,
        photoUrl: sa.athlete.photoUrl,
        attendanceId: att ? att.id : null,
        status: (att?.status as AttendanceStatus) || "UNMARKED",
        checkInTime: att?.checkInTime ? att.checkInTime.toISOString() : null,
        notes: att?.notes || null,
        markedByMemberId: att?.markedByMemberId || null,
        markedByName: att?.markedBy?.user.name || null,
        updatedAt: att?.updatedAt ? att.updatedAt.toISOString() : null,
      };
    });

  return {
    session: {
      id: session.id,
      title: session.title,
      status: session.status,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      coachId: session.coachId,
      coachName: session.coach.user.name,
      location: session.location,
    },
    roster,
  };
}

/**
 * Retrieves aggregate attendance summary metrics for a session.
 */
export async function getSessionAttendanceSummary(
  sessionId: string
): Promise<SessionAttendanceSummary | null> {
  const data = await getSessionAttendanceList(sessionId);
  if (!data) return null;

  const statuses = data.roster.map((r) => r.status);
  const metrics = calculateAttendanceMetrics(statuses);

  return {
    sessionId: data.session.id,
    sessionTitle: data.session.title,
    sessionStatus: data.session.status as any,
    startTime: data.session.startTime,
    endTime: data.session.endTime,
    coachId: data.session.coachId,
    coachName: data.session.coachName,
    totalAthletes: metrics.totalAthletes,
    presentCount: metrics.presentCount,
    lateCount: metrics.lateCount,
    excusedCount: metrics.excusedCount,
    absentCount: metrics.absentCount,
    rescheduledCount: metrics.rescheduledCount,
    unmarkedCount: metrics.unmarkedCount,
    attendanceRate: metrics.attendanceRate,
  };
}

/**
 * Retrieves the historical attendance records for a specific athlete in the active organization.
 */
export async function getAthleteAttendanceHistory(
  athleteId: string,
  limit: number = 30
): Promise<AthleteAttendanceHistoryItem[]> {
  const ctx = await requireOrgContext();

  const rawRecords = await prisma.attendance.findMany({
    where: {
      athleteId,
      organizationId: ctx.organizationId,
    },
    orderBy: {
      session: { startTime: "desc" },
    },
    take: limit,
    include: {
      session: {
        include: {
          coach: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  return rawRecords.map((att) => ({
    attendanceId: att.id,
    sessionId: att.sessionId,
    sessionTitle: att.session.title,
    sessionDate: att.session.startTime.toISOString().split("T")[0],
    startTime: att.session.startTime.toISOString(),
    endTime: att.session.endTime.toISOString(),
    status: att.status as AttendanceStatus,
    checkInTime: att.checkInTime ? att.checkInTime.toISOString() : null,
    notes: att.notes,
    coachName: att.session.coach.user.name,
  }));
}
