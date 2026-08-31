import "server-only";
import { prisma } from "@/lib/prisma";
import {
  buildAthleteReTestInsight,
  summarizeReTestInsights,
  type RawAthleteWithAssessments,
  getWorkloadPeriodRangeJakarta,
  aggregateCoachWorkload,
  buildCoachingWorkloadSummary,
  type RawCoachMember,
  type RawWorkloadSession,
  classifySessionHealth,
  buildSessionHealthSummary,
  type RawHealthSession,
} from "./engine";
import type {
  AthleteReTestSummary,
  CoachingWorkloadSummary,
  WorkloadPeriod,
  SessionHealthSummary,
} from "./types";
import { getZonedParts, parseLocalDateTimeToUTC, DEFAULT_SCHEDULE_TIMEZONE } from "@/features/schedule/utils";

export interface GetReTestIntelligenceOptions {
  coachMemberId?: string;
  role?: string;
  now?: Date;
  limit?: number;
}

/**
 * Server query that retrieves the active athlete roster with their latest completed assessments
 * and evaluates their re-test intelligence status (Anti-N+1 batch query).
 */
export async function getAthleteReTestIntelligence(
  organizationId: string,
  options: GetReTestIntelligenceOptions = {}
): Promise<AthleteReTestSummary> {
  const { coachMemberId, role, now = new Date() } = options;

  const isAssistant = (role || "").toLowerCase() === "assistant_coach";

  // Batch query active athletes with their completed assessments
  const rawAthletes = await prisma.athlete.findMany({
    where: {
      organizationId,
      isActive: true,
      // If assistant coach scoping is strictly enabled for their assigned roster:
      ...(isAssistant && coachMemberId
        ? {
            scheduleSessions: {
              some: {
                session: {
                  coachId: coachMemberId,
                },
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      fullName: true,
      sportCategory: true,
      jerseyNumber: true,
      position: true,
      photoUrl: true,
      assessments: {
        where: {
          status: "COMPLETED",
        },
        orderBy: [{ assessmentDate: "desc" }, { createdAt: "desc" }],
        take: 5, // Take top 5 latest to evaluate valid non-future dates deterministically
        select: {
          id: true,
          status: true,
          assessmentDate: true,
          overallScore: true,
          overallGrade: true,
          createdAt: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const rawMapped: RawAthleteWithAssessments[] = rawAthletes.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    category: a.sportCategory,
    jerseyNumber: a.jerseyNumber,
    position: a.position,
    photoUrl: a.photoUrl,
    assessments: a.assessments.map((ass) => ({
      id: ass.id,
      status: ass.status,
      assessmentDate: ass.assessmentDate,
      overallScore: ass.overallScore ? Number(ass.overallScore) : null,
      overallGrade: ass.overallGrade,
      createdAt: ass.createdAt,
    })),
  }));

  const insights = rawMapped.map((a) => buildAthleteReTestInsight(a, now));

  // Sort insights: OVERDUE and DUE first, then DUE_SOON, NO_ASSESSMENT, and FRESH
  const statusPriority: Record<string, number> = {
    OVERDUE: 1,
    DUE: 2,
    DUE_SOON: 3,
    NO_ASSESSMENT: 4,
    FRESH: 5,
  };

  insights.sort((a, b) => {
    const pA = statusPriority[a.reTestStatus] || 99;
    const pB = statusPriority[b.reTestStatus] || 99;
    if (pA !== pB) return pA - pB;

    // If same status, sort by daysSince descending (longest without test first)
    const daysA = a.daysSinceAssessment ?? -1;
    const daysB = b.daysSinceAssessment ?? -1;
    return daysB - daysA;
  });

  return summarizeReTestInsights(insights);
}

// ============================================================
// P7-C2: COACHING WORKLOAD INTELLIGENCE SERVER QUERIES
// ============================================================

export interface GetCoachingWorkloadOptions {
  coachMemberId?: string;
  role?: string;
  period?: WorkloadPeriod;
  now?: Date;
}

/**
 * Server query that aggregates assistant coaching hours and workload distribution.
 * - Assistant Coach: scoped strictly to self (coachMemberId).
 * - Owner / Admin / Head Coach: retrieves all assistant coaches within the organization.
 * - Queries ScheduleSessions strictly using both startDate and endDate boundaries.
 */
export async function getCoachingWorkloadIntelligence(
  organizationId: string,
  options: GetCoachingWorkloadOptions = {}
): Promise<CoachingWorkloadSummary> {
  const { coachMemberId, role, period = "month", now = new Date() } = options;

  const isAssistant = (role || "").toLowerCase() === "assistant_coach";
  const periodRange = getWorkloadPeriodRangeJakarta(period, now);

  // 1. Batch query coaches within organization (Assistant self-only vs Management all assistants)
  const rawCoaches = await prisma.member.findMany({
    where: {
      organizationId,
      role: "assistant_coach",
      ...(isAssistant && coachMemberId ? { id: coachMemberId } : {}),
    },
    select: {
      id: true,
      role: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  const coachList: RawCoachMember[] = rawCoaches.map((c) => ({
    id: c.id,
    role: c.role,
    user: {
      name: c.user.name,
      email: c.user.email,
      image: c.user.image,
    },
  }));

  if (coachList.length === 0) {
    return buildCoachingWorkloadSummary([], periodRange);
  }

  // 2. Batch query sessions within both startDate AND endDate boundaries
  const rawSessions = await prisma.scheduleSession.findMany({
    where: {
      organizationId,
      coachId: { in: coachList.map((c) => c.id) },
      startTime: {
        gte: periodRange.startDate,
        lte: periodRange.endDate,
      },
    },
    select: {
      id: true,
      coachId: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  const sessionList: RawWorkloadSession[] = rawSessions.map((s) => ({
    id: s.id,
    coachId: s.coachId,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
  }));

  // 3. Aggregate each coach workload in memory (Zero N+1)
  const assistantsWorkload = coachList.map((coach) =>
    aggregateCoachWorkload(coach, sessionList, now)
  );

  // 4. Deterministic alphabetical ordering
  assistantsWorkload.sort((a, b) => a.coachName.localeCompare(b.coachName));

  return buildCoachingWorkloadSummary(assistantsWorkload, periodRange);
}

// ============================================================
// P7-C3: SESSION HEALTH INTELLIGENCE SERVER QUERIES
// ============================================================

export interface GetSessionHealthOptions {
  coachMemberId?: string;
  role?: string;
  lookbackDays?: number;
  now?: Date;
}

/**
 * Server query that retrieves operational session health and anomaly intelligence.
 * - Assistant Coach: scoped strictly to sessions coached by self.
 * - Management: audits all organization sessions.
 * - Audit window: defaults to rolling 30 days before today through end of today in Asia/Jakarta.
 */
export async function getSessionHealthIntelligence(
  organizationId: string,
  options: GetSessionHealthOptions = {}
): Promise<SessionHealthSummary> {
  const { coachMemberId, role, lookbackDays = 30, now = new Date() } = options;
  const isAssistant = (role || "").toLowerCase() === "assistant_coach";

  const parts = getZonedParts(now, DEFAULT_SCHEDULE_TIMEZONE);
  const nowUtcIso = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;

  // Start of lookback window (e.g. 30 days ago 00:00 WIB)
  const startMidnightUtc = Date.UTC(parts.year, parts.month - 1, parts.day) - (lookbackDays - 1) * 24 * 60 * 60 * 1000;
  const startDateObj = new Date(startMidnightUtc);
  const sParts = getZonedParts(startDateObj, "UTC");
  const startStr = `${sParts.year}-${String(sParts.month).padStart(2, "0")}-${String(sParts.day).padStart(2, "0")}`;

  const windowStart = parseLocalDateTimeToUTC(`${startStr}T00:00:00`, DEFAULT_SCHEDULE_TIMEZONE);
  const windowEnd = parseLocalDateTimeToUTC(`${nowUtcIso}T23:59:59`, DEFAULT_SCHEDULE_TIMEZONE);

  const rawSessions = await prisma.scheduleSession.findMany({
    where: {
      organizationId,
      ...(isAssistant && coachMemberId ? { coachId: coachMemberId } : {}),
      startTime: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
    select: {
      id: true,
      title: true,
      coachId: true,
      startTime: true,
      endTime: true,
      status: true,
      coach: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      athletes: {
        select: {
          athlete: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      attendances: {
        select: {
          athleteId: true,
          status: true,
        },
      },
      sessionLogs: {
        select: {
          id: true,
          athleteId: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  const sessionList: RawHealthSession[] = rawSessions.map((s) => ({
    id: s.id,
    title: s.title,
    coachId: s.coachId,
    coachName: s.coach.user.name,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    athletes: s.athletes.map((a) => ({
      id: a.athlete.id,
      fullName: a.athlete.fullName,
    })),
    attendances: s.attendances.map((att) => ({
      athleteId: att.athleteId,
      status: att.status,
    })),
    sessionLogs: s.sessionLogs.map((log) => ({
      id: log.id,
      athleteId: log.athleteId,
    })),
  }));

  const evaluatedItems = sessionList.map((s) =>
    classifySessionHealth(s, now, DEFAULT_SCHEDULE_TIMEZONE)
  );

  return buildSessionHealthSummary(evaluatedItems);
}
