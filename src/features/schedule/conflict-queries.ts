import "server-only";
import { prisma } from "@/lib/prisma";
import type { ExistingConflictSession } from "./conflict-engine";

export interface TimeRangeParam {
  startTime: Date;
  endTime: Date;
}

/**
 * Fetches potential conflicting sessions for one or multiple time ranges within an organization.
 * Uses a single batch database query to prevent N+1 queries.
 */
export async function getPotentialConflictSessions(
  organizationId: string,
  ranges: TimeRangeParam[]
): Promise<ExistingConflictSession[]> {
  if (!organizationId || ranges.length === 0) {
    return [];
  }

  // Find min start and max end across all requested ranges for efficient bounding
  let minStart = ranges[0].startTime.getTime();
  let maxEnd = ranges[0].endTime.getTime();

  for (const r of ranges) {
    const s = r.startTime.getTime();
    const e = r.endTime.getTime();
    if (s < minStart) minStart = s;
    if (e > maxEnd) maxEnd = e;
  }

  const sessions = await prisma.scheduleSession.findMany({
    where: {
      organizationId,
      status: { in: ["SCHEDULED", "COMPLETED"] },
      // Bounding box query + precise OR condition
      startTime: { lt: new Date(maxEnd) },
      endTime: { gt: new Date(minStart) },
      OR: ranges.map((range) => ({
        startTime: { lt: range.endTime },
        endTime: { gt: range.startTime },
      })),
    },
    include: {
      coach: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
      athletes: {
        include: {
          athlete: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    coachId: s.coachId,
    coachName: s.coach.user.name,
    athletes: s.athletes.map((a) => ({
      athleteId: a.athlete.id,
      athleteName: a.athlete.fullName,
    })),
  }));
}
