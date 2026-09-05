import "server-only";
import { prisma } from "@/lib/prisma";
import { getPortalContextByToken } from "@/features/portal/queries";
import { requireOrgContext } from "@/lib/auth-context";
import {
  isFeedbackWindowValid,
  isAttendanceEligibleForFeedback,
  canMemberReviewFeedback,
} from "./engine";
import type {
  EligibleFeedbackSessionItem,
  ParentFeedbackPublicSummary,
  InternalFeedbackQueueItem,
} from "./types";

/**
 * Retrieves the list of completed sessions that are eligible for parent feedback.
 * Scoped to the authenticated parent's athlete within the 7-day feedback window.
 */
export async function getEligibleParentFeedbackSessions(
  rawToken: string
): Promise<{
  success: boolean;
  error?: string;
  sessions?: EligibleFeedbackSessionItem[];
}> {
  const authRes = await getPortalContextByToken(rawToken);
  if (!authRes.success) {
    return { success: false, error: "Akses portal tidak valid atau telah berakhir" };
  }

  const { context } = authRes;
  if (context.accessType !== "PARENT") {
    return {
      success: false,
      error: "Fitur umpan balik sesi hanya tersedia untuk portal orang tua",
    };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch completed sessions where athlete was registered within the last 7 days
  const sessions = await prisma.scheduleSession.findMany({
    where: {
      organizationId: context.organizationId,
      status: "COMPLETED",
      endTime: { gte: sevenDaysAgo, lte: now },
      athletes: {
        some: { athleteId: context.athleteId },
      },
    },
    orderBy: { endTime: "desc" },
    include: {
      coach: {
        include: {
          user: { select: { name: true } },
        },
      },
      executor: {
        include: {
          user: { select: { name: true } },
        },
      },
      attendances: {
        where: { athleteId: context.athleteId },
      },
      parentFeedbacks: {
        where: { athleteId: context.athleteId },
      },
    },
  });

  const eligibleItems: EligibleFeedbackSessionItem[] = [];

  for (const s of sessions) {
    const attendance = s.attendances[0];
    const isAttended = isAttendanceEligibleForFeedback(attendance?.status);
    if (!isAttended) continue; // Only PRESENT / LATE are eligible

    const windowCheck = isFeedbackWindowValid(s.endTime, now);
    const hasSubmittedFeedback = s.parentFeedbacks.length > 0;
    const canSubmitFeedback = windowCheck.valid && !hasSubmittedFeedback;

    eligibleItems.push({
      sessionId: s.id,
      sessionTitle: s.title,
      sessionDate: s.startTime.toISOString().split("T")[0],
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      coachName: s.executor?.user.name ?? s.coach.user.name,
      location: s.location,
      attendanceStatus: attendance.status as "PRESENT" | "LATE",
      hasSubmittedFeedback,
      canSubmitFeedback,
      expiryDate: windowCheck.expiryDate.toISOString(),
    });
  }

  return { success: true, sessions: eligibleItems };
}

/**
 * Retrieves the submitted parent feedback for a specific session.
 * Excludes internal supervisory notes for parent privacy.
 */
export async function getParentFeedbackForSession(
  rawToken: string,
  scheduleSessionId: string
): Promise<ParentFeedbackPublicSummary | null> {
  const authRes = await getPortalContextByToken(rawToken);
  if (!authRes.success || authRes.context.accessType !== "PARENT") {
    return null;
  }

  const { context } = authRes;

  const feedback = await prisma.parentFeedback.findUnique({
    where: {
      scheduleSessionId_athleteId: {
        scheduleSessionId,
        athleteId: context.athleteId,
      },
    },
    include: {
      coachMember: {
        include: {
          user: { select: { name: true } },
        },
      },
      scheduleSession: {
        include: {
          coach: {
            include: {
              user: { select: { name: true } },
            },
          },
          executor: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!feedback || feedback.organizationId !== context.organizationId) {
    return null;
  }

  return {
    feedbackId: feedback.id,
    scheduleSessionId: feedback.scheduleSessionId,
    sessionTitle: feedback.scheduleSession.title,
    sessionDate: feedback.scheduleSession.startTime.toISOString().split("T")[0],
    coachName: feedback.coachMember?.user.name ?? feedback.scheduleSession.executor?.user.name ?? feedback.scheduleSession.coach.user.name,
    sessionRating: feedback.sessionRating,
    communicationRating: feedback.communicationRating,
    athleteAttentionRating: feedback.athleteAttentionRating,
    comment: feedback.comment,
    createdAt: feedback.createdAt.toISOString(),
  };
}

/**
 * Retrieves the internal feedback review queue for Head Coach / Admin.
 */
export async function getInternalFeedbackQueue(options?: {
  isReviewed?: boolean;
  coachMemberId?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  error?: string;
  feedbacks?: InternalFeedbackQueueItem[];
}> {
  const ctx = await requireOrgContext();

  if (!canMemberReviewFeedback(ctx.role)) {
    return {
      success: false,
      error: "Anda tidak memiliki wewenang untuk melihat antrean feedback pelatih",
    };
  }

  const whereClause: any = {
    organizationId: ctx.organizationId,
  };

  if (options?.isReviewed !== undefined) {
    whereClause.isReviewed = options.isReviewed;
  }

  if (options?.coachMemberId) {
    whereClause.coachMemberId = options.coachMemberId;
  }

  const rawFeedbacks = await prisma.parentFeedback.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    include: {
      athlete: { select: { fullName: true } },
      coachMember: {
        include: {
          user: { select: { name: true } },
        },
      },
      scheduleSession: {
        select: {
          title: true,
          startTime: true,
        },
      },
    },
  });

  const feedbacks: InternalFeedbackQueueItem[] = rawFeedbacks.map((f) => ({
    id: f.id,
    organizationId: f.organizationId,
    scheduleSessionId: f.scheduleSessionId,
    sessionTitle: f.scheduleSession.title,
    sessionDate: f.scheduleSession.startTime.toISOString().split("T")[0],
    athleteId: f.athleteId,
    athleteName: f.athlete.fullName,
    coachMemberId: f.coachMemberId,
    coachName: f.coachMember.user.name,
    sessionRating: f.sessionRating,
    communicationRating: f.communicationRating,
    athleteAttentionRating: f.athleteAttentionRating,
    comment: f.comment,
    isReviewed: f.isReviewed,
    reviewedAt: f.reviewedAt ? f.reviewedAt.toISOString() : null,
    headCoachNotes: f.headCoachNotes,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  return { success: true, feedbacks };
}
