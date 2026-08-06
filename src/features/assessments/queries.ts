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

export async function listAssessments(organizationId: string, limit = 10) {
  return prisma.assessment.findMany({
    where: { organizationId },
    include: {
      athlete: {
        select: { fullName: true, position: true, photoUrl: true },
      },
    },
    orderBy: { assessmentDate: "desc" },
    take: limit,
  });
}
