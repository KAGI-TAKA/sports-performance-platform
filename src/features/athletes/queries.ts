import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function ageGroupToBirthRange(ageGroup: string): { gte: Date; lte: Date } | null {
  const now = new Date();
  const currentYear = now.getFullYear();
  const cutoffs: Record<string, [number, number]> = {
    U12: [currentYear - 12, currentYear - 8],
    U14: [currentYear - 14, currentYear - 12],
    U16: [currentYear - 16, currentYear - 14],
    U18: [currentYear - 18, currentYear - 16],
    SENIOR: [currentYear - 50, currentYear - 18],
  };
  const range = cutoffs[ageGroup];
  if (!range) return null;
  return {
    gte: new Date(`${range[0]}-01-01`),
    lte: new Date(`${range[1]}-12-31`),
  };
}

export const ATHLETES_PER_PAGE = 20;

export async function listAthletes(
  organizationId: string,
  opts?: {
    search?: string;
    position?: string;
    ageGroup?: string;
    status?: "active" | "inactive" | "all";
    page?: number;
  }
) {
  const birthRange =
    opts?.ageGroup && opts.ageGroup !== "ALL"
      ? ageGroupToBirthRange(opts.ageGroup)
      : null;

  const page = Math.max(1, opts?.page ?? 1);
  const skip = (page - 1) * ATHLETES_PER_PAGE;

  const where: Prisma.AthleteWhereInput = {
    organizationId,
    ...(opts?.status === "inactive"
      ? { isActive: false }
      : opts?.status === "all"
      ? {}
      : { isActive: true }),
    ...(opts?.search
      ? { fullName: { contains: opts.search, mode: "insensitive" } }
      : {}),
    ...(opts?.position && opts.position !== "ALL"
      ? { position: opts.position as Prisma.EnumAthletePositionFilter }
      : {}),
    ...(birthRange ? { dateOfBirth: birthRange } : {}),
  };

  const [athletes, total] = await prisma.$transaction([
    prisma.athlete.findMany({
      where,
      orderBy: { fullName: "asc" },
      take: ATHLETES_PER_PAGE,
      skip,
      include: {
        assessments: {
          where: { status: "COMPLETED" },
          orderBy: { assessmentDate: "desc" },
          take: 1,
          select: { overallScore: true, overallGrade: true, assessmentDate: true },
        },
        injuryHistories: {
          where: { recoveredAt: null },
          select: { id: true, injuryType: true },
        },
      },
    }),
    prisma.athlete.count({ where }),
  ]);

  return {
    athletes,
    total,
  };
}

export async function getAthleteById(
  organizationId: string,
  athleteId: string
) {
  const athlete = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId },
    include: {
      injuryHistories: { orderBy: { injuryDate: "desc" } },
      assessments: {
        orderBy: { assessmentDate: "desc" },
        take: 10,
        include: {
          analysis: { select: { componentScores: true, bestComponent: true, insightText: true } },
        },
      },
    },
  });

  return athlete;
}

export async function getAthleteFullProfile(
  organizationId: string,
  athleteId: string
) {
  const athlete = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId },
    include: {
      injuryHistories: { orderBy: { injuryDate: "desc" } },
      assessments: {
        orderBy: { assessmentDate: "desc" },
        take: 10,
        include: {
          analysis: { select: { componentScores: true, bestComponent: true, insightText: true } },
          resultItems: {
            include: {
              testItem: { select: { name: true, physicalComponent: true, unit: true } },
            },
          },
        },
      },
      scheduleSessions: {
        include: {
          session: {
            include: {
              coach: { select: { user: { select: { name: true } } } },
            },
          },
        },
        orderBy: { session: { startTime: "desc" } },
        take: 10,
      },
      sessionLogs: {
        orderBy: { sessionDate: "desc" },
        take: 10,
        include: {
          createdBy: { select: { user: { select: { name: true } } } },
          scheduleSession: { select: { title: true } },
        },
      },
      trainingPlans: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  return athlete;
}
