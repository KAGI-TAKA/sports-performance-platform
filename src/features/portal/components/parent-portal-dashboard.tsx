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
  Download,
  Dumbbell,
  FileText,
  HeartHandshake,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CoachGuidanceItem } from "@/features/guidance/types";
import { GuidanceFeed } from "@/features/guidance/components/guidance-feed";
import type { EligibleFeedbackSessionItem } from "@/features/parent-feedback/types";
import { ParentFeedbackDialog } from "@/features/parent-feedback/components/parent-feedback-dialog";
import { PortalParentGoalsSummary } from "./portal-parent-goals-summary";
import { PortalParentPersonalBests } from "./portal-parent-personal-bests";

interface ParentPortalDashboardProps {
  token?: string;
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
  guidances?: CoachGuidanceItem[];
  feedbackSessions?: EligibleFeedbackSessionItem[];
  personalBests?: PortalPersonalBestItem[];
  portalGoals?: PortalAthleteGoalItem[];
}

export function ParentPortalDashboard({
  token = "",
  context,
  profile,
  snapshot,
  progress,
  trainingPlan,
  schedule,
  sessionLogs,
  reports,
  achievements,
  guidances = [],
  feedbackSessions = [],
  personalBests = [],
  portalGoals = [],
}: ParentPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "GUIDE" | "REPORTS" | "LOGS" | "SCHEDULE">("SUMMARY");

  // Feedback State
  const [feedbackTargetSession, setFeedbackTargetSession] = useState<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    coachName: string;
    location?: string | null;
  } | null>(null);

  // Set of session IDs with submitted feedback (initialized from server data)
  const [submittedSessionIds, setSubmittedSessionIds] = useState<Set<string>>(() => {
    return new Set(
      feedbackSessions.filter((s) => s.hasSubmittedFeedback).map((s) => s.sessionId)
    );
  });

  // Map for quick session feedback lookup
  const feedbackMap = new Map(feedbackSessions.map((s) => [s.sessionId, s]));

  const formattedDOB = new Date(profile.dateOfBirth).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const gradeBadgeVariant = (grade: string | null): "success" | "accent" | "warning" | "danger" => {
    if (!grade) return "accent";
    if (grade.startsWith("A")) return "success";
    if (grade.startsWith("B")) return "accent";
    if (grade.startsWith("C")) return "warning";
    return "danger";
  };

  // Determine overall trend label
  const improvingCount = progress.trends.filter((t) => t.status === "IMPROVING" || (t.change != null && t.change > 0)).length;
  const overallTrendLabel =
    progress.trends.length === 0
      ? "Belum tersedia"
      : improvingCount >= 2
      ? "Berkembang Positif ↗"
      : "Stabil & Terjaga →";

  // Upcoming next session
  const nextSession = schedule.find((s) => s.status !== "COMPLETED") || schedule[0] || null;

  return (
    <div className="space-y-6">
      {/* ── PARENT EXECUTIVE HEADER CARD ────────────────────────────── */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 px-3 py-0.5 text-[11px] font-bold text-violet-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Portal Resmi Orang Tua / Wali</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {profile.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-indigo-200/80">
              <span>Status: <strong className="text-emerald-400 font-semibold">Aktif</strong></span>
              <span>·</span>
              <span>Usia: <strong className="text-white">{profile.age} Tahun</strong> ({formattedDOB})</span>
              <span>·</span>
              <span>Kategori: <strong className="text-white">{profile.competitionLevel ?? "Fisik & Pembinaan"}</strong></span>
            </div>
          </div>

          {/* Quick Action Button for Parents */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <a
              href={`https://wa.me/?text=Halo%20Coach%20Zulfi,%20saya%20orang%20tua%20dari%20${encodeURIComponent(
                profile.fullName
              )},%20ingin%20berkonsultasi%20mengenai%20perkembangan%20latihannya.`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 min-h-[44px]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Konsultasi Coach Zulfi</span>
            </a>
          </div>
        </div>

        {/* Parent Summary Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Skor Evaluasi Fisik</span>
            <strong className="text-xl font-bold font-mono text-white">
              {snapshot?.overallScore != null ? `${snapshot.overallScore.toFixed(1)}%` : "Belum tersedia"}
            </strong>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Grade Capaian</span>
            <strong className="text-xl font-extrabold text-amber-400 font-display">
              {snapshot?.overallGrade ? `Grade ${snapshot.overallGrade}` : "Belum tersedia"}
            </strong>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Tren Kemajuan</span>
            <strong className="text-sm sm:text-base font-bold text-emerald-400 block pt-1">
              {overallTrendLabel}
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

      {/* ── UPCOMING NEXT SESSION QUICK HIGHLIGHT FOR PARENTS ────────── */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-200/60 px-2 py-0.5 rounded-md">
                Sesi Latihan Terdekat
              </span>
              {nextSession && <span className="text-xs text-indigo-900 font-semibold">{nextSession.title}</span>}
            </div>
            {nextSession ? (
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
                {nextSession.location ? ` @ ${nextSession.location}` : ""} · Pelatih: {nextSession.coachName}
              </p>
            ) : (
              <p className="text-xs text-slate-600 mt-0.5">Belum ada sesi latihan terjadwal dalam waktu dekat.</p>
            )}
          </div>
        </div>
        {nextSession && (
          <button
            onClick={() => setActiveTab("SCHEDULE")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 hover:border-indigo-300 px-3.5 py-2 rounded-xl transition self-start sm:self-auto shrink-0 shadow-2xs min-h-[40px]"
          >
            Lihat Jadwal Lengkap →
          </button>
        )}
      </div>

      {/* ── PARENT NAVIGATION TABS ───────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-xl border border-border bg-white shadow-xs text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab("SUMMARY")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "SUMMARY"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Perkembangan Anak</span>
        </button>
        <button
          onClick={() => setActiveTab("GUIDE")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "GUIDE"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Panduan &amp; Nutrisi</span>
        </button>
        <button
          onClick={() => setActiveTab("REPORTS")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition shrink-0 min-h-[44px] ${
            activeTab === "REPORTS"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Laporan Resmi PDF ({reports.length})</span>
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
          <span>Catatan Sesi ({sessionLogs.length})</span>
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
          <span>Jadwal Latihan ({schedule.length})</span>
        </button>
      </div>

      {/* ── TAB 1: PERKEMBANGAN ANAK (BAHASA AWAM & CATATAN COACH) ──── */}
      {activeTab === "SUMMARY" && (
        <div className="space-y-6">
          {/* Coach Personal Insight Box */}
          {snapshot?.insightText ? (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 sm:p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    Z
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
                      Catatan &amp; Evaluasi Langsung Coach Zulfi
                    </h3>
                    <p className="text-[11px] text-indigo-700">Tanggal Tes: {snapshot.assessmentDate}</p>
                  </div>
                </div>
                <Badge variant="accent">Resmi</Badge>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                &quot;{snapshot.insightText}&quot;
              </p>

              {snapshot.recommendationText && (
                <div className="pt-3 border-t border-indigo-200/80 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-indigo-900 block">Rekomendasi Program Mendatang:</span>
                  <p>{snapshot.recommendationText}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 text-center space-y-2">
              <Sparkles className="h-8 w-8 text-muted mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Catatan Coach Belum Tersedia</h4>
              <p className="text-xs text-muted">Ulasan personal dan rekomendasi latihan dari Coach Zulfi akan tampil setelah tes evaluasi fisik dilakukan.</p>
            </div>
          )}

          {/* Pending Session Feedback Invitation Banner for Parents */}
          {(() => {
            const pendingSession = feedbackSessions.find(
              (s) => s.canSubmitFeedback && !submittedSessionIds.has(s.sessionId)
            );
            if (!pendingSession) return null;

            return (
              <div className="rounded-2xl border border-violet-300 bg-gradient-to-r from-violet-50 via-indigo-50/60 to-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in-0 duration-200">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-600/15 border border-violet-300 px-2.5 py-0.5 text-[10.5px] font-bold text-violet-800">
                    <HeartHandshake className="h-3.5 w-3.5 text-violet-600" />
                    <span>Ulasan Sesi Latihan</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-foreground">
                    Bagaimana Pengalaman Sesi Latihan Ananda?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sesi <strong>{pendingSession.sessionTitle}</strong> bersama Coach {pendingSession.coachName} telah selesai. Masukan tulus Ayah/Bunda sangat berarti bagi tim pelatih.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFeedbackTargetSession({
                      id: pendingSession.sessionId,
                      title: pendingSession.sessionTitle,
                      startTime: pendingSession.startTime,
                      endTime: pendingSession.endTime,
                      coachName: pendingSession.coachName,
                      location: pendingSession.location,
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition shrink-0 min-h-[44px]"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Beri Ulasan Sesi</span>
                </button>
              </div>
            );
          })()}

          {/* P6-B4: Target Perkembangan Ananda */}
          {portalGoals.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-0.5 flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded-full bg-violet-500 inline-block" />
                Target Perkembangan Ananda
              </h4>
              <PortalParentGoalsSummary portalGoals={portalGoals} />
            </div>
          )}

          {/* P6-B4: Rekor Terbaik Ananda */}
          {personalBests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-0.5 flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded-full bg-amber-400 inline-block" />
                Rekor Terbaik Ananda
              </h4>
              <PortalParentPersonalBests personalBests={personalBests} />
            </div>
          )}

          {/* Quick PDF Card CTA if report exists */}
          {reports.length > 0 && (
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                  Dokumen Evaluasi Resmi
                </span>
                <h4 className="font-display font-bold text-sm text-foreground">
                  Laporan Hasil Tes Fisik Terbaru ({reports[0].assessmentDate})
                </h4>
                <p className="text-xs text-muted">Unduh laporan resmi PDF lengkap untuk disimpan atau dilampirkan.</p>
              </div>
              <a
                href={reports[0].pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition shrink-0 min-h-[44px]"
              >
                <Download className="h-4 w-4" />
                <span>Unduh PDF Resmi</span>
              </a>
            </div>
          )}

          {/* Strength & Focus Cards */}
          {snapshot && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    Keunggulan Utama Anak
                  </span>
                  <Badge variant="success">Kekuatan</Badge>
                </div>
                <div className="text-base font-extrabold text-slate-900 font-display">
                  {snapshot.bestComponent ? snapshot.bestComponent.replace(/_/g, " ") : "Belum tersedia"}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aspek fisik di mana ananda memiliki performa paling unggul dibanding standar kelompok usianya.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-600" />
                    Fokus Peningkatan
                  </span>
                  <Badge variant="warning">Target Latihan</Badge>
                </div>
                <div className="text-base font-extrabold text-slate-900 font-display">
                  {snapshot.weakestComponents.length > 0
                    ? snapshot.weakestComponents.map((c) => c.replace(/_/g, " ")).join(", ")
                    : "Belum tersedia"}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Area fisik yang sedang ditingkatkan melalui menu latihan fisik terarah bersama Coach Zulfi.
                </p>
              </div>
            </div>
          )}

          {/* 7 Physical Components Trend */}
          <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-foreground">
                  Rangkuman Kemajuan 7 Komponen Fisik
                </h3>
                <p className="text-xs text-muted">Penjelasan sederhana kondisi fisik anak tanpa istilah teknis rumit</p>
              </div>
              {snapshot?.overallScore != null && (
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  Rata-rata: {snapshot.overallScore.toFixed(1)}%
                </span>
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
                          {t.latestScore != null ? `${t.latestScore.toFixed(1)}%` : "Belum ada"}
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                          <TrendingUp className="h-3 w-3" /> Berkembang
                        </span>
                      )}
                      {t.status === "DECLINING" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-600">
                          <TrendingDown className="h-3 w-3" /> Perlu Ditingkatkan
                        </span>
                      )}
                      {t.status === "STABLE" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                          Stabil
                        </span>
                      )}
                      {t.status === "INSUFFICIENT_DATA" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                          Data Awal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-border bg-surface-2 text-center text-xs text-muted">
                Belum ada data evaluasi fisik tersimpan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: PANDUAN NUTRISI & AKTIVITAS PENUNJANG DI RUMAH ───── */}
      {activeTab === "GUIDE" && (
        <div className="space-y-6">
          {/* Dynamic Coach Guidance Feed (Published by Coach Zulfi) */}
          {guidances.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Pesan &amp; Informasi Terbaru dari Coach Zulfi ({guidances.length})
                </h3>
              </div>
              <GuidanceFeed guidances={guidances} />
            </div>
          )}

          {/* Header Banner */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 sm:p-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                💡
              </span>
              <h3 className="font-display font-bold text-sm text-amber-950">
                Pondasi Nutrisi, Istirahat &amp; Kebiasaan Atlet Muda (6–15 Tahun)
              </h3>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Perkembangan fisik dan kebugaran ananda didukung secara optimal oleh kombinasi <strong>latihan terarah, asupan nutrisi seimbang, serta istirahat yang teratur di rumah</strong>.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Nutrisi Sebelum & Sesudah Latihan */}
            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <span className="text-base">🍎</span>
                <span>Protokol Makanan &amp; Hidrasi Latihan</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">1. Sebelum Sesi (1–2 Jam):</span>
                  <span>Karbohidrat mudah cerna (pisang, roti gandum, oatmeal) + 300–400ml air putih. Hindari gorengan dan santan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">2. Saat Latihan:</span>
                  <span>Minum 2–3 teguk air putih / air kelapa tiap jeda 15 menit untuk mencegah dehidrasi dan kram otot.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">3. Setelah Sesi (30 Menit):</span>
                  <span>Protein + Karbohidrat pemulihan (susu segar, telur rebus, dada ayam, buah) untuk regenerasi otot.</span>
                </li>
              </ul>
            </div>

            {/* Pola Tidur & Istirahat Berkualitas */}
            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <span className="text-base">🌙</span>
                <span>Pola Tidur &amp; Istirahat Berkualitas</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">Durasi Ideal:</span>
                  <span>Usia anak dan remaja membutuhkan waktu istirahat malam yang cukup dan berkualitas (8–10 jam) untuk mendukung kebugaran harian.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">Manfaat Pemulihan:</span>
                  <span>Tidur yang cukup dan teratur mendukung pemulihan tubuh, menjaga kebugaran, dan mendukung proses tumbuh kembang alami anak.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">Tips Sebelum Tidur:</span>
                  <span>Hentikan penggunaan gawai / *screen-time* minimal 45 menit sebelum anak tidur agar kualitas tidur maksimal.</span>
                </li>
              </ul>
            </div>

            {/* Kebiasaan & Peregangan di Rumah */}
            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <span className="text-base">🧘</span>
                <span>Peregangan &amp; Mobilitas di Rumah</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Selama fase lonjakan tinggi badan (*growth spurt*), tulang tumbuh lebih cepat dibanding otot dan tendon. Bantu ananda melakukan peregangan ringan 5 menit sebelum tidur:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-surface-2 border border-border px-2 py-1 text-[10px] font-medium text-slate-700">
                  Peregangan Betis (Calf Stretch)
                </span>
                <span className="rounded-md bg-surface-2 border border-border px-2 py-1 text-[10px] font-medium text-slate-700">
                  Paha Belakang (Hamstrings)
                </span>
                <span className="rounded-md bg-surface-2 border border-border px-2 py-1 text-[10px] font-medium text-slate-700">
                  Pinggul &amp; Punggung Bawah
                </span>
              </div>
            </div>

            {/* Hubungi Coach Zulfi */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <span className="text-base">💬</span>
                  <span>Konsultasi Nutrisi &amp; Kondisi Fisik Anak</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ada keluhan pegal berlebih, nyeri persendian, atau pertanyaan seputar menu makan ananda? Coach Zulfi siap berdiskusi langsung.
                </p>
              </div>

              <a
                href={`https://wa.me/?text=Halo%20Coach%20Zulfi,%20saya%20orang%20tua%20dari%20${encodeURIComponent(
                  profile.fullName
                )},%20ingin%20berkonsultasi%20mengenai%20pola%20nutrisi%20dan%20kondisi%20fisiknya.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageCircle className="h-4 w-4 text-emerald-300" />
                <span>Chat Coach Zulfi di WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: OFFICIAL PDF REPORTS ─────────────────────────────── */}
      {activeTab === "REPORTS" && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {reports.map((r) => (
                <div
                  key={r.assessmentId}
                  className="rounded-2xl border border-border bg-white p-5 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground font-display">
                      Laporan Evaluasi Fisik Resmi
                    </h4>
                    <p className="text-xs text-muted">
                      Tanggal:{" "}
                      {new Date(r.assessmentDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {r.overallScore != null ? `${r.overallScore.toFixed(1)}%` : "—"}
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition min-h-[44px]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh PDF</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 text-center space-y-2">
              <FileText className="h-8 w-8 text-muted mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Belum Ada Dokumen PDF</h4>
              <p className="text-xs text-muted">Dokumen PDF resmi akan muncul setelah sesi pengujian fisik diselesaikan.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: SESSION LOGS & COACH FEEDBACK ─────────────────────── */}
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
                      Umpan Balik Coach Zulfi:
                    </span>
                    <p className="text-slate-800 italic">{log.coachFeedback}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-muted mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Belum Ada Catatan Latihan</h4>
              <p className="text-xs text-muted">Ringkasan aktivitas latihan ananda akan dicatat di sini setelah sesi.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: SCHEDULE & CALENDAR ─────────────────────────────── */}
      {activeTab === "SCHEDULE" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-foreground">
                  Jadwal Sesi Latihan Ananda
                </h3>
                <p className="text-[11px] text-muted">
                  Total {schedule.length} sesi terdaftar dengan Coach Zulfi
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
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
                        {s.status === "COMPLETED" ? "✓ Selesai Terlaksana" : "📅 Terjadwal"}
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

                    {/* ── PARENT FEEDBACK SECTION ON COMPLETED SESSIONS ──── */}
                    {s.status === "COMPLETED" && (
                      <div className="pt-2.5 border-t border-border/80">
                        {submittedSessionIds.has(s.id) ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/80 border border-emerald-200 px-3 py-2 rounded-xl font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Ulasan Ayah/Bunda telah terkirim. Terima kasih atas masukannya!</span>
                          </div>
                        ) : feedbackMap.get(s.id)?.canSubmitFeedback ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-violet-50/70 border border-violet-200">
                            <div className="text-xs text-violet-950">
                              <strong className="block font-bold">Bagaimana pengalaman latihan ananda?</strong>
                              <span className="text-muted text-[11px]">Sesi bersama Coach {s.coachName} telah selesai</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setFeedbackTargetSession({
                                  id: s.id,
                                  title: s.title,
                                  startTime: s.startTime,
                                  endTime: s.endTime,
                                  coachName: s.coachName,
                                  location: s.location,
                                })
                              }
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-xs transition min-h-[40px] shrink-0"
                            >
                              <HeartHandshake className="h-4 w-4" />
                              <span>Beri Ulasan Sesi</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 text-center space-y-2">
              <Calendar className="h-8 w-8 text-muted mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Belum Ada Jadwal Sesi Latihan</h4>
              <p className="text-xs text-muted">Jadwal latihan ananda akan tampil di sini saat pelatih menyusun jadwal.</p>
            </div>
          )}
        </div>
      )}

      {/* ── PARENT FEEDBACK DIALOG ──────────────────────────────────── */}
      <ParentFeedbackDialog
        token={token}
        session={feedbackTargetSession}
        open={!!feedbackTargetSession}
        onOpenChange={(open) => {
          if (!open) setFeedbackTargetSession(null);
        }}
        onSubmitted={(sessionId) => {
          setSubmittedSessionIds((prev) => new Set([...prev, sessionId]));
        }}
      />
    </div>
  );
}

