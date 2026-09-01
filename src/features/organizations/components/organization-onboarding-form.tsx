"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  createOrganizationSchema,
  slugify,
} from "@/features/organizations/schema";
import { seedOrgDefaults } from "@/features/organizations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";

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
    if (isLoading) return;
    setError(null);

    const parsed = createOrganizationSchema.safeParse({ name });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.name?.[0] ?? "Nama organisasi tidak valid"
      );
      return;
    }

    setIsLoading(true);

    const slugBase = slugify(parsed.data.name);
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

    const { data, error: createError } = await authClient.organization.create({
      name: parsed.data.name,
      slug,
    });

    if (createError || !data) {
      setIsLoading(false);
      setError(createError?.message ?? "Gagal menginisialisasi organisasi, silakan coba lagi");
      return;
    }

    // Seed data default benchmarks & test items untuk organisasi baru
    await seedOrgDefaults(data.id);

    // Set organisasi aktif di session
    await authClient.organization.setActive({ organizationId: data.id });

    setIsLoading(false);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <Card className="p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-1 rounded-full bg-accent" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-accent">
              Inisialisasi Master Workspace
            </span>
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Selamat Datang, {userName}
          </h1>
          <p className="text-xs text-secondary leading-relaxed">
            Inisialisasi organisasi atau sentra pelatihan tempat Anda akan mengelola database atlet dan program performa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="orgName" required>
              Nama Organisasi / Sentra Latihan
            </Label>
            <Input
              id="orgName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coach Zulfi Athletic Performance Hub"
              disabled={isLoading}
            />
            {error && <p className="text-[11px] font-medium text-danger">{error}</p>}
          </div>

          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={isLoading}
            className="w-full justify-center shadow-2xs font-bold text-xs sm:text-sm"
          >
            <Building2 className="h-4 w-4 mr-1.5" />
            <span>{isLoading ? "Menginisialisasi Workspace..." : "Buat Workspace & Lanjutkan"}</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
