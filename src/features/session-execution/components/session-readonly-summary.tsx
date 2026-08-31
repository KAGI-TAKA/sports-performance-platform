"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, FileText, UserCheck, Video, Copy, RotateCcw } from "lucide-react";
import type { SessionExecutionData } from "../types";
import { CloneScheduleDialog } from "@/features/schedule/components/clone-schedule-dialog";

interface SessionReadonlySummaryProps {
  data: SessionExecutionData;
}

export function SessionReadonlySummary({ data }: SessionReadonlySummaryProps) {
  const router = useRouter();
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const isCompleted = data.status === "COMPLETED";

  return (
    <div className="space-y-6">
      {/* Status Notice Banner */}
      <div
        className={`rounded-2xl border p-5 flex items-start gap-3.5 shadow-xs ${
          isCompleted
            ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
            : "border-slate-300 bg-slate-100 text-slate-800"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-6 w-6 text-slate-500 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <h3 className="font-bold text-sm">
            {isCompleted ? "Sesi Telah Selesai (Arsip Read-Only)" : "Sesi Telah Dibatalkan (Read-Only)"}
          </h3>
          <p className="text-xs opacity-90 leading-relaxed">
            {isCompleted
              ? "Sesi latihan ini telah diselesaikan. Catatan presensi dan log latihan atlet telah tersimpan permanen."
              : "Sesi latihan ini telah dibatalkan. Tidak ada presensi atau log latihan yang dapat dicatat."}
          </p>
        </div>
      </div>

      {/* Attendance Summary */}
      <section className="rounded-2xl border border-border bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserCheck className="h-4 w-4 text-indigo-600" />
          <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">
            Hasil Presensi Atlet
          </h4>
        </div>

        <div className="divide-y divide-slate-100">
          {data.athletes.map((ath) => (
            <div key={ath.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">{ath.fullName}</span>
                {ath.attendanceNotes && (
                  <p className="text-[11px] text-slate-500 italic">Catatan: &quot;{ath.attendanceNotes}&quot;</p>
                )}
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  ath.attendanceStatus === "PRESENT"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : ath.attendanceStatus === "LATE"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : ath.attendanceStatus === "EXCUSED"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : ath.attendanceStatus === "ABSENT"
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {ath.attendanceStatus}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Generated Session Logs */}
      {isCompleted && data.athletes.some((a) => a.existingSessionLog) && (
        <section className="rounded-2xl border border-border bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-4 w-4 text-indigo-600" />
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">
              Catatan Latihan yang Dihasilkan (Session Logs)
            </h4>
          </div>

          <div className="space-y-4">
            {data.athletes
              .filter((a) => a.existingSessionLog)
              .map((ath) => {
                const log = ath.existingSessionLog!;
                return (
                  <div key={ath.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm text-slate-900 font-bold">{ath.fullName}</strong>
                      <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Log Tersimpan
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Aktivitas Latihan:
                      </span>
                      <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        {log.activitiesDone}
                      </pre>
                    </div>

                    {log.coachFeedback && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Catatan &amp; Evaluasi Pelatih:
                        </span>
                        <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                          &quot;{log.coachFeedback}&quot;
                        </p>
                      </div>
                    )}

                    {log.videoUrl && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600">
                        <Video className="h-3.5 w-3.5" />
                        <a
                          href={log.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline font-medium truncate"
                        >
                          Lihat Video Latihan
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition min-h-[44px]"
        >
          ← Kembali ke Jadwal
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCloneDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition min-h-[44px] shadow-2xs"
            title={data.status === "CANCELLED" || data.status === "NO_SHOW" ? "Jadwalkan Ulang Sesi Ini" : "Duplikasi Sesi Ini"}
          >
            {data.status === "CANCELLED" || data.status === "NO_SHOW" ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Jadwalkan Ulang Sesi
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Duplikasi Sesi
              </>
            )}
          </button>

          <Link
            href="/session-logs"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-2xs min-h-[44px]"
          >
            Lihat Daftar Catatan Sesi (Session Logs) →
          </Link>
        </div>
      </div>

      {/* Clone Schedule Dialog */}
      <CloneScheduleDialog
        sessionId={data.id}
        sessionStatus={data.status}
        open={cloneDialogOpen}
        onOpenChange={setCloneDialogOpen}
        onSuccess={() => {
          router.push("/schedule");
        }}
      />
    </div>
  );
}
