"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Users, Search, ArrowUpRight, Plus, Compass, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { DashboardAthleteSummary } from "../types";

interface DashboardAthleteDirectoryProps {
  athletes?: DashboardAthleteSummary[];
}

export function DashboardAthleteDirectory({ athletes = [] }: DashboardAthleteDirectoryProps) {
  const [search, setSearch] = useState("");
  const [selectedPathway, setSelectedPathway] = useState<"ALL" | "MFD" | "PERFORMANCE">("ALL");

  const enrichedAthletes = useMemo(() => {
    return athletes.map((a) => {
      const sportLower = (a.sportCategory || "").toLowerCase();
      const isMfd =
        sportLower.includes("mfd") ||
        sportLower.includes("multilateral") ||
        sportLower.includes("fondasi") ||
        sportLower.includes("umum") ||
        sportLower === "multi-sport" ||
        sportLower === "" ||
        a.age < 11;

      return {
        ...a,
        pathway: isMfd ? ("MFD" as const) : ("PERFORMANCE" as const),
        pathwayLabel: isMfd ? "Multilateral (MFD)" : "Youth Performance",
      };
    });
  }, [athletes]);

  const filteredAthletes = useMemo(() => {
    return enrichedAthletes.filter((a) => {
      const matchesSearch =
        !search.trim() ||
        a.fullName.toLowerCase().includes(search.toLowerCase().trim()) ||
        (a.sportCategory && a.sportCategory.toLowerCase().includes(search.toLowerCase().trim()));

      const matchesPathway =
        selectedPathway === "ALL" || a.pathway === selectedPathway;

      return matchesSearch && matchesPathway;
    });
  }, [enrichedAthletes, search, selectedPathway]);

  return (
    <Card className="border border-border bg-surface-1 shadow-2xs">
      <CardHeader className="flex flex-col gap-3 pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Direktori Atlet Binaan ({athletes.length})
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            {athletes.length > 0 && (
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama/cabor..."
                  className="w-full rounded-lg border border-border bg-surface-2 py-1 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            )}

            <Link
              href="/athletes"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold transition-colors shrink-0"
            >
              Semua Atlet
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Dual Pathway Quick Filter Tabs */}
        {athletes.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
            {[
              { id: "ALL", label: `Semua (${athletes.length})` },
              {
                id: "MFD",
                label: `Multilateral / MFD (${enrichedAthletes.filter((a) => a.pathway === "MFD").length})`,
              },
              {
                id: "PERFORMANCE",
                label: `Youth Performance (${enrichedAthletes.filter((a) => a.pathway === "PERFORMANCE").length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedPathway(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
                  selectedPathway === tab.id
                    ? "bg-surface-3 text-foreground border-border shadow-2xs"
                    : "bg-surface-2/60 text-muted border-transparent hover:text-foreground hover:bg-surface-2"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {athletes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum Ada Atlet Terdaftar"
            description="Daftarkan atlet pertama Anda untuk mulai menyusun program dan pemantauan kualitas gerak."
            action={
              <Link
                href="/athletes/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Atlet Baru
              </Link>
            }
            className="border-0 bg-transparent py-8"
          />
        ) : filteredAthletes.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted">
            Tidak ada atlet yang cocok dengan filter atau kata kunci &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted">Nama Atlet</TableHead>
                  <TableHead className="text-xs font-semibold text-muted">Jalur Pembinaan</TableHead>
                  <TableHead className="text-xs font-semibold text-muted">Status</TableHead>
                  <TableHead className="text-center text-xs font-semibold text-muted">Skor Fisik</TableHead>
                  <TableHead className="text-xs font-semibold text-muted hidden md:table-cell">Sesi Terdekat</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAthletes.map((athlete) => {
                  const initials = athlete.fullName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const isInjured = athlete.hasActiveInjury;
                  const hasScore = athlete.latestScore != null;

                  return (
                    <TableRow key={athlete.id} className="border-border hover:bg-surface-2/40">
                      <TableCell className="font-semibold py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar fallback={initials} size="sm" alt={athlete.fullName} />
                          <div>
                            <Link
                              href={`/athletes/${athlete.id}`}
                              className="block text-xs font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {athlete.fullName}
                            </Link>
                            <span className="block text-[10px] text-muted">
                              {athlete.sportCategory ?? "Multi-Sport"} · {athlete.age} Thn
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Dual Pathway Badge */}
                      <TableCell className="py-2.5">
                        {athlete.pathway === "MFD" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <Compass className="h-3 w-3" />
                            MFD (Fondasi)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                            <Zap className="h-3 w-3" />
                            Youth Performance
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-2.5">
                        {isInjured ? (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Perlu Pemulihan
                          </span>
                        ) : hasScore ? (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            On Track
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-surface-2 text-muted border border-border">
                            Belum Asesmen
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-xs py-2.5">
                        {athlete.latestScore != null ? (
                          <span className="text-foreground">{athlete.latestScore}%</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted font-mono py-2.5 hidden md:table-cell">
                        {athlete.nextSessionTime ?? "—"}
                      </TableCell>

                      <TableCell className="text-right py-2.5">
                        <Link
                          href={`/athletes/${athlete.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors whitespace-nowrap"
                        >
                          Buka Profil
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
