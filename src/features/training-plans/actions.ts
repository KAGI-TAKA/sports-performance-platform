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
      error: parseResult.error.issues[0]?.message ?? "Validasi data program gagal",
    };
  }

  const { title, description, athleteId, startDate, endDate } = parseResult.data;

  // Verifikasi rentang tanggal
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return {
      success: false,
      error: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    };
  }

  // Verifikasi active status jika ditargetkan ke atlet spesifik
  if (athleteId) {
    const athleteCheck = await prisma.athlete.findFirst({
      where: {
        id: athleteId,
        organizationId: ctx.organizationId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!athleteCheck) {
      return {
        success: false,
        error: "Atlet tidak ditemukan atau tidak aktif di organisasi ini",
      };
    }
  }

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
    revalidatePath("/training-plans/templates");
    revalidatePath("/athletes");
    return { success: true, planId: plan.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal membuat program latihan";
    return { success: false, error: errorMsg };
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

  // Verifikasi rentang tanggal
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return {
      success: false,
      error: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    };
  }

  // Verifikasi active status jika atlet diubah
  if (athleteId) {
    const athleteCheck = await prisma.athlete.findFirst({
      where: {
        id: athleteId,
        organizationId: ctx.organizationId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!athleteCheck) {
      return {
        success: false,
        error: "Atlet tidak ditemukan atau tidak aktif di organisasi ini",
      };
    }
  }

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
    revalidatePath("/training-plans/templates");
    revalidatePath(`/training-plans/${planId}`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui program latihan";
    return { success: false, error: errorMsg };
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
    revalidatePath("/training-plans/templates");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus program latihan";
    return { success: false, error: errorMsg };
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

  const exerciseIdVal = (formData.get("exerciseId") as string) || undefined;
  let name = (formData.get("name") as string) || "";
  let category = (formData.get("category") as string) || undefined;

  if (exerciseIdVal) {
    const masterEx = await prisma.exercise.findFirst({
      where: { id: exerciseIdVal, organizationId: ctx.organizationId },
    });
    if (masterEx) {
      if (!name) name = masterEx.name;
      if (!category && masterEx.category) category = masterEx.category;
    }
  }

  const rawData = {
    name,
    category,
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

  const parsed = parseResult.data;

  try {
    await prisma.trainingExercise.create({
      data: {
        trainingPlanId: planId,
        exerciseId: exerciseIdVal || null,
        name: parsed.name,
        category: parsed.category,
        sets: parsed.sets,
        reps: parsed.reps,
        restSeconds: parsed.restSeconds,
        notes: parsed.notes,
        order: plan.exercises.length + 1,
      },
    });

    revalidatePath(`/training-plans/${planId}`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menambahkan gerakan latihan";
    return { success: false, error: errorMsg };
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus gerakan latihan";
    return { success: false, error: errorMsg };
  }
}

export async function prescribeTemplateToAthlete(templateId: string, formData: FormData) {
  const ctx = await requireOrgContext();

  const athleteId = formData.get("athleteId") as string;
  const customTitle = formData.get("title") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!athleteId) {
    return { success: false, error: "Atlet harus dipilih" };
  }

  // 1. Verify template exists & belongs to org & is athleteId == null
  const template = await prisma.trainingPlan.findFirst({
    where: { id: templateId, organizationId: ctx.organizationId, athleteId: null },
    include: { exercises: { orderBy: { order: "asc" } } },
  });

  if (!template) {
    return { success: false, error: "Template program tidak ditemukan atau akses ditolak" };
  }

  // 2. Verify target athlete belongs to org and is active
  const athlete = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId: ctx.organizationId, isActive: true },
  });

  if (!athlete) {
    return { success: false, error: "Atlet tidak ditemukan atau tidak aktif di organisasi ini" };
  }

  // 3. Date boundary check
  if (startDateStr && endDateStr && new Date(endDateStr) < new Date(startDateStr)) {
    return { success: false, error: "Tanggal selesai tidak boleh sebelum tanggal mulai" };
  }

  try {
    const newPlan = await prisma.$transaction(async (tx) => {
      const plan = await tx.trainingPlan.create({
        data: {
          organizationId: ctx.organizationId,
          athleteId: athlete.id,
          title: customTitle || `${template.title} - ${athlete.fullName}`,
          description: template.description,
          startDate: startDateStr ? new Date(startDateStr) : null,
          endDate: endDateStr ? new Date(endDateStr) : null,
        },
      });

      if (template.exercises.length > 0) {
        await tx.trainingExercise.createMany({
          data: template.exercises.map((ex) => ({
            trainingPlanId: plan.id,
            name: ex.name,
            category: ex.category,
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds,
            notes: ex.notes,
            order: ex.order,
          })),
        });
      }

      return plan;
    });

    revalidatePath("/training-plans");
    revalidatePath("/training-plans/templates");
    revalidatePath("/athletes");
    revalidatePath(`/athletes/${athleteId}`);
    return { success: true, planId: newPlan.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal meresepkan template ke atlet";
    return { success: false, error: errorMsg };
  }
}
