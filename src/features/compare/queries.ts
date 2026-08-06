import "server-only";
import { prisma } from "@/lib/prisma";

export async function listAthletesWithAssessments(organizationId: string) {
  return prisma.athlete.findMany({
    where: {
      organizationId,
      isActive: true,
      assessments: { some: { status: "COMPLETED" } },
    },
    select: {
      id: true,
      fullName: true,
      position: true,
      jerseyNumber: true,
      dateOfBirth: true,
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { assessmentDate: "desc" },
        select: {
          id: true,
          assessmentDate: true,
          overallScore: true,
          overallGrade: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });
}

export async function getFullAssessmentDetails(
  organizationId: string,
  assessmentId: string
) {
  return prisma.assessment.findFirst({
    where: { id: assessmentId, organizationId },
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
    },
  });
}
