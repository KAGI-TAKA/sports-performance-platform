"use client";

import { useState, useTransition } from "react";
import {
  Users,
  Star,
  Clock,
  Calendar,
  MessageSquare,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  ShieldCheck,
  Filter,
  Loader2,
  ChevronRight,
  Activity,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AssistantPerformanceSummary,
  TimeRangeFilter,
  AssistantPerformanceDetail,
} from "../types";
import {
  fetchAssistantPerformanceListAction,
  fetchAssistantDetailAction,
} from "../actions";
import { AssistantDetailDrawer } from "./assistant-detail-drawer";
import { toast } from "sonner";

interface AssistantPerformancePanelProps {
  initialData: {
    role: string;
    isSupervisory: boolean;
    assistants: AssistantPerformanceSummary[];
    unreviewedFeedbackCount: number;
  };
}

export function AssistantPerformancePanel({
  initialData,
}: AssistantPerformancePanelProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("30d");
  const [assistants, setAssistants] = useState<AssistantPerformanceSummary[]>(
    initialData.assistants
  );
  const [unreviewedCount, setUnreviewedCount] = useState<number>(
    initialData.unreviewedFeedbackCount
  );
  const [isPending, startTransition] = useTransition();

  // Detail Modal State
  const [selectedDetail, setSelectedDetail] = useState<AssistantPerformanceDetail | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);

  function handleTimeRangeChange(newRange: TimeRangeFilter) {
    setTimeRange(newRange);
    startTransition(async () => {
      const res = await fetchAssistantPerformanceListAction(newRange);
      if (res.success && res.data) {
        setAssistants(res.data.assistants);
        setUnreviewedCount(res.data.unreviewedFeedbackCount);
      } else {
        toast.error(res.error || "Gagal memperbarui rentang waktu data");
      }
    });
  }

  async function handleOpenDetail(coachMemberId: string) {
    setDetailLoadingId(coachMemberId);
    try {
      const res = await fetchAssistantDetailAction(coachMemberId);
      if (res.success && res.data) {
        setSelectedDetail(res.data);
      } else {
        toast.error(res.error || "Gagal memuat rincian performa");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memuat rincian");
    } finally {
      setDetailLoadingId(null);
    }
  }

  // Calculate high-level executive averages
  const totalFeedbacks = assistants.reduce((acc, a) => acc + a.feedbackVolume, 0);
  const ratedAssistants = assistants.filter((a) => a.overallSatisfaction != null);
  const avgSatisfaction =
    ratedAssistants.length > 0
      ? ratedAssistants.reduce((acc, a) => acc + (a.overallSatisfaction ?? 0), 0) /
        ratedAssistants.length
      : null;

  return (
    <div className="space-y-5">
      {/* ── HEADER & CONTEXT ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface-1 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <h2 className="font-display text-base font-bold text-foreground">
                Supervisi Tim Pelatih &amp; Evaluasi Mutu
              </h2>
            </div>
            <p className="text-xs text-muted">
              {initialData.isSupervisory
                ? "Evaluasi berkala mutu pendampingan sesi latihan berdasarkan presensi dan ulasan orang tua."
                : "Rangkuman mutu pendampingan sesi latihan Anda berdasarkan ulasan orang tua."}
            </p>
          </div>

          {/* Time Range Selector (30 Hari | 90 Hari | Semua Waktu) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 border border-border text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleTimeRangeChange("30d")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg transition min-h-[36px] ${
                timeRange === "30d"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              30 Hari
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeChange("90d")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg transition min-h-[36px] ${
                timeRange === "90d"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              90 Hari
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeChange("all")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg transition min-h-[36px] ${
                timeRange === "all"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Semua Waktu
            </button>
          </div>
        </div>

        {/* Supervisory Philosophy Callout */}
        <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/50 p-3.5 flex items-start gap-2.5 text-xs text-indigo-950 leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>
            <strong>Prinsip Supervisi:</strong> Metrik performa ini disusun secara objektif untuk membantu Head Coach memberikan bimbingan teknis dan apresiasi internal. Ini <strong>bukan sistem pemeringkatan</strong> atau instrumen penalti.
          </p>
        </div>

        {/* Executive Highlights (Performance Quality vs Participation Volume) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">
              Asisten Terdaftar
            </span>
            <strong className="text-xl font-bold font-mono text-foreground">
              {assistants.length} Pelatih
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">
              Mutu Sesi Rata-rata
            </span>
            <div className="text-xl font-bold font-mono text-amber-600 flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{avgSatisfaction != null ? `${avgSatisfaction.toFixed(1)} / 5` : "—"}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">
              Total Ulasan Masuk
            </span>
            <strong className="text-xl font-bold font-mono text-foreground">
              {totalFeedbacks} Ulasan
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">
              Perlu Ditinjau
            </span>
            <div className="flex items-center gap-2">
              <strong className="text-xl font-bold font-mono text-indigo-600">
                {unreviewedCount}
              </strong>
              {unreviewedCount > 0 && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                  {unreviewedCount} Baru
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ASSISTANT DIRECTORY & PERFORMANCE TABLE / CARDS ────────── */}
      <div className="rounded-2xl border border-border bg-surface-1 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold text-xs uppercase tracking-wide text-foreground flex items-center gap-1.5">
            <span>Daftar Asisten Pelatih</span>
            <span className="text-muted font-normal">({assistants.length})</span>
          </h3>
          <span className="text-[11px] text-muted">
            Urutan: Alfabetis (A–Z)
          </span>
        </div>

        {assistants.length > 0 ? (
          <div className="divide-y divide-border">
            {assistants.map((assistant) => {
              const trendIcon =
                assistant.trendStatus === "HIGHER" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : assistant.trendStatus === "LOWER" ? (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                );

              const isLoadingThis = detailLoadingId === assistant.coachMemberId;

              return (
                <div
                  key={assistant.coachMemberId}
                  className="p-4 sm:p-5 hover:bg-surface-2/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-600/10 text-violet-700 font-bold flex items-center justify-center text-sm shrink-0 border border-violet-200">
                      {assistant.coachName.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {assistant.coachName}
                        </span>
                        {assistant.unreviewedCount ? (
                          <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {assistant.unreviewedCount} belum ditinjau
                          </span>
                        ) : null}
                      </div>
                      <p className="text-muted text-[11px] font-mono">{assistant.coachEmail}</p>

                      {/* Explicit Separation: Participation vs Quality */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="bg-surface-2 px-2 py-0.5 rounded-md text-secondary border border-border">
                          {assistant.totalSessions} Sesi Selesai
                        </span>
                        <span className="bg-surface-2 px-2 py-0.5 rounded-md text-secondary border border-border">
                          {assistant.feedbackVolume} Ulasan Diterima
                        </span>
                        <span className="bg-surface-2 px-2 py-0.5 rounded-md text-secondary border border-border">
                          Respon Partisipasi:{" "}
                          <strong className="text-foreground">
                            {assistant.responseRate != null ? `${assistant.responseRate}%` : "—"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics & Action */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-muted uppercase font-bold block">
                        Mutu Pendampingan
                      </span>
                      <div className="text-base font-extrabold font-mono text-amber-600 flex items-center justify-end gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>
                          {assistant.overallSatisfaction != null
                            ? `${assistant.overallSatisfaction.toFixed(1)} / 5`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10.5px] text-muted">
                        {trendIcon}
                        <span>{assistant.trendLabel}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(assistant.coachMemberId)}
                      disabled={isLoadingThis}
                      className="min-h-[40px] px-3.5 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Rincian</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center space-y-2 text-muted text-xs">
            <Users className="h-8 w-8 text-muted mx-auto" />
            <p className="font-semibold text-foreground">Tidak ada asisten pelatih terdaftar</p>
            <p>Undang asisten pelatih baru melalui panel undangan anggota di atas.</p>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <AssistantDetailDrawer
        detail={selectedDetail}
        open={!!selectedDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedDetail(null);
        }}
        onFeedbackReviewed={() => {
          // Re-fetch current data to refresh unreviewed counts
          handleTimeRangeChange(timeRange);
        }}
      />
    </div>
  );
}
