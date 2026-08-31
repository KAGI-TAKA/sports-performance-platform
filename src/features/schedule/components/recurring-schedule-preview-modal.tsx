"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
  Loader2,
  Users,
  Dumbbell,
  User,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RecurringSchedulePreview } from "../recurrence-engine";
import {
  createRecurringScheduleAction,
  type CreateRecurringScheduleInput,
} from "../recurrence-actions";

interface RecurringSchedulePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: RecurringSchedulePreview | null;
  formPayload: {
    title: string;
    coachId: string;
    coachName?: string;
    athleteIds: string[];
    athleteNames?: string[];
    trainingPlanId?: string | null;
    trainingPlanTitle?: string;
    location?: string;
    notes?: string;
    startDateStr: string;
    endDateStr: string;
    weekdays: number[];
    startTimeStr: string;
    endTimeStr: string;
  } | null;
  onSuccess: () => void;
}

export function RecurringSchedulePreviewModal({
  open,
  onOpenChange,
  preview,
  formPayload,
  onSuccess,
}: RecurringSchedulePreviewModalProps) {
  const [isPending, startTransition] = useTransition();
  const [includeWarnings, setIncludeWarnings] = useState(false);

  if (!preview || !formPayload) return null;

  const validToCreateCount = includeWarnings
    ? preview.safeCount + preview.warningCount
    : preview.safeCount;

  const handleConfirmCreate = () => {
    startTransition(async () => {
      const input: CreateRecurringScheduleInput = {
        title: formPayload.title,
        coachId: formPayload.coachId,
        athleteIds: formPayload.athleteIds,
        trainingPlanId: formPayload.trainingPlanId,
        location: formPayload.location,
        notes: formPayload.notes,
        startDateStr: formPayload.startDateStr,
        endDateStr: formPayload.endDateStr,
        weekdays: formPayload.weekdays,
        startTimeStr: formPayload.startTimeStr,
        endTimeStr: formPayload.endTimeStr,
        includeAthleteWarnings: includeWarnings,
      };

      const result = await createRecurringScheduleAction(input);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `Berhasil membuat ${result.createdCount} sesi berulang! ${result.skippedCount > 0 ? `(${result.skippedCount} sesi dilewati karena bentrok/duplikat)` : ""}`
      );
      onOpenChange(false);
      onSuccess();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-slate-200">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <DialogTitle className="text-base font-bold text-slate-900">
              Pratinjau Jadwal Berulang
            </DialogTitle>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tinjau seluruh jadwal yang akan dibuat sebelum menyimpan ke database.
          </p>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Metadata Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-slate-900 font-bold">{formPayload.title}</strong>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {formPayload.startTimeStr} - {formPayload.endTimeStr} WIB
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11.5px]">
              {formPayload.coachName && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>Pelatih: <strong className="text-slate-800">{formPayload.coachName}</strong></span>
                </div>
              )}
              {formPayload.trainingPlanTitle && (
                <div className="flex items-center gap-1.5 text-slate-600 truncate">
                  <Dumbbell className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Program: <strong className="text-slate-800">{formPayload.trainingPlanTitle}</strong></span>
                </div>
              )}
              {formPayload.athleteNames && formPayload.athleteNames.length > 0 && (
                <div className="flex items-center gap-1.5 text-slate-600 sm:col-span-2">
                  <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>Atlet ({formPayload.athleteNames.length}): <strong className="text-slate-800">{formPayload.athleteNames.join(", ")}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Counts Overview Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-center">
              <span className="text-lg font-bold text-emerald-800 block">{preview.safeCount}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Sesi Aman</span>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-center">
              <span className="text-lg font-bold text-rose-800 block">{preview.blockedCount}</span>
              <span className="text-[11px] text-rose-700 font-medium">Bentrok Pelatih</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center">
              <span className="text-lg font-bold text-amber-800 block">{preview.warningCount}</span>
              <span className="text-[11px] text-amber-700 font-medium">Bentrok Atlet</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-lg font-bold text-slate-800 block">{preview.alreadyExistsCount}</span>
              <span className="text-[11px] text-slate-600 font-medium">Sudah Ada</span>
            </div>
          </div>

          {/* Warning Toggle Checkbox if athlete warnings exist */}
          {preview.warningCount > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="includeAthleteWarnings"
                checked={includeWarnings}
                onChange={(e) => setIncludeWarnings(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="includeAthleteWarnings" className="text-xs text-amber-900 leading-snug cursor-pointer">
                <strong>Tetap buat {preview.warningCount} sesi dengan peringatan bentrok atlet</strong>
                <span className="block text-amber-700 text-[11px] mt-0.5">
                  Centang opsi ini jika atlet sengaja didaftarkan pada dua sesi yang tumpang tindih.
                </span>
              </label>
            </div>
          )}

          {/* Detailed Occurrence List */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rincian Tanggal ({preview.totalCount} Sesi Terjadwal)
            </h4>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {preview.occurrences.map((occ, idx) => {
                const dateFormatted = new Date(occ.startTime).toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div key={idx} className="p-2.5 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/80 transition">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-800 font-semibold">{dateFormatted}</strong>
                        <span className="text-[10.5px] text-slate-500">({occ.dayName})</span>
                      </div>
                      {occ.reason && (
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {occ.reason}
                        </p>
                      )}
                    </div>

                    {occ.status === "SAFE" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
                        <CheckCircle2 className="h-3 w-3" /> Aman
                      </span>
                    ) : occ.status === "COACH_BLOCKED" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10.5px] font-bold text-rose-700 border border-rose-200 shrink-0">
                        <XCircle className="h-3 w-3" /> Bentrok Pelatih
                      </span>
                    ) : occ.status === "ATHLETE_WARNING" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 border border-amber-200 shrink-0">
                        <AlertTriangle className="h-3 w-3" /> Bentrok Atlet
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600 border border-slate-200 shrink-0">
                        <Info className="h-3 w-3" /> Sudah Terdaftar
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
            onClick={handleConfirmCreate}
            disabled={isPending || validToCreateCount === 0}
            className="text-xs h-10 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-2xs"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Menyimpan Jadwal...
              </>
            ) : validToCreateCount > 0 ? (
              `Buat ${validToCreateCount} Sesi Aman →`
            ) : (
              "Semua Sesi Bentrok"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
