import Link from "next/link";
import { Activity, Plus, ArrowRight, CheckCircle2, ShieldAlert, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AthleteReTestSummary, AthleteReTestInsight } from "@/features/coaching-intelligence/types";

interface DashboardReTestWidgetProps {
  reTestSummary: AthleteReTestSummary | null;
  isUnavailable?: boolean;
}

export function DashboardReTestWidget({
  reTestSummary,
  isUnavailable = false,
}: DashboardReTestWidgetProps) {
  if (!reTestSummary || isUnavailable) {
    return (
      <Card className="h-full border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Step 06 — Siklus Re-Assessment Berkala
                </CardTitle>
                <span className="text-[10px] text-muted block">
                  Evaluasi respons latihan &amp; perbarui target siklus
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Evaluasi Terjadwal
            </span>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-2/60 border border-border text-xs text-secondary">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-xs text-foreground">Data Evaluasi Tidak Dapat Dimuat</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Informasi status re-test atlet sementara tidak dapat diambil. Silakan muat ulang halaman.
                </p>
              </div>
            </div>
          </CardContent>
        </div>

        <div className="p-3 border-t border-border/50 bg-surface-2/30 rounded-b-xl flex items-center justify-between text-[11px] text-muted">
          <span>Evaluasi fisik berkala</span>
          <Link href="/assessments" className="font-semibold text-accent hover:underline">
            Buka Modul Asesmen →
          </Link>
        </div>
      </Card>
    );
  }

  const {
    totalAthletes,
    freshCount,
    dueSoonCount,
    dueCount,
    overdueCount,
    noAssessmentCount,
    insights,
  } = reTestSummary;

  // Filter top priority athletes needing test (Overdue, Due, No Assessment)
  const priorityAthletes = insights
    .filter((a) => a.reTestStatus === "OVERDUE" || a.reTestStatus === "DUE" || a.reTestStatus === "NO_ASSESSMENT")
    .slice(0, 4);

  const getStatusBadge = (status: AthleteReTestInsight["reTestStatus"]) => {
    switch (status) {
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Sangat Perlu Re-Test
          </span>
        );
      case "DUE":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Perlu Evaluasi
          </span>
        );
      case "DUE_SOON":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
            Mendekati Siklus
          </span>
        );
      case "NO_ASSESSMENT":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Belum Ada Baseline
          </span>
        );
      case "FRESH":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Data Masih Baru
          </span>
        );
    }
  };

  return (
    <Card className="h-full border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Step 06 — Siklus Re-Assessment Atlet
              </CardTitle>
              <span className="text-[10px] text-muted block">
                Evaluasi berkala respons adaptasi latihan
              </span>
            </div>
          </div>
          <Link
            href="/assessments"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            Semua Asesmen <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent className="p-3.5 space-y-3">
          {/* Status Counter Pills */}
          <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-lg bg-surface-2/60 border border-border text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted font-medium">Overdue</span>
              <span className={`text-xs font-bold ${overdueCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                {overdueCount}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted font-medium">Due</span>
              <span className={`text-xs font-bold ${dueCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                {dueCount}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted font-medium">Due Soon</span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{dueSoonCount}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted font-medium">Fresh</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{freshCount}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted font-medium">No Data</span>
              <span className="text-xs font-bold text-slate-500">{noAssessmentCount}</span>
            </div>
          </div>

          {/* Priority Athletes List */}
          {priorityAthletes.length === 0 ? (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-xs">Evaluasi Fisik Terkendali</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  Seluruh {totalAthletes} atlet aktif memiliki data asesmen fisik yang masih relevan.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Prioritas Penjadwalan Evaluasi Ulang
              </span>
              <div className="space-y-1.5">
                {priorityAthletes.map((ath) => (
                  <div
                    key={ath.athleteId}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface-2/40 hover:bg-surface-2/70 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-foreground font-bold text-xs">
                        <User className="h-3.5 w-3.5 text-muted" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/athletes/${ath.athleteId}`}
                            className="text-xs font-bold text-foreground hover:text-accent hover:underline"
                          >
                            {ath.athleteName}
                          </Link>
                          {ath.category && (
                            <span className="text-[10px] text-muted">· {ath.category}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted block mt-0.5">
                          {ath.daysSinceAssessment !== null
                            ? `Tes terakhir ${ath.daysSinceAssessment} hari lalu`
                            : "Belum pernah evaluasi"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(ath.reTestStatus)}
                      <Link
                        href={`/assessments/new?athleteId=${ath.athleteId}`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold bg-accent text-white hover:bg-accent/90 transition shadow-2xs"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Tes</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-3 border-t border-border/50 bg-surface-2/30 rounded-b-xl flex items-center justify-between text-[11px] text-muted">
        <span>Evaluasi berkala dianjurkan setiap 60–90 hari</span>
        <Link href="/athletes" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Direktori Atlet →
        </Link>
      </div>
    </Card>
  );
}
