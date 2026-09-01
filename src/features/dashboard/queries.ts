import "server-only";
import { prisma } from "@/lib/prisma";
import type { DashboardStats, DashboardAthleteSummary } from "./types";

export async function getDashboardStats(organizationId: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Execute consolidated SQL CTE aggregation alongside list queries in parallel
  const [
    cteStatsResult,
    assessmentsThisMonthWithAthlete,
    completedAnalyses,
    rawUpcomingSessions,
    rawLatestAssessments,
    rawAthletesOverview,
  ] = await Promise.all([
    // 1. Consolidated Single CTE Query for all Counts & Squad Average
    prisma.$queryRaw<Array<{
      totalAthletes: number;
      assessmentsThisMonth: number;
      todaySessionsCount: number;
      draftAssessmentsCount: number;
      activeInjuriesCount: number;
      unloggedPastSessionsCount: number;
      squadAverageScore: number | null;
    }>>`
      WITH stats AS (
        SELECT
          (SELECT COUNT(*)::int FROM athlete WHERE "organizationId" = ${organizationId} AND "isActive" = true) AS active_athletes,
          (SELECT COUNT(*)::int FROM assessment WHERE "organizationId" = ${organizationId} AND "assessmentDate" >= ${startOfMonth}) AS month_assessments,
          (SELECT COUNT(*)::int FROM schedule_session WHERE "organizationId" = ${organizationId} AND "startTime" >= ${startOfDay} AND "startTime" <= ${endOfDay}) AS today_sessions,
          (SELECT COUNT(*)::int FROM assessment WHERE "organizationId" = ${organizationId} AND "status" = 'DRAFT') AS draft_assessments,
          (SELECT COUNT(*)::int FROM athlete_injury_history h JOIN athlete a ON h."athleteId" = a.id WHERE a."organizationId" = ${organizationId} AND a."isActive" = true AND h."recoveredAt" IS NULL) AS active_injuries,
          (SELECT COUNT(*)::int FROM schedule_session WHERE "organizationId" = ${organizationId} AND "startTime" < ${now} AND "status" = 'COMPLETED' AND NOT EXISTS (SELECT 1 FROM session_log WHERE "scheduleSessionId" = schedule_session.id)) AS unlogged_sessions,
          (SELECT AVG("overallScore")::numeric FROM assessment WHERE "organizationId" = ${organizationId} AND "status" = 'COMPLETED' AND "overallScore" IS NOT NULL) AS avg_score
      )
      SELECT 
        active_athletes AS "totalAthletes",
        month_assessments AS "assessmentsThisMonth",
        today_sessions AS "todaySessionsCount",
        draft_assessments AS "draftAssessmentsCount",
        active_injuries AS "activeInjuriesCount",
        unlogged_sessions AS "unloggedPastSessionsCount",
        ROUND(avg_score, 0)::int AS "squadAverageScore"
      FROM stats;
    `,

    // 2. Top active athlete grouping for current month
    prisma.assessment.groupBy({
      by: ["athleteId"],
      where: { organizationId, assessmentDate: { gte: startOfMonth } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),

    // 3. Completed analyses for 7-component squad average radar
    prisma.assessmentAnalysis.findMany({
      where: { assessment: { organizationId, status: "COMPLETED" } },
      select: { componentScores: true },
    }),

    // 4. Upcoming scheduled sessions
    prisma.scheduleSession.findMany({
      where: {
        organizationId,
        startTime: { gte: startOfDay },
      },
      include: {
        coach: { select: { user: { select: { name: true } } } },
        athletes: { select: { athleteId: true } },
      },
      orderBy: { startTime: "asc" },
      take: 6,
    }),

    // 5. Recent assessments table
    prisma.assessment.findMany({
      where: { organizationId },
      include: {
        athlete: { select: { id: true, fullName: true, position: true } },
      },
      orderBy: { assessmentDate: "desc" },
      take: 5,
    }),

    // 6. Active athletes quick directory overview
    prisma.athlete.findMany({
      where: { organizationId, isActive: true },
      orderBy: { fullName: "asc" },
      take: 8,
      select: {
        id: true,
        fullName: true,
        sportCategory: true,
        trainingLevel: true,
        dateOfBirth: true,
        injuryHistories: {
          where: { recoveredAt: null },
          select: { id: true },
        },
        assessments: {
          where: { status: "COMPLETED" },
          orderBy: [{ assessmentDate: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: { overallScore: true, overallGrade: true },
        },
        scheduleSessions: {
          where: { session: { startTime: { gte: startOfDay } } },
          orderBy: { session: { startTime: "asc" } },
          take: 1,
          select: { session: { select: { startTime: true } } },
        },
      },
    }),
  ]);

  const cteRow = cteStatsResult[0] || {
    totalAthletes: 0,
    assessmentsThisMonth: 0,
    todaySessionsCount: 0,
    draftAssessmentsCount: 0,
    activeInjuriesCount: 0,
    unloggedPastSessionsCount: 0,
    squadAverageScore: null,
  };

  const totalAthletes = cteRow.totalAthletes;
  const assessmentsThisMonth = cteRow.assessmentsThisMonth;
  const todaySessionsCount = cteRow.todaySessionsCount;
  const draftAssessmentsCount = cteRow.draftAssessmentsCount;
  const activeInjuriesCount = cteRow.activeInjuriesCount;
  const unloggedPastSessionsCount = cteRow.unloggedPastSessionsCount;
  const avgScore = cteRow.squadAverageScore;

  // Most active athlete resolution (resolve in-memory from fetched lists if available)
  let topActiveAthlete: { fullName: string; count: number } | null = null;
  if (assessmentsThisMonthWithAthlete.length > 0) {
    const topEntry = assessmentsThisMonthWithAthlete[0];
    const inMemoryAthlete =
      rawAthletesOverview.find((a) => a.id === topEntry.athleteId) ??
      rawLatestAssessments.find((a) => a.athlete.id === topEntry.athleteId)?.athlete;

    if (inMemoryAthlete) {
      topActiveAthlete = {
        fullName: inMemoryAthlete.fullName,
        count: topEntry._count.id,
      };
    } else {
      const athlete = await prisma.athlete.findFirst({
        where: { id: topEntry.athleteId, organizationId },
        select: { fullName: true },
      });
      if (athlete) {
        topActiveAthlete = {
          fullName: athlete.fullName,
          count: topEntry._count.id,
        };
      }
    }
  }

  // Component averages across completed assessment analyses
  let squadComponentScores: Record<string, number> | null = null;
  if (completedAnalyses.length > 0) {
    const compSums: Record<string, { total: number; count: number }> = {};
    completedAnalyses.forEach((a) => {
      let scores: Record<string, number> = {};
      try {
        scores =
          typeof a.componentScores === "string"
            ? JSON.parse(a.componentScores)
            : (a.componentScores as Record<string, number>);
      } catch {
        // Fallback for unexpected JSON shape
      }

      Object.entries(scores).forEach(([comp, score]) => {
        if (!compSums[comp]) compSums[comp] = { total: 0, count: 0 };
        compSums[comp].total += Number(score);
        compSums[comp].count += 1;
      });
    });

    squadComponentScores = {};
    Object.entries(compSums).forEach(([comp, data]) => {
      squadComponentScores![comp] = Math.round(data.total / data.count);
    });
  }

  // Transform raw session records
  const upcomingSessions = rawUpcomingSessions.map((s) => ({
    id: s.id,
    title: s.title,
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location,
    status: s.status,
    athleteCount: s.athletes.length,
    coachName: s.coach.user.name,
  }));

  // Transform raw assessment records
  const latestAssessments = rawLatestAssessments.map((a) => ({
    id: a.id,
    assessmentDate: a.assessmentDate,
    status: a.status,
    overallScore: a.overallScore ? Number(a.overallScore) : null,
    overallGrade: a.overallGrade,
    athlete: {
      id: a.athlete.id,
      fullName: a.athlete.fullName,
      position: a.athlete.position,
    },
  }));

  // Transform athletes overview
  const athletesOverview: DashboardAthleteSummary[] = rawAthletesOverview.map((ath) => {
    const dob = new Date(ath.dateOfBirth);
    const age = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const nextSession = ath.scheduleSessions[0]?.session;
    const nextSessionTime = nextSession
      ? `${new Date(nextSession.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
      : null;

    return {
      id: ath.id,
      fullName: ath.fullName,
      sportCategory: ath.sportCategory,
      trainingLevel: ath.trainingLevel,
      age,
      hasActiveInjury: ath.injuryHistories.length > 0,
      latestScore: ath.assessments[0]?.overallScore ? Number(ath.assessments[0].overallScore) : null,
      latestGrade: ath.assessments[0]?.overallGrade ?? null,
      nextSessionTime,
    };
  });

  return {
    totalAthletes,
    assessmentsThisMonth,
    todaySessionsCount,
    avgScore,
    topActiveAthlete,
    squadComponentScores,
    upcomingSessions,
    latestAssessments,
    attentionItems: {
      draftAssessmentsCount,
      activeInjuriesCount,
      unloggedSessionsCount: unloggedPastSessionsCount,
    },
    athletesOverview,
  };
}
