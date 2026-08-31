"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Users, Search, ArrowUpRight, Plus } from "lucide-react";
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

const gradeColorMap: Record<string, string> = {
  A: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "B+": "text-emerald-700 bg-emerald-50 border-emerald-200",
  B: "text-indigo-700 bg-indigo-50 border-indigo-200",
  "C+": "text-amber-700 bg-amber-50 border-amber-200",
  C: "text-amber-700 bg-amber-50 border-amber-200",
  D: "text-rose-700 bg-rose-50 border-rose-200",
};

interface DashboardAthleteDirectoryProps {
  athletes?: DashboardAthleteSummary[];
}

export function DashboardAthleteDirectory({ athletes = [] }: DashboardAthleteDirectoryProps) {
  const [search, setSearch] = useState("");

  const filteredAthletes = useMemo(() => {
    if (!search.trim()) return athletes;
    const q = search.toLowerCase().trim();
    return athletes.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        (a.sportCategory && a.sportCategory.toLowerCase().includes(q))
    );
  }, [athletes, search]);

  return (
    <Card className="border border-border bg-surface-1 shadow-2xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Direktori Ringkas Atlet Binaan ({athletes.length})
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick inline search */}
          {athletes.length > 0 && (
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari atlet..."
                className="w-full rounded-md border border-border bg-surface-2 py-1 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}

          <Link
            href="/athletes"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-muted hover:text-accent font-medium transition-colors shrink-0"
          >
            Semua Atlet
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {athletes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum Ada Atlet Terdaftar"
            description="Daftarkan atlet pertama Anda untuk mulai menyusun program dan pengujian fisik."
            action={
              <Link
                href="/athletes/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Atlet Baru
              </Link>
            }
            className="border-0 bg-transparent py-8"
          />
        ) : filteredAthletes.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted">
            Tidak ada atlet yang cocok dengan kata kunci &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted">Nama Atlet</TableHead>
                  <TableHead className="text-xs font-semibold text-muted">Status</TableHead>
                  <TableHead className="text-center text-xs font-semibold text-muted">Skor Fisik</TableHead>
                  <TableHead className="text-center text-xs font-semibold text-muted hidden sm:table-cell">Grade</TableHead>
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
                              className="block text-xs font-semibold text-foreground hover:text-accent transition-colors"
                            >
                              {athlete.fullName}
                            </Link>
                            <span className="block text-[10px] text-muted">
                              {athlete.sportCategory ?? "Multi-Sport"} · {athlete.age} Thn
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5">
                        {isInjured ? (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            🔴 Cedera
                          </span>
                        ) : hasScore ? (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🟢 On Track
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            ⚪ Belum Tes
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-xs py-2.5">
                        {athlete.latestScore != null ? `${athlete.latestScore}%` : "—"}
                      </TableCell>

                      <TableCell className="text-center py-2.5 hidden sm:table-cell">
                        {athlete.latestGrade ? (
                          <span
                            className={`inline-flex items-center justify-center h-5 w-6 rounded font-mono font-bold text-[10px] border ${
                              gradeColorMap[athlete.latestGrade] ?? "bg-surface-2 border-border"
                            }`}
                          >
                            {athlete.latestGrade}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted font-mono py-2.5 hidden md:table-cell">
                        {athlete.nextSessionTime ?? "—"}
                      </TableCell>

                      <TableCell className="text-right py-2.5">
                        <Link
                          href={`/athletes/${athlete.id}`}
                          className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors whitespace-nowrap"
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
