"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  createOrganizationSchema,
  slugify,
} from "@/features/organizations/schema";
import { seedOrgDefaults } from "@/features/organizations/actions";

export function OrganizationOnboardingForm({
  userName,
  redirectTo,
}: {
  userName: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createOrganizationSchema.safeParse({ name });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.name?.[0] ?? "Nama tidak valid",
      );
      return;
    }

    setIsLoading(true);

    const slugBase = slugify(parsed.data.name);
    // Tambahan suffix acak supaya slug tidak gampang tabrakan antar
    // organisasi dengan nama mirip (mis. dua akademi "SMA 1")
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

    const { data, error: createError } = await authClient.organization.create({
      name: parsed.data.name,
      slug,
    });

    if (createError || !data) {
      setIsLoading(false);
      setError(createError?.message ?? "Gagal membuat organisasi, coba lagi");
      return;
    }

    // Seed TestItem & Benchmark default untuk organisasi baru ini.
    // Dipanggil di sini (bukan saat render benchmarks/page.tsx) agar data
    // sudah tersedia begitu user pertama kali membuka halaman Benchmark.
    await seedOrgDefaults(data.id);

    // Jadikan organisasi baru ini aktif di sesi
    await authClient.organization.setActive({ organizationId: data.id });

    setIsLoading(false);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 28 28">
          <polygon
            points="14,2 24,8.5 24,19.5 14,26 4,19.5 4,8.5"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="1.6"
          />
          <polygon
            points="14,8 19,11 19,17 14,20 9,17 9,11"
            fill="hsl(var(--accent))"
            opacity="0.85"
          />
        </svg>
        <h1 className="font-display text-lg font-semibold text-foreground">
          Kinetiq
        </h1>
      </div>

      <div className="rounded-lg border border-border bg-surface-1 p-6">
        <h2 className="font-display text-base font-semibold text-foreground">
          Halo, {userName} 👋
        </h2>
        <p className="mt-1 text-sm text-secondary">
          Sebelum lanjut, buat organisasi (akademi/klub) tempat kamu akan
          mengelola atlet.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="orgName"
              className="text-xs font-medium text-secondary"
            >
              Nama akademi/klub
            </label>
            <input
              id="orgName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              placeholder="Akademi Basket Andi"
            />
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Membuat organisasi..." : "Buat organisasi & lanjut"}
          </button>
        </form>
      </div>
    </div>
  );
}
