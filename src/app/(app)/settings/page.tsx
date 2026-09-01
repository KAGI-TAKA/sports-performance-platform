import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { SettingsOrgNameForm } from "@/features/organizations/components/settings-org-name-form";
import { Building2, SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Pengaturan Sistem | Platform Performa Olahraga",
  description: "Konfigurasi profil akademi dan parameter item tes fisik.",
};

export default async function SettingsPage() {
  const ctx = await requireOrgContext();
  const isAdmin = ctx.role === "admin";

  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
  });

  if (!org) return null;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
          Pengaturan Sistem &amp; Profil Akademi
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          Kelola profil nama klub / akademi dan konfigurasi acuan benchmark pengujian fisik.
        </p>
      </div>

      {/* ── Profil Organisasi ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h2 className="font-display text-sm font-semibold text-foreground">
            Profil Akademi / Klub
          </h2>
        </div>

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
                ? "Admin / Owner"
                : ctx.role === "head_coach"
                ? "Head Coach"
                : "Asisten Pelatih"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Konfigurasi Item Tes & Parameter Fisik ───────────────── */}
      <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-muted shrink-0 mt-0.5">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-foreground">
                Parameter Fisik &amp; Item Pengujian
              </h2>
              <p className="text-xs text-muted mt-0.5 max-w-lg">
                Sesuaikan item tes modular, satuan ukur, dan acuan benchmark grade A/B/C/D sesuai cabang olahraga atau tahap latihan.
              </p>
            </div>
          </div>
          <Link
            href="/benchmarks"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-3 transition shrink-0"
          >
            Kelola Item Tes →
          </Link>
        </div>
      </div>
    </div>
  );
}
