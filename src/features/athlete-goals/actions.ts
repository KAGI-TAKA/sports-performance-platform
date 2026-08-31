"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import {
  createAthleteGoalSchema,
  updateAthleteGoalSchema,
} from "./schemas";
import {
  validateGoalTarget,
  isGoalTargetAchieved,
  canMemberManageGoals,
  resolveCurrentValue,
} from "./engine";

/**
 * Server Action: Create a new Athlete Goal.
 */
export async function createAthleteGoalAction(input: unknown) {
  const ctx = await requireOrgContext();

  if (!canMemberManageGoals(ctx.role)) {
    return {
      success: false,
      error: "Anda tidak memiliki izin untuk mengelola target atlet.",
    };
  }

  const parseResult = createAthleteGoalSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Data target tidak valid",
    };
  }

  const parsed = parseResult.data;

  // 1. Verify Athlete in current organization
  const athlete = await prisma.athlete.findFirst({
    where: {
      id: parsed.athleteId,
      organizationId: ctx.organizationId,
    },
    select: { id: true, isActive: true },
  });

  if (!athlete) {
    return {
      success: false,
      error: "Atlet tidak ditemukan di organisasi ini.",
    };
  }

  // 2. Verify TestItem in current organization and ensure NUMERIC & ACTIVE
  const testItem = await prisma.testItem.findFirst({
    where: {
      id: parsed.testItemId,
      organizationId: ctx.organizationId,
    },
    select: {
      id: true,
      name: true,
      unit: true,
      scoreDirection: true,
      testType: true,
      isActive: true,
    },
  });

  if (!testItem) {
    return {
      success: false,
      error: "Parameter uji fisik tidak ditemukan.",
    };
  }

  if (testItem.testType === "QUALITATIVE") {
    return {
      success: false,
      error: "Parameter kualitatif tidak dapat digunakan untuk target numerik.",
    };
  }

  if (!testItem.isActive) {
    return {
      success: false,
      error: "Parameter uji fisik ini sudah non-aktif dan tidak dapat menerima target baru.",
    };
  }

  // 3. Resolve authoritative baseline from latest completed assessment or manual input
  const latestCompletedResults = await prisma.assessmentResultItem.findMany({
    where: {
      assessment: {
        athleteId: parsed.athleteId,
        organizationId: ctx.organizationId,
        status: "COMPLETED",
      },
      testItemId: parsed.testItemId,
      rawValue: { not: null },
    },
    select: {
      rawValue: true,
      assessment: {
        select: {
          id: true,
          assessmentDate: true,
        },
      },
    },
    orderBy: {
      assessment: {
        assessmentDate: "desc",
      },
    },
  });

  const resolvedCurrent = resolveCurrentValue(
    latestCompletedResults.map((r) => ({
      rawValue: Number(r.rawValue),
      assessmentDate: r.assessment.assessmentDate,
      assessmentId: r.assessment.id,
    }))
  );

  let baselineValue: number;
  if (resolvedCurrent) {
    baselineValue = resolvedCurrent.currentValue;
  } else if (parsed.baselineValue !== undefined && parsed.baselineValue > 0) {
    baselineValue = parsed.baselineValue;
  } else {
    return {
      success: false,
      error: "Atlet belum memiliki data performa terkini. Silakan masukkan nilai baseline awal.",
    };
  }

  // 4. Validate Target Direction vs Baseline
  const targetValidation = validateGoalTarget(
    baselineValue,
    parsed.targetValue,
    testItem.scoreDirection
  );

  if (!targetValidation.valid) {
    return {
      success: false,
      error: targetValidation.reason ?? "Arah target tidak valid terhadap nilai baseline.",
    };
  }

  const targetDate = parsed.targetDate ? new Date(parsed.targetDate) : null;

  try {
    // 5. Execute creation within a transaction to enforce 1 ACTIVE goal per (athlete, testItem)
    const newGoal = await prisma.$transaction(async (tx) => {
      const existingActiveGoal = await tx.athleteGoal.findFirst({
        where: {
          athleteId: parsed.athleteId,
          testItemId: parsed.testItemId,
          organizationId: ctx.organizationId,
          status: "ACTIVE",
        },
        select: { id: true, title: true },
      });

      if (existingActiveGoal) {
        throw new Error(
          `Atlet sudah memiliki target aktif untuk parameter "${testItem.name}". Selesaikan, tunda, atau batalkan target sebelumnya terlebih dahulu.`
        );
      }

      return await tx.athleteGoal.create({
        data: {
          organizationId: ctx.organizationId,
          athleteId: parsed.athleteId,
          testItemId: parsed.testItemId,
          createdByMemberId: ctx.memberId,
          title: parsed.title?.trim() || null,
          baselineValue,
          targetValue: parsed.targetValue,
          unit: testItem.unit, // Unit derived server-side from TestItem
          targetDate,
          status: "ACTIVE",
          notes: parsed.notes?.trim() || null,
        },
      });
    });

    revalidatePath(`/athletes/${parsed.athleteId}`);
    revalidatePath("/progress");
    revalidatePath("/dashboard");

    return { success: true, goalId: newGoal.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal membuat target atlet";
    return { success: false, error: errorMsg };
  }
}

/**
 * Server Action: Update an existing Athlete Goal.
 */
export async function updateAthleteGoalAction(input: unknown) {
  const ctx = await requireOrgContext();

  if (!canMemberManageGoals(ctx.role)) {
    return {
      success: false,
      error: "Anda tidak memiliki izin untuk mengubah target atlet.",
    };
  }

  const parseResult = updateAthleteGoalSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Data perubahan target tidak valid",
    };
  }

  const parsed = parseResult.data;

  // Verify goal belongs to current organization
  const existingGoal = await prisma.athleteGoal.findFirst({
    where: {
      id: parsed.goalId,
      organizationId: ctx.organizationId,
    },
    include: {
      testItem: {
        select: { scoreDirection: true },
      },
    },
  });

  if (!existingGoal) {
    return {
      success: false,
      error: "Target atlet tidak ditemukan.",
    };
  }

  // If targetValue changed, re-validate against existing baselineValue
  if (parsed.targetValue !== undefined) {
    const targetValidation = validateGoalTarget(
      Number(existingGoal.baselineValue),
      parsed.targetValue,
      existingGoal.testItem.scoreDirection
    );

    if (!targetValidation.valid) {
      return {
        success: false,
        error: targetValidation.reason ?? "Arah target tidak valid terhadap nilai baseline.",
      };
    }
  }

  const targetDate =
    parsed.targetDate !== undefined
      ? parsed.targetDate
        ? new Date(parsed.targetDate)
        : null
      : undefined;

  try {
    const updated = await prisma.athleteGoal.update({
      where: { id: parsed.goalId },
      data: {
        ...(parsed.title !== undefined ? { title: parsed.title?.trim() || null } : {}),
        ...(parsed.targetValue !== undefined ? { targetValue: parsed.targetValue } : {}),
        ...(targetDate !== undefined ? { targetDate } : {}),
        ...(parsed.notes !== undefined ? { notes: parsed.notes?.trim() || null } : {}),
      },
    });

    revalidatePath(`/athletes/${existingGoal.athleteId}`);
    revalidatePath("/progress");

    return { success: true, goalId: updated.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui target atlet";
    return { success: false, error: errorMsg };
  }
}

/**
 * Server Action: Pause an active goal.
 */
export async function pauseAthleteGoalAction(goalId: string) {
  const ctx = await requireOrgContext();

  if (!canMemberManageGoals(ctx.role)) {
    return { success: false, error: "Anda tidak memiliki izin untuk mengubah status target." };
  }

  const goal = await prisma.athleteGoal.findFirst({
    where: { id: goalId, organizationId: ctx.organizationId },
    select: { id: true, athleteId: true, status: true },
  });

  if (!goal) {
    return { success: false, error: "Target tidak ditemukan." };
  }

  if (goal.status !== "ACTIVE") {
    return { success: false, error: "Hanya target aktif yang dapat ditunda." };
  }

  await prisma.athleteGoal.update({
    where: { id: goalId },
    data: { status: "PAUSED" },
  });

  revalidatePath(`/athletes/${goal.athleteId}`);
  return { success: true };
}

/**
 * Server Action: Cancel an active or paused goal.
 */
export async function cancelAthleteGoalAction(goalId: string) {
  const ctx = await requireOrgContext();

  if (!canMemberManageGoals(ctx.role)) {
    return { success: false, error: "Anda tidak memiliki izin untuk membatalkan target." };
  }

  const goal = await prisma.athleteGoal.findFirst({
    where: { id: goalId, organizationId: ctx.organizationId },
    select: { id: true, athleteId: true, status: true },
  });

  if (!goal) {
    return { success: false, error: "Target tidak ditemukan." };
  }

  if (goal.status === "ACHIEVED") {
    return { success: false, error: "Target yang sudah tercapai tidak dapat dibatalkan." };
  }

  await prisma.athleteGoal.update({
    where: { id: goalId },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/athletes/${goal.athleteId}`);
  return { success: true };
}

/**
 * Server Action: Resume a paused goal to ACTIVE (ensuring no other ACTIVE goal exists).
 */
export async function resumeAthleteGoalAction(goalId: string) {
  const ctx = await requireOrgContext();

  if (!canMemberManageGoals(ctx.role)) {
    return { success: false, error: "Anda tidak memiliki izin untuk mengaktifkan target." };
  }

  const goal = await prisma.athleteGoal.findFirst({
    where: { id: goalId, organizationId: ctx.organizationId },
    select: { id: true, athleteId: true, testItemId: true, status: true },
  });

  if (!goal) {
    return { success: false, error: "Target tidak ditemukan." };
  }

  if (goal.status !== "PAUSED") {
    return { success: false, error: "Hanya target yang ditunda yang dapat diaktifkan kembali." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const activeExists = await tx.athleteGoal.findFirst({
        where: {
          athleteId: goal.athleteId,
          testItemId: goal.testItemId,
          organizationId: ctx.organizationId,
          status: "ACTIVE",
        },
      });

      if (activeExists) {
        throw new Error(
          "Sudah ada target aktif lain untuk parameter ini. Selesaikan atau tunda target tersebut terlebih dahulu."
        );
      }

      await tx.athleteGoal.update({
        where: { id: goalId },
        data: { status: "ACTIVE" },
      });
    });

    revalidatePath(`/athletes/${goal.athleteId}`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mengaktifkan kembali target";
    return { success: false, error: errorMsg };
  }
}

/**
 * Domain Service Helper: Evaluates active athlete goals upon assessment completion.
 * Called within or after the assessment creation transaction.
 */
export async function evaluateAssessmentGoals(
  assessmentId: string,
  tx: any = prisma
) {
  // 1. Fetch completed assessment results
  const assessment = await tx.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      resultItems: {
        include: {
          testItem: {
            select: {
              id: true,
              scoreDirection: true,
            },
          },
        },
      },
    },
  });

  if (!assessment || assessment.status !== "COMPLETED") {
    return;
  }

  const athleteId = assessment.athleteId;
  const organizationId = assessment.organizationId;
  const resultMap = new Map<
    string,
    { rawValue: number | null; scoreDirection: any }
  >(
    assessment.resultItems.map((r: any) => [
      r.testItemId,
      {
        rawValue: r.rawValue !== null ? Number(r.rawValue) : null,
        scoreDirection: r.testItem.scoreDirection,
      },
    ])
  );

  // 2. Fetch ACTIVE goals for this athlete
  const activeGoals = await tx.athleteGoal.findMany({
    where: {
      athleteId,
      organizationId,
      status: "ACTIVE",
      testItemId: { in: Array.from(resultMap.keys()) },
    },
  });

  // 3. Check achievements
  for (const goal of activeGoals) {
    const result = resultMap.get(goal.testItemId);
    if (!result || result.rawValue === null) continue;

    const achieved = isGoalTargetAchieved(
      Number(goal.targetValue),
      result.rawValue,
      result.scoreDirection
    );

    if (achieved) {
      await tx.athleteGoal.update({
        where: { id: goal.id },
        data: {
          status: "ACHIEVED",
          achievedAt: new Date(),
          achievedAssessmentId: assessment.id,
        },
      });
    }
  }
}
