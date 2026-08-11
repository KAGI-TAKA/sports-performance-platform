"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { z } from "zod";

const updateBenchmarkSchema = z.object({
  thresholdA: z.coerce.number().positive("Threshold A harus positif"),
  thresholdB: z.coerce.number().positive("Threshold B harus positif"),
  thresholdC: z.coerce.number().positive("Threshold C harus positif"),
  thresholdD: z.coerce.number().positive("Threshold D harus positif"),
});

export async function updateBenchmark(benchmarkId: string, formData: FormData) {
  const ctx = await requireOrgContext();

  // Verify ownership — benchmark must belong to a testItem in this org
  const existingBenchmark = await prisma.benchmark.findFirst({
    where: { id: benchmarkId, testItem: { organizationId: ctx.organizationId } },
    select: { id: true },
  });

  if (!existingBenchmark) {
    return { success: false, error: "Benchmark tidak ditemukan atau akses ditolak." };
  }

  const raw = {
    thresholdA: formData.get("thresholdA"),
    thresholdB: formData.get("thresholdB"),
    thresholdC: formData.get("thresholdC"),
    thresholdD: formData.get("thresholdD"),
  };

  const result = updateBenchmarkSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Data tidak valid." };
  }

  await prisma.benchmark.update({
    where: { id: benchmarkId },
    data: {
      thresholdA: result.data.thresholdA,
      thresholdB: result.data.thresholdB,
      thresholdC: result.data.thresholdC,
      thresholdD: result.data.thresholdD,
    },
  });

  revalidatePath("/benchmarks");
  return { success: true };
}

export async function createTestItem(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    if (ctx.role === "assistant_coach") {
      return { success: false, error: "Tidak ada akses" };
    }

    const name = formData.get("name") as string;
    const physicalComponent = formData.get("physicalComponent") as any;
    const unit = formData.get("unit") as any;
    const scoreDirection = formData.get("scoreDirection") as any;
    const testType = (formData.get("testType") as any) || "NUMERIC";
    const orderStr = formData.get("order") as string;
    
    if (!name || !physicalComponent || !unit || !scoreDirection || !orderStr) {
      return { success: false, error: "Data tidak lengkap" };
    }

    const order = parseInt(orderStr, 10);

    const created = await prisma.testItem.create({
      data: {
        organizationId: ctx.organizationId,
        physicalComponent,
        name,
        unit,
        scoreDirection,
        testType,
        order,
        isActive: true,
      },
    });

    await prisma.benchmark.create({
      data: {
        testItemId: created.id,
        organizationId: ctx.organizationId,
        thresholdA: 80,
        thresholdB: 65,
        thresholdC: 50,
        thresholdD: 35,
        ageMin: 0,
        ageMax: 99,
      },
    });

    revalidatePath("/benchmarks");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message ?? "Gagal menambahkan item tes" };
  }
}

export async function deactivateTestItem(testItemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    if (ctx.role === "assistant_coach") {
      return { success: false, error: "Tidak ada akses" };
    }

    const existing = await prisma.testItem.findFirst({
      where: { id: testItemId, organizationId: ctx.organizationId },
    });

    if (!existing) {
      return { success: false, error: "Item tes tidak ditemukan" };
    }

    await prisma.testItem.update({
      where: { id: testItemId },
      data: { isActive: false },
    });

    revalidatePath("/benchmarks");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message ?? "Gagal menonaktifkan item tes" };
  }
}
