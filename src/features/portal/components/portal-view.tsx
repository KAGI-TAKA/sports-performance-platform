"use client";

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
import { AthletePortalDashboard } from "./athlete-portal-dashboard";
import { ParentPortalDashboard } from "./parent-portal-dashboard";
import { User, Sparkles, Zap } from "lucide-react";
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
  personalBests?: PortalPersonalBestItem[];
  portalGoals?: PortalAthleteGoalItem[];
  attendance?: PortalAttendanceSummary | null;
  siblings?: PortalSiblingItem[];
  onSelectSibling?: (siblingId: string) => void;
  loadingSibling?: boolean;
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
  attendance = null,
  siblings = [],
  onSelectSibling,
  loadingSibling = false,
}: PortalViewProps) {
  const isParent = context.accessType === "PARENT";

  const formattedDOB = new Date(profile.dateOfBirth).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── 1. PARENT PORTAL EXPERIENCE (DEDICATED FULL-CANVAS & SIDEBAR) ──
  if (isParent) {
    return (
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
        attendance={attendance}
        siblings={siblings}
        onSelectSibling={onSelectSibling}
        loadingSibling={loadingSibling}
      />
    );
  }

  // ── 2. ATHLETE PORTAL EXPERIENCE (DEFAULT ATHLETE VIEW) ────────────
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-accent/20 selection:text-foreground">
      {/* Top Hero Banner */}
      <header className="pt-8 pb-12 px-4 sm:px-6 shadow-xs border-b border-border bg-surface-1">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg flex items-center justify-center text-white bg-accent">
                <Zap className="h-3.5 w-3.5 fill-white" />
              </div>
              <span className="font-display font-extrabold tracking-wide text-foreground uppercase text-[11px]">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] text-muted">· {APP_CONFIG.instagram}</span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-bg border border-accent/20 px-3 py-1 text-xs font-bold text-accent">
              <User className="h-3.5 w-3.5" />
              <span>Portal Atlet Muda (My Development)</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {profile.fullName}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border bg-accent-bg text-accent border-accent/20">
                  {profile.competitionLevel ?? "Fisik & Atletik"}
                </span>
              </div>
              <p className="mt-1 text-xs text-secondary flex flex-wrap items-center gap-2">
                <span>Program: <strong className="text-foreground">{profile.competitionLevel ?? "Youth Athletic Performance"}</strong></span>
                <span>·</span>
                <span>{profile.age} Tahun ({formattedDOB})</span>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-surface-2 px-3.5 py-2 rounded-2xl border border-border self-start sm:self-auto">
              <Sparkles className="h-4 w-4 text-accent" />
              <div className="text-left text-xs">
                <span className="text-[10px] text-muted uppercase font-semibold block leading-none">
                  Halaman Aktif
                </span>
                <strong className="text-foreground text-xs font-bold">
                  Ruang Perkembangan Atlet
                </strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
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
      </main>
    </div>
  );
}
