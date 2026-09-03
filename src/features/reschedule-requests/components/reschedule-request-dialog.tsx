"use client";

import { useState, useTransition } from "react";
import {
  CalendarClock,
  AlertTriangle,
  Loader2,
  Send,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";
import { submitRescheduleRequestAction } from "@/features/reschedule-requests/actions";

interface RescheduleRequestDialogProps {
  sessionId: string;
  sessionTitle: string;
  sessionDate: string; // formatted date string
  existingRequest?: {
    status: "PENDING" | "APPROVED" | "REJECTED";
    reason: string;
  } | null;
  onClose: () => void;
}

export function RescheduleRequestDialog({
  sessionId,
  sessionTitle,
  sessionDate,
  existingRequest,
  onClose,
}: RescheduleRequestDialogProps) {
  const [reason, setReason] = useState(
    existingRequest?.status === "REJECTED" ? existingRequest.reason : ""
  );
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitRescheduleRequestAction(sessionId, reason);
      if (res.success) {
        setSubmitted(true);
        toast.success("Permintaan reschedule berhasil dikirim ke Head Coach");
        setTimeout(onClose, 1800);
      } else {
        toast.error(res.error || "Gagal mengirim permintaan");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full sm:max-w-md bg-surface-1 border border-border rounded-t-2xl sm:rounded-2xl shadow-xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Minta Reschedule Sesi
            </div>
            <h2 className="text-sm font-bold text-foreground leading-snug truncate">{sessionTitle}</h2>
            <p className="text-[11px] text-secondary">Dijadwalkan: {sessionDate}</p>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-foreground">Permintaan Terkirim!</p>
              <p className="text-xs text-muted mt-0.5">Head Coach akan segera meninjaunya.</p>
            </div>
          </div>
        ) : existingRequest?.status === "PENDING" ? (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <Clock3 className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">Permintaan Sedang Diproses</p>
              <p className="mt-0.5 text-amber-700 dark:text-amber-400/80">{existingRequest.reason}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-2 border border-border/70 text-xs text-secondary">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
              <p>
                Sesi ini sudah melewati tanggal yang dijadwalkan dan belum dapat dieksekusi.
                Jelaskan alasan mengapa sesi ini perlu dijadwalkan ulang oleh Head Coach.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="reschedule-reason" className="block text-xs font-semibold text-foreground mb-1.5">
                  Alasan Permintaan Reschedule <span className="text-danger">*</span>
                </label>
                <textarea
                  id="reschedule-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Contoh: Sesi tidak terlaksana karena hujan lebat dan lapangan tergenang air. Mohon dijadwalkan ulang."
                  className="w-full rounded-xl bg-surface-2 border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-accent/40 resize-none"
                  required
                  minLength={5}
                />
                <p className="text-[10px] text-muted mt-1">{reason.length}/500 karakter (min. 5)</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-secondary hover:text-foreground hover:bg-surface-2 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || reason.trim().length < 5}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Kirim Permintaan
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
