"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import {
  Copy,
  Calendar,
  Clock,
  User,
  Users,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Info,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScheduleStatus } from "@prisma/client";
import { getCloneActionLabel, type CloneSessionPreview, type SourceSessionData } from "../clone-engine";
import {
  previewCloneSessionAction,
  cloneScheduleSessionAction,
} from "../clone-actions";

interface CloneScheduleDialogProps {
  sessionId: string | null;
  sessionStatus?: ScheduleStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newSessionId: string) => void;
}

export function CloneScheduleDialog({
  sessionId,
  sessionStatus = "SCHEDULED",
  open,
  onOpenChange,
  onSuccess,
}: CloneScheduleDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isEvaluating, startEvaluating] = useTransition();

  const labels = getCloneActionLabel(sessionStatus);

  // Default target date: +7 days from today
  const defaultTargetDate = (() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const [targetDateStr, setTargetDateStr] = useState(defaultTargetDate);
  const [targetStartTimeStr, setTargetStartTimeStr] = useState("16:00");
  const [includeWarnings, setIncludeWarnings] = useState(false);

  const [preview, setPreview] = useState<CloneSessionPreview | null>(null);
  const [sourceData, setSourceData] = useState<SourceSessionData | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Trigger evaluation when dialog opens or target date/time changes
  useEffect(() => {
    if (!open || !sessionId) {
      setPreview(null);
      setSourceData(null);
      setEvalError(null);
      return;
    }

    startEvaluating(async () => {
      const res = await previewCloneSessionAction(sessionId, targetDateStr, targetStartTimeStr);
      if (!res.success) {
        setEvalError(res.error || "Gagal memuat informasi sesi sumber.");
        setPreview(null);
      } else {
        setEvalError(null);
        setPreview(res.preview || null);
        setSourceData(res.sourceSession || null);
      }
    });
  }, [open, sessionId, targetDateStr, targetStartTimeStr]);

  const handleExecuteClone = () => {
    if (!sessionId) return;

    startTransition(async () => {
      const result = await cloneScheduleSessionAction({
        sourceSessionId: sessionId,
        targetDateStr,
        targetStartTimeStr,
        includeAthleteWarnings: includeWarnings,
      });

      if (!result.success) {
        toast.error(result.error || "Gagal menduplikasi sesi.");
        return;
      }

      toast.success(
        `Sesi berhasil ${sessionStatus === "CANCELLED" || sessionStatus === "NO_SHOW" ? "dijadwalkan ulang" : "diduplikasi"} ke ${result.targetDateFormatted || targetDateStr}!`
      );
      onOpenChange(false);
      if (result.newSessionId && onSuccess) {
        onSuccess(result.newSessionId);
      }
    });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-slate-200">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            {sessionStatus === "CANCELLED" || sessionStatus === "NO_SHOW" ? (
              <RotateCcw className="h-5 w-5 text-indigo-600" />
            ) : (
              <Copy className="h-5 w-5 text-indigo-600" />
            )}
            <DialogTitle className="text-base font-bold text-slate-900">
              {labels.titleLabel}
            </DialogTitle>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Salin susunan atlet, pelatih, dan materi latihan ke jadwal baru tanpa menyalin riwayat log lama.
          </p>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {evalError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 flex items-start gap-2.5 text-rose-800">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold block">Tidak Dapat Menduplikasi Sesi</strong>
                <p className="text-xs text-rose-700 leading-relaxed">{evalError}</p>
              </div>
            </div>
          ) : sourceData ? (
            /* Source Summary Card */
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] uppercase font-bold text-slate-400">Sesi Sumber</span>
                <span className="text-[10.5px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Durasi: {preview?.durationMinutes || 60} Menit
                </span>
              </div>

              <strong className="text-sm font-bold text-slate-900 block">{sourceData.title}</strong>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11.5px] text-slate-600">
                {sourceData.coachName && (
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">Pelatih: <strong className="text-slate-800">{sourceData.coachName}</strong></span>
                  </div>
                )}
                {sourceData.trainingPlanTitle && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Dumbbell className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">Program: <strong className="text-slate-800">{sourceData.trainingPlanTitle}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-slate-600 sm:col-span-2">
                  <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>Atlet ({sourceData.athletes.length}): <strong className="text-slate-800">{sourceData.athletes.map((a) => a.athleteName).join(", ")}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 text-slate-400 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Memuat data sesi sumber...</span>
            </div>
          )}

          {/* Destination Form Controls */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Tentukan Tanggal &amp; Waktu Target Baru
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Tanggal Baru <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={targetDateStr}
                  onChange={(e) => setTargetDateStr(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Jam Mulai <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="time"
                  value={targetStartTimeStr}
                  onChange={(e) => setTargetStartTimeStr(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            {/* Calculated Target Preview Bar */}
            {preview && !evalError && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  Estimasi Selesai ({preview.durationMinutes} mnt):
                </span>
                <span className="font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                  {targetStartTimeStr} - {preview.targetEndTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                </span>
              </div>
            )}
          </div>

          {/* Conflict Evaluation Feedback Banner */}
          {preview && !evalError && (
            <div className="pt-1">
              {preview.isAlreadyExists ? (
                <div className="rounded-xl border border-slate-300 bg-slate-100 p-3 flex items-start gap-2.5 text-slate-700">
                  <Info className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Sesi Sudah Terdaftar</strong>
                    <p className="text-[11.5px] mt-0.5 leading-tight">{preview.reason}</p>
                  </div>
                </div>
              ) : preview.hasCoachConflict ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2.5 text-rose-800">
                  <XCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Bentrok Jadwal Pelatih (Hard Block)</strong>
                    <p className="text-[11.5px] mt-0.5 leading-tight text-rose-700">{preview.reason}</p>
                  </div>
                </div>
              ) : preview.hasAthleteWarning ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2 text-amber-800">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <strong className="font-bold block">Peringatan Jadwal Atlet</strong>
                      <p className="text-[11.5px] mt-0.5 leading-tight text-amber-700">{preview.reason}</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1.5 border-t border-amber-200/60 cursor-pointer select-none text-xs text-amber-900 font-medium">
                    <input
                      type="checkbox"
                      checked={includeWarnings}
                      onChange={(e) => setIncludeWarnings(e.target.checked)}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                    />
                    <span>Tetap duplikasi meskipun terdapat bentrok atlet</span>
                  </label>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center gap-2.5 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="font-medium text-xs">Jadwal aman! Tidak ada bentrok pelatih maupun atlet.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs h-10 min-h-[44px] rounded-xl"
          >
            Batal
          </Button>

          <Button
            type="button"
            onClick={handleExecuteClone}
            disabled={
              isPending ||
              isEvaluating ||
              !!evalError ||
              !preview ||
              preview.isAlreadyExists ||
              preview.hasCoachConflict ||
              (preview.hasAthleteWarning && !includeWarnings)
            }
            className="text-xs h-10 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-2xs gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menduplikasi Sesi...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {labels.buttonLabel} →
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
