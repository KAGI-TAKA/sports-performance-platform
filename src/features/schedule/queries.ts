import "server-only";
import { prisma } from "@/lib/prisma";
import type { ScheduleStatus } from "@prisma/client";

export async function listScheduleSessions(
  organizationId: string,
  opts?: {
    startDate?: Date;
    endDate?: Date;
    coachId?: string;
    athleteId?: string;
    status?: ScheduleStatus;
  }
) {
  const where: any = {
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
      athletes: {
        include: {
          athlete: true,
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
