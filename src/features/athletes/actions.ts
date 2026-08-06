"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { createAthleteSchema, updateAthleteSchema } from "./schema";

async function assertPermission(action: "create" | "update" | "delete") {
  const { success } = await auth.api.hasPermission({
    headers: await headers(),
    body: { permissions: { athlete: [action] } },
  });
  if (!success) throw new Error("Kamu tidak punya izin untuk aksi ini");
}

export async function createAthlete(input: unknown) {
  const ctx = await requireOrgContext();
  await assertPermission("create");

  const parsed = createAthleteSchema.parse(input);
  const athlete = await prisma.athlete.create({
    data: { ...parsed, organizationId: ctx.organizationId },
  });

  revalidatePath("/athletes");
  return athlete;
}

export async function updateAthlete(input: unknown) {
  const ctx = await requireOrgContext();
  await assertPermission("update");

  const { id, ...rest } = updateAthleteSchema.parse(input);

  // Verifikasi kepemilikan DULU sebelum update — Prisma `update` butuh where
  // by unique field (id saja), jadi tenant-check tidak bisa ditumpuk langsung
  // di klausa where-nya. Makanya dicek manual di sini.
  const existing = await prisma.athlete.findFirst({
    where: { id, organizationId: ctx.organizationId },
    select: { id: true },
  });
  if (!existing) throw new Error("Atlet tidak ditemukan di organisasi ini");

  const athlete = await prisma.athlete.update({ where: { id }, data: rest });

  revalidatePath("/athletes");
  return athlete;
}

export async function deleteAthlete(athleteId: string) {
  const ctx = await requireOrgContext();
  await assertPermission("delete");

  const existing = await prisma.athlete.findFirst({
    where: { id: athleteId, organizationId: ctx.organizationId },
    select: { id: true },
  });
  if (!existing) throw new Error("Atlet tidak ditemukan di organisasi ini");

  // Soft delete — data historis assessment atlet ini tetap utuh untuk audit/laporan lama
  await prisma.athlete.update({
    where: { id: athleteId },
    data: { isActive: false },
  });

  revalidatePath("/athletes");
}

export async function addAthleteInjury(input: unknown) {
  const ctx = await requireOrgContext();
  await assertPermission("update");

  const { createInjurySchema } = await import("./schema");
  const parsed = createInjurySchema.parse(input);

  const existing = await prisma.athlete.findFirst({
    where: { id: parsed.athleteId, organizationId: ctx.organizationId },
    select: { id: true },
  });
  if (!existing) throw new Error("Atlet tidak ditemukan di organisasi ini");

  const injury = await prisma.athleteInjuryHistory.create({
    data: parsed,
  });

  revalidatePath("/athletes");
  return injury;
}

export async function deleteAthleteInjury(injuryId: string) {
  const ctx = await requireOrgContext();
  await assertPermission("update");

  const injury = await prisma.athleteInjuryHistory.findFirst({
    where: {
      id: injuryId,
      athlete: { organizationId: ctx.organizationId },
    },
    select: { id: true },
  });
  if (!injury) throw new Error("Riwayat cedera tidak ditemukan di organisasi ini");

  await prisma.athleteInjuryHistory.delete({
    where: { id: injuryId },
  });

  revalidatePath("/athletes");
}
