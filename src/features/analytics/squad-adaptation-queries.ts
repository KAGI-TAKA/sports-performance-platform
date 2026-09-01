import "server-only";
import { prisma } from "@/lib/prisma";
import {
  computeSquadAdaptationSummary,
  type SquadAdaptationSummaryDTO,
} from "./squad-adaptation-engine";

/**
 * P8-C5: Batch Query for Squad Adaptational Insight Hub.
 * Single query for the 60-day comparison window with strict tenant scoping.
 * Zero N+1, zero private notes/medical field leakage.
 */
export async function getSquadAdaptationData(
  organizationId: string,
  daysBack: number = 30
): Promise<SquadAdaptationSummaryDTO> {
  const now = new Date();
  const currentStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const previousStart = new Date(now.getTime() - daysBack * 2 * 24 * 60 * 60 * 1000);

  const athletes = await prisma.athlete.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      assessments: {
        where: {
          status: "COMPLETED",
          assessmentDate: { gte: previousStart, lte: now },
        },
        orderBy: { assessmentDate: "desc" },
        select: {
          id: true,
          assessmentDate: true,
          overallScore: true,
          analysis: {
            select: {
              componentScores: true,
            },
          },
        },
      },
    },
  });

  const rawAthletes = athletes.map((ath) => ({
    id: ath.id,
    fullName: ath.fullName,
    assessments: ath.assessments.map((ass) => ({
      id: ass.id,
      assessmentDate: ass.assessmentDate,
      overallScore: ass.overallScore != null ? Number(ass.overallScore) : null,
      analysis: ass.analysis,
    })),
  }));

  return computeSquadAdaptationSummary(rawAthletes, currentStart, previousStart, now);
}
