import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/features/dashboard/queries";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardStatGrid } from "@/features/dashboard/components/dashboard-stat-grid";
import { DashboardAttention } from "@/features/dashboard/components/dashboard-attention";
import { UpcomingSessionsCard } from "@/features/dashboard/components/upcoming-sessions-card";
import { DashboardAthleteDirectory } from "@/features/dashboard/components/dashboard-athlete-directory";
import { SquadProfileCard } from "@/features/dashboard/components/squad-profile-card";

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
    <div className="space-y-5 max-w-[1400px]">
      {/* 0. Command Center Operational Header */}
      <DashboardHeader orgName={org?.name} />

      {/* 1. Level 1 (Immediate Action) & Level 2 (Today's / Upcoming Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <DashboardAttention attentionItems={stats.attentionItems} />
        </div>
        <div className="lg:col-span-2">
          <UpcomingSessionsCard sessions={stats.upcomingSessions} />
        </div>
      </div>

      {/* 2. Level 3: Athlete Quick Directory */}
      <DashboardAthleteDirectory athletes={stats.athletesOverview} />

      {/* 3. Level 4: Compact Statistics & Squad Performance Profile */}
      <div className="space-y-5 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Rangkuman Performa & Statistik Skuad
          </span>
        </div>

        <DashboardStatGrid stats={stats} />
        <SquadProfileCard scores={stats.squadComponentScores} />
      </div>
    </div>
  );
}
