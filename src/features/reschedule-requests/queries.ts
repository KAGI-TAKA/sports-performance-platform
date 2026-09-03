import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Get all reschedule requests for an organization (for Head Coach review).
 */
export async function listRescheduleRequests(
  organizationId: string,
  filter: "ALL" | "PENDING" | "APPROVED" | "REJECTED" = "ALL"
) {
  return prisma.rescheduleRequest.findMany({
    where: {
      organizationId,
      ...(filter !== "ALL" ? { status: filter } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      requestedBy: {
        include: { user: { select: { name: true, email: true } } },
      },
      reviewedBy: {
        include: { user: { select: { name: true } } },
      },
      scheduleSession: {
        select: { id: true, title: true, startTime: true, endTime: true, location: true },
      },
    },
  });
}

/**
 * Count pending reschedule requests for an organization (for badge count).
 */
export async function countPendingRescheduleRequests(organizationId: string) {
  return prisma.rescheduleRequest.count({
    where: { organizationId, status: "PENDING" },
  });
}

/**
 * Get existing reschedule request by session and member (to prevent duplicates).
 */
export async function getRescheduleRequestBySessionAndMember(
  sessionId: string,
  memberId: string
) {
  return prisma.rescheduleRequest.findUnique({
    where: { scheduleSessionId_requestedByMemberId: { scheduleSessionId: sessionId, requestedByMemberId: memberId } },
    select: { id: true, status: true, reason: true, createdAt: true },
  });
}

/**
 * Get reschedule requests for sessions assigned to an assistant coach.
 */
export async function listRescheduleRequestsByMember(memberId: string) {
  return prisma.rescheduleRequest.findMany({
    where: { requestedByMemberId: memberId },
    orderBy: { createdAt: "desc" },
    include: {
      scheduleSession: {
        select: { id: true, title: true, startTime: true, endTime: true },
      },
      reviewedBy: {
        include: { user: { select: { name: true } } },
      },
    },
  });
}
