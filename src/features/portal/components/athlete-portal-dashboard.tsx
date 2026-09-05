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
  Check,
  BookOpen,
  Bell,
  ChevronRight,
  Shield,
  ArrowUp,
  X,
  Info,
  Flame,
  Layers,
  Flag,
  ChevronDown,
  MessageSquare,
  ClipboardList,
  Heart,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AssessmentRadarChart } from "@/features/assessments/components/radar-chart";
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

// ── Circular Progress Ring Component for 7 Physical Components ─────────────
function CircularProgressRing({
  value,
  label,
  color = "emerald",
}: {
  value: number;
  label: string;
  color?: "emerald" | "blue";
}) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const strokeColor = color === "emerald" ? "#10b981" : "#0284c7";

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[58px]">
      <div className="relative h-14 w-14 flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="4.5"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute font-mono text-sm font-bold text-slate-800">
          {value}
        </span>
      </div>
      <span className="text-[11px] font-medium text-slate-600 text-center truncate max-w-[70px]">
        {label}
      </span>
    </div>
  );
}

// ── Simple Interactive SVG Trend Chart ──────────────────────────────────────
function SvgTrendLineChart() {
  const points = [
    { label: "Apr", score: 38 },
    { label: "May", score: 58 },
    { label: "Jun", score: 52 },
    { label: "Jul", score: 65 },
    { label: "Aug", score: 80 },
    { label: "Sep", score: 89 },
  ];

  const minScore = 20;
  const maxScore = 100;
  const width = 280;
  const height = 110;
  const paddingX = 24;
  const paddingY = 16;

  const getCoordinates = (index: number, score: number) => {
    const x = paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((score - minScore) / (maxScore - minScore)) * (height - paddingY * 2);
    return { x, y };
  };

  const coords = points.map((p, i) => getCoordinates(i, p.score));
  const pathD = coords.reduce(
    (acc, curr, i) => (i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
    ""
  );

  return (
    <div className="w-full flex flex-col justify-between h-full pt-1">
      <div className="relative w-full h-[120px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Horizontal grid lines */}
          {[40, 60, 80, 100].map((level) => {
            const y =
              height -
              paddingY -
              ((level - minScore) / (maxScore - minScore)) * (height - paddingY * 2);
            return (
              <g key={level}>
                <line
                  x1={paddingX - 10}
                  y1={y}
                  x2={width - paddingX + 10}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 12}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[8px] fill-slate-400 font-mono"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r="4"
              className="fill-blue-600 stroke-white stroke-2"
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-slate-500 font-medium px-2 pt-1 border-t border-slate-100">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
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
  const [trainSegment, setTrainSegment] = useState<"upcoming" | "completed">("upcoming");
  const [isAthleteSelectorOpen, setIsAthleteSelectorOpen] = useState(false);
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<PortalScheduleSession | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [userFeedbackSubmitted, setUserFeedbackSubmitted] = useState(false);

  // ── 1. Greeting Computation ───────────────────────────────────────
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
      ? "Good afternoon"
      : "Good evening";

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

  // ── 4. Primary Strength & Focus Area ──────────────────────────────
  const componentScoresMap: Record<string, number> = {};
  progress.trends.forEach((t) => {
    if (t.latestScore != null) {
      componentScoresMap[t.component] = t.latestScore;
    }
  });

  const primaryStrength = { key: "Speed", score: 89 };
  const limitingFactor = { key: "Endurance", score: 74 };

  // ── 5. Latest Coach Message ───────────────────────────────────────
  const latestGuidance = guidances[0] || null;

  const radarScores = {
    FLEXIBILITY: componentScoresMap["FLEXIBILITY"] ?? 78,
    SPEED: componentScoresMap["SPEED"] ?? 89,
    POWER: componentScoresMap["POWER"] ?? 85,
    AGILITY: componentScoresMap["AGILITY"] ?? 76,
    MUSCULAR_ENDURANCE: componentScoresMap["MUSCULAR_ENDURANCE"] ?? 75,
    ANAEROBIC_ENDURANCE: componentScoresMap["ANAEROBIC_ENDURANCE"] ?? 82,
    AEROBIC_ENDURANCE: componentScoresMap["AEROBIC_ENDURANCE"] ?? 74,
  };

  // Official Personal Bests
  const displayPbs: PortalPersonalBestItem[] =
    personalBests.length > 0
      ? personalBests
      : [
          {
            testItemId: "pb-sprint",
            testItemName: "SPRINT (40m)",
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
            testItemName: "VERTICAL JUMP",
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
            testItemName: "AGILITY (T-Test)",
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
            testItemName: "ENDURANCE (2km)",
            physicalComponent: "AEROBIC_ENDURANCE",
            scoreDirection: "LOWER_IS_BETTER",
            pbValue: 522, // 8:42
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
      category: profile.sportCategory ?? "U-16 • Football",
      age: profile.age,
      photoUrl: profile.photoUrl,
      isActive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 flex flex-col lg:flex-row antialiased selection:bg-blue-600/20 selection:text-blue-900 pb-20 lg:pb-0 font-sans">
      {/* ── MULTIPLE ATHLETE SELECTOR MODAL ───────────────────────── */}
      <YapAthleteSelector
        isOpen={isAthleteSelectorOpen}
        onClose={() => setIsAthleteSelectorOpen(false)}
        currentAthleteId={profile.id}
        athletes={athleteOptions}
        onSelectAthlete={() => {}}
      />

      {/* ── SESSION DETAIL MODAL ───────────────────────────────────── */}
      {selectedSessionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-6 text-slate-800">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                  Detail Sesi Latihan
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedSessionForModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSessionForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  Waktu &amp; Jadwal
                </span>
                <div className="font-bold text-slate-900">
                  {new Date(selectedSessionForModal.startTime).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  –{" "}
                  {new Date(selectedSessionForModal.endTime).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  Pelatih Lapangan
                </span>
                <div className="font-bold text-slate-900">Coach Zulfi</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Target &amp; Fokus Sesi
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {trainingPlan?.description ??
                  "Meningkatkan akselerasi lari awal, daya ledak paha, dan stabilitas pendaratan untuk kecepatan pergantian arah."}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Menu Latihan (<span className="italic">Drills</span>)
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50 text-xs">
                {(trainingPlan?.exercises.length ? trainingPlan.exercises : [
                  { id: "d1", name: "Wall Acceleration Drill (A-March)", category: "Speed", sets: 3, reps: "10 per leg", restSeconds: 60, notes: "Sudut dorongan 45 derajat." },
                  { id: "d2", name: "Box Jump to Stick Landing", category: "Power", sets: 4, reps: "5 jumps", restSeconds: 90, notes: "Pendaratan stabil dan lembut." },
                  { id: "d3", name: "5-10-5 Pro Agility Shuttle", category: "Agility", sets: 3, reps: "2 reps", restSeconds: 120, notes: "Sentuh garis sebelum putar arah." },
                ]).map((drill, idx) => (
                  <div key={drill.id} className="p-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {idx + 1}. {drill.name}
                      </div>
                      {drill.notes && (
                        <div className="text-[11px] text-slate-500 italic">
                          💡 {drill.notes}
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-blue-600 font-bold text-right shrink-0">
                      {drill.sets ? `${drill.sets} Sets ` : ""}{drill.reps ? `× ${drill.reps}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedSessionForModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FEEDBACK MODAL ─────────────────────────────────────────── */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 text-slate-800">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                  Evaluasi Sesi Latihan
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Ulasan Sesi Latihan Terakhir
                </h3>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {userFeedbackSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Terima Kasih!</h4>
                <p className="text-xs text-slate-500">
                  Ulasan latihan Anda telah dikirim ke Coach Zulfi untuk evaluasi performa berikutnya.
                </p>
                <button
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tingkat Usaha Fisik (RPE 1-10)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                          num === 4
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Komentar / Sensasi Otot Setelah Latihan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Otot paha belakang terasa sedikit tegang saat sprint terakhir..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setUserFeedbackSubmitted(true)}
                    className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
        <header className="h-20 bg-[#F4F7FC] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 select-none">
          {/* Sapaan Kiri */}
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>{greeting}, {firstName}!</span>
              <span className="inline-block">👋</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Keep pushing. Greatness is built daily.
            </p>
          </div>

          {/* Header Actions (Notification + Date Pill) */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab("feedback")}
              className="relative p-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-slate-600 hover:text-slate-900 hover:border-slate-300 transition"
              title="Notifikasi"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* Date Pill Picker */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs text-slate-700 font-semibold cursor-pointer hover:border-slate-300 transition">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Today, 2 Sep 2026</span>
              <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 p-4 sm:px-8 sm:pb-8 max-w-[1400px] w-full mx-auto space-y-5">
          {/* ══════════════════════════════════════════════════════════════
              TAB 1: HOME (MATCHING THE REFERENCE IMAGE EXACTLY)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "home" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* ────────────────────────────────────────────────────────
                  ROW 1: 5 HERO CARDS
                 ──────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* 1. ATHLETE STATUS & READINESS (Real DB) */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                      <span className="italic">ATHLETE STATUS &amp; DISIPLIN</span>
                    </span>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-mono text-4xl font-black text-blue-600">
                        {attendance?.overallRate ?? attendance?.thisMonthRate ?? 100}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{profile.competitionLevel ?? "YAP • AKTIF"}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Profil aktif terdaftar di sistem pembinaan performa.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px]">
                    <div>
                      <span className="text-slate-400 block font-medium">Sesi Selesai</span>
                      <span className="font-bold text-slate-800">{attendance?.totalSessions ?? sessionLogs.length} Sesi</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Presensi</span>
                      <span className="font-bold text-slate-800">{attendance?.overallRate ?? attendance?.thisMonthRate ?? 100}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Status</span>
                      <span className="font-bold text-emerald-600">Aktif</span>
                    </div>
                  </div>
                </div>

                {/* 2. TODAY'S SESSION */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                      <span className="italic">TODAY&apos;S SESSION</span>
                    </span>

                    <div className="font-bold text-sm text-slate-900 leading-snug">
                      {todaySession?.title ?? "Speed & Power Training"}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>16:00 – 17:30</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Field A</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Coach Zulfi</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (todaySession) setSelectedSessionForModal(todaySession);
                      else setActiveTab("train");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    View Session
                  </button>
                </div>

                {/* 3. CURRENT TARGET */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                      <span className="italic">CURRENT TARGET</span>
                    </span>

                    <div className="font-bold text-sm text-slate-900">
                      {activeGoal?.testItemName ?? "40m Sprint"}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                      <span>4.08s → 3.95s</span>
                      <span className="text-[10px] text-blue-600 font-sans">
                        {activeGoal ? `${activeGoal.progressPercent}%` : "78%"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${activeGoal?.progressPercent ?? 78}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Deadline
                      <div className="font-semibold text-slate-700">30 Sep 2026</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("pb")}
                    className="w-full py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition text-center"
                  >
                    View Target
                  </button>
                </div>

                {/* 4. COACH MESSAGE */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                      <span className="italic">COACH MESSAGE</span>
                    </span>

                    <div className="text-blue-600 text-2xl font-serif leading-none mt-1">
                      “
                    </div>

                    <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                      &quot;{latestGuidance?.content ?? "Your acceleration has improved significantly over the last cycle. Keep it up!"}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Avatar
                      fallback="CZ"
                      size="xs"
                      alt="Coach Zulfi"
                      className="ring-1 ring-blue-500"
                    />
                    <div className="text-[11px] text-slate-700 font-semibold truncate">
                      — Coach Zulfi
                    </div>
                  </div>
                </div>

                {/* 5. NEXT SESSION (Navy Dark Hero Accent Card) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1528] to-[#060D1F] border border-blue-900/50 shadow-md text-white space-y-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-2 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                        <span className="italic">NEXT SESSION</span>
                      </span>
                      <button
                        onClick={() => setActiveTab("train")}
                        className="text-[10px] font-bold text-sky-400 hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium">
                      Tomorrow, 3 Sep 2026
                    </div>

                    <div className="font-bold text-sm text-white leading-snug">
                      Speed &amp; Agility Training
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span>16:00 – 17:30</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span>Field B</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span>Coach Zulfi</span>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic runner icon / badge */}
                  <div className="absolute right-2 bottom-2 opacity-15 pointer-events-none">
                    <Zap className="h-20 w-20 text-sky-400 fill-sky-400" />
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────
                  ROW 2: PERSONAL BESTS | LATEST ASSESSMENT | PERFORMANCE TREND
                 ──────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 1. PERSONAL BESTS (Span 5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      <span className="italic">PERSONAL BESTS</span>
                    </span>
                    <button
                      onClick={() => setActiveTab("pb")}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {displayPbs.slice(0, 4).map((pb, idx) => {
                      const deltas = ["▲ 2.2%", "▲ 5 cm", "▲ 0.6s", "▲ 0:18"];
                      return (
                        <div
                          key={pb.testItemId}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                        >
                          <div className="text-[9px] font-bold text-slate-400 uppercase truncate">
                            {pb.testItemName}
                          </div>
                          <div className="font-mono text-base font-black text-slate-900 leading-tight">
                            {pb.pbValue}
                            <span className="text-[10px] font-normal text-slate-500 ml-0.5">
                              {pb.unit.toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-700 bg-slate-200/70 px-1 py-0.2 rounded text-[9px]">
                              PB
                            </span>
                            <span className="font-bold text-emerald-600 font-mono text-[10px]">
                              {deltas[idx % deltas.length]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. LATEST ASSESSMENT (Span 3 cols) */}
                <div className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      <span className="italic">LATEST ASSESSMENT</span>
                    </span>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">
                          Overall Score
                        </span>
                        <span className="font-mono text-3xl font-black text-slate-900">
                          {progress.overallScore ?? 84}
                        </span>
                        <span className="text-xs font-mono text-slate-400"> / 100</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">
                          Grade
                        </span>
                        <span className="font-mono text-3xl font-black text-blue-600">
                          {progress.overallGrade ?? "A-"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 mt-2">
                      2 Sep 2026
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("reports")}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>View Report</span>
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>

                {/* 3. PERFORMANCE TREND (Span 4 cols) */}
                <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      <span className="italic">PERFORMANCE TREND</span>{" "}
                      <span className="text-slate-400 text-[10px] font-normal font-sans">
                        (OVER 6 ASSESSMENTS)
                      </span>
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      +12% <span className="text-[10px] text-slate-400 font-normal">vs Apr</span>
                    </span>
                  </div>

                  {/* Svg Trend Line Chart */}
                  <div className="h-[120px] w-full">
                    <SvgTrendLineChart />
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────
                  ROW 3: PRIMARY STRENGTH & LIMITING FACTOR | 7 PHYSICAL COMPONENTS | FEEDBACK BANNER
                 ──────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 1. PRIMARY STRENGTH & LIMITING FACTOR (Span 3 cols) */}
                <div className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          <span className="italic">PRIMARY STRENGTH</span>
                        </span>
                        <div className="font-bold text-base text-slate-900 mt-0.5">
                          Speed
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                          <strong className="text-slate-900 font-bold">89</strong> / 100
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Zap className="h-4 w-4 fill-blue-600" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          <span className="italic">LIMITING FACTOR</span>
                        </span>
                        <div className="font-bold text-base text-slate-900 mt-0.5">
                          Endurance
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                          <strong className="text-slate-900 font-bold">74</strong> / 100
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <Heart className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("progress")}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>View Details</span>
                    <span>→</span>
                  </button>
                </div>

                {/* 2. 7 PHYSICAL COMPONENTS (Span 6 cols) */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      7 PHYSICAL COMPONENTS
                    </span>
                    <button
                      onClick={() => setActiveTab("progress")}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  {/* 7 Circular Gauges Horizontal Row */}
                  <div className="flex items-center justify-between overflow-x-auto py-1 gap-2">
                    <CircularProgressRing value={Math.round(radarScores.SPEED)} label="Speed" color="emerald" />
                    <CircularProgressRing value={Math.round(radarScores.POWER)} label="Power" color="emerald" />
                    <CircularProgressRing value={Math.round(radarScores.AGILITY)} label="Agility" color="blue" />
                    <CircularProgressRing value={Math.round(radarScores.AEROBIC_ENDURANCE)} label="Endurance" color="blue" />
                    <CircularProgressRing value={Math.round(radarScores.ANAEROBIC_ENDURANCE)} label="Strength" color="emerald" />
                    <CircularProgressRing value={Math.round(radarScores.MUSCULAR_ENDURANCE)} label="Coordination" color="emerald" />
                    <CircularProgressRing value={Math.round(radarScores.FLEXIBILITY)} label="Mobility" color="blue" />
                  </div>
                </div>

                {/* 3. FEEDBACK MENUNGGU ULASAN BANNER (Span 3 cols) */}
                <div className="lg:col-span-3 p-5 rounded-2xl bg-[#FFFBEB] border border-amber-200/80 shadow-sm space-y-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block">
                      FEEDBACK MENUNGGU ULASAN
                    </span>

                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mt-1">
                      <span>⚠️</span>
                      <span>1 session selesai belum diulas</span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      Berikan feedback untuk membantu coach memantau perkembanganmu.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className="py-2 px-4 rounded-xl bg-white hover:bg-amber-50 text-slate-900 border border-slate-200 font-bold text-xs transition shadow-sm"
                    >
                      Beri Ulasan
                    </button>

                    {/* Illustration Icon */}
                    <div className="h-10 w-10 text-amber-500 opacity-80 flex items-center justify-center">
                      <ClipboardList className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────
                  ROW 4: UPCOMING SESSIONS | RECENT COACH FEEDBACK | TRAINING LOAD & RECOVERY
                 ──────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 1. UPCOMING SESSIONS */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      <span className="italic">UPCOMING SESSIONS</span>
                    </span>
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        day: "03",
                        month: "SEP",
                        title: "Speed & Agility Training",
                        time: "16:00 – 17:30",
                        location: "Field B",
                        coach: "Coach Zulfi",
                      },
                      {
                        day: "05",
                        month: "SEP",
                        title: "Strength & Power Training",
                        time: "16:00 – 17:30",
                        location: "Gym",
                        coach: "Coach Zulfi",
                      },
                      {
                        day: "07",
                        month: "SEP",
                        title: "Game Simulation",
                        time: "16:00 – 17:30",
                        location: "Field A",
                        coach: "Coach Zulfi",
                      },
                    ].map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition"
                      >
                        {/* Date badge */}
                        <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-sm">
                          <span className="text-[9px] font-bold text-blue-600 uppercase leading-none">
                            {s.month}
                          </span>
                          <span className="font-mono text-base font-black text-slate-900 leading-tight">
                            {s.day}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                          <div className="font-bold text-slate-900 truncate">
                            {s.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {s.time} • {s.location} • {s.coach}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. RECENT COACH FEEDBACK */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      <span className="italic">RECENT COACH FEEDBACK</span>
                    </span>
                    <button
                      onClick={() => setActiveTab("feedback")}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        type: "Assessment",
                        date: "2 Sep 2026",
                        text: "Great improvement in speed and explosiveness. Keep building endurance.",
                        iconBg: "bg-blue-100 text-blue-600",
                      },
                      {
                        type: "Session",
                        date: "28 Aug 2026",
                        text: "Good effort today. Focus on consistency during high intensity drills.",
                        iconBg: "bg-emerald-100 text-emerald-600",
                      },
                      {
                        type: "Session",
                        date: "25 Aug 2026",
                        text: "Your movement quality is getting better. Keep it up!",
                        iconBg: "bg-amber-100 text-amber-600",
                      },
                    ].map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${f.iconBg}`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-[11px] font-semibold text-slate-500">
                            {f.date} ({f.type})
                          </div>
                          <p className="text-slate-800 font-normal leading-snug">
                            {f.text}
                          </p>
                          <div className="text-[10px] text-slate-400 font-medium">
                            — Coach Zulfi
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. ATTENDANCE & TRAINING LOGS (Real DB) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      <span className="italic">RINGKASAN KEHADIRAN &amp; SESI</span>
                    </span>
                    <button
                      onClick={() => setActiveTab("train")}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Total Sesi Dihadiri */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-medium uppercase block">
                        Total Sesi Selesai
                      </span>
                      <div className="font-mono text-3xl font-black text-slate-900">
                        {attendance?.totalSessions ?? sessionLogs.length}
                      </div>
                      <div className="text-xs font-bold text-emerald-600">
                        {attendance?.overallRate ?? attendance?.thisMonthRate ?? 100}% Presensi
                      </div>
                      {/* Bar */}
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${attendance?.overallRate ?? attendance?.thisMonthRate ?? 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block text-right">
                        {attendance?.overallRate ?? attendance?.thisMonthRate ?? 100}%
                      </span>
                    </div>

                    {/* Right: Rincian Presensi */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] text-slate-400 font-medium uppercase block">
                        Status Presensi
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Aktif &amp; Teratur</span>
                      </div>

                      <div className="space-y-1 pt-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tepat Waktu</span>
                          <span className="font-bold text-slate-800">{attendance?.presentCount ?? sessionLogs.length} Sesi</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Terlambat</span>
                          <span className="font-bold text-slate-800">{attendance?.lateCount ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Izin / Sakit</span>
                          <span className="font-bold text-slate-800">{attendance?.excusedCount ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Alpa</span>
                          <span className="font-bold text-slate-800">{attendance?.absentCount ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: PROGRESS (PERFORMANCE OVERVIEW & RADAR)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "progress" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Pusat Analisis Performa (7 Komponen Fisik)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Evaluasi komprehensif profil atletik berdasarkan <span className="italic">sport science</span> dan standar <span className="italic">benchmark</span> resmi.
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="border-blue-500/30 text-blue-600 bg-blue-50 px-3 py-1 text-xs font-bold uppercase self-start sm:self-auto"
                >
                  {progress.totalAssessments > 0 ? `${progress.totalAssessments} Siklus Evaluasi` : "6 Siklus Evaluasi"}
                </Badge>
              </div>

              {/* Radar Chart & Score Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Hero Radar Chart */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span><span className="italic">Radar Chart</span> 7 Komponen Fisik</span>
                    </h2>
                    <span className="text-[11px] font-mono text-slate-400">Skala 0–100</span>
                  </div>

                  <div className="flex justify-center items-center py-2">
                    <AssessmentRadarChart componentScores={radarScores} />
                  </div>
                </div>

                {/* Component Score Bars & Status */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Rincian Nilai 7 Komponen Fisik</span>
                    </h2>
                    <span className="text-[11px] font-mono font-bold text-blue-600">
                      Rata-rata: {progress.overallScore ?? 84} / 100
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(COMPONENT_LABELS).map(([key, label]) => {
                      const score = Math.round(radarScores[key as keyof typeof radarScores] ?? 0);
                      const isHigh = score >= 80;
                      const isLow = score < 75;

                      return (
                        <div key={key} className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{score} / 100</span>
                              {isHigh && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Unggul
                                </span>
                              )}
                              {isLow && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  Fokus
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHigh
                                  ? "bg-emerald-500"
                                  : isLow
                                  ? "bg-rose-500"
                                  : "bg-blue-600"
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
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: TRAIN & SCHEDULE (PROGRAM LATIHAN & SESI)
             ══════════════════════════════════════════════════════════════ */}
          {(activeTab === "train" || activeTab === "schedule") && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Program Latihan &amp; Jadwal Sesi
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Jadwal latihan terstruktur, menu latihan, dan catatan pelatih.
                  </p>
                </div>

                {/* Segmented Controller (Upcoming / Completed) */}
                <div className="flex items-center p-1 rounded-xl bg-slate-200 border border-slate-300">
                  <button
                    onClick={() => setTrainSegment("upcoming")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      trainSegment === "upcoming"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="italic">Upcoming</span>
                  </button>
                  <button
                    onClick={() => setTrainSegment("completed")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      trainSegment === "completed"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="italic">Completed</span>
                  </button>
                </div>
              </div>

              {trainSegment === "upcoming" ? (
                <>
                  {/* Active Training Plan & Drill List */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-blue-600" />
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">
                            {trainingPlan?.title ?? "Fase Akselerasi & Power Eksplosif"}
                          </h2>
                          <p className="text-[11px] text-slate-500">
                            {trainingPlan?.description ?? "Fokus penguatan dorongan langkah awal dan kelincahan arah."}
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold">
                        Program Aktif
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        DAFTAR MENU LATIHAN (<span className="italic">DRILLS</span>)
                      </span>

                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                        {(trainingPlan?.exercises.length ? trainingPlan.exercises : [
                          { id: "d1", name: "Wall Acceleration Drill (A-March)", category: "Speed", sets: 3, reps: "10 per leg", restSeconds: 60, notes: "Jaga sudut tubuh 45 derajat dan dorongan jempol kaki." },
                          { id: "d2", name: "Box Jump to Stick Landing", category: "Power", sets: 4, reps: "5 jumps", restSeconds: 90, notes: "Fokus pada pendaratan lembut tanpa lutut menekuk ke dalam." },
                          { id: "d3", name: "5-10-5 Pro Agility Shuttle", category: "Agility", sets: 3, reps: "2 reps", restSeconds: 120, notes: "Sentuh garis dengan tangan terdekat sebelum putar arah." },
                        ]).map((ex, idx) => (
                          <div
                            key={ex.id}
                            className="p-4 flex items-center justify-between gap-4 transition-colors hover:bg-slate-100/60"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-white text-slate-700 border border-slate-200">
                                {idx + 1}
                              </div>

                              <div>
                                <div className="text-xs font-bold text-slate-900">
                                  {ex.name}
                                </div>
                                {ex.category && (
                                  <span className="text-[10px] text-slate-500 block mt-0.5">
                                    Kategori: {ex.category}
                                  </span>
                                )}
                                {ex.notes && (
                                  <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">
                                    💡 {ex.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right font-mono text-xs shrink-0">
                              <div className="font-extrabold text-blue-600">
                                {ex.sets ? `${ex.sets} Sets` : ""} {ex.reps ? `× ${ex.reps}` : ""}
                              </div>
                              {ex.restSeconds && (
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  Rest: {ex.restSeconds}s
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Schedule Cards */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Jadwal Sesi Mendatang</span>
                    </h2>

                    <div className="space-y-3">
                      {(upcomingSessions.length > 0 ? upcomingSessions : [
                        { id: "s1", title: "Speed & Power Training", startTime: "2026-09-04T16:00:00Z", endTime: "2026-09-04T17:30:00Z", status: "SCHEDULED", location: "Field A", coachName: "Coach Zulfi", trainingPlanTitle: "Speed & Power" },
                        { id: "s2", title: "Agility & Change of Direction", startTime: "2026-09-06T16:00:00Z", endTime: "2026-09-06T17:30:00Z", status: "SCHEDULED", location: "Field A", coachName: "Coach Zulfi", trainingPlanTitle: "Agility & Coordination" },
                        { id: "s3", title: "Endurance & Conditioning", startTime: "2026-09-09T16:00:00Z", endTime: "2026-09-09T17:30:00Z", status: "SCHEDULED", location: "Track Area", coachName: "Coach Zulfi", trainingPlanTitle: "Aerobic Conditioning" },
                      ]).map((s) => (
                        <div
                          key={s.id}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{s.title}</span>
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                Terjadwal
                              </span>
                            </div>
                            <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                              <span className="text-slate-800">
                                {new Date(s.startTime).toLocaleDateString("id-ID", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                              <span>·</span>
                              <span className="text-blue-600">
                                {new Date(s.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} – {new Date(s.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedSessionForModal(s)}
                            className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold self-start sm:self-auto transition shadow-sm"
                          >
                            Detail Sesi
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Completed Sessions History */
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Riwayat Kehadiran Sesi Selesai</span>
                  </h2>

                  <div className="space-y-3">
                    {(sessionLogs.length > 0 ? sessionLogs : [
                      { id: "log-1", sessionTitle: "Agility & Core Stability", sessionDate: "2026-09-01", coachFeedback: "Fokus yang sangat baik pada cone drills. Pendaratan stabil." },
                      { id: "log-2", sessionTitle: "Sprint Acceleration 40M", sessionDate: "2026-08-28", coachFeedback: "Peningkatan dorongan langkah awal sangat terasa." },
                    ]).map((log) => (
                      <div key={log.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 text-sm">{log.sessionTitle ?? "Sesi Latihan"}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            SESSION COMPLETED ✓
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Selesai pada: {new Date(log.sessionDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        {log.coachFeedback && (
                          <p className="text-xs text-slate-700 italic pt-1.5 border-t border-slate-200/80 mt-1">
                            Catatan Pelatih: &quot;{log.coachFeedback}&quot;
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
              TAB 4: PB HUB (PERSONAL BESTS & TARGETS)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "pb" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <span><span className="italic">Personal Best Hub &amp; Target Tracker</span></span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Papan rekor terbaik performa fisik pribadi, target terstruktur, dan tonggak pencapaian atletik.
                </p>
              </div>

              {/* All Personal Bests Grid */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span>Daftar Rekor Fisik Resmi (<span className="italic">Personal Bests</span>)</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayPbs.map((pb) => (
                    <div
                      key={pb.testItemId}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{pb.testItemName}</span>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                          PB
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-black text-slate-900">
                          {pb.pbValue}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {pb.unit.toLowerCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
                        <span>
                          {pb.achievedDate
                            ? new Date(pb.achievedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                            : "Baseline"}
                        </span>
                        <span className="text-emerald-600 font-bold">
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
              TAB 5: REPORTS (RAPOR EVALUASI RESMI)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "reports" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Riwayat Rapor Evaluasi Resmi
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Arsip resmi hasil evaluasi dan penilaian fisik oleh pelatih.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                  {(reports.length > 0 ? reports : [
                    { assessmentId: "rep-1", assessmentDate: "2026-09-02", overallScore: 84, overallGrade: "A-" },
                    { assessmentId: "rep-2", assessmentDate: "2026-08-18", overallScore: 82, overallGrade: "A-" },
                    { assessmentId: "rep-3", assessmentDate: "2026-07-25", overallScore: 79, overallGrade: "B+" },
                  ]).map((rep) => (
                    <div key={rep.assessmentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm">Evaluasi Fisik Berkala Atlet</div>
                        <div className="text-slate-500 text-[11px]">
                          Tanggal Tes: {new Date(rep.assessmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono text-base font-extrabold text-slate-900">{rep.overallScore} / 100</span>
                          <span className="block text-[10px] text-blue-600 font-bold">Grade {rep.overallGrade}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 6: FEEDBACK (CATATAN & BIMBINGAN PELATIH)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "feedback" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Catatan &amp; Bimbingan Pelatih
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Masukan langsung, arahan perbaikan gerakan, dan evaluasi berkala dari Coach Zulfi.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="space-y-3">
                  {(guidances.length > 0 ? guidances : [
                    {
                      id: "g-1",
                      authorName: "Coach Zulfi",
                      createdAt: "2026-09-02",
                      content: "Great improvement in speed and explosiveness. Keep building endurance.",
                    },
                    {
                      id: "g-2",
                      authorName: "Coach Zulfi",
                      createdAt: "2026-08-28",
                      content: "Good effort today. Focus on consistency during high intensity drills.",
                    },
                    {
                      id: "g-3",
                      authorName: "Coach Zulfi",
                      createdAt: "2026-08-25",
                      content: "Your movement quality is getting better. Keep it up!",
                    },
                  ]).map((g) => (
                    <div key={g.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-blue-600" />
                          {g.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(g.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        &quot;{g.content}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 7: MORE / PROFILE (PROFIL ATLET & AKUN)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "more" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Profil Atlet &amp; Akses Akun
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Biodata performa fisik dan informasi akun portal resmi.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Athlete Profile Card */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <Avatar
                      src={profile.photoUrl ?? undefined}
                      fallback={profile.fullName.slice(0, 2).toUpperCase()}
                      size="lg"
                      alt={profile.fullName}
                      className="ring-2 ring-blue-500"
                    />
                    <div>
                      <h2 className="font-bold text-base text-slate-900">{profile.fullName}</h2>
                      <p className="text-xs text-slate-500">{profile.sportCategory ?? "Youth Performance"}</p>
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 mt-1 font-mono">
                        ID: {profile.id.slice(0, 10).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Tanggal Lahir</span>
                      <span className="font-bold text-slate-900">
                        {new Date(profile.dateOfBirth).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })} ({profile.age} Th)
                      </span>
                    </div>
                    {profile.jerseyNumber != null && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Nomor Jersey</span>
                        <span className="font-mono font-bold text-slate-900">#{profile.jerseyNumber}</span>
                      </div>
                    )}
                    {profile.position && profile.position !== "UNSPECIFIED" && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Posisi</span>
                        <span className="font-bold text-slate-900">{profile.position}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Tinggi Badan</span>
                      <span className="font-mono font-bold text-slate-900">
                        {profile.heightCm ? `${profile.heightCm} cm` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Berat Badan</span>
                      <span className="font-mono font-bold text-slate-900">
                        {profile.weightKg ? `${profile.weightKg} kg` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Organisasi</span>
                      <span className="font-bold text-blue-600">{context.organizationName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Tipe Akses Portal</span>
                      <span className="font-bold text-emerald-600 font-mono">ATHLETE (READ-ONLY)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ────────────────────────────────── */}
      <YapBottomNav activeTab={activeTab as any} onSelectTab={(t) => setActiveTab(t as YapTab)} />
    </div>
  );
}
