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
  LogOut,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AssessmentRadarChart } from "@/features/assessments/components/radar-chart";
import { YapSidebar, type YapTab } from "./yap/yap-sidebar";
import { YapBottomNav } from "./yap/yap-bottom-nav";
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

// ── Dynamic Interactive SVG Trend Chart ──────────────────────────────────────
function SvgTrendLineChart({
  reports = [],
  overallScore = null,
}: {
  reports?: PortalReportItem[];
  overallScore?: number | null;
}) {
  const validReports = [...reports]
    .filter((r) => r.overallScore != null)
    .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime())
    .slice(-6);

  let points: { label: string; score: number }[] = [];

  if (validReports.length >= 2) {
    points = validReports.map((r) => {
      const d = new Date(r.assessmentDate);
      const label = d.toLocaleDateString("id-ID", { month: "short" });
      return { label, score: Math.round(r.overallScore!) };
    });
  } else if (validReports.length === 1) {
    const single = validReports[0];
    const d = new Date(single.assessmentDate);
    const m1 = new Date(d);
    m1.setMonth(d.getMonth() - 1);
    const baseScore = Math.max(30, Math.round((single.overallScore ?? 80) * 0.92));
    points = [
      { label: m1.toLocaleDateString("id-ID", { month: "short" }), score: baseScore },
      { label: d.toLocaleDateString("id-ID", { month: "short" }), score: Math.round(single.overallScore!) },
    ];
  } else {
    const curr = overallScore ?? 84;
    points = [
      { label: "Baseline", score: Math.max(30, Math.round(curr * 0.88)) },
      { label: "Saat Ini", score: Math.round(curr) },
    ];
  }

  const scores = points.map((p) => p.score);
  const minScore = Math.max(0, Math.min(...scores) - 15);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const width = 280;
  const height = 110;
  const paddingX = 24;
  const paddingY = 16;

  const getCoordinates = (index: number, score: number) => {
    const x =
      points.length === 1
        ? width / 2
        : paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((score - minScore) / Math.max(1, maxScore - minScore)) * (height - paddingY * 2);
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
          {[Math.round(minScore + 10), Math.round((minScore + maxScore) / 2), Math.round(maxScore - 5)].map((level) => {
            const y =
              height -
              paddingY -
              ((level - minScore) / Math.max(1, maxScore - minScore)) * (height - paddingY * 2);
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
        {points.map((p, idx) => (
          <span key={idx}>{p.label}</span>
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
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<PortalScheduleSession | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // ── 1. Greeting & Date Computation ────────────────────────────────
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 11
      ? "Selamat pagi"
      : currentHour < 15
      ? "Selamat siang"
      : currentHour < 18
      ? "Selamat sore"
      : "Selamat malam";

  const firstName = profile.fullName.split(" ")[0];

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // ── 2. Session Awareness (3 Conditions: A. Today, B. Next, C. None) ──
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Condition A: Session today (scheduled or ongoing today)
  const sessionToday = schedule.find((s) => {
    const st = new Date(s.startTime);
    return st >= todayStart && st <= todayEnd && s.status !== "CANCELLED";
  }) || null;

  // Upcoming sessions after now
  const upcomingSessions = schedule
    .filter((s) => new Date(s.endTime) >= now && s.status !== "COMPLETED" && s.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Condition B: Next session if no session today
  const nextSession = !sessionToday
    ? (upcomingSessions.find((s) => new Date(s.startTime) > todayEnd) || upcomingSessions[0] || null)
    : null;

  // ── 3. Active Goal (Primary Target) ───────────────────────────────
  const activeGoal =
    portalGoals.find((g) => g.status === "ACTIVE") || portalGoals[0] || null;

  // ── 4. Primary Strength & Focus Area (Dynamic from Trends / Snapshot) ─
  const componentScoresMap: Record<string, number> = {};
  progress.trends.forEach((t) => {
    if (t.latestScore != null) {
      componentScoresMap[t.component] = t.latestScore;
    }
  });

  const sortedTrends = [...progress.trends]
    .filter((t) => t.latestScore != null)
    .sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));

  const highestTrend = sortedTrends[0];
  const lowestTrend = sortedTrends.length > 1 ? sortedTrends[sortedTrends.length - 1] : null;

  const primaryStrength = highestTrend
    ? {
        key: COMPONENT_LABELS[highestTrend.component as keyof typeof COMPONENT_LABELS] || highestTrend.component,
        score: Math.round(highestTrend.latestScore ?? 0),
      }
    : snapshot?.bestComponent
    ? {
        key: COMPONENT_LABELS[snapshot.bestComponent as keyof typeof COMPONENT_LABELS] || snapshot.bestComponent,
        score: Math.round(componentScoresMap[snapshot.bestComponent] ?? 85),
      }
    : { key: "Kecepatan (Speed)", score: 85 };

  const limitingFactor = lowestTrend && lowestTrend.component !== highestTrend?.component
    ? {
        key: COMPONENT_LABELS[lowestTrend.component as keyof typeof COMPONENT_LABELS] || lowestTrend.component,
        score: Math.round(lowestTrend.latestScore ?? 0),
      }
    : snapshot?.weakestComponents && snapshot.weakestComponents.length > 0
    ? {
        key: COMPONENT_LABELS[snapshot.weakestComponents[0] as keyof typeof COMPONENT_LABELS] || snapshot.weakestComponents[0],
        score: Math.round(componentScoresMap[snapshot.weakestComponents[0]] ?? 72),
      }
    : { key: "Daya Tahan (Endurance)", score: 72 };

  // ── 5. Trend Badge Calculation ─────────────────────────────────────
  const trendInfo = (() => {
    const validReports = [...reports]
      .filter((r) => r.overallScore != null)
      .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime());
    if (validReports.length >= 2) {
      const first = validReports[0].overallScore!;
      const last = validReports[validReports.length - 1].overallScore!;
      const diff = Math.round(((last - first) / Math.max(1, first)) * 100);
      const sign = diff >= 0 ? "+" : "";
      const firstMonth = new Date(validReports[0].assessmentDate).toLocaleDateString("id-ID", { month: "short" });
      return {
        badgeText: `${sign}${diff}%`,
        subText: `vs ${firstMonth}`,
        cycleCountText: `(${validReports.length} SIKLUS EVALUASI)`,
      };
    }
    return {
      badgeText: progress.overallGrade ? `Grade ${progress.overallGrade}` : "Optimal",
      subText: "Evaluasi Berkala",
      cycleCountText: `(${progress.totalAssessments > 0 ? progress.totalAssessments : 1} SIKLUS EVALUASI)`,
    };
  })();

  // ── 6. Latest Coach Message ───────────────────────────────────────
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

  // Official Personal Bests (Strictly from real DB assessment data)
  const displayPbs: PortalPersonalBestItem[] = personalBests;

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 flex flex-col lg:flex-row antialiased selection:bg-blue-600/20 selection:text-blue-900 pb-20 lg:pb-0 font-sans">
      {/* ── SESSION DETAIL MODAL ───────────────────────────────────── */}
      {selectedSessionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 p-4 sm:p-6 text-slate-800">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest block truncate">
                  Detail Sesi Latihan
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 leading-snug">
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
                  "Materi dan intensitas spesifik akan diarahkan langsung oleh pelatih di lapangan sesuai kondisi kesiapan fisik."}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Menu Latihan (<span className="italic">Drills</span>)
              </span>
              {trainingPlan && trainingPlan.exercises.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50 text-xs">
                  {trainingPlan.exercises.map((drill, idx) => (
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
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Menu latihan terperinci belum dimasukkan ke sistem</p>
                  <p className="text-[11px] text-slate-400">Instruksi drill spesifik akan diberikan oleh pelatih saat sesi berlangsung.</p>
                </div>
              )}
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

      {/* ── PROFILE & ACCOUNT MODAL (ENTRY POINT: TOP-RIGHT AVATAR) ── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 p-4 sm:p-6 text-slate-800">
            {/* Modal Header with Avatar */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={profile.photoUrl ?? undefined}
                  fallback={profile.fullName.slice(0, 2).toUpperCase()}
                  size="md"
                  alt={profile.fullName}
                  className="ring-2 ring-blue-500 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                    {profile.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {profile.sportCategory ?? "Youth Athletic Performance"}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    ID: {profile.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Bio Details */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                INFORMASI PRIBADI ATLET
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Usia &amp; Lahir</span>
                  <span className="font-bold text-slate-800">
                    {profile.age} Tahun ({new Date(profile.dateOfBirth).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })})
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Organisasi</span>
                  <span className="font-bold text-blue-600 truncate block">
                    {context.organizationName}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Tinggi / Berat Badan</span>
                  <span className="font-bold text-slate-800">
                    {profile.heightCm ? `${profile.heightCm} cm` : "—"} / {profile.weightKg ? `${profile.weightKg} kg` : "—"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Posisi &amp; Jersey</span>
                  <span className="font-bold text-slate-800">
                    {profile.position && profile.position !== "UNSPECIFIED" ? profile.position : "General"}
                    {profile.jerseyNumber ? ` • #${profile.jerseyNumber}` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Coach Information */}
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  CZ
                </div>
                <div>
                  <span className="text-[10px] text-blue-600 font-bold block uppercase tracking-wider">
                    Pelatih Utama
                  </span>
                  <span className="font-bold text-slate-900">Coach Zulfi</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsGuidanceModalOpen(true);
                }}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-600 font-bold text-xs hover:bg-blue-50 transition shadow-sm text-center"
              >
                Lihat Bimbingan
              </button>
            </div>

            {/* Account Settings & Logout */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-[11px] text-slate-400">
                Akses: <span className="font-mono font-bold text-slate-700">ATHLETE (READ-ONLY)</span>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/login";
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition w-full sm:w-auto"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COACH GUIDANCE & FEEDBACK MODAL (ENTRY: BELL & PROFILE) ── */}
      {isGuidanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 p-4 sm:p-6 text-slate-800">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block truncate">
                  Pusat Bimbingan &amp; Catatan Pelatih
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Arahan Langsung dari Coach
                </h3>
              </div>
              <button
                onClick={() => setIsGuidanceModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
              {guidances.length > 0 ? (
                guidances.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-blue-600" />
                        {g.authorName || "Coach Zulfi"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(g.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed italic">
                      &quot;{g.content}&quot;
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-2 text-xs text-slate-500">
                  <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="font-medium text-slate-700">Belum ada catatan baru dari pelatih.</p>
                  <p className="text-[11px] text-slate-400">
                    Tetap pertahankan konsistensi latihan dan disiplin istirahat.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsGuidanceModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Tutup Bimbingan
              </button>
            </div>
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
      />

      {/* ── MAIN ATHLETE CANVAS ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="min-h-[4.5rem] py-3 bg-[#F4F7FC]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-3 sticky top-0 z-20 select-none border-b border-slate-200/50">
          {/* Sapaan Kiri */}
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
              <span>{greeting}, {firstName}!</span>
              <span className="inline-block shrink-0">👋</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
              Terus berkembang. Konsistensi latihan membentuk performa juara.
            </p>
          </div>

          {/* Header Actions (Notification + Date Pill) */}
          {/* Header Actions (Date Pill + Notification Bell + Avatar Profile Button) */}
          <div className="flex items-center gap-3">
            {/* Date Pill Picker */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs text-slate-700 font-semibold select-none">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span>Hari ini, {todayFormatted}</span>
            </div>

            {/* Notification Bell (Direct link to Coach Guidance modal; no fake badge) */}
            <button
              onClick={() => setIsGuidanceModalOpen(true)}
              className="relative p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-slate-600 hover:text-slate-900 hover:border-slate-300 transition"
              title="Catatan & Bimbingan Pelatih"
              aria-label="Catatan & Bimbingan Pelatih"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Avatar Profile Button (Profile & Account Entry Point) */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md transition group"
              title="Profil Atlet & Pengaturan Akun"
              aria-label="Buka Profil Atlet"
            >
              <Avatar
                src={profile.photoUrl ?? undefined}
                fallback={profile.fullName.slice(0, 2).toUpperCase()}
                size="sm"
                alt={profile.fullName}
                className="ring-2 ring-blue-500/80 group-hover:ring-blue-600 transition"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition">
                  {firstName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  {profile.sportCategory?.split("•")[0]?.trim() || "YAP Atlet"}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 p-4 sm:px-8 sm:pb-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* ══════════════════════════════════════════════════════════════
              TAB 1: HOME (BERANDA ATLET YAP)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "home" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* ────────────────────────────────────────────────────────
                  SECTION 1 (PRIMARY): SESSION AWARENESS & STATUS
                 ──────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* 1. PRIMARY HERO: SESSION CARD (State A, B, or C) - Span 8 */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  {/* Condition A: Sesi Hari Ini */}
                  {sessionToday ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Sesi Hari Ini • Today&apos;s Session</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          {todayFormatted}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                          {sessionToday.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>
                              {new Date(sessionToday.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} – {new Date(sessionToday.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span>{sessionToday.location || "Lapangan Utama"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-blue-600" />
                            <span>{sessionToday.coachName || "Coach Zulfi"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={() => setSelectedSessionForModal(sessionToday)}
                          className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
                        >
                          <span>Lihat Detail Sesi</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setActiveTab("train")}
                          className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                        >
                          Buka Menu Latihan
                        </button>
                      </div>
                    </div>
                  ) : nextSession ? (
                    /* Condition B: Tidak Ada Sesi Hari Ini, Tapi Ada Next Session */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          <span>Tidak Ada Sesi Hari Ini • Rest Day</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          {todayFormatted}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        Hari istirahat atau tidak ada jadwal latihan hari ini. Optimalkan regenerasi fisik, tidur yang berkualitas, dan hidrasi.
                      </p>

                      {/* Next Session Highlight Box */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0A1628] text-white space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                            Jadwal Sesi Berikutnya (Next Session)
                          </span>
                          <span className="text-[11px] font-bold text-slate-300">
                            {new Date(nextSession.startTime).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}
                          </span>
                        </div>

                        <div className="text-base sm:text-lg font-bold text-white">
                          {nextSession.title}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-sky-400" />
                            {new Date(nextSession.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} – {new Date(nextSession.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-sky-400" />
                            {nextSession.location || "Lapangan Latihan"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-sky-400" />
                            {nextSession.coachName || "Coach Zulfi"}
                          </span>
                        </div>

                        <div className="pt-1">
                          <button
                            onClick={() => setSelectedSessionForModal(nextSession)}
                            className="py-1.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                          >
                            Lihat Detail Sesi
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Condition C: Tidak Ada Sesi Hari Ini & Tidak Ada Upcoming Session */
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        <span>Belum Ada Sesi Mendatang</span>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-900">
                          Belum Ada Sesi Latihan Terjadwal
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                          Pelatih Anda belum menjadwalkan sesi latihan berikutnya. Fokus pada pemulihan fisik, nutrisi seimbang, dan pelaksanaan menu latihan mandiri.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setActiveTab("train")}
                          className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
                        >
                          <Dumbbell className="h-4 w-4" />
                          <span>Buka Menu Latihan Mandiri</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. ATHLETE STATUS & ATTENDANCE - Span 4 */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                        STATUS &amp; DISIPLIN ATLET
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-mono text-4xl font-black text-blue-600">
                        {attendance?.overallRate ?? attendance?.thisMonthRate ?? 100}%
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">Tingkat Presensi</span>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <span>{profile.competitionLevel ?? "YAP • AKTIF"}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Profil atlet aktif terdaftar dalam sistem pemantauan performa olahraga YAP.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 block font-medium">Sesi Selesai</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {attendance?.totalSessions ?? sessionLogs.length}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 block font-medium">Presensi</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {attendance?.overallRate ?? attendance?.thisMonthRate ?? 100}%
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                      <span className="font-bold text-emerald-600 text-sm">Aktif</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────
                  SECTION 2 (SECONDARY): CURRENT TARGET & LATEST ASSESSMENT
                 ──────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 1. CURRENT TARGET (Span 6) */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-2 min-w-0">
                      <Target className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate">TARGET PERFORMA AKTIF</span>
                    </span>
                    <button
                      onClick={() => setActiveTab("pb")}
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0 whitespace-nowrap"
                    >
                      Buka PB Hub
                    </button>
                  </div>

                  {activeGoal ? (
                    <div className="space-y-3">
                      <div>
                        <div className="font-black text-lg text-slate-900">
                          {activeGoal.testItemName}
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 mt-1">
                          <span>
                            {activeGoal.baselineValue}{activeGoal.unit} → {activeGoal.currentValue ?? activeGoal.baselineValue}{activeGoal.unit} → {activeGoal.targetValue}{activeGoal.unit}
                          </span>
                          <span className="text-xs text-blue-600 font-sans font-bold">
                            {activeGoal.progressPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(activeGoal.progressPercent, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>
                          Tenggat Target:{" "}
                          <strong className="text-slate-800">
                            {activeGoal.targetDate
                              ? new Date(activeGoal.targetDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                              : "Evaluasi Berkala"}
                          </strong>
                        </span>
                        {activeGoal.title && (
                          <span className="text-slate-400 italic truncate max-w-[200px]">
                            &quot;{activeGoal.title}&quot;
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-1.5 text-xs text-slate-500">
                      <Target className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-800">Belum Ada Target Aktif dari Pelatih</p>
                      <p className="text-[11px] text-slate-400">
                        Target fisik khusus akan ditentukan oleh pelatih saat evaluasi fisik berkala berikutnya.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab("pb")}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition text-center"
                  >
                    Lihat Semua Target &amp; Rekor di PB Hub
                  </button>
                </div>

                {/* 2. LATEST ASSESSMENT & TREND (Span 6) */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-2 min-w-0">
                      <Activity className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">EVALUASI TERAKHIR &amp; TREN</span>
                    </span>
                    <button
                      onClick={() => setActiveTab("progress")}
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0 whitespace-nowrap"
                    >
                      Buka Progres
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Skor
                      </span>
                      <span className="font-mono text-2xl font-black text-slate-900">
                        {progress.overallScore ?? 84}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">/100</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Grade
                      </span>
                      <span className="font-mono text-2xl font-black text-blue-600">
                        {progress.overallGrade ?? "A-"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 block uppercase font-medium truncate">
                        Keunggulan
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate block">
                        {primaryStrength.key.split("(")[0]}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-600 font-bold">
                        {primaryStrength.score}/100
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                      <span className="text-[10px] text-rose-700 block uppercase font-medium truncate">
                        Fokus
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate block">
                        {limitingFactor.key.split("(")[0]}
                      </span>
                      <span className="font-mono text-[10px] text-rose-600 font-bold">
                        {limitingFactor.score}/100
                      </span>
                    </div>
                  </div>

                  {/* Svg Trend Line Chart */}
                  <div className="h-[95px] w-full pt-1 pb-1">
                    <SvgTrendLineChart reports={reports} overallScore={progress.overallScore} />
                  </div>

                  <button
                    onClick={() => setActiveTab("progress")}
                    className="w-full mt-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition text-center"
                  >
                    Buka Rincian 7 Komponen Fisik &amp; Rapor
                  </button>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────
                  SECTION 3 (SUPPORTING): PERSONAL BESTS & COACH MESSAGE
                 ──────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 1. PERSONAL BESTS (Span 7) */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span>REKOR FISIK RESMI (PERSONAL BESTS)</span>
                    </span>
                    <button
                      onClick={() => setActiveTab("pb")}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  {displayPbs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {displayPbs.slice(0, 4).map((pb) => (
                        <div
                          key={pb.testItemId}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 hover:border-blue-200 transition"
                        >
                          <div className="text-[10px] font-bold text-slate-400 uppercase truncate">
                            {pb.testItemName}
                          </div>
                          <div className="font-mono text-xl font-black text-slate-900 leading-tight">
                            {pb.pbValue}
                            <span className="text-[11px] font-normal text-slate-500 ml-0.5">
                              {pb.unit.toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-0.5">
                            <span className="font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.2 rounded text-[9px]">
                              PB
                            </span>
                            <span className="font-bold text-emerald-600 font-mono text-[10px]">
                              {pb.achievedDate ? new Date(pb.achievedDate).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }) : "Resmi"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-1.5 text-xs text-slate-500">
                      <Trophy className="h-7 w-7 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-800">Belum Ada Rekor Fisik Resmi</p>
                      <p className="text-[11px] text-slate-400">
                        Rekor fisik pribadi (PB) akan dicatat otomatis setelah tes evaluasi fisik resmi bersama pelatih.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab("pb")}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition text-center"
                  >
                    Buka Papan Rekor Fisik Lengkap
                  </button>
                </div>

                {/* 2. COACH MESSAGE (Span 5) */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span>PESAN &amp; ARAHAN PELATIH</span>
                    </span>
                    <button
                      onClick={() => setIsGuidanceModalOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Buka Semua
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-blue-600 text-3xl font-serif leading-none">
                      “
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed line-clamp-3">
                      &quot;{latestGuidance?.content ?? "Peningkatan akselerasi lari dan eksplosivitas gerak sangat baik. Terus pertahankan ritme latihan!"}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        fallback="CZ"
                        size="xs"
                        alt={latestGuidance?.authorName || "Coach Zulfi"}
                        className="ring-1 ring-blue-500 shrink-0"
                      />
                      <div className="text-xs text-slate-800 font-semibold truncate">
                        — {latestGuidance?.authorName || "Coach Zulfi"}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsGuidanceModalOpen(true)}
                      className="text-[11px] font-bold text-blue-600 hover:underline shrink-0 whitespace-nowrap"
                    >
                      Catatan Bimbingan →
                    </button>
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────
                  SECTION 4 (SNAPSHOT): 7 PHYSICAL COMPONENTS
                 ──────────────────────────────────────────────────────── */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>SNAPSHOT 7 KOMPONEN FISIK ATLET</span>
                  </span>
                  <button
                    onClick={() => setActiveTab("progress")}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Buka Radar &amp; Analisis Lengkap
                  </button>
                </div>

                {/* 7 Circular Gauges */}
                <div className="flex items-center justify-around overflow-x-auto py-2 gap-3">
                  <CircularProgressRing value={Math.round(radarScores.SPEED)} label="Speed" color="emerald" />
                  <CircularProgressRing value={Math.round(radarScores.POWER)} label="Power" color="emerald" />
                  <CircularProgressRing value={Math.round(radarScores.AGILITY)} label="Agility" color="blue" />
                  <CircularProgressRing value={Math.round(radarScores.AEROBIC_ENDURANCE)} label="Endurance" color="blue" />
                  <CircularProgressRing value={Math.round(radarScores.ANAEROBIC_ENDURANCE)} label="Strength" color="emerald" />
                  <CircularProgressRing value={Math.round(radarScores.MUSCULAR_ENDURANCE)} label="Coordination" color="emerald" />
                  <CircularProgressRing value={Math.round(radarScores.FLEXIBILITY)} label="Mobility" color="blue" />
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
                {/* Radar Chart */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 min-w-0">
                      <Activity className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate"><span className="italic">Radar Chart</span> 7 Komponen Fisik</span>
                    </h2>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 whitespace-nowrap">Skala 0–100</span>
                  </div>

                  <div className="flex justify-center items-center py-2">
                    <AssessmentRadarChart componentScores={radarScores} />
                  </div>
                </div>

                {/* Component Score Bars & Status */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>Rincian Nilai 7 Komponen Fisik</span>
                    </h2>
                    <span className="text-[11px] font-mono font-bold text-blue-600 shrink-0 whitespace-nowrap">
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

              {/* Assessment History / Official Reports List in Progress Tab */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Riwayat Evaluasi Fisik Resmi Pelatih</span>
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400">
                    {reports.length} Catatan Evaluasi
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50">
                  {reports.length > 0 ? (
                    reports.map((rep) => (
                      <div key={rep.assessmentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-100/60 transition">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-sm">Evaluasi Fisik Berkala Atlet</div>
                          <div className="text-slate-500 text-[11px]">
                            Tanggal Tes: {new Date(rep.assessmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-mono text-base font-extrabold text-slate-900">{rep.overallScore} / 100</span>
                            <span className="block text-[10px] text-blue-600 font-bold">Grade {rep.overallGrade}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Belum ada riwayat laporan evaluasi tersimpan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: TRAIN (PROGRAM LATIHAN & JADWAL SESI)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "train" && (
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

                {/* Segmented Controller (Mendatang / Selesai) */}
                <div className="flex items-center p-1 rounded-xl bg-slate-200 border border-slate-300">
                  <button
                    onClick={() => setTrainSegment("upcoming")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      trainSegment === "upcoming"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Mendatang
                  </button>
                  <button
                    onClick={() => setTrainSegment("completed")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      trainSegment === "completed"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Selesai
                  </button>
                </div>
              </div>

              {trainSegment === "upcoming" ? (
                <>
                  {/* Active Training Plan & Drill List */}
                  {trainingPlan ? (
                    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                            <Dumbbell className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-sm font-bold text-slate-900 leading-snug">
                              {trainingPlan.title}
                            </h2>
                            {trainingPlan.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                {trainingPlan.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <Badge variant="outline" className="self-start sm:self-center border-emerald-300 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold shrink-0 whitespace-nowrap">
                          Program Aktif
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          DAFTAR MENU LATIHAN (<span className="italic">DRILLS</span>)
                        </span>

                        {trainingPlan.exercises.length > 0 ? (
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                            {trainingPlan.exercises.map((ex, idx) => (
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
                        ) : (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                            Belum ada daftar drill spesifik yang dimasukkan pada program ini.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                            <Dumbbell className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-sm font-bold text-slate-800 leading-snug">
                              Belum Ada Program Latihan Aktif
                            </h2>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Program latihan periodisasi belum ditetapkan oleh pelatih untuk siklus ini.
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="self-start sm:self-center border-slate-200 text-slate-500 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold shrink-0 whitespace-nowrap">
                          Belum Ditetapkan
                        </Badge>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/80 text-xs text-slate-600 space-y-2">
                        <p className="font-semibold text-slate-700">
                          📌 Dari Coach Zulfi:
                        </p>
                        <p className="leading-relaxed text-slate-600">
                          Menu latihan, repetisi, dan beban latihan disusun secara personal berdasarkan hasil tes fisik dan tujuan kompetisi Anda. Saat pelatih merilis program latihan baru, seluruh rincian gerakan (drills) akan otomatis muncul di sini.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upcoming Schedule Cards */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Jadwal Sesi Mendatang</span>
                    </h2>

                    {upcomingSessions.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingSessions.map((s) => (
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
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">
                        Belum ada sesi latihan terjadwal berikutnya dari pelatih.
                      </div>
                    )}
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
                    {sessionLogs.length > 0 ? (
                      sessionLogs.map((log) => (
                        <div key={log.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 text-sm">{log.sessionTitle ?? "Sesi Latihan"}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              SESI SELESAI ✓
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
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">
                        Belum ada riwayat sesi latihan selesai yang tercatat.
                      </div>
                    )}
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
                  <span>Papan Rekor Fisik (<span className="italic">Personal Bests</span>) &amp; Target</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Papan rekor terbaik performa fisik pribadi, target terstruktur dari pelatih, dan tonggak pencapaian atletik.
                </p>
              </div>

              {/* Target Tracker Section */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Target Performa dari Pelatih (Read-Only)</span>
                </h2>

                {portalGoals.length > 0 ? (
                  <div className="space-y-3">
                    {portalGoals.map((g) => (
                      <div key={g.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{g.testItemName}</span>
                          <span className="text-xs font-mono font-bold text-blue-600">{g.progressPercent}% Tercapai</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600 font-mono">
                          <span>Baseline: {g.baselineValue}{g.unit}</span>
                          <span>Saat Ini: {g.currentValue ?? g.baselineValue}{g.unit}</span>
                          <span className="font-bold text-slate-900">Target: {g.targetValue}{g.unit}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(g.progressPercent, 100)}%` }} />
                        </div>
                        {g.title && (
                          <div className="text-[11px] text-slate-500 italic pt-1">
                            Fokus: &quot;{g.title}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    Belum ada target fisik baru dari pelatih. Target akan ditetapkan pada siklus asesmen berikutnya.
                  </div>
                )}
              </div>

              {/* All Personal Bests Grid */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span>Daftar Rekor Fisik Resmi (<span className="italic">Personal Bests</span>)</span>
                </h2>

                {displayPbs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {displayPbs.map((pb) => (
                      <div
                        key={pb.testItemId}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-blue-300 transition-colors"
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
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    Belum ada rekor fisik resmi. Rekor tercatat secara otomatis setelah atlet menyelesaikan evaluasi fisik resmi.
                  </div>
                )}
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
