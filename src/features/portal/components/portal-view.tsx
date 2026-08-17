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
  PortalAchievementData,
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
  Star,
  Lock,
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
  achievements: PortalAchievementData;
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
  achievements,
}: PortalViewProps) {
  const [activeTab, setActiveTab] = useState<
    "PROGRESS" | "ACHIEVEMENTS" | "PLAN" | "SCHEDULE" | "LOGS" | "REPORTS"
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

  const renderBadgeIcon = (iconKey: string, earned: boolean) => {
    const iconClass = `h-5 w-5 ${earned ? "text-amber-500" : "text-slate-400"}`;
    switch (iconKey) {
      case "ShieldCheck":
        return <ShieldCheck className={iconClass} />;
      case "Award":
        return <Award className={iconClass} />;
      case "Zap":
        return <Zap className={iconClass} />;
      case "TrendingUp":
        return <TrendingUp className={iconClass} />;
      case "Dumbbell":
        return <Dumbbell className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

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
                Level: <span className="font-semibold text-white">{profile.competitionLevel ?? "Pemula"}</span> · {profile.age} Tahun ({formattedDOB})
              </p>
            </div>

            {/* Performance Summary & Star Rating Pill */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              {/* Star Rating Display */}
              <div className="text-center px-2">
                <div className="text-[10px] text-indigo-200 uppercase font-semibold">Bintang Performance</div>
                <div
                  className="flex items-center justify-center gap-0.5 mt-0.5"
                  aria-label={`${achievements.starRating} dari 5 bintang performa`}
                >
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <Star
                      key={starIndex}
                      className={`h-4 w-4 ${
                        starIndex <= achievements.starRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {snapshot && (
                <>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-center px-2">
                    <div className="text-[10px] text-indigo-200 uppercase font-semibold">Skor Performa</div>
                    <div className="text-xl font-bold text-white font-mono">
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
                </>
              )}
            </div>
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
            onClick={() => setActiveTab("ACHIEVEMENTS")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition shrink-0 ${
              activeTab === "ACHIEVEMENTS"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <Award className="h-4 w-4" />
            Prestasi &amp; Lencana ({achievements.badges.filter((b) => b.earned).length}/{achievements.badges.length})
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

        {/* TAB 2: ATHLETE ACHIEVEMENTS & BADGES */}
        {activeTab === "ACHIEVEMENTS" && (
          <div className="space-y-6">
            {/* Stars Recognition Header Card */}
            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 text-white shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    Athlete Performance Recognition
                  </span>
                  <h3 className="font-display text-xl font-bold tracking-tight text-white">
                    {achievements.starLabel}
                  </h3>
                  <p className="text-xs text-indigo-200/80 max-w-lg">
                    Pengakuan bintang atlet diukur dari konsistensi dan capaian grade evaluasi fisik resmi yang dilakukan oleh tim pelatih.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 p-3 rounded-xl border border-white/15 self-start sm:self-auto">
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <Star
                      key={starIndex}
                      className={`h-6 w-6 ${
                        starIndex <= achievements.starRating
                          ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-indigo-200">
                <div>
                  <span className="text-[10px] text-indigo-300/70 block uppercase font-medium">Evaluasi Fisik</span>
                  <strong className="text-white text-sm font-mono">{achievements.totalAssessments} Selesai</strong>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300/70 block uppercase font-medium">Sesi Latihan</span>
                  <strong className="text-white text-sm font-mono">{achievements.completedSessions} Sesi</strong>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300/70 block uppercase font-medium">Lencana Terbuka</span>
                  <strong className="text-amber-400 text-sm font-mono">
                    {achievements.badges.filter((b) => b.earned).length} / {achievements.badges.length} Badge
                  </strong>
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Lencana Prestasi Atlet (Physical Badges)
                </h3>
                <span className="text-xs text-muted">
                  {achievements.badges.filter((b) => b.earned).length} dari {achievements.badges.length} Terbuka
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {achievements.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-xl p-4 border transition flex items-start gap-3.5 ${
                      badge.earned
                        ? "bg-white border-amber-400/40 shadow-sm ring-1 ring-amber-400/20"
                        : "bg-surface-2/60 border-border/70 text-muted opacity-80"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center ${
                        badge.earned
                          ? "bg-amber-400/15 border border-amber-400/30"
                          : "bg-surface-3 border border-border"
                      }`}
                    >
                      {renderBadgeIcon(badge.iconKey, badge.earned)}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`font-bold text-xs truncate ${
                            badge.earned ? "text-foreground font-display" : "text-muted"
                          }`}
                        >
                          {badge.name}
                        </h4>
                        {badge.earned ? (
                          <Badge variant="success" className="text-[9.5px] py-0 px-1.5 shrink-0">
                            Terbuka
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9.5px] py-0 px-1.5 shrink-0 text-muted border-border">
                            <Lock className="h-2.5 w-2.5 mr-0.5" /> Terkunci
                          </Badge>
                        )}
                      </div>

                      <p className="text-[11px] leading-relaxed text-muted line-clamp-2">
                        {badge.description}
                      </p>

                      {badge.earned && badge.earnedDate && (
                        <div className="text-[10px] text-emerald-600 font-medium font-mono pt-1">
                          Capaian: {badge.earnedDate}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
