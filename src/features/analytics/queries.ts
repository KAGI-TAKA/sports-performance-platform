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
        orderBy: { assessmentDate: "desc" },
        take: 1,
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

export interface TestItemPersonalBest {
  testItemId: string;
  testItemName: string;
  unit: string;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  physicalComponent: string | null;
  pbValue: number;
  achievedDate: Date;
  assessmentId: string;
  totalAttempts: number;
}

export interface DetailedTimelineItem {
  testItemId: string;
  testItemName: string;
  unit: string;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  physicalComponent: string | null;
  rawValue: number;
  score: number | null;
  previousRawValue: number | null;
  delta: number | null;
  percentChange: number | null;
  trend: "IMPROVED" | "STABLE" | "DECLINING" | "BASELINE";
  isPersonalBest: boolean;
}

export interface DetailedTimelineEntry {
  assessmentId: string;
  assessmentDate: Date;
  overallScore: number | null;
  overallGrade: string | null;
  bestComponent: string | null;
  items: DetailedTimelineItem[];
}

export interface AthleteDetailedProgressResult {
  athlete: {
    id: string;
    fullName: string;
    position: string;
    jerseyNumber: number | null;
  };
  personalBests: TestItemPersonalBest[];
  timeline: DetailedTimelineEntry[];
}

/**
 * P8-C1 + P8-C2: Authoritative Query & Engine for Athlete Progress Timeline & Personal Best Hub.
 * Single batch query with zero N+1.
 */
export async function getAthleteDetailedProgressTimeline(
  organizationId: string,
  athleteId: string
): Promise<AthleteDetailedProgressResult | null> {
  const athlete = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId },
    select: {
      id: true,
      fullName: true,
      position: true,
      jerseyNumber: true,
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { assessmentDate: "asc" },
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
              bestComponent: true,
              weakestComponents: true,
              insightText: true,
              recommendationText: true,
            },
          },
        },
      },
    },
  });

  if (!athlete) return null;

  // 1. Group all completed results by test item for Personal Best calculation
  const itemResultsMap = new Map<
    string,
    {
      testItem: {
        id: string;
        name: string;
        unit: string;
        scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
        physicalComponent: string | null;
      };
      results: Array<{
        rawValue: number;
        assessmentDate: Date;
        assessmentId: string;
        score: number | null;
      }>;
    }
  >();

  for (const ass of athlete.assessments) {
    for (const res of ass.resultItems) {
      if (!res.testItem || res.rawValue == null) continue;
      const itemId = res.testItem.id;
      if (!itemResultsMap.has(itemId)) {
        itemResultsMap.set(itemId, {
          testItem: {
            id: res.testItem.id,
            name: res.testItem.name,
            unit: res.testItem.unit,
            scoreDirection: res.testItem.scoreDirection,
            physicalComponent: res.testItem.physicalComponent,
          },
          results: [],
        });
      }

      itemResultsMap.get(itemId)!.results.push({
        rawValue: Number(res.rawValue),
        assessmentDate: ass.assessmentDate,
        assessmentId: ass.id,
        score: res.score != null ? Number(res.score) : null,
      });
    }
  }

  // 2. Compute Personal Best for each test item using authoritative calculatePersonalBest
  const personalBests: TestItemPersonalBest[] = [];
  const pbMapByItemId = new Map<string, { pbValue: number; assessmentId: string }>();

  for (const [itemId, group] of itemResultsMap.entries()) {
    if (group.results.length === 0) continue;

    // Use authoritative PB logic:
    // HIGHER_IS_BETTER -> max rawValue
    // LOWER_IS_BETTER -> min rawValue
    let best = group.results[0];
    for (let i = 1; i < group.results.length; i++) {
      const current = group.results[i];
      if (group.testItem.scoreDirection === "HIGHER_IS_BETTER") {
        if (
          current.rawValue > best.rawValue ||
          (current.rawValue === best.rawValue &&
            new Date(current.assessmentDate).getTime() > new Date(best.assessmentDate).getTime())
        ) {
          best = current;
        }
      } else {
        // LOWER_IS_BETTER
        if (
          current.rawValue < best.rawValue ||
          (current.rawValue === best.rawValue &&
            new Date(current.assessmentDate).getTime() > new Date(best.assessmentDate).getTime())
        ) {
          best = current;
        }
      }
    }

    personalBests.push({
      testItemId: itemId,
      testItemName: group.testItem.name,
      unit: group.testItem.unit,
      scoreDirection: group.testItem.scoreDirection,
      physicalComponent: group.testItem.physicalComponent,
      pbValue: best.rawValue,
      achievedDate: best.assessmentDate,
      assessmentId: best.assessmentId,
      totalAttempts: group.results.length,
    });

    pbMapByItemId.set(itemId, {
      pbValue: best.rawValue,
      assessmentId: best.assessmentId,
    });
  }

  // 3. Build chronological timeline with authoritative delta & trend calculations
  // Track running previous raw value per test item
  const runningPreviousValues = new Map<string, number>();

  const timeline: DetailedTimelineEntry[] = athlete.assessments.map((ass) => {
    const items: DetailedTimelineItem[] = [];

    for (const res of ass.resultItems) {
      if (!res.testItem || res.rawValue == null) continue;
      const itemId = res.testItem.id;
      const currentRaw = Number(res.rawValue);
      const prevRaw = runningPreviousValues.get(itemId) ?? null;

      let delta: number | null = null;
      let percentChange: number | null = null;
      let trend: "IMPROVED" | "STABLE" | "DECLINING" | "BASELINE" = "BASELINE";

      if (prevRaw !== null) {
        delta = Math.round((currentRaw - prevRaw) * 100) / 100;
        const pct = prevRaw !== 0 ? (delta / Math.abs(prevRaw)) * 100 : 0;
        percentChange = Math.round(pct * 10) / 10;

        if (res.testItem.scoreDirection === "HIGHER_IS_BETTER") {
          if (delta > 0.05) trend = "IMPROVED";
          else if (delta < -0.05) trend = "DECLINING";
          else trend = "STABLE";
        } else {
          // LOWER_IS_BETTER
          if (delta < -0.05) trend = "IMPROVED";
          else if (delta > 0.05) trend = "DECLINING";
          else trend = "STABLE";
        }
      }

      // Update running previous raw value for next chronological assessment
      runningPreviousValues.set(itemId, currentRaw);

      const pbInfo = pbMapByItemId.get(itemId);
      const isPersonalBest =
        pbInfo !== undefined &&
        pbInfo.assessmentId === ass.id &&
        Math.abs(currentRaw - pbInfo.pbValue) < 0.001;

      items.push({
        testItemId: itemId,
        testItemName: res.testItem.name,
        unit: res.testItem.unit,
        scoreDirection: res.testItem.scoreDirection,
        physicalComponent: res.testItem.physicalComponent,
        rawValue: currentRaw,
        score: res.score != null ? Number(res.score) : null,
        previousRawValue: prevRaw,
        delta,
        percentChange,
        trend,
        isPersonalBest,
      });
    }

    return {
      assessmentId: ass.id,
      assessmentDate: ass.assessmentDate,
      overallScore: ass.overallScore != null ? Number(ass.overallScore) : null,
      overallGrade: ass.overallGrade,
      bestComponent: ass.analysis?.bestComponent || null,
      items,
    };
  });

  return {
    athlete: {
      id: athlete.id,
      fullName: athlete.fullName,
      position: athlete.position,
      jerseyNumber: athlete.jerseyNumber,
    },
    personalBests,
    timeline,
  };
}

