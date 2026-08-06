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
