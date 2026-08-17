"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { createAthleteSchema, updateAthleteSchema, createInjurySchema } from "./schema";

export async function createAthlete(input: unknown) {
  const ctx = await requireOrgContext();

  const parseResult = createAthleteSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi data atlet gagal",
    };
  }

  try {
    const athlete = await prisma.athlete.create({
      data: {
        ...parseResult.data,
        organizationId: ctx.organizationId,
      },
    });

    revalidatePath("/athletes");
    revalidatePath("/dashboard");
    return { success: true, athleteId: athlete.id };
  } catch (err: unknown) {
    console.error("Failed to create athlete:", err);
    return { success: false, error: "Gagal me-registrasi atlet baru" };
  }
}

export async function updateAthlete(input: unknown) {
  const ctx = await requireOrgContext();

  const parseResult = updateAthleteSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi pembaruan atlet gagal",
    };
  }

  const { id, ...rest } = parseResult.data;

  // Server-side multi-tenant ownership check
  const existing = await prisma.athlete.findFirst({
    where: { id, organizationId: ctx.organizationId },
    select: { id: true },
  });

  if (!existing) {
    return { success: false, error: "Atlet tidak ditemukan atau akses ditolak" };
  }

  try {
    await prisma.athlete.update({
      where: { id },
      data: rest,
    });

    revalidatePath("/athletes");
    revalidatePath(`/athletes/${id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update athlete:", err);
    return { success: false, error: "Gagal memperbarui data atlet" };
  }
}

export async function toggleAthleteStatus(athleteId: string, isActive: boolean) {
  const ctx = await requireOrgContext();

  const existing = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId: ctx.organizationId },
    select: { id: true, fullName: true },
  });

  if (!existing) {
    return { success: false, error: "Atlet tidak ditemukan atau akses ditolak" };
  }

  try {
    await prisma.athlete.update({
      where: { id: athleteId },
      data: { isActive },
    });

    revalidatePath("/athletes");
    revalidatePath(`/athletes/${athleteId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to toggle athlete status:", err);
    return { success: false, error: "Gagal mengubah status aktif atlet" };
  }
}

export async function deleteAthlete(athleteId: string) {
  const ctx = await requireOrgContext();

  const existing = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId: ctx.organizationId },
    select: { id: true },
  });

  if (!existing) {
    return { success: false, error: "Atlet tidak ditemukan atau akses ditolak" };
  }

  // Soft delete — preserves historical assessments, sessions, and logs for compliance & reporting
  try {
    await prisma.athlete.update({
      where: { id: athleteId },
      data: { isActive: false },
    });

    revalidatePath("/athletes");
    revalidatePath(`/athletes/${athleteId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to soft-delete athlete:", err);
    return { success: false, error: "Gagal menonaktifkan atlet" };
  }
}

export async function addAthleteInjury(input: unknown) {
  const ctx = await requireOrgContext();

  const parseResult = createInjurySchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi catatan cedera gagal",
    };
  }

  const existing = await prisma.athlete.findFirst({
    where: { id: parseResult.data.athleteId, organizationId: ctx.organizationId },
    select: { id: true },
  });

  if (!existing) {
    return { success: false, error: "Atlet tidak ditemukan atau akses ditolak" };
  }

  try {
    const injury = await prisma.athleteInjuryHistory.create({
      data: parseResult.data,
    });

    revalidatePath("/athletes");
    revalidatePath(`/athletes/${parseResult.data.athleteId}`);
    revalidatePath("/dashboard");
    return { success: true, injuryId: injury.id };
  } catch (err: unknown) {
    console.error("Failed to add athlete injury:", err);
    return { success: false, error: "Gagal menambahkan catatan cedera" };
  }
}

export async function deleteAthleteInjury(injuryId: string) {
  const ctx = await requireOrgContext();

  const injury = await prisma.athleteInjuryHistory.findFirst({
    where: {
      id: injuryId,
      athlete: { organizationId: ctx.organizationId },
    },
    select: { id: true, athleteId: true },
  });

  if (!injury) {
    return { success: false, error: "Riwayat cedera tidak ditemukan atau akses ditolak" };
  }

  try {
    await prisma.athleteInjuryHistory.delete({
      where: { id: injuryId },
    });

    revalidatePath("/athletes");
    revalidatePath(`/athletes/${injury.athleteId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete athlete injury:", err);
    return { success: false, error: "Gagal menghapus riwayat cedera" };
  }
}
