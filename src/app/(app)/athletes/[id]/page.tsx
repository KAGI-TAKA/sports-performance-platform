import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { getAthleteFullProfile } from "@/features/athletes/queries";
import { AthleteProfileActions } from "./athlete-profile-actions";
import { AthleteCoachBrief } from "@/features/athletes/components/athlete-coach-brief";
import { AthleteProfileTabs } from "@/features/athletes/components/athlete-profile-tabs";
import { ArrowLeft, User, Award, ShieldAlert } from "lucide-react";
import { listPortalAccessesForAthlete } from "@/features/portal/actions";
import {
  getAthletePerformanceOverview,
  getAthleteGoals,
} from "@/features/athlete-goals/queries";
import { canMemberManageGoals } from "@/features/athlete-goals/engine";

function calculateAge(dateOfBirth: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface AthleteProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function AthleteProfilePage({ params }: AthleteProfilePageProps) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const [
    athlete,
    portalAccesses,
    performanceOverview,
    goals,
    activeTestItems,
  ] = await Promise.all([
    getAthleteFullProfile(ctx.organizationId, id),
    listPortalAccessesForAthlete(id),
    getAthletePerformanceOverview(id),
    getAthleteGoals(id),
    prisma.testItem.findMany({
      where: {
        organizationId: ctx.organizationId,
        isActive: true,
        testType: "NUMERIC",
      },
      select: {
        id: true,
        name: true,
        unit: true,
        scoreDirection: true,
        physicalComponent: true,
      },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!athlete) {
    notFound();
  }

  const age = calculateAge(athlete.dateOfBirth);

  // BMI Calculation
  const heightM = athlete.heightCm ? Number(athlete.heightCm) / 100 : null;
  const weightKg = athlete.weightKg ? Number(athlete.weightKg) : null;
  const bmiValue = heightM && weightKg && heightM > 0 ? weightKg / (heightM * heightM) : null;

  // Assessments
  const latestAssessment = athlete.assessments[0];
  const previousAssessment = athlete.assessments[1];
  const activeInjuries = athlete.injuryHistories.filter((i: any) => !i.recoveredAt);

  // Score Delta
  let scoreDelta: number | null = null;
  if (latestAssessment?.overallScore && previousAssessment?.overallScore) {
    scoreDelta = Math.round(
      (Number(latestAssessment.overallScore) - Number(previousAssessment.overallScore)) * 10
    ) / 10;
  }

  // Extract latest component scores if available
  let componentScores: Record<string, number> | null = null;
  if (latestAssessment?.analysis?.componentScores) {
    try {
      componentScores =
        typeof latestAssessment.analysis.componentScores === "string"
          ? JSON.parse(latestAssessment.analysis.componentScores)
          : (latestAssessment.analysis.componentScores as Record<string, number>);
    } catch {
      // Fallback
    }
  }

  const status: "ON_TRACK" | "NEEDS_REVIEW" | "INJURED" | "UNASSESSED" =
    activeInjuries.length > 0
      ? "INJURED"
      : !latestAssessment
      ? "UNASSESSED"
      : Number(latestAssessment.overallScore) < 65
      ? "NEEDS_REVIEW"
      : "ON_TRACK";

  const nextSession = athlete.scheduleSessions[0]?.session;
  const nextSessionDate = nextSession
    ? `${new Date(nextSession.startTime).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })}, ${new Date(nextSession.startTime).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })} WIB`
    : null;

  const lastAssessmentDate = latestAssessment
    ? new Date(latestAssessment.assessmentDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* 1. Header & Identity Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/athletes"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-1 text-muted hover:text-foreground hover:bg-surface-2 transition"
            title="Kembali ke Direktori Atlet"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold text-foreground tracking-tight sm:text-xl">
                {athlete.fullName}
              </h1>
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                  athlete.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {athlete.isActive ? "Aktif" : "Nonaktif"}
              </span>
              <span className="inline-flex items-center rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-secondary border border-border">
                {athlete.competitionLevel ?? "Pemula"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {athlete.sportCategory ?? "Multi-Sport"} · {age} Tahun ({formatDate(athlete.dateOfBirth)}) ·{" "}
              {athlete.gender === "MALE" ? "👦 Putra" : "👧 Putri"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AthleteProfileActions
            athleteId={athlete.id}
            athleteName={athlete.fullName}
            isActive={athlete.isActive}
            role={ctx.role}
          />
        </div>
      </div>

      {/* 2. Coach Brief (5–10 Detik) */}
      <AthleteCoachBrief
        status={status}
        overallScore={latestAssessment?.overallScore ? Number(latestAssessment.overallScore) : null}
        overallGrade={latestAssessment?.overallGrade ?? null}
        scoreDelta={scoreDelta}
        bestComponent={latestAssessment?.analysis?.bestComponent ?? null}
        weakestComponents={
          componentScores
            ? Object.entries(componentScores)
                .sort((a, b) => a[1] - b[1])
                .slice(0, 1)
                .map((e) => e[0])
            : []
        }
        activeInjuriesCount={activeInjuries.length}
        nextSessionDate={nextSessionDate}
        lastAssessmentDate={lastAssessmentDate}
      />

      {/* 3. Progressive Disclosure Tabs */}
      {(() => {
        const currentMap = new Map(
          performanceOverview.currentPerformance.map((c) => [c.testItemId, c.currentValue])
        );
        const activeGoalsSet = new Set(
          goals.filter((g) => g.status === "ACTIVE").map((g) => g.testItemId)
        );

        const availableTestItemsOptions = activeTestItems.map((item) => ({
          id: item.id,
          name: item.name,
          unit: item.unit,
          scoreDirection: item.scoreDirection,
          physicalComponent: item.physicalComponent,
          currentValue: currentMap.get(item.id) ?? null,
          hasActiveGoal: activeGoalsSet.has(item.id),
        }));

        return (
          <AthleteProfileTabs
            athlete={athlete}
            portalAccesses={portalAccesses}
            componentScores={componentScores}
            bmiValue={bmiValue}
            age={age}
            personalBests={performanceOverview.personalBests}
            currentPerformance={performanceOverview.currentPerformance}
            goals={goals}
            availableTestItems={availableTestItemsOptions}
            canManageGoals={canMemberManageGoals(ctx.role)}
          />
        );
      })()}
    </div>
  );
}
