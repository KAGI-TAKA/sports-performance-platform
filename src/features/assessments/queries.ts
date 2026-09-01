import "server-only";
import { prisma } from "@/lib/prisma";
import { seedDefaultTestItemsAndBenchmarks } from "../../../prisma/seed-defaults";

export async function listTestItems(organizationId: string) {
  let items = await prisma.testItem.findMany({
    where: { organizationId, isActive: true },
    include: { benchmarks: true },
    orderBy: { order: "asc" },
  });

  if (items.length === 0) {
    try {
      await seedDefaultTestItemsAndBenchmarks(organizationId);
      items = await prisma.testItem.findMany({
        where: { organizationId, isActive: true },
        include: { benchmarks: true },
        orderBy: { order: "asc" },
      });
    } catch {
      // Fallback cleanly
    }
  }

  return items;
}

export async function getAssessmentById(organizationId: string, id: string) {
  return prisma.assessment.findFirst({
    where: { id, organizationId },
    include: {
      athlete: true,
      resultItems: {
        include: {
          testItem: {
            include: { benchmarks: true },
          },
        },
      },
      analysis: true,
      createdBy: {
        include: { user: true },
      },
    },
  });
}

export async function getPreviousAssessment(
  organizationId: string,
  athleteId: string,
  currentDate: Date
) {
  return prisma.assessment.findFirst({
    where: {
      organizationId,
      athleteId,
      assessmentDate: { lt: currentDate },
      status: "COMPLETED",
    },
    orderBy: { assessmentDate: "desc" },
    select: { overallScore: true, overallGrade: true, assessmentDate: true },
  });
}

export async function getLatestAssessmentWithResults(
  organizationId: string,
  athleteId: string
) {
  return prisma.assessment.findFirst({
    where: {
      organizationId,
      athleteId,
      status: "COMPLETED",
    },
    orderBy: { assessmentDate: "desc" },
    include: {
      resultItems: {
        include: {
          testItem: true,
        },
      },
    },
  });
}

export const ASSESSMENTS_PER_PAGE = 10;
export const REPORTS_PER_PAGE = ASSESSMENTS_PER_PAGE;

export async function listAssessments(
  organizationId: string,
  opts?: { search?: string; page?: number } | number
) {
  const pageParam = typeof opts === "number" ? opts : opts?.page ?? 1;
  const searchParam = typeof opts === "object" ? opts?.search : undefined;

  const page = Math.max(1, pageParam);
  const skip = (page - 1) * ASSESSMENTS_PER_PAGE;

  const where = {
    organizationId,
    ...(searchParam
      ? {
          athlete: {
            fullName: { contains: searchParam, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const [assessments, total] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,
      include: {
        athlete: {
          select: { id: true, fullName: true, dateOfBirth: true, gender: true, sportCategory: true, competitionLevel: true, photoUrl: true },
        },
        analysis: {
          select: { bestComponent: true, insightText: true, weakestComponents: true },
        },
      },
      orderBy: { assessmentDate: "desc" },
      take: ASSESSMENTS_PER_PAGE,
      skip,
    }),
    prisma.assessment.count({ where }),
  ]);

  const serializedAssessments = assessments.map((a) => ({
    ...a,
    overallScore: a.overallScore != null ? Number(a.overallScore) : null,
  }));

  return { assessments: serializedAssessments, total };
}
