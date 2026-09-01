import "server-only";
import { prisma } from "@/lib/prisma";
import type { ShareSafeProgressDTO } from "./utils/whatsapp-formatter";
import { calculatePersonalBest } from "@/features/athlete-goals/engine";
import { calculateProgressAssessmentEngine } from "@/features/assessments/engine";
import { calculateTrend } from "@/features/analytics/engine";
import { formatDateID } from "@/lib/date-utils";
import type { ScoreDirection } from "@prisma/client";

function calcAge(dob: Date, targetDate: Date = new Date()): number {
  const diff = targetDate.getFullYear() - dob.getFullYear();
  const m = targetDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && targetDate.getDate() < dob.getDate())) {
    return Math.max(0, diff - 1);
  }
  return Math.max(0, diff);
}

function formatComponentName(comp: string): string {
  const map: Record<string, string> = {
    FLEXIBILITY: "Fleksibilitas",
    SPEED: "Kecepatan (Speed)",
    POWER: "Daya Ledak (Power)",
    AGILITY: "Kelincahan (Agility)",
    MUSCULAR_ENDURANCE: "Daya Tahan Otot",
    ANAEROBIC_ENDURANCE: "Daya Tahan Anaerobik",
    AEROBIC_ENDURANCE: "Daya Tahan Aerobik",
  };
  return map[comp] ?? comp.replace(/_/g, " ");
}

/**
 * P8-C4: Single batch query to produce a sanitized, share-safe progress summary DTO.
 * Zero N+1, server-enforced tenant scoping, no private notes or medical data leakage.
 */
export async function getAthleteProgressShareData(
  organizationId: string,
  athleteId: string
): Promise<ShareSafeProgressDTO | null> {
  const athlete = await prisma.athlete.findFirst({
    where: {
      id: athleteId,
      organizationId,
      isActive: true,
    },
    include: {
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { assessmentDate: "desc" },
        include: {
          resultItems: {
            include: {
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
              recommendationText: true,
            },
          },
        },
      },
      goals: {
        where: { status: { in: ["ACTIVE", "ACHIEVED"] } },
        select: {
          id: true,
          title: true,
          baselineValue: true,
          targetValue: true,
          unit: true,
          status: true,
        },
      },
    },
  });

  if (!athlete || athlete.assessments.length === 0) {
    return null;
  }

  const latestAssessment = athlete.assessments[0];
  const previousAssessment = athlete.assessments[1];
  const age = calcAge(athlete.dateOfBirth, latestAssessment.assessmentDate);

  // 1. Resolve Trend using authoritative calculateTrend
  const currentOverall =
    latestAssessment.overallScore != null ? Number(latestAssessment.overallScore) : null;
  const previousOverall =
    previousAssessment?.overallScore != null
      ? Number(previousAssessment.overallScore)
      : null;
  const trend = calculateTrend(currentOverall, previousOverall);
  const deltaPercentage =
    currentOverall != null && previousOverall != null
      ? Number((currentOverall - previousOverall).toFixed(1))
      : null;

  // 2. Resolve Personal Bests using authoritative calculatePersonalBest
  const testItemResultsMap = new Map<
    string,
    {
      testItem: {
        name: string;
        unit: string;
        scoreDirection: ScoreDirection;
      };
      history: Array<{
        rawValue: number;
        assessmentDate: Date;
        assessmentId: string;
      }>;
    }
  >();

  // Collect all history chronologically for PB extraction
  athlete.assessments.forEach((ass) => {
    ass.resultItems.forEach((r) => {
      if (r.testItem && r.rawValue != null) {
        if (!testItemResultsMap.has(r.testItem.id)) {
          testItemResultsMap.set(r.testItem.id, {
            testItem: r.testItem,
            history: [],
          });
        }
        testItemResultsMap.get(r.testItem.id)!.history.push({
          rawValue: Number(r.rawValue),
          assessmentDate: ass.assessmentDate,
          assessmentId: ass.id,
        });
      }
    });
  });

  const personalBests: ShareSafeProgressDTO["personalBests"] = [];
  testItemResultsMap.forEach((entry) => {
    const pb = calculatePersonalBest(entry.testItem.scoreDirection, entry.history);
    if (pb) {
      personalBests.push({
        testItemName: entry.testItem.name,
        rawValue: pb.pbValue,
        unit: entry.testItem.unit,
        achievedDate: formatDateID(pb.achievedDate),
      });
    }
  });

  // 3. Resolve Key Improvements using authoritative calculateProgressAssessmentEngine
  const keyImprovements: ShareSafeProgressDTO["keyImprovements"] = [];
  if (previousAssessment) {
    const currentItems = latestAssessment.resultItems
      .filter((r) => r.testItem && r.rawValue != null)
      .map((r) => ({
        testItemId: r.testItem.id,
        testItemName: r.testItem.name,
        unit: r.testItem.unit,
        scoreDirection: r.testItem.scoreDirection,
        rawValue: Number(r.rawValue),
      }));

    const previousItems = previousAssessment.resultItems
      .filter((r) => r.testItem && r.rawValue != null)
      .map((r) => ({
        testItemId: r.testItem.id,
        rawValue: Number(r.rawValue),
      }));

    const progressResult = calculateProgressAssessmentEngine(currentItems, previousItems);
    progressResult.itemProgress
      .filter((it) => it.trend === "IMPROVED" && it.delta != null)
      .forEach((it) => {
        keyImprovements.push({
          testItemName: it.testItemName,
          deltaValue: it.delta!,
          unit: it.unit,
          percentChange: it.percentChange,
        });
      });
  }

  // 4. Focus areas
  const focusAreas = (latestAssessment.analysis?.weakestComponents ?? []).map(
    formatComponentName
  );

  // 5. Goals mapping
  const goals: ShareSafeProgressDTO["goals"] = athlete.goals.map((g) => ({
    title: g.title ?? "Target Latihan",
    targetValue: Number(g.targetValue),
    currentValue: Number(g.baselineValue),
    unit: g.unit,
    isAchieved: g.status === "ACHIEVED",
  }));

  return {
    athlete: {
      id: athlete.id,
      fullName: athlete.fullName,
      age,
      jerseyNumber: athlete.jerseyNumber,
      position: athlete.position !== "UNSPECIFIED" ? athlete.position.replace(/_/g, " ") : null,
    },
    period: {
      label: "Asesmen Terkini",
      assessmentDate: formatDateID(latestAssessment.assessmentDate),
      totalAssessments: athlete.assessments.length,
    },
    overview: {
      overallScore: currentOverall,
      overallGrade: latestAssessment.overallGrade,
      trend,
      deltaPercentage,
    },
    personalBests,
    keyImprovements,
    goals,
    focusAreas,
    recommendation: latestAssessment.analysis?.recommendationText ?? null,
    reportUrl: null,
    latestAssessmentId: latestAssessment.id,
  };
}
