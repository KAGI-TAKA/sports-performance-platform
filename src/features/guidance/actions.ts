"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";

export async function createCoachGuidance(formData: FormData) {
  const ctx = await requireOrgContext();

  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "NUTRISI";
  const content = (formData.get("content") as string)?.trim();
  const linkUrl = (formData.get("linkUrl") as string)?.trim() || null;
  const targetType = (formData.get("targetType") as string)?.trim() || "ALL";
  const singleAthleteId = (formData.get("athleteId") as string)?.trim();
  const multipleAthleteIds = formData.getAll("athleteIds").map((id) => String(id).trim()).filter(Boolean);
  const isPinned = formData.get("isPinned") === "on" || formData.get("isPinned") === "true";

  if (!title || title.length < 3) {
    return { success: false, error: "Judul informasi minimal 3 karakter" };
  }
  if (!content || content.length < 5) {
    return { success: false, error: "Isi informasi/saran minimal 5 karakter" };
  }

  try {
    if (targetType === "MULTIPLE" && multipleAthleteIds.length > 0) {
      // Buat pesan untuk setiap atlet yang dicentang
      await prisma.$transaction(
        multipleAthleteIds.map((athId) =>
          prisma.coachGuidance.create({
            data: {
              organizationId: ctx.organizationId,
              authorId: ctx.memberId,
              athleteId: athId,
              title,
              category,
              content,
              linkUrl,
              isPinned,
            },
          })
        )
      );
    } else if (targetType === "SINGLE" && singleAthleteId && singleAthleteId !== "ALL") {
      // Buat pesan khusus 1 atlet
      await prisma.coachGuidance.create({
        data: {
          organizationId: ctx.organizationId,
          authorId: ctx.memberId,
          athleteId: singleAthleteId,
          title,
          category,
          content,
          linkUrl,
          isPinned,
        },
      });
    } else {
      // Broadcast Publik (Semua Atlet & Orang Tua)
      await prisma.coachGuidance.create({
        data: {
          organizationId: ctx.organizationId,
          authorId: ctx.memberId,
          athleteId: null,
          title,
          category,
          content,
          linkUrl,
          isPinned,
        },
      });
    }

    revalidatePath("/athletes");
    if (singleAthleteId) {
      revalidatePath(`/athletes/${singleAthleteId}`);
    }
    for (const athId of multipleAthleteIds) {
      revalidatePath(`/athletes/${athId}`);
    }
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal membuat coach guidance:", err);
    return { success: false, error: "Gagal mempublikasikan informasi" };
  }
}

export async function deleteCoachGuidance(id: string) {
  const ctx = await requireOrgContext();

  try {
    await prisma.coachGuidance.deleteMany({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    });

    revalidatePath("/athletes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal menghapus coach guidance:", err);
    return { success: false, error: "Gagal menghapus informasi" };
  }
}

export async function togglePinCoachGuidance(id: string, currentPinned: boolean) {
  const ctx = await requireOrgContext();

  try {
    await prisma.coachGuidance.updateMany({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      data: {
        isPinned: !currentPinned,
      },
    });

    revalidatePath("/athletes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal pin coach guidance:", err);
    return { success: false, error: "Gagal mengubah status pin" };
  }
}
