"use client";

import { useState } from "react";
import { CheckCircle2, Save, AlertCircle, Loader2 } from "lucide-react";
import type { AttendanceStatus } from "@prisma/client";
import type { ExecutionItemStatus, SessionExecutionAthleteData, SessionExecutionPlanData } from "../types";

interface SessionCompletionBarProps {
  athletes: SessionExecutionAthleteData[];
  trainingPlan: SessionExecutionPlanData | null;
  attendanceState: Record<string, { status: AttendanceStatus; notes?: string }>;
  executionState: Record<
    string,
    Record<
      string,
      {
        status: ExecutionItemStatus;
        notes?: string;
        actualSets?: number;
        actualReps?: string;
      }
    >
  >;
  isSavingDraft: boolean;
  isCompleting: boolean;
  onSaveDraft: () => void;
  onCompleteSession: () => void;
  isReadOnly: boolean;
}

export function SessionCompletionBar({
  athletes,
  trainingPlan,
  attendanceState,
  executionState,
  isSavingDraft,
  isCompleting,
  onSaveDraft,
  onCompleteSession,
  isReadOnly,
}: SessionCompletionBarProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (isReadOnly) return null;

  // Calculate attendance summary
  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let absentCount = 0;
  let unmarkedCount = 0;

  athletes.forEach((a) => {
    const st = attendanceState[a.id]?.status ?? "UNMARKED";
    if (st === "PRESENT") presentCount++;
    else if (st === "LATE") lateCount++;
    else if (st === "EXCUSED") excusedCount++;
    else if (st === "ABSENT") absentCount++;
    else unmarkedCount++;
  });

  const participatedCount = presentCount + lateCount;

  // Calculate execution summary across all participating athletes
  let doneCount = 0;
  let modifiedCount = 0;
  let skippedCount = 0;
  let plannedCount = 0;

  const exercises = trainingPlan?.exercises ?? [];

  athletes.forEach((a) => {
    const st = attendanceState[a.id]?.status ?? "UNMARKED";
    if (st === "PRESENT" || st === "LATE") {
      const aExec = executionState[a.id] || {};
      exercises.forEach((ex) => {
        const itemStatus = aExec[ex.id]?.status ?? "PLANNED";
        if (itemStatus === "DONE") doneCount++;
        else if (itemStatus === "MODIFIED") modifiedCount++;
        else if (itemStatus === "SKIPPED") skippedCount++;
        else plannedCount++;
      });
    }
  });

  const hasUnmarked = unmarkedCount > 0;
  const cannotComplete = hasUnmarked || participatedCount === 0;

  return (
    <>
      {/* ── STICKY BOTTOM ACTION BAR ── */}
      <aside
        aria-label="Aksi Penyelesaian Sesi"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 sm:py-3.5 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status info strip */}
          <div className="text-xs text-slate-600 flex items-center gap-3">
            <span className="font-semibold text-slate-800">
              {participatedCount} dari {athletes.length} Hadir
            </span>
            <span>·</span>
            {hasUnmarked ? (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                {unmarkedCount} Atlet Belum Dipresensi
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">
                Presensi Lengkap ✓
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Save Draft Button */}
            <button
              type="button"
              disabled={isSavingDraft || isCompleting}
              onClick={onSaveDraft}
              className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-slate-500" />
                  <span>Simpan Draf</span>
                </>
              )}
            </button>

            {/* Complete Session CTA */}
            <button
              type="button"
              disabled={isSavingDraft || isCompleting}
              onClick={() => setShowConfirmModal(true)}
              className="min-h-[44px] flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Selesaikan Sesi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ── CONFIRMATION MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Konfirmasi Selesaikan Sesi
                </h3>
                <p className="text-xs text-slate-500">
                  Periksa ringkasan sebelum menyimpan permanen.
                </p>
              </div>
            </div>

            {/* Breakdown Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 uppercase text-[10.5px] block mb-1">
                  Ringkasan Presensi:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <span>Hadir: <strong>{presentCount}</strong></span>
                  <span>Terlambat: <strong>{lateCount}</strong></span>
                  <span>Izin: <strong>{excusedCount}</strong></span>
                  <span>Alpa: <strong>{absentCount}</strong></span>
                </div>
              </div>

              {exercises.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 uppercase text-[10.5px] block mb-1">
                    Eksekusi Gerakan Latihan:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <span className="text-emerald-700 font-semibold">
                      Selesai: {doneCount}
                    </span>
                    <span className="text-amber-700 font-semibold">
                      Modifikasi: {modifiedCount}
                    </span>
                    <span className="text-slate-600">
                      Dilewati: {skippedCount}
                    </span>
                    {plannedCount > 0 && (
                      <span className="text-slate-500 italic">
                        Belum Dilakukan: {plannedCount}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Validation Alerts */}
            {hasUnmarked && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>
                  <strong>Presensi Belum Lengkap:</strong> Masih ada {unmarkedCount} atlet yang belum ditandai presensinya.
                </span>
              </div>
            )}

            {!hasUnmarked && participatedCount === 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Tidak Ada Atlet yang Hadir:</strong> Sesi tidak dapat diselesaikan jika tidak ada atlet yang hadir. Gunakan status <em>Tidak Hadir (NO_SHOW)</em> atau <em>Batalkan Sesi</em>.
                </span>
              </div>
            )}

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Setelah diselesaikan, <strong>Session Log</strong> akan dibuat otomatis untuk atlet yang hadir dan formulir <strong>Parent Feedback</strong> akan aktif di portal orang tua.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={cannotComplete || isCompleting}
                onClick={() => {
                  setShowConfirmModal(false);
                  onCompleteSession();
                }}
                className="min-h-[44px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isCompleting ? "Memproses..." : "Ya, Selesaikan & Buat Log"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
