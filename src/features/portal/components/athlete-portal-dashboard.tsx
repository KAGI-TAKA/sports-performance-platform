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
  PortalAttendanceSummary,
} from "../types";
import type { CoachGuidanceItem } from "@/features/guidance/types";
import {
  Zap,
  TrendingUp,
  Dumbbell,
  Target,
  Trophy,
  Award,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Activity,
  HeartPulse,
  Check,
  BookOpen,
  Bell,
  ChevronRight,
  Shield,
  Flame,
  ArrowUp,
  BedDouble,
  Gauge,
  Smile,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AssessmentRadarChart } from "@/features/assessments/components/radar-chart";
import { ProgressLineChart } from "@/features/progress/components/progress-line-chart";
import { YapSidebar, type YapTab } from "./yap/yap-sidebar";
import { YapBottomNav } from "./yap/yap-bottom-nav";
import { YapAthleteSelector, type AthleteOption } from "./yap/yap-athlete-selector";
import { COMPONENT_LABELS, APP_CONFIG } from "@/lib/constants";

interface AthletePortalDashboardProps {
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
  personalBests?: PortalPersonalBestItem[];
  portalGoals?: PortalAthleteGoalItem[];
  attendance?: PortalAttendanceSummary | null;
}

export function AthletePortalDashboard({
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
  personalBests = [],
  portalGoals = [],
  attendance = null,
}: AthletePortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<YapTab>("home");
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});
  const [trainSegment, setTrainSegment] = useState<"upcoming" | "completed">("upcoming");
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "session" | "assessment">("all");
  const [isAthleteSelectorOpen, setIsAthleteSelectorOpen] = useState(false);

  const toggleDrill = (drillId: string) => {
    setCompletedDrills((prev) => ({
      ...prev,
      [drillId]: !prev[drillId],
    }));
  };

  // ── 1. Greeting Computation ───────────────────────────────────────
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Selamat Pagi"
      : currentHour < 15
      ? "Selamat Siang"
      : currentHour < 18
      ? "Selamat Sore"
      : "Selamat Malam";

  const firstName = profile.fullName.split(" ")[0];

  // ── 2. Today's / Next Upcoming Session ───────────────────────────
  const now = new Date();
  const upcomingSessions = schedule.filter(
    (s) => new Date(s.endTime) >= now && s.status !== "COMPLETED"
  );
  const todaySession =
    upcomingSessions[0] || schedule.find((s) => s.status !== "COMPLETED") || null;

  // ── 3. Active Goal (Primary Target) ───────────────────────────────
  const activeGoal =
    portalGoals.find((g) => g.status === "ACTIVE") || portalGoals[0] || null;

  // ── 4. Primary Strength & Limiting Factor ─────────────────────────
  const componentScoresMap: Record<string, number> = {};
  progress.trends.forEach((t) => {
    if (t.latestScore != null) {
      componentScoresMap[t.component] = t.latestScore;
    }
  });

  const componentEntries = Object.entries(componentScoresMap);
  const sortedComponents = [...componentEntries].sort((a, b) => b[1] - a[1]);

  const primaryStrength = sortedComponents[0]
    ? { key: sortedComponents[0][0], score: Math.round(sortedComponents[0][1]) }
    : { key: "SPEED", score: 89 };

  const limitingFactor =
    sortedComponents.length > 1
      ? {
          key: sortedComponents[sortedComponents.length - 1][0],
          score: Math.round(sortedComponents[sortedComponents.length - 1][1]),
        }
      : { key: "AEROBIC_ENDURANCE", score: 74 };

  // ── 5. Calculated Readiness Indicator ─────────────────────────────
  const baseScore = progress.overallScore ?? 84;
  const readinessScore = Math.min(Math.max(Math.round(baseScore * 1.04), 65), 98);
  const readinessLabel = readinessScore >= 80 ? "READY" : "ATTENTION";

  // ── 6. Latest Coach Message ───────────────────────────────────────
  const latestGuidance = guidances[0] || null;

  // Format helper
  const formatCompLabel = (key?: string | null) => {
    if (!key) return "—";
    return (
      COMPONENT_LABELS[key] ??
      key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const radarScores = {
    FLEXIBILITY: componentScoresMap["FLEXIBILITY"] ?? 78,
    SPEED: componentScoresMap["SPEED"] ?? 89,
    POWER: componentScoresMap["POWER"] ?? 81,
    AGILITY: componentScoresMap["AGILITY"] ?? 86,
    MUSCULAR_ENDURANCE: componentScoresMap["MUSCULAR_ENDURANCE"] ?? 75,
    ANAEROBIC_ENDURANCE: componentScoresMap["ANAEROBIC_ENDURANCE"] ?? 82,
    AEROBIC_ENDURANCE: componentScoresMap["AEROBIC_ENDURANCE"] ?? 74,
  };

  const assessmentPoints = reports.length > 0
    ? reports.map((r) => ({
        id: r.assessmentId,
        assessmentDate: r.assessmentDate,
        overallScore: r.overallScore,
        overallGrade: r.overallGrade,
      }))
    : [
        { id: "1", assessmentDate: "2026-04-10", overallScore: 72, overallGrade: "B" },
        { id: "2", assessmentDate: "2026-05-15", overallScore: 76, overallGrade: "B+" },
        { id: "3", assessmentDate: "2026-06-20", overallScore: 74, overallGrade: "B" },
        { id: "4", assessmentDate: "2026-07-25", overallScore: 79, overallGrade: "B+" },
        { id: "5", assessmentDate: "2026-08-18", overallScore: 82, overallGrade: "A-" },
        { id: "6", assessmentDate: "2026-09-02", overallScore: 84, overallGrade: "A-" },
      ];

  // Default Fallback Personal Bests if database has not recorded test records yet
  const displayPbs: PortalPersonalBestItem[] = personalBests.length > 0
    ? personalBests
    : [
        {
          testItemId: "pb-sprint",
          testItemName: "Sprint (40m)",
          physicalComponent: "SPEED",
          scoreDirection: "LOWER_IS_BETTER",
          pbValue: 3.92,
          unit: "s",
          achievedDate: "2026-09-02",
          currentValue: 3.92,
          currentDate: "2026-09-02",
        },
        {
          testItemId: "pb-vjump",
          testItemName: "Vertical Jump",
          physicalComponent: "POWER",
          scoreDirection: "HIGHER_IS_BETTER",
          pbValue: 54,
          unit: "cm",
          achievedDate: "2026-09-02",
          currentValue: 54,
          currentDate: "2026-09-02",
        },
        {
          testItemId: "pb-agility",
          testItemName: "Agility (T-Test)",
          physicalComponent: "AGILITY",
          scoreDirection: "LOWER_IS_BETTER",
          pbValue: 12.4,
          unit: "s",
          achievedDate: "2026-09-02",
          currentValue: 12.4,
          currentDate: "2026-09-02",
        },
        {
          testItemId: "pb-endurance",
          testItemName: "Endurance (2km)",
          physicalComponent: "AEROBIC_ENDURANCE",
          scoreDirection: "LOWER_IS_BETTER",
          pbValue: 522, // 8:42 in seconds or numeric value
          unit: "s",
          achievedDate: "2026-08-20",
          currentValue: 522,
          currentDate: "2026-08-20",
        },
      ];

  const athleteOptions: AthleteOption[] = [
    {
      id: profile.id,
      name: profile.fullName,
      category: profile.sportCategory ?? "U-16 • Sepak Bola",
      age: profile.age,
      photoUrl: profile.photoUrl,
      isActive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#060D1F] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-blue-600/30 selection:text-white pb-20 lg:pb-0 font-sans">
      {/* ── MULTIPLE ATHLETE SELECTOR MODAL ───────────────────────── */}
      <YapAthleteSelector
        isOpen={isAthleteSelectorOpen}
        onClose={() => setIsAthleteSelectorOpen(false)}
        currentAthleteId={profile.id}
        athletes={athleteOptions}
        onSelectAthlete={() => {}}
      />

      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────── */}
      <YapSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        athleteName={profile.fullName}
        sportCategory={profile.sportCategory}
        photoUrl={profile.photoUrl}
        age={profile.age}
        onOpenAthleteSelector={() => setIsAthleteSelectorOpen(true)}
      />

      {/* ── MAIN ATHLETE CANVAS ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-[#080F1E]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
          {/* Mobile Brand */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div>
              <div className="font-display font-extrabold text-xs tracking-wider text-white">
                COACH ZULFI
              </div>
              <div className="text-[10px] font-bold text-sky-400 tracking-widest uppercase">
                YAP <span className="italic">PORTAL</span>
              </div>
            </div>
          </div>

          {/* Desktop Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-200 font-semibold">{APP_CONFIG.name}</span>
            <span>/</span>
            <span className="text-sky-400 font-bold uppercase tracking-wider">
              {activeTab === "home"
                ? "Home (Overview)"
                : activeTab === "progress"
                ? "Progress (Analisis Performa)"
                : activeTab === "train"
                ? "Train (Program & Sesi)"
                : activeTab === "pb"
                ? "PB Hub & Target Tracker"
                : "More (Profil & Bimbingan)"}
            </span>
          </div>

          {/* Actions & Athlete Profile Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAthleteSelectorOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-sky-500/50 hover:bg-slate-850 transition"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Atlet:</span>
              <strong className="text-white">{firstName}</strong>
            </button>

            <button
              onClick={() => setActiveTab("more")}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition relative"
              title="Notifikasi & Bimbingan"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-[#080F1E]" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ══════════════════════════════════════════════════════════════
              TAB 1: HOME (5-SECOND ATHLETE BRIEF)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "home" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* LEVEL 1: Greeting + Athlete Identity */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span>Good morning, {firstName}!</span>
                    <span className="inline-block origin-bottom-right">👋</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Keep pushing. Greatness is built daily through deliberate physical practice.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge
                    variant="outline"
                    className="border-sky-500/30 text-sky-400 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider"
                  >
                    YAP · {profile.competitionLevel ?? "U-16 Youth Performance"}
                  </Badge>
                </div>
              </div>

              {/* LEVEL 2: 4 Hero Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. TODAY'S READINESS */}
                <div className="p-5 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-md space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                        <span className="italic">TODAY&apos;S READINESS</span>
                      </span>
                      <HeartPulse className="h-4 w-4 text-emerald-400" />
                    </div>

                    <div className="flex items-baseline gap-2.5 mt-2">
                      <span className="font-mono text-4xl font-black text-white">
                        {readinessScore}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="italic">{readinessLabel}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Kondisi fisik siap untuk beban sesi latihan hari ini.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                    <span><span className="italic">Sleep</span> 8h 12m</span>
                    <span><span className="italic">RPE</span> 4 / 10</span>
                    <span className="text-emerald-400 font-bold"><span className="italic">Recovery</span> Good</span>
                  </div>
                </div>

                {/* 2. TODAY'S SESSION */}
                <div className="p-5 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-md space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                        <span className="italic">TODAY&apos;S SESSION</span>
                      </span>
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div className="text-sm font-bold text-white truncate">
                        {todaySession?.title ?? "Speed & Power Training"}
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 font-mono text-sky-400">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {todaySession
                              ? `${new Date(todaySession.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} – ${new Date(todaySession.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
                              : "16:00 – 17:30 WIB"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>Field A · Performance Area</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span>Coach Zulfi</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("train")}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-600/25"
                  >
                    <span>Lihat Sesi</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 3. CURRENT TARGET */}
                <div className="p-5 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-md space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                        <span className="italic">CURRENT TARGET</span>
                      </span>
                      <Target className="h-4 w-4 text-amber-400" />
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div className="text-xs font-bold text-white truncate">
                        {activeGoal?.testItemName ?? "40m Sprint"}
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {activeGoal ? `${activeGoal.currentValue ?? activeGoal.baselineValue}s → ` : "4.08s → "}
                        <span className="text-amber-400 font-black">
                          {activeGoal ? `${activeGoal.targetValue}s` : "3.95s"}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold font-mono">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-amber-400">{activeGoal?.progressPercent ?? 78}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                            style={{ width: `${activeGoal?.progressPercent ?? 78}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span>Deadline: 30 Sep 2026</span>
                    <button
                      onClick={() => setActiveTab("pb")}
                      className="font-bold text-sky-400 hover:underline"
                    >
                      Lihat Target
                    </button>
                  </div>
                </div>

                {/* 4. COACH MESSAGE */}
                <div className="p-5 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-md space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                        <span className="italic">COACH MESSAGE</span>
                      </span>
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                    </div>

                    <div className="mt-2">
                      <span className="text-xl font-serif text-sky-400 font-bold leading-none block">“</span>
                      <p className="text-xs text-slate-300 italic line-clamp-3 leading-relaxed">
                        {latestGuidance?.content ??
                          "Akselerasi dan stabilitas pergantian arah lari meningkat pesat pada siklus ini. Terus pertahankan ritme!"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <Avatar
                      fallback="CZ"
                      size="xs"
                      alt="Coach Zulfi"
                      className="ring-1 ring-sky-400"
                    />
                    <div className="text-[10px] text-slate-400 truncate">
                      — <strong className="text-slate-200">{latestGuidance?.authorName ?? "Coach Zulfi"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* LEVEL 3: Personal Bests & Latest Assessment */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Horizontal Personal Bests Metric Group (2 Cols) */}
                <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-400" />
                      <h2 className="font-display text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                        <span className="italic">PERSONAL BESTS</span>
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("pb")}
                      className="text-xs font-bold text-sky-400 hover:text-sky-300 transition flex items-center gap-1"
                    >
                      <span>Lihat Semua ({displayPbs.length})</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {displayPbs.slice(0, 4).map((pb, idx) => {
                      const deltas = ["▲ 2.2%", "▲ 5 cm", "▲ 0.6s", "▲ 0:18"];
                      return (
                        <div
                          key={pb.testItemId}
                          className="p-3.5 rounded-xl bg-[#060D1F] border border-slate-800/90 hover:border-sky-500/50 transition-colors space-y-1.5"
                        >
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">
                            {pb.testItemName}
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono text-xl font-black text-white">
                              {pb.pbValue}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {pb.unit.toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                              <span className="italic">PB</span>
                            </span>
                            <span className="text-emerald-400 font-mono">
                              {deltas[idx % deltas.length]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Latest Assessment Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0F1E36] via-[#0B1426] to-[#0B1426] border border-blue-500/30 shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold tracking-widest text-sky-300 uppercase">
                      <span className="italic">LATEST ASSESSMENT</span>
                    </span>
                    <Award className="h-5 w-5 text-sky-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Overall Score</div>
                        <span className="font-mono text-4xl font-black text-white">
                          {progress.overallScore ?? 84}
                        </span>
                        <span className="text-xs font-mono text-slate-400"> / 100</span>
                      </div>

                      <div className="pl-4 border-l border-slate-700">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Grade</div>
                        <span className="font-mono text-2xl font-extrabold text-sky-400">
                          {progress.overallGrade ?? "A-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="text-emerald-400 font-bold font-mono">+12% vs Apr</span>
                      <span>2 Sep 2026</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("progress")}
                    className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/30"
                  >
                    <span>Lihat Rapor</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* LEVEL 4: Performance Trend & Primary Strength / Focus Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Trend Chart (2 Cols) */}
                <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                        <span className="italic">PERFORMANCE TREND</span> (OVER 6 ASSESSMENTS)
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Perkembangan skor akumulatif 7 pilar fisik dari waktu ke waktu.
                      </p>
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      +12% vs Apr
                    </span>
                  </div>

                  <div className="pt-2">
                    <ProgressLineChart
                      assessments={assessmentPoints}
                      athleteName={profile.fullName}
                    />
                  </div>
                </div>

                {/* Primary Strength & Limiting Factor */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                  <div>
                    <h2 className="font-display text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      KEKUATAN &amp; AREA FOKUS
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pilar unggulan performa dan sasaran penguatan siklus ini.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Primary Strength */}
                    <div className="p-3.5 rounded-xl bg-[#060D1F] border border-sky-500/40 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-sky-400 uppercase tracking-wider">
                        <span>⚡ <span className="italic">PRIMARY STRENGTH</span></span>
                        <Zap className="h-3.5 w-3.5 text-sky-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">
                          {formatCompLabel(primaryStrength.key)}
                        </span>
                        <span className="font-mono text-sm font-extrabold text-sky-400">
                          {primaryStrength.score} / 100
                        </span>
                      </div>
                    </div>

                    {/* Limiting Factor */}
                    <div className="p-3.5 rounded-xl bg-[#060D1F] border border-rose-500/40 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">
                        <span>🎯 <span className="italic">LIMITING FACTOR</span></span>
                        <HeartPulse className="h-3.5 w-3.5 text-rose-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">
                          {formatCompLabel(limitingFactor.key)}
                        </span>
                        <span className="font-mono text-sm font-extrabold text-rose-400">
                          {limitingFactor.score} / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("progress")}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 hover:border-sky-500/50 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <span>Detail 7 Komponen</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: PROGRESS (PERFORMANCE OVERVIEW & RADAR)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "progress" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Pusat Analisis Performa (7 Komponen Fisik)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Evaluasi komprehensif profil atletik berdasarkan <span className="italic">sport science</span> dan standar <span className="italic">benchmark</span>.
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="border-sky-500/30 text-sky-400 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase self-start sm:self-auto"
                >
                  {progress.totalAssessments > 0 ? `${progress.totalAssessments} Siklus Evaluasi` : "6 Siklus Evaluasi"}
                </Badge>
              </div>

              {/* Radar Chart & Score Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Hero Radar Chart */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-sky-400" />
                      <span><span className="italic">Spider / Radar Chart</span> 7 Komponen</span>
                    </h2>
                    <span className="text-[11px] font-mono text-slate-400">Skala 0–100</span>
                  </div>

                  <div className="flex justify-center items-center py-2">
                    <AssessmentRadarChart componentScores={radarScores} />
                  </div>
                </div>

                {/* Component Score Bars & Status */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-400" />
                      <span>Rincian Nilai 7 Komponen Fisik</span>
                    </h2>
                    <span className="text-[11px] font-mono font-bold text-sky-400">
                      Rata-rata: {progress.overallScore ?? 84} / 100
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(COMPONENT_LABELS).map(([key, label]) => {
                      const score = Math.round(radarScores[key as keyof typeof radarScores] ?? 0);
                      const isHigh = score >= 80;
                      const isLow = score < 75;

                      return (
                        <div key={key} className="space-y-1.5 p-2.5 rounded-xl bg-[#060D1F] border border-slate-800/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">{score} / 100</span>
                              {isHigh && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                  Unggul
                                </span>
                              )}
                              {isLow && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                  Fokus
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHigh
                                  ? "bg-gradient-to-r from-blue-600 to-sky-400"
                                  : isLow
                                  ? "bg-gradient-to-r from-rose-500 to-amber-400"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
                              }`}
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Historical Assessment Cycles List */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                  <span>Riwayat Laporan Evaluasi Resmi</span>
                </h2>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#060D1F]">
                  {(reports.length > 0 ? reports : [
                    { assessmentId: "rep-1", assessmentDate: "2026-09-02", overallScore: 84, overallGrade: "A-" },
                    { assessmentId: "rep-2", assessmentDate: "2026-08-18", overallScore: 82, overallGrade: "A-" },
                    { assessmentId: "rep-3", assessmentDate: "2026-07-25", overallScore: 79, overallGrade: "B+" },
                  ]).map((rep) => (
                    <div key={rep.assessmentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-sm">Evaluasi Fisik Berkala Atlet</div>
                        <div className="text-slate-400 text-[11px]">
                          Tanggal Tes: {new Date(rep.assessmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono text-base font-extrabold text-white">{rep.overallScore} / 100</span>
                          <span className="block text-[10px] text-sky-400 font-bold">Grade {rep.overallGrade}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: TRAIN (UPCOMING SESSIONS & DRILLS)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "train" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Program Latihan &amp; Jadwal Sesi
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Menu latihan terstruktur, target repetisi, dan jadwal operasional latihan.
                  </p>
                </div>

                {/* Segmented Controller (Upcoming / Completed) */}
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => setTrainSegment("upcoming")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      trainSegment === "upcoming"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="italic">Upcoming</span>
                  </button>
                  <button
                    onClick={() => setTrainSegment("completed")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      trainSegment === "completed"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="italic">Completed</span>
                  </button>
                </div>
              </div>

              {trainSegment === "upcoming" ? (
                <>
                  {/* Active Training Plan & Drill Checklist */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-sky-400" />
                        <div>
                          <h2 className="text-sm font-bold text-white">
                            {trainingPlan?.title ?? "Fase Akselerasi & Power Eksplosif"}
                          </h2>
                          <p className="text-[11px] text-slate-400">
                            {trainingPlan?.description ?? "Fokus penguatan dorongan kaki awal dan kelincahan arah."}
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold">
                        Program Aktif
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        <span className="italic">CHECKLIST DRILL</span> LATIHAN
                      </span>

                      <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#060D1F]">
                        {(trainingPlan?.exercises.length ? trainingPlan.exercises : [
                          { id: "d1", name: "Wall Acceleration Drill (A-March)", category: "Speed", sets: 3, reps: "10 per leg", restSeconds: 60, notes: "Jaga sudut tubuh 45 derajat dan dorongan jempol kaki." },
                          { id: "d2", name: "Box Jump to Stick Landing", category: "Power", sets: 4, reps: "5 jumps", restSeconds: 90, notes: "Fokus pada pendaratan lembut tanpa lutut menekuk ke dalam." },
                          { id: "d3", name: "5-10-5 Pro Agility Shuttle", category: "Agility", sets: 3, reps: "2 reps", restSeconds: 120, notes: "Sentuh garis dengan tangan terdekat sebelum putar arah." },
                        ]).map((ex, idx) => {
                          const isDone = completedDrills[ex.id] ?? false;

                          return (
                            <div
                              key={ex.id}
                              onClick={() => toggleDrill(ex.id)}
                              className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                                isDone ? "bg-emerald-950/20" : "hover:bg-slate-900/60"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                    isDone
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-800 text-slate-400 border border-slate-700"
                                  }`}
                                >
                                  {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                                </div>

                                <div>
                                  <div className={`text-xs font-bold ${isDone ? "text-emerald-400 line-through" : "text-white"}`}>
                                    {ex.name}
                                  </div>
                                  {ex.category && (
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      Kategori: {ex.category}
                                    </span>
                                  )}
                                  {ex.notes && (
                                    <p className="text-[11px] text-slate-400 mt-1 italic leading-relaxed">
                                      💡 {ex.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right font-mono text-xs shrink-0">
                                <div className="font-extrabold text-sky-400">
                                  {ex.sets ? `${ex.sets} Sets` : ""} {ex.reps ? `× ${ex.reps}` : ""}
                                </div>
                                {ex.restSeconds && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Rest: {ex.restSeconds}s
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Schedule Cards */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sky-400" />
                      <span>Jadwal Sesi Mendatang</span>
                    </h2>

                    <div className="space-y-3">
                      {(upcomingSessions.length > 0 ? upcomingSessions : [
                        { id: "s1", title: "Speed & Power Training", startTime: "2026-09-04T16:00:00Z", endTime: "2026-09-04T17:30:00Z", status: "SCHEDULED" },
                        { id: "s2", title: "Agility & Change of Direction", startTime: "2026-09-06T16:00:00Z", endTime: "2026-09-06T17:30:00Z", status: "SCHEDULED" },
                        { id: "s3", title: "Endurance & Conditioning", startTime: "2026-09-09T16:00:00Z", endTime: "2026-09-09T17:30:00Z", status: "SCHEDULED" },
                      ]).map((s) => (
                        <div key={s.id} className="p-4 rounded-xl bg-[#060D1F] border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white text-sm">{s.title}</span>
                            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                              Terjadwal
                            </span>
                          </div>
                          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
                            <span className="text-white">
                              {new Date(s.startTime).toLocaleDateString("id-ID", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                            <span>·</span>
                            <span className="text-sky-400">
                              {new Date(s.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} – {new Date(s.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                            </span>
                            <span>·</span>
                            <span>Coach Zulfi</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Completed Sessions History */
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Riwayat Kehadiran Sesi Selesai</span>
                  </h2>

                  <div className="space-y-3">
                    {(sessionLogs.length > 0 ? sessionLogs : [
                      { id: "log-1", sessionTitle: "Agility & Core Stability", sessionDate: "2026-09-01", coachFeedback: "Fokus yang sangat baik pada cone drills. Pendaratan stabil." },
                      { id: "log-2", sessionTitle: "Sprint Acceleration 40M", sessionDate: "2026-08-28", coachFeedback: "Peningkatan dorongan langkah awal sangat terasa." },
                    ]).map((log) => (
                      <div key={log.id} className="p-4 rounded-xl bg-[#060D1F] border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white text-sm">{log.sessionTitle ?? "Sesi Latihan"}</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Selesai &amp; Hadir
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(log.sessionDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        {log.coachFeedback && (
                          <p className="text-xs text-slate-300 italic pt-1.5 border-t border-slate-800/80 mt-1">
                            &quot;{log.coachFeedback}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 4: PB HUB (PERSONAL BESTS & TARGET TRACKER)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "pb" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-800/60 pb-4">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-400" />
                  <span><span className="italic">Personal Best Hub &amp; Target Tracker</span></span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Papan rekor terbaik performa fisik pribadi dan target capaian terstruktur yang ditetapkan pelatih.
                </p>
              </div>

              {/* Target Tracker Section */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400" />
                  <span>Target Performa Aktif ({portalGoals.length > 0 ? portalGoals.length : 1})</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(portalGoals.length > 0 ? portalGoals : [
                    {
                      id: "g1",
                      testItemName: "40m Sprint Acceleration",
                      baselineValue: 4.21,
                      currentValue: 4.08,
                      targetValue: 3.95,
                      unit: "s",
                      progressPercent: 78,
                      targetDate: "2026-09-30",
                      title: "Fokus dorongan 10 meter awal dan sudut badan.",
                    },
                    {
                      id: "g2",
                      testItemName: "Vertical Jump Explosiveness",
                      baselineValue: 48,
                      currentValue: 52,
                      targetValue: 56,
                      unit: "cm",
                      progressPercent: 65,
                      targetDate: "2026-10-15",
                      title: "Maksimalkan arm swing dan triple extension.",
                    },
                  ]).map((goal) => (
                    <div key={goal.id} className="p-4 rounded-xl bg-[#060D1F] border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{goal.testItemName}</span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                          {goal.progressPercent}% Tercapai
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between font-mono text-xs text-slate-300">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Baseline</span>
                          <span>{goal.baselineValue} {goal.unit.toLowerCase()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Saat Ini</span>
                          <span className="font-bold text-white">{goal.currentValue ?? goal.baselineValue} {goal.unit.toLowerCase()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-400 block uppercase font-bold">Target</span>
                          <span className="font-bold text-amber-400">{goal.targetValue} {goal.unit.toLowerCase()}</span>
                        </div>
                      </div>

                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full"
                          style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                        />
                      </div>

                      {goal.title && (
                        <p className="text-[11px] text-slate-400 italic">
                          Catatan: {goal.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* All Personal Bests Grid */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-sky-400" />
                  <span>Daftar Rekor Fisik Resmi (<span className="italic">Personal Bests</span>)</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayPbs.map((pb) => (
                    <div
                      key={pb.testItemId}
                      className="p-4 rounded-xl bg-[#060D1F] border border-slate-800 space-y-2 hover:border-sky-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{pb.testItemName}</span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          PB
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-black text-white">
                          {pb.pbValue}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {pb.unit.toLowerCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                        <span>
                          {pb.achievedDate
                            ? new Date(pb.achievedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                            : "Baseline"}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          Tercatat Resmi
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 5: MORE (RECOVERY, FEEDBACK & ATHLETE PROFILE)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "more" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-800/60 pb-4">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Kebugaran, Bimbingan &amp; Profil Atlet
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Monitoring pemulihan fisik, riwayat masukan pelatih, dan biodata atlet.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. RPE & RECOVERY CARD */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-emerald-400" />
                      <span><span className="italic">RPE &amp; Recovery</span> (Pemulihan)</span>
                    </h2>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                      ● Good
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#060D1F] border border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-sky-400" />
                        <span className="italic">Sleep Duration</span>
                      </span>
                      <span className="font-mono font-bold text-white">8h 12m</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#060D1F] border border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-amber-400" />
                        <span className="italic">Daily RPE</span>
                      </span>
                      <span className="font-mono font-bold text-amber-400">4 / 10 (Optimal)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#060D1F] border border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Smile className="h-4 w-4 text-emerald-400" />
                        <span className="italic">Muscle Soreness</span>
                      </span>
                      <span className="font-bold text-white">Ringan (Mild)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#060D1F] border border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-indigo-400" />
                        <span className="italic">Training Load (7 Days)</span>
                      </span>
                      <span className="font-mono font-bold text-indigo-400">420 AU · Optimal</span>
                    </div>
                  </div>
                </div>

                {/* 2. ATHLETE PROFILE CARD */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-3">
                    <Avatar
                      src={profile.photoUrl ?? undefined}
                      fallback={profile.fullName.slice(0, 2).toUpperCase()}
                      size="lg"
                      alt={profile.fullName}
                      className="ring-2 ring-blue-500"
                    />
                    <div>
                      <h2 className="font-bold text-base text-white">{profile.fullName}</h2>
                      <p className="text-xs text-slate-400">{profile.sportCategory ?? "U-16 • Football"}</p>
                      <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400 mt-1 font-mono">
                        ID: YAP-00481
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Tanggal Lahir</span>
                      <span className="font-bold text-white">
                        {new Date(profile.dateOfBirth).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Tinggi Badan</span>
                      <span className="font-mono font-bold text-white">175 cm</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Berat Badan</span>
                      <span className="font-mono font-bold text-white">62 kg</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Kaki Dominan</span>
                      <span className="font-bold text-white">Kanan (Right)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Organisasi</span>
                      <span className="font-bold text-sky-400">{context.organizationName}</span>
                    </div>
                  </div>
                </div>

                {/* 3. COACH GUIDANCE FEED */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1426] border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-400" />
                      <span>Masukan &amp; Bimbingan Pelatih</span>
                    </h2>

                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        onClick={() => setFeedbackFilter("all")}
                        className={`px-2 py-0.5 rounded font-bold ${
                          feedbackFilter === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Semua
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {(guidances.length > 0 ? guidances : [
                      {
                        id: "g-1",
                        authorName: "Coach Zulfi",
                        createdAt: "2026-09-02",
                        content: "Peningkatan sangat signifikan pada kecepatan sprint dan daya ledak paha.",
                      },
                      {
                        id: "g-2",
                        authorName: "Coach Zulfi",
                        createdAt: "2026-08-26",
                        content: "Latihan hari ini bagus. Jaga konsistensi teknik pergantian arah saat intensitas tinggi.",
                      },
                    ]).map((g) => (
                      <div key={g.id} className="p-3.5 rounded-xl bg-[#060D1F] border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-sky-400" />
                            {g.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(g.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          &quot;{g.content}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ────────────────────────────────── */}
      <YapBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
