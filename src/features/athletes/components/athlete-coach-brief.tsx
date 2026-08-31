import Link from "next/link";
import { Activity, Award, TrendingUp, Calendar, AlertTriangle, CheckCircle2, HelpCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { COMPONENT_LABELS } from "@/lib/constants";

interface AthleteCoachBriefProps {
  status: "ON_TRACK" | "NEEDS_REVIEW" | "INJURED" | "UNASSESSED";
  overallScore: number | null;
  overallGrade: string | null;
  scoreDelta?: number | null;
  bestComponent?: string | null;
  weakestComponents?: string[];
  activeInjuriesCount: number;
  nextSessionDate?: string | null;
  lastAssessmentDate?: string | null;
}

export function AthleteCoachBrief({
  status,
  overallScore,
  overallGrade,
  scoreDelta,
  bestComponent,
  weakestComponents = [],
  activeInjuriesCount,
  nextSessionDate,
  lastAssessmentDate,
}: AthleteCoachBriefProps) {
  const formatCompLabel = (key?: string | null) => {
    if (!key) return "—";
    return (
      COMPONENT_LABELS[key] ??
      key
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  return (
    <Card className="border border-border bg-surface-1 shadow-2xs select-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-border mb-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              ⚡ Coach Brief (Kondisi 5 Detik)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status === "INJURED" ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                {activeInjuriesCount} Cedera Aktif
              </span>
            ) : status === "NEEDS_REVIEW" ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                Perlu Evaluasi
              </span>
            ) : status === "UNASSESSED" ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                  Belum Dievaluasi
                </span>
                <Link
                  href="/assessments/new"
                  className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-white hover:bg-accent/90 transition shadow-2xs"
                >
                  <Plus className="h-3 w-3" />
                  Mulai Assessment Pertama
                </Link>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Kondisi Siap (On Track)
              </span>
            )}
          </div>
        </div>

        {/* 4-Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Skor Fisik & Grade */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-accent" /> Skor Fisik Terakhir
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-foreground">
                {overallScore != null ? `${overallScore}%` : "—"}
              </span>
              {overallGrade ? (
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-surface-2 border border-border text-foreground">
                  Grade {overallGrade}
                </span>
              ) : (
                <span className="text-xs text-muted font-mono">—</span>
              )}
            </div>
            <p className="text-[10px] text-muted truncate">
              {lastAssessmentDate ? `Tes: ${lastAssessmentDate}` : "Belum ada evaluasi"}
            </p>
          </div>

          {/* 2. Tren Kenaikan Fisik */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Tren Performa
            </span>
            <div className="flex items-baseline gap-1.5">
              {scoreDelta != null ? (
                <>
                  <span
                    className={`font-mono text-xl font-bold ${
                      scoreDelta >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
                  </span>
                  <span className="text-[11px] text-muted">
                    {scoreDelta >= 0 ? "🟢 Meningkat" : "🔴 Menurun"}
                  </span>
                </>
              ) : (
                <span className="font-mono text-lg font-bold text-muted">—</span>
              )}
            </div>
            <p className="text-[10px] text-muted">vs evaluasi sebelumnya</p>
          </div>

          {/* 3. Kekuatan & Area Latihan */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-indigo-600" /> Profil Komponen
            </span>
            <div className="text-xs font-semibold text-foreground truncate">
              {bestComponent ? `💪 ${formatCompLabel(bestComponent)}` : "—"}
            </div>
            <p className="text-[10px] text-muted truncate">
              {weakestComponents.length > 0
                ? `🎯 Fokus: ${formatCompLabel(weakestComponents[0])}`
                : "🎯 Fokus: —"}
            </p>
          </div>

          {/* 4. Sesi Latihan Berikutnya */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-secondary" /> Sesi Berikutnya
            </span>
            <div className="text-xs font-semibold text-foreground font-mono truncate">
              {nextSessionDate ?? "Belum dijadwalkan"}
            </div>
            <p className="text-[10px] text-muted">Jadwal operasional</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
