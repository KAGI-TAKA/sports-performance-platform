import "server-only";
import { prisma } from "@/lib/prisma";

export async function listAthletesWithAssessments(organizationId: string) {
  const athletes = await prisma.athlete.findMany({
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

  return athletes.map((athlete) => ({
    ...athlete,
    assessments: athlete.assessments.map((a) => ({
      ...a,
      overallScore: a.overallScore != null ? Number(a.overallScore) : null,
    })),
  }));
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

/**
 * P8-C3: Single batch query for 2-4 athlete comparative analytics.
 * Zero N+1 roundtrips, fail-closed tenant scoping, and minimal DTO payload.
 */
export async function getMultiAthleteComparisonData(
  organizationId: string,
  athleteIds: string[]
) {
  // Deduplicate and cap at 4 athletes
  const uniqueIds = Array.from(new Set(athleteIds)).slice(0, 4);
  if (uniqueIds.length === 0) return [];

  const rawAthletes = await prisma.athlete.findMany({
    where: {
      id: { in: uniqueIds },
      organizationId,
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      position: true,
      jerseyNumber: true,
      dateOfBirth: true,
      gender: true,
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { assessmentDate: "desc" },
        take: 1, // Only latest completed assessment
        select: {
          id: true,
          assessmentDate: true,
          overallScore: true,
          overallGrade: true,
          resultItems: {
            select: {
              id: true,
              rawValue: true,
              score: true,
              testItem: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  scoreDirection: true,
                  physicalComponent: true,
                },
              },
            },
          },
          analysis: {
            select: {
              componentScores: true,
              bestComponent: true,
              weakestComponents: true,
            },
          },
        },
      },
    },
  });

  // Preserve the order of requested athleteIds
  const athleteMap = new Map(rawAthletes.map((a) => [a.id, a]));
  return uniqueIds
    .map((id) => athleteMap.get(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => ({
      id: a.id,
      fullName: a.fullName,
      position: a.position,
      jerseyNumber: a.jerseyNumber,
      dateOfBirth: a.dateOfBirth,
      gender: a.gender,
      assessment: a.assessments[0]
        ? {
            id: a.assessments[0].id,
            assessmentDate: a.assessments[0].assessmentDate,
            overallScore:
              a.assessments[0].overallScore != null
                ? Number(a.assessments[0].overallScore)
                : null,
            overallGrade: a.assessments[0].overallGrade,
            resultItems: a.assessments[0].resultItems.map((r) => ({
              id: r.id,
              rawValue: r.rawValue != null ? Number(r.rawValue) : null,
              score: r.score != null ? Number(r.score) : null,
              testItem: r.testItem,
            })),
            analysis: a.assessments[0].analysis
              ? {
                  componentScores: a.assessments[0].analysis.componentScores,
                  bestComponent: a.assessments[0].analysis.bestComponent,
                  weakestComponents: a.assessments[0].analysis.weakestComponents,
                }
              : null,
          }
        : null,
    }));
}

