import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function listSessionLogs(
  organizationId: string,
  opts?: {
    athleteId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }
) {
  const where: Prisma.SessionLogWhereInput = {
    organizationId,
  };

  if (opts?.athleteId && opts.athleteId !== "ALL") {
    where.athleteId = opts.athleteId;
  }

  if (opts?.startDate || opts?.endDate) {
    where.sessionDate = {};
    if (opts.startDate) where.sessionDate.gte = opts.startDate;
    if (opts.endDate) where.sessionDate.lte = opts.endDate;
  }

  if (opts?.search) {
    where.OR = [
      { activitiesDone: { contains: opts.search, mode: "insensitive" } },
      { coachFeedback: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  return prisma.sessionLog.findMany({
    where,
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
      createdBy: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      scheduleSession: {
        select: { id: true, title: true },
      },
    },
    orderBy: { sessionDate: "desc" },
  });
}

export async function getSessionLogById(
  organizationId: string,
  logId: string
) {
  return prisma.sessionLog.findFirst({
    where: { id: logId, organizationId },
    include: {
      athlete: true,
      createdBy: {
        include: {
          user: true,
        },
      },
      scheduleSession: true,
    },
  });
}

export async function listActiveAthletesForSessionLogs(organizationId: string) {
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
