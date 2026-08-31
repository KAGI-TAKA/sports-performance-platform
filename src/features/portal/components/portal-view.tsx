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
import { AthletePortalDashboard } from "./athlete-portal-dashboard";
import { ParentPortalDashboard } from "./parent-portal-dashboard";
import {
  ShieldCheck,
  User,
  Users,
  Award,
  Sparkles,
  Zap,
} from "lucide-react";
import type { CoachGuidanceItem } from "@/features/guidance/types";
import type { EligibleFeedbackSessionItem } from "@/features/parent-feedback/types";
import { APP_CONFIG } from "@/lib/constants";

interface PortalViewProps {
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
  /** P6-B4: Personal Best data from portal-safe query */
  personalBests?: PortalPersonalBestItem[];
  /** P6-B4: Athlete Goals (excludes CANCELLED) from portal-safe query */
  portalGoals?: PortalAthleteGoalItem[];
}

export function PortalView({
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
}: PortalViewProps) {
  const isParent = context.accessType === "PARENT";

  const formattedDOB = new Date(profile.dateOfBirth).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 selection:bg-indigo-500 selection:text-white">
      {/* ── TOP HERO BANNER ────────────────────────────────────────── */}
      <header
        className={`text-white pt-8 pb-12 px-4 sm:px-6 shadow-md border-b ${
          isParent
            ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800"
            : "bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#0F172A] border-indigo-900/40"
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Top Bar: Official Branding & Perspective Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`h-6 w-6 rounded-lg flex items-center justify-center text-white ${
                  isParent ? "bg-violet-600" : "bg-indigo-600"
                }`}
              >
                <Zap className="h-3.5 w-3.5 fill-white" />
              </div>
              <span className="font-display font-extrabold tracking-wide text-white uppercase text-[11px]">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] text-indigo-300">
                · {APP_CONFIG.instagram}
              </span>
            </div>

            {/* Role Badge: Locked to accessType */}
            <div>
              {context.accessType === "PARENT" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 px-3 py-1 text-xs font-bold text-violet-300 backdrop-blur-md">
                  <Users className="h-3.5 w-3.5" />
                  <span>Portal Informasi Orang Tua / Wali</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md">
                  <User className="h-3.5 w-3.5" />
                  <span>Portal Atlet Muda</span>
                </span>
              )}
            </div>
          </div>

          {/* Athlete Bio & Role Context Display */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {profile.fullName}
                </h1>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                    isParent
                      ? "bg-violet-500/20 text-violet-200 border-violet-400/30"
                      : "bg-indigo-500/30 text-indigo-200 border-indigo-400/30"
                  }`}
                >
                  {profile.competitionLevel ?? "Fisik & Atletik"}
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-200/90 flex flex-wrap items-center gap-2">
                <span>Program: <strong className="text-white">{profile.competitionLevel ?? "Multi-Sport / Atletik"}</strong></span>
                <span>·</span>
                <span>{profile.age} Tahun ({formattedDOB})</span>
              </p>
            </div>

            {/* Quick Perspective Badge */}
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 backdrop-blur-md self-start sm:self-auto">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <div className="text-left text-xs">
                <span className="text-[10px] text-indigo-300 uppercase font-semibold block leading-none">
                  Halaman Aktif
                </span>
                <strong className="text-white text-xs font-bold">
                  {!isParent ? "Portal Latihan Atlet (Aksi & Latihan)" : "Perkembangan & Laporan Ananda"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD CONTAINER ─────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        {!isParent ? (
          <AthletePortalDashboard
            context={context}
            profile={profile}
            snapshot={snapshot}
            progress={progress}
            trainingPlan={trainingPlan}
            schedule={schedule}
            sessionLogs={sessionLogs}
            reports={reports}
            achievements={achievements}
            personalBests={personalBests}
            portalGoals={portalGoals}
          />
        ) : (
          <ParentPortalDashboard
            token={token}
            context={context}
            profile={profile}
            snapshot={snapshot}
            progress={progress}
            trainingPlan={trainingPlan}
            schedule={schedule}
            sessionLogs={sessionLogs}
            reports={reports}
            achievements={achievements}
            guidances={guidances}
            feedbackSessions={feedbackSessions}
            personalBests={personalBests}
            portalGoals={portalGoals}
          />
        )}
      </main>
    </div>
  );
}
