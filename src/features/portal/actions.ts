"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { hashPortalToken } from "./queries";

export async function createPortalAccess(
  athleteId: string,
  formData: FormData
) {
  const ctx = await requireOrgContext();

  const athlete = await prisma.athlete.findFirst({
    where: {
      id: athleteId,
      organizationId: ctx.organizationId,
      isActive: true,
    },
  });

  if (!athlete) {
    return {
      success: false,
      error: "Atlet tidak ditemukan, tidak aktif, atau bukan milik organisasi Anda",
    };
  }

  const accessTypeRaw = formData.get("accessType") as string;
  const accessType = accessTypeRaw === "PARENT" ? "PARENT" : "ATHLETE";

  const expiresInDaysRaw = Number(formData.get("expiresInDays") || 30);
  const expiresInDays = isNaN(expiresInDaysRaw) || expiresInDaysRaw <= 0 ? 30 : expiresInDaysRaw;

  // Generate cryptographically secure token (64 hex characters)
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashPortalToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  try {
    await prisma.portalAccess.create({
      data: {
        organizationId: ctx.organizationId,
        athleteId: athlete.id,
        createdByMemberId: ctx.memberId,
        tokenHash,
        accessType,
        expiresAt,
      },
    });

    revalidatePath(`/athletes/${athleteId}`);
    return {
      success: true,
      rawToken,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (err: unknown) {
    console.error("Gagal membuat portal access:", err);
    return {
      success: false,
      error: "Gagal membuat link akses portal",
    };
  }
}

export async function revokePortalAccess(accessId: string, athleteId: string) {
  const ctx = await requireOrgContext();

  const access = await prisma.portalAccess.findFirst({
    where: {
      id: accessId,
      organizationId: ctx.organizationId,
    },
  });

  if (!access) {
    return {
      success: false,
      error: "Akses portal tidak ditemukan atau akses ditolak",
    };
  }

  try {
    await prisma.portalAccess.update({
      where: { id: accessId },
      data: { revokedAt: new Date() },
    });

    revalidatePath(`/athletes/${athleteId}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal mencabut portal access:", err);
    return {
      success: false,
      error: "Gagal mencabut akses portal",
    };
  }
}

export async function listPortalAccessesForAthlete(athleteId: string) {
  const ctx = await requireOrgContext();

  const accesses = await prisma.portalAccess.findMany({
    where: {
      organizationId: ctx.organizationId,
      athleteId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { include: { user: { select: { name: true } } } },
    },
  });

  return accesses.map((a) => ({
    id: a.id,
    accessType: a.accessType,
    expiresAt: a.expiresAt.toISOString(),
    revokedAt: a.revokedAt ? a.revokedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    createdByName: a.createdBy.user.name,
    isExpired: new Date() > new Date(a.expiresAt),
    isRevoked: a.revokedAt != null,
    isActive: a.revokedAt == null && new Date() <= new Date(a.expiresAt),
  }));
}
