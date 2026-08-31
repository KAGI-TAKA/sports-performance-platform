import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import {
  calculateOverallSatisfaction,
  calculateComponentAverages,
  calculateResponseRate,
  calculateTrend,
} from "./engine";
import type {
  TimeRangeFilter,
  AssistantPerformanceSummary,
  AssistantFeedbackItem,
  AssistantPerformanceDetail,
} from "./types";

/**
 * Retrieves performance overview for assistant coaches.
 * - Admin/Head Coach: Sees all assistant coaches in organization.
 * - Assistant Coach: Sees ONLY their own performance aggregate.
 */
export async function getAssistantPerformanceList(options?: {
  timeRange?: TimeRangeFilter;
}): Promise<{
  success: boolean;
  role: string;
  isSupervisory: boolean;
  assistants: AssistantPerformanceSummary[];
  unreviewedFeedbackCount: number;
}> {
  const ctx = await requireOrgContext();
  const timeRange = options?.timeRange ?? "30d";

  const isSupervisory =
    ctx.role === "admin" || ctx.role === "head_coach" || (ctx.role as string) === "owner";

  // Filter coaches based on role
  let targetMembers: Array<{
    id: string;
    role: string;
    user: { name: string; email: string };
  }> = [];

  if (isSupervisory) {
    targetMembers = await prisma.member.findMany({
      where: {
        organizationId: ctx.organizationId,
        role: "assistant_coach",
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: {
        user: { name: "asc" }, // Alphabetical default - strictly NO ranking
      },
    });
  } else if (ctx.role === "assistant_coach") {
    const self = await prisma.member.findFirst({
      where: {
        id: ctx.memberId,
        organizationId: ctx.organizationId,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    if (self) {
      targetMembers = [self];
    }
  }

  // Calculate unreviewed feedback count for organization (for supervisory badge)
  const unreviewedCount = isSupervisory
    ? await prisma.parentFeedback.count({
        where: {
          organizationId: ctx.organizationId,
          isReviewed: false,
        },
      })
    : 0;

  if (targetMembers.length === 0) {
    return {
      success: true,
      role: ctx.role,
      isSupervisory,
      assistants: [],
      unreviewedFeedbackCount: unreviewedCount,
    };
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  // Define date filters for current and comparison periods
  let currentPeriodFilter: { gte?: Date; lt?: Date } | undefined;
  let prevPeriodFilter: { gte?: Date; lt?: Date } | undefined;

  if (timeRange === "30d") {
    currentPeriodFilter = { gte: thirtyDaysAgo };
    prevPeriodFilter = { gte: sixtyDaysAgo, lt: thirtyDaysAgo };
  } else if (timeRange === "90d") {
    currentPeriodFilter = { gte: ninetyDaysAgo };
    prevPeriodFilter = { gte: oneEightyDaysAgo, lt: ninetyDaysAgo };
  }

  const summaries: AssistantPerformanceSummary[] = await Promise.all(
    targetMembers.map(async (member) => {
      // 1. Completed sessions assigned to this assistant
      const sessions = await prisma.scheduleSession.findMany({
        where: {
          organizationId: ctx.organizationId,
          coachId: member.id,
          status: "COMPLETED",
          ...(currentPeriodFilter ? { startTime: currentPeriodFilter } : {}),
        },
        select: {
          id: true,
        },
      });

      const sessionIds = sessions.map((s) => s.id);

      // 2. Eligible opportunities: Athletes who attended (PRESENT or LATE) in those completed sessions
      const eligibleOpportunities =
        sessionIds.length > 0
          ? await prisma.attendance.count({
              where: {
                organizationId: ctx.organizationId,
                sessionId: { in: sessionIds },
                status: { in: ["PRESENT", "LATE"] },
              },
            })
          : 0;

      // 3. Parent feedbacks received in current period
      const feedbacks = await prisma.parentFeedback.findMany({
        where: {
          organizationId: ctx.organizationId,
          coachMemberId: member.id,
          ...(currentPeriodFilter ? { createdAt: currentPeriodFilter } : {}),
        },
        select: {
          sessionRating: true,
          communicationRating: true,
          athleteAttentionRating: true,
          isReviewed: true,
        },
      });

      // 4. Feedbacks for trend comparison (previous equal period)
      const prevFeedbacks = prevPeriodFilter
        ? await prisma.parentFeedback.findMany({
            where: {
              organizationId: ctx.organizationId,
              coachMemberId: member.id,
              createdAt: prevPeriodFilter,
            },
            select: {
              sessionRating: true,
              communicationRating: true,
              athleteAttentionRating: true,
            },
          })
        : [];

      const currentAvg = calculateOverallSatisfaction(feedbacks);
      const prevAvg = calculateOverallSatisfaction(prevFeedbacks);
      const compAverages = calculateComponentAverages(feedbacks);
      const responseRate = calculateResponseRate(feedbacks.length, eligibleOpportunities);
      const trend = calculateTrend(currentAvg, prevAvg, feedbacks.length, prevFeedbacks.length);

      const unreviewedForMember = feedbacks.filter((f) => !f.isReviewed).length;

      return {
        coachMemberId: member.id,
        coachName: member.user.name,
        coachEmail: member.user.email,
        role: member.role,
        totalSessions: sessions.length,
        eligibleOpportunities,
        feedbackVolume: feedbacks.length,
        responseRate,
        overallSatisfaction: currentAvg,
        sessionQualityRating: compAverages.sessionQuality,
        communicationRating: compAverages.communication,
        athleteAttentionRating: compAverages.athleteAttention,
        trendDiff: trend.diff,
        trendStatus: trend.status,
        trendLabel: trend.label,
        sampleSizeSufficient: feedbacks.length >= 3 && prevFeedbacks.length >= 3,
        unreviewedCount: unreviewedForMember,
      };
    })
  );

  return {
    success: true,
    role: ctx.role,
    isSupervisory,
    assistants: summaries,
    unreviewedFeedbackCount: unreviewedCount,
  };
}

/**
 * Retrieves detailed performance and feedback items for an individual assistant coach.
 * - Assistant Coach: Cannot see athlete names, raw comments, or headCoachNotes.
 * - Head Coach / Admin: Sees full supervisory feedback details and can review.
 */
export async function getAssistantDetailPerformance(
  coachMemberId: string
): Promise<AssistantPerformanceDetail | null> {
  const ctx = await requireOrgContext();

  const isSupervisory =
    ctx.role === "admin" || ctx.role === "head_coach" || (ctx.role as string) === "owner";

  // Authorization check
  if (!isSupervisory && ctx.memberId !== coachMemberId) {
    throw new Error("Unauthorized: Anda tidak memiliki akses ke data staf ini.");
  }

  const member = await prisma.member.findFirst({
    where: {
      id: coachMemberId,
      organizationId: ctx.organizationId,
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!member) return null;

  // Overview calculation
  const sessions = await prisma.scheduleSession.findMany({
    where: {
      organizationId: ctx.organizationId,
      coachId: member.id,
      status: "COMPLETED",
    },
    select: { id: true },
  });

  const sessionIds = sessions.map((s) => s.id);

  const eligibleOpportunities =
    sessionIds.length > 0
      ? await prisma.attendance.count({
          where: {
            organizationId: ctx.organizationId,
            sessionId: { in: sessionIds },
            status: { in: ["PRESENT", "LATE"] },
          },
        })
      : 0;

  const feedbacks = await prisma.parentFeedback.findMany({
    where: {
      organizationId: ctx.organizationId,
      coachMemberId: member.id,
    },
    include: {
      scheduleSession: { select: { id: true, title: true, startTime: true } },
      athlete: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const prevFeedbacks = await prisma.parentFeedback.findMany({
    where: {
      organizationId: ctx.organizationId,
      coachMemberId: member.id,
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
    select: {
      sessionRating: true,
      communicationRating: true,
      athleteAttentionRating: true,
    },
  });

  const current30dFeedbacks = feedbacks.filter((f) => f.createdAt >= thirtyDaysAgo);
  const current30dAvg = calculateOverallSatisfaction(current30dFeedbacks);
  const prev30dAvg = calculateOverallSatisfaction(prevFeedbacks);
  const trend = calculateTrend(current30dAvg, prev30dAvg, current30dFeedbacks.length, prevFeedbacks.length);

  const currentAvg = calculateOverallSatisfaction(feedbacks);
  const compAverages = calculateComponentAverages(feedbacks);
  const responseRate = calculateResponseRate(feedbacks.length, eligibleOpportunities);

  const summary: AssistantPerformanceSummary = {
    coachMemberId: member.id,
    coachName: member.user.name,
    coachEmail: member.user.email,
    role: member.role,
    totalSessions: sessions.length,
    eligibleOpportunities,
    feedbackVolume: feedbacks.length,
    responseRate,
    overallSatisfaction: currentAvg,
    sessionQualityRating: compAverages.sessionQuality,
    communicationRating: compAverages.communication,
    athleteAttentionRating: compAverages.athleteAttention,
    trendDiff: trend.diff,
    trendStatus: trend.status,
    trendLabel: trend.label,
    sampleSizeSufficient: current30dFeedbacks.length >= 3 && prevFeedbacks.length >= 3,
    unreviewedCount: feedbacks.filter((f) => !f.isReviewed).length,
  };

  // Build feedback items with strict privacy protection
  const feedbackItems: AssistantFeedbackItem[] = feedbacks.map((f) => {
    const composite =
      Math.round(
        ((f.sessionRating + f.communicationRating + f.athleteAttentionRating) / 3) * 10
      ) / 10;

    return {
      id: f.id,
      createdAt: f.createdAt.toISOString(),
      sessionId: f.scheduleSession.id,
      sessionTitle: f.scheduleSession.title,
      sessionDate: f.scheduleSession.startTime.toISOString(),
      // Privacy masks if not supervisory:
      athleteName: isSupervisory ? f.athlete.fullName : null,
      overallRating: composite,
      sessionRating: f.sessionRating,
      communicationRating: f.communicationRating,
      athleteAttentionRating: f.athleteAttentionRating,
      comment: isSupervisory ? f.comment : null,
      isReviewed: f.isReviewed,
      reviewedAt: f.reviewedAt ? f.reviewedAt.toISOString() : null,
      headCoachNotes: isSupervisory ? f.headCoachNotes : null,
    };
  });

  return {
    summary,
    feedbackItems,
    canReview: isSupervisory,
  };
}
