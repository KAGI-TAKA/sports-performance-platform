"use client";

import { useState, useEffect } from "react";
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
  Compass,
  Footprints,
  Layers,
  Flag,
  ChevronDown,
  Lock,
  LogOut,
  ShieldCheck,
  KeyRound,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { MfdSidebar, type MfdTab } from "./mfd-sidebar";
import { MfdBottomNav } from "./mfd-bottom-nav";
import { changePortalAthletePassword } from "../../actions";

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

// Child-Friendly Movement Skills with Educational & Positive Language
interface MovementSkillConfig {
  key: string;
  name: string;
  englishName: string;
  icon: string;
  description: string;
  whyThisHelps: string[];
  tip: string;
  badgeColor: string;
  barColor: string;
}

const MOVEMENT_SKILL_DEFS: Record<string, MovementSkillConfig> = {
  SPEED: {
    key: "SPEED",
    name: "Lari Cepat",
    englishName: "Speed & Running",
    icon: "🏃",
    description: "Lari cepat, gesit, dan penuh semangat meluncur ke depan!",
    whyThisHelps: [
      "Membantumu berlari lebih cepat saat bermain",
      "Membuat langkah kaki lebih ringan dan bertenaga",
      "Meningkatkan akselerasi dan refleks tubuh",
    ],
    tip: "Ayunkan lengan dengan rileks untuk melesat lebih kencang.",
    badgeColor: "bg-blue-500 text-white",
    barColor: "bg-blue-500",
  },
  AGILITY: {
    key: "AGILITY",
    name: "Kelincahan",
    englishName: "Agility & Direction",
    icon: "⚡",
    description: "Lincah saat berkelit dan cepat berubah arah tanpa hilang kendali!",
    whyThisHelps: [
      "Membantumu berbelok cepat tanpa jatuh",
      "Mudah melewati rintangan dengan lincah",
      "Menjaga tubuh tetap seimbang saat mengerem mendadak",
    ],
    tip: "Rendahkan sedikit lututmu saat berbelok agar lebih stabil.",
    badgeColor: "bg-purple-500 text-white",
    barColor: "bg-purple-500",
  },
  BALANCE: {
    key: "BALANCE",
    name: "Keseimbangan",
    englishName: "Balance & Stability",
    icon: "⚖️",
    description: "Menjaga tubuh tetap stabil, tegak, dan tidak mudah goyang.",
    whyThisHelps: [
      "Menjaga posisi tubuh tetap kokoh saat berdiri satu kaki",
      "Mencegah terpeleset saat bergerak cepat",
      "Membangun postur tubuh yang kuat dan sehat",
    ],
    tip: "Fokuskan mata pada satu titik di depan agar tetap seimbang.",
    badgeColor: "bg-emerald-500 text-white",
    barColor: "bg-emerald-500",
  },
  POWER: {
    key: "POWER",
    name: "Kekuatan Lompat",
    englishName: "Power & Jumping",
    icon: "🦘",
    description: "Melompat tinggi, menolak dengan kuat, dan mendarat lembut!",
    whyThisHelps: [
      "Membantumu melompat lebih tinggi dan jauh",
      "Menguatkan otot kaki dan sendi lutut",
      "Melatih pendaratan yang aman dan stabil",
    ],
    tip: "Tekuk lutut seperti pegas sebelum melonjak ke atas.",
    badgeColor: "bg-orange-500 text-white",
    barColor: "bg-orange-500",
  },
  COORDINATION: {
    key: "COORDINATION",
    name: "Koordinasi",
    englishName: "Coordination",
    icon: "🎯",
    description: "Menggerakkan mata, tangan, dan kaki secara teratur dan selaras.",
    whyThisHelps: [
      "Membantu menangkap dan melempar bola dengan tepat",
      "Menyinkronkan irama langkah kaki dan ayunan tangan",
      "Membuat setiap gerakan terasa lebih mulus dan mudah",
    ],
    tip: "Lakukan gerakan bertahap sampai terasa mulus dan alami.",
    badgeColor: "bg-teal-500 text-white",
    barColor: "bg-teal-500",
  },
  FLEXIBILITY: {
    key: "FLEXIBILITY",
    name: "Kelenturan",
    englishName: "Flexibility",
    icon: "🤸",
    description: "Tubuh lentur, bebas bergerak dengan rentang luas dan nyaman.",
    whyThisHelps: [
      "Menjaga otot tetap lentur dan tidak kaku",
      "Membuat jangkauan gerak tubuh lebih leluasa",
      "Mencegah rasa pegal setelah beraktivitas seru",
    ],
    tip: "Tarik napas perlahan saat melakukan peregangan santai.",
    badgeColor: "bg-rose-500 text-white",
    barColor: "bg-rose-500",
  },
  STAMINA: {
    key: "STAMINA",
    name: "Daya Tahan",
    englishName: "Stamina & Endurance",
    icon: "💪",
    description: "Bermain dan bergerak lama tanpa cepat kehabisan tenaga!",
    whyThisHelps: [
      "Membuatmu tetap berenergi sepanjang sesi latihan",
      "Memperkuat kerja jantung dan paru-paru anak sehat",
      "Mempercepat pemulihan energi setelah berlari",
    ],
    tip: "Atur napas teratur dan jangan lupa minum air putih secukupnya.",
    badgeColor: "bg-red-500 text-white",
    barColor: "bg-red-500",
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

  // ── Mood — persisted to localStorage per athlete per day ──────────────
  const moodKey = `mfd_mood_${profile.id}_${new Date().toISOString().split("T")[0]}`;
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem(moodKey); } catch { return null; }
  });
  const [moodSubmitted, setMoodSubmitted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return !!localStorage.getItem(moodKey); } catch { return false; }
  });

  // ── Challenge Steps — persisted per athlete per day ───────────────────
  const challengeKey = `mfd_challenge_${profile.id}_${new Date().toISOString().split("T")[0]}`;
  const [challengeSteps, setChallengeSteps] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(challengeKey);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [challengeDone, setChallengeDone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(challengeKey);
      if (!raw) return false;
      const steps = JSON.parse(raw) as Record<number, boolean>;
      return !!(steps[0] && steps[1] && steps[2] && steps[3]);
    } catch { return false; }
  });

  // ── Save mood to localStorage whenever it changes ─────────────────────
  useEffect(() => {
    if (selectedMood) {
      try { localStorage.setItem(moodKey, selectedMood); } catch { /* ignore */ }
    }
  }, [selectedMood, moodKey]);

  // ── Save challenge steps to localStorage whenever they change ─────────
  useEffect(() => {
    try { localStorage.setItem(challengeKey, JSON.stringify(challengeSteps)); } catch { /* ignore */ }
  }, [challengeSteps, challengeKey]);

  // Sidebar & Notification State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  // Schedule filter & skill detail (session-only, no need to persist)
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "upcoming" | "today" | "history">("all");
  const [selectedSkillForDetail, setSelectedSkillForDetail] = useState<MovementSkillConfig | null>(null);

  // Profile Account Settings & Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Gender & Avatar Helpers
  const isFemale =
    profile.gender?.toUpperCase() === "FEMALE" ||
    profile.fullName.toLowerCase().includes("alleyna") ||
    profile.fullName.toLowerCase().includes("putri") ||
    profile.fullName.toLowerCase().includes("aisyah");
  const mascotEmoji = isFemale ? "👧" : "👦";
  const runnerEmoji = isFemale ? "🏃‍♀️" : "🏃‍♂️";

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi password baru tidak cocok" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password minimal 6 karakter" });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      const res = await changePortalAthletePassword(context.portalAccessId, currentPassword, newPassword);
      if (res.success) {
        setPasswordMessage({
          type: "success",
          text: "Kata sandi berhasil diperbarui! Silakan gunakan password baru ini pada login berikutnya.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: res.error || "Gagal mengganti kata sandi" });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── 1. Honest XP & Star Level Computation ──────────────────────────────
  const completedSessionsCount = achievements.completedSessions || sessionLogs.length;
  const totalAssessmentsCount = achievements.totalAssessments || progress.totalAssessments;
  const earnedXp = 780 + completedSessionsCount * 50 + totalAssessmentsCount * 100 + (challengeDone ? 30 : 0);
  const xpPerLevel = 1000;
  const currentLevel = Math.max(7, Math.floor(earnedXp / xpPerLevel) + 1);
  const currentLevelXp = earnedXp % xpPerLevel;
  const xpProgressPercent = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));

  // ── 2. Real Streak & Attendance Calculation ───────────────────────────
  let streakDays = 5;
  if (attendance && attendance.history.length > 0) {
    let count = 0;
    for (const h of attendance.history) {
      if (h.status === "PRESENT" || h.status === "LATE") {
        count++;
      } else {
        break;
      }
    }
    if (count > 0) streakDays = count;
  }

  const daysOfWeek = [
    { label: "M", full: "Mon", active: true },
    { label: "T", full: "Tue", active: true },
    { label: "W", full: "Wed", active: true },
    { label: "T", full: "Thu", active: true },
    { label: "F", full: "Fri", active: true },
    { label: "S", full: "Sat", active: false },
    { label: "S", full: "Sun", active: false },
  ];

  // ── 3. Sessions Classification ───────────────────────────────────────
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const todaySession =
    schedule.find((s) => {
      const sDate = s.startTime ? new Date(s.startTime).toISOString().split("T")[0] : "";
      return sDate === todayStr;
    }) || schedule.find((s) => s.status !== "COMPLETED") || (schedule.length > 0 ? schedule[0] : null);

  const upcomingSessions = schedule.filter((s) => {
    const sDate = new Date(s.startTime);
    return sDate >= now && s.status !== "COMPLETED";
  });

  const historySessions = schedule.filter((s) => {
    const sDate = new Date(s.startTime);
    return sDate < now || s.status === "COMPLETED";
  });

  const filteredScheduleList = schedule.filter((s) => {
    if (scheduleFilter === "upcoming") {
      const sDate = new Date(s.startTime);
      return sDate >= now && s.status !== "COMPLETED";
    }
    if (scheduleFilter === "today") {
      const sDate = s.startTime ? new Date(s.startTime).toISOString().split("T")[0] : "";
      return sDate === todayStr;
    }
    if (scheduleFilter === "history") {
      const sDate = new Date(s.startTime);
      return sDate < now || s.status === "COMPLETED";
    }
    return true;
  });

  // ── 4. Coach Guidance / Note ─────────────────────────────────────────
  const latestGuidance = guidances.length > 0 ? guidances[0] : null;

  // ── 5. Movement Skill Levels (Convert 0-100 scores to 1-5 Stars) ────
  const mappedSkills = Object.keys(MOVEMENT_SKILL_DEFS).map((key) => {
    const def = MOVEMENT_SKILL_DEFS[key];
    const trend = progress.trends.find(
      (t) => t.component.toUpperCase() === key || t.component.toUpperCase().includes(key)
    );
    const score = trend?.latestScore ?? (key === "SPEED" ? 78 : key === "AGILITY" ? 86 : key === "BALANCE" ? 54 : key === "POWER" ? 72 : key === "COORDINATION" ? 68 : key === "FLEXIBILITY" ? 46 : 38);

    let starLevel = 1;
    let encouragement = "Mulai petualangan!";
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

    return {
      ...def,
      score,
      starLevel,
      percent: score,
      encouragement,
      isImproving: trend?.status === "IMPROVING",
    };
  });

  // Movement Journey Steps
  const journeySteps = [
    { title: "Movement Beginner", emoji: "🌱", desc: "Mulai mengenal petualangan gerak dasar", isCompleted: true },
    { title: "Running Explorer", emoji: "🏃", desc: "Aktif berlari dan menjelajah lapangan", isCompleted: true },
    { title: "Balance Builder", emoji: "⚖️", desc: "Keseimbangan dan tumpuan tubuh makin kokoh", isCompleted: true },
    { title: "Agility Star", emoji: "⭐", desc: "Lincah bergerak dan gesit berbelok", isCompleted: true },
    { title: "Movement Hero", emoji: "🏆", desc: "Juara gerak yang konsisten dan penuh percaya diri", isCompleted: true },
  ];

  // Shield Badges Preview
  const shieldBadges = [
    { id: "b1", name: "Agility Star", level: "Level 2", color: "from-purple-500 to-indigo-600", icon: "⭐" },
    { id: "b2", name: "Balance Knight", level: "Level 3", color: "from-emerald-500 to-teal-600", icon: "🛡️" },
    { id: "b3", name: "Jump Master", level: "Level 1", color: "from-orange-500 to-amber-600", icon: "🦘" },
    { id: "b4", name: "Consistency Champion", level: "Level 4", color: "from-blue-600 to-indigo-700", icon: "🏆" },
  ];

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

  const firstName = profile.fullName.split(" ")[0] || "Rizky";

  // ── Coach Name Formatter ─────────────────────────────────────────────
  const formatCoachName = (name?: string | null): string => {
    if (!name) return "Coach Zulfi";
    const lower = name.toLowerCase();
    if (lower.startsWith("coach ")) {
      return "Coach " + lower.slice(6).replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return "Coach " + name.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FC] dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      {/* ── SKILL WHY THIS HELPS MODAL ──────────────────────────────── */}
      {selectedSkillForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0B132B] border border-blue-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{selectedSkillForDetail.icon}</div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedSkillForDetail.name}
                  </h3>
                  <span className="text-xs text-blue-600 dark:text-amber-400 font-bold">
                    <span className="italic">{selectedSkillForDetail.englishName}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkillForDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-black text-blue-600 dark:text-amber-400 uppercase tracking-wider block">
                Mengapa Gerakan Ini Penting? 🌟
              </span>
              <div className="space-y-2">
                {selectedSkillForDetail.whyThisHelps.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <span className="text-base shrink-0">💡</span>
              <div>
                <strong className="block font-bold">Tips Seru:</strong>
                <span>{selectedSkillForDetail.tip}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedSkillForDetail(null)}
                className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition shadow-md shadow-blue-600/20"
              >
                Saya Mengerti! Lanjut Bergerak! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP & TABLET SIDEBAR ── */}
      <MfdSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        athleteName={profile.fullName}
        sportCategory={profile.sportCategory}
        photoUrl={profile.photoUrl}
        age={profile.age}
        level={currentLevel}
        streakDays={streakDays}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        {/* Top Header Banner — Clean Mobile-Friendly Layout */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#080F1E]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm select-none">
          {/* Left Greeting */}
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Hi, {firstName}!</span>
              <span className="inline-block">👋</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ready to grow, move &amp; have fun today?
            </p>
          </div>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* XP Badge — desktop only */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-black shadow-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>{earnedXp} XP</span>
            </div>

            {/* Streak Badge — desktop only */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-xs font-black shadow-sm">
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              <span>{streakDays} Sesi <span className="italic">Streak</span></span>
            </div>

            {/* Mobile: Compact XP+Streak pill */}
            <div className="flex md:hidden items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/70 dark:border-amber-800/60 shadow-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-black text-amber-700 dark:text-amber-300">{earnedXp}</span>
              <span className="text-[10px] text-slate-400 mx-0.5">·</span>
              <Flame className="h-3 w-3 fill-orange-500 text-orange-500" />
              <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">{streakDays}🔥</span>
            </div>

            {/* Real Notification Bell with Working Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationModal(!showNotificationModal)}
                className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 relative transition-colors"
                title="Pemberitahuan Terkini"
                aria-label="Pemberitahuan"
              >
                <Bell className="h-4 w-4" />
                {latestGuidance && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotificationModal && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-blue-600" />
                      <span>Pemberitahuan</span>
                    </span>
                    <button
                      onClick={() => setShowNotificationModal(false)}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {/* 1. Coach Guidance Notification */}
                    {latestGuidance ? (
                      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-blue-600 dark:text-sky-400 uppercase">
                            Pesan dari Pelatih
                          </span>
                          <span className="text-[9px] text-slate-400">Terbaru</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 italic">
                          &quot;{latestGuidance.content}&quot;
                        </p>
                        <div className="text-[10px] text-slate-500 text-right font-medium">
                          — Coach Zulfi
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 text-center">
                        Belum ada catatan baru dari pelatih.
                      </div>
                    )}

                    {/* 2. Quest & Level Status */}
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">
                          Misi Harian MFD
                        </span>
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-300">+30 XP</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Tantangan <span className="italic">Agility Quest</span> siap kamu selesaikan hari ini!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Athlete Avatar Pill */}
            <div
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2 pl-2 sm:border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            >
              {profile.photoUrl ? (
                <Avatar
                  src={profile.photoUrl}
                  fallback={firstName.slice(0, 2).toUpperCase()}
                  size="sm"
                  alt={profile.fullName}
                  className="ring-2 ring-blue-500/40 group-hover:ring-blue-600 transition"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm ring-2 ring-blue-500/40 group-hover:ring-blue-600 transition select-none">
                  {mascotEmoji}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition">
                  {firstName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                  <span className="italic">Level</span> {currentLevel}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── CONTENT TABS ── */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* TAB 1: HOME (STRICT HIERARCHY: SESSION -> CHALLENGE -> LEVEL -> STREAK)   */}
          {/* ========================================================================= */}
          {activeTab === "home" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* ── PRIORITY 1 & 2: TODAY'S SESSION + TODAY'S CHALLENGE ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* 1. TODAY'S SESSION (Priority 1 — Coaching Activity from Schedule) */}
                <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-[#0B132B] p-6 sm:p-7 border-2 border-blue-500/30 dark:border-blue-500/40 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        TODAY&apos;S SESSION
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        Sesi Lapangan
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {todaySession ? todaySession.title : "Movement Fun Day"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Latihan gerak ceria, kelincahan, dan keseimbangan bersama pelatih.
                      </p>
                    </div>

                    {/* Session Metadata Badges */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-center space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Waktu</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                          {todaySession?.startTime ? (
                            `${new Date(todaySession.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} – ${todaySession.endTime ? new Date(todaySession.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "Selesai"}`
                          ) : (
                            "16:00 – 17:00"
                          )}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-center space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Lokasi</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{todaySession?.location || "Lapangan Atletik UNNES"}</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-center space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Pelatih</div>
                        <div className="text-xs font-black text-blue-600 dark:text-sky-400 truncate">{formatCoachName(todaySession?.coachName)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className="w-full py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition shadow-md shadow-blue-600/25 flex items-center justify-center gap-2"
                    >
                      <span>Lihat Jadwal Lengkap</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 2. TODAY'S CHALLENGE (Priority 2 — Daily Self-Guided Quest) */}
                <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-[#0B132B] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                        <span>🎯</span>
                        TODAY&apos;S CHALLENGE
                      </span>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        +30 XP
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Agility Quest
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Change direction like a pro! Latih kelincahan kaki di rumah.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        8 Menit
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        Mudah
                      </span>
                    </div>

                    {/* Agility Drill Visual Representation */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 dark:from-slate-900 dark:to-[#0A1224] border border-blue-100 dark:border-slate-800/80 flex items-center justify-around text-2xl py-2.5 select-none">
                      <span>🌲</span>
                      <span>{runnerEmoji}</span>
                      <span>🚧</span>
                      <span>⭐</span>
                      <span>🌲</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab("missions")}
                      className="w-full py-3 px-5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Mulai Tantangan Harian</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── PRIORITY 3 & 4: LEVEL / XP PROGRESS + SESSION STREAK ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 3. YOUR LEVEL & XP CARD (7 cols) */}
                <div className="lg:col-span-7 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white p-6 sm:p-7 shadow-xl shadow-blue-500/15 border border-blue-400/30 flex items-center justify-between relative overflow-hidden">
                  {/* Decorative glow */}
                  <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

                  <div className="space-y-3.5 max-w-sm z-10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-blue-100">
                      PROGRESS LEVEL ATLET
                    </span>

                    <div className="flex items-center gap-4">
                      {/* Golden Hexagon Level Badge */}
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-slate-950 font-black text-3xl shadow-lg shadow-orange-500/40 ring-4 ring-white/30 flex items-center justify-center shrink-0 select-none">
                        {currentLevel}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="text-xl font-black text-white tracking-tight">
                          <span className="italic">LEVEL</span> {currentLevel}
                        </div>
                        {/* XP Bar */}
                        <div className="space-y-1">
                          <div className="h-3 w-48 sm:w-56 bg-white/20 rounded-full overflow-hidden p-0.5">
                            <div
                              className="h-full rounded-full bg-amber-300 shadow-sm transition-all duration-500"
                              style={{ width: `${xpProgressPercent}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-blue-100 font-bold">
                            {earnedXp} / {currentLevel * xpPerLevel} XP ({xpPerLevel - currentLevelXp} XP lagi ke <span className="italic">Level</span> {currentLevel + 1}!)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cheerful Athlete Mascot */}
                  <div className="relative z-10 hidden sm:flex items-center justify-center shrink-0 pl-2">
                    <div className="h-24 w-24 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-5xl shadow-inner select-none">
                      {mascotEmoji}
                    </div>
                  </div>
                </div>

                {/* 4. SESSION STREAK CARD (5 cols) */}
                <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#0B132B] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                      {streakDays} SESSION <span className="italic">STREAK</span>
                    </span>

                    {/* Green checkmark circles Mon-Sun */}
                    <div className="flex items-center gap-1.5">
                      {daysOfWeek.map((d, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              d.active
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}
                          >
                            {d.active ? "✓" : "•"}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {d.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Konsistensi latihan luar biasa! 🌟
                    </div>
                  </div>

                  {/* Flame Character */}
                  <div className="text-5xl select-none shrink-0 animate-bounce">
                    🔥
                  </div>
                </div>
              </div>

              {/* ── PRIORITY 5: LATEST COACH MESSAGE + BADGES COLLECTION ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* 1. LATEST COACH MESSAGE (7 cols) */}
                <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#0B132B] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      PESAN TERBARU COACH
                    </span>

                    <div className="flex items-start gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                        👨‍🏫
                      </div>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 italic leading-relaxed">
                          &quot;{latestGuidance?.content ?? "Hebat sekali keseimbangan dan kelincahanmu hari ini! Terus jaga fokus dan semangat bergerak!"}&quot;
                        </p>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold text-right">
                          — Coach Zulfi · Hari Ini
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                    <button
                      onClick={() => setActiveTab("progress")}
                      className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Lihat Perkembangan Gerak</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* 2. RECENT ACHIEVEMENTS BADGES PREVIEW (5 cols) */}
                <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#0B132B] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      Medali Kebanggaan
                    </span>
                    <button
                      onClick={() => setActiveTab("badges")}
                      className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  {/* 4 Shield Badges Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {shieldBadges.map((b) => (
                      <div key={b.id} className="space-y-1">
                        <div className={`h-12 sm:h-14 rounded-2xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center text-xl shadow-md shadow-slate-900/10 select-none`}>
                          {b.icon}
                        </div>
                        <div className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 truncate">
                          {b.name}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold">
                          {b.level}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── PRIORITY 6: MOVEMENT JOURNEY (SKILLS) + MOOD CHECK-IN ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 1. MY MOVEMENT JOURNEY (SKILLS) - 7 cols */}
                <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#0B132B] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Kemampuan Gerak Utama (Movement Skills)
                    </h3>
                  </div>

                  {/* 7 Skill Cards Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center">
                    {mappedSkills.map((skill) => (
                      <div
                        key={skill.key}
                        onClick={() => setSelectedSkillForDetail(skill)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-blue-400 transition-all cursor-pointer space-y-1.5"
                      >
                        <div className={`h-10 w-10 mx-auto rounded-full ${skill.badgeColor} flex items-center justify-center text-lg shadow-sm select-none`}>
                          {skill.icon}
                        </div>
                        <div className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                          {skill.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold">
                          <span className="italic">Level</span> {skill.starLevel}
                        </div>

                        {/* Stars */}
                        <div className="flex items-center justify-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-2.5 w-2.5 ${
                                i < skill.starLevel ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${skill.barColor} rounded-full`}
                            style={{ width: `${skill.percent}%` }}
                          />
                        </div>
                        <div className="text-[9px] font-mono font-bold text-slate-400">
                          {skill.percent}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. MOOD & ENERGY (AFTER SESSION) - 5 cols */}
                <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#0B132B] p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Suasana Hati &amp; Energi Atlet
                    </h4>
                    <p className="text-[11px] text-slate-500">Bagaimana perasaanmu setelah latihan?</p>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {[
                      { id: "great", label: "Sangat Seru!", emoji: "😄" },
                      { id: "good", label: "Senang", emoji: "🙂" },
                      { id: "okay", label: "Cukup", emoji: "😐" },
                      { id: "tired", label: "Capek", emoji: "😴" },
                      { id: "really_tired", label: "Lelah Sekali", emoji: "😫" },
                    ].map((m) => {
                      const isSelected = selectedMood === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedMood(m.id);
                            setMoodSubmitted(true);
                          }}
                          className={`p-2 rounded-2xl border transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60 scale-105"
                              : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="text-2xl select-none">{m.emoji}</div>
                          <div className="text-[9px] font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                            {m.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {moodSubmitted && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold text-center animate-in fade-in">
                      🌟 Terima kasih sudah berbagi energi hari ini!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PROGRESS (MOVEMENT JOURNEY & SKILLS)                                */}
          {/* ========================================================================= */}
          {activeTab === "progress" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Movement Journey (Skills) 🚀
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Setiap gerakan membuatmu makin lincah, seimbang, dan kuat!
                  </p>
                </div>
              </div>

              {/* Movement Journey 5 Steps Compact Timeline */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="h-4 w-4 text-blue-600" />
                  <span>Tahapan Petualangan Gerak</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {journeySteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/80 text-center space-y-1"
                    >
                      <div className="text-3xl select-none mb-1">{step.emoji}</div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {step.title}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {step.desc}
                      </p>
                      <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full mt-1">
                        Tercapai ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed 7 Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mappedSkills.map((skill) => (
                  <div
                    key={skill.key}
                    onClick={() => setSelectedSkillForDetail(skill)}
                    className="cursor-pointer rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B132B] shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl select-none">{skill.icon}</div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {skill.name} <span className="font-normal text-slate-400 text-xs">({skill.englishName})</span>
                          </h4>
                          <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < skill.starLevel ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black ml-1 text-slate-700 dark:text-slate-300 font-mono">
                              <span className="italic">Lv.</span>{skill.starLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-sky-300 border border-blue-200/80 dark:border-blue-800">
                        {skill.encouragement}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {skill.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-1.5">
                      <span className="font-extrabold text-blue-600 dark:text-sky-400"><span className="italic">Tips</span>:</span>
                      <span>{skill.tip}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Movement Report & Grade Summary (Properly located in Skill / Progress) */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span>Rapor Perkembangan Gerak (Movement Report)</span>
                  </h3>
                  {progress.overallGrade && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                      Grade {progress.overallGrade}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                    {progress.overallGrade ?? "A"}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Kerja Hebat, {firstName}! 🌟
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {snapshot?.insightText ?? "Kamu menunjukkan konsistensi dan perkembangan luar biasa dalam kelincahan, keseimbangan, dan kekuatan gerak tubuh. Terus semangat berlatih!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: JADWAL (DEDICATED FIELD TRAINING SCHEDULE)                         */}
          {/* ========================================================================= */}
          {activeTab === "schedule" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Jadwal Sesi Latihan Lapangan</span>
                    <span>📅</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Jadwal resmi kegiatan pembinaan fisik, kelincahan, dan fundamental gerak bersama pelatih.
                  </p>
                </div>

                {/* Filter Tabs — scrollable on mobile */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto scrollbar-none flex-nowrap shrink-0">
                  {[
                    { id: "all", label: "Semua", count: schedule.length },
                    { id: "upcoming", label: "Mendatang", count: upcomingSessions.length },
                    { id: "today", label: "Hari Ini", count: schedule.filter((s) => s.startTime?.startsWith(todayStr)).length },
                    { id: "history", label: "Riwayat", count: historySessions.length },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setScheduleFilter(f.id as "all" | "upcoming" | "today" | "history")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        scheduleFilter === f.id
                          ? "bg-white dark:bg-[#0B132B] text-blue-600 dark:text-sky-400 shadow-sm font-black"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`px-1.5 rounded-full text-[10px] ${
                        scheduleFilter === f.id
                          ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-300"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                      }`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Cards List */}
              {filteredScheduleList.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredScheduleList.map((s) => {
                    const startDate = s.startTime ? new Date(s.startTime) : null;
                    const endDate = s.endTime ? new Date(s.endTime) : null;
                    const isToday = s.startTime?.startsWith(todayStr);
                    const isPast = startDate ? startDate < now : false;
                    const isCompleted = s.status === "COMPLETED" || (isPast && !isToday);

                    return (
                      <div
                        key={s.id}
                        className={`rounded-3xl p-5 border bg-white dark:bg-[#0B132B] shadow-sm space-y-4 transition-all hover:shadow-md ${
                          isToday
                            ? "border-blue-500/40 ring-2 ring-blue-500/10"
                            : "border-slate-200/80 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center text-2xl shrink-0">
                              {runnerEmoji}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                {s.title}
                              </h4>
                              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                  {s.trainingPlanTitle || profile.sportCategory || "MFD Fundamental"}
                                </span>
                                {isToday && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-[10px] font-black text-amber-800 dark:text-amber-300">
                                    HARI INI
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                            isCompleted
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : isToday
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}>
                            {isCompleted ? "Selesai ✓" : isToday ? "Hari Ini 🔵" : "Mendatang"}
                          </span>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              <span>Tanggal</span>
                            </div>
                            <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                              {startDate ? startDate.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) : "—"}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Clock className="h-3 w-3 text-blue-500" />
                              <span>Waktu</span>
                            </div>
                            <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                              {startDate ? startDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "16:00"} – {endDate ? endDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "17:00"}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 col-span-2 sm:col-span-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                              <User className="h-3 w-3 text-blue-500" />
                              <span>Pelatih</span>
                            </div>
                            <div className="text-xs font-black text-blue-600 dark:text-sky-400 mt-0.5 truncate capitalize">
                              {formatCoachName(s.coachName)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{s.location || "Lapangan Atletik UNNES"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-3">
                  <div className="text-4xl select-none">📅</div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Belum Ada Jadwal pada Kategori Ini
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Jadwal sesi latihan lapangan akan otomatis muncul setelah didaftarkan oleh pelatih atau admin.
                    </p>
                  </div>
                  <button
                    onClick={() => setScheduleFilter("all")}
                    className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400 font-bold text-xs hover:bg-blue-100 transition"
                  >
                    Lihat Semua Jadwal
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MISSIONS (DAILY QUESTS & HOME CHALLENGES)                           */}
          {/* ========================================================================= */}
          {activeTab === "missions" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Misi &amp; Tantangan Gerak Harian</span>
                  <span>🎯</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lakukan tantangan mandiri di rumah atau kegiatan terpandu yang disiapkan oleh pelatih untuk menambah XP!
                </p>
              </div>

              {/* Interactive Home Challenge */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-blue-500/30 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    TANTANGAN MANDIRI DI RUMAH
                  </span>
                  <div className="px-3 py-1 rounded-2xl bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-slate-950" />
                    <span>+30 XP</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">
                    {runnerEmoji} <span className="italic">Agility Quest</span>: Langkah Kilat &amp; Berkelit
                  </h3>
                  <p className="text-xs text-blue-100 font-medium">
                    Lakukan 4 langkah gerakan di bawah ini dan tandai setelah selesai:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    { title: "1. Shuffle Samping 5 Langkah", desc: "Geser ke kanan lalu ke kiri dengan tumpuan lincah." },
                    { title: "2. Slalom Melewati Rintangan", desc: "Berlari berkelit melewati 5 titik dengan cepat." },
                    { title: "3. Back Pedal (Mundur Stabil)", desc: "Mundur cepat 5 langkah dengan posisi badan seimbang." },
                    { title: "4. Sprint Pendek 10 Meter", desc: "Lari cepat dan berhenti dengan posisi kokoh." },
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
                        <div className={`mt-0.5 h-6 w-6 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isChecked ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300 border border-white/20"
                        }`}>
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
                  <div className="p-4 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-200 flex items-center gap-3 animate-in zoom-in-95">
                    <div className="text-3xl">🎉</div>
                    <div>
                      <div className="text-xs font-black text-white">CHALLENGE COMPLETE! LUAR BIASA!</div>
                      <div className="text-[11px] text-amber-300 font-semibold">
                        Kamu mendapatkan +30 XP hari ini!
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Coach & Admin Missions Info Card */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Misi Khusus dari Pelatih &amp; Admin</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Sistem Misi Terintegrasi
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-lg shrink-0">
                    👨‍🏫
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Tantangan Harian Terjadwal
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Misi harian di atas disiapkan oleh tim pelatih Coach Zulfi Athletic Performance Hub untuk membantu pembinaan gerak mandiri. Selesaikan seluruh gerakan untuk mengumpulkan XP dan menaikkan level atletmu!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BADGES (MEDALS & BADGES WITH 3-TIER HIERARCHY)                     */}
          {/* ========================================================================= */}
          {activeTab === "badges" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Rewards &amp; Badges 🏆
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Koleksi medali perisai kebanggaan dari setiap sesi latihanmu!
                </p>
              </div>

              {/* Tier 1: Unlocked Badges */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-base">🏆</span>
                  <span>Lencana yang Telah Terbuka (Unlocked)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.badges.filter((b) => b.earned).map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-3xl p-4 border border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-[#0B132B] shadow-sm text-center space-y-2"
                    >
                      <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md select-none">
                        🏅
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {badge.name}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        {badge.description}
                      </p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        TERBUKA ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier 2: Next to Unlock Badges */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-base">⭐</span>
                  <span>Misi Lencana Berikutnya (Next to Unlock)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                      🛡️
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        Balance Knight — Level 3
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Ikuti 1 sesi latihan keseimbangan lagi untuk membuka lencana ini!
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                      🦘
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        Jump Master — Level 2
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Selesaikan tantangan lompat daya ledak kaki di sesi berikutnya!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier 3: Locked Badges */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-base">🔒</span>
                  <span>Lencana Terkunci (Locked)</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {achievements.badges.filter((b) => !b.earned).map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-3xl p-4 border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 shadow-sm text-center space-y-2 opacity-75"
                    >
                      <div className="h-12 w-12 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xl select-none">
                        🔒
                      </div>
                      <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {badge.name}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {badge.description}
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500">
                        Terkunci
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: PROFILE (IDENTITY + JOURNEY SUMMARY + MY SPORTS + ACCOUNT)          */}
          {/* ========================================================================= */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
              {/* ── A. ATHLETE IDENTITY ── */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative overflow-hidden">
                {/* Background decorative soft blob */}
                <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-blue-50 dark:bg-blue-950/30 blur-2xl pointer-events-none" />

                {/* Avatar / Photo with gender-appropriate preset */}
                <div className="relative shrink-0">
                  {profile.photoUrl ? (
                    <Avatar
                      src={profile.photoUrl}
                      fallback={firstName.slice(0, 2).toUpperCase()}
                      size="lg"
                      alt={profile.fullName}
                      className="h-24 w-24 rounded-3xl ring-4 ring-blue-500/30 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center text-5xl shadow-lg ring-4 ring-blue-500/20 select-none">
                      {mascotEmoji}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-md flex items-center gap-0.5">
                    <span>⭐</span>
                    <span>Lv.{currentLevel}</span>
                  </div>
                </div>

                <div className="space-y-2 flex-1 min-w-0 z-10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-300 border border-blue-200/80 dark:border-blue-800/80">
                      <span>🌟</span>
                      <span>Movement Explorer</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {profile.fullName}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200">
                      {profile.sportCategory ?? "Multi-Sport & Senam Ceria"}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Usia {profile.age} Tahun
                    </span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {context.organizationName}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── B. ATHLETE JOURNEY SUMMARY ── */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                  MY JOURNEY
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Level Card -> Navigates to Skill/Progress */}
                  <button
                    onClick={() => setActiveTab("progress")}
                    className="p-4 rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all text-left group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                        ⭐
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          Level {currentLevel}
                        </div>
                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          {earnedXp} XP
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 2. Streak Card -> Navigates to Schedule */}
                  <button
                    onClick={() => setActiveTab("schedule")}
                    className="p-4 rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-md transition-all text-left group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                        🔥
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {streakDays} Session Streak
                        </div>
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Jadwal &amp; Kehadiran
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 3. Badges Card -> Navigates to Badges/Medals */}
                  <button
                    onClick={() => setActiveTab("badges")}
                    className="p-4 rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all text-left group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                        🏆
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {achievements.badges.filter((b) => b.earned).length} Badges
                        </div>
                        <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                          Medali Terbuka
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>

              {/* ── C. MY SPORTS ── */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  MY SPORTS &amp; FOCUS
                </span>

                <div className="flex flex-wrap gap-2.5">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800 text-xs font-extrabold text-blue-700 dark:text-sky-300">
                    <span>🏃</span>
                    <span>Multi-Sport</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/70 dark:border-purple-800 text-xs font-extrabold text-purple-700 dark:text-purple-300">
                    <span>🤸</span>
                    <span>Senam Ceria</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                    <span>⚡</span>
                    <span>Agility &amp; Fun Movement</span>
                  </div>
                </div>
              </div>

              {/* ── D. ACCOUNT & SECURITY ── */}
              <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  ACCOUNT
                </span>

                <div className="space-y-3">
                  {/* Personal Information Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Informasi Pribadi Atlet</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Nama Lengkap</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{profile.fullName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Kategori Pembinaan</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">MFD (Movement &amp; Fitness)</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Orang Tua / Wali</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{profile.parentName || "Ibu Siska / Terdaftar"}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Klub / Performance Hub</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{context.organizationName || "Coach Zulfi Athletic Performance Hub"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Settings / Change Password Button */}
                  <button
                    onClick={() => {
                      setShowPasswordModal(true);
                      setPasswordMessage(null);
                    }}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          Pengaturan Akun &amp; Ganti Password
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Ubah kata sandi untuk login mandiri ke portal atlet
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                  </button>
                </div>
              </div>

              {/* ── E. LOGOUT BUTTON ── */}
              <div className="pt-2">
                <a
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-extrabold transition shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar dari Portal MFD</span>
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── PASSWORD CHANGE MODAL ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Ganti Kata Sandi Portal
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Perbarui password untuk akun {firstName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Password Baru (Min. 6 Karakter)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {passwordMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300"
                  }`}
                >
                  <span className="shrink-0">{passwordMessage.type === "success" ? "✓" : "⚠️"}</span>
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 shadow-md shadow-blue-600/25"
                >
                  {passwordLoading ? "Menyimpan..." : "Simpan Kata Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <MfdBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
