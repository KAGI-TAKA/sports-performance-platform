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

  // 4. Ambil BenchmarkProfile yang dipilih jika ada
  let profileBenchmarks: Array<typeof testItems[0]["benchmarks"][0]> = [];
  const hasSelectedProfile = Boolean(parsed.benchmarkProfileId);

  if (parsed.benchmarkProfileId) {
    const profile = await prisma.benchmarkProfile.findFirst({
      where: {
        id: parsed.benchmarkProfileId,
        organizationId: ctx.organizationId,
        isActive: true,
      },
      include: {
        benchmarks: true,
      },
    });

    if (profile) {
      profileBenchmarks = profile.benchmarks;
    }
  }

  // 5. Ambil data test item & benchmarks milik organisasi secara aman
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
  const itemBenchmarkTargetMap = new Map<string, number | undefined>();

  const engineItems: TestItemValue[] = parsed.results.map((res) => {
    const itemDef = testItemMap.get(res.testItemId);

    // KETENTUAN UTAMA:
    // Jika pelatih memilih BenchmarkProfile, seluruh scoring assessment HARUS mengambil benchmark dari profile tersebut.
    // Tidak boleh fallback ke benchmark organisasi lainnya jika item tidak ada dalam profile yang dipilih.
    const itemProfileBms = profileBenchmarks.filter((b) => b.testItemId === res.testItemId);
    const bm = hasSelectedProfile
      ? (itemProfileBms.length > 0 ? pickBestBenchmark(itemProfileBms, athleteCheck.gender, athleteAge) : null)
      : pickBestBenchmark(itemDef?.benchmarks || [], athleteCheck.gender, athleteAge);

    const targetVal = bm ? Number(bm.thresholdA) : undefined;
    itemBenchmarkTargetMap.set(res.testItemId, targetVal);

    return {
      testItemId: res.testItemId,
      physicalComponent: itemDef?.physicalComponent || "FLEXIBILITY",
      rawValue: res.rawValue,
      scoreDirection: itemDef?.scoreDirection || "HIGHER_IS_BETTER",
      thresholdA: targetVal,
      thresholdB: bm ? Number(bm.thresholdB) : undefined,
      thresholdC: bm ? Number(bm.thresholdC) : undefined,
      thresholdD: bm ? Number(bm.thresholdD) : undefined,
    };
  });

  // 6. Hitung hasil engine server-side (Authoritative Domain Calculation)
  const engineResult = calculateAssessmentEngine(engineItems);

  try {
    // 7. Simpan Assessment, ResultItems, dan Analysis dalam 1 transaksi atomic
    const assessment = await prisma.$transaction(async (tx) => {
      const newAssessment = await tx.assessment.create({
        data: {
          organizationId: ctx.organizationId,
          athleteId: parsed.athleteId,
          createdByMemberId: ctx.memberId,
          benchmarkProfileId: parsed.benchmarkProfileId || null,
          assessmentDate,
          assessmentType: parsed.assessmentType ?? "BENCHMARK_BASED",
          status: "COMPLETED",
          overallScore: engineResult.overallScore,
          overallGrade: engineResult.overallGrade,
          resultItems: {
            create: parsed.results.map((r) => {
              const target = itemBenchmarkTargetMap.get(r.testItemId);
              return {
                testItemId: r.testItemId,
                rawValue: r.rawValue,
                score: engineResult.itemScores[r.testItemId] ?? 0,
                benchmarkValue: target != null ? target : null,
              };
            }),
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
          ruleEngineVersion: "v2.0-profile-snapshot",
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

export async function updateAssessmentRecommendation(
  assessmentId: string,
  recommendationText: string
) {
  try {
    const ctx = await requireOrgContext();

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId: ctx.organizationId,
      },
      select: { id: true, athleteId: true },
    });

    if (!assessment) {
      return { success: false, error: "Assessment tidak ditemukan atau tidak memiliki akses" };
    }

    await prisma.assessmentAnalysis.update({
      where: { assessmentId },
      data: {
        recommendationText: recommendationText.trim(),
      },
    });

    revalidatePath(`/assessments/${assessmentId}`);
    revalidatePath(`/api/assessments/${assessmentId}/pdf`);
    revalidatePath("/assessments");
    revalidatePath("/reports");
    revalidatePath(`/athletes/${assessment.athleteId}`);

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui rekomendasi.";
    return { success: false, error: errorMsg };
  }
}

export async function deleteAssessmentAction(
  assessmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();

    // Verify role authorization (only admin and head_coach can delete)
    const role = (ctx.role || "").toLowerCase();
    if (role !== "admin" && role !== "head_coach") {
      return { success: false, error: "Anda tidak memiliki wewenang untuk menghapus asesmen." };
    }

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId: ctx.organizationId,
      },
      select: {
        id: true,
        athleteId: true,
      },
    });

    if (!assessment) {
      return { success: false, error: "Asesmen tidak ditemukan atau Anda tidak memiliki akses." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Reset any AthleteGoal achieved by this assessment back to ACTIVE
      await tx.athleteGoal.updateMany({
        where: {
          achievedAssessmentId: assessmentId,
          organizationId: ctx.organizationId,
        },
        data: {
          status: "ACTIVE",
          achievedAt: null,
          achievedAssessmentId: null,
        },
      });

      // 2. Delete child reports
      await tx.report.deleteMany({
        where: { assessmentId },
      });

      // 3. Delete analysis
      await tx.assessmentAnalysis.deleteMany({
        where: { assessmentId },
      });

      // 4. Delete result items
      await tx.assessmentResultItem.deleteMany({
        where: { assessmentId },
      });

      // 5. Delete assessment itself
      await tx.assessment.delete({
        where: { id: assessmentId },
      });
    });

    revalidatePath("/assessments");
    revalidatePath(`/athletes/${assessment.athleteId}`);
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/progress");
    revalidatePath("/compare");

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus asesmen.";
    return { success: false, error: errorMsg };
  }
}


