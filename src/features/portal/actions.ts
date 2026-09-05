"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { hashPortalToken } from "./queries";

export async function generatePortalCredentials(athleteName: string, accessType: "ATHLETE" | "PARENT") {
  const cleanName = athleteName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);
  const randomPin = Math.floor(1000 + Math.random() * 9000);
  const prefix = accessType === "PARENT" ? "ortu_" : "atlet_";
  const username = `${prefix}${cleanName}_${randomPin}`;
  const plainPassword = accessType === "PARENT" ? `ZulfiOrtu${randomPin}!` : `ZulfiCoach${randomPin}!`;
  return { username, plainPassword };
}

export type QuickAccessDurationPreset = "1h" | "24h" | "7d" | "custom";

export async function generateQuickAccess(input: {
  athleteId: string;
  accessType?: "PARENT" | "ATHLETE";
  durationPreset?: QuickAccessDurationPreset;
  customHours?: number;
}): Promise<{
  success: boolean;
  error?: string;
  rawToken?: string;
  portalUrl?: string;
  expiresAt?: string;
  durationLabel?: string;
}> {
  const ctx = await requireOrgContext();

  const athlete = await prisma.athlete.findFirst({
    where: {
      id: input.athleteId,
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

  const accessType = input.accessType === "PARENT" ? "PARENT" : "ATHLETE";
  const preset = input.durationPreset ?? "24h";

  let durationMs = 24 * 60 * 60 * 1000; // Default 24 jam
  let durationLabel = "24 Jam";

  if (preset === "1h") {
    durationMs = 1 * 60 * 60 * 1000;
    durationLabel = "1 Jam";
  } else if (preset === "24h") {
    durationMs = 24 * 60 * 60 * 1000;
    durationLabel = "24 Jam (Default)";
  } else if (preset === "7d") {
    durationMs = 7 * 24 * 60 * 60 * 1000;
    durationLabel = "7 Hari";
  } else if (preset === "custom" && input.customHours && input.customHours > 0) {
    const hours = Math.min(Math.max(input.customHours, 1), 720); // 1 jam s/d 30 hari max
    durationMs = hours * 60 * 60 * 1000;
    durationLabel = `${hours} Jam`;
  }

  const expiresAt = new Date(Date.now() + durationMs);

  // Invalidate / revoke existing active token for this athlete and accessType
  await prisma.portalAccess.updateMany({
    where: {
      athleteId: athlete.id,
      organizationId: ctx.organizationId,
      accessType,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // Generate cryptographically secure token (64 hex characters)
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashPortalToken(rawToken);

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

    revalidatePath(`/athletes/${athlete.id}`);
    revalidatePath("/settings");

    return {
      success: true,
      rawToken,
      portalUrl: `/portal/${rawToken}`,
      expiresAt: expiresAt.toISOString(),
      durationLabel,
    };
  } catch (err) {
    console.error("Gagal membuat Quick Access token:", err);
    return {
      success: false,
      error: "Gagal membuat link Quick Access",
    };
  }
}

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

  const { username, plainPassword } = await generatePortalCredentials(athlete.fullName, accessType);
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.portalAccess.findFirst({
    where: {
      organizationId: ctx.organizationId,
      athleteId: athlete.id,
      accessType,
    },
  });

  try {
    if (existing) {
      await prisma.portalAccess.update({
        where: { id: existing.id },
        data: {
          tokenHash,
          expiresAt,
          revokedAt: null,
          username: existing.username ?? username,
          passwordHash: existing.passwordHash ?? passwordHash,
          plainPassword: existing.plainPassword ?? plainPassword,
          createdByMemberId: ctx.memberId,
        },
      });

      revalidatePath(`/athletes/${athleteId}`);
      return {
        success: true,
        rawToken,
        username: existing.username ?? username,
        plainPassword: existing.plainPassword ?? plainPassword,
        expiresAt: expiresAt.toISOString(),
      };
    }

    await prisma.portalAccess.create({
      data: {
        organizationId: ctx.organizationId,
        athleteId: athlete.id,
        createdByMemberId: ctx.memberId,
        tokenHash,
        username,
        passwordHash,
        plainPassword,
        accessType,
        expiresAt,
      },
    });

    revalidatePath(`/athletes/${athleteId}`);
    return {
      success: true,
      rawToken,
      username,
      plainPassword,
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

export async function updatePortalCredentials(
  accessId: string,
  athleteId: string,
  newUsername: string,
  newPassword: string
) {
  const ctx = await requireOrgContext();

  const cleanUsername = newUsername.trim().toLowerCase();
  const cleanPassword = newPassword.trim();

  if (cleanUsername.length < 3) {
    return { success: false, error: "Username minimal harus 3 karakter" };
  }
  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    return { success: false, error: "Username hanya boleh memuat huruf kecil, angka, dan underscore (_)" };
  }
  if (cleanPassword.length < 6) {
    return { success: false, error: "Password minimal harus 6 karakter" };
  }

  const access = await prisma.portalAccess.findFirst({
    where: {
      id: accessId,
      organizationId: ctx.organizationId,
      athleteId,
    },
  });

  if (!access) {
    return { success: false, error: "Akses portal tidak ditemukan" };
  }

  // Check if username is already taken by another portal access
  const existingWithSameUsername = await prisma.portalAccess.findFirst({
    where: {
      username: cleanUsername,
      id: { not: accessId },
    },
  });

  if (existingWithSameUsername) {
    return { success: false, error: "Username ini sudah digunakan oleh akun portal lain. Silakan pilih username unik." };
  }

  const passwordHash = await bcrypt.hash(cleanPassword, 10);

  try {
    await prisma.portalAccess.update({
      where: { id: accessId },
      data: {
        username: cleanUsername,
        passwordHash,
        plainPassword: cleanPassword,
      },
    });

    revalidatePath(`/athletes/${athleteId}`);
    return { success: true, username: cleanUsername, plainPassword: cleanPassword };
  } catch (err: unknown) {
    console.error("Gagal mengupdate kredensial portal:", err);
    return { success: false, error: "Gagal menyimpan username dan password baru" };
  }
}

export async function resetPortalPassword(accessId: string, athleteId: string) {
  const ctx = await requireOrgContext();

  const access = await prisma.portalAccess.findFirst({
    where: {
      id: accessId,
      organizationId: ctx.organizationId,
    },
    include: { athlete: true },
  });

  if (!access) {
    return { success: false, error: "Akses portal tidak ditemukan" };
  }

  const { username, plainPassword } = await generatePortalCredentials(
    access.athlete.fullName,
    access.accessType as "ATHLETE" | "PARENT"
  );
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    await prisma.portalAccess.update({
      where: { id: accessId },
      data: {
        username,
        passwordHash,
        plainPassword,
      },
    });

    revalidatePath(`/athletes/${athleteId}`);
    return { success: true, username, plainPassword };
  } catch (err: unknown) {
    console.error("Gagal me-reset kredensial portal:", err);
    return { success: false, error: "Gagal me-reset password" };
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

export async function deletePortalAccess(accessId: string, athleteId: string) {
  const ctx = await requireOrgContext();

  const access = await prisma.portalAccess.findFirst({
    where: {
      id: accessId,
      organizationId: ctx.organizationId,
      athleteId,
    },
  });

  if (!access) {
    return {
      success: false,
      error: "Akses portal tidak ditemukan atau akses ditolak",
    };
  }

  try {
    await prisma.portalAccess.delete({
      where: { id: accessId },
    });

    revalidatePath(`/athletes/${athleteId}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal menghapus portal access:", err);
    return {
      success: false,
      error: "Gagal menghapus riwayat akses portal",
    };
  }
}

export async function loginWithPortalCredentials(usernameInput: string, passwordInput: string) {
  const usernameClean = usernameInput.trim();
  const passwordClean = passwordInput.trim();

  const access = await prisma.portalAccess.findFirst({
    where: {
      username: {
        equals: usernameClean,
        mode: "insensitive",
      },
      revokedAt: null,
      expiresAt: { gte: new Date() },
    },
    include: {
      athlete: { select: { isActive: true, fullName: true } },
    },
  });

  if (!access) {
    return {
      success: false,
      error: "Username atau password portal salah, kedaluwarsa, atau telah dicabut",
    };
  }

  if (!access.athlete?.isActive) {
    return {
      success: false,
      error: `Profil atlet (${access.athlete?.fullName ?? "Atlet"}) sedang dinonaktifkan oleh pelatih.`,
    };
  }

  let isValid = false;
  if (access.passwordHash) {
    isValid = await bcrypt.compare(passwordClean, access.passwordHash);
  } else if (access.plainPassword) {
    isValid = access.plainPassword === passwordClean;
  }

  if (!isValid) {
    return {
      success: false,
      error: "Username atau password portal tidak sesuai",
    };
  }

  return {
    success: true,
    redirectUrl: `/portal/${access.tokenHash}`,
  };
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
    username: a.username,
    plainPassword: a.plainPassword,
    expiresAt: a.expiresAt.toISOString(),
    revokedAt: a.revokedAt ? a.revokedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    createdByName: a.createdBy.user.name,
    isExpired: new Date() > new Date(a.expiresAt),
    isRevoked: a.revokedAt != null,
    isActive: a.revokedAt == null && new Date() <= new Date(a.expiresAt),
  }));
}

export async function updatePortalAthleteAvatar(athleteId: string, photoUrl: string) {
  if (!athleteId || !photoUrl) {
    return { success: false, error: "Data foto tidak valid" };
  }
  try {
    await prisma.athlete.update({
      where: { id: athleteId },
      data: { photoUrl },
    });
    revalidatePath("/portal");
    return { success: true };
  } catch (err) {
    console.error("Gagal update avatar atlet:", err);
    return { success: false, error: "Gagal menyimpan foto profil" };
  }
}

export async function changePortalAthletePassword(
  tokenHashOrAccessId: string,
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  if (!tokenHashOrAccessId) {
    return { success: false, error: "Token akses tidak valid" };
  }
  if (!newPass || newPass.trim().length < 6) {
    return { success: false, error: "Password baru minimal 6 karakter" };
  }

  try {
    const access = await prisma.portalAccess.findFirst({
      where: {
        OR: [
          { id: tokenHashOrAccessId },
          { tokenHash: tokenHashOrAccessId },
        ],
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (!access) {
      return { success: false, error: "Akses portal tidak ditemukan atau telah berakhir" };
    }

    let isCurrentValid = false;
    if (access.passwordHash) {
      isCurrentValid = await bcrypt.compare(currentPass.trim(), access.passwordHash);
    } else if (access.plainPassword) {
      isCurrentValid = access.plainPassword === currentPass.trim();
    } else {
      isCurrentValid = true;
    }

    if (!isCurrentValid && (access.passwordHash || access.plainPassword)) {
      return { success: false, error: "Password saat ini tidak sesuai" };
    }

    const passwordHash = await bcrypt.hash(newPass.trim(), 10);
    await prisma.portalAccess.update({
      where: { id: access.id },
      data: {
        passwordHash,
        plainPassword: newPass.trim(),
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Gagal mengganti password portal:", err);
    return { success: false, error: "Terjadi kesalahan saat mengganti password" };
  }
}


