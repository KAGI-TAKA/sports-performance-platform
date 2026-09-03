import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, ScheduleStatus } from "@prisma/client";

export async function listScheduleSessions(
  organizationId: string,
  opts?: {
    startDate?: Date;
    endDate?: Date;
    coachId?: string;
    executorId?: string;
    athleteId?: string;
    status?: ScheduleStatus;
  }
) {
  const where: Prisma.ScheduleSessionWhereInput = {
    organizationId,
  };

  if (opts?.startDate || opts?.endDate) {
    where.startTime = {};
    if (opts.startDate) where.startTime.gte = opts.startDate;
    if (opts.endDate) where.startTime.lte = opts.endDate;
  }

  if (opts?.coachId && opts.coachId !== "ALL") {
    where.coachId = opts.coachId;
  }

  if (opts?.executorId && opts.executorId !== "ALL") {
    where.OR = [
      { executorId: opts.executorId },
      { executorId: null, coachId: opts.executorId },
    ];
  }

  if (opts?.status) {
    where.status = opts.status;
  }

  if (opts?.athleteId && opts.athleteId !== "ALL") {
    where.athletes = {
      some: {
        athleteId: opts.athleteId,
      },
    };
  }

  return prisma.scheduleSession.findMany({
    where,
    include: {
      coach: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      executor: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      trainingPlan: {
        select: {
          id: true,
          title: true,
          athleteId: true,
          exercises: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              name: true,
              sets: true,
              reps: true,
              restSeconds: true,
              notes: true,
            },
          },
        },
      },
      athletes: {
        include: {
          athlete: {
            select: {
              id: true,
              fullName: true,
              jerseyNumber: true,
              position: true,
              photoUrl: true,
            },
          },
        },
      },
      rescheduleRequests: {
        select: {
          id: true,
          status: true,
          reason: true,
          requestedByMemberId: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getScheduleSessionById(
  organizationId: string,
  sessionId: string
) {
  return prisma.scheduleSession.findFirst({
    where: { id: sessionId, organizationId },
    include: {
      coach: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      executor: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      trainingPlan: {
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
        },
      },
      athletes: {
        include: {
          athlete: true,
        },
      },
      rescheduleRequests: {
        select: {
          id: true,
          status: true,
          reason: true,
          requestedByMemberId: true,
        },
      },
    },
  });
}

export async function listCoachesForOrg(organizationId: string) {
  return prisma.member.findMany({
    where: { organizationId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function listActiveAthletesForOrg(organizationId: string) {
  return prisma.athlete.findMany({
    where: { organizationId, isActive: true },
    select: {
      id: true,
      fullName: true,
      jerseyNumber: true,
      position: true,
    },
    orderBy: { fullName: "asc" },
  });
}
