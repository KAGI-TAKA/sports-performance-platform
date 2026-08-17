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
} from "./types";

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

  const access = await prisma.portalAccess.findUnique({
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

export async function getPortalAthleteProfile(rawToken: string): Promise<{
  context: PortalAccessContext;
  profile: PortalAthleteProfile;
  latestSnapshot: PortalAssessmentSnapshot | null;
} | null> {
  const auth = await getPortalContextByToken(rawToken);
  if (!auth.success) return null;

  const { context } = auth;

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

import { getAthleteProgressSummary } from "@/features/analytics/queries";

export async function getPortalAthleteProgress(rawToken: string): Promise<{
  context: PortalAccessContext;
  overallScore: number | null;
  overallGrade: string | null;
  trends: PortalComponentTrend[];
  totalAssessments: number;
} | null> {
  const auth = await getPortalContextByToken(rawToken);
  if (!auth.success) return null;

  const { context } = auth;

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
  rawToken: string
): Promise<{
  context: PortalAccessContext;
  plan: PortalTrainingPlan | null;
} | null> {
  const auth = await getPortalContextByToken(rawToken);
  if (!auth.success) return null;

  const { context } = auth;

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
  rawToken: string
): Promise<{
  context: PortalAccessContext;
  sessions: PortalScheduleSession[];
} | null> {
  const auth = await getPortalContextByToken(rawToken);
  if (!auth.success) return null;

  const { context } = auth;

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
  rawToken: string
): Promise<{
  context: PortalAccessContext;
  logs: PortalSessionLog[];
} | null> {
  const auth = await getPortalContextByToken(rawToken);
  if (!auth.success) return null;

  const { context } = auth;

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

export async function getPortalAthleteReports(rawToken: string): Promise<{
  context: PortalAccessContext;
  reports: PortalReportItem[];
} | null> {
  const auth = await getPortalContextByToken(rawToken);
  if (!auth.success) return null;

  const { context } = auth;

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
    pdfUrl: `/api/portal/pdf/${encodeURIComponent(rawToken)}/${a.id}`,
  }));

  return { context, reports };
}
