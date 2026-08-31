import Link from "next/link";
import { AlertCircle, FileEdit, Activity, ClipboardCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "../types";

interface DashboardAttentionProps {
  attentionItems: DashboardStats["attentionItems"];
}

export function DashboardAttention({ attentionItems }: DashboardAttentionProps) {
  const hasActionItems =
    attentionItems.draftAssessmentsCount > 0 ||
    attentionItems.activeInjuriesCount > 0 ||
    attentionItems.unloggedSessionsCount > 0;

  return (
    <Card className="h-full border border-border bg-surface-1 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Aksi & Perhatian Pelatih
          </CardTitle>
        </div>
        {hasActionItems && (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
            Perlu Tindakan
          </span>
        )}
      </CardHeader>

      <CardContent className="p-3.5 space-y-2.5">
        {!hasActionItems ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-xs">Semua Operasional Terkendali</p>
              <p className="text-[11px] text-emerald-700/80">Tidak ada draf asesmen tertunda atau atlet cedera aktif.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Active Injuries */}
            {attentionItems.activeInjuriesCount > 0 && (
              <Link
                href="/athletes"
                className="flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-rose-900">
                      {attentionItems.activeInjuriesCount} Atlet Cedera Aktif
                    </div>
                    <p className="text-[11px] text-rose-700">Perhatikan batasan beban latihan di lapangan.</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-rose-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {/* Draft Assessments */}
            {attentionItems.draftAssessmentsCount > 0 && (
              <Link
                href="/assessments"
                className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                    <FileEdit className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-900">
                      {attentionItems.draftAssessmentsCount} Draf Asesmen Belum Selesai
                    </div>
                    <p className="text-[11px] text-amber-700">Lengkapi pengujian fisik yang masih tersimpan draf.</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {/* Unlogged Past Sessions */}
            {attentionItems.unloggedSessionsCount > 0 && (
              <Link
                href="/session-logs"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-surface-2/60 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-3 text-secondary">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      {attentionItems.unloggedSessionsCount} Sesi Belum Dicatat Evaluasinya
                    </div>
                    <p className="text-[11px] text-muted">Isi ringkasan latihan dan catatan evaluasi.</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
