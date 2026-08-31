"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import {
  markAttendanceSchema,
  batchMarkAttendanceSchema,
  resetAttendanceSchema,
  type MarkAttendanceInput,
  type BatchMarkAttendanceInput,
  type ResetAttendanceInput,
} from "./schema";
import {
  canMemberMarkAttendance,
  isSessionEligibleForAttendance,
  resolveCheckInTime,
} from "./engine";

/**
 * Marks or updates attendance for a single athlete in a scheduled session.
 */
export async function markAttendanceAction(
  rawInput: MarkAttendanceInput | FormData
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  const dataToValidate =
    rawInput instanceof FormData
      ? {
          sessionId: rawInput.get("sessionId") as string,
          athleteId: rawInput.get("athleteId") as string,
          status: rawInput.get("status") as string,
          notes: (rawInput.get("notes") as string) || undefined,
        }
      : rawInput;

  const parseResult = markAttendanceSchema.safeParse(dataToValidate);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi presensi gagal",
    };
  }

  const { sessionId, athleteId, status, notes } = parseResult.data;

  // 1. Fetch and verify session ownership, tenant isolation, and eligibility
  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: sessionId,
      organizationId: ctx.organizationId,
    },
    include: {
      athletes: {
        where: { athleteId },
        select: { athleteId: true },
      },
    },
  });

  if (!session) {
    return {
      success: false,
      error: "Sesi jadwal tidak ditemukan atau akses ditolak",
    };
  }

  // 2. Verify session status eligibility
  const eligibility = isSessionEligibleForAttendance(session.status);
  if (!eligibility.eligible) {
    return {
      success: false,
      error: eligibility.reason || "Status sesi tidak mengizinkan pencatatan presensi",
    };
  }

  // 3. Verify member permission (Assistant Coach can only mark their own session)
  const isAuthorized = canMemberMarkAttendance(
    ctx.role,
    ctx.memberId,
    session.coachId
  );

  if (!isAuthorized) {
    return {
      success: false,
      error: "Anda hanya memiliki wewenang untuk mencatat presensi pada sesi yang Anda bimbing",
    };
  }

  // 4. Verify athlete enrollment in the session
  if (session.athletes.length === 0) {
    return {
      success: false,
      error: "Atlet tidak terdaftar pada sesi jadwal ini",
    };
  }

  // 5. Verify athlete active status and tenant match
  const athlete = await prisma.athlete.findFirst({
    where: {
      id: athleteId,
      organizationId: ctx.organizationId,
      isActive: true,
    },
    select: { id: true },
  });

  if (!athlete) {
    return {
      success: false,
      error: "Atlet tidak ditemukan, tidak aktif, atau bukan milik organisasi Anda",
    };
  }

  // 6. Resolve server-side check-in time
  const checkInTime = resolveCheckInTime(status);

  try {
    await prisma.attendance.upsert({
      where: {
        sessionId_athleteId: {
          sessionId,
          athleteId,
        },
      },
      create: {
        organizationId: ctx.organizationId,
        sessionId,
        athleteId,
        status,
        checkInTime,
        notes: notes || null,
        markedByMemberId: ctx.memberId,
      },
      update: {
        status,
        checkInTime,
        notes: notes !== undefined ? notes || null : undefined,
        markedByMemberId: ctx.memberId,
      },
    });

    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    revalidatePath(`/athletes/${athleteId}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal mencatat presensi:", err);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat menyimpan presensi",
    };
  }
}

/**
 * Batch marks or updates attendance for multiple athletes in a single session.
 */
export async function batchMarkAttendanceAction(
  rawInput: BatchMarkAttendanceInput
): Promise<{ success: boolean; error?: string; count?: number }> {
  const ctx = await requireOrgContext();

  const parseResult = batchMarkAttendanceSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Validasi data presensi massal gagal",
    };
  }

  const { sessionId, items } = parseResult.data;

  // 1. Fetch and verify session
  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: sessionId,
      organizationId: ctx.organizationId,
    },
    include: {
      athletes: {
        select: { athleteId: true },
      },
    },
  });

  if (!session) {
    return {
      success: false,
      error: "Sesi jadwal tidak ditemukan atau akses ditolak",
    };
  }

  // 2. Verify eligibility
  const eligibility = isSessionEligibleForAttendance(session.status);
  if (!eligibility.eligible) {
    return {
      success: false,
      error: eligibility.reason || "Status sesi tidak mengizinkan pencatatan presensi",
    };
  }

  // 3. Verify permission
  const isAuthorized = canMemberMarkAttendance(
    ctx.role,
    ctx.memberId,
    session.coachId
  );

  if (!isAuthorized) {
    return {
      success: false,
      error: "Anda hanya memiliki wewenang untuk mencatat presensi pada sesi yang Anda bimbing",
    };
  }

  // 4. Verify that all athlete IDs are enrolled in the session
  const enrolledAthleteIds = new Set(session.athletes.map((a) => a.athleteId));
  const inputAthleteIds = items.map((i) => i.athleteId);

  const invalidAthletes = inputAthleteIds.filter(
    (id) => !enrolledAthleteIds.has(id)
  );

  if (invalidAthletes.length > 0) {
    return {
      success: false,
      error: "Beberapa atlet yang dikirim tidak terdaftar pada sesi jadwal ini",
    };
  }

  const now = new Date();

  try {
    await prisma.$transaction(
      items.map((item) => {
        const checkInTime = resolveCheckInTime(item.status, now);
        return prisma.attendance.upsert({
          where: {
            sessionId_athleteId: {
              sessionId,
              athleteId: item.athleteId,
            },
          },
          create: {
            organizationId: ctx.organizationId,
            sessionId,
            athleteId: item.athleteId,
            status: item.status,
            checkInTime,
            notes: item.notes || null,
            markedByMemberId: ctx.memberId,
          },
          update: {
            status: item.status,
            checkInTime,
            notes: item.notes !== undefined ? item.notes || null : undefined,
            markedByMemberId: ctx.memberId,
          },
        });
      })
    );

    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    return { success: true, count: items.length };
  } catch (err: unknown) {
    console.error("Gagal mencatat presensi massal:", err);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat menyimpan presensi massal",
    };
  }
}

/**
 * Resets an athlete's attendance back to UNMARKED.
 */
export async function resetAttendanceAction(
  rawInput: ResetAttendanceInput
): Promise<{ success: boolean; error?: string }> {
  return markAttendanceAction({
    sessionId: rawInput.sessionId,
    athleteId: rawInput.athleteId,
    status: "UNMARKED",
    notes: null,
  });
}

/**
 * Server Action to fetch session attendance data for client dialogs.
 */
export async function fetchSessionAttendanceAction(sessionId: string) {
  const ctx = await requireOrgContext();

  const session = await prisma.scheduleSession.findFirst({
    where: {
      id: sessionId,
      organizationId: ctx.organizationId,
    },
    include: {
      coach: {
        include: {
          user: { select: { name: true } },
        },
      },
      athletes: {
        include: {
          athlete: {
            select: {
              id: true,
              fullName: true,
              jerseyNumber: true,
              photoUrl: true,
              isActive: true,
            },
          },
        },
      },
      attendances: {
        include: {
          markedBy: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!session) {
    return { success: false, error: "Sesi jadwal tidak ditemukan atau akses ditolak" };
  }

  const attendanceMap = new Map(
    session.attendances.map((att) => [att.athleteId, att])
  );

  const roster = session.athletes
    .filter((sa) => sa.athlete.isActive)
    .map((sa) => {
      const att = attendanceMap.get(sa.athleteId);
      return {
        athleteId: sa.athlete.id,
        athleteName: sa.athlete.fullName,
        jerseyNumber: sa.athlete.jerseyNumber,
        photoUrl: sa.athlete.photoUrl,
        attendanceId: att ? att.id : null,
        status: (att?.status as any) || "UNMARKED",
        checkInTime: att?.checkInTime ? att.checkInTime.toISOString() : null,
        notes: att?.notes || null,
        markedByMemberId: att?.markedByMemberId || null,
        markedByName: att?.markedBy?.user.name || null,
        updatedAt: att?.updatedAt ? att.updatedAt.toISOString() : null,
      };
    });

  const isEditable =
    canMemberMarkAttendance(ctx.role, ctx.memberId, session.coachId) &&
    session.status !== "CANCELLED";

  return {
    success: true,
    data: {
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        coachId: session.coachId,
        coachName: session.coach.user.name,
        location: session.location,
      },
      roster,
      isEditable,
      currentMemberRole: ctx.role,
    },
  };
}

