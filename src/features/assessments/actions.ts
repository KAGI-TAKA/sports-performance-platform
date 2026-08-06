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

export async function createAssessment(input: unknown) {
  const ctx = await requireOrgContext();
  await assertPermission("create");

  const parsed = createAssessmentSchema.parse(input);

  // Verifikasi bahwa atlet yang di-assess memang milik organisasi yang sama
  // Mencegah coach org A membuat assessment untuk atlet org B dengan menebak athleteId
  const athleteCheck = await prisma.athlete.findFirst({
    where: { id: parsed.athleteId, organizationId: ctx.organizationId, isActive: true },
    select: { id: true },
  });
  if (!athleteCheck) throw new Error("Atlet tidak ditemukan di organisasi ini");

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
    const bm = itemDef?.benchmarks[0];

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

  return assessment;
}
