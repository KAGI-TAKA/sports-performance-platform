"use client";

import { useState } from "react";
import type {
  PortalAccessContext,
  PortalAthleteProfile,
  PortalAssessmentSnapshot,
  PortalComponentTrend,
  PortalTrainingPlan,
  PortalScheduleSession,
  PortalSessionLog,
  PortalReportItem,
} from "../types";
import {
  Activity,
  Award,
  Calendar,
  ClipboardCheck,
  Dumbbell,
  FileText,
  ShieldCheck,
  User,
  Zap,
  Download,
  AlertCircle,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PortalViewProps {
  context: PortalAccessContext;
  profile: PortalAthleteProfile;
  snapshot: PortalAssessmentSnapshot | null;
  progress: {
    overallScore: number | null;
    overallGrade: string | null;
    trends: PortalComponentTrend[];
    totalAssessments: number;
  };
  trainingPlan: PortalTrainingPlan | null;
  schedule: PortalScheduleSession[];
  sessionLogs: PortalSessionLog[];
  reports: PortalReportItem[];
}

export function PortalView({
  context,
  profile,
  snapshot,
  progress,
  trainingPlan,
  schedule,
  sessionLogs,
  reports,
}: PortalViewProps) {
  const [activeTab, setActiveTab] = useState<
    "PROGRESS" | "PLAN" | "SCHEDULE" | "LOGS" | "REPORTS"
  >("PROGRESS");

  const gradeBadgeVariant = (grade: string | null): "success" | "accent" | "warning" | "danger" => {
    if (!grade) return "accent";
    if (grade.startsWith("A")) return "success";
    if (grade.startsWith("B")) return "accent";
    if (grade.startsWith("C")) return "warning";
    return "danger";
  };

  const formattedDOB = new Date(profile.dateOfBirth).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16">
      {/* Top Banner Header */}
      <header className="bg-[#1E1B4B] text-white pt-8 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {context.organizationName} Portal
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-[11px] font-semibold text-indigo-200">
              <User className="h-3 w-3 text-accent" />
              {context.accessType === "PARENT" ? "Akses Orang Tua" : "Akses Atlet"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {profile.fullName}
                </h1>
                {profile.jerseyNumber != null && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    #{profile.jerseyNumber}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-indigo-200">
                {profile.position !== "UNSPECIFIED" ? profile.position.replace(/_/g, " ") : "Atlet"}{" "}
                · {profile.age} Tahun ({formattedDOB}) ·{" "}
                {profile.competitionLevel ?? "Kinetiq Performance"}
              </p>
            </div>

            {/* Performance Summary Pill */}
            {snapshot && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
                <div className="text-center px-2">
                  <div className="text-[10px] text-indigo-200 uppercase font-semibold">Skor Performa</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {snapshot.overallScore != null ? snapshot.overallScore.toFixed(1) : "—"}%
                  </div>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-[10px] text-indigo-200 uppercase font-semibold">Grade</div>
                  <div className="text-lg font-extrabold text-amber-400">
                    {snapshot.overallGrade ?? "—"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl border border-border bg-white shadow-sm text-xs font-semibold">
          <button
            onClick={() => setActiveTab("PROGRESS")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition shrink-0 ${
              activeTab === "PROGRESS"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <Activity className="h-4 w-4" />
            Performa ({progress.totalAssessments})
          </button>
          <button
            onClick={() => setActiveTab("PLAN")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition shrink-0 ${
              activeTab === "PLAN"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <Dumbbell className="h-4 w-4" />
            Program Latihan
          </button>
          <button
            onClick={() => setActiveTab("SCHEDULE")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition shrink-0 ${
              activeTab === "SCHEDULE"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Jadwal ({schedule.length})
          </button>
          <button
            onClick={() => setActiveTab("LOGS")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition shrink-0 ${
              activeTab === "LOGS"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            Catatan Latihan ({sessionLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("REPORTS")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition shrink-0 ${
              activeTab === "REPORTS"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <FileText className="h-4 w-4" />
            Laporan PDF ({reports.length})
          </button>
        </div>

        {/* TAB 1: PROGRESS & SNAPSHOT */}
        {activeTab === "PROGRESS" && (
          <div className="space-y-6">
            {/* Snapshot Highlights */}
            {snapshot ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted flex items-center gap-1">
                      <Zap className="h-4 w-4 text-emerald-500" />
                      Komponen Terkuat
                    </span>
                    <Badge variant="success">Keunggulan</Badge>
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {snapshot.bestComponent ? snapshot.bestComponent.replace(/_/g, " ") : "—"}
                  </div>
                  <p className="text-xs text-muted">
                    Komponen fisik dengan pencapaian relatif tertinggi dibanding standar kelompok usianya.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted flex items-center gap-1">
                      <Award className="h-4 w-4 text-amber-500" />
                      Fokus Pengembangan
                    </span>
                    <Badge variant="warning">Target Latihan</Badge>
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {snapshot.weakestComponents.length > 0
                      ? snapshot.weakestComponents.map((c) => c.replace(/_/g, " ")).join(", ")
                      : "—"}
                  </div>
                  <p className="text-xs text-muted">
                    Area yang direkomendasikan pelatih untuk ditingkatkan dalam program latihan mendatang.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white p-8 text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted/50 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">Belum Ada Hasil Assessment</h3>
                <p className="text-xs text-muted">
                  Hasil tes evaluasi fisik atlet akan muncul di sini setelah diselesaikan oleh pelatih.
                </p>
              </div>
            )}

            {/* Coach Insight */}
            {snapshot?.insightText && (
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 space-y-2">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  Catatan Evaluasi Pelatih
                </h3>
                <p className="text-xs leading-relaxed text-foreground font-medium">
                  {snapshot.insightText}
                </p>
                {snapshot.recommendationText && (
                  <p className="text-xs leading-relaxed text-muted pt-2 border-t border-accent/15">
                    <strong>Rekomendasi:</strong> {snapshot.recommendationText}
                  </p>
                )}
              </div>
            )}

            {/* 7 Component Progress Breakdown */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground">
                Ringkasan Perkembangan 7 Komponen Fisik
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {progress.trends.map((t) => (
                  <div
                    key={t.component}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {t.component.replace(/_/g, " ")}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        Skor:{" "}
                        <span className="font-mono font-bold text-foreground">
                          {t.latestScore != null ? t.latestScore.toFixed(1) : "—"}%
                        </span>
                        {t.change != null && (
                          <span
                            className={`ml-1.5 font-mono ${
                              t.change > 0
                                ? "text-emerald-500 font-semibold"
                                : t.change < 0
                                ? "text-rose-500 font-semibold"
                                : "text-muted"
                            }`}
                          >
                            ({t.change > 0 ? "+" : ""}
                            {t.change.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {t.status === "IMPROVING" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                          <TrendingUp className="h-3 w-3" />
                          Meningkat
                        </span>
                      )}
                      {t.status === "DECLINING" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                          <TrendingDown className="h-3 w-3" />
                          Penurunan
                        </span>
                      )}
                      {t.status === "STABLE" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          <Minus className="h-3 w-3" />
                          Stabil
                        </span>
                      )}
                      {t.status === "INSUFFICIENT_DATA" && (
                        <span className="text-[10px] text-muted italic">Perlu Data</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRAINING PLAN */}
        {activeTab === "PLAN" && (
          <div className="space-y-4">
            {trainingPlan ? (
              <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {trainingPlan.title}
                    </h3>
                    {trainingPlan.description && (
                      <p className="mt-1 text-xs text-muted">{trainingPlan.description}</p>
                    )}
                  </div>
                  {(trainingPlan.startDate || trainingPlan.endDate) && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-muted font-mono self-start">
                      <Calendar className="h-3.5 w-3.5" />
                      {trainingPlan.startDate ?? "—"} s/d {trainingPlan.endDate ?? "—"}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Daftar Gerakan ({trainingPlan.exercises.length})
                  </h4>

                  {trainingPlan.exercises.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="rounded-lg border border-border bg-surface-2 p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>
                          {idx + 1}. {ex.name}
                        </span>
                        {ex.category && (
                          <Badge variant="outline" className="text-[10px]">
                            {ex.category}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-muted font-mono">
                        {ex.sets && <span>Sets: {ex.sets}</span>}
                        {ex.reps && <span>Reps: {ex.reps}</span>}
                        {ex.restSeconds && <span>Istirahat: {ex.restSeconds}s</span>}
                      </div>

                      {ex.notes && (
                        <p className="text-[11px] text-muted italic pt-1 border-t border-border/60">
                          Note: {ex.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white p-8 text-center space-y-2">
                <Dumbbell className="h-8 w-8 text-muted/50 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">Belum Ada Program Latihan Aktif</h3>
                <p className="text-xs text-muted">
                  Pelatih belum meresepkan program latihan khusus untuk atlet saat ini.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UPCOMING SCHEDULE */}
        {activeTab === "SCHEDULE" && (
          <div className="space-y-4">
            {schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-border bg-white p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground">{s.title}</h4>
                      <Badge variant="accent" className="text-[10px]">
                        {s.status}
                      </Badge>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-accent" />
                        {new Date(s.startTime).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        •{" "}
                        {new Date(s.startTime).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {s.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          {s.location}
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
                      <span>Pelatih: <strong>{s.coachName}</strong></span>
                      {s.trainingPlanTitle && (
                        <span className="text-accent font-semibold flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {s.trainingPlanTitle}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white p-8 text-center space-y-2">
                <Calendar className="h-8 w-8 text-muted/50 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">Belum Ada Jadwal Mendatang</h3>
                <p className="text-xs text-muted">
                  Jadwal latihan mendatang akan tampil di sini setelah dijadwalkan oleh pelatih.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SESSION LOGS */}
        {activeTab === "LOGS" && (
          <div className="space-y-4">
            {sessionLogs.length > 0 ? (
              <div className="space-y-3">
                {sessionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-border bg-white p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-accent" />
                        {new Date(log.sessionDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-muted uppercase text-[10px]">
                        Aktivitas Latihan:
                      </span>
                      <pre className="font-mono text-xs whitespace-pre-wrap bg-surface-2 p-2.5 rounded-lg border border-border text-foreground">
                        {log.activitiesDone}
                      </pre>
                    </div>

                    {log.coachFeedback && (
                      <div className="space-y-1 text-xs pt-2 border-t border-border">
                        <span className="font-semibold text-accent uppercase text-[10px]">
                          Umpan Balik Pelatih:
                        </span>
                        <p className="text-xs text-foreground italic">{log.coachFeedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white p-8 text-center space-y-2">
                <ClipboardCheck className="h-8 w-8 text-muted/50 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">Belum Ada Catatan Latihan</h3>
                <p className="text-xs text-muted">
                  Catatan ringkasan latihan harian atlet akan tercantum di sini.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REPORTS */}
        {activeTab === "REPORTS" && (
          <div className="space-y-4">
            {reports.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {reports.map((r) => (
                  <div
                    key={r.assessmentId}
                    className="rounded-xl border border-border bg-white p-4 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-foreground">
                        Laporan Evaluasi Fisik
                      </h4>
                      <p className="text-[11px] text-muted mt-0.5">
                        Tanggal:{" "}
                        {new Date(r.assessmentDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-mono font-bold text-xs text-foreground">
                          {r.overallScore != null ? r.overallScore.toFixed(1) : "—"}%
                        </span>
                        <Badge variant={gradeBadgeVariant(r.overallGrade)} className="text-[10px]">
                          Grade {r.overallGrade ?? "—"}
                        </Badge>
                      </div>
                    </div>

                    <a
                      href={r.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] px-3 py-2 text-xs font-semibold text-white shadow-sm transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white p-8 text-center space-y-2">
                <FileText className="h-8 w-8 text-muted/50 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">Belum Ada Laporan PDF</h3>
                <p className="text-xs text-muted">
                  Dokumen PDF hasil evaluasi fisik atlet akan muncul di sini setelah diselesaikan.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
