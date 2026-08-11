import "server-only";
import { prisma } from "@/lib/prisma";

export async function listTestItems(organizationId: string) {
  return prisma.testItem.findMany({
    where: { organizationId, isActive: true },
    include: { benchmarks: true },
    orderBy: { order: "asc" },
  });
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

export async function getPreviousAssessment(organizationId: string, athleteId: string, currentDate: Date) {
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

export const REPORTS_PER_PAGE = 10;

export async function listAssessments(
  organizationId: string,
  page = 1
) {
  const skip = (Math.max(1, page) - 1) * REPORTS_PER_PAGE;

  const where = { organizationId };

  const [assessments, total] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,
      include: {
        athlete: {
          select: { fullName: true, position: true, photoUrl: true },
        },
      },
      orderBy: { assessmentDate: "desc" },
      take: REPORTS_PER_PAGE,
      skip,
    }),
    prisma.assessment.count({ where }),
  ]);

  return { assessments, total };
}

