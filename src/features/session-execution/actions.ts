"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import type { SessionExecutionPayload } from "./types";
import {
  canMemberExecuteSession,
  isSessionEligibleForExecution,
  formatActivitiesDoneFromExecution,
  validateSessionCompletionPreconditions,
} from "./engine";
import { resolveCheckInTime } from "@/features/attendance/engine";

/**
 * Saves draft execution progress (attendances + draft notes) without completing the session.
 */
export async function saveSessionExecutionDraftAction(
  payload: SessionExecutionPayload
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: payload.sessionId,
      organizationId: ctx.organizationId,
    },
    include: {
      athletes: true,
    },
  });

  if (!session) {
    return { success: false, error: "Sesi jadwal tidak ditemukan atau akses ditolak." };
  }

  // Verify RBAC
  const hasAuthority = canMemberExecuteSession(ctx.role, ctx.memberId, session.coachId);
  if (!hasAuthority) {
    return { success: false, error: "Anda tidak memiliki wewenang untuk mencatat sesi ini." };
  }

  const eligibility = isSessionEligibleForExecution(session.status);
  if (!eligibility.eligible && eligibility.readOnly) {
    return { success: false, error: eligibility.reason ?? "Sesi berstatus read-only." };
  }

  // Atomic draft save
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Upsert attendance for all athletes in payload
      for (const a of payload.athletes) {
        const checkIn = resolveCheckInTime(a.attendanceStatus);
        await tx.attendance.upsert({
          where: {
            sessionId_athleteId: {
              sessionId: session.id,
              athleteId: a.athleteId,
            },
          },
          update: {
            status: a.attendanceStatus,
            notes: a.attendanceNotes || null,
            checkInTime: checkIn,
            markedByMemberId: ctx.memberId,
          },
          create: {
            organizationId: ctx.organizationId,
            sessionId: session.id,
            athleteId: a.athleteId,
            status: a.attendanceStatus,
            notes: a.attendanceNotes || null,
            checkInTime: checkIn,
            markedByMemberId: ctx.memberId,
          },
        });
      }

      // 2. Update general session notes if provided
      if (payload.generalNotes !== undefined) {
        await tx.scheduleSession.update({
          where: { id: session.id },
          data: { notes: payload.generalNotes || null },
        });
      }
    });

    revalidatePath("/schedule");
    revalidatePath(`/schedule/${session.id}/execute`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan draf eksekusi sesi.";
    return { success: false, error: errorMsg };
  }
}

/**
 * Completes the training session atomically:
 * 1. Finalizes attendances.
 * 2. Auto-generates structured SessionLog for each PRESENT / LATE athlete.
 * 3. Sets ScheduleSession.status = COMPLETED (automatically making ParentFeedback eligible).
 */
export async function completeSessionExecutionAction(
  payload: SessionExecutionPayload
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: payload.sessionId,
      organizationId: ctx.organizationId,
    },
    include: {
      athletes: true,
      trainingPlan: {
        include: {
          exercises: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!session) {
    return { success: false, error: "Sesi jadwal tidak ditemukan atau akses ditolak." };
  }

  // Verify RBAC
  const hasAuthority = canMemberExecuteSession(ctx.role, ctx.memberId, session.coachId);
  if (!hasAuthority) {
    return { success: false, error: "Anda tidak memiliki wewenang untuk menyelesaikan sesi ini." };
  }

  const eligibility = isSessionEligibleForExecution(session.status);
  if (!eligibility.eligible && eligibility.readOnly) {
    return { success: false, error: eligibility.reason ?? "Sesi berstatus read-only." };
  }

  // Validate completion preconditions
  const validation = validateSessionCompletionPreconditions(
    payload.athletes.map((a) => ({
      athleteId: a.athleteId,
      attendanceStatus: a.attendanceStatus,
    }))
  );

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const exercises = session.trainingPlan?.exercises ?? [];
  const planTitle = session.trainingPlan?.title ?? null;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Finalize attendance records
      for (const a of payload.athletes) {
        const checkIn = resolveCheckInTime(a.attendanceStatus);
        await tx.attendance.upsert({
          where: {
            sessionId_athleteId: {
              sessionId: session.id,
              athleteId: a.athleteId,
            },
          },
          update: {
            status: a.attendanceStatus,
            notes: a.attendanceNotes || null,
            checkInTime: checkIn,
            markedByMemberId: ctx.memberId,
          },
          create: {
            organizationId: ctx.organizationId,
            sessionId: session.id,
            athleteId: a.athleteId,
            status: a.attendanceStatus,
            notes: a.attendanceNotes || null,
            checkInTime: checkIn,
            markedByMemberId: ctx.memberId,
          },
        });

        // 2. Generate/Update SessionLog ONLY for participating athletes (PRESENT or LATE)
        if (a.attendanceStatus === "PRESENT" || a.attendanceStatus === "LATE") {
          const activitiesDone = formatActivitiesDoneFromExecution(
            planTitle,
            exercises,
            a.exercises,
            payload.generalNotes
          );

          // Check if session log already exists for this (session, athlete)
          const existingLog = await tx.sessionLog.findFirst({
            where: {
              organizationId: ctx.organizationId,
              scheduleSessionId: session.id,
              athleteId: a.athleteId,
            },
          });

          if (existingLog) {
            await tx.sessionLog.update({
              where: { id: existingLog.id },
              data: {
                activitiesDone,
                coachFeedback: a.coachFeedback || existingLog.coachFeedback,
                videoUrl: a.videoUrl !== undefined ? (a.videoUrl || null) : existingLog.videoUrl,
                sessionDate: session.startTime,
              },
            });
          } else {
            await tx.sessionLog.create({
              data: {
                organizationId: ctx.organizationId,
                athleteId: a.athleteId,
                scheduleSessionId: session.id,
                createdByMemberId: ctx.memberId,
                sessionDate: session.startTime,
                activitiesDone,
                coachFeedback: a.coachFeedback || null,
                videoUrl: a.videoUrl || null,
              },
            });
          }
        }
      }

      // 3. Mark schedule session status = COMPLETED
      await tx.scheduleSession.update({
        where: { id: session.id },
        data: {
          status: "COMPLETED",
          notes: payload.generalNotes || session.notes,
        },
      });
    });

    // Revalidate relevant pages
    revalidatePath("/schedule");
    revalidatePath(`/schedule/${session.id}/execute`);
    revalidatePath("/session-logs");
    revalidatePath("/athletes");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyelesaikan sesi latihan.";
    return { success: false, error: errorMsg };
  }
}

/**
 * P8-B1.1: 1-Tap Attendance Batch Action ("Tandai Semua Hadir").
 * Atomically transitions all UNMARKED athletes in a session to PRESENT.
 * Strictly PRESERVES existing ABSENT, EXCUSED, RESCHEDULED, and LATE attendance statuses.
 */
export async function batchMarkAllPresentAction(sessionId: string): Promise<{
  success: boolean;
  error?: string;
  updatedCount?: number;
  preservedCount?: number;
  sessionId?: string;
}> {
  try {
    const ctx = await requireOrgContext();

    if (!sessionId || typeof sessionId !== "string") {
      return { success: false, error: "ID Sesi tidak valid." };
    }

    const session = await prisma.scheduleSession.findFirst({
      where: {
        id: sessionId,
        organizationId: ctx.organizationId,
      },
      include: {
        athletes: {
          include: {
            athlete: { select: { id: true, fullName: true, isActive: true } },
          },
        },
        attendances: true,
      },
    });

    if (!session) {
      return { success: false, error: "Sesi jadwal tidak ditemukan atau akses ditolak." };
    }

    // Verify RBAC
    const hasAuthority = canMemberExecuteSession(ctx.role, ctx.memberId, session.coachId);
    if (!hasAuthority) {
      return { success: false, error: "Anda tidak memiliki wewenang untuk mencatat sesi ini." };
    }

    const eligibility = isSessionEligibleForExecution(session.status);
    if (!eligibility.eligible && eligibility.readOnly) {
      return { success: false, error: eligibility.reason ?? "Sesi berstatus read-only." };
    }

    const attendanceMap = new Map(session.attendances.map((att) => [att.athleteId, att]));

    // Determine target athletes whose status is UNMARKED (or have no record yet)
    const toUpdateAthleteIds: string[] = [];
    let preservedCount = 0;

    for (const sa of session.athletes) {
      const existing = attendanceMap.get(sa.athleteId);
      if (!existing || existing.status === "UNMARKED") {
        toUpdateAthleteIds.push(sa.athleteId);
      } else {
        preservedCount++;
      }
    }

    if (toUpdateAthleteIds.length === 0) {
      return {
        success: true,
        updatedCount: 0,
        preservedCount,
        sessionId: session.id,
      };
    }

    const now = new Date();

    // Atomic transaction: update all UNMARKED to PRESENT
    await prisma.$transaction(async (tx) => {
      for (const athleteId of toUpdateAthleteIds) {
        await tx.attendance.upsert({
          where: {
            sessionId_athleteId: {
              sessionId: session.id,
              athleteId,
            },
          },
          update: {
            status: "PRESENT",
            checkInTime: now,
            markedByMemberId: ctx.memberId,
          },
          create: {
            organizationId: ctx.organizationId,
            sessionId: session.id,
            athleteId,
            status: "PRESENT",
            checkInTime: now,
            markedByMemberId: ctx.memberId,
          },
        });
      }
    });

    revalidatePath(`/schedule/${session.id}/execute`);
    revalidatePath("/schedule");

    return {
      success: true,
      updatedCount: toUpdateAthleteIds.length,
      preservedCount,
      sessionId: session.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui presensi massal.";
    return { success: false, error: errorMsg };
  }
}

