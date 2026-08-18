"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";

export async function getExercises() {
  const ctx = await requireOrgContext();
  return prisma.exercise.findMany({
    where: { organizationId: ctx.organizationId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createExercise(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    if (ctx.role === "assistant_coach") {
      return { success: false, error: "Tidak ada akses" };
    }

    const name = formData.get("name") as string;
    const category = (formData.get("category") as string) || null;
    const description = (formData.get("description") as string) || null;
    const videoUrl = (formData.get("videoUrl") as string) || null;

    if (!name || name.trim().length < 2) {
      return { success: false, error: "Nama gerakan minimal 2 karakter" };
    }

    await prisma.exercise.create({
      data: {
        organizationId: ctx.organizationId,
        name: name.trim(),
        category: category?.trim() || null,
        description: description?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        isActive: true,
      },
    });

    revalidatePath("/training-plans");
    revalidatePath("/training-plans/exercises");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan gerakan ke Master Library";
    return { success: false, error: message };
  }
}

export async function deleteExercise(exerciseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    if (ctx.role === "assistant_coach") {
      return { success: false, error: "Tidak ada akses" };
    }

    const existing = await prisma.exercise.findFirst({
      where: { id: exerciseId, organizationId: ctx.organizationId },
    });

    if (!existing) {
      return { success: false, error: "Gerakan tidak ditemukan" };
    }

    await prisma.exercise.update({
      where: { id: exerciseId },
      data: { isActive: false },
    });

    revalidatePath("/training-plans");
    revalidatePath("/training-plans/exercises");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus gerakan";
    return { success: false, error: message };
  }
}
