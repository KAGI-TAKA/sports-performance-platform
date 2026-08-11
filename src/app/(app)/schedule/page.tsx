import { requireOrgContext } from "@/lib/auth-context";
import {
  listScheduleSessions,
  listCoachesForOrg,
  listActiveAthletesForOrg,
} from "@/features/schedule/queries";
import { ScheduleDialogForm } from "@/features/schedule/components/schedule-dialog-form";
import { ScheduleAgendaView } from "@/features/schedule/components/schedule-agenda-view";
import { ExportCSVButton } from "@/features/export/components/export-csv-button";

export default async function SchedulePage() {
  const ctx = await requireOrgContext();

  const sessions = await listScheduleSessions(ctx.organizationId);
  const coachesRaw = await listCoachesForOrg(ctx.organizationId);
  const athletesRaw = await listActiveAthletesForOrg(ctx.organizationId);

  const coaches = coachesRaw.map((c) => ({
    id: c.id,
    name: c.user.name,
  }));

  const athletes = athletesRaw.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    jerseyNumber: a.jerseyNumber,
    position: a.position,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            Jadwal Sesi Latihan
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Kelola jadwal private training 1-on-1 dan grup kecil untuk seluruh
            atlet &amp; pelatih.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportCSVButton endpoint="/api/export/schedule" label="Export CSV Jadwal" />
          <ScheduleDialogForm coaches={coaches} athletes={athletes} />
        </div>
      </div>

      {/* Agenda List View */}
      <ScheduleAgendaView sessions={sessions as any} />
    </div>
  );
}
