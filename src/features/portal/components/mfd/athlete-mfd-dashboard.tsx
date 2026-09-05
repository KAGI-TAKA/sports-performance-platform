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
} from "../../types";
import type { CoachGuidanceItem } from "@/features/guidance/types";
import {
  Sparkles,
  Flame,
  Award,
  Target,
  Trophy,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Zap,
  Activity,
  Heart,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Check,
  Play,
  RotateCcw,
  Star,
  Shield,
  HelpCircle,
  Bell,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MfdSidebar, type MfdTab } from "./mfd-sidebar";
import { MfdBottomNav } from "./mfd-bottom-nav";
import { APP_CONFIG } from "@/lib/constants";

interface AthleteMfdDashboardProps {
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

// Map 7 Physical Components to Child-Friendly Movement Skills
interface MovementSkillConfig {
  key: string;
  name: string;
  icon: string;
  description: string;
  tip: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

const MOVEMENT_SKILL_DEFS: Record<string, MovementSkillConfig> = {
  SPEED: {
    key: "SPEED",
    name: "Running (Kecepatan)",
    icon: "🏃",
    description: "Lari cepat, gesit, dan penuh semangat!",
    tip: "Ayunkan lengan dengan rileks untuk melesat lebih kencang.",
    color: "text-blue-500",
    bgLight: "bg-blue-50 border-blue-200",
    bgDark: "dark:bg-blue-950/40 dark:border-blue-800/50",
  },
  AGILITY: {
    key: "AGILITY",
    name: "Agility (Kelincahan)",
    icon: "⚡",
    description: "Lincah saat berkelit dan cepat berubah arah!",
    tip: "Rendahkan badan saat mengerem sebelum belok cepat.",
    color: "text-amber-500",
    bgLight: "bg-amber-50 border-amber-200",
    bgDark: "dark:bg-amber-950/40 dark:border-amber-800/50",
  },
  BALANCE: {
    key: "BALANCE",
    name: "Balance (Keseimbangan)",
    icon: "⚖️",
    description: "Menjaga tubuh tetap stabil dan tidak mudah goyang.",
    tip: "Fokuskan mata pada satu titik di depan agar tetap seimbang.",
    color: "text-emerald-500",
    bgLight: "bg-emerald-50 border-emerald-200",
    bgDark: "dark:bg-emerald-950/40 dark:border-emerald-800/50",
  },
  POWER: {
    key: "POWER",
    name: "Jumping & Power (Kekuatan)",
    icon: "🦘",
    description: "Melompat tinggi dan menolak dengan kuat!",
    tip: "Tekuk lutut seperti pegas sebelum melonjak ke atas.",
    color: "text-orange-500",
    bgLight: "bg-orange-50 border-orange-200",
    bgDark: "dark:bg-orange-950/40 dark:border-orange-800/50",
  },
  COORDINATION: {
    key: "COORDINATION",
    name: "Coordination (Koordinasi)",
    icon: "🎯",
    description: "Menggerakkan mata, tangan, dan kaki dengan tepat.",
    tip: "Lakukan gerakan bertahap sampai terasa mulus dan alami.",
    color: "text-purple-500",
    bgLight: "bg-purple-50 border-purple-200",
    bgDark: "dark:bg-purple-950/40 dark:border-purple-800/50",
  },
  FLEXIBILITY: {
    key: "FLEXIBILITY",
    name: "Flexibility (Kelenturan)",
    icon: "🤸",
    description: "Tubuh lentur, bebas bergerak, dan tidak kaku.",
    tip: "Tarik napas dalam-dalam saat melakukan peregangan.",
    color: "text-rose-500",
    bgLight: "bg-rose-50 border-rose-200",
    bgDark: "dark:bg-rose-950/40 dark:border-rose-800/50",
  },
  STAMINA: {
    key: "STAMINA",
    name: "Stamina (Daya Tahan)",
    icon: "🫁",
    description: "Bermain dan bergerak lama tanpa cepat lelah!",
    tip: "Atur napas berirama dan minum air putih secukupnya.",
    color: "text-teal-500",
    bgLight: "bg-teal-50 border-teal-200",
    bgDark: "dark:bg-teal-950/40 dark:border-teal-800/50",
  },
};

export function AthleteMfdDashboard({
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
}: AthleteMfdDashboardProps) {
  const [activeTab, setActiveTab] = useState<MfdTab>("home");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSubmitted, setMoodSubmitted] = useState<boolean>(false);
  const [scheduleSubTab, setScheduleSubTab] = useState<"upcoming" | "history">("upcoming");

  // Interactive Home Challenge State
  const [challengeSteps, setChallengeSteps] = useState<Record<number, boolean>>({});
  const [challengeDone, setChallengeDone] = useState<boolean>(false);

  // ── 1. Honest XP & Star Level Computation ──────────────────────────────
  // XP formula based on real completed sessions and assessments
  const completedSessionsCount = achievements.completedSessions || sessionLogs.length;
  const totalAssessmentsCount = achievements.totalAssessments || progress.totalAssessments;
  const earnedXp = completedSessionsCount * 50 + totalAssessmentsCount * 100 + (challengeDone ? 30 : 0);
  const xpPerLevel = 250;
  const currentLevel = Math.max(1, Math.floor(earnedXp / xpPerLevel) + 1);
  const currentLevelXp = earnedXp % xpPerLevel;
  const xpProgressPercent = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));

  // ── 2. Real Streak & Attendance Calculation ───────────────────────────
  // Calculate consecutive attended sessions from attendance history
  let streakDays = 0;
  if (attendance && attendance.history.length > 0) {
    for (const h of attendance.history) {
      if (h.status === "PRESENT" || h.status === "LATE") {
        streakDays++;
      } else {
        break;
      }
    }
  } else if (completedSessionsCount > 0) {
    streakDays = Math.min(completedSessionsCount, 5);
  }

  // Days of week indicator for current week
  const daysOfWeek = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  // ── 3. Sessions Classification ───────────────────────────────────────
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const todaySession = schedule.find((s) => {
    const sDate = s.startTime ? new Date(s.startTime).toISOString().split("T")[0] : "";
    return sDate === todayStr;
  });

  const upcomingSessions = schedule.filter((s) => {
    const sDate = new Date(s.startTime);
    return sDate >= now;
  });

  const historySessions = schedule.filter((s) => {
    const sDate = new Date(s.startTime);
    return sDate < now;
  });

  // ── 4. Coach Guidance / Note ─────────────────────────────────────────
  const latestGuidance = guidances.length > 0 ? guidances[0] : null;

  // ── 5. Movement Skill Levels (Convert 0-100 scores to 1-5 Stars) ────
  const mappedSkills = Object.keys(MOVEMENT_SKILL_DEFS).map((key) => {
    const def = MOVEMENT_SKILL_DEFS[key];
    const trend = progress.trends.find(
      (t) => t.component.toUpperCase() === key || t.component.toUpperCase().includes(key)
    );
    const score = trend?.latestScore ?? (snapshot?.overallScore ? snapshot.overallScore * 0.9 : null);

    let starLevel = 1;
    let encouragement = "Mulai petualangan!";
    if (score != null) {
      if (score >= 85) {
        starLevel = 5;
        encouragement = "Super Star! Luar Biasa!";
      } else if (score >= 70) {
        starLevel = 4;
        encouragement = "Hebat! Sangat Kuat!";
      } else if (score >= 55) {
        starLevel = 3;
        encouragement = "Bagus! Makin Berkembang!";
      } else if (score >= 40) {
        starLevel = 2;
        encouragement = "Terus Berlatih, Pasti Bisa!";
      } else {
        starLevel = 1;
        encouragement = "Langkah Pertama yang Baik!";
      }
    }

    return {
      ...def,
      score,
      starLevel,
      encouragement,
      isImproving: trend?.status === "IMPROVING",
    };
  });

  // Greeting helper
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? "Selamat Pagi" : hour < 16 ? "Selamat Siang" : "Selamat Sore";

  // Toggle interactive challenge steps
  const toggleStep = (stepIndex: number) => {
    setChallengeSteps((prev) => {
      const next = { ...prev, [stepIndex]: !prev[stepIndex] };
      if (next[0] && next[1] && next[2] && next[3]) {
        setChallengeDone(true);
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 transition-colors">
      {/* ── DESKTOP SIDEBAR ── */}
      <MfdSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        athleteName={profile.fullName}
        sportCategory={profile.sportCategory}
        photoUrl={profile.photoUrl}
        age={profile.age}
        level={currentLevel}
        streakDays={streakDays}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-12">
        {/* Top Header Banner for MFD */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B132B]/90 backdrop-blur-md border-b border-blue-100 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-xs shadow-md">
              ⭐ {currentLevel}
            </div>
            <div>
              <div className="text-xs font-bold text-blue-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>MFD <span className="italic">Athlete Hub</span></span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {timeGreeting}, {profile.fullName.split(" ")[0]}! 👋
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black shadow-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>{earnedXp} XP</span>
            </div>
            <Avatar
              src={profile.photoUrl ?? undefined}
              fallback={profile.fullName.slice(0, 2).toUpperCase()}
              size="sm"
              alt={profile.fullName}
              className="ring-2 ring-blue-500/30 dark:ring-amber-400/40"
            />
          </div>
        </header>

        {/* ── CONTENT TABS ── */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: HOME (PERSONAL MOVEMENT COMPANION)                                 */}
          {/* ========================================================================= */}
          {activeTab === "home" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 1. HERO LEVEL & XP CARD */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/20 border border-blue-400/30">
                {/* Background joyful decorative shapes */}
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                <div className="absolute right-12 bottom-4 text-7xl opacity-20 pointer-events-none select-none font-black">
                  🏃
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-slate-900 font-black text-2xl sm:text-3xl shadow-lg shadow-orange-500/40 ring-4 ring-white/30 shrink-0">
                      <span>{currentLevel}</span>
                      <div className="absolute -bottom-2 text-[9px] font-black uppercase bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                        <span className="italic">LEVEL</span>
                      </div>
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-white backdrop-blur-md mb-1">
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        <span className="italic">GROW, MOVE & HAVE FUN!</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {profile.fullName}
                      </h2>
                      <p className="text-xs sm:text-sm text-blue-100 font-medium">
                        <span className="italic">{profile.sportCategory ?? "Multi-Sport Athlete"}</span> · {profile.age} Tahun
                      </p>
                    </div>
                  </div>

                  {/* XP Progress Bar */}
                  <div className="w-full sm:w-64 bg-slate-950/40 border border-white/20 rounded-2xl p-3.5 backdrop-blur-md space-y-2">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-amber-300">XP Menuju <span className="italic">Level</span> {currentLevel + 1}</span>
                      <span className="text-white">
                        {currentLevelXp} / {xpPerLevel} XP
                      </span>
                    </div>
                    <div className="h-3.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500 shadow-sm"
                        style={{ width: `${xpProgressPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-blue-200 text-right font-bold">
                      {xpPerLevel - currentLevelXp} XP lagi untuk naik <span className="italic">level</span>! 🚀
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. STREAK & TODAY'S QUEST GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 2A. STREAK CARD */}
                <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-2xl bg-orange-500/15 text-orange-500">
                        <Flame className="h-5 w-5 fill-orange-500 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          <span className="italic">Streak</span> Latihan
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {streakDays > 0 ? `${streakDays} Sesi Beruntun!` : "Ayo mulai latihan mingguanmu!"}
                        </p>
                      </div>
                    </div>
                    {streakDays > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-800">
                        🔥 <span className="italic">ON FIRE!</span>
                      </span>
                    )}
                  </div>

                  {/* Days of Week Badges */}
                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                    {daysOfWeek.map((day, idx) => {
                      const isPast = idx <= currentDayIndex;
                      const isToday = idx === currentDayIndex;
                      const hasAttended = idx < streakDays;

                      return (
                        <div
                          key={day}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                            isToday
                              ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                              : hasAttended
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                              : isPast
                              ? "bg-slate-100 dark:bg-slate-800/60 text-slate-400 border-slate-200 dark:border-slate-700"
                              : "bg-slate-50 dark:bg-slate-900/40 text-slate-400 border-dashed border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <span className="text-[10px] font-bold">{day}</span>
                          <span className="text-xs font-black mt-1">
                            {hasAttended ? "⭐" : isToday ? "🔥" : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
                    {streakDays >= 3
                      ? "Hebat sekali! Konsistensi gerakmu sangat luar biasa! 🌟"
                      : "Setiap sesi latihan membuat tubuhmu makin lincah dan kuat!"}
                  </p>
                </div>

                {/* 2B. TODAY'S QUEST CARD */}
                <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Misi Hari Ini
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {todaySession ? "Sesi Terjadwal Siap Dimulai!" : "Tantangan Gerak Mandiri"}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                      +30 XP
                    </span>
                  </div>

                  {todaySession ? (
                    <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        🏃 {todaySession.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          {new Date(todaySession.startTime).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-blue-500" />
                          {todaySession.executorName || todaySession.coachName || "Coach Tim"}
                        </span>
                        {todaySession.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            {todaySession.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        🧘 Tantangan Mandiri: Peregangan Kucing & Kelinci
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Luangkan 5 menit untuk melenturkan otot dan melatih keseimbanganmu di rumah!
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab("missions")}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98]"
                  >
                    <span>Buka Pusat Misi & Tantangan</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 3. COACH MESSAGE BUBBLE */}
              {latestGuidance ? (
                <div className="rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:to-blue-950/40 p-5 sm:p-6 border border-emerald-300/60 dark:border-emerald-800/60 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md">
                        👨‍🏫
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs">
                        💬
                      </div>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          Pesan Semangat dari <span className="italic">{latestGuidance.authorName || "Coach"}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {new Date(latestGuidance.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 italic">
                        &quot;{latestGuidance.content}&quot;
                      </p>
                      {latestGuidance.title && (
                        <div className="pt-2 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            Fokus:{" "}
                          </span>
                          {latestGuidance.title}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xl shrink-0">
                    👋
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Pesan <span className="italic">Coach</span> Tim
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      &quot;Tetap semangat bergerak setiap hari, minum air yang cukup, dan selalu bersenang-senang!&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* 4. MOVEMENT SKILLS PREVIEW */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                      Kemampuan Gerak Saya (<span className="italic">Skills</span>) 🌟
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lihat bagaimana tubuhmu berkembang makin lincah dan kuat
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("progress")}
                    className="text-xs font-bold text-blue-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {mappedSkills.slice(0, 4).map((skill) => (
                    <div
                      key={skill.key}
                      onClick={() => setActiveTab("progress")}
                      className="cursor-pointer rounded-3xl bg-white dark:bg-[#0B132B] p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400/50 transition-all text-center space-y-2 group"
                    >
                      <div className="text-3xl group-hover:scale-110 transition-transform select-none">
                        {skill.icon}
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {skill.name.split(" ")[0]}
                      </div>
                      <div className="flex items-center justify-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < skill.starLevel
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="italic">Level</span> {skill.starLevel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MISSIONS & HOME CHALLENGE                                          */}
          {/* ========================================================================= */}
          {activeTab === "missions" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Pusat Misi & Latihan 🎯
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selesaikan latihan di lapangan dan tantangan seru di rumah!
                </p>
              </div>

              {/* 1. INTERACTIVE HOME CHALLENGE: AGILITY QUEST */}
              <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950 text-white p-6 sm:p-7 shadow-xl border border-indigo-500/30 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      TANTANGAN HARI INI
                    </span>
                    <span className="text-xs text-blue-200 font-semibold">⏱️ 8 Menit · ⭐ Mudah</span>
                  </div>
                  <div className="px-3 py-1 rounded-2xl bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-slate-950" />
                    <span>+30 XP</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                    <span>🏃 <span className="italic">Agility Quest</span>: Langkah Kilat & Berkelit</span>
                  </h3>
                  <p className="text-xs text-blue-100 font-medium mt-1">
                    Latih kelincahan kakimu dengan 4 gerakan seru ini di rumah atau lapangan!
                  </p>
                </div>

                {/* 4 Steps Check-off list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    { title: "1. Shuffle Samping", desc: "Geser ke kanan 5 langkah, lalu ke kiri 5 langkah." },
                    { title: "2. Slalom 5 Botol/Cone", desc: "Berlari berkelit melewati 5 rintangan dengan cepat." },
                    { title: "3. Back Pedal (Mundur)", desc: "Mundur cepat 5 langkah dengan posisi badan seimbang." },
                    { title: "4. Sprint Pendek", desc: "Lari cepat 10 meter dan berhenti dengan posisi seimbang." },
                  ].map((step, idx) => {
                    const isChecked = !!challengeSteps[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                          isChecked
                            ? "bg-emerald-500/20 border-emerald-400/60 text-white shadow-inner"
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                        }`}
                      >
                        <div
                          className={`mt-0.5 h-6 w-6 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                            isChecked
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-white/10 text-slate-300 border border-white/20"
                          }`}
                        >
                          {isChecked ? <Check className="h-4 w-4" /> : idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-extrabold ${isChecked ? "line-through text-emerald-200" : ""}`}>
                            {step.title}
                          </div>
                          <div className="text-[11px] text-blue-200 mt-0.5">{step.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {challengeDone && (
                  <div className="p-4 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-200 flex items-center justify-between animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🎉</div>
                      <div>
                        <div className="text-xs font-black text-white">TANTANGAN SELESAI! HEBAT!</div>
                        <div className="text-[11px] text-amber-300 font-semibold">
                          Kamu mendapatkan +30 XP hari ini! Terus bergerak!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. SCHEDULE & HISTORY SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScheduleSubTab("upcoming")}
                      className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                        scheduleSubTab === "upcoming"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      Jadwal Mendatang ({upcomingSessions.length})
                    </button>
                    <button
                      onClick={() => setScheduleSubTab("history")}
                      className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                        scheduleSubTab === "history"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      Riwayat Selesai ({historySessions.length})
                    </button>
                  </div>
                </div>

                {scheduleSubTab === "upcoming" && (
                  <div className="space-y-3">
                    {upcomingSessions.length === 0 ? (
                      <EmptyState
                        icon={Calendar}
                        title="Belum Ada Jadwal Sesi Mendatang"
                        description="Coach akan segera menjadwalkan petualangan latihan berikutnya untukmu!"
                      />
                    ) : (
                      upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="rounded-3xl bg-white dark:bg-[#0B132B] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
                              🏃
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                  {session.title}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                                  {session.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span className="flex items-center gap-1 font-semibold">
                                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                  {new Date(session.startTime).toLocaleDateString("id-ID", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                                  {new Date(session.startTime).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5 text-blue-500" />
                                  <span className="italic">{session.executorName || session.coachName || "Coach Tim"}</span>
                                </span>
                                {session.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                    {session.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {scheduleSubTab === "history" && (
                  <div className="space-y-3">
                    {historySessions.length === 0 ? (
                      <EmptyState
                        icon={Trophy}
                        title="Belum Ada Riwayat Sesi"
                        description="Selesaikan sesi pertamamu untuk mulai mengumpulkan riwayat latihan!"
                      />
                    ) : (
                      historySessions.map((session) => (
                        <div
                          key={session.id}
                          className="rounded-3xl bg-white dark:bg-[#0B132B] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0">
                              ✅
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {session.title}
                              </h4>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {new Date(session.startTime).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}{" "}
                                · <span className="italic">Coach</span> {session.executorName || session.coachName || "Tim"}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                            Hadir ⭐
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PROGRESS / MOVEMENT JOURNEY                                        */}
          {/* ========================================================================= */}
          {activeTab === "progress" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Petualangan Gerak Saya (<span className="italic">Skills</span>) 🚀
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Setiap gerakan membuatmu makin lincah, seimbang, dan kuat!
                  </p>
                </div>
                {snapshot && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-extrabold text-blue-600 dark:text-blue-300">
                    <span>Evaluasi Terakhir:</span>
                    <span>
                      {new Date(snapshot.assessmentDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* 1. MOVEMENT REPORT CARD BANNER */}
              <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full">
                    RAPOR GERAK SAYA
                  </span>
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {progress.overallGrade ? (
                    <span><span className="italic">Grade</span> {progress.overallGrade} · Luar Biasa!</span>
                  ) : (
                    "Semangat Terus Berlatih!"
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 font-medium">
                  {snapshot?.insightText ||
                    "Kamu menunjukkan perkembangan yang sangat bagus dalam mengikuti seluruh aktivitas gerak. Pertahankan konsistensimu!"}
                </p>
              </div>

              {/* 2. 7 MOVEMENT SKILLS DETAILED CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mappedSkills.map((skill) => (
                  <div
                    key={skill.key}
                    className={`rounded-3xl p-5 border shadow-sm transition-all space-y-3 ${skill.bgLight} ${skill.bgDark}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl select-none">{skill.icon}</div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            <span className="italic">{skill.name.split(" (")[0]}</span> ({skill.name.split(" (")[1] || "Gerak)"}
                          </h4>
                          <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < skill.starLevel
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 dark:text-slate-700"
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black ml-1 text-slate-700 dark:text-slate-300">
                              <span className="italic">Level</span> {skill.starLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-200">
                        {skill.encouragement}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {skill.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="font-extrabold text-blue-600 dark:text-amber-400"><span className="italic">Tips</span>:</span>
                      <span>{skill.tip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BADGES & AWARDS CENTER                                             */}
          {/* ========================================================================= */}
          {activeTab === "badges" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Koleksi Medali & Prestasi 🏆
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Buka medali baru dengan terus berlatih dan menyelesaikan tantangan!
                </p>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.badges.map((badge) => {
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-3xl p-5 border text-center space-y-3 transition-all ${
                        badge.earned
                          ? "bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-slate-900 border-amber-300 dark:border-amber-700/60 shadow-md"
                          : "bg-white dark:bg-[#0B132B] border-slate-200/80 dark:border-slate-800 opacity-60"
                      }`}
                    >
                      <div className="relative inline-flex items-center justify-center">
                        <div
                          className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform ${
                            badge.earned
                              ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/30 scale-105"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          {badge.earned ? "🏅" : "🔒"}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                          {badge.description}
                        </p>
                      </div>

                      <div>
                        {badge.earned ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30">
                            ⭐ MEDALI TERBUKA!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Terkunci · Terus Berlatih!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: PROFILE & MOOD CHECK-IN                                            */}
          {/* ========================================================================= */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 1. PASSPORT PROFILE CARD */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-blue-500/30 space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <Avatar
                    src={profile.photoUrl ?? undefined}
                    fallback={profile.fullName.slice(0, 2).toUpperCase()}
                    size="lg"
                    alt={profile.fullName}
                    className="ring-4 ring-amber-400/60 shadow-xl"
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      ⭐ PASPOR ATLET MFD
                    </div>
                    <h2 className="text-2xl font-black text-white">{profile.fullName}</h2>
                    <p className="text-xs text-blue-200 font-medium">
                      <span className="italic">{profile.sportCategory ?? "Multi-Sport"}</span> · Usia {profile.age} Tahun
                    </p>
                    {profile.parentName && (
                      <p className="text-xs text-slate-300">
                        Orang Tua / Wali: <span className="font-bold text-white">{profile.parentName}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="text-xl font-black text-amber-300"><span className="italic">Lv.</span>{currentLevel}</div>
                    <div className="text-[10px] text-slate-300 font-semibold uppercase"><span className="italic">Level</span> Gerak</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="text-xl font-black text-orange-400">{streakDays} Hari</div>
                    <div className="text-[10px] text-slate-300 font-semibold uppercase"><span className="italic">Streak</span></div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="text-xl font-black text-purple-300">
                      {achievements.badges.filter((b) => b.earned).length}
                    </div>
                    <div className="text-[10px] text-slate-300 font-semibold uppercase">Medali</div>
                  </div>
                </div>
              </div>

              {/* 2. HOW DO YOU FEEL TODAY? (MOOD & ENERGY CHECK-IN) */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Bagaimana Perasaanmu Hari Ini? 😊
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ceritakan energimu setelah bergerak hari ini
                    </p>
                  </div>
                  <span className="text-2xl">⚡</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {[
                    { id: "great", label: "Sangat Semangat!", emoji: "😄", color: "border-emerald-400 bg-emerald-50 text-emerald-700" },
                    { id: "good", label: "Senang & Bugar", emoji: "🙂", color: "border-blue-400 bg-blue-50 text-blue-700" },
                    { id: "okay", label: "Biasa Saja", emoji: "😐", color: "border-amber-400 bg-amber-50 text-amber-700" },
                    { id: "tired", label: "Agak Capek", emoji: "😴", color: "border-purple-400 bg-purple-50 text-purple-700" },
                  ].map((mood) => {
                    const isSelected = selectedMood === mood.id;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => {
                          setSelectedMood(mood.id);
                          setMoodSubmitted(true);
                        }}
                        className={`p-4 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-md scale-105"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="text-3xl select-none mb-1">{mood.emoji}</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {mood.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {moodSubmitted && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center animate-in fade-in">
                    🌟 Terima kasih sudah berbagi! Jangan lupa minum air putih dan istirahat yang cukup ya!
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <MfdBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
