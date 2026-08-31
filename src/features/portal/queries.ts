import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import type {
  PortalAccessContext,
  PortalAccessErrorCode,
  PortalAthleteProfile,
  PortalAssessmentSnapshot,
  PortalComponentTrend,
  PortalTrainingPlan,
  PortalScheduleSession,
  PortalSessionLog,
  PortalReportItem,
  PortalAchievementData,
  PortalPersonalBestItem,
  PortalAthleteGoalItem,
} from "./types";
import { getAthleteProgressSummary } from "@/features/analytics/queries";
import { getAthleteAchievements } from "./achievements";
import {
  calculatePersonalBest,
  resolveCurrentValue,
  calculateGoalProgress,
} from "@/features/athlete-goals/engine";

export function hashPortalToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

export async function getPortalContextByToken(
  rawToken: string
): Promise<
  | { success: true; context: PortalAccessContext }
  | { success: false; error: PortalAccessErrorCode }
> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length > 256) {
    return { success: false, error: "INVALID_TOKEN" };
  }

  const tokenHash = hashPortalToken(rawToken);

  let access = await prisma.portalAccess.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      organizationId: true,
      athleteId: true,
      accessType: true,
      expiresAt: true,
      revokedAt: true,
      organization: { select: { name: true } },
      athlete: { select: { fullName: true, isActive: true } },
    },
  });

  // Fallback: jika parameter yang di-pass sudah berupa tokenHash langsung
  if (!access) {
    access = await prisma.portalAccess.findUnique({
      where: { tokenHash: rawToken },
      select: {
        id: true,
        organizationId: true,
        athleteId: true,
        accessType: true,
        expiresAt: true,
        revokedAt: true,
        organization: { select: { name: true } },
        athlete: { select: { fullName: true, isActive: true } },
      },
    });
  }

  // Fallback: jika parameter yang di-pass adalah ID portalAccess langsung (misal untuk endpoint PDF)
  if (!access) {
    access = await prisma.portalAccess.findUnique({
      where: { id: rawToken },
      select: {
        id: true,
        organizationId: true,
        athleteId: true,
        accessType: true,
        expiresAt: true,
        revokedAt: true,
        organization: { select: { name: true } },
        athlete: { select: { fullName: true, isActive: true } },
      },
    });
  }

  if (!access) {
    return { success: false, error: "INVALID_TOKEN" };
  }

  if (access.revokedAt != null) {
    return { success: false, error: "REVOKED_TOKEN" };
  }

  if (new Date() > new Date(access.expiresAt)) {
    return { success: false, error: "EXPIRED_TOKEN" };
  }

  if (!access.athlete.isActive) {
    return { success: false, error: "INACTIVE_ATHLETE" };
  }

  return {
    success: true,
    context: {
      portalAccessId: access.id,
      organizationId: access.organizationId,
      organizationName: access.organization.name,
      athleteId: access.athleteId,
      athleteName: access.athlete.fullName,
      accessType: access.accessType as "ATHLETE" | "PARENT",
      expiresAt: access.expiresAt,
    },
  };
}

async function resolveContext(
  input: string | PortalAccessContext
): Promise<PortalAccessContext | null> {
  if (typeof input === "object" && input !== null && "portalAccessId" in input) {
    return input;
  }
  const auth = await getPortalContextByToken(input);
  return auth.success ? auth.context : null;
}

export async function getPortalAthleteProfile(input: string | PortalAccessContext): Promise<{
  context: PortalAccessContext;
  profile: PortalAthleteProfile;
  latestSnapshot: PortalAssessmentSnapshot | null;
} | null> {
  const context = await resolveContext(input);
  if (!context) return null;

  const athlete = await prisma.athlete.findFirst({
    where: {
      id: context.athleteId,
      organizationId: context.organizationId,
      isActive: true,
    },
  });

  if (!athlete) return null;

  const now = new Date();
  const dob = new Date(athlete.dateOfBirth);
  const age = Math.floor(
    (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const profile: PortalAthleteProfile = {
    id: athlete.id,
    fullName: athlete.fullName,
    jerseyNumber: athlete.jerseyNumber,
    position: athlete.position,
    gender: athlete.gender,
    dateOfBirth: dob.toISOString().split("T")[0],
    age,
    photoUrl: athlete.photoUrl,
    parentName: athlete.parentName,
    competitionLevel: athlete.competitionLevel,
  };

  const latestAssessment = await prisma.assessment.findFirst({
    where: {
      athleteId: context.athleteId,
      organizationId: context.organizationId,
      status: "COMPLETED",
    },
    orderBy: [{ assessmentDate: "desc" }, { createdAt: "desc" }],
    include: { analysis: true },
  });

  let latestSnapshot: PortalAssessmentSnapshot | null = null;

  if (latestAssessment) {
    latestSnapshot = {
      assessmentId: latestAssessment.id,
      assessmentDate: new Date(latestAssessment.assessmentDate)
        .toISOString()
        .split("T")[0],
      overallScore: latestAssessment.overallScore
        ? Number(latestAssessment.overallScore)
        : null,
      overallGrade: latestAssessment.overallGrade,
      bestComponent: latestAssessment.analysis?.bestComponent ?? null,
      weakestComponents:
        latestAssessment.analysis?.weakestComponents ?? [],
      insightText: latestAssessment.analysis?.insightText ?? null,
      recommendationText:
        latestAssessment.analysis?.recommendationText ?? null,
    };
  }

  return { context, profile, latestSnapshot };
}

export async function getPortalAthleteProgress(input: string | PortalAccessContext): Promise<{
  context: PortalAccessContext;
  overallScore: number | null;
  overallGrade: string | null;
  trends: PortalComponentTrend[];
  totalAssessments: number;
} | null> {
  const context = await resolveContext(input);
  if (!context) return null;

  const progress = await getAthleteProgressSummary(
    context.organizationId,
    context.athleteId
  );

  if (!progress) {
    return {
      context,
      overallScore: null,
      overallGrade: null,
      trends: [],
      totalAssessments: 0,
    };
  }

  const trends: PortalComponentTrend[] = Object.values(
    progress.componentTrends
  ).map((t) => ({
    component: t.component,
    latestScore: t.latestScore,
    previousScore: t.previousScore,
    change: t.delta,
    status: t.trend,
  }));

  return {
    context,
    overallScore: progress.latestScore,
    overallGrade: progress.latestGrade,
    trends,
    totalAssessments: progress.totalAssessments,
  };
}

export async function getPortalAthleteTrainingPlan(
  input: string | PortalAccessContext
): Promise<{
  context: PortalAccessContext;
  plan: PortalTrainingPlan | null;
} | null> {
  const context = await resolveContext(input);
  if (!context) return null;

  const plan = await prisma.trainingPlan.findFirst({
    where: {
      organizationId: context.organizationId,
      athleteId: context.athleteId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: { orderBy: { order: "asc" } },
    },
  });

  if (!plan) {
    return { context, plan: null };
  }

  const mappedPlan: PortalTrainingPlan = {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    startDate: plan.startDate
      ? new Date(plan.startDate).toISOString().split("T")[0]
      : null,
    endDate: plan.endDate
      ? new Date(plan.endDate).toISOString().split("T")[0]
      : null,
    exercises: plan.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds,
      notes: ex.notes,
      order: ex.order,
    })),
  };

  return { context, plan: mappedPlan };
}

export async function getPortalAthleteSchedule(
  input: string | PortalAccessContext
): Promise<{
  context: PortalAccessContext;
  sessions: PortalScheduleSession[];
} | null> {
  const context = await resolveContext(input);
  if (!context) return null;

  const rawSessions = await prisma.scheduleSession.findMany({
    where: {
      organizationId: context.organizationId,
      athletes: { some: { athleteId: context.athleteId } },
      startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: { startTime: "asc" },
    take: 10,
    include: {
      coach: { include: { user: { select: { name: true } } } },
      trainingPlan: { select: { title: true } },
    },
  });

  const sessions: PortalScheduleSession[] = rawSessions.map((s) => ({
    id: s.id,
    title: s.title,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
    status: s.status,
    location: s.location,
    coachName: s.coach.user.name,
    trainingPlanTitle: s.trainingPlan?.title ?? null,
  }));

  return { context, sessions };
}

export async function getPortalAthleteSessionLogs(
  input: string | PortalAccessContext
): Promise<{
  context: PortalAccessContext;
  logs: PortalSessionLog[];
} | null> {
  const context = await resolveContext(input);
  if (!context) return null;

  const rawLogs = await prisma.sessionLog.findMany({
    where: {
      organizationId: context.organizationId,
      athleteId: context.athleteId,
    },
    orderBy: { sessionDate: "desc" },
    take: 15,
  });

  const logs: PortalSessionLog[] = rawLogs.map((l) => ({
    id: l.id,
    sessionDate: new Date(l.sessionDate).toISOString().split("T")[0],
    activitiesDone: l.activitiesDone,
    coachFeedback: l.coachFeedback,
    videoUrl: l.videoUrl,
  }));

  return { context, logs };
}

export async function getPortalAthleteReports(input: string | PortalAccessContext): Promise<{
  context: PortalAccessContext;
  reports: PortalReportItem[];
} | null> {
  const context = await resolveContext(input);
  if (!context) return null;

  const assessments = await prisma.assessment.findMany({
    where: {
      organizationId: context.organizationId,
      athleteId: context.athleteId,
      status: "COMPLETED",
    },
    orderBy: { assessmentDate: "desc" },
  });

  const reports: PortalReportItem[] = assessments.map((a) => ({
    assessmentId: a.id,
    assessmentDate: new Date(a.assessmentDate).toISOString().split("T")[0],
    overallScore: a.overallScore ? Number(a.overallScore) : null,
    overallGrade: a.overallGrade,
    pdfUrl: `/api/portal/pdf/${encodeURIComponent(context.portalAccessId)}/${a.id}`,
  }));

  return { context, reports };
}

export async function getPortalAthleteAchievements(
  input: string | PortalAccessContext,
  cachedTrends?: PortalComponentTrend[],
  cachedReports?: PortalReportItem[]
): Promise<{
  context: PortalAccessContext;
  achievements: PortalAchievementData;
} | null> {
  const context = await resolveContext(input);
  if (!context) return null;

  const [assessmentsCount, latestAssessment, completedSessionsCount] = await Promise.all([
    prisma.assessment.count({
      where: {
        organizationId: context.organizationId,
        athleteId: context.athleteId,
        status: "COMPLETED",
      },
    }),
    prisma.assessment.findFirst({
      where: {
        organizationId: context.organizationId,
        athleteId: context.athleteId,
        status: "COMPLETED",
      },
      orderBy: [{ assessmentDate: "desc" }, { createdAt: "desc" }],
      include: { analysis: true },
    }),
    prisma.scheduleSession.count({
      where: {
        organizationId: context.organizationId,
        athletes: { some: { athleteId: context.athleteId } },
        status: "COMPLETED",
      },
    }),
  ]);

  let trends = cachedTrends;
  if (!trends) {
    const progressData = await getPortalAthleteProgress(context);
    trends = progressData?.trends ?? [];
  }

  let reports = cachedReports;
  if (!reports) {
    const reportsData = await getPortalAthleteReports(context);
    reports = reportsData?.reports ?? [];
  }

  const overallScore = latestAssessment?.overallScore
    ? Number(latestAssessment.overallScore)
    : null;
  const overallGrade = latestAssessment?.overallGrade ?? null;
  const bestComponent = latestAssessment?.analysis?.bestComponent ?? null;

  const achievements = getAthleteAchievements({
    totalAssessments: assessmentsCount,
    completedSessions: completedSessionsCount,
    overallScore,
    overallGrade,
    bestComponent,
    trends,
    reports,
  });

  return { context, achievements };
}

export async function getPortalAthleteGuidances(input: string | PortalAccessContext) {
  const context = await resolveContext(input);
  if (!context) return null;

  const guidances = await prisma.coachGuidance.findMany({
    where: {
      organizationId: context.organizationId,
      OR: [
        { athleteId: null },
        { athleteId: context.athleteId },
      ],
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: {
        include: {
          user: { select: { name: true } },
        },
      },
      athlete: { select: { fullName: true } },
    },
  });

  return {
    context,
    guidances: guidances.map((g) => ({
      id: g.id,
      organizationId: g.organizationId,
      authorId: g.authorId,
      authorName: g.author?.user?.name || "Coach Zulfi",
      athleteId: g.athleteId,
      athleteName: g.athlete?.fullName,
      title: g.title,
      category: g.category,
      content: g.content,
      linkUrl: g.linkUrl,
      isPinned: g.isPinned,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    })),
  };
}

// ── P6-B4: Portal-Safe Performance Overview & Goals ───────────────────────────

/**
 * Portal-safe Personal Best + Current Performance query.
 * Accepts PortalAccessContext directly (no session auth required).
 * Returns only portal-safe fields — no organizationId, no internal flags.
 */
export async function getPortalAthletePerformanceOverview(
  ctx: PortalAccessContext
): Promise<{ personalBests: PortalPersonalBestItem[] }> {
  // 1. Fetch all completed numeric assessment results in one batch (no N+1)
  const resultItems = await prisma.assessmentResultItem.findMany({
    where: {
      assessment: {
        athleteId: ctx.athleteId,
        organizationId: ctx.organizationId,
        status: "COMPLETED",
      },
      testItem: { testType: "NUMERIC" },
      rawValue: { not: null },
    },
    select: {
      testItemId: true,
      rawValue: true,
      assessment: { select: { id: true, assessmentDate: true } },
      testItem: {
        select: {
          id: true,
          name: true,
          unit: true,
          scoreDirection: true,
          physicalComponent: true,
        },
      },
    },
    orderBy: { assessment: { assessmentDate: "desc" } },
  });

  // 2. Group by testItemId
  const grouped = new Map<
    string,
    {
      testItem: {
        id: string;
        name: string;
        unit: string;
        scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
        physicalComponent: string | null;
      };
      history: { rawValue: number; assessmentDate: Date; assessmentId: string }[];
    }
  >();

  for (const item of resultItems) {
    if (item.rawValue === null) continue;
    const tId = item.testItemId;
    if (!grouped.has(tId)) {
      grouped.set(tId, {
        testItem: {
          id: item.testItem.id,
          name: item.testItem.name,
          unit: item.testItem.unit as string,
          scoreDirection: item.testItem.scoreDirection as "HIGHER_IS_BETTER" | "LOWER_IS_BETTER",
          physicalComponent: item.testItem.physicalComponent,
        },
        history: [],
      });
    }
    grouped.get(tId)!.history.push({
      rawValue: Number(item.rawValue),
      assessmentDate: new Date(item.assessment.assessmentDate),
      assessmentId: item.assessment.id,
    });
  }

  // 3. Compute PB + current for each testItem
  const personalBests: PortalPersonalBestItem[] = [];

  for (const [, entry] of grouped) {
    const pb = calculatePersonalBest(entry.testItem.scoreDirection, entry.history);
    if (!pb) continue;

    const current = resolveCurrentValue(entry.history);

    personalBests.push({
      testItemId: entry.testItem.id,
      testItemName: entry.testItem.name,
      unit: entry.testItem.unit,
      scoreDirection: entry.testItem.scoreDirection,
      physicalComponent: entry.testItem.physicalComponent,
      pbValue: pb.pbValue,
      achievedDate: pb.achievedDate.toISOString().split("T")[0],
      currentValue: current?.currentValue ?? null,
      currentDate: current?.assessmentDate
        ? current.assessmentDate.toISOString().split("T")[0]
        : null,
    });
  }

  return { personalBests };
}

/**
 * Portal-safe Athlete Goals query.
 * Accepts PortalAccessContext directly (no session auth required).
 * Strips: organizationId, createdByMemberId, internal coaching notes.
 * Returns only ACTIVE, ACHIEVED, PAUSED, EXPIRED goals (CANCELLED hidden).
 */
export async function getPortalAthleteGoals(
  ctx: PortalAccessContext
): Promise<PortalAthleteGoalItem[]> {
  // 1. Fetch goals (exclude CANCELLED)
  const goals = await prisma.athleteGoal.findMany({
    where: {
      athleteId: ctx.athleteId,
      organizationId: ctx.organizationId,
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      testItemId: true,
      unit: true,
      title: true,
      baselineValue: true,
      targetValue: true,
      targetDate: true,
      status: true,
      achievedAt: true,
      achievedAssessmentId: true,
      testItem: {
        select: {
          name: true,
          scoreDirection: true,
        },
      },
    },
    orderBy: [
      { status: "asc" }, // ACTIVE first
      { createdAt: "desc" },
    ],
  });

  if (goals.length === 0) return [];

  // 2. Fetch current performance in one batch for progress calculation
  const resultItems = await prisma.assessmentResultItem.findMany({
    where: {
      assessment: {
        athleteId: ctx.athleteId,
        organizationId: ctx.organizationId,
        status: "COMPLETED",
      },
      testItemId: { in: goals.map((g) => g.testItemId) },
      rawValue: { not: null },
    },
    select: {
      testItemId: true,
      rawValue: true,
      assessment: { select: { id: true, assessmentDate: true } },
    },
    orderBy: { assessment: { assessmentDate: "desc" } },
  });

  // 3. Resolve current value per testItem
  const historyByTestItem = new Map<
    string,
    { rawValue: number; assessmentDate: Date; assessmentId: string }[]
  >();

  for (const item of resultItems) {
    if (item.rawValue === null) continue;
    const key = item.testItemId;
    if (!historyByTestItem.has(key)) historyByTestItem.set(key, []);
    historyByTestItem.get(key)!.push({
      rawValue: Number(item.rawValue),
      assessmentDate: new Date(item.assessment.assessmentDate),
      assessmentId: item.assessment.id,
    });
  }

  // 4. Map goals to portal-safe format
  return goals.map((g) => {
    const history = historyByTestItem.get(g.testItemId) ?? [];
    const current = resolveCurrentValue(history);
    const progress = calculateGoalProgress(
      Number(g.baselineValue),
      Number(g.targetValue),
      current?.currentValue ?? null,
      g.testItem.scoreDirection
    );

    return {
      id: g.id,
      testItemName: g.testItem.name,
      unit: g.unit as string,
      title: g.title,
      baselineValue: Number(g.baselineValue),
      targetValue: Number(g.targetValue),
      currentValue: current?.currentValue ?? null,
      targetDate: g.targetDate
        ? new Date(g.targetDate).toISOString().split("T")[0]
        : null,
      status: g.status as PortalAthleteGoalItem["status"],
      progressPercent: progress.progressPercent,
      deltaFromBaseline: progress.deltaFromBaseline,
      isImproving: progress.isImproving,
      state: progress.state as PortalAthleteGoalItem["state"],
      achievedAt: g.achievedAt
        ? new Date(g.achievedAt).toISOString().split("T")[0]
        : null,
      achievedAssessmentId: g.achievedAssessmentId,
    };
  });
}
