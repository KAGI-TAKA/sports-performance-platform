import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function listTrainingPlans(
  organizationId: string,
  opts?: {
    athleteId?: string;
    type?: "ALL" | "TEMPLATE" | "ATHLETE";
    search?: string;
  }
) {
  const where: Prisma.TrainingPlanWhereInput = {
    organizationId,
    isActive: true,
  };

  if (opts?.search) {
    where.title = { contains: opts.search, mode: "insensitive" };
  }

  if (opts?.type === "TEMPLATE") {
    where.athleteId = null;
  } else if (opts?.type === "ATHLETE") {
    where.athleteId = { not: null };
  }

  if (opts?.athleteId && opts.athleteId !== "ALL") {
    where.athleteId = opts.athleteId;
  }

  return prisma.trainingPlan.findMany({
    where,
    include: {
      athlete: {
        select: {
          id: true,
          fullName: true,
          position: true,
          photoUrl: true,
        },
      },
      exercises: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTrainingPlanById(
  organizationId: string,
  planId: string
) {
  return prisma.trainingPlan.findFirst({
    where: { id: planId, organizationId },
    include: {
      athlete: true,
      exercises: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function listActiveAthletesForPlans(organizationId: string) {
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
