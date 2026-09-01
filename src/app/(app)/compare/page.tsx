import { requireOrgContext } from "@/lib/auth-context";
import {
  listAthletesWithAssessments,
  getMultiAthleteComparisonData,
  getFullAssessmentDetails,
} from "@/features/compare/queries";
import { CompareHeadToHead } from "@/features/compare/components/compare-head-to-head";
import { CompareHistorical } from "@/features/compare/components/compare-historical";
import { GitCompare, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode = "head-to-head" } = await searchParams;
  const ctx = await requireOrgContext();

  const athletesRaw = await listAthletesWithAssessments(ctx.organizationId);

  // Filter athletes who have at least one completed assessment for comparison
  const athletes = athletesRaw.filter((a) => a.assessments.length > 0);

  let assessmentDetailsMap: Record<string, any> = {};

  if (mode === "historical") {
    // For historical mode, collect all assessment IDs for the selected athlete
    const assessmentIds: string[] = [];
    athletes.forEach((a) => {
      a.assessments.forEach((ass) => {
        assessmentIds.push(ass.id);
      });
    });

    const details = await Promise.all(
      assessmentIds.map((id) => getFullAssessmentDetails(ctx.organizationId, id))
    );

    details.forEach((d) => {
      if (d) {
        assessmentDetailsMap[d.id] = d;
      }
    });
  } else {
    // P8-C3: Single batch query for multi-athlete comparison (Zero N+1)
    const allAthleteIds = athletes.map((a) => a.id);
    const multiAthleteData = await getMultiAthleteComparisonData(
      ctx.organizationId,
      allAthleteIds
    );

    multiAthleteData.forEach((d) => {
      assessmentDetailsMap[d.id] = d;
    });
  }

  const athleteOptions = athletes.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    position: a.position,
    jerseyNumber: a.jerseyNumber,
    assessmentCount: a.assessments.length,
    assessments: a.assessments,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1300px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight flex items-center gap-2 sm:text-2xl">
            <GitCompare className="h-6 w-6 text-accent" />
            Komparasi Profil Performa Atlet
          </h1>
          <p className="mt-1 text-xs text-muted">
            Bandingkan perkembangan fisik 2–4 atlet secara kontekstual &amp; terstandarisasi, bukan untuk menentukan pemenang.
          </p>
        </div>

        {/* Tab Mode Switcher */}
        <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-1 border border-border">
          <Link
            href="/compare?mode=head-to-head"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              mode === "head-to-head"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Komparasi Skuad (2–4 Atlet)</span>
          </Link>
          <Link
            href="/compare?mode=historical"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              mode === "historical"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Historis (Lama vs Baru)</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {athletes.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-1 p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 mx-auto">
            <GitCompare className="h-6 w-6 text-muted" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Belum ada data assessment selesai
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Fitur komparasi membutuhkan minimal 1 assessment yang telah selesai. Silakan lakukan assessment fisik terlebih dahulu.
          </p>
          <Link
            href="/assessments/new"
            className="inline-block rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
          >
            + Assessment Baru
          </Link>
        </div>
      ) : mode === "historical" ? (
        <CompareHistorical
          athletes={athletes as any}
          assessmentDetailsMap={assessmentDetailsMap}
        />
      ) : (
        <CompareHeadToHead
          athletes={athleteOptions}
          assessmentDetailsMap={assessmentDetailsMap}
        />
      )}
    </div>
  );
}
