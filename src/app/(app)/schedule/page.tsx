import { requireOrgContext } from "@/lib/auth-context";
import {
  listScheduleSessions,
  listCoachesForOrg,
  listActiveAthletesForOrg,
} from "@/features/schedule/queries";
import { getStartOfDay, getEndOfDay } from "@/features/schedule/utils";
import { ScheduleDialogForm } from "@/features/schedule/components/schedule-dialog-form";
import { ScheduleContainer } from "@/features/schedule/components/schedule-container";
import { ExportCSVButton } from "@/features/export/components/export-csv-button";
import type { ScheduleStatus } from "@prisma/client";

import { listTrainingPlans } from "@/features/training-plans/queries";

interface SchedulePageProps {
  searchParams?: Promise<{
    date?: string;
    coachId?: string;
    status?: string;
    view?: string;
  }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const ctx = await requireOrgContext();
  const resolvedParams = searchParams ? await searchParams : {};

  const dateFilter = resolvedParams.date;
  const coachFilter = resolvedParams.coachId;
  const statusFilter = resolvedParams.status as ScheduleStatus | undefined;

  let startDate: Date | undefined = undefined;
  let endDate: Date | undefined = undefined;

  if (dateFilter) {
    startDate = getStartOfDay(dateFilter);
    endDate = getEndOfDay(dateFilter);
  }

  const [sessionsRaw, coachesRaw, athletesRaw, plansRaw] = await Promise.all([
    listScheduleSessions(ctx.organizationId, {
      startDate,
      endDate,
      coachId: coachFilter,
      status: statusFilter,
    }),
    listCoachesForOrg(ctx.organizationId),
    listActiveAthletesForOrg(ctx.organizationId),
    listTrainingPlans(ctx.organizationId),
  ]);

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

  const trainingPlans = plansRaw.map((p) => ({
    id: p.id,
    title: p.title,
    athleteId: p.athleteId,
  }));

  const sessions = sessionsRaw.map((s) => ({
    id: s.id,
    title: s.title,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    location: s.location,
    notes: s.notes,
    coachId: s.coachId,
    coach: {
      user: {
        name: s.coach.user.name,
        email: s.coach.user.email,
        image: s.coach.user.image,
      },
    },
    athletes: s.athletes.map((a) => ({
      athlete: {
        id: a.athlete.id,
        fullName: a.athlete.fullName,
        jerseyNumber: a.athlete.jerseyNumber,
        position: a.athlete.position,
        photoUrl: a.athlete.photoUrl,
      },
    })),
  }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
            Jadwal Sesi Latihan
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Kelola agenda operasional private training 1-on-1 dan grup kecil atlet &amp; pelatih.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportCSVButton endpoint="/api/export/schedule" label="Export CSV" />
          <ScheduleDialogForm coaches={coaches} athletes={athletes} trainingPlans={trainingPlans} />
        </div>
      </div>

      {/* Schedule Dual View (Calendar + Agenda) */}
      <ScheduleContainer
        sessions={sessions}
        coaches={coaches}
        athletes={athletes}
        currentDateFilter={dateFilter}
        currentCoachFilter={coachFilter}
        currentStatusFilter={statusFilter}
      />
    </div>
  );
}
