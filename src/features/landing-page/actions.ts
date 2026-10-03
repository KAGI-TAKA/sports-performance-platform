"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { landingPageConfigSchema } from "./schema";
import { DEFAULT_LANDING_PAGE_CONFIG } from "./types";

export async function updateLandingPageConfig(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();

    if (ctx.role !== "admin") {
      throw new Error("Akses ditolak: Hanya Administrator yang berwenang mengubah konfigurasi halaman depan.");
    }

    const validData = landingPageConfigSchema.parse(input);

    const org = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { metadata: true },
    });

    let currentMeta: Record<string, any> = {};
    if (org?.metadata) {
      try {
        currentMeta = JSON.parse(org.metadata);
      } catch {
        currentMeta = {};
      }
    }

    currentMeta.landingPage = validData;

    await prisma.organization.update({
      where: { id: ctx.organizationId },
      data: {
        metadata: JSON.stringify(currentMeta),
      },
    });

    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/settings/landing-page");

    return { success: true };
  } catch (err) {
    console.error("[updateLandingPageConfig] Error:", err);
    return { success: false, error: (err as Error).message };
  }
}

export async function resetLandingPageConfigToDefault(): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();

    if (ctx.role !== "admin") {
      throw new Error("Akses ditolak: Hanya Administrator yang berwenang mengatur ulang konfigurasi.");
    }

    const org = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { metadata: true },
    });

    let currentMeta: Record<string, any> = {};
    if (org?.metadata) {
      try {
        currentMeta = JSON.parse(org.metadata);
      } catch {
        currentMeta = {};
      }
    }

    currentMeta.landingPage = DEFAULT_LANDING_PAGE_CONFIG;

    await prisma.organization.update({
      where: { id: ctx.organizationId },
      data: {
        metadata: JSON.stringify(currentMeta),
      },
    });

    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/settings/landing-page");

    return { success: true };
  } catch (err) {
    console.error("[resetLandingPageConfigToDefault] Error:", err);
    return { success: false, error: (err as Error).message };
  }
}
