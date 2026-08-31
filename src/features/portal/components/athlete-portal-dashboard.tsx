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
  PortalPersonalBestItem,
  PortalAthleteGoalItem,
} from "../types";
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  FileText,
  Flame,
  Lock,
  MapPin,
  Minus,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PortalAthletePersonalBests } from "./portal-athlete-personal-bests";
import { PortalAthleteGoalsSection } from "./portal-athlete-goals-section";

interface AthletePortalDashboardProps {
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
  personalBests?: PortalPersonalBestItem[];
  portalGoals?: PortalAthleteGoalItem[];
}

export function AthletePortalDashboard({
  context,
  profile,
  snapshot,
  progress,
  trainingPlan,
  schedule,
  sessionLogs,
  reports,
  achievements,
  personalBests = [],
  portalGoals = [],
}: AthletePortalDashboardProps) {
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"WORKOUT" | "REKOR_TARGET" | "BADGES" | "SCHEDULE" | "STATS" | "LOGS">("WORKOUT");

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const completedCount = trainingPlan
    ? trainingPlan.exercises.filter((ex) => completedExercises[ex.id]).length
    : 0;
  const totalExercises = trainingPlan ? trainingPlan.exercises.length : 0;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  // Upcoming next session
  const nextSession = schedule.find((s) => s.status !== "COMPLETED") || schedule[0] || null;

  const renderBadgeIcon = (iconKey: string, earned: boolean) => {
    const iconClass = `h-5 w-5 ${earned ? "text-amber-400" : "text-slate-500"}`;
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
        return <Flame className={iconClass} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── MOTIVATIONAL HERO STATS ──────────────────────────────────── */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-5 sm:p-6 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 text-[11px] font-bold text-indigo-300">
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>Athlete Performance Arena</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
              Semangat Berlatih, {profile.fullName.split(" ")[0]}! 🔥
            </h2>
            <p className="text-xs text-indigo-200/80 max-w-md">
              Tingkat Performa: <strong className="text-white">{achievements.starLabel}</strong> · Selesaikan misi latihanmu hari ini!
            </p>
          </div>

          {/* Star Rating Badge */}
          <div className="flex items-center gap-1.5 bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/15 self-start sm:self-auto backdrop-blur-md">
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <Star
                key={starIndex}
                className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  starIndex <= achievements.starRating
                    ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                    : "text-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Athlete Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Skor Fisik</span>
            <strong className="text-xl font-bold font-mono text-white">
              {snapshot?.overallScore != null ? `${snapshot.overallScore.toFixed(1)}%` : "—"}
            </strong>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Grade Performa</span>
            <strong className="text-xl font-black text-amber-400 font-display">
              {snapshot?.overallGrade ?? "—"}
            </strong>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Lencana Terbuka</span>
            <strong className="text-xl font-bold font-mono text-emerald-400">
              {achievements.badges.filter((b) => b.earned).length} / {achievements.badges.length}
            </strong>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Jadwal Sesi</span>
            <strong className="text-xl font-bold font-mono text-indigo-300">
              {schedule.length > 0 ? `${schedule.length} Sesi Terdaftar` : "Belum ada"}
            </strong>
          </div>
        </div>
      </div>

      {/* ── UPCOMING NEXT SESSION QUICK ALERT (IN 5 SECONDS) ─────────── */}
      {nextSession && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-200/60 px-2 py-0.5 rounded-md">
                  Sesi Latihan Berikutnya
                </span>
                <span className="text-xs text-indigo-900 font-semibold">{nextSession.title}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {new Date(nextSession.startTime).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                ·{" "}
                <span className="font-mono">
                  {new Date(nextSession.startTime).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                </span>
                {nextSession.location ? ` @ ${nextSession.location}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("SCHEDULE")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 hover:border-indigo-300 px-3.5 py-2 rounded-xl transition self-start sm:self-auto shrink-0 shadow-2xs"
          >
            Lihat Jadwal Lengkap →
          </button>
        </div>
      )}

      {/* ── ATHLETE ACTION TABS ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-xl border border-border bg-white shadow-xs text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab("WORKOUT")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "WORKOUT"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Menu Latihan ({totalExercises})</span>
        </button>
        {/* P6-B4: Rekor & Target tab — position 2 */}
        <button
          onClick={() => setActiveTab("REKOR_TARGET")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "REKOR_TARGET"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Rekor &amp; Target</span>
        </button>
        <button
          onClick={() => setActiveTab("BADGES")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "BADGES"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Lencana Prestasi ({achievements.badges.filter((b) => b.earned).length})</span>
        </button>
        <button
          onClick={() => setActiveTab("SCHEDULE")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "SCHEDULE"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Jadwal Sesi ({schedule.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("STATS")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "STATS"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Grafik Fisik</span>
        </button>
        <button
          onClick={() => setActiveTab("LOGS")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "LOGS"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Catatan Latihan ({sessionLogs.length})</span>
        </button>
      </div>

      {/* ── TAB 1: WORKOUT & TRAINING CHECKLIST (ACTION-DRIVEN) ───────── */}
      {activeTab === "WORKOUT" && (
        <div className="space-y-4">
          {trainingPlan && trainingPlan.exercises.length > 0 ? (
            <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {trainingPlan.title}
                    </h3>
                    <Badge variant="accent">Program Aktif</Badge>
                  </div>
                  {trainingPlan.description && (
                    <p className="text-xs text-muted mt-1">{trainingPlan.description}</p>
                  )}
                </div>

                {/* Progress Ring / Bar */}
                <div className="flex items-center gap-3 bg-surface-2 px-3.5 py-2 rounded-xl border border-border self-start sm:self-auto">
                  <div className="text-right text-xs">
                    <span className="text-[10px] text-muted uppercase font-bold block">Progress Latihan</span>
                    <strong className="text-indigo-600 font-mono">{completedCount} dari {totalExercises} Gerakan Selesai</strong>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-indigo-600/15 border border-indigo-600/30 flex items-center justify-center font-mono text-xs font-bold text-indigo-600">
                    {progressPercent}%
                  </div>
                </div>
              </div>

              {/* Checklist helper note */}
              <p className="text-[11px] text-muted italic bg-surface-2 p-2.5 rounded-lg border border-border">
                💡 Panduan: Centang gerakan latihan ini secara mandiri selama sesi berlangsung (checklist interaktif sesi aktif).
              </p>

              {/* Exercises Checklist */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Daftar Gerakan (Ketuk untuk menandai selesai):</span>
                  {progressPercent === 100 && (
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                      <Sparkles className="h-3.5 w-3.5" /> Luar Biasa! Semua selesai!
                    </span>
                  )}
                </div>

                {trainingPlan.exercises.map((ex, idx) => {
                  const isDone = !!completedExercises[ex.id];
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleExercise(ex.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all flex items-start gap-3.5 min-h-[48px] ${
                        isDone
                          ? "bg-emerald-50/70 border-emerald-300/80 shadow-xs"
                          : "bg-surface-1 border-border hover:border-indigo-400/50 hover:bg-surface-2"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                        className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isDone
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isDone && <CheckCircle2 className="h-4 w-4" />}
                      </button>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`font-bold text-sm ${
                              isDone ? "text-emerald-950 line-through opacity-80" : "text-foreground"
                            }`}
                          >
                            {idx + 1}. {ex.name}
                          </h4>
                          {ex.category && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {ex.category}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted font-mono">
                          {ex.sets && <span>Sets: <strong className="text-foreground">{ex.sets}</strong></span>}
                          {ex.reps && <span>Reps: <strong className="text-foreground">{ex.reps}</strong></span>}
                          {ex.restSeconds && <span>Istirahat: <strong className="text-foreground">{ex.restSeconds}s</strong></span>}
                        </div>

                        {ex.notes && (
                          <p className="text-xs text-slate-600 italic pt-1 border-t border-border/50">
                            💡 Tips Coach: {ex.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 text-center space-y-2">
              <Dumbbell className="h-10 w-10 text-muted mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Belum ada latihan yang ditugaskan hari ini.</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Coach Zulfi akan meresepkan menu latihan fisik khusus untukmu setelah sesi evaluasi fisik berikutnya.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: BADGES & ACHIEVEMENTS ─────────────────────────────── */}
      {activeTab === "BADGES" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Koleksi Lencana Prestasi Atlet
            </h3>
            <span className="text-xs text-muted font-mono">
              {achievements.badges.filter((b) => b.earned).length} / {achievements.badges.length} Terbuka
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-2xl p-4 border transition flex items-start gap-3.5 ${
                  badge.earned
                    ? "bg-white border-amber-400/40 shadow-sm ring-1 ring-amber-400/20"
                    : "bg-surface-2/60 border-border text-muted opacity-75"
                }`}
              >
                <div
                  className={`p-3 rounded-xl shrink-0 flex items-center justify-center ${
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
                        Terbuka 🏆
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9.5px] py-0 px-1.5 shrink-0 text-muted">
                        <Lock className="h-2.5 w-2.5 mr-0.5" /> Terkunci
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted line-clamp-2">{badge.description}</p>

                  {badge.earned && badge.earnedDate && (
                    <div className="text-[10px] text-emerald-600 font-medium font-mono pt-1">
                      Diraih: {badge.earnedDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: SCHEDULE & CALENDAR ─────────────────────────────── */}
      {activeTab === "SCHEDULE" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950 to-slate-900 p-5 text-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">
                  Jadwal Sesi Latihan Kamu
                </h3>
                <p className="text-[11px] text-indigo-200">
                  Total {schedule.length} sesi terdaftar bersama Coach Zulfi
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-400/30">
              {schedule.filter((s) => s.status === "COMPLETED").length} Selesai
            </span>
          </div>

          {schedule.length > 0 ? (
            <div className="space-y-3">
              {schedule.map((s) => {
                const sDate = new Date(s.startTime);

                return (
                  <div
                    key={s.id}
                    className={`rounded-2xl border bg-white p-5 shadow-xs transition-all space-y-3.5 ${
                      s.status === "COMPLETED"
                        ? "border-slate-200 bg-slate-50/40"
                        : "border-indigo-200 shadow-sm"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-center justify-center rounded-xl bg-indigo-600 text-white px-2.5 py-1 text-center min-w-[48px]">
                          <span className="text-[9px] uppercase font-bold tracking-wider">
                            {sDate.toLocaleDateString("id-ID", { month: "short" })}
                          </span>
                          <span className="text-base font-black font-mono leading-none">
                            {sDate.getDate()}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-foreground font-display">
                            {s.title}
                          </h4>
                          <span className="text-[11px] text-muted">
                            {sDate.toLocaleDateString("id-ID", { weekday: "long" })}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={s.status === "COMPLETED" ? "outline" : "accent"}
                        className="text-[10px]"
                      >
                        {s.status === "COMPLETED" ? "✓ Selesai" : "📅 Terjadwal"}
                      </Badge>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span>
                          Waktu:{" "}
                          <strong className="font-mono text-foreground">
                            {sDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(s.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                          </strong>
                        </span>
                      </div>

                      {s.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
                          <span>Lokasi: <strong className="text-foreground">{s.location}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs text-muted">
                      <span>Pelatih: <strong className="text-foreground">{s.coachName}</strong></span>
                      {s.trainingPlanTitle && (
                        <span className="text-indigo-600 font-semibold flex items-center gap-1">
                          <Dumbbell className="h-3.5 w-3.5" />
                          {s.trainingPlanTitle}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 text-center space-y-2">
              <Calendar className="h-8 w-8 text-muted mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Belum Ada Jadwal Sesi Latihan</h4>
              <p className="text-xs text-muted">Jadwal latihan mendatang akan tampil di sini.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: PHYSICAL STATS BREAKDOWN ─────────────────────────── */}
      {activeTab === "STATS" && (
        <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-display font-bold text-sm text-foreground">
                Perkembangan 7 Komponen Fisik Atletik
              </h3>
              <p className="text-xs text-muted">Hasil tes evaluasi resmi bersama Coach Zulfi</p>
            </div>
            {snapshot?.overallGrade && (
              <Badge variant="accent" className="text-xs font-bold">
                Grade {snapshot.overallGrade}
              </Badge>
            )}
          </div>

          {progress.trends.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {progress.trends.map((t) => (
                <div
                  key={t.component}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3.5 text-xs"
                >
                  <div>
                    <div className="font-bold text-foreground">{t.component.replace(/_/g, " ")}</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      Skor:{" "}
                      <strong className="font-mono text-foreground">
                        {t.latestScore != null ? `${t.latestScore.toFixed(1)}%` : "—"}
                      </strong>
                      {t.change != null && (
                        <span
                          className={`ml-1.5 font-mono ${
                            t.change > 0
                              ? "text-emerald-600 font-bold"
                              : t.change < 0
                              ? "text-rose-600 font-bold"
                              : "text-muted"
                          }`}
                        >
                          ({t.change > 0 ? "+" : ""}{t.change.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {t.status === "IMPROVING" && (
                      <Badge variant="success" className="text-[10px]">
                        <TrendingUp className="h-3 w-3 mr-1" /> Meningkat
                      </Badge>
                    )}
                    {t.status === "DECLINING" && (
                      <Badge variant="danger" className="text-[10px]">
                        <TrendingDown className="h-3 w-3 mr-1" /> Evaluasi
                      </Badge>
                    )}
                    {t.status === "STABLE" && (
                      <Badge variant="outline" className="text-[10px]">
                        <Minus className="h-3 w-3 mr-1" /> Stabil
                      </Badge>
                    )}
                    {t.status === "INSUFFICIENT_DATA" && (
                      <Badge variant="outline" className="text-[10px] text-muted">
                        Data Awal
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-2 p-8 text-center space-y-2">
              <Activity className="h-8 w-8 text-muted mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Belum Ada Data Evaluasi Fisik</h4>
              <p className="text-xs text-muted">Grafik komponen fisik akan muncul setelah sesi evaluasi fisik resmi dilakukan.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: SESSION LOGS ──────────────────────────────────────── */}
      {activeTab === "LOGS" && (
        <div className="space-y-3">
          {sessionLogs.length > 0 ? (
            sessionLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs border-b border-border pb-2.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    {new Date(log.sessionDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <Badge variant="outline">Selesai</Badge>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-muted uppercase text-[10px]">
                    Materi Latihan yang Dijalankan:
                  </span>
                  <div className="bg-surface-2 p-3 rounded-xl border border-border text-foreground font-mono text-xs whitespace-pre-wrap">
                    {log.activitiesDone}
                  </div>
                </div>

                {log.coachFeedback && (
                  <div className="rounded-xl bg-indigo-50/70 border border-indigo-200/80 p-3 space-y-1 text-xs">
                    <span className="font-bold text-indigo-900 uppercase text-[10px] flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Umpan Balik Coach:
                    </span>
                    <p className="text-slate-800 italic">{log.coachFeedback}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-muted mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Belum Ada Catatan Sesi Latihan</h4>
              <p className="text-xs text-muted">Ringkasan aktivitas latihan akan dicatat di sini setelah setiap sesi latihan.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 6: REKOR & TARGET ─────────────────────────────────────── */}
      {activeTab === "REKOR_TARGET" && (
        <div className="space-y-5">
          {/* Summary strip */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-amber-500" />{personalBests.length} rekor tercatat</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5 text-indigo-500" />{portalGoals.filter(g => g.status === "ACTIVE").length} target aktif</span>
          </div>
          {/* Active Goals */}
          <PortalAthleteGoalsSection
            portalGoals={portalGoals}
            athleteFirstName={profile.fullName.split(" ")[0]}
          />
          {/* Personal Bests */}
          <PortalAthletePersonalBests personalBests={personalBests} />
        </div>
      )}
    </div>
  );
}

