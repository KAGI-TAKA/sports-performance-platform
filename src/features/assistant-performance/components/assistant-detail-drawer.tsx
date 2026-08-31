"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
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
} from "lucide-react";
import type { AssistantPerformanceDetail, AssistantFeedbackItem } from "../types";
import { AssistantFeedbackReviewModal } from "./assistant-feedback-review-modal";

interface AssistantDetailDrawerProps {
  detail: AssistantPerformanceDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedbackReviewed?: (feedbackId: string, notes?: string) => void;
}

export function AssistantDetailDrawer({
  detail,
  open,
  onOpenChange,
  onFeedbackReviewed,
}: AssistantDetailDrawerProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<AssistantFeedbackItem | null>(null);

  if (!detail) return null;
  const { summary, feedbackItems, canReview } = detail;

  const trendIcon =
    summary.trendStatus === "HIGHER" ? (
      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
    ) : summary.trendStatus === "LOWER" ? (
      <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-slate-400" />
    );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-surface-1"
          onClose={() => onOpenChange(false)}
        >
          {/* Header */}
          <DialogHeader className="p-5 pb-4 border-b border-border bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-white font-bold text-base">
                  {summary.coachName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-base font-bold font-display text-white">
                    {summary.coachName}
                  </DialogTitle>
                  <p className="text-xs text-indigo-200/80">{summary.coachEmail}</p>
                </div>
              </div>

              <span className="rounded-full bg-violet-500/20 border border-violet-400/30 px-3 py-1 text-[11px] font-bold text-violet-300">
                Asisten Pelatih
              </span>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Supervisory Notice */}
            <div className="rounded-xl border border-border bg-surface-2/60 p-3.5 flex items-start gap-2.5 text-muted text-[11.5px] leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Data performa ini dirangkum dari kehadiran atlet dan ulasan orang tua untuk kebutuhan supervisi serta pembinaan internal, bukan sebagai peringkat atau dasar hukuman.
              </span>
            </div>

            {/* 1. MUTU PENDAMPINGAN SESI (Performance Quality) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                  Mutu Pendampingan Sesi
                </span>
                <span className="text-[10.5px] text-muted">Skala 1 – 5 Bintang</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">
                    Kepuasan Umum
                  </span>
                  <div className="text-lg font-extrabold font-mono text-amber-600 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>
                      {summary.overallSatisfaction != null
                        ? `${summary.overallSatisfaction.toFixed(1)} / 5`
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">
                    Materi Sesi
                  </span>
                  <div className="text-lg font-extrabold font-mono text-foreground">
                    {summary.sessionQualityRating != null
                      ? `${summary.sessionQualityRating.toFixed(1)} / 5`
                      : "—"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">
                    Komunikasi
                  </span>
                  <div className="text-lg font-extrabold font-mono text-foreground">
                    {summary.communicationRating != null
                      ? `${summary.communicationRating.toFixed(1)} / 5`
                      : "—"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">
                    Perhatian Atlet
                  </span>
                  <div className="text-lg font-extrabold font-mono text-foreground">
                    {summary.athleteAttentionRating != null
                      ? `${summary.athleteAttentionRating.toFixed(1)} / 5`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PARTISIPASI & VOLUME ULASAN (Bukan Skor Mutu) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                  Partisipasi &amp; Volume Ulasan
                </span>
                <span className="text-[10.5px] text-muted">Keaktifan Respon Keluarga</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">
                    Sesi Selesai
                  </span>
                  <div className="text-base font-bold font-mono text-foreground">
                    {summary.totalSessions} Sesi
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">
                    Ulasan Diterima
                  </span>
                  <div className="text-base font-bold font-mono text-foreground">
                    {summary.feedbackVolume} Ulasan
                  </div>
                  <span className="text-[10px] text-muted block">
                    dari {summary.eligibleOpportunities} peluang
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">
                    Tingkat Respon
                  </span>
                  <div className="text-base font-bold font-mono text-indigo-600">
                    {summary.responseRate != null ? `${summary.responseRate}%` : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tren Indikator */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-surface-1 border border-border flex items-center justify-center">
                  {trendIcon}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-foreground block">
                    Perbandingan Tren 30 Hari
                  </span>
                  <span className="text-[11px] text-muted">{summary.trendLabel}</span>
                </div>
              </div>

              {summary.trendDiff != null && (
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    summary.trendDiff > 0
                      ? "text-emerald-700 bg-emerald-50"
                      : summary.trendDiff < 0
                      ? "text-rose-700 bg-rose-50"
                      : "text-slate-700 bg-slate-100"
                  }`}
                >
                  {summary.trendDiff > 0 ? `+${summary.trendDiff}` : summary.trendDiff}
                </span>
              )}
            </div>

            {/* Feedback List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wide text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Daftar Ulasan Masuk ({feedbackItems.length})</span>
                </h4>
                {summary.unreviewedCount ? (
                  <Badge variant="warning" className="text-[10px]">
                    {summary.unreviewedCount} Belum Ditinjau
                  </Badge>
                ) : null}
              </div>

              {feedbackItems.length > 0 ? (
                <div className="space-y-2.5">
                  {feedbackItems.map((item) => {
                    const itemDate = new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-border bg-white shadow-xs space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2">
                          <div>
                            <span className="font-bold text-foreground text-xs block">
                              {item.sessionTitle}
                            </span>
                            <span className="text-[11px] text-muted flex items-center gap-1 font-mono">
                              <Calendar className="h-3 w-3 text-indigo-600" />
                              {itemDate}
                              {item.athleteName && (
                                <>
                                  <span>·</span>
                                  <span>Atlet: <strong className="text-foreground">{item.athleteName}</strong></span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {item.overallRating.toFixed(1)}
                            </span>

                            {canReview && (
                              <Badge
                                variant={item.isReviewed ? "outline" : "warning"}
                                className="text-[10px]"
                              >
                                {item.isReviewed ? "✓ Ditinjau" : "Perlu Ditinjau"}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Ratings Component Badges */}
                        <div className="flex flex-wrap gap-2 text-[10.5px]">
                          <span className="bg-surface-2 px-2 py-0.5 rounded-md text-secondary">
                            Materi: <strong className="text-foreground">{item.sessionRating}/5</strong>
                          </span>
                          <span className="bg-surface-2 px-2 py-0.5 rounded-md text-secondary">
                            Komunikasi: <strong className="text-foreground">{item.communicationRating}/5</strong>
                          </span>
                          <span className="bg-surface-2 px-2 py-0.5 rounded-md text-secondary">
                            Perhatian: <strong className="text-foreground">{item.athleteAttentionRating}/5</strong>
                          </span>
                        </div>

                        {/* Comment (Supervisory view only) */}
                        {item.comment && (
                          <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11.5px] text-slate-800 italic">
                            &quot;{item.comment}&quot;
                          </div>
                        )}

                        {/* Head Coach Notes (Supervisory view only) */}
                        {item.headCoachNotes && (
                          <div className="p-2 rounded-lg bg-surface-2 border border-border text-[11px] text-slate-700 flex items-start gap-1.5">
                            <Sparkles className="h-3 w-3 text-indigo-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Catatan Head Coach:</strong> {item.headCoachNotes}
                            </span>
                          </div>
                        )}

                        {/* Supervisory Review Action Button */}
                        {canReview && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedFeedback(item)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline min-h-[36px]"
                            >
                              <FileEdit className="h-3 w-3" />
                              <span>{item.isReviewed ? "Ubah Catatan Supervisi" : "Tinjau & Catat"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center border border-border rounded-xl bg-surface-2 text-muted">
                  Belum ada ulasan yang diterima untuk asisten pelatih ini.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-border bg-surface-2/60 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="min-h-[40px] px-5 text-xs font-semibold"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <AssistantFeedbackReviewModal
        feedback={selectedFeedback}
        open={!!selectedFeedback}
        onOpenChange={(open) => {
          if (!open) setSelectedFeedback(null);
        }}
        onReviewed={(feedbackId, notes) => {
          if (onFeedbackReviewed) onFeedbackReviewed(feedbackId, notes);
          setSelectedFeedback(null);
        }}
      />
    </>
  );
}
