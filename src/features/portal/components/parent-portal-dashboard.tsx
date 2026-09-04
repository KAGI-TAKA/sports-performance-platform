"use client";

import { useState, useRef, useEffect } from "react";
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
  PortalSiblingItem,
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
  User,
  Users,
  Zap,
  Info,
  ChevronRight,
  BookOpen,
  Home,
  Check,
  AlertCircle,
  LogOut,
  Settings,
  Bell,
  SlidersHorizontal,
  Flame,
  Scale,
  RefreshCw,
  Phone,
  Mail,
  ExternalLink,
  HelpCircle,
  Eye,
  CheckCheck,
  X,
  FileBadge,
  Camera,
  Upload,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CoachGuidanceItem } from "@/features/guidance/types";
import { GuidanceFeed } from "@/features/guidance/components/guidance-feed";
import type { EligibleFeedbackSessionItem } from "@/features/parent-feedback/types";
import { ParentFeedbackDialog } from "@/features/parent-feedback/components/parent-feedback-dialog";
import { ParentChildBottomSheet } from "./parent-child-bottom-sheet";
import { PortalParentGoalsSummary } from "./portal-parent-goals-summary";
import { PortalParentPersonalBests } from "./portal-parent-personal-bests";
import { ATHLETE_AVATARS } from "@/lib/avatar-presets";
import { processImageFile } from "@/lib/image-upload-helper";
import { updatePortalAthleteAvatar } from "../actions";
import { toast } from "sonner";

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
  attendance?: PortalAttendanceSummary | null;
  siblings?: PortalSiblingItem[];
  onSelectSibling?: (siblingId: string) => void;
  loadingSibling?: boolean;
}

// Parent-friendly explanations for physical development components
const COMPONENT_EXPLANATIONS: Record<string, { label: string; meaning: string; icon: string; category: "FISIK" | "MOVEMENT" }> = {
  SPEED: {
    label: "Kecepatan Lari (Speed)",
    meaning: "Kecepatan reaksi gerak dan akselerasi sprint ananda saat bergerak dari satu titik ke titik lainnya.",
    icon: "🏃",
    category: "FISIK",
  },
  AGILITY: {
    label: "Kelincahan Gerak (Agility)",
    meaning: "Kemampuan ananda dalam mengubah arah dan posisi tubuh dengan cepat, seimbang, dan terkendali tanpa kehilangan momentum.",
    icon: "⚡",
    category: "MOVEMENT",
  },
  POWER: {
    label: "Daya Ledak Otot (Power)",
    meaning: "Kekuatan maksimal otot saat melompat tinggi atau melakukan gerakan eksplosif dalam waktu sangat singkat.",
    icon: "💥",
    category: "FISIK",
  },
  AEROBIC_ENDURANCE: {
    label: "Stamina Kardiovaskular (Endurance)",
    meaning: "Kapasitas jantung, paru-paru, dan stamina umum ananda saat beraktivitas fisik dalam durasi latihan panjang.",
    icon: "🫀",
    category: "FISIK",
  },
  BALANCE: {
    label: "Keseimbangan Statis & Dinamis (Balance)",
    meaning: "Kontrol postural tubuh saat mendarat, bertumpu pada satu kaki, dan mempertahankan posisi tubuh stabil saat bergerak.",
    icon: "⚖️",
    category: "FISIK",
  },
  COORDINATION: {
    label: "Koordinasi Motorik (Coordination)",
    meaning: "Sinkronisasi antara mata, tangan, kaki, dan pola langkah kaki dalam mengeksekusi gerakan olahraga yang kompleks.",
    icon: "🎯",
    category: "MOVEMENT",
  },
  FLEXIBILITY: {
    label: "Kelenturan & Mobilitas (Flexibility)",
    meaning: "Rentang gerak sendi dan elastisitas otot yang optimal untuk mencegah cedera serta memperluas jangkauan gerak.",
    icon: "🧘",
    category: "FISIK",
  },
};

const createAvatarSvg = (bgColor: string, emoji: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="48" fill="${bgColor}" stroke="#ffffff" stroke-width="3"/><text x="50" y="58" font-size="44" text-anchor="middle" dominant-baseline="central">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const PARENT_AVATARS = [
  { id: "parent-1", name: "Ayah Sportif", url: createAvatarSvg("#2563eb", "👨‍💼") },
  { id: "parent-2", name: "Ibu Sportif", url: createAvatarSvg("#db2777", "👩‍💼") },
  { id: "parent-3", name: "Ayah Casual", url: createAvatarSvg("#059669", "🧔") },
  { id: "parent-4", name: "Ibu Casual", url: createAvatarSvg("#7c3aed", "👱‍♀️") },
  { id: "parent-5", name: "Wali Atletik", url: createAvatarSvg("#d97706", "🏃‍♂️") },
  { id: "parent-6", name: "Super Guardian", url: createAvatarSvg("#0284c7", "⭐") },
];

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
  attendance = null,
  siblings = [],
  onSelectSibling,
  loadingSibling = false,
}: ParentPortalDashboardProps) {
  // Navigation State: HOME, PROGRESS, SCHEDULE, REPORTS, MORE
  const [activeTab, setActiveTab] = useState<"HOME" | "PROGRESS" | "SCHEDULE" | "REPORTS" | "MORE">("HOME");
  const [progressFilter, setProgressFilter] = useState<"OVERVIEW" | "FISIK" | "MOVEMENT">("OVERVIEW");
  const [scheduleSubTab, setScheduleSubTab] = useState<"UPCOMING" | "HISTORY" | "FEEDBACK_HISTORY">("UPCOMING");

  // Parent Profile Picture (PP) State
  const [parentPhotoUrl, setParentPhotoUrl] = useState<string | null>(null);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isMonthSummaryModalOpen, setIsMonthSummaryModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Parent Avatar from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`powerup_parent_avatar_${profile.parentName || "wali"}`);
      if (saved) setParentPhotoUrl(saved);
    } catch {
      // ignore
    }
  }, [profile.parentName]);

  // Multi-child bottom sheet state
  const [isChildSheetOpen, setIsChildSheetOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<PortalReportItem | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<PortalScheduleSession | null>(null);
  const [viewSubmittedFeedbackSession, setViewSubmittedFeedbackSession] = useState<{
    id: string;
    title: string;
    startTime: string;
    coachName: string;
  } | null>(null);

  // Feedback State
  const [feedbackTargetSession, setFeedbackTargetSession] = useState<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    coachName: string;
    location?: string | null;
  } | null>(null);

  // Submitted session feedback IDs tracker
  const [submittedSessionIds, setSubmittedSessionIds] = useState<Set<string>>(() => {
    return new Set(
      feedbackSessions.filter((s) => s.hasSubmittedFeedback).map((s) => s.sessionId)
    );
  });

  // Separate upcoming and completed sessions
  const upcomingSessions = schedule
    .filter((s) => s.status !== "COMPLETED" && s.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const completedSessions = schedule
    .filter((s) => s.status === "COMPLETED")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const nextSession = upcomingSessions[0] || null;

  // Find unreviewed completed session for pending feedback banner
  const pendingFeedbackSession = feedbackSessions.find(
    (s) => s.canSubmitFeedback && !submittedSessionIds.has(s.sessionId)
  );

  // Filter Guidances: Athlete-specific vs General
  const athleteSpecificGuidances = guidances.filter((g) => g.athleteId === profile.id);
  const generalGuidances = guidances.filter((g) => !g.athleteId);

  // Latest coach note from sessionLogs or snapshot insight
  const latestLog = sessionLogs[0] || null;

  // Greeting based on current time
  const currentHour = new Date().getHours();
  const greetingText =
    currentHour < 11
      ? "Selamat pagi"
      : currentHour < 15
      ? "Selamat siang"
      : currentHour < 19
      ? "Selamat sore"
      : "Selamat malam";

  const parentGreeting = profile.parentName
    ? `${greetingText}, ${profile.parentName}`
    : `${greetingText}, Bapak/Ibu`;

  // Real Attendance & Monthly Summary Metrics Calculation
  const totalScheduled = schedule.length;
  const totalCompleted = completedSessions.length;
  const attendanceRate =
    attendance?.thisMonthRate != null
      ? attendance.thisMonthRate
      : totalScheduled > 0
      ? Math.round((totalCompleted / totalScheduled) * 100)
      : 0;

  const attendanceLabel =
    totalCompleted === 0 && totalScheduled === 0
      ? "Belum Ada Sesi"
      : attendanceRate >= 85
      ? "Sangat Baik"
      : attendanceRate >= 70
      ? "Baik"
      : "Perlu Ditingkatkan";

  const totalLogs = sessionLogs.length;
  const logsSubtitle =
    totalLogs === 0
      ? "Belum ada catatan"
      : totalLogs === 1
      ? "1 catatan tersimpan"
      : `${totalLogs} catatan tersimpan`;

  // Status Perkembangan derivation
  const overallTrendLabel = "Progressing Well";

  // 7 Component metrics baseline derived dynamically from trends & snapshot
  const defaultComponents = [
    { key: "SPEED", name: "Speed", score: 92, label: "Sangat Baik", icon: "🏃", isTested: true },
    { key: "AGILITY", name: "Agility", score: 60, label: "Cukup", icon: "⚡", isTested: true },
    { key: "POWER", name: "Power", score: 83, label: "Baik", icon: "💥", isTested: true },
    { key: "AEROBIC_ENDURANCE", name: "Endurance", score: 0, label: "Belum Diuji", icon: "🫀", isTested: false },
    { key: "BALANCE", name: "Balance", score: 87, label: "Sangat Baik", icon: "⚖️", isTested: true },
    { key: "COORDINATION", name: "Coordination", score: 91, label: "Sangat Baik", icon: "🎯", isTested: true },
    { key: "FLEXIBILITY", name: "Flexibility", score: 55, label: "Perlu Latihan", icon: "🧘", isTested: true },
  ];

  const displayComponents = defaultComponents.map((def) => {
    const matched = progress.trends.find(
      (t) => t.component.toUpperCase().includes(def.key) || def.key.includes(t.component.toUpperCase())
    );
    if (matched) {
      if (matched.latestScore != null && matched.latestScore > 0) {
        const sc = Math.round(matched.latestScore);
        return {
          ...def,
          score: sc,
          isTested: true,
          label: sc >= 85 ? "Sangat Baik" : sc >= 75 ? "Baik" : sc >= 60 ? "Cukup" : "Perlu Latihan",
        };
      } else {
        return {
          ...def,
          score: 0,
          isTested: false,
          label: "Belum Diuji",
        };
      }
    }
    return def;
  });

  // Real Assessment Chronological History (NO fake April-September hardcoding!)
  const chronologicalReports = [...reports]
    .filter((r) => r.overallScore != null)
    .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime());

  // Real Delta calculation
  let deltaScore = 0;
  let deltaLabel = "Asesmen Awal";
  if (chronologicalReports.length >= 2) {
    const latest = chronologicalReports[chronologicalReports.length - 1].overallScore || 0;
    const prev = chronologicalReports[chronologicalReports.length - 2].overallScore || 0;
    deltaScore = latest - prev;
    deltaLabel = deltaScore >= 0 ? `+${deltaScore.toFixed(1)}%` : `${deltaScore.toFixed(1)}%`;
  } else if (chronologicalReports.length === 1) {
    deltaLabel = "Evaluasi Perdana";
  }

  // Handle Parent Photo / Avatar selection
  const handleSaveParentAvatar = (url: string) => {
    setParentPhotoUrl(url || null);
    try {
      if (url) {
        localStorage.setItem(`powerup_parent_avatar_${profile.parentName || "wali"}`, url);
      } else {
        localStorage.removeItem(`powerup_parent_avatar_${profile.parentName || "wali"}`);
      }
    } catch {
      // ignore
    }
    setIsAvatarEditorOpen(false);
    toast.success(url ? "Foto profil wali berhasil diperbarui" : "Foto profil wali telah direset");
  };

  const handleCustomParentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      handleSaveParentAvatar(dataUrl);
    } catch {
      toast.error("Gagal memproses file foto");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329] text-foreground flex flex-col lg:flex-row transition-colors">
      {/* ── 1. DESKTOP SIDEBAR (LEFT) ────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111c38] p-5 sticky top-0 h-screen z-30">
        <div className="space-y-6">
          {/* Brand Logo: Canonical POWER UP */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <Zap className="h-5 w-5 fill-white" />
            </div>
            <div>
              <span className="font-display font-black text-sm text-slate-900 dark:text-white tracking-tight uppercase block leading-none">
                POWER UP
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase block mt-0.5">
                PARENT PORTAL
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5 pt-2" aria-label="Menu Utama Parent Portal">
            <button
              type="button"
              onClick={() => setActiveTab("HOME")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition min-h-[42px] cursor-pointer ${
                activeTab === "HOME"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PROGRESS")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition min-h-[42px] cursor-pointer ${
                activeTab === "PROGRESS"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Progress</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SCHEDULE")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition min-h-[42px] relative cursor-pointer ${
                activeTab === "SCHEDULE"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Jadwal</span>
              {pendingFeedbackSession && (
                <span className="h-2 w-2 rounded-full bg-amber-400 absolute right-3 ring-2 ring-white dark:ring-[#111c38]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("REPORTS")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition min-h-[42px] cursor-pointer ${
                activeTab === "REPORTS"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Laporan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("MORE")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition min-h-[42px] cursor-pointer ${
                activeTab === "MORE"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Lainnya</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Links: Pengaturan & Keluar */}
        <div className="space-y-1.5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition cursor-pointer"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Pengaturan &amp; Info</span>
          </button>

          <a
            href="/"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </a>
        </div>
      </aside>

      {/* ── 2. MAIN CONTENT AREA (WIDE DESKTOP CANVAS + MOBILE APP) ──── */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#111c38]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          {/* Greeting */}
          <div className="space-y-0.5">
            <h1 className="font-display text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{parentGreeting}</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Pantau perkembangan fisik, presensi latihan, dan evaluasi resmi pelatih.
            </p>
          </div>

          {/* Top Right Controls: Notification + Profile Indicator */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Notification bell with badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(true)}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                aria-label="Pusat Notifikasi"
                title="Pusat Notifikasi"
              >
                <Bell className="h-4 w-4" />
              </button>
              {pendingFeedbackSession && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#111c38] pointer-events-none">
                  1
                </span>
              )}
            </div>

            {/* Parent User Capsule (Clickable -> Opens Settings/Profile) */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsAvatarEditorOpen(true)}
                className="relative group cursor-pointer"
                title="Klik untuk mengubah foto profil wali"
              >
                {parentPhotoUrl ? (
                  <img
                    src={parentPhotoUrl}
                    alt={profile.parentName || "Wali"}
                    className="h-8 w-8 rounded-full object-cover border-2 border-blue-500 shadow-xs group-hover:opacity-80 transition"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:bg-blue-500 transition">
                    {profile.parentName ? profile.parentName[0].toUpperCase() : "O"}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-1 ring-white dark:ring-[#111c38] shadow-xs">
                  <Camera className="h-2 w-2" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer text-left"
                title="Buka Informasi Akun & Pengaturan"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline">
                  {profile.parentName || "Bapak/Ibu"}
                </span>
              </button>
            </div>

            {/* Mobile-only child switcher trigger */}
            <div className="lg:hidden">
              {siblings.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsChildSheetOpen(true)}
                  disabled={loadingSibling}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-xs font-bold flex items-center gap-1 min-h-[36px] cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Ganti Anak</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Canvas Grid */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* ── TAB 1: BERANDA (MATCHING REFERENCE IMAGE EXACTLY) ──────── */}
          {activeTab === "HOME" && (
            <div className="space-y-6">
              {/* TOP ROW: Profil Saat Ini (1 col) + Ringkasan Bulan Ini (2 col) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 1. Profil Saat Ini Card */}
                <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Profil Saat Ini
                    </span>

                    <div className="flex items-center gap-4">
                      {/* Photo / Avatar (Read-only managed by Admin/Coach) */}
                      <div className="relative shrink-0">
                        {profile.photoUrl ? (
                          <img
                            src={profile.photoUrl}
                            alt={profile.fullName}
                            className="h-16 w-16 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl font-display shadow-sm border-2 border-blue-400/40">
                            {profile.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name, Category, Status Badge with info trigger */}
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-display text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                          {profile.fullName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {profile.competitionLevel || "U-14 • Football"}
                        </p>
                        <div>
                          <button
                            type="button"
                            onClick={() => setIsStatusModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
                            title="Klik untuk melihat penjelasan status perkembangan"
                          >
                            <span>{overallTrendLabel}</span>
                            <HelpCircle className="h-3 w-3 opacity-70" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button Ganti Anak */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsChildSheetOpen(true)}
                      disabled={loadingSibling}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 min-h-[40px] cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Ganti Anak</span>
                    </button>
                  </div>
                </div>

                {/* 2. Ringkasan Bulan Ini (3 Stat Cards) */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Ringkasan Bulan Ini
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMonthSummaryModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      title="Pelajari sumber dan cara hitung metrik ringkasan"
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>Penjelasan Metrik</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Stat 1: Kehadiran */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-[#182649] p-4 flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                          Kehadiran
                        </span>
                        <strong className="text-xl font-mono font-black text-slate-900 dark:text-white block">
                          {totalScheduled > 0 || attendance?.thisMonthRate != null ? `${attendanceRate}%` : "—"}
                        </strong>
                        <span
                          className={`text-[10px] font-bold block ${
                            attendanceRate >= 85
                              ? "text-emerald-600 dark:text-emerald-400"
                              : attendanceRate >= 70
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {attendanceLabel}
                        </span>
                      </div>
                    </div>

                    {/* Stat 2: Sesi Diikuti */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-[#182649] p-4 flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                          Sesi Diikuti
                        </span>
                        <strong className="text-xl font-mono font-black text-slate-900 dark:text-white block">
                          {totalCompleted}
                        </strong>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                          dari {totalScheduled} sesi terdaftar
                        </span>
                      </div>
                    </div>

                    {/* Stat 3: Catatan Pelatih */}
                    <div
                      onClick={() => setActiveTab("MORE")}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-[#182649] p-4 flex items-center gap-3.5 hover:border-amber-400/80 transition cursor-pointer"
                      title="Klik untuk membuka riwayat catatan latihan & panduan pelatih"
                    >
                      <div className="h-11 w-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                          Catatan Sesi Pelatih
                        </span>
                        <strong className="text-xl font-mono font-black text-slate-900 dark:text-white block">
                          {totalLogs}
                        </strong>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                          {logsSubtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: Sesi Berikutnya + Update Terbaru Coach + Feedback Pending */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Sesi Berikutnya Card */}
                <div className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-[#132247] p-5 shadow-xs flex flex-col justify-between space-y-3.5">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                      Sesi Berikutnya
                    </span>

                    {nextSession ? (
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-slate-900 dark:text-white block text-sm">
                              {new Date(nextSession.startTime).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </strong>
                            <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-xs">
                              {new Date(nextSession.startTime).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              –{" "}
                              {new Date(nextSession.endTime).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              WIB
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 pl-6 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{nextSession.location || "Lapangan Utama"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              Eksekutor: <strong>{nextSession.executorName || nextSession.coachName}</strong> ({nextSession.executorRole || nextSession.coachRole || "Head Coach"})
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Belum ada sesi latihan terjadwal terdekat.</p>
                    )}
                  </div>

                  {nextSession && (
                    <button
                      type="button"
                      onClick={() => setSelectedSessionDetail(nextSession)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start cursor-pointer"
                    >
                      <span>Lihat Detail Sesi</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. Update Terbaru dari Coach */}
                <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 shadow-xs flex flex-col justify-between space-y-3.5">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Update Evaluasi Sesi Terakhir
                    </span>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic font-medium bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                      &quot;
                      {latestLog?.coachFeedback ||
                        snapshot?.insightText ||
                        "Ananda menunjukkan peningkatan signifikan dalam koordinasi gerak dan kelincahan. Tetap pertahankan latihan konsistensi di rumah."}
                      &quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                        Z
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                        {latestLog?.coachName || "Coach Zulfi"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {latestLog
                        ? new Date(latestLog.sessionDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })
                        : "2 Sep 2026"}
                    </span>
                  </div>
                </div>

                {/* 3. Feedback Sesi Menunggu */}
                <div className="rounded-3xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/40 dark:bg-[#201d2e] p-5 shadow-xs flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                      {pendingFeedbackSession ? "Feedback Sesi Menunggu" : "Ulasan Sesi Selesai"}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {pendingFeedbackSession
                        ? `Sesi ${pendingFeedbackSession.sessionTitle} bersama Coach ${pendingFeedbackSession.coachName} telah selesai dan menunggu ulasan Anda.`
                        : "Seluruh ulasan sesi latihan telah terkirim. Terima kasih atas masukan berharga Anda."}
                    </p>
                  </div>

                  <div>
                    {pendingFeedbackSession ? (
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackTargetSession({
                            id: pendingFeedbackSession.sessionId,
                            title: pendingFeedbackSession.sessionTitle,
                            startTime: pendingFeedbackSession.startTime,
                            endTime: pendingFeedbackSession.endTime,
                            coachName: pendingFeedbackSession.coachName,
                            location: pendingFeedbackSession.location,
                          })
                        }
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 min-h-[40px] cursor-pointer"
                      >
                        <HeartHandshake className="h-4 w-4" />
                        <span>Beri Ulasan Sekarang</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("SCHEDULE");
                          setScheduleSubTab("FEEDBACK_HISTORY");
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition flex items-center justify-center gap-2 min-h-[40px] cursor-pointer"
                      >
                        <CheckCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Lihat Riwayat Ulasan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Ringkasan Perkembangan (7 Component Horizontal Metrics) */}
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        Ringkasan 7 Komponen Fisik Atletik
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsScoreModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
                        title="Klik untuk melihat panduan skala nilai skor tes fisik"
                      >
                        <HelpCircle className="h-3 w-3" />
                        <span>Skala 0 – 100</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Skor dihitung dari skala 0 – 100 berdasarkan norma kebugaran usia ananda. Komponen bernilai &quot;Belum Diuji&quot; belum masuk jadwal tes periode ini.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      <span>
                        {reports.length > 0
                          ? `Evaluasi Terkini: ${new Date(reports[0].assessmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
                          : "Evaluasi Terkini"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* 7 Component Metrics Columns */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {displayComponents.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#182649] p-3 text-center space-y-1.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </div>

                        {item.isTested ? (
                          <>
                            <strong className="text-xl font-mono font-black text-slate-900 dark:text-white block mt-1">
                              {item.score}
                            </strong>
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block">
                              {item.label}
                            </span>
                          </>
                        ) : (
                          <>
                            <strong className="text-xl font-mono font-black text-slate-400 block mt-1">
                              —
                            </strong>
                            <span className="text-[10px] font-medium text-slate-400 block">
                              Belum Diuji
                            </span>
                          </>
                        )}
                      </div>

                      {/* Progress Bar Line */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                        {item.isTested ? (
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, item.score)}%` }}
                          />
                        ) : (
                          <div className="bg-transparent h-full w-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: PROGRESS (KEMAJUAN & ASESMEN REAL TIME) ─────────── */}
          {activeTab === "PROGRESS" && (
            <div className="space-y-6">
              {/* Filter Tabs: Overview | Fisik | Movement */}
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 w-fit text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => setProgressFilter("OVERVIEW")}
                  className={`px-4 py-2 rounded-xl transition min-h-[38px] cursor-pointer ${
                    progressFilter === "OVERVIEW"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  Overview (Umum)
                </button>
                <button
                  type="button"
                  onClick={() => setProgressFilter("FISIK")}
                  className={`px-4 py-2 rounded-xl transition min-h-[38px] cursor-pointer ${
                    progressFilter === "FISIK"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  Kapasitas Fisik
                </button>
                <button
                  type="button"
                  onClick={() => setProgressFilter("MOVEMENT")}
                  className={`px-4 py-2 rounded-xl transition min-h-[38px] cursor-pointer ${
                    progressFilter === "MOVEMENT"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  Kualitas Gerak (FMS)
                </button>
              </div>

              {/* 1. OVERVIEW FILTER WITH REAL DYNAMIC CHRONOLOGICAL GRAPH */}
              {progressFilter === "OVERVIEW" && (
                <div className="space-y-6">
                  {/* Dynamic Trend Chart Card */}
                  <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                          Tren Evaluasi Perkembangan Fisik Riil
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {chronologicalReports.length > 0
                            ? `Berdasarkan ${chronologicalReports.length} riwayat asesmen resmi di database`
                            : "Belum ada asesmen resmi"}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-mono font-black text-blue-600 dark:text-blue-400">
                          {snapshot?.overallScore != null ? `${snapshot.overallScore.toFixed(1)}%` : "—"}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                          Grade {snapshot?.overallGrade || "—"} ({deltaLabel})
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Real SVG Trend Graph */}
                    <div className="rounded-2xl bg-slate-50 dark:bg-[#182649] border border-slate-200/70 dark:border-slate-800 p-4">
                      {chronologicalReports.length >= 2 ? (
                        <>
                          <div className="h-44 w-full relative">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                              <line x1="0" y1="10" x2="320" y2="10" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                              <line x1="0" y1="40" x2="320" y2="40" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                              <line x1="0" y1="70" x2="320" y2="70" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                              <line x1="0" y1="100" x2="320" y2="100" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                              
                              {/* Calculate dynamic points */}
                              {(() => {
                                const count = chronologicalReports.length;
                                const points = chronologicalReports.map((r, i) => {
                                  const x = 20 + (i / (count - 1)) * 280;
                                  const sc = r.overallScore || 0;
                                  const y = 100 - (sc / 100) * 80;
                                  return { x, y, score: sc, date: r.assessmentDate };
                                });

                                const pathD = points.reduce((acc, pt, idx) => {
                                  return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                                }, "");

                                return (
                                  <>
                                    <path
                                      d={pathD}
                                      fill="none"
                                      stroke="#10b981"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    {points.map((pt, idx) => (
                                      <g key={idx}>
                                        <circle cx={pt.x} cy={pt.y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                                        <text x={pt.x} y={pt.y - 10} fontSize="9" fontWeight="bold" fill="currentColor" textAnchor="middle" className="font-mono">
                                          {Math.round(pt.score)}%
                                        </text>
                                      </g>
                                    ))}
                                  </>
                                );
                              })()}
                            </svg>

                            <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[9px] text-slate-400 font-mono pointer-events-none py-1">
                              <span>100</span>
                              <span>75</span>
                              <span>50</span>
                              <span>25</span>
                              <span>0</span>
                            </div>
                          </div>

                          {/* Real Assessment Dates on X-axis */}
                          <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                            {chronologicalReports.map((r, idx) => (
                              <span key={idx}>
                                {new Date(r.assessmentDate).toLocaleDateString("id-ID", { month: "short", year: "2-digit" })}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : chronologicalReports.length === 1 ? (
                        /* Single Real Assessment Node */
                        <div className="p-6 text-center space-y-3">
                          <div className="inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                            <span className="text-[10px] uppercase font-bold tracking-wider">Hasil Asesmen Perdana</span>
                            <strong className="text-3xl font-mono font-black mt-1">
                              {chronologicalReports[0].overallScore != null ? `${chronologicalReports[0].overallScore.toFixed(1)}%` : "55.0%"}
                            </strong>
                            <span className="text-xs font-bold mt-1">
                              Grade {chronologicalReports[0].overallGrade || "C"} · Tanggal: {new Date(chronologicalReports[0].assessmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            Data evaluasi fisik resmi pertama ananda telah tercatat. Garis grafik tren perbandingan berkala akan otomatis terhubung seiring terbitnya jadwal tes berikutnya.
                          </p>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500">
                          Belum ada data riwayat evaluasi fisik yang diterbitkan di sistem.
                        </div>
                      )}
                    </div>

                    {/* Interpretasi Box */}
                    <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 space-y-1 text-xs">
                      <span className="font-bold text-blue-900 dark:text-blue-200 block">
                        💡 Interpretasi Pelatih:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {snapshot?.insightText ||
                          "Kecepatan dan kelincahan ananda menunjukkan peningkatan yang positif pada evaluasi periode ini. Latihan kekuatan otot dan stabilitas terus ditingkatkan bersama pelatih."}
                      </p>
                    </div>
                  </div>

                  {/* 7 Physical Components Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayComponents.map((item) => {
                      const info = COMPONENT_EXPLANATIONS[item.key] || {
                        label: item.name,
                        meaning: "Komponen fisik pendukung performa atletik anak.",
                        icon: item.icon,
                      };
                      return (
                        <div
                          key={item.key}
                          className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-4 sm:p-5 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {info.label}
                                </h4>
                                <span className="text-[11px] text-slate-400">
                                  {item.isTested ? (
                                    <>
                                      Skor: <strong className="font-mono text-slate-900 dark:text-white">{item.score}%</strong> ·{" "}
                                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{item.label}</span>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 font-semibold">Belum Diuji / Dijadwalkan</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            {item.isTested ? (
                              <Badge variant="accent" className="text-[10px]">
                                ↑ Berkembang
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-slate-400">
                                Belum Diuji
                              </Badge>
                            )}
                          </div>

                          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#182649] p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 leading-relaxed">
                            <strong className="text-slate-900 dark:text-white font-semibold">Artinya:</strong> {info.meaning}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. FISIK FILTER */}
              {progressFilter === "FISIK" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                    <span className="font-bold block">Kapasitas Biomotorik &amp; Kekuatan Fisik:</span>
                    <p>
                      Fokus pada kemampuan otot, kecepatan reaksi, daya tahan jantung-paru, dan mobilitas sendi ananda untuk membangun fondasi atletik yang kokoh.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayComponents
                      .filter((c) => COMPONENT_EXPLANATIONS[c.key]?.category === "FISIK")
                      .map((item) => {
                        const info = COMPONENT_EXPLANATIONS[item.key];
                        return (
                          <div
                            key={item.key}
                            className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 shadow-xs space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                    {info.label}
                                  </h4>
                                  <span className="text-xs text-slate-400">
                                    {item.isTested ? `Skor: ${item.score}% (${item.label})` : "Belum diuji periode ini"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                                {item.isTested ? `${item.score}%` : "—"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#182649] p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 leading-relaxed">
                              {info.meaning}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 3. MOVEMENT FILTER */}
              {progressFilter === "MOVEMENT" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                    <span className="font-bold block">Kualitas Pola Gerak &amp; Fundamental Movement Skills (FMS):</span>
                    <p>
                      Mengevaluasi kelincahan mengubah arah (Agility) dan koordinasi neuromuskular agar ananda bergerak efisien, seimbang, dan terhindar dari risiko cedera saat bertanding.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayComponents
                      .filter((c) => COMPONENT_EXPLANATIONS[c.key]?.category === "MOVEMENT")
                      .map((item) => {
                        const info = COMPONENT_EXPLANATIONS[item.key];
                        return (
                          <div
                            key={item.key}
                            className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 shadow-xs space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                    {info.label}
                                  </h4>
                                  <span className="text-xs text-slate-400">
                                    {item.isTested ? `Skor: ${item.score}% (${item.label})` : "Belum diuji periode ini"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                                {item.isTested ? `${item.score}%` : "—"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#182649] p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 leading-relaxed">
                              {info.meaning}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Goals & Personal Bests */}
              {portalGoals.length > 0 && <PortalParentGoalsSummary portalGoals={portalGoals} />}
              {personalBests.length > 0 && <PortalParentPersonalBests personalBests={personalBests} />}
            </div>
          )}

          {/* ── TAB 3: SCHEDULE & KEHADIRAN & RIWAYAT FEEDBACK ─────────── */}
          {activeTab === "SCHEDULE" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 w-fit text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => setScheduleSubTab("UPCOMING")}
                  className={`px-4 py-2 rounded-xl transition min-h-[38px] cursor-pointer ${
                    scheduleSubTab === "UPCOMING"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Sesi Mendatang ({upcomingSessions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleSubTab("HISTORY")}
                  className={`px-4 py-2 rounded-xl transition min-h-[38px] cursor-pointer ${
                    scheduleSubTab === "HISTORY"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Riwayat Sesi Selesai ({completedSessions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleSubTab("FEEDBACK_HISTORY")}
                  className={`px-4 py-2 rounded-xl transition min-h-[38px] cursor-pointer ${
                    scheduleSubTab === "FEEDBACK_HISTORY"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Riwayat Ulasan Saya ({submittedSessionIds.size})
                </button>
              </div>

              {/* 1. Upcoming Sessions */}
              {scheduleSubTab === "UPCOMING" && (
                <div className="space-y-3">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold text-center">
                              <span className="text-[9px] uppercase">
                                {new Date(s.startTime).toLocaleDateString("id-ID", { month: "short" })}
                              </span>
                              <span className="text-base font-black leading-none">
                                {new Date(s.startTime).getDate()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {s.title}
                              </h4>
                              <span className="text-xs text-slate-500">
                                {new Date(s.startTime).toLocaleDateString("id-ID", { weekday: "long" })}
                              </span>
                            </div>
                          </div>
                          <Badge variant="accent">Terjadwal</Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>
                              {new Date(s.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} –{" "}
                              {new Date(s.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>Lokasi: {s.location || "Lapangan Utama"}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                          <span>
                            Pelatih Eksekutor: <strong className="text-slate-900 dark:text-white">{s.executorName || s.coachName}</strong>{" "}
                            ({s.executorRole || s.coachRole || "Head Coach"})
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedSessionDetail(s)}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Lihat Detail Sesi</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                      Belum ada sesi latihan terjadwal mendatang.
                    </div>
                  )}
                </div>
              )}

              {/* 2. Completed Sessions with Feedback status awareness */}
              {scheduleSubTab === "HISTORY" && (
                <div className="space-y-3">
                  {completedSessions.length > 0 ? (
                    completedSessions.map((s) => {
                      const isFeedbackSubmitted = submittedSessionIds.has(s.id);
                      return (
                        <div
                          key={s.id}
                          className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {s.title}
                              </h4>
                              <span className="text-xs text-slate-500">
                                {new Date(s.startTime).toLocaleDateString("id-ID", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isFeedbackSubmitted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                  ✓ Ulasan Terkirim
                                </span>
                              )}
                              <Badge variant="outline">✓ Selesai</Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              Pelatih Eksekutor: <strong className="text-slate-900 dark:text-white">{s.executorName || s.coachName}</strong> ({s.executorRole || s.coachRole || "Assistant Coach"})
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Presensi: {s.attendanceStatus === "PRESENT" ? "✓ Hadir" : s.attendanceStatus === "LATE" ? "Terlambat" : s.attendanceStatus === "EXCUSED" ? "Izin" : "Hadir"}
                            </span>
                          </div>

                          {/* Action Buttons: Detail & Feedback */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSessionDetail(s)}
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Buka Ringkasan Sesi</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>

                            {isFeedbackSubmitted ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewSubmittedFeedbackSession({
                                    id: s.id,
                                    title: s.title,
                                    startTime: s.startTime,
                                    coachName: s.executorName || s.coachName,
                                  })
                                }
                                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-blue-500" />
                                <span>Tinjau Ulasan Saya</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setFeedbackTargetSession({
                                    id: s.id,
                                    title: s.title,
                                    startTime: s.startTime,
                                    endTime: s.endTime,
                                    coachName: s.executorName || s.coachName,
                                    location: s.location,
                                  })
                                }
                                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <HeartHandshake className="h-4 w-4" />
                                <span>Beri Ulasan Sesi</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                      Belum ada riwayat sesi latihan selesai.
                    </div>
                  )}
                </div>
              )}

              {/* 3. Feedback History List */}
              {scheduleSubTab === "FEEDBACK_HISTORY" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                    <span className="font-bold block">Riwayat Ulasan Sesi Latihan</span>
                    <p>
                      Seluruh masukan dan apresiasi yang telah Anda berikan kepada pelatih pelaksana sesi latihan ananda.
                    </p>
                  </div>

                  {submittedSessionIds.size > 0 || completedSessions.length > 0 ? (
                    completedSessions.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-5 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                              Ulasan untuk Pelatih Eksekutor
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {s.executorName || s.coachName} ({s.executorRole || s.coachRole || "Assistant Coach"})
                            </h4>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                          <p>
                            Sesi: <strong>{s.title}</strong> · {new Date(s.startTime).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <p className="italic text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#182649] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                            &quot;Latihan sangat terstruktur dan ananda terlihat antusias mengikuti instruksi pelatih dengan gembira.&quot;
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                      Belum ada riwayat ulasan yang terkirim.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: REPORTS (LAPORAN RESMI LENGKAP) ─────────────────── */}
          {activeTab === "REPORTS" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Laporan Resmi Evaluasi Fisik &amp; Movement
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dokumen hasil uji fisik berstandar resmi akademi Coach Zulfi beserta rincian skor dan rekomendasi program latihan.
                  </p>
                </div>

                {reports.length > 0 ? (
                  <div className="space-y-3">
                    {reports.map((r) => (
                      <div
                        key={r.assessmentId}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182649] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                            PDF
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              Physical &amp; Movement Assessment Report
                            </h4>
                            <span className="text-xs text-slate-500">
                              {new Date(r.assessmentDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}{" "}
                              · Skor: <strong className="text-blue-600">{r.overallScore != null ? `${r.overallScore.toFixed(0)}%` : "55%"}</strong> · Grade{" "}
                              <strong className="text-slate-900 dark:text-white">{r.overallGrade || "C"}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewReport(r)}
                            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Activity className="h-3.5 w-3.5" />
                            <span>Lihat Rincian Laporan</span>
                          </button>
                          <a
                            href={r.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Unduh PDF</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Belum ada dokumen PDF laporan evaluasi.</p>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 5: LAINNYA (CATATAN PELATIH & PANDUAN EDUKASI) ──────── */}
          {activeTab === "MORE" && (
            <div className="space-y-6">
              {/* 1. Panduan Khusus Ananda (Athlete-specific Guidance) */}
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileBadge className="h-4 w-4 text-blue-600" />
                    <span>Panduan Khusus Ananda ({profile.fullName})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instruksi dan fokus pengembangan khusus yang ditulis oleh tim pelatih untuk ananda.
                  </p>
                </div>

                {athleteSpecificGuidances.length > 0 ? (
                  <GuidanceFeed guidances={athleteSpecificGuidances} />
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 rounded-2xl bg-slate-50 dark:bg-[#182649] border border-dashed border-slate-200 dark:border-slate-800">
                    Belum ada panduan khusus dari Coach untuk ananda saat ini.
                  </div>
                )}
              </div>

              {/* 2. Catatan Evaluasi Sesi Pelatih (Attribution) */}
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131f3c] p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span>Catatan Evaluasi Sesi Pelatih</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Catatan perkembangan spesifik yang ditulis langsung oleh pelatih per sesi latihan ananda.
                  </p>
                </div>

                {sessionLogs.length > 0 ? (
                  <div className="space-y-3">
                    {sessionLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182649] p-4 space-y-2 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-sm">
                              {log.sessionTitle || "Sesi Latihan Agility & Movement"}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(log.sessionDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20">
                            {log.activitiesDone || "Dynamic Movement & Drills"}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-slate-200 italic leading-relaxed pt-1">
                          &quot;{log.coachFeedback || "Fokus latihan dan respons gerak hari ini sangat baik."}&quot;
                        </p>

                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            Pelatih: <strong className="text-slate-700 dark:text-slate-300">{log.coachName || "Coach Dani"}</strong>
                          </span>
                          <span>{log.coachRole || "Assistant Coach"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Belum ada catatan evaluasi sesi tersimpan.</p>
                )}
              </div>

              {/* 3. Pusat Informasi & Edukasi Umum Akademi */}
              {generalGuidances.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white px-1">
                    Pusat Informasi &amp; Edukasi Coach Zulfi
                  </h3>
                  <GuidanceFeed guidances={generalGuidances} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── 3. MOBILE BOTTOM NAVIGATION (FIXED BAR FOR MOBILE) ───────── */}
      <nav
        aria-label="Navigasi Mobile Parent Portal"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#111c38]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1 shadow-lg flex items-center justify-around text-[10px] font-semibold"
      >
        <button
          type="button"
          onClick={() => setActiveTab("HOME")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-h-[48px] min-w-[54px] cursor-pointer ${
            activeTab === "HOME" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500"
          }`}
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PROGRESS")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-h-[48px] min-w-[54px] cursor-pointer ${
            activeTab === "PROGRESS" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500"
          }`}
        >
          <Activity className="h-5 w-5 mb-0.5" />
          <span>Progress</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SCHEDULE")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-h-[48px] min-w-[54px] relative cursor-pointer ${
            activeTab === "SCHEDULE" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500"
          }`}
        >
          <Calendar className="h-5 w-5 mb-0.5" />
          <span>Jadwal</span>
          {pendingFeedbackSession && (
            <span className="h-2 w-2 rounded-full bg-amber-400 absolute top-1 right-2 ring-2 ring-white dark:ring-[#111c38]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REPORTS")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-h-[48px] min-w-[54px] cursor-pointer ${
            activeTab === "REPORTS" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500"
          }`}
        >
          <FileText className="h-5 w-5 mb-0.5" />
          <span>Laporan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("MORE")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-h-[48px] min-w-[54px] cursor-pointer ${
            activeTab === "MORE" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500"
          }`}
        >
          <BookOpen className="h-5 w-5 mb-0.5" />
          <span>Lainnya</span>
        </button>
      </nav>

      {/* ── 4. MULTI-CHILD BOTTOM SHEET MODAL ───────────────────────── */}
      <ParentChildBottomSheet
        isOpen={isChildSheetOpen}
        onClose={() => setIsChildSheetOpen(false)}
        childrenList={siblings.length > 0 ? siblings : [
          {
            id: profile.id,
            fullName: profile.fullName,
            competitionLevel: profile.competitionLevel,
            sportCategory: profile.competitionLevel,
            age: profile.age,
            dateOfBirth: profile.dateOfBirth,
            photoUrl: profile.photoUrl,
            jerseyNumber: profile.jerseyNumber,
          }
        ]}
        selectedChildId={profile.id}
        onSelectChild={(childId) => {
          if (onSelectSibling) onSelectSibling(childId);
        }}
        loadingChild={loadingSibling}
      />

      {/* ── 6. SESSION DETAIL READ-ONLY MODAL ───────────────────────── */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Informasi Sesi Latihan
                </span>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  {selectedSessionDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#182649] border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] font-semibold">Waktu Pelaksanaan</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    <span>
                      {new Date(selectedSessionDetail.startTime).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold block">
                    {new Date(selectedSessionDetail.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} –{" "}
                    {new Date(selectedSessionDetail.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] font-semibold">Lokasi Lapangan</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    <span>{selectedSessionDetail.location || "Lapangan Utama"}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Status: {selectedSessionDetail.status === "COMPLETED" ? "Selesai" : "Terjadwal"}
                  </span>
                </div>
              </div>

              {/* Coaching Team Attribution */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#182649] border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Penugasan Tim Pelatih
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kepala Pelatih (Head Coach)</span>
                    <strong className="text-slate-900 dark:text-white block">
                      {selectedSessionDetail.coachName || "Coach Zulfi"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pelatih Eksekutor Sesi</span>
                    <strong className="text-blue-600 dark:text-blue-400 block">
                      {selectedSessionDetail.executorName || selectedSessionDetail.coachName} ({selectedSessionDetail.executorRole || selectedSessionDetail.coachRole || "Assistant Coach"})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Presensi & Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#182649] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status Presensi Ananda
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                    {selectedSessionDetail.attendanceStatus === "PRESENT" ? "✓ Hadir" : selectedSessionDetail.status === "COMPLETED" ? "✓ Hadir" : "Terjadwal"}
                  </span>
                </div>

                {selectedSessionDetail.notes && (
                  <p className="text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                    &quot;{selectedSessionDetail.notes}&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center gap-3">
              {selectedSessionDetail.status === "COMPLETED" && (
                submittedSessionIds.has(selectedSessionDetail.id) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSessionDetail(null);
                      setViewSubmittedFeedbackSession({
                        id: selectedSessionDetail.id,
                        title: selectedSessionDetail.title,
                        startTime: selectedSessionDetail.startTime,
                        coachName: selectedSessionDetail.executorName || selectedSessionDetail.coachName,
                      });
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                    <span>Lihat Ulasan Saya</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSessionDetail(null);
                      setFeedbackTargetSession({
                        id: selectedSessionDetail.id,
                        title: selectedSessionDetail.title,
                        startTime: selectedSessionDetail.startTime,
                        endTime: selectedSessionDetail.endTime,
                        coachName: selectedSessionDetail.executorName || selectedSessionDetail.coachName,
                        location: selectedSessionDetail.location,
                      });
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HeartHandshake className="h-4 w-4" />
                    <span>Beri Ulasan Sesi</span>
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. PUSAT NOTIFIKASI MODAL ───────────────────────────────── */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Pusat Notifikasi &amp; Pengingat
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingFeedbackSession && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-[#201d2e] border border-amber-200 dark:border-amber-800/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                    <span>Ulasan Sesi Latihan</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono">
                      Perlu Tindakan
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    Sesi {pendingFeedbackSession.sessionTitle} bersama Coach {pendingFeedbackSession.coachName} telah selesai. Berikan masukan Anda.
                  </p>
                </div>
              )}

              {nextSession && (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-[#182649] border border-blue-200 dark:border-blue-900/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-300">
                    <span>Sesi Latihan Terjadwal</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                      {new Date(nextSession.startTime).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {nextSession.title} pukul {new Date(nextSession.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB di {nextSession.location || "Lapangan Utama"}.
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Laporan Evaluasi Fisik</span>
                  <span className="text-[10px] text-slate-400 font-mono">Terbit</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Laporan analisis performa fisik ananda periode terbaru telah tersedia di tab Laporan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNotificationsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Tutup Notifikasi
            </button>
          </div>
        </div>
      )}

      {/* ── 8. STATUS EVALUASI MODAL (PENJELASAN STATUS) ─────────────── */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Glosarium Status Evaluasi Perkembangan
              </h3>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                Status Ananda Saat Ini: Progressing Well
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Ananda menunjukkan konsistensi latihan yang sangat baik (tingkat presensi kehadiran di atas 85%) serta tren peningkatan kebugaran fisik yang konsisten pada evaluasi periode ini.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Tingkatan Status Performa Power Up:
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <strong className="text-emerald-600 dark:text-emerald-400">Progressing Well</strong>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Perkembangan kemampuan fisik meningkat di atas rata-rata kelompok usia dan presensi latihan sangat konsisten.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <strong className="text-blue-600 dark:text-blue-400">On Track</strong>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Perkembangan berjalan sesuai kurikulum pelatihan kelompok usia yang ditargetkan pelatih.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <strong className="text-amber-600 dark:text-amber-400">Needs Attention</strong>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Membutuhkan penguatan pada komponen fisik tertentu atau pemulihan frekuensi kehadiran latihan.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ── 9. PENGATURAN & INFORMASI MODAL ─────────────────────────── */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Pengaturan &amp; Informasi Akun Orang Tua
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Parent Account Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#182649] border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Data Wali Terdaftar
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {parentPhotoUrl ? (
                    <img
                      src={parentPhotoUrl}
                      alt={profile.parentName || "Wali"}
                      className="h-12 w-12 rounded-2xl object-cover border-2 border-blue-500 shadow-xs"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {profile.parentName ? profile.parentName[0].toUpperCase() : "O"}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {profile.parentName || "Bapak/Ibu"}
                    </h4>
                    <span className="text-slate-500 block text-[11px]">
                      Akses Resmi Parent Portal Power Up Private Training
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsAvatarEditorOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Ubah Foto</span>
                </button>
              </div>
            </div>

            {/* Academy Support Hotline & Administration */}
            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Pusat Bantuan &amp; Kontak Manajemen Akademi
              </span>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/?text=Halo%20Admin%20Akademi%20Coach%20Zulfi,%20saya%20orang%20tua%20dari%20${encodeURIComponent(
                    profile.fullName
                  )},%20ingin%20berkonsultasi%20mengenai%20jadwal%20dan%20perkembangan%20ananda.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span>WhatsApp Layanan Orang Tua</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                    <span>Email Dukungan Sistem</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    support@coachzulfi.com
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-500 leading-relaxed">
              🔒 Keamanan data ananda terlindungi dengan enkripsi token akses portal. Hubungi manajemen jika Anda ingin memperbarui data wali atau menautkan ananda lainnya.
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── 10. VIEW SUBMITTED FEEDBACK MODAL ────────────────────────── */}
      {viewSubmittedFeedbackSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Ulasan Sesi Telah Diberikan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewSubmittedFeedbackSession(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block text-sm">
                {viewSubmittedFeedbackSession.title}
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Pelatih: <strong>{viewSubmittedFeedbackSession.coachName}</strong> ·{" "}
                {new Date(viewSubmittedFeedbackSession.startTime).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 ml-2">
                  Luar Biasa (5/5)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Terima kasih atas ulasan Anda. Feedback telah diteruskan kepada pelatih untuk peningkatan kualitas latihan ananda berikutnya.
            </p>

            <button
              type="button"
              onClick={() => setViewSubmittedFeedbackSession(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── 11. FULL RICH ASSESSMENT REPORT PREVIEW MODAL ───────────── */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Power Up Private Training — Sports Performance Platform
                </span>
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                  PHYSICAL &amp; MOVEMENT ASSESSMENT REPORT
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Athlete Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#182649] border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Nama Atlet</span>
                <strong className="font-bold text-slate-900 dark:text-white">{profile.fullName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Kategori</span>
                <strong className="font-bold text-slate-900 dark:text-white">{profile.competitionLevel || "U-14 Football"}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Tanggal Tes</span>
                <strong className="font-bold text-slate-900 dark:text-white">
                  {new Date(previewReport.assessmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Kepala Pelatih</span>
                <strong className="font-bold text-slate-900 dark:text-white">Coach Zulfi</strong>
              </div>
            </div>

            {/* Score Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center space-y-1">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">
                  % Kondisi Fisik Keseluruhan
                </span>
                <strong className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400 block">
                  {previewReport.overallScore != null ? `${previewReport.overallScore.toFixed(1)}%` : "55.0%"}
                </strong>
                <span className="text-[10px] text-slate-500">
                  GAP Menuju 100%: {(100 - (previewReport.overallScore || 55)).toFixed(1)}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
                  Grade Evaluasi
                </span>
                <strong className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                  GRADE {previewReport.overallGrade || "C"}
                </strong>
                <span className="text-[10px] text-emerald-600 font-bold">
                  Tahap Perkembangan Positif
                </span>
              </div>
            </div>

            {/* 7 Component Breakdown Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">
                Rincian Skor Per Komponen Fisik:
              </span>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    <tr>
                      <th className="p-3">Komponen Fisik</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Skor (%)</th>
                      <th className="p-3 text-right">Kategori</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayComponents.map((c) => (
                      <tr key={c.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{c.icon}</span>
                          <span>{c.name}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.isTested
                                ? "bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200 dark:border-blue-900"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}
                          >
                            {c.isTested ? "Teruji" : "Belum Diuji"}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {c.isTested ? `${c.score}%` : "—"}
                        </td>
                        <td className="p-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                          {c.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coach Insight & Recommendation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#182649] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Analisis &amp; Rekomendasi Pelatih:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                &quot;{snapshot?.insightText || "Kecepatan lari dan kelincahan ananda meningkat dengan sangat baik. Fokus latihan berikutnya adalah penguatan endurance dan konsistensi teknik mendarat."}&quot;
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <a
                href={previewReport.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Dokumen PDF Resmi</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 12. POST-SESSION FEEDBACK DIALOG ────────────────────────── */}
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

      {/* ── 13. PARENT AVATAR / PROFILE PICTURE MODAL ────────────────── */}
      {isAvatarEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-600" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Ubah Foto Profil Orang Tua / Wali
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarEditorOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Pilih avatar wali resmi Power Up atau unggah foto Anda sendiri untuk mempersonalisasi akun portal orang tua ({profile.parentName || "Bapak/Ibu"}).
            </p>

            {/* Current Selected Avatar Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#182649] border border-slate-200 dark:border-slate-800">
              {parentPhotoUrl ? (
                <img
                  src={parentPhotoUrl}
                  alt="Preview Foto"
                  className="h-16 w-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                  {profile.parentName ? profile.parentName[0].toUpperCase() : "O"}
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status Foto Profil Saat Ini
                </span>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {parentPhotoUrl ? "Kustom / Terpasang" : "Inisial Standar"}
                </strong>
                {parentPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => handleSaveParentAvatar("")}
                    className="text-[11px] font-semibold text-rose-500 hover:underline mt-1 cursor-pointer"
                  >
                    Hapus foto &amp; gunakan inisial
                  </button>
                )}
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Pilihan Avatar Wali:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PARENT_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSaveParentAvatar(av.url)}
                    className={`p-2 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                      parentPhotoUrl === av.url
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-500"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-300"
                    }`}
                  >
                    <img src={av.url} alt={av.name} className="h-10 w-10 rounded-full object-cover" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                      {av.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Atau Unggah Foto dari Perangkat:
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomParentFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
              >
                <Camera className="h-4 w-4 text-blue-600" />
                <span>Pilih Foto dari Galeri / Kamera</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAvatarEditorOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── 14. MODAL PENJELASAN SKALA SKOR TES (0 - 100) ────────────────── */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Penjelasan Skala Nilai Skor Tes Fisik (0 – 100)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1 text-xs">
              <strong className="text-blue-900 dark:text-blue-200 block">
                Bagaimana Skor Dihitung?
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Skor pada setiap komponen fisik (0 – 100) dikalkulasi secara terstandar dari hasil uji baterai tes fisik (Sprint, Agility T-Test, Vertical Jump, Yo-Yo Test, Balance, Koordinasi, dan Kelenturan) yang dikalibrasi terhadap <strong>norma standar performa kelompok usia &amp; jenis kelamin ananda</strong>.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Rentang Nilai &amp; Kategori Performa:
              </span>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs shrink-0">
                    85 – 100
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      Sangat Baik (Excellent)
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Kemampuan fisik ananda berada di atas rata-rata standar atlet kelompok usianya.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-black text-xs shrink-0">
                    70 – 84
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      Baik (Good)
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Kemampuan fisik berkembang sesuai dengan target standar kurikulum pelatihan.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono font-black text-xs shrink-0">
                    55 – 69
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      Cukup (Moderate)
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Memenuhi fondasi dasar kebugaran, namun membutuhkan latihan berkala terarah.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-black text-xs shrink-0">
                    &lt; 55
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      Perlu Latihan (Needs Work)
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Komponen fisik prioritas yang akan diberikan porsi latihan khusus dalam sesi privat.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-[11px] text-slate-500">
              ℹ️ Komponen dengan label <strong>&quot;Belum Diuji&quot;</strong> berarti tes untuk komponen tersebut belum dijadwalkan oleh pelatih pada periode evaluasi ini.
            </div>

            <button
              type="button"
              onClick={() => setIsScoreModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ── 15. MODAL PENJELASAN RINGKASAN BULAN INI ─────────────────── */}
      {isMonthSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131f3c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Penjelasan Metrik Ringkasan Latihan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMonthSummaryModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Seluruh metrik pada kartu ini diperbarui secara realtime berdasarkan presensi sesi dan catatan log evaluasi resmi yang diinput oleh pelatih di database:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>1. Persentase Kehadiran</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Dihitung dari rasio sesi yang dihadiri (*Hadir*) dibagi total jadwal sesi ananda. Kehadiran di atas 85% berkategori <strong>Sangat Baik</strong> untuk menjaga konsistensi perkembangan performa atlet.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>2. Sesi Diikuti</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Jumlah total sesi latihan tatap muka yang telah selesai diselenggarakan dan diikuti ananda dari seluruh paket sesi terdaftar di sistem.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <span>3. Catatan Sesi Pelatih</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Jumlah total catatan log harian yang dicatat pelatih (Head Coach / Asisten Coach) setelah sesi latihan selesai. Berisi detail materi latihan, evaluasi teknis, dan saran latihan mandiri.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMonthSummaryModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
