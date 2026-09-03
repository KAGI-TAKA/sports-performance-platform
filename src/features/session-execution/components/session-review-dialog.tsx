"use client";

import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ClipboardList,
  Users,
  FileText,
  Loader2,
  X,
} from "lucide-react";

interface SessionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle: string;
  durationString: string;
  attendanceSummary: {
    present: number;
    late: number;
    excused: number;
    absent: number;
    unmarked: number;
    total: number;
  };
  assessmentCount: number;
  hasGeneralNotes: boolean;
  coachFeedbackCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function SessionReviewDialog({
  open,
  onOpenChange,
  sessionTitle,
  durationString,
  attendanceSummary,
  assessmentCount,
  hasGeneralNotes,
  coachFeedbackCount,
  isSubmitting,
  onSubmit,
}: SessionReviewDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
      onClick={() => {
        if (!isSubmitting) onOpenChange(false);
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface-1 border border-border p-6 shadow-2xl space-y-5 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/80 pb-3.5">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block">
              Konfirmasi Selesai Latihan
            </span>
            <h3 className="font-display text-lg font-bold text-foreground">
              Tinjauan Sesi Latihan
            </h3>
            <p className="text-xs text-muted mt-0.5 truncate max-w-sm">
              {sessionTitle}
            </p>
          </div>

          {!isSubmitting && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition cursor-pointer"
              aria-label="Tutup Dialog"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Summary Review Grid */}
        <div className="space-y-3 text-xs">
          {/* 1. Attendance Breakdown */}
          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-foreground">
                <Users className="h-4 w-4 text-accent" />
                Rekap Presensi ({attendanceSummary.total} Atlet)
              </span>
              {attendanceSummary.unmarked > 0 ? (
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  {attendanceSummary.unmarked} Belum Ditandai
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Lengkap
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-base font-bold text-emerald-600 block">
                  {attendanceSummary.present}
                </span>
                <span className="text-[10px] text-emerald-600/90 font-medium">Hadir</span>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-base font-bold text-amber-600 block">
                  {attendanceSummary.late}
                </span>
                <span className="text-[10px] text-amber-600/90 font-medium">Terlambat</span>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-base font-bold text-blue-600 block">
                  {attendanceSummary.excused}
                </span>
                <span className="text-[10px] text-blue-600/90 font-medium">Izin / Sakit</span>
              </div>
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="text-base font-bold text-rose-600 block">
                  {attendanceSummary.absent}
                </span>
                <span className="text-[10px] text-rose-600/90 font-medium">Alpha</span>
              </div>
            </div>
          </div>

          {/* 2. Physical Assessments & Field Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border/60 space-y-1">
              <span className="text-muted flex items-center gap-1 font-medium text-[11px]">
                <ClipboardList className="h-3.5 w-3.5 text-accent" /> Tes Fisik
              </span>
              <div className="font-display text-base font-bold text-foreground">
                {assessmentCount > 0 ? `${assessmentCount} Data Tercatat` : "Tidak Ada Tes"}
              </div>
              <span className="text-[10px] text-muted">
                {assessmentCount > 0 ? "Tersimpan ke database" : "Hanya sesi latihan biasa"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-2/60 border border-border/60 space-y-1">
              <span className="text-muted flex items-center gap-1 font-medium text-[11px]">
                <FileText className="h-3.5 w-3.5 text-accent" /> Catatan Pelatih
              </span>
              <div className="font-display text-base font-bold text-foreground">
                {hasGeneralNotes || coachFeedbackCount > 0 ? "Catatan Terisi" : "Tanpa Catatan"}
              </div>
              <span className="text-[10px] text-muted">
                {coachFeedbackCount > 0
                  ? `${coachFeedbackCount} atlet diberi catatan`
                  : "Dapat ditambahkan nanti"}
              </span>
            </div>
          </div>

          {/* 3. Duration */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2/40 border border-border/40">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              <span className="font-semibold text-foreground">Estimasi Durasi Sesi:</span>
            </div>
            <span className="font-mono font-bold text-accent">{durationString}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-muted hover:text-foreground font-semibold text-xs transition cursor-pointer"
          >
            Batal &amp; Cek Kembali
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-accent/25 transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Session...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Session Log</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
