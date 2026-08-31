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
  gender: z.enum(["MALE", "FEMALE", "ALL"]).default("ALL"),
  ageMin: z.coerce.number().min(0).max(99).default(0),
  ageMax: z.coerce.number().min(0).max(99).default(99),
});

export async function upsertBenchmarkForTestItem(
  testItemId: string,
  formData: FormData,
  benchmarkId?: string
) {
  const ctx = await requireOrgContext();

  const raw = {
    thresholdA: formData.get("thresholdA"),
    thresholdB: formData.get("thresholdB"),
    thresholdC: formData.get("thresholdC"),
    thresholdD: formData.get("thresholdD"),
    gender: (formData.get("gender") as string) || "ALL",
    ageMin: formData.get("ageMin") || 0,
    ageMax: formData.get("ageMax") || 99,
  };

  const result = updateBenchmarkSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Data threshold tidak valid." };
  }

  const genderValue = result.data.gender === "ALL" ? null : (result.data.gender as "MALE" | "FEMALE");

  try {
    if (benchmarkId) {
      await prisma.benchmark.update({
        where: { id: benchmarkId },
        data: {
          thresholdA: result.data.thresholdA,
          thresholdB: result.data.thresholdB,
          thresholdC: result.data.thresholdC,
          thresholdD: result.data.thresholdD,
          gender: genderValue,
          ageMin: result.data.ageMin,
          ageMax: result.data.ageMax,
        },
      });
    } else {
      await prisma.benchmark.create({
        data: {
          testItemId,
          organizationId: ctx.organizationId,
          thresholdA: result.data.thresholdA,
          thresholdB: result.data.thresholdB,
          thresholdC: result.data.thresholdC,
          thresholdD: result.data.thresholdD,
          gender: genderValue,
          ageMin: result.data.ageMin,
          ageMax: result.data.ageMax,
        },
      });
    }

    revalidatePath("/benchmarks");
    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal menyimpan benchmark:", err);
    return { success: false, error: "Gagal menyimpan threshold benchmark." };
  }
}

export async function deleteBenchmark(benchmarkId: string) {
  const ctx = await requireOrgContext();

  try {
    await prisma.benchmark.deleteMany({
      where: {
        id: benchmarkId,
        organizationId: ctx.organizationId,
      },
    });

    revalidatePath("/benchmarks");
    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal menghapus benchmark:", err);
    return { success: false, error: "Gagal menghapus threshold benchmark." };
  }
}

export async function updateBenchmark(benchmarkId: string, formData: FormData) {
  return upsertBenchmarkForTestItem("", formData, benchmarkId);
}

export async function createTestItem(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    if (ctx.role === "assistant_coach") {
      return { success: false, error: "Tidak ada akses" };
    }

    const name = formData.get("name") as string;
    const physicalComponent = formData.get("physicalComponent") as string;
    const componentId = formData.get("componentId") as string;
    const unit = formData.get("unit") as string;
    const scoreDirection = formData.get("scoreDirection") as string;
    const testType = (formData.get("testType") as string) || "NUMERIC";
    const orderStr = formData.get("order") as string;
    
    if (!name || !unit || !scoreDirection || !orderStr) {
      return { success: false, error: "Data tidak lengkap" };
    }

    const order = parseInt(orderStr, 10);

    const created = await prisma.testItem.create({
      data: {
        organizationId: ctx.organizationId,
        componentId: componentId || null,
        physicalComponent: (physicalComponent || null) as Parameters<typeof prisma.testItem.create>[0]["data"]["physicalComponent"],
        name,
        unit: unit as Parameters<typeof prisma.testItem.create>[0]["data"]["unit"],
        scoreDirection: scoreDirection as Parameters<typeof prisma.testItem.create>[0]["data"]["scoreDirection"],
        testType: testType as Parameters<typeof prisma.testItem.create>[0]["data"]["testType"],
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan item tes";
    return { success: false, error: message };
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menonaktifkan item tes";
    return { success: false, error: message };
  }
}

export async function createAssessmentComponent(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    if (ctx.role === "assistant_coach") {
      return { success: false, error: "Tidak ada akses" };
    }

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const orderStr = (formData.get("order") as string) || "0";

    if (!name) {
      return { success: false, error: "Nama komponen wajib diisi" };
    }

    const order = parseInt(orderStr, 10);

    await prisma.assessmentComponent.create({
      data: {
        organizationId: ctx.organizationId,
        name,
        description,
        order,
        isActive: true,
      },
    });

    revalidatePath("/benchmarks");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan komponen fisik";
    return { success: false, error: message };
  }
}
