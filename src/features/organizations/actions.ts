"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { requireOrgContext } from "@/lib/auth-context";
import { seedDefaultTestItemsAndBenchmarks } from "../../../prisma/seed-defaults";

// ─── Seed Default Benchmarks (dipanggil saat onboarding) ──────────────────────
// Menyiapkan TestItem dan Benchmark default untuk organisasi yang baru dibuat.
// HARUS dipanggil tepat setelah org creation, bukan saat render halaman.

export async function seedOrgDefaults(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await seedDefaultTestItemsAndBenchmarks(organizationId);
    revalidatePath("/benchmarks");
    return { success: true };
  } catch (e) {
    console.error("[seedOrgDefaults] Gagal seed benchmark default:", e);
    return { success: false, error: (e as Error).message };
  }
}



// ─── Helpers ───────────────────────────────────────────────────────────────────

async function assertOrgPermission(
  resource: "organization" | "member" | "invitation",
  action: string
) {
  const { success } = await auth.api.hasPermission({
    headers: await headers(),
    body: { permissions: { [resource]: [action] } },
  });
  if (!success)
    throw new Error(
      `Anda tidak memiliki izin untuk aksi ini (${resource}:${action})`
    );
}

// ─── Update Org Name ───────────────────────────────────────────────────────────

const updateOrgNameSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100),
});

export async function updateOrgName(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    await assertOrgPermission("organization", "update");

    const { name } = updateOrgNameSchema.parse(input);

    await auth.api.updateOrganization({
      headers: await headers(),
      body: { data: { name }, organizationId: ctx.organizationId },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Invite Member (Pelatih) ───────────────────────────────────────────────────

const inviteMemberSchema = z.object({
  email: z.email("Format email tidak valid"),
  role: z.enum(["admin", "head_coach", "assistant_coach"]),
});

export async function inviteMember(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    await assertOrgPermission("invitation", "create");

    const { email, role } = inviteMemberSchema.parse(input);

    await auth.api.createInvitation({
      headers: await headers(),
      body: { email, role, organizationId: ctx.organizationId },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Cancel Invitation ─────────────────────────────────────────────────────────

export async function cancelInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertOrgPermission("invitation", "cancel");

    await auth.api.cancelInvitation({
      headers: await headers(),
      body: { invitationId },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Remove Member ─────────────────────────────────────────────────────────────

export async function removeMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();

    // Mencegah admin menghapus dirinya sendiri
    if (memberId === ctx.memberId)
      return { success: false, error: "Anda tidak dapat mengeluarkan diri sendiri." };

    await assertOrgPermission("member", "delete");

    await auth.api.removeMember({
      headers: await headers(),
      body: { memberIdOrEmail: memberId, organizationId: ctx.organizationId },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Update Member Role ────────────────────────────────────────────────────────

const updateRoleSchema = z.object({
  memberId: z.string(),
  role: z.enum(["admin", "head_coach", "assistant_coach"]),
});

export async function updateMemberRole(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireOrgContext();
    await assertOrgPermission("member", "update");

    const { memberId, role } = updateRoleSchema.parse(input);

    if (memberId === ctx.memberId)
      return { success: false, error: "Tidak dapat mengubah role Anda sendiri." };

    await auth.api.updateMemberRole({
      headers: await headers(),
      body: { memberId, role, organizationId: ctx.organizationId },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
