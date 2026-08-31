import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/features/dashboard/queries";
import {
  getAthleteReTestIntelligence,
  getCoachingWorkloadIntelligence,
  getSessionHealthIntelligence,
} from "@/features/coaching-intelligence/queries";
import { safeDashboardQuery } from "@/features/dashboard/utils";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardOperationalAttention } from "@/features/dashboard/components/dashboard-operational-attention";
import { DashboardTodaySessions } from "@/features/dashboard/components/dashboard-today-sessions";
import { DashboardReTestWidget } from "@/features/dashboard/components/dashboard-retest-widget";
import { DashboardWorkloadWidget } from "@/features/dashboard/components/dashboard-workload-widget";
import { DashboardStatGrid } from "@/features/dashboard/components/dashboard-stat-grid";
import { DashboardAthleteDirectory } from "@/features/dashboard/components/dashboard-athlete-directory";
import { SquadProfileCard } from "@/features/dashboard/components/squad-profile-card";

export default async function DashboardPage() {
  const ctx = await requireOrgContext();
  const isAssistant = (ctx.role || "").toLowerCase() === "assistant_coach";

  // Execute all independent queries in a single parallel batch with isolated fault tolerance (Zero N+1)
  const [
    statsResult,
    orgResult,
    reTestResult,
    workloadResult,
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
      getAthleteReTestIntelligence(ctx.organizationId, {
        role: ctx.role,
        coachMemberId: ctx.memberId,
      }),
      null,
      "retest_intelligence"
    ),
    safeDashboardQuery(
      getCoachingWorkloadIntelligence(ctx.organizationId, {
        role: ctx.role,
        coachMemberId: ctx.memberId,
        period: "month",
      }),
      null,
      "workload_intelligence"
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
  const reTestSummary = reTestResult.data;
  const workloadSummary = workloadResult.data;
  const sessionHealth = sessionHealthResult.data;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* 0. Command Center Operational Header */}
      <DashboardHeader orgName={org?.name} />

      {/* 1. Level 1 (Operational Attention) & Level 2 (Today's / Upcoming Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <DashboardOperationalAttention
            sessionHealth={sessionHealth}
            reTestSummary={reTestSummary}
            activeInjuriesCount={stats?.attentionItems?.activeInjuriesCount ?? 0}
            isUnavailable={sessionHealthResult.isUnavailable && reTestResult.isUnavailable}
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

      {/* 2. Level 3 (Re-Test Intelligence) & Level 4 (Coaching Workload Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <DashboardReTestWidget
            reTestSummary={reTestSummary}
            isUnavailable={reTestResult.isUnavailable}
          />
        </div>
        <div>
          <DashboardWorkloadWidget
            workloadSummary={workloadSummary}
            isAssistant={isAssistant}
            isUnavailable={workloadResult.isUnavailable}
          />
        </div>
      </div>

      {/* 3. Level 5: Athlete Quick Directory & Supporting Squad Performance Profile */}
      <div className="space-y-5 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Rangkuman Direktori Atlet & Statistik Skuad
          </span>
        </div>

        <DashboardAthleteDirectory athletes={stats?.athletesOverview ?? []} />
        <DashboardStatGrid stats={stats} isUnavailable={statsResult.isUnavailable} />
        <SquadProfileCard scores={stats?.squadComponentScores ?? {}} />
      </div>
    </div>
  );
}
