import Link from "next/link";
import { Suspense } from "react";
import { requireOrgContext } from "@/lib/auth-context";
import { listAthletes, getAthleteById } from "@/features/athletes/queries";
import { AthleteSearchInput } from "@/features/athletes/components/athlete-search-input";
import { AthleteFilters } from "@/features/athletes/components/athlete-filters";
import { AthleteDetailPanel } from "@/features/athletes/components/athlete-detail-panel";
import { UserPlus } from "lucide-react";

function calculateAge(dateOfBirth: Date, now: Date): number {
  return Math.floor(
    (now.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
}

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<{ athleteId?: string; q?: string; position?: string; ageGroup?: string }>;
}) {
  const { athleteId, q, position, ageGroup } = await searchParams;
  const ctx = await requireOrgContext();

  const athletes = await listAthletes(ctx.organizationId, {
    search: q,
    position,
    ageGroup,
  });

  const selectedAthlete = athleteId
    ? await getAthleteById(ctx.organizationId, athleteId)
    : null;

  const now = new Date();
  const selectedAthleteAge = selectedAthlete
    ? calculateAge(selectedAthlete.dateOfBirth, now)
    : null;

  const hasActiveFilters = (q && q.trim()) || (position && position !== "ALL") || (ageGroup && ageGroup !== "ALL");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            Manajemen Atlet
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {hasActiveFilters
              ? `${athletes.length} hasil ditemukan`
              : `${athletes.length} atlet terdaftar`}
          </p>
        </div>
        <Link
          href="/athletes/new"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))" }}
        >
          <UserPlus className="h-4 w-4" />
          Tambah Atlet
        </Link>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4 items-start">
        {/* Left Panel — Search + Filter + List */}
        <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
          <div className="p-3 border-b border-border space-y-1.5">
            <AthleteSearchInput defaultValue={q ?? ""} />
            <Suspense>
              <AthleteFilters />
            </Suspense>
          </div>

          <div className="divide-y divide-border max-h-[calc(100vh-240px)] overflow-y-auto">
            {athletes.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted">
                  {hasActiveFilters ? "Tidak ada atlet yang cocok dengan filter" : "Belum ada atlet terdaftar"}
                </p>
                {!hasActiveFilters && (
                  <Link
                    href="/athletes/new"
                    className="mt-2 inline-block text-xs text-accent hover:underline"
                  >
                    Tambah atlet pertama →
                  </Link>
                )}
              </div>
            ) : (
              athletes.map((athlete) => {
                const age = calculateAge(athlete.dateOfBirth, now);
                const isSelected = athlete.id === athleteId;
                return (
                  <Link
                    key={athlete.id}
                    href={`/athletes?athleteId=${athlete.id}${q ? `&q=${q}` : ""}${position && position !== "ALL" ? `&position=${position}` : ""}${ageGroup && ageGroup !== "ALL" ? `&ageGroup=${ageGroup}` : ""}`}
                    className={`flex items-center gap-3 px-3 py-3 transition-colors ${
                      isSelected
                        ? "bg-accent/10 border-l-2 border-accent"
                        : "hover:bg-surface-2/60 border-l-2 border-transparent"
                    }`}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
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
                      <div className="text-sm font-medium text-foreground truncate">
                        {athlete.fullName}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {athlete.position !== "UNSPECIFIED"
                          ? athlete.position.replace(/_/g, " ").toLowerCase()
                          : "Posisi belum diisi"}{" "}
                        · {age} th
                        {athlete.jerseyNumber != null && ` · #${athlete.jerseyNumber}`}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel — Detail */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 min-h-[500px]">
          <AthleteDetailPanel athlete={selectedAthlete} age={selectedAthleteAge} />
        </div>
      </div>
    </div>
  );
}
