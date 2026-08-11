"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import {
  createTrainingPlanSchema,
  createTrainingExerciseSchema,
} from "./schema";

export async function createTrainingPlan(formData: FormData) {
  const ctx = await requireOrgContext();

  const athleteIdVal = formData.get("athleteId") as string;
  const rawData = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    athleteId: athleteIdVal && athleteIdVal !== "NONE" ? athleteIdVal : undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
  };

  const parseResult = createTrainingPlanSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi gagal",
    };
  }

  const { title, description, athleteId, startDate, endDate } = parseResult.data;

  try {
    const plan = await prisma.trainingPlan.create({
      data: {
        organizationId: ctx.organizationId,
        title,
        description,
        athleteId: athleteId || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    revalidatePath("/training-plans");
    return { success: true, planId: plan.id };
  } catch (err: any) {
    console.error("Failed to create training plan:", err);
    return { success: false, error: "Gagal membuat program latihan" };
  }
}

export async function updateTrainingPlan(planId: string, formData: FormData) {
  const ctx = await requireOrgContext();

  const existingPlan = await prisma.trainingPlan.findFirst({
    where: { id: planId, organizationId: ctx.organizationId },
  });

  if (!existingPlan) {
    return { success: false, error: "Program latihan tidak ditemukan atau akses ditolak" };
  }

  const athleteIdVal = formData.get("athleteId") as string;
  const rawData = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    athleteId: athleteIdVal && athleteIdVal !== "NONE" ? athleteIdVal : undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
  };

  const parseResult = createTrainingPlanSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi gagal",
    };
  }

  const { title, description, athleteId, startDate, endDate } = parseResult.data;

  try {
    await prisma.trainingPlan.update({
      where: { id: planId },
      data: {
        title,
        description,
        athleteId: athleteId || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    revalidatePath("/training-plans");
    revalidatePath(`/training-plans/${planId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update training plan:", err);
    return { success: false, error: "Gagal memperbarui program latihan" };
  }
}

export async function deleteTrainingPlan(planId: string) {
  const ctx = await requireOrgContext();

  const existingPlan = await prisma.trainingPlan.findFirst({
    where: { id: planId, organizationId: ctx.organizationId },
  });

  if (!existingPlan) {
    return { success: false, error: "Program latihan tidak ditemukan atau akses ditolak" };
  }

  try {
    await prisma.trainingPlan.delete({
      where: { id: planId },
    });

    revalidatePath("/training-plans");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete training plan:", err);
    return { success: false, error: "Gagal menghapus program latihan" };
  }
}

export async function addExerciseToPlan(planId: string, formData: FormData) {
  const ctx = await requireOrgContext();

  const plan = await prisma.trainingPlan.findFirst({
    where: { id: planId, organizationId: ctx.organizationId },
    include: { exercises: { select: { id: true } } },
  });

  if (!plan) {
    return { success: false, error: "Program latihan tidak ditemukan" };
  }

  const rawData = {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || undefined,
    sets: formData.get("sets") ? Number(formData.get("sets")) : undefined,
    reps: (formData.get("reps") as string) || undefined,
    restSeconds: formData.get("restSeconds")
      ? Number(formData.get("restSeconds"))
      : undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parseResult = createTrainingExerciseSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi gerakan gagal",
    };
  }

  const { name, category, sets, reps, restSeconds, notes } = parseResult.data;

  try {
    await prisma.trainingExercise.create({
      data: {
        trainingPlanId: planId,
        name,
        category,
        sets,
        reps,
        restSeconds,
        notes,
        order: plan.exercises.length + 1,
      },
    });

    revalidatePath(`/training-plans/${planId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to add exercise:", err);
    return { success: false, error: "Gagal menambahkan gerakan latihan" };
  }
}

export async function deleteExercise(exerciseId: string, planId: string) {
  const ctx = await requireOrgContext();

  const exercise = await prisma.trainingExercise.findFirst({
    where: { id: exerciseId, trainingPlan: { organizationId: ctx.organizationId } },
  });

  if (!exercise) {
    return { success: false, error: "Gerakan latihan tidak ditemukan" };
  }

  try {
    await prisma.trainingExercise.delete({
      where: { id: exerciseId },
    });

    revalidatePath(`/training-plans/${planId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete exercise:", err);
    return { success: false, error: "Gagal menghapus gerakan latihan" };
  }
}
