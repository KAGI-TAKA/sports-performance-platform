import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import {
  calculatePersonalBest,
  resolveCurrentValue,
  calculateGoalProgress,
} from "./engine";
import type {
  PersonalBestItem,
  CurrentPerformanceItem,
  AthleteGoalDetail,
} from "./types";

/**
 * Fetches all authoritative Personal Bests (PB) and Current Performance values
 * for an athlete across all numeric test items in the current organization.
 */
export async function getAthletePerformanceOverview(athleteId: string): Promise<{
  personalBests: PersonalBestItem[];
  currentPerformance: CurrentPerformanceItem[];
}> {
  const ctx = await requireOrgContext();

  // 1. Fetch athlete & verify organization tenancy
  const athlete = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId: ctx.organizationId },
    select: { id: true },
  });

  if (!athlete) {
    return { personalBests: [], currentPerformance: [] };
  }

  // 2. Fetch all completed numeric assessment results in one batch query (avoid N+1)
  const resultItems = await prisma.assessmentResultItem.findMany({
    where: {
      assessment: {
        athleteId,
        organizationId: ctx.organizationId,
        status: "COMPLETED",
      },
      testItem: {
        testType: "NUMERIC",
      },
      rawValue: { not: null },
    },
    select: {
      testItemId: true,
      rawValue: true,
      assessment: {
        select: {
          id: true,
          assessmentDate: true,
        },
      },
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
    orderBy: {
      assessment: {
        assessmentDate: "desc",
      },
    },
  });

  // 3. Group by testItemId
  const groupedResults = new Map<
    string,
    {
      testItem: {
        id: string;
        name: string;
        unit: any;
        scoreDirection: any;
        physicalComponent: string | null;
      };
      history: {
        rawValue: number;
        assessmentDate: Date;
        assessmentId: string;
      }[];
    }
  >();

  for (const item of resultItems) {
    if (item.rawValue === null) continue;
    const tId = item.testItemId;
    if (!groupedResults.has(tId)) {
      groupedResults.set(tId, {
        testItem: {
          id: item.testItem.id,
          name: item.testItem.name,
          unit: item.testItem.unit,
          scoreDirection: item.testItem.scoreDirection,
          physicalComponent: item.testItem.physicalComponent,
        },
        history: [],
      });
    }
    groupedResults.get(tId)!.history.push({
      rawValue: Number(item.rawValue),
      assessmentDate: new Date(item.assessment.assessmentDate),
      assessmentId: item.assessment.id,
    });
  }

  // 4. Calculate PBs and Current Performance values
  const personalBests: PersonalBestItem[] = [];
  const currentPerformance: CurrentPerformanceItem[] = [];

  for (const [, entry] of groupedResults) {
    const pb = calculatePersonalBest(entry.testItem.scoreDirection, entry.history);
    if (pb) {
      personalBests.push({
        testItemId: entry.testItem.id,
        testItemName: entry.testItem.name,
        unit: entry.testItem.unit,
        scoreDirection: entry.testItem.scoreDirection,
        physicalComponent: entry.testItem.physicalComponent,
        pbValue: pb.pbValue,
        achievedDate: pb.achievedDate,
        assessmentId: pb.assessmentId,
      });
    }

    const current = resolveCurrentValue(entry.history);
    if (current) {
      currentPerformance.push({
        testItemId: entry.testItem.id,
        testItemName: entry.testItem.name,
        unit: entry.testItem.unit,
        scoreDirection: entry.testItem.scoreDirection,
        physicalComponent: entry.testItem.physicalComponent,
        currentValue: current.currentValue,
        assessmentDate: current.assessmentDate,
        assessmentId: current.assessmentId,
      });
    }
  }

  return { personalBests, currentPerformance };
}

/**
 * Fetches all goals for an athlete with calculated real-time progress.
 */
export async function getAthleteGoals(
  athleteId: string,
  options?: { status?: any }
): Promise<AthleteGoalDetail[]> {
  const ctx = await requireOrgContext();

  // 1. Fetch current performance for the athlete to compute progress
  const { currentPerformance } = await getAthletePerformanceOverview(athleteId);
  const currentMap = new Map(currentPerformance.map((c) => [c.testItemId, c.currentValue]));

  // 2. Fetch goals
  const goals = await prisma.athleteGoal.findMany({
    where: {
      athleteId,
      organizationId: ctx.organizationId,
      ...(options?.status ? { status: options.status } : {}),
    },
    include: {
      athlete: { select: { fullName: true } },
      testItem: {
        select: {
          id: true,
          name: true,
          scoreDirection: true,
          physicalComponent: true,
        },
      },
      createdBy: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: [
      { status: "asc" }, // ACTIVE first
      { createdAt: "desc" },
    ],
  });

  return goals.map((g) => {
    const current = currentMap.get(g.testItemId) ?? null;
    const progress = calculateGoalProgress(
      Number(g.baselineValue),
      Number(g.targetValue),
      current,
      g.testItem.scoreDirection
    );

    return {
      id: g.id,
      organizationId: g.organizationId,
      athleteId: g.athleteId,
      athleteName: g.athlete.fullName,
      testItemId: g.testItemId,
      testItemName: g.testItem.name,
      physicalComponent: g.testItem.physicalComponent,
      scoreDirection: g.testItem.scoreDirection,
      unit: g.unit,
      title: g.title,
      baselineValue: Number(g.baselineValue),
      targetValue: Number(g.targetValue),
      currentValue: current,
      targetDate: g.targetDate,
      status: g.status,
      notes: g.notes,
      progress,
      achievedAt: g.achievedAt,
      achievedAssessmentId: g.achievedAssessmentId,
      createdByMemberId: g.createdByMemberId,
      createdByName: g.createdBy.user.name ?? "Staff Coach",
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
  });
}

/**
 * Fetches a single AthleteGoal detail with real-time progress.
 */
export async function getAthleteGoalDetail(
  goalId: string
): Promise<AthleteGoalDetail | null> {
  const ctx = await requireOrgContext();

  const goal = await prisma.athleteGoal.findFirst({
    where: { id: goalId, organizationId: ctx.organizationId },
    include: {
      athlete: { select: { fullName: true } },
      testItem: {
        select: {
          id: true,
          name: true,
          scoreDirection: true,
          physicalComponent: true,
        },
      },
      createdBy: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!goal) return null;

  const { currentPerformance } = await getAthletePerformanceOverview(goal.athleteId);
  const current = currentPerformance.find((c) => c.testItemId === goal.testItemId)?.currentValue ?? null;
  const progress = calculateGoalProgress(
    Number(goal.baselineValue),
    Number(goal.targetValue),
    current,
    goal.testItem.scoreDirection
  );

  return {
    id: goal.id,
    organizationId: goal.organizationId,
    athleteId: goal.athleteId,
    athleteName: goal.athlete.fullName,
    testItemId: goal.testItemId,
    testItemName: goal.testItem.name,
    physicalComponent: goal.testItem.physicalComponent,
    scoreDirection: goal.testItem.scoreDirection,
    unit: goal.unit,
    title: goal.title,
    baselineValue: Number(goal.baselineValue),
    targetValue: Number(goal.targetValue),
    currentValue: current,
    targetDate: goal.targetDate,
    status: goal.status,
    notes: goal.notes,
    progress,
    achievedAt: goal.achievedAt,
    achievedAssessmentId: goal.achievedAssessmentId,
    createdByMemberId: goal.createdByMemberId,
    createdByName: goal.createdBy.user.name ?? "Staff Coach",
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}
