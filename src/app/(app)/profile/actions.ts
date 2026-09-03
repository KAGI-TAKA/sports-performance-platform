"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";

export async function updateProfileNameAction(newName: string) {
  const ctx = await requireOrgContext();
  const trimmed = newName.trim();

  if (!trimmed || trimmed.length < 2) {
    return { success: false, error: "Nama tampilan minimal harus 2 karakter." };
  }

  try {
    await prisma.user.update({
      where: { id: ctx.userId },
      data: { name: trimmed },
    });
    revalidatePath("/profile");
    revalidatePath("/schedule");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update profile name:", err);
    return { success: false, error: "Gagal memperbarui nama profil." };
  }
}

export async function updateAvatarAction(base64DataUrl: string) {
  const ctx = await requireOrgContext();

  // Basic validation — must be a valid data URL
  if (!base64DataUrl.startsWith("data:image/")) {
    return { success: false, error: "Format gambar tidak valid." };
  }

  // Size guard: ~500KB limit on base64 string length
  if (base64DataUrl.length > 700_000) {
    return { success: false, error: "Ukuran gambar terlalu besar. Coba foto beresolusi lebih kecil." };
  }

  try {
    await prisma.user.update({
      where: { id: ctx.userId },
      data: { image: base64DataUrl },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update avatar:", err);
    return { success: false, error: "Gagal memperbarui foto profil." };
  }
}

export async function updatePhoneAction(phone: string) {
  const ctx = await requireOrgContext();
  const trimmed = phone.trim();

  // Allow empty (clearing phone)
  if (trimmed && trimmed.length > 20) {
    return { success: false, error: "Nomor telepon terlalu panjang." };
  }

  try {
    await prisma.member.update({
      where: { id: ctx.memberId },
      data: { phone: trimmed || null },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update phone:", err);
    return { success: false, error: "Gagal memperbarui nomor telepon." };
  }
}
