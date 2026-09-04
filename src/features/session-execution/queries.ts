import "server-only";
import { prisma } from "@/lib/prisma";
import type { SessionExecutionData } from "./types";
import { canMemberExecuteSession, isSessionEligibleForExecution } from "./engine";

/**
 * Loads complete, unified data required for executing a scheduled training session in 1 efficient roundtrip.
 */
export async function getSessionExecutionData(
  organizationId: string,
  sessionId: string,
  currentMemberId: string,
  currentMemberRole: string
): Promise<SessionExecutionData | null> {
  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: sessionId,
      organizationId,
    },
    include: {
      coach: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      athletes: {
        include: {
          athlete: {
            select: {
              id: true,
              fullName: true,
              jerseyNumber: true,
              position: true,
              photoUrl: true,
              injuryHistories: {
                where: { recoveredAt: null },
                select: {
                  id: true,
                  injuryType: true,
                  severity: true,
                  injuryDate: true,
                  description: true,
                },
                orderBy: { injuryDate: "desc" },
              },
            },
          },
        },
      },
      trainingPlan: {
        select: {
          id: true,
          title: true,
          description: true,
          exercises: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              name: true,
              category: true,
              sets: true,
              reps: true,
              restSeconds: true,
              notes: true,
              order: true,
            },
          },
        },
      },
      attendances: {
        select: {
          athleteId: true,
          status: true,
          notes: true,
        },
      },
      sessionLogs: {
        select: {
          id: true,
          athleteId: true,
          activitiesDone: true,
          coachFeedback: true,
          videoUrl: true,
        },
      },
    },
  });

  if (!session) return null;

  const canExecute = canMemberExecuteSession(
    currentMemberRole,
    currentMemberId,
    session.executorId || session.coachId
  );

  const eligibility = isSessionEligibleForExecution(session.status);

  // Map athlete data with matching attendances & logs
  const attendanceMap = new Map(session.attendances.map((a) => [a.athleteId, a]));
  const sessionLogMap = new Map(session.sessionLogs.map((l) => [l.athleteId, l]));

  const mappedAthletes = session.athletes.map(({ athlete }) => {
    const attendance = attendanceMap.get(athlete.id);
    const log = sessionLogMap.get(athlete.id);

    return {
      id: athlete.id,
      fullName: athlete.fullName,
      jerseyNumber: athlete.jerseyNumber,
      position: athlete.position,
      photoUrl: athlete.photoUrl,
      activeInjuries: athlete.injuryHistories.map((inj) => ({
        id: inj.id,
        injuryType: inj.injuryType,
        severity: inj.severity,
        injuryDate: inj.injuryDate,
        description: inj.description,
      })),
      attendanceStatus: attendance?.status ?? "UNMARKED",
      attendanceNotes: attendance?.notes ?? null,
      existingSessionLog: log
        ? {
            id: log.id,
            activitiesDone: log.activitiesDone,
            coachFeedback: log.coachFeedback,
            videoUrl: log.videoUrl,
          }
        : null,
    };
  });

  return {
    id: session.id,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    location: session.location,
    notes: session.notes,
    coachId: session.coachId,
    coachName: session.coach.user.name,
    coachRole: session.coach.role,
    athletes: mappedAthletes,
    trainingPlan: session.trainingPlan
      ? {
          id: session.trainingPlan.id,
          title: session.trainingPlan.title,
          description: session.trainingPlan.description,
          exercises: session.trainingPlan.exercises,
        }
      : null,
    canExecute,
    isReadOnly: eligibility.readOnly || !canExecute,
  };
}
