import "server-only";
import { prisma } from "@/lib/prisma";
import type { DashboardStats, DashboardAthleteSummary } from "./types";

export async function getDashboardStats(organizationId: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Execute all independent database queries in a single parallel Promise.all call
  const [
    totalAthletes,
    assessmentsThisMonth,
    todaySessionsCount,
    draftAssessmentsCount,
    activeInjuriesCount,
    unloggedPastSessionsCount,
    completedAssessments,
    assessmentsThisMonthWithAthlete,
    completedAnalyses,
    rawUpcomingSessions,
    rawLatestAssessments,
    rawAthletesOverview,
  ] = await Promise.all([
    // 1. Active athletes count
    prisma.athlete.count({ where: { organizationId, isActive: true } }),

    // 2. Assessments conducted this month
    prisma.assessment.count({
      where: { organizationId, assessmentDate: { gte: startOfMonth } },
    }),

    // 3. Sessions scheduled for today
    prisma.scheduleSession.count({
      where: {
        organizationId,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    }),

    // 4. Assessments in DRAFT status
    prisma.assessment.count({
      where: { organizationId, status: "DRAFT" },
    }),

    // 5. Active athlete injuries (unrecovered)
    prisma.athleteInjuryHistory.count({
      where: {
        athlete: { organizationId, isActive: true },
        recoveredAt: null,
      },
    }),

    // 6. Past completed sessions missing a session log
    prisma.scheduleSession.count({
      where: {
        organizationId,
        startTime: { lt: now },
        status: "COMPLETED",
        sessionLogs: { none: {} },
      },
    }),

    // 7. Completed assessments for squad average calculation
    prisma.assessment.findMany({
      where: { organizationId, status: "COMPLETED", overallScore: { not: null } },
      select: { overallScore: true },
    }),

    // 8. Top active athlete grouping for current month
    prisma.assessment.groupBy({
      by: ["athleteId"],
      where: { organizationId, assessmentDate: { gte: startOfMonth } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),

    // 9. Completed analyses for 7-component squad average radar
    prisma.assessmentAnalysis.findMany({
      where: { assessment: { organizationId, status: "COMPLETED" } },
      select: { componentScores: true },
    }),

    // 10. Upcoming scheduled sessions
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

    // 11. Recent assessments table
    prisma.assessment.findMany({
      where: { organizationId },
      include: {
        athlete: { select: { id: true, fullName: true, position: true } },
      },
      orderBy: { assessmentDate: "desc" },
      take: 5,
    }),

    // 12. Active athletes quick directory overview
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

  // Squad average score calculation (null if no data)
  const avgScore =
    completedAssessments.length > 0
      ? Math.round(
          completedAssessments.reduce(
            (acc, cur) => acc + Number(cur.overallScore ?? 0),
            0
          ) / completedAssessments.length
        )
      : null;

  // Most active athlete resolution
  let topActiveAthlete: { fullName: string; count: number } | null = null;
  if (assessmentsThisMonthWithAthlete.length > 0) {
    const topEntry = assessmentsThisMonthWithAthlete[0];
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
