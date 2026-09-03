"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Calendar, Sparkles } from "lucide-react";

interface SessionSuccessDialogProps {
  open: boolean;
  sessionTitle: string;
  onNavigateHome: () => void;
}

export function SessionSuccessDialog({
  open,
  sessionTitle,
  onNavigateHome,
}: SessionSuccessDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-surface-1 border border-border p-7 sm:p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Animated Check Icon */}
        <div className="mx-auto h-16 w-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-md">
          <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500 block">
            Status Operasional: Berhasil
          </span>
          <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
            ✓ SESSION COMPLETED
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Session log successfully submitted. Presensi dan catatan sesi telah tersimpan dan siap dipantau Head Coach.
          </p>
          <div className="pt-2 text-xs font-semibold text-accent truncate">
            &ldquo;{sessionTitle}&rdquo;
          </div>
        </div>

        {/* Primary CTA: Back to Today's Agenda */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/25 transition cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span>Kembali ke Agenda Hari Ini</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
