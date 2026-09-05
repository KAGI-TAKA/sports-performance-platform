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
import { AthleteMfdDashboard } from "./mfd/athlete-mfd-dashboard";
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

  // ── 2. ATHLETE MFD PORTAL (MOVEMENT & FITNESS DEVELOPMENT, 6-12 TH) ──
  const isMfdPathway =
    profile.competitionLevel === "MFD" ||
    (profile.competitionLevel !== "YAP" && profile.age <= 12);

  if (isMfdPathway) {
    return (
      <AthleteMfdDashboard
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
        personalBests={personalBests}
        portalGoals={portalGoals}
        attendance={attendance}
      />
    );
  }

  // ── 3. ATHLETE YAP PORTAL (YOUTH ATHLETIC PERFORMANCE, 13-18+ TH) ──
  return (
    <AthletePortalDashboard
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
      personalBests={personalBests}
      portalGoals={portalGoals}
      attendance={attendance}
    />
  );
}

