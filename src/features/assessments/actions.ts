"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { createAssessmentSchema } from "./schema";
import { calculateAssessmentEngine, TestItemValue } from "./engine";


async function assertPermission(action: "create" | "update" | "delete") {
  const { success } = await auth.api.hasPermission({
    headers: await headers(),
    body: { permissions: { athlete: [action] } },
  });
  if (!success) throw new Error("Kamu tidak punya izin untuk aksi ini");
}

// ─── Benchmark Picker ──────────────────────────────────────────────────────────
// Pilih benchmark yang paling cocok untuk profil atlet.
// Urutan prioritas (lebih spesifik = lebih tinggi):
//   1. gender + rentang usia cocok
//   2. gender cocok saja (tanpa filter usia)
//   3. rentang usia cocok saja (tanpa filter gender)
//   4. fallback: benchmark pertama (perilaku lama)
function pickBestBenchmark(
  benchmarks: { ageMin: number; ageMax: number; gender: string | null; thresholdA: any; thresholdB: any; thresholdC: any; thresholdD: any }[],
  athleteGender: string,
  athleteAge: number
) {
  if (benchmarks.length === 0) return undefined;

  const ageMatch  = (b: (typeof benchmarks)[0]) => athleteAge >= b.ageMin && athleteAge <= b.ageMax;
  const genMatch  = (b: (typeof benchmarks)[0]) => b.gender === null || b.gender === athleteGender;

  return (
    benchmarks.find((b) => genMatch(b) && ageMatch(b)) ?? // P1: keduanya cocok
    benchmarks.find((b) => genMatch(b)) ??                 // P2: gender saja
    benchmarks.find((b) => ageMatch(b)) ??                 // P3: usia saja
    benchmarks[0]                                          // P4: fallback
  );
}

export async function createAssessment(input: unknown) {
  const ctx = await requireOrgContext();
  await assertPermission("create");

  const parsed = createAssessmentSchema.parse(input);

  // Verifikasi bahwa atlet yang di-assess memang milik organisasi yang sama
  // Mencegah coach org A membuat assessment untuk atlet org B dengan menebak athleteId
  const athleteCheck = await prisma.athlete.findFirst({
    where: { id: parsed.athleteId, organizationId: ctx.organizationId, isActive: true },
    select: { id: true, gender: true, dateOfBirth: true },
  });
  if (!athleteCheck) throw new Error("Atlet tidak ditemukan di organisasi ini");

  // Hitung usia atlet pada tanggal assessment (bukan hari ini)
  // agar assessment historis tetap akurat.
  const assessmentDate = new Date(parsed.assessmentDate);
  const athleteAge = Math.floor(
    (assessmentDate.getTime() - athleteCheck.dateOfBirth.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
  );

  // Ambil data test item & benchmarks untuk kalkulasi
  const testItemIds = parsed.results.map((r) => r.testItemId);
  const testItems = await prisma.testItem.findMany({
    where: {
      id: { in: testItemIds },
      organizationId: ctx.organizationId,
    },
    include: {
      benchmarks: true,
    },
  });

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

  const engineResult = calculateAssessmentEngine(engineItems);

  // Simpan Assessment, ResultItems, dan Analysis dalam 1 transaksi
  const assessment = await prisma.$transaction(async (tx) => {
    const newAssessment = await tx.assessment.create({
      data: {
        organizationId: ctx.organizationId,
        athleteId: parsed.athleteId,
        createdByMemberId: ctx.memberId,
        assessmentDate: parsed.assessmentDate,
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

    return newAssessment;
  });

  revalidatePath("/athletes");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/progress");
  revalidatePath("/compare");
  revalidatePath("/assessments");

  return assessment;
}
