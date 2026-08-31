"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRatingPicker } from "./star-rating-picker";
import { submitParentFeedbackAction } from "../actions";
import { toast } from "sonner";
import {
  HeartHandshake,
  Clock,
  MapPin,
  User,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface ParentFeedbackDialogProps {
  token: string;
  session: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    coachName: string;
    location?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: (sessionId: string) => void;
}

export function ParentFeedbackDialog({
  token,
  session,
  open,
  onOpenChange,
  onSubmitted,
}: ParentFeedbackDialogProps) {
  const [isPending, startTransition] = useTransition();

  // Ratings State (Default to 5 stars for high initial satisfaction)
  const [sessionRating, setSessionRating] = useState<number>(5);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [athleteAttentionRating, setAthleteAttentionRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!session) return null;

  const sessionDateStr = new Date(session.startTime).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeRangeStr = `${new Date(session.startTime).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${new Date(session.endTime).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} WIB`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await submitParentFeedbackAction({
        token,
        scheduleSessionId: session.id,
        sessionRating,
        communicationRating,
        athleteAttentionRating,
        comment: comment.trim() || undefined,
      });

      if (res.success) {
        toast.success("Terima kasih! Ulasan sesi Anda berhasil dikirim.");
        if (onSubmitted) onSubmitted(session.id);
        onOpenChange(false);
      } else {
        setErrorMsg(res.error || "Gagal mengirim ulasan. Silakan coba lagi.");
        toast.error(res.error || "Gagal mengirim ulasan sesi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden bg-surface-1"
        onClose={() => onOpenChange(false)}
      >
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <DialogHeader className="p-5 pb-4 border-b border-border bg-gradient-to-r from-violet-50/60 via-indigo-50/40 to-surface-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-xl bg-violet-600/10 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">
              <HeartHandshake className="h-4 w-4 text-violet-600" />
            </span>
            <DialogTitle className="text-base font-bold font-display text-foreground">
              Bagaimana Sesi Latihan Ananda?
            </DialogTitle>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-foreground">
              {session.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                {sessionDateStr} · {timeRangeStr}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Bersama <strong className="text-foreground font-semibold">{session.coachName}</strong>
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* ── FORM CONTENT ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            Masukan tulus Ayah/Bunda sangat berarti bagi tim pelatih untuk terus meningkatkan kualitas pembinaan dan kenyamanan ananda dalam berlatih.
          </p>

          {/* Rating 1: Pendampingan Latihan */}
          <StarRatingPicker
            label="1. Pendampingan & Kualitas Latihan"
            description="Kualitas materi, pengawasan gerakan, dan bimbingan teknik selama sesi berlangsung."
            value={sessionRating}
            onChange={setSessionRating}
            disabled={isPending}
          />

          {/* Rating 2: Komunikasi Coach */}
          <StarRatingPicker
            label="2. Komunikasi & Keramahan Pelatih"
            description="Kejelasan instruksi, keterbukaan diskusi, dan keramahan komunikasi pelatih."
            value={communicationRating}
            onChange={setCommunicationRating}
            disabled={isPending}
          />

          {/* Rating 3: Perhatian kepada Ananda */}
          <StarRatingPicker
            label="3. Perhatian & Motivasi kepada Ananda"
            description="Dorongan semangat, kepedulian terhadap kelelahan, dan kenyamanan psikologis ananda."
            value={athleteAttentionRating}
            onChange={setAthleteAttentionRating}
            disabled={isPending}
          />

          {/* Comment Box */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-surface-2/50 border border-border/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                <span>Kesan &amp; Catatan Tambahan</span>
                <span className="text-muted font-normal">(Opsional)</span>
              </label>
              <span className="text-[10px] text-muted font-mono">
                {comment.length}/1000
              </span>
            </div>

            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              disabled={isPending}
              placeholder="Ceritakan perkembangan positif ananda, hal yang disukai, atau masukan untuk latihan berikutnya..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
          </div>
        </form>

        {/* ── FOOTER / SUBMISSION ─────────────────────────────────────── */}
        <div className="p-4 border-t border-border bg-surface-2/60 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="min-h-[44px] px-4 text-xs font-semibold"
          >
            Batal
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white min-h-[44px] px-6 text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mengirim Ulasan…</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Kirim Ulasan Sesi</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
