import Link from "next/link";
import { AlertCircle, FileEdit, Activity, ClipboardCheck, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className="h-full border-warning/30 bg-surface-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          <CardTitle className="text-sm font-semibold">Perlu Perhatian Pelatih</CardTitle>
        </div>
        {hasActionItems && (
          <Badge variant="warning" className="text-[10px]">
            Tindakan Diperlukan
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {!hasActionItems ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success-bg/50 border border-success/20 text-xs text-success">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20">
              ✓
            </div>
            <div>
              <p className="font-semibold">Semua Operasional Lancar</p>
              <p className="text-[11px] opacity-90">Tidak ada draf assessment tertunda atau catatan sesi terlewat.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Draft Assessments */}
            {attentionItems.draftAssessmentsCount > 0 && (
              <Link
                href="/assessments"
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning-bg text-warning">
                    <FileEdit className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      {attentionItems.draftAssessmentsCount} Draf Assessment Belum Selesai
                    </div>
                    <p className="text-[11px] text-muted">Finalisasi pengisian item tes fisik atlet.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-warning group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {/* Active Injuries */}
            {attentionItems.activeInjuriesCount > 0 && (
              <Link
                href="/athletes"
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-danger-bg text-danger">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      {attentionItems.activeInjuriesCount} Atlet Memiliki Riwayat Cedera Aktif
                    </div>
                    <p className="text-[11px] text-muted">Perhatikan pantauan medis dan beban latihan.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-danger group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {/* Unlogged Past Sessions */}
            {attentionItems.unloggedSessionsCount > 0 && (
              <Link
                href="/session-logs"
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-bg text-accent">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      {attentionItems.unloggedSessionsCount} Sesi Belum Dicatat Evaluasinya
                    </div>
                    <p className="text-[11px] text-muted">Isi ringkasan sesi latihan dan tautan video.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
