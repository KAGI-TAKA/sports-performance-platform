import { redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { getParentAuthorizedChildren, getParentChildPortalData } from "@/features/portal/parent-queries";
import { ParentMultiChildPortal } from "@/features/portal/components/parent-multi-child-portal";
import { PortalView } from "@/features/portal/components/portal-view";
import {
  getPortalAthleteProfile,
  getPortalAthleteProgress,
  getPortalAthleteTrainingPlan,
  getPortalAthleteSchedule,
  getPortalAthleteSessionLogs,
  getPortalAthleteReports,
  getPortalAthleteAchievements,
  getPortalAthleteGuidances,
  getPortalAthletePerformanceOverview,
  getPortalAthleteGoals,
} from "@/features/portal/queries";
import type { PortalAccessContext } from "@/features/portal/types";

export default async function AuthenticatedPortalPage() {
  const ctx = await requireOrgContext();

  // ── 1. Role Parent: Multi-Child Portal ─────────────────────────────
  if (ctx.role === "parent") {
    const children = await getParentAuthorizedChildren();
    const initialChild = children[0];
    let initialPortalData = null;

    if (initialChild) {
      const res = await getParentChildPortalData(initialChild.id);
      if (res.success && res.payload) {
        initialPortalData = res.payload;
      }
    }

    return (
      <ParentMultiChildPortal
        children={children}
        initialChildId={initialChild?.id ?? ""}
        initialPortalData={initialPortalData}
        parentName={ctx.userName}
      />
    );
  }

  // ── 2. Role Athlete: Own Personal Portal ───────────────────────────
  if (ctx.role === "athlete") {
    // Cari atlet yang terhubung dengan akun login ini
    const athleteRecord = await prisma.athlete.findFirst({
      where: {
        organizationId: ctx.organizationId,
        isActive: true,
        OR: [
          { fullName: { equals: ctx.userName, mode: "insensitive" } },
          { portalAccesses: { some: { username: { equals: ctx.userName, mode: "insensitive" } } } },
        ],
      },
      include: { organization: { select: { name: true } } },
    });

    if (!athleteRecord) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8 text-center shadow-lg space-y-2">
            <h1 className="font-display text-lg font-bold text-foreground">
              Profil Atlet Tidak Ditemukan
            </h1>
            <p className="text-xs text-muted">
              Akun Anda belum terhubung dengan profil atlet dalam organisasi ini. Silakan hubungi pelatih Anda.
            </p>
          </div>
        </div>
      );
    }

    const portalContext: PortalAccessContext = {
      portalAccessId: `auth-athlete-${ctx.userId}`,
      organizationId: ctx.organizationId,
      organizationName: athleteRecord.organization.name,
      athleteId: athleteRecord.id,
      athleteName: athleteRecord.fullName,
      accessType: "ATHLETE",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };

    const [
      profileData,
      progressData,
      planData,
      scheduleData,
      logsData,
      reportsData,
      guidanceData,
      performanceData,
      portalGoals,
    ] = await Promise.all([
      getPortalAthleteProfile(portalContext),
      getPortalAthleteProgress(portalContext),
      getPortalAthleteTrainingPlan(portalContext),
      getPortalAthleteSchedule(portalContext),
      getPortalAthleteSessionLogs(portalContext),
      getPortalAthleteReports(portalContext),
      getPortalAthleteGuidances(portalContext),
      getPortalAthletePerformanceOverview(portalContext),
      getPortalAthleteGoals(portalContext),
    ]);

    const achievementsData = await getPortalAthleteAchievements(
      portalContext,
      progressData?.trends ?? [],
      reportsData?.reports
    );

    return (
      <PortalView
        context={portalContext}
        profile={profileData!.profile}
        snapshot={profileData!.latestSnapshot}
        progress={{
          overallScore: progressData?.overallScore ?? null,
          overallGrade: progressData?.overallGrade ?? null,
          trends: progressData?.trends ?? [],
          totalAssessments: progressData?.totalAssessments ?? 0,
        }}
        trainingPlan={planData?.plan ?? null}
        schedule={scheduleData?.sessions ?? []}
        sessionLogs={logsData?.logs ?? []}
        reports={reportsData?.reports ?? []}
        guidances={guidanceData?.guidances ?? []}
        achievements={achievementsData?.achievements ?? {
          starRating: 0,
          starLabel: "Belum Ada Evaluasi",
          totalAssessments: 0,
          completedSessions: 0,
          badges: [],
        }}
        personalBests={performanceData.personalBests}
        portalGoals={portalGoals}
      />
    );
  }

  // ── 3. Role Staff / Coach / Admin ─────────────────────────────────
  // Redirect ke dashboard operasional pelatih
  redirect("/dashboard");
}
