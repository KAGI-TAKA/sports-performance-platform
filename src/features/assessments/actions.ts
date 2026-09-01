"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { createAssessmentSchema, batchSquadAssessmentSchema } from "./schema";
import {
  calculateAssessmentEngine,
  calculateAgeAtDate,
  pickBestBenchmark,
  TestItemValue,
} from "./engine";
import { seedDefaultTestItemsAndBenchmarks } from "../../../prisma/seed-defaults";
import { evaluateAssessmentGoals } from "../athlete-goals/actions";

export async function createAssessment(input: unknown) {
  const ctx = await requireOrgContext();

  const parseResult = createAssessmentSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi data assessment gagal",
    };
  }

  const parsed = parseResult.data;

  // 1. Verifikasi bahwa atlet yang di-assess milik organisasi yang sama dan aktif
  const athleteCheck = await prisma.athlete.findFirst({
    where: {
      id: parsed.athleteId,
      organizationId: ctx.organizationId,
      isActive: true,
    },
    select: { id: true, gender: true, dateOfBirth: true },
  });

  if (!athleteCheck) {
    return {
      success: false,
      error: "Atlet tidak ditemukan atau tidak aktif di organisasi ini",
    };
  }

  // 2. Perlindungan terhadap Replay / Rapid Double-Click Submit
  const assessmentDate = new Date(parsed.assessmentDate);
  const existingRecent = await prisma.assessment.findFirst({
    where: {
      organizationId: ctx.organizationId,
      athleteId: parsed.athleteId,
      assessmentDate,
      createdAt: { gte: new Date(Date.now() - 5000) },
    },
    select: { id: true },
  });

  if (existingRecent) {
    return { success: true, assessmentId: existingRecent.id };
  }

  // 3. Hitung usia atlet secara akurat pada tanggal assessment
  const athleteAge = calculateAgeAtDate(athleteCheck.dateOfBirth, assessmentDate);

  // 4. Ambil data test item & benchmarks milik organisasi secara aman
  const testItemIds = parsed.results.map((r) => r.testItemId);
  let testItems = await prisma.testItem.findMany({
    where: {
      id: { in: testItemIds },
      organizationId: ctx.organizationId,
    },
    include: {
      benchmarks: true,
    },
  });

  if (testItems.length === 0) {
    try {
      await seedDefaultTestItemsAndBenchmarks(ctx.organizationId);
      testItems = await prisma.testItem.findMany({
        where: {
          id: { in: testItemIds },
          organizationId: ctx.organizationId,
        },
        include: {
          benchmarks: true,
        },
      });
    } catch {
      // Seeding attempt fallback
    }
  }

  const testItemMap = new Map(testItems.map((t) => [t.id, t]));

  const engineItems: TestItemValue[] = parsed.results.map((res) => {
    const itemDef = testItemMap.get(res.testItemId);
    const bm = pickBestBenchmark(itemDef?.benchmarks || [], athleteCheck.gender, athleteAge);

    return {
      testItemId: res.testItemId,
      physicalComponent: itemDef?.physicalComponent || "FLEXIBILITY",
      rawValue: res.rawValue,
      scoreDirection: itemDef?.scoreDirection || "HIGHER_IS_BETTER",
      thresholdA: bm ? Number(bm.thresholdA) : undefined,
      thresholdB: bm ? Number(bm.thresholdB) : undefined,
      thresholdC: bm ? Number(bm.thresholdC) : undefined,
      thresholdD: bm ? Number(bm.thresholdD) : undefined,
    };
  });

  // 5. Hitung hasil engine server-side (Authoritative Domain Calculation)
  const engineResult = calculateAssessmentEngine(engineItems);

  try {
    // 6. Simpan Assessment, ResultItems, dan Analysis dalam 1 transaksi atomic
    const assessment = await prisma.$transaction(async (tx) => {
      const newAssessment = await tx.assessment.create({
        data: {
          organizationId: ctx.organizationId,
          athleteId: parsed.athleteId,
          createdByMemberId: ctx.memberId,
          assessmentDate,
          assessmentType: parsed.assessmentType ?? "BENCHMARK_BASED",
          status: "COMPLETED",
          overallScore: engineResult.overallScore,
          overallGrade: engineResult.overallGrade,
          resultItems: {
            create: parsed.results.map((r) => ({
              testItemId: r.testItemId,
              rawValue: r.rawValue,
              score: engineResult.itemScores[r.testItemId] ?? 0,
            })),
          },
        },
      });

      await tx.assessmentAnalysis.create({
        data: {
          assessmentId: newAssessment.id,
          componentScores: JSON.stringify(engineResult.componentScores),
          bestComponent: engineResult.bestComponent,
          weakestComponents: engineResult.weakestComponents,
          insightText: engineResult.insightText,
          recommendationText: engineResult.recommendationText,
          ruleEngineVersion: "v1.0",
        },
      });

      // Evaluasi pencapaian target atlet (P6-B Automatic Achievement)
      await evaluateAssessmentGoals(newAssessment.id, tx);

      return newAssessment;
    });

    revalidatePath("/athletes");
    revalidatePath(`/athletes/${parsed.athleteId}`);
    revalidatePath("/dashboard");
    revalidatePath("/assessments");
    revalidatePath("/reports");
    revalidatePath("/progress");
    revalidatePath("/compare");

    return { success: true, assessmentId: assessment.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan transaksi assessment";
    return { success: false, error: errorMsg };
  }
}

/**
 * P8-B2: Squad Field Scoring Matrix Batch Action.
 * Evaluates and atomically creates assessments for an entire squad (multi-athlete)
 * on a single test item using the authoritative assessment scoring engine.
 */
export async function batchCreateSquadAssessmentAction(input: unknown): Promise<{
  success: boolean;
  error?: string;
  savedCount?: number;
  assessmentIds?: string[];
}> {
  try {
    const ctx = await requireOrgContext();

    // Verify role authorization (Parents/Athletes are rejected)
    const role = ctx.role.toLowerCase();
    if (role !== "owner" && role !== "admin" && role !== "head_coach" && role !== "assistant_coach") {
      return { success: false, error: "Anda tidak memiliki wewenang untuk mencatat penilaian fisik." };
    }

    const parseResult = batchSquadAssessmentSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Validasi data squad assessment gagal",
      };
    }

    const parsed = parseResult.data;

    // Reject duplicate athletes in the batch
    const athleteIds = parsed.entries.map((e: { athleteId: string }) => e.athleteId);
    if (new Set(athleteIds).size !== athleteIds.length) {
      return {
        success: false,
        error: "Terdapat duplikasi atlet pada daftar penilaian squad.",
      };
    }

    // 1. Verify that all athletes belong to ctx.organizationId and are active
    const validAthletes = await prisma.athlete.findMany({
      where: {
        id: { in: athleteIds },
        organizationId: ctx.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        gender: true,
        dateOfBirth: true,
      },
    });

    if (validAthletes.length !== athleteIds.length) {
      return {
        success: false,
        error: "Sebagian atlet tidak ditemukan, tidak aktif, atau bukan milik organisasi Anda.",
      };
    }

    const athleteMap = new Map(validAthletes.map((a) => [a.id, a]));

    // 2. Fetch the test item with its benchmarks
    let testItem = await prisma.testItem.findFirst({
      where: {
        id: parsed.testItemId,
        organizationId: ctx.organizationId,
      },
      include: {
        benchmarks: true,
      },
    });

    if (!testItem) {
      try {
        await seedDefaultTestItemsAndBenchmarks(ctx.organizationId);
        testItem = await prisma.testItem.findFirst({
          where: {
            id: parsed.testItemId,
            organizationId: ctx.organizationId,
          },
          include: {
            benchmarks: true,
          },
        });
      } catch {
        // seeding fallback
      }
    }

    if (!testItem) {
      return {
        success: false,
        error: "Item tes tidak ditemukan dalam master benchmark organisasi.",
      };
    }

    const assessmentDate = new Date(parsed.assessmentDate);

    // 3. Atomically create assessments in a single prisma.$transaction
    const createdAssessmentIds = await prisma.$transaction(async (tx) => {
      const ids: string[] = [];

      for (const entry of parsed.entries) {
        const athlete = athleteMap.get(entry.athleteId);
        if (!athlete) continue;

        const athleteAge = calculateAgeAtDate(athlete.dateOfBirth, assessmentDate);
        const bm = pickBestBenchmark(testItem.benchmarks || [], athlete.gender, athleteAge);

        const engineItems: TestItemValue[] = [
          {
            testItemId: testItem.id,
            physicalComponent: testItem.physicalComponent || "FLEXIBILITY",
            rawValue: entry.rawValue,
            scoreDirection: testItem.scoreDirection || "HIGHER_IS_BETTER",
            thresholdA: bm ? Number(bm.thresholdA) : undefined,
            thresholdB: bm ? Number(bm.thresholdB) : undefined,
            thresholdC: bm ? Number(bm.thresholdC) : undefined,
            thresholdD: bm ? Number(bm.thresholdD) : undefined,
          },
        ];

        const engineResult = calculateAssessmentEngine(engineItems);

        const newAssessment = await tx.assessment.create({
          data: {
            organizationId: ctx.organizationId,
            athleteId: entry.athleteId,
            createdByMemberId: ctx.memberId,
            assessmentDate,
            assessmentType: parsed.assessmentType ?? "BENCHMARK_BASED",
            status: "COMPLETED",
            overallScore: engineResult.overallScore,
            overallGrade: engineResult.overallGrade,
            resultItems: {
              create: [
                {
                  testItemId: testItem.id,
                  rawValue: entry.rawValue,
                  score: engineResult.itemScores[testItem.id] ?? engineResult.overallScore,
                },
              ],
            },
          },
        });

        await tx.assessmentAnalysis.create({
          data: {
            assessmentId: newAssessment.id,
            componentScores: JSON.stringify(engineResult.componentScores),
            bestComponent: engineResult.bestComponent,
            weakestComponents: engineResult.weakestComponents,
            insightText: engineResult.insightText,
            recommendationText: entry.notes?.trim()
              ? `${entry.notes.trim()}\n${engineResult.recommendationText}`
              : engineResult.recommendationText,
            ruleEngineVersion: "v2.1-squad-batch",
          },
        });

        // Trigger goal achievement check
        await evaluateAssessmentGoals(newAssessment.id, tx);

        ids.push(newAssessment.id);
      }

      return ids;
    });

    // Revalidate paths
    revalidatePath("/assessments");
    revalidatePath("/athletes");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/progress");
    revalidatePath("/compare");

    return {
      success: true,
      savedCount: createdAssessmentIds.length,
      assessmentIds: createdAssessmentIds,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan batch assessment squad.";
    return { success: false, error: errorMsg };
  }
}

