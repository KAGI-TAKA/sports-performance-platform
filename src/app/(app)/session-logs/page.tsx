import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import {
  listSessionLogs,
  listActiveAthletesForSessionLogs,
} from "@/features/session-logs/queries";
import { SessionLogCard } from "@/features/session-logs/components/session-log-card";
import { SessionLogDialogForm } from "@/features/session-logs/components/session-log-dialog-form";
import { ExportCSVButton } from "@/features/export/components/export-csv-button";
import { ClipboardCheck, User, Users } from "lucide-react";

export default async function SessionLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ athleteId?: string }>;
}) {
  const { athleteId = "ALL" } = await searchParams;
  const ctx = await requireOrgContext();

  const logs = await listSessionLogs(ctx.organizationId, { athleteId });
  const athletesRaw = await listActiveAthletesForSessionLogs(
    ctx.organizationId
  );

  const athletes = athletesRaw.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    jerseyNumber: a.jerseyNumber,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            Catatan Sesi Latihan Harian
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Catat ringkasan aktivitas, umpan balik pelatih, dan video rekaman latihan harian atlet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportCSVButton endpoint="/api/export/session-logs" label="Export CSV Sesi" />
          <SessionLogDialogForm athletes={athletes} />
        </div>
      </div>

      {/* Athlete Filter Bar */}
      <div className="flex items-center gap-3 border-b border-border pb-3 text-xs">
        <span className="flex items-center gap-1 font-semibold text-muted">
          <Users className="h-3.5 w-3.5" />
          Filter Atlet:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Link
            href="/session-logs"
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              athleteId === "ALL"
                ? "bg-accent text-white"
                : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            Semua Atlet
          </Link>
          {athletes.map((a) => (
            <Link
              key={a.id}
              href={`/session-logs?athleteId=${a.id}`}
              className={`rounded-lg px-3 py-1.5 font-semibold transition shrink-0 ${
                athleteId === a.id
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {a.fullName}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid of Logs */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-1 py-12 text-center">
          <ClipboardCheck className="h-10 w-10 text-muted/50 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            Belum Ada Catatan Sesi Latihan
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm">
            Klik tombol "Catat Sesi Harian" di atas untuk menyimpan aktivitas &amp; umpan balik latihan hari ini.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {logs.map((log) => (
            <SessionLogCard key={log.id} log={log as any} />
          ))}
        </div>
      )}
    </div>
  );
}
