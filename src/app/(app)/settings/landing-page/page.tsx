import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth-context";
import { getLandingPageConfig } from "@/features/landing-page/queries";
import { LandingPageSettingsForm } from "@/features/landing-page/components/landing-page-settings-form";
import { ChevronLeft, Globe, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Editor Halaman Depan & Pricelist | Coach Zulfi Hub",
  description: "Kelola tarif sesi YAP Salatiga & Semarang, kontak pendaftaran WhatsApp, dan banner pengumuman.",
};

export default async function LandingPageSettingsPage() {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin") {
    return (
      <div className="p-6 max-w-4xl space-y-4">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 flex items-start gap-4">
          <ShieldAlert className="h-6 w-6 text-red-500 shrink-0" />
          <div className="space-y-1">
            <h2 className="font-display font-bold text-base text-red-500">
              Akses Dibatasi
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Halaman konfigurasi halaman depan dan tarif biaya sesi hanya dapat diakses dan diubah oleh Administrator organisasi.
            </p>
            <div className="pt-2">
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Pengaturan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const config = await getLandingPageConfig(ctx.organizationId);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Back Link & Header */}
      <div className="space-y-2">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Pengaturan Sistem</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
                Editor Halaman Depan &amp; Pricelist
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Konfigurasi tarif sesi YAP (Salatiga &amp; Semarang), nomor WhatsApp pendaftaran, info lokasi venue, dan banner pengumuman.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Form Component */}
      <div className="rounded-2xl border border-border bg-surface-1 p-6 shadow-xs">
        <LandingPageSettingsForm initialConfig={config} />
      </div>
    </div>
  );
}
