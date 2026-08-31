import Link from "next/link";
import { Suspense } from "react";
import { requireOrgContext } from "@/lib/auth-context";
import { listAthletes, getAthleteById, ATHLETES_PER_PAGE } from "@/features/athletes/queries";
import { AthleteSearchInput } from "@/features/athletes/components/athlete-search-input";
import { AthleteFilters } from "@/features/athletes/components/athlete-filters";
import { AthleteDetailPanel } from "@/features/athletes/components/athlete-detail-panel";
import { Pagination } from "@/components/ui/pagination";
import { ExportCSVButton } from "@/features/export/components/export-csv-button";
import { UserPlus, ExternalLink } from "lucide-react";

function calculateAge(dateOfBirth: Date, now: Date): number {
  return Math.floor(
    (now.getTime() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
}

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<{
    athleteId?: string;
    q?: string;
    position?: string;
    ageGroup?: string;
    status?: "active" | "inactive" | "all";
    page?: string;
  }>;
}) {
  const { athleteId, q, position, ageGroup, status, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const ctx = await requireOrgContext();

  const { athletes, total } = await listAthletes(ctx.organizationId, {
    search: q,
    position,
    ageGroup,
    status: status ?? "active",
    page,
  });
  const totalPages = Math.ceil(total / ATHLETES_PER_PAGE);

  const selectedAthlete = athleteId
    ? await getAthleteById(ctx.organizationId, athleteId)
    : athletes[0]
    ? await getAthleteById(ctx.organizationId, athletes[0].id)
    : null;

  const now = new Date();
  const selectedAthleteAge = selectedAthlete
    ? calculateAge(selectedAthlete.dateOfBirth, now)
    : null;

  const hasActiveFilters =
    (q && q.trim()) ||
    (position && position !== "ALL") ||
    (ageGroup && ageGroup !== "ALL") ||
    (status && status !== "active");

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
            Direktori &amp; Profil Atlet
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {hasActiveFilters
              ? `${total} hasil ditemukan dengan filter aktif`
              : `${total} atlet binaan terdaftar`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportCSVButton endpoint="/api/export/athletes" label="Export CSV" />
          <Link
            href="/athletes/new"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))" }}
          >
            <UserPlus className="h-4 w-4" />
            Tambah Atlet
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Left Panel — Search, Filters & Athlete List */}
        <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
          <div className="p-3 border-b border-border space-y-2">
            <AthleteSearchInput defaultValue={q ?? ""} />
            <Suspense>
              <AthleteFilters />
            </Suspense>
          </div>

          <div className="divide-y divide-border max-h-[calc(100vh-280px)] overflow-y-auto">
            {athletes.length === 0 ? (
              <div className="px-4 py-8 text-center space-y-2">
                <p className="text-xs text-muted">
                  {hasActiveFilters
                    ? "Tidak ada atlet yang cocok dengan kriteria pencarian/filter"
                    : "Belum ada atlet terdaftar di organisasi ini"}
                </p>
                {!hasActiveFilters && (
                  <Link
                    href="/athletes/new"
                    className="inline-block text-xs font-medium text-accent hover:underline"
                  >
                    + Tambah atlet pertama →
                  </Link>
                )}
              </div>
            ) : (
              athletes.map((athlete) => {
                const age = calculateAge(athlete.dateOfBirth, now);
                const isSelected = selectedAthlete?.id === athlete.id;
                const statusQuery = status ? `&status=${status}` : "";
                const qQuery = q ? `&q=${q}` : "";
                const posQuery = position && position !== "ALL" ? `&position=${position}` : "";
                const ageQuery = ageGroup && ageGroup !== "ALL" ? `&ageGroup=${ageGroup}` : "";

                return (
                  <div
                    key={athlete.id}
                    className={`flex items-center justify-between px-3 py-3 transition-colors ${
                      isSelected
                        ? "bg-accent/10 border-l-2 border-accent"
                        : "hover:bg-surface-2/60 border-l-2 border-transparent"
                    }`}
                  >
                    <Link
                      href={`/athletes?athleteId=${athlete.id}${qQuery}${posQuery}${ageQuery}${statusQuery}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                        style={{
                          background: isSelected
                            ? "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))"
                            : "hsl(var(--surface-3))",
                          color: isSelected ? "white" : "hsl(var(--text-secondary))",
                        }}
                      >
                        {athlete.fullName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {athlete.fullName}
                          </span>
                          {!athlete.isActive && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-surface-3 text-muted">
                              Off
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted truncate flex items-center gap-1">
                          <span>{age} thn</span>
                          <span>·</span>
                          <span>{athlete.gender === "MALE" ? "👦 Putra" : "👧 Putri"}</span>
                          {athlete.sportCategory && (
                            <>
                              <span>·</span>
                              <span className="text-accent">{athlete.sportCategory}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>

                    <Link
                      href={`/athletes/${athlete.id}`}
                      className="p-1 text-muted hover:text-accent transition-colors"
                      title="Buka Profil Lengkap"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="border-t border-border px-3 py-2">
              <Pagination
                page={page}
                totalPages={totalPages}
                path="/athletes"
                baseParams={{ q, position, ageGroup, status }}
              />
            </div>
          )}
        </div>

        {/* Right Panel — Selected Athlete Summary & Quick Profile Link */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 min-h-[500px]">
          <AthleteDetailPanel
            athlete={selectedAthlete}
            age={selectedAthleteAge}
            role={ctx.role}
            athletes={athletes.map((a) => ({ id: a.id, fullName: a.fullName }))}
          />
        </div>
      </div>
    </div>
  );
}
