import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import {
  listSessionLogs,
  listActiveAthletesForSessionLogs,
} from "@/features/session-logs/queries";
import { listScheduleSessions } from "@/features/schedule/queries";
import { SessionLogCard } from "@/features/session-logs/components/session-log-card";
import { SessionLogDialogForm } from "@/features/session-logs/components/session-log-dialog-form";
import { ExportCSVButton } from "@/features/export/components/export-csv-button";
import { SessionLogAthleteFilter } from "@/features/session-logs/components/session-log-athlete-filter";
import { ClipboardCheck } from "lucide-react";

export default async function SessionLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ athleteId?: string }>;
}) {
  const { athleteId = "ALL" } = await searchParams;
  const ctx = await requireOrgContext();

  const isAssistant = ctx.role === "assistant_coach";

  const [logs, athletesRaw, scheduleSessionsRaw] = await Promise.all([
    listSessionLogs(ctx.organizationId, {
      athleteId,
      createdById: isAssistant ? ctx.memberId : undefined,
    }),
    listActiveAthletesForSessionLogs(ctx.organizationId),
    listScheduleSessions(ctx.organizationId, {
      coachId: isAssistant ? ctx.memberId : undefined,
    }),
  ]);

  // For Assistant Coach: filter athletes dropdown to those associated with assistant's sessions/logs
  const relevantAthleteIds = new Set<string>();
  if (isAssistant) {
    scheduleSessionsRaw.forEach((s) => s.athletes.forEach((a) => relevantAthleteIds.add(a.athlete.id)));
    logs.forEach((l) => relevantAthleteIds.add(l.athlete.id));
  }

  const athletes = athletesRaw
    .filter((a) => !isAssistant || relevantAthleteIds.has(a.id))
    .map((a) => ({
      id: a.id,
      fullName: a.fullName,
      jerseyNumber: a.jerseyNumber,
    }));

  const scheduleSessions = scheduleSessionsRaw.map((s) => {
    let defaultActivities = "";
    if (s.trainingPlan && s.trainingPlan.exercises.length > 0) {
      defaultActivities =
        `[Program Latihan: ${s.trainingPlan.title}]\n` +
        s.trainingPlan.exercises
          .map(
            (ex, idx) =>
              `${idx + 1}. ${ex.name}${
                ex.sets && ex.reps ? ` (${ex.sets} sets x ${ex.reps})` : ""
              }${ex.notes ? ` - ${ex.notes}` : ""}`
          )
          .join("\n");
    }
    return {
      id: s.id,
      title: s.title,
      athleteIds: s.athletes.map((a) => a.athlete.id),
      trainingPlanTitle: s.trainingPlan?.title ?? null,
      defaultActivities: defaultActivities || null,
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            Step 05 — Catatan Sesi &amp; Pemantauan Harian
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Track response &amp; progress: Catat ringkasan aktivitas, umpan balik pelatih, dan video rekaman latihan harian atlet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportCSVButton endpoint="/api/export/session-logs" label="Export CSV Sesi" />
          <SessionLogDialogForm athletes={athletes} scheduleSessions={scheduleSessions} />
        </div>
      </div>

      {/* Searchable Athlete Filter Bar */}
      <SessionLogAthleteFilter
        athletes={athletes}
        selectedAthleteId={athleteId}
        totalLogs={logs.length}
      />

      {/* Grid of Logs */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-1 py-12 text-center">
          <ClipboardCheck className="h-10 w-10 text-muted/50 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            Belum Ada Catatan Sesi Latihan
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm">
            Klik tombol &quot;Catat Sesi Harian&quot; di atas untuk menyimpan aktivitas &amp; umpan balik latihan hari ini.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {logs.map((log) => (
            <SessionLogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
