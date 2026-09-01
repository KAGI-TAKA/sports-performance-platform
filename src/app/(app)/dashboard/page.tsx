import { Suspense } from "react";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/features/dashboard/queries";
import {
  getAthleteReTestIntelligence,
  getCoachingWorkloadIntelligence,
  getSessionHealthIntelligence,
} from "@/features/coaching-intelligence/queries";
import { getSquadAdaptationData } from "@/features/analytics/squad-adaptation-queries";
import { safeDashboardQuery } from "@/features/dashboard/utils";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardWorkflowGuide } from "@/features/dashboard/components/dashboard-workflow-guide";
import { DashboardOperationalAttention } from "@/features/dashboard/components/dashboard-operational-attention";
import { DashboardTodaySessions } from "@/features/dashboard/components/dashboard-today-sessions";
import { DashboardReTestWidget } from "@/features/dashboard/components/dashboard-retest-widget";
import { DashboardWorkloadWidget } from "@/features/dashboard/components/dashboard-workload-widget";
import { DashboardStatGrid } from "@/features/dashboard/components/dashboard-stat-grid";
import { DashboardAthleteDirectory } from "@/features/dashboard/components/dashboard-athlete-directory";
import { SquadProfileCard } from "@/features/dashboard/components/squad-profile-card";
import { SquadAdaptationHub } from "@/features/analytics/components/squad-adaptation-hub";

// Async Streaming Sub-Component for Re-Test Intelligence
async function AsyncReTestSection({ organizationId, role, memberId }: { organizationId: string; role: string; memberId: string }) {
  const result = await safeDashboardQuery(
    getAthleteReTestIntelligence(organizationId, { role, coachMemberId: memberId }),
    null,
    "retest_intelligence"
  );
  return (
    <DashboardReTestWidget
      reTestSummary={result.data}
      isUnavailable={result.isUnavailable}
    />
  );
}

// Async Streaming Sub-Component for Workload Intelligence
async function AsyncWorkloadSection({ organizationId, role, memberId, isAssistant }: { organizationId: string; role: string; memberId: string; isAssistant: boolean }) {
  const result = await safeDashboardQuery(
    getCoachingWorkloadIntelligence(organizationId, { role, coachMemberId: memberId, period: "month" }),
    null,
    "workload_intelligence"
  );
  return (
    <DashboardWorkloadWidget
      workloadSummary={result.data}
      isAssistant={isAssistant}
      isUnavailable={result.isUnavailable}
    />
  );
}

// Async Streaming Sub-Component for Squad Adaptation Insights
async function AsyncSquadAdaptationSection({ organizationId }: { organizationId: string }) {
  const result = await safeDashboardQuery(
    getSquadAdaptationData(organizationId),
    null,
    "squad_adaptation"
  );
  if (!result.data) return null;
  return <SquadAdaptationHub data={result.data} />;
}

import { getDefaultRouteForRole, isRouteAllowedForRole } from "@/lib/access-policy";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const ctx = await requireOrgContext();

  // Role Guard: If role cannot access /dashboard, redirect to their role-specific workspace
  if (!isRouteAllowedForRole(ctx.role, "/dashboard")) {
    redirect(getDefaultRouteForRole(ctx.role));
  }

  const isAssistant = (ctx.role || "").toLowerCase() === "assistant_coach";

  // Primary critical path: fetch stats, org name, and session health in parallel
  const [
    statsResult,
    orgResult,
    sessionHealthResult,
  ] = await Promise.all([
    safeDashboardQuery(getDashboardStats(ctx.organizationId), null, "dashboard_stats"),
    safeDashboardQuery(
      prisma.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { name: true },
      }),
      { name: "Organisasi" },
      "organization_name"
    ),
    safeDashboardQuery(
      getSessionHealthIntelligence(ctx.organizationId, {
        role: ctx.role,
        coachMemberId: ctx.memberId,
      }),
      null,
      "session_health"
    ),
  ]);

  const stats = statsResult.data;
  const org = orgResult.data;
  const sessionHealth = sessionHealthResult.data;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* 0. Command Center Operational Header */}
      <DashboardHeader orgName={org?.name} />

      {/* 0.5. Interactive 6-Step Coaching Flow Guide (From Assessment to Development) */}
      <DashboardWorkflowGuide />

      {/* 1. Level 1 (Operational Attention) & Level 2 (Today's / Upcoming Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <DashboardOperationalAttention
            sessionHealth={sessionHealth}
            reTestSummary={null}
            activeInjuriesCount={stats?.attentionItems?.activeInjuriesCount ?? 0}
            isUnavailable={sessionHealthResult.isUnavailable}
          />
        </div>
        <div className="lg:col-span-2">
          <DashboardTodaySessions
            todaySessions={sessionHealth?.todayUpcoming ?? null}
            upcomingSessionsFallback={stats?.upcomingSessions ?? []}
            isUnavailable={sessionHealthResult.isUnavailable && !stats}
          />
        </div>
      </div>

      {/* 2. Level 3 (Re-Test Intelligence) & Level 4 (Coaching Workload Distribution) - Streaming Suspense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <Suspense fallback={<div className="h-48 rounded-xl bg-surface-2 animate-pulse" />}>
            <AsyncReTestSection
              organizationId={ctx.organizationId}
              role={ctx.role}
              memberId={ctx.memberId}
            />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<div className="h-48 rounded-xl bg-surface-2 animate-pulse" />}>
            <AsyncWorkloadSection
              organizationId={ctx.organizationId}
              role={ctx.role}
              memberId={ctx.memberId}
              isAssistant={isAssistant}
            />
          </Suspense>
        </div>
      </div>

      {/* 3. Level 5: Squad Adaptational Insight Hub - Streaming Suspense */}
      <Suspense fallback={<div className="h-64 rounded-xl bg-surface-2 animate-pulse" />}>
        <AsyncSquadAdaptationSection organizationId={ctx.organizationId} />
      </Suspense>

      {/* 4. Level 6: Athlete Quick Directory & Supporting Squad Performance Profile */}
      <div className="space-y-5 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Rangkuman Direktori Atlet &amp; Statistik Skuad
          </span>
        </div>

        <DashboardAthleteDirectory athletes={stats?.athletesOverview ?? []} />
        <DashboardStatGrid stats={stats} isUnavailable={statsResult.isUnavailable} />
        <SquadProfileCard scores={stats?.squadComponentScores ?? {}} />
      </div>
    </div>
  );
}
