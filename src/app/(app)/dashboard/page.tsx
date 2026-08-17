import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/features/dashboard/queries";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardStatGrid } from "@/features/dashboard/components/dashboard-stat-grid";
import { DashboardAttention } from "@/features/dashboard/components/dashboard-attention";
import { UpcomingSessionsCard } from "@/features/dashboard/components/upcoming-sessions-card";
import { SquadProfileCard } from "@/features/dashboard/components/squad-profile-card";
import { RecentAssessmentsCard } from "@/features/dashboard/components/recent-assessments-card";

export default async function DashboardPage() {
  const ctx = await requireOrgContext();
  const [stats, org] = await Promise.all([
    getDashboardStats(ctx.organizationId),
    prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { name: true },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* 1. Header with Operational Actions */}
      <DashboardHeader orgName={org?.name} />

      {/* 2. Summary Metric Cards */}
      <DashboardStatGrid stats={stats} />

      {/* 3. Operational Grid: Attention & Today's/Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DashboardAttention attentionItems={stats.attentionItems} />
        </div>
        <div className="lg:col-span-2">
          <UpcomingSessionsCard sessions={stats.upcomingSessions} />
        </div>
      </div>

      {/* 4. Squad Physical Component Profile & Radar Chart */}
      <SquadProfileCard scores={stats.squadComponentScores} />

      {/* 5. Recent Assessment Activity */}
      <RecentAssessmentsCard assessments={stats.latestAssessments} />
    </div>
  );
}
