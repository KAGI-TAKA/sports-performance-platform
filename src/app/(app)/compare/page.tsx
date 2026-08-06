import { requireOrgContext } from "@/lib/auth-context";
import {
  listAthletesWithAssessments,
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

  const athletes = await listAthletesWithAssessments(ctx.organizationId);

  // Collect all assessment IDs from eligible athletes
  const assessmentIds: string[] = [];
  athletes.forEach((a) => {
    a.assessments.forEach((ass) => {
      assessmentIds.push(ass.id);
    });
  });

  // Fetch assessment details in parallel
  const details = await Promise.all(
    assessmentIds.map((id) => getFullAssessmentDetails(ctx.organizationId, id))
  );

  const assessmentDetailsMap: Record<string, any> = {};
  details.forEach((d) => {
    if (d) {
      assessmentDetailsMap[d.id] = d;
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-[1300px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-accent" />
            Komparasi Assessment Fisik
          </h1>
          <p className="mt-1 text-sm text-muted">
            Bandingkan hasil tes fisik antar atlet (Head-to-Head) atau lacak perkembangan historis sesi tes fisik.
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
            Head-to-Head (Atlet vs Atlet)
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
            Historis (Lama vs Baru)
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
          athletes={athletes}
          assessmentDetailsMap={assessmentDetailsMap}
        />
      ) : (
        <CompareHeadToHead
          athletes={athletes}
          assessmentDetailsMap={assessmentDetailsMap}
        />
      )}
    </div>
  );
}
