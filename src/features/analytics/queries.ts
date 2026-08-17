import "server-only";
import { prisma } from "@/lib/prisma";
import {
  calculateAthleteProgress,
  calculateOrganizationReport,
  calculateHeadToHeadComparison,
  type AssessmentRecordInput,
} from "./engine";

export async function listAthletesForAnalytics(organizationId: string) {
  return prisma.athlete.findMany({
    where: { organizationId }, // Includes both active & inactive for historical progress
    select: {
      id: true,
      fullName: true,
      jerseyNumber: true,
      position: true,
      dateOfBirth: true,
      isActive: true,
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { assessmentDate: "asc" },
        select: {
          id: true,
          assessmentDate: true,
          overallScore: true,
          overallGrade: true,
          analysis: { select: { componentScores: true } },
        },
      },
    },
    orderBy: { fullName: "asc" },
  });
}

export async function getAthleteProgressSummary(
  organizationId: string,
  athleteId: string
) {
  const athlete = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId },
    select: {
      id: true,
      fullName: true,
      isActive: true,
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { assessmentDate: "asc" },
        select: {
          id: true,
          assessmentDate: true,
          overallScore: true,
          overallGrade: true,
          analysis: { select: { componentScores: true, bestComponent: true, weakestComponents: true } },
        },
      },
    },
  });

  if (!athlete) return null;

  const assessmentsInput: AssessmentRecordInput[] = athlete.assessments.map((a) => ({
    id: a.id,
    athleteId: athlete.id,
    assessmentDate: a.assessmentDate,
    overallScore: a.overallScore != null ? Number(a.overallScore) : null,
    overallGrade: a.overallGrade,
    analysis: a.analysis,
  }));

  return calculateAthleteProgress(athlete, assessmentsInput);
}

export async function getOrganizationAnalyticsOverview(organizationId: string) {
  const [assessments, totalAthletesCount, activePlansCount, sessionLogsCount] =
    await prisma.$transaction([
      prisma.assessment.findMany({
        where: { organizationId, status: "COMPLETED" },
        select: {
          id: true,
          athleteId: true,
          assessmentDate: true,
          overallScore: true,
          overallGrade: true,
          analysis: { select: { componentScores: true } },
        },
        orderBy: { assessmentDate: "desc" },
      }),
      prisma.athlete.count({ where: { organizationId } }),
      prisma.trainingPlan.count({ where: { organizationId, isActive: true } }),
      prisma.sessionLog.count({ where: { organizationId } }),
    ]);

  const assessmentsInput: AssessmentRecordInput[] = assessments.map((a) => ({
    id: a.id,
    athleteId: a.athleteId,
    assessmentDate: a.assessmentDate,
    overallScore: a.overallScore != null ? Number(a.overallScore) : null,
    overallGrade: a.overallGrade,
    analysis: a.analysis,
  }));

  return calculateOrganizationReport(
    assessmentsInput,
    totalAthletesCount,
    activePlansCount,
    sessionLogsCount
  );
}

export async function getAthleteHeadToHeadComparison(
  organizationId: string,
  athleteAId: string,
  athleteBId: string
) {
  if (athleteAId === athleteBId) {
    return null; // Self-comparison is invalid for Head-to-Head
  }

  const [athleteA, athleteB] = await Promise.all([
    prisma.athlete.findFirst({
      where: { id: athleteAId, organizationId },
      select: {
        id: true,
        fullName: true,
        position: true,
        jerseyNumber: true,
        isActive: true,
        assessments: {
          where: { status: "COMPLETED" },
          orderBy: { assessmentDate: "desc" },
          take: 1,
          select: {
            id: true,
            assessmentDate: true,
            overallScore: true,
            overallGrade: true,
            analysis: { select: { componentScores: true } },
          },
        },
      },
    }),
    prisma.athlete.findFirst({
      where: { id: athleteBId, organizationId },
      select: {
        id: true,
        fullName: true,
        position: true,
        jerseyNumber: true,
        isActive: true,
        assessments: {
          where: { status: "COMPLETED" },
          orderBy: { assessmentDate: "desc" },
          take: 1,
          select: {
            id: true,
            assessmentDate: true,
            overallScore: true,
            overallGrade: true,
            analysis: { select: { componentScores: true } },
          },
        },
      },
    }),
  ]);

  if (!athleteA || !athleteB) return null;

  const assA = athleteA.assessments[0];
  const assB = athleteB.assessments[0];

  const assAInput: AssessmentRecordInput | null = assA
    ? {
        id: assA.id,
        athleteId: athleteA.id,
        assessmentDate: assA.assessmentDate,
        overallScore: assA.overallScore != null ? Number(assA.overallScore) : null,
        overallGrade: assA.overallGrade,
        analysis: assA.analysis,
      }
    : null;

  const assBInput: AssessmentRecordInput | null = assB
    ? {
        id: assB.id,
        athleteId: athleteB.id,
        assessmentDate: assB.assessmentDate,
        overallScore: assB.overallScore != null ? Number(assB.overallScore) : null,
        overallGrade: assB.overallGrade,
        analysis: assB.analysis,
      }
    : null;

  return calculateHeadToHeadComparison(athleteA, athleteB, assAInput, assBInput);
}
