"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reviewParentFeedbackAction } from "@/features/parent-feedback/actions";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  User,
  Star,
  MessageSquare,
  Sparkles,
  FileEdit,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { AssistantFeedbackItem } from "../types";

interface AssistantFeedbackReviewModalProps {
  feedback: AssistantFeedbackItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewed?: (feedbackId: string, notes?: string) => void;
}

export function AssistantFeedbackReviewModal({
  feedback,
  open,
  onOpenChange,
  onReviewed,
}: AssistantFeedbackReviewModalProps) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<string>(feedback?.headCoachNotes ?? "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!feedback) return null;

  const dateStr = new Date(feedback.createdAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await reviewParentFeedbackAction({
        feedbackId: feedback.id,
        isReviewed: true,
        headCoachNotes: notes.trim() || undefined,
      });

      if (res.success) {
        toast.success("Catatan supervisi berhasil disimpan.");
        if (onReviewed) onReviewed(feedback.id, notes.trim() || undefined);
        onOpenChange(false);
      } else {
        setErrorMsg(res.error || "Gagal menyimpan ulasan supervisi.");
        toast.error(res.error || "Gagal menyimpan ulasan");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden bg-surface-1"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader className="p-5 pb-4 border-b border-border bg-gradient-to-r from-indigo-50/60 via-surface-1 to-surface-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-xl bg-indigo-600/10 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </span>
            <DialogTitle className="text-base font-bold font-display text-foreground">
              Supervisi Ulasan Sesi
            </DialogTitle>
          </div>

          <div className="space-y-0.5 text-xs text-muted">
            <p className="font-semibold text-foreground">{feedback.sessionTitle}</p>
            <p className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="h-3 w-3 text-indigo-600" />
              {dateStr}
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Atlet */}
          {feedback.athleteName && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 border border-border">
              <User className="h-4 w-4 text-muted shrink-0" />
              <span>
                Atlet / Keluarga: <strong className="text-foreground">{feedback.athleteName}</strong>
              </span>
            </div>
          )}

          {/* Rating Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-surface-2 border border-border space-y-1">
              <span className="text-[10px] text-muted uppercase font-semibold block">
                Materi Latihan
              </span>
              <div className="flex items-center justify-center gap-1 font-bold text-sm text-foreground font-mono">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{feedback.sessionRating} / 5</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-2 border border-border space-y-1">
              <span className="text-[10px] text-muted uppercase font-semibold block">
                Komunikasi
              </span>
              <div className="flex items-center justify-center gap-1 font-bold text-sm text-foreground font-mono">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{feedback.communicationRating} / 5</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-2 border border-border space-y-1">
              <span className="text-[10px] text-muted uppercase font-semibold block">
                Perhatian
              </span>
              <div className="flex items-center justify-center gap-1 font-bold text-sm text-foreground font-mono">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{feedback.athleteAttentionRating} / 5</span>
              </div>
            </div>
          </div>

          {/* Parent Comment */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-200/60">
            <span className="font-bold text-[11px] text-indigo-950 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
              Kesan &amp; Masukan Orang Tua:
            </span>
            <p className="text-slate-800 italic leading-relaxed whitespace-pre-wrap">
              {feedback.comment ? `"${feedback.comment}"` : "Tidak ada catatan tambahan tertulis."}
            </p>
          </div>

          {/* Head Coach Review Notes */}
          <form onSubmit={handleSaveReview} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <FileEdit className="h-3.5 w-3.5 text-indigo-600" />
                <span>Catatan Supervisi Head Coach (Internal)</span>
              </label>
              <span className="text-[10px] text-muted font-mono">{notes.length}/1000</span>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
              disabled={isPending}
              placeholder="Tambahkan catatan tindak lanjut, briefing pengingat, atau apresiasi internal untuk asisten pelatih..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
            <p className="text-[10.5px] text-muted">
              Catatan ini bersifat rahasia internal dan hanya dapat dilihat oleh Head Coach / Admin.
            </p>
          </form>
        </div>

        <div className="p-4 border-t border-border bg-surface-2/60 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="min-h-[40px] px-4 text-xs font-semibold"
          >
            Tutup
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveReview}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white min-h-[40px] px-5 text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Tandai Ditinjau &amp; Simpan</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
