import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { SettingsOrgNameForm } from "@/features/organizations/components/settings-org-name-form";
import { SettingsInvitePanel } from "@/features/organizations/components/settings-invite-panel";
import { SettingsMembersPanel } from "@/features/organizations/components/settings-members-panel";

export default async function SettingsPage() {
  const ctx = await requireOrgContext();
  const isAdmin = ctx.role === "admin";
  const isAdminOrHeadCoach = ctx.role === "admin" || ctx.role === "head_coach";

  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    include: {
      members: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Ambil undangan yang masih pending dan belum kedaluwarsa
  const pendingInvitations = await prisma.invitation.findMany({
    where: {
      organizationId: ctx.organizationId,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!org) return null;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
          Pengaturan Organisasi
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          Kelola profil klub / akademi, tim pelatih, dan undangan anggota.
        </p>
      </div>

      {/* ── Profil Organisasi ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-5">
        <h2 className="font-display text-sm font-semibold text-foreground border-b border-border pb-3">
          Profil Akademi / Klub
        </h2>

        <SettingsOrgNameForm
          currentName={org.name}
          canEdit={isAdmin}
        />

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide block">
            Slug URL
          </label>
          <div className="rounded-md border border-border bg-surface-2/60 px-3 py-2 text-sm font-mono text-secondary">
            {org.slug}
          </div>
          <p className="text-[11px] text-muted">
            Slug tidak dapat diubah setelah organisasi dibuat.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide block">
            Role Anda
          </label>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-2/60 px-3 py-2 text-sm">
            <span className="font-medium text-foreground">
              {ctx.role === "admin"
                ? "Admin"
                : ctx.role === "head_coach"
                ? "Pelatih Kepala"
                : "Asisten Pelatih"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Undang Anggota / Pending Invitations ─────────────────── */}
      <SettingsInvitePanel
        canInvite={isAdminOrHeadCoach}
        pendingInvitations={pendingInvitations.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          expiresAt: inv.expiresAt,
        }))}
      />

      {/* ── Daftar Anggota ────────────────────────────────────────── */}
      <SettingsMembersPanel
        members={org.members.map((m) => ({
          id: m.id,
          role: m.role,
          user: { id: m.user.id, name: m.user.name, email: m.user.email },
        }))}
        currentMemberId={ctx.memberId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
