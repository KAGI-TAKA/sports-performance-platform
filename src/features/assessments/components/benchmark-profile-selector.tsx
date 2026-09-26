"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Sparkles, CheckCircle2, ChevronRight, Award } from "lucide-react";

export interface BenchmarkProfileItem {
  id: string;
  name: string;
  description: string | null;
  gender: string | null;
  ageMin: number;
  ageMax: number;
  sportCategory: string | null;
  isDefault: boolean;
  benchmarkCount: number;
}

interface BenchmarkProfileSelectorProps {
  athlete: {
    id: string;
    fullName: string;
    gender: string;
    age: number;
    trainingLevel: string;
    sportCategory?: string | null;
  };
  profiles: BenchmarkProfileItem[];
}

export function BenchmarkProfileSelector({
  athlete,
  profiles,
}: BenchmarkProfileSelectorProps) {
  // Cek kecocokan profil atlet dengan benchmark profile
  function isRecommended(p: BenchmarkProfileItem) {
    const genderMatch = !p.gender || p.gender === athlete.gender;
    const ageMatch = athlete.age >= p.ageMin && athlete.age <= p.ageMax;
    return genderMatch && ageMatch;
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link href="/assessments/new">
            <Button variant="outline" size="xs" className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Ganti Atlet
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                Pilih Standar Benchmark Target
              </h1>
              <Badge variant="accent" className="font-mono text-xs">
                Langkah 02
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Menilai performa atlet: <strong className="text-foreground">{athlete.fullName}</strong> ({athlete.gender === "MALE" ? "👦 Putra" : "👧 Putri"}, Usia {athlete.age} Thn)
            </p>
          </div>
        </div>
      </div>

      {/* Athlete context card */}
      <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent font-bold text-xs">
            {athlete.fullName
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground">{athlete.fullName}</span>
            <div className="text-[11px] text-muted flex items-center gap-1.5 mt-0.5">
              <span>{athlete.gender === "MALE" ? "Putra" : "Putri"}</span>
              <span>·</span>
              <span>Usia {athlete.age} Tahun</span>
              <span>·</span>
              <span className="text-accent font-medium">{athlete.sportCategory ?? "Atletik Umum"}</span>
            </div>
          </div>
        </div>

        <Link href={`/assessments/new?athleteId=${athlete.id}&skipProfile=true`}>
          <Button variant="ghost" size="xs" className="text-muted hover:text-foreground text-xs">
            Lewati Pemilihan &rarr;
          </Button>
        </Link>
      </div>

      {/* Profiles list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider px-1">
          <span>Pilih Profil Benchmark Yang Akan Digunakan</span>
          <span>{profiles.length} Standar Tersedia</span>
        </div>

        {profiles.map((profile) => {
          const recommended = isRecommended(profile);

          return (
            <Link
              key={profile.id}
              href={`/assessments/new?athleteId=${athlete.id}&profileId=${profile.id}`}
              className={`block rounded-2xl border p-5 transition-all group relative overflow-hidden ${
                recommended
                  ? "border-accent/50 bg-accent/[0.03] hover:border-accent hover:bg-accent/[0.07] shadow-sm"
                  : "border-border bg-surface-1 hover:border-border/80 hover:bg-surface-2/60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                      {profile.name}
                    </span>
                    {recommended && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] gap-1 py-0.5 font-semibold">
                        <Sparkles className="h-3 w-3" /> Rekomendasi Profil Atlet
                      </Badge>
                    )}
                    {profile.isDefault && (
                      <Badge variant="outline" className="text-[10px] py-0.5">
                        Default Organisasi
                      </Badge>
                    )}
                  </div>

                  {profile.description && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">
                      {profile.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-muted font-mono pt-1">
                    <span className="bg-surface-2 px-2 py-0.5 rounded border border-border/60">
                      {profile.gender === "MALE"
                        ? "👦 Khusus Putra"
                        : profile.gender === "FEMALE"
                        ? "👧 Khusus Putri"
                        : "🌐 Universal"}
                    </span>
                    <span className="bg-surface-2 px-2 py-0.5 rounded border border-border/60">
                      Usia {profile.ageMin}–{profile.ageMax} Thn
                    </span>
                    {profile.sportCategory && (
                      <span className="bg-surface-2 px-2 py-0.5 rounded border border-border/60 text-accent">
                        {profile.sportCategory}
                      </span>
                    )}
                    <span>·</span>
                    <span>{profile.benchmarkCount} Target Parameter</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 pt-1">
                  <Button
                    size="xs"
                    className={`gap-1.5 font-semibold ${
                      recommended
                        ? "bg-accent hover:bg-accent/90 text-white shadow-xs"
                        : "bg-surface-2 hover:bg-surface-3 text-foreground"
                    }`}
                  >
                    <span>Gunakan Standar Ini</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
