"use client";

import { useState } from "react";
import {
  Dumbbell,
  Check,
  Edit3,
  Minus,
  MessageSquare,
  Video,
  UserX,
  Sparkles,
} from "lucide-react";
import type { AttendanceStatus } from "@prisma/client";
import type {
  ExecutionItemStatus,
  SessionExecutionAthleteData,
  SessionExecutionPlanData,
} from "../types";

interface AthleteExecutionPanelProps {
  athletes: SessionExecutionAthleteData[];
  trainingPlan: SessionExecutionPlanData | null;
  activeAthleteId: string;
  onSelectAthlete: (athleteId: string) => void;
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
  feedbackState: Record<string, { coachFeedback?: string; videoUrl?: string }>;
  onExerciseStatusChange: (
    athleteId: string,
    exerciseId: string,
    status: ExecutionItemStatus,
    notes?: string,
    actualSets?: number,
    actualReps?: string
  ) => void;
  onFeedbackChange: (
    athleteId: string,
    coachFeedback?: string,
    videoUrl?: string
  ) => void;
  isReadOnly: boolean;
}

const MODIFIED_PRESETS = [
  "Reps dikurangi",
  "Intensitas diturunkan",
  "Durasi diperpendek",
  "Beban disesuaikan",
  "Kondisi lapangan",
];

const SKIPPED_PRESETS = [
  "Kondisi atlet kelelahan",
  "Waktu sesi tidak cukup",
  "Kondisi lapangan basah",
  "Diganti drill lain",
];

const FEEDBACK_PRESETS = [
  "Latihan berjalan lancar sesuai target program.",
  "Fokus, stamina, dan teknik gerak sangat baik.",
  "Intensitas gerakan perlu ditingkatkan pada sesi berikutnya.",
  "Perlu penyesuaian beban dan pemulihan fisik yang cukup.",
];

export function AthleteExecutionPanel({
  athletes,
  trainingPlan,
  activeAthleteId,
  onSelectAthlete,
  attendanceState,
  executionState,
  feedbackState,
  onExerciseStatusChange,
  onFeedbackChange,
  isReadOnly,
}: AthleteExecutionPanelProps) {
  const activeAthlete =
    athletes.find((a) => a.id === activeAthleteId) || athletes[0];
  const activeIndex = athletes.findIndex((a) => a.id === activeAthlete?.id);

  const athleteAttendance =
    attendanceState[activeAthlete?.id]?.status ?? "UNMARKED";
  const isAbsentOrExcused =
    athleteAttendance === "ABSENT" ||
    athleteAttendance === "EXCUSED" ||
    athleteAttendance === "RESCHEDULED";

  const currentAthleteExec = executionState[activeAthlete?.id] || {};
  const currentAthleteFeedback = feedbackState[activeAthlete?.id] || {};

  // Custom fallback text for sessions without training plan
  const [manualActivities, setManualActivities] = useState<string>(
    activeAthlete?.existingSessionLog?.activitiesDone || ""
  );

  if (!activeAthlete) return null;

  return (
    <section className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden space-y-0">
      {/* ── 1. GROUP ATHLETE SWITCHER TABS ── */}
      {athletes.length > 1 && (
        <div className="border-b border-border bg-slate-50 p-2 sm:p-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase px-2 shrink-0">
              Pilih Atlet:
            </span>
            {athletes.map((ath, idx) => {
              const isSelected = ath.id === activeAthlete.id;
              const status = attendanceState[ath.id]?.status ?? "UNMARKED";
              return (
                <button
                  key={ath.id}
                  type="button"
                  onClick={() => onSelectAthlete(ath.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                  aria-selected={isSelected}
                >
                  <span>
                    {idx + 1}. {ath.fullName.split(" ")[0]}
                  </span>
                  {status === "PRESENT" && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" title="Hadir" />
                  )}
                  {status === "LATE" && (
                    <span className="h-2 w-2 rounded-full bg-amber-400" title="Terlambat" />
                  )}
                  {(status === "ABSENT" || status === "EXCUSED") && (
                    <span className="h-2 w-2 rounded-full bg-rose-400" title="Tidak Hadir" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. ACTIVE ATHLETE HEADER STRIP ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border-b border-border bg-gradient-to-r from-indigo-50/40 to-white">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
            {activeAthlete.fullName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">{activeAthlete.fullName}</h3>
              {athletes.length > 1 && (
                <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                  Atlet {activeIndex + 1} dari {athletes.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Status Presensi:{" "}
              <strong className="text-slate-700 font-semibold">
                {athleteAttendance === "PRESENT"
                  ? "Hadir"
                  : athleteAttendance === "LATE"
                  ? "Terlambat"
                  : athleteAttendance === "EXCUSED"
                  ? "Izin"
                  : athleteAttendance === "ABSENT"
                  ? "Alpa"
                  : athleteAttendance === "RESCHEDULED"
                  ? "Reschedule"
                  : "Belum Ditandai"}
              </strong>
            </p>
          </div>
        </div>

        {trainingPlan && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Program Rencana
            </span>
            <span className="text-xs font-bold text-indigo-700">{trainingPlan.title}</span>
          </div>
        )}
      </div>

      {/* ── 3. BODY CONTENT: ABSENT GUARD OR TRAINING EXECUTION ── */}
      {isAbsentOrExcused ? (
        <div className="p-8 text-center space-y-2 bg-slate-50/60">
          <UserX className="h-8 w-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">Atlet Tidak Mengikuti Sesi Fisik</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Karena atlet berstatus <strong>{athleteAttendance}</strong>, catatan latihan fisik tidak dieksekusi dan tidak akan menghasilkan Session Log.
          </p>
        </div>
      ) : !trainingPlan || trainingPlan.exercises.length === 0 ? (
        /* Sesi tanpa program latihan terstruktur */
        <div className="p-5 sm:p-6 space-y-4">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center space-y-1">
            <Dumbbell className="h-6 w-6 text-slate-400 mx-auto" />
            <h4 className="font-bold text-xs text-slate-700">Belum Ada Program Latihan Terstruktur</h4>
            <p className="text-[11px] text-slate-500">
              Catat materi atau drill latihan manual yang dilakukan atlet di bawah ini.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Aktivitas Latihan Manual</label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={manualActivities}
              onChange={(e) => setManualActivities(e.target.value)}
              placeholder="Contoh: 1. Jogging pemanasan 10 menit, 2. Drill passing 3x10, 3. Game situasi 20 menit"
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            />
          </div>
        </div>
      ) : (
        /* Sesi dengan Training Plan: Checklist Gerakan */
        <div className="divide-y divide-slate-100">
          {trainingPlan.exercises.map((ex, index) => {
            const exec = currentAthleteExec[ex.id];
            // STRICT DEFAULT: PLANNED (Belum Dilakukan)
            const currentExecStatus: ExecutionItemStatus = exec?.status ?? "PLANNED";
            const currentNotes = exec?.notes ?? "";

            return (
              <div key={ex.id} className="p-5 space-y-3 hover:bg-slate-50/40 transition-colors">
                {/* Exercise Info & Target */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Drill #{index + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{ex.name}</h4>
                      {ex.category && (
                        <span className="text-[10px] font-semibold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {ex.category}
                        </span>
                      )}
                    </div>
                    {ex.notes && (
                      <p className="text-xs text-slate-500 italic pl-1 border-l-2 border-slate-200">
                        &quot;{ex.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Planned Target sets/reps */}
                  {(ex.sets || ex.reps || ex.restSeconds) && (
                    <div className="flex items-center gap-3 text-xs font-mono font-semibold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                      {ex.sets && <span>{ex.sets} sets</span>}
                      {ex.reps && <span>{ex.reps}</span>}
                      {ex.restSeconds && (
                        <span className="text-slate-500 font-normal">Rest {ex.restSeconds}s</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Selection Buttons (Min-height 44px) */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {/* DONE */}
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() =>
                      onExerciseStatusChange(activeAthlete.id, ex.id, "DONE", currentNotes)
                    }
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      currentExecStatus === "DONE"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800"
                    } ${isReadOnly ? "opacity-80 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                  >
                    <Check className="h-4 w-4" />
                    <span>✓ Selesai Sesuai Target</span>
                  </button>

                  {/* MODIFIED */}
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() =>
                      onExerciseStatusChange(activeAthlete.id, ex.id, "MODIFIED", currentNotes)
                    }
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      currentExecStatus === "MODIFIED"
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800"
                    } ${isReadOnly ? "opacity-80 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>✎ Modifikasi</span>
                  </button>

                  {/* SKIPPED */}
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() =>
                      onExerciseStatusChange(activeAthlete.id, ex.id, "SKIPPED", currentNotes)
                    }
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      currentExecStatus === "SKIPPED"
                        ? "bg-slate-700 text-white border-slate-800 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    } ${isReadOnly ? "opacity-80 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                  >
                    <Minus className="h-4 w-4" />
                    <span>— Dilewati</span>
                  </button>

                  {/* UNMARKED (PLANNED) INDICATOR */}
                  {currentExecStatus === "PLANNED" && (
                    <span className="text-[11px] text-slate-400 font-medium italic pl-1">
                      (Belum Dilakukan)
                    </span>
                  )}
                </div>

                {/* Quick Presets for MODIFIED */}
                {currentExecStatus === "MODIFIED" && (
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2 animate-in fade-in-0 duration-150">
                    <span className="text-[10.5px] uppercase font-bold text-amber-900 block">
                      Alasan / Jenis Modifikasi (Pilih Cepat):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {MODIFIED_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() =>
                            onExerciseStatusChange(
                              activeAthlete.id,
                              ex.id,
                              "MODIFIED",
                              preset
                            )
                          }
                          className={`min-h-[32px] px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition ${
                            currentNotes === preset
                              ? "bg-amber-600 text-white border-amber-700 font-bold"
                              : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      placeholder="Atau ketik catatan modifikasi khusus..."
                      value={currentNotes}
                      onChange={(e) =>
                        onExerciseStatusChange(
                          activeAthlete.id,
                          ex.id,
                          "MODIFIED",
                          e.target.value
                        )
                      }
                      className="w-full text-xs rounded-lg border border-amber-300 p-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}

                {/* Quick Presets for SKIPPED */}
                {currentExecStatus === "SKIPPED" && (
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-2 animate-in fade-in-0 duration-150">
                    <span className="text-[10.5px] uppercase font-bold text-slate-700 block">
                      Alasan Dilewati:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SKIPPED_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() =>
                            onExerciseStatusChange(
                              activeAthlete.id,
                              ex.id,
                              "SKIPPED",
                              preset
                            )
                          }
                          className={`min-h-[32px] px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition ${
                            currentNotes === preset
                              ? "bg-slate-800 text-white border-slate-900 font-bold"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      placeholder="Atau ketik alasan dilewati..."
                      value={currentNotes}
                      onChange={(e) =>
                        onExerciseStatusChange(
                          activeAthlete.id,
                          ex.id,
                          "SKIPPED",
                          e.target.value
                        )
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. COACH FEEDBACK & EVALUATION PER ATHLETE ── */}
      {!isAbsentOrExcused && (
        <div className="p-5 border-t border-border bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">
              Evaluasi &amp; Catatan Pelatih untuk {activeAthlete.fullName}
            </h4>
          </div>

          {/* Quick Feedback Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Preset Evaluasi Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FEEDBACK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() =>
                    onFeedbackChange(
                      activeAthlete.id,
                      preset,
                      currentAthleteFeedback.videoUrl
                    )
                  }
                  className="min-h-[32px] px-2.5 py-1 text-[11px] font-medium rounded-lg border bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 transition"
                >
                  <Sparkles className="h-2.5 w-2.5 inline mr-1 text-indigo-500" />
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Feedback Textarea */}
          <textarea
            rows={2}
            disabled={isReadOnly}
            placeholder="Ketik catatan evaluasi atau modifikasi catatan..."
            value={currentAthleteFeedback.coachFeedback ?? ""}
            onChange={(e) =>
              onFeedbackChange(
                activeAthlete.id,
                e.target.value,
                currentAthleteFeedback.videoUrl
              )
            }
            className="w-full rounded-xl border border-slate-300 p-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
          />

          {/* Optional Video URL */}
          <div className="flex items-center gap-2">
            <Video className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="url"
              disabled={isReadOnly}
              placeholder="Link Video Latihan (Opsional, misal: YouTube / Google Drive)"
              value={currentAthleteFeedback.videoUrl ?? ""}
              onChange={(e) =>
                onFeedbackChange(
                  activeAthlete.id,
                  currentAthleteFeedback.coachFeedback,
                  e.target.value
                )
              }
              className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100"
            />
          </div>
        </div>
      )}
    </section>
  );
}
