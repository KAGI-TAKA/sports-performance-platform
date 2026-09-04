import "server-only";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import type {
  PortalAccessContext,
  PortalAthleteProfile,
  PortalAssessmentSnapshot,
  PortalComponentTrend,
  PortalTrainingPlan,
  PortalScheduleSession,
  PortalSessionLog,
  PortalReportItem,
  PortalAchievementData,
  PortalPersonalBestItem,
  PortalAthleteGoalItem,
  PortalAttendanceSummary,
  PortalSiblingItem,
} from "./types";
import {
  getPortalContextByToken,
  getPortalAthleteProfile,
  getPortalAthleteProgress,
  getPortalAthleteTrainingPlan,
  getPortalAthleteSchedule,
  getPortalAthleteSessionLogs,
  getPortalAthleteReports,
  getPortalAthleteAchievements,
  getPortalAthleteGuidances,
  getPortalAthletePerformanceOverview,
  getPortalAthleteGoals,
  getPortalAthleteAttendance,
  getPortalAthleteSiblings,
} from "./queries";
import { getEligibleParentFeedbackSessions } from "@/features/parent-feedback/queries";

export interface ParentChildItem {
  id: string;
  fullName: string;
  sportCategory: string | null;
  jerseyNumber: number | null;
  dateOfBirth: Date;
  photoUrl: string | null;
}

// ─── Verification-table key helpers ──────────────────────────────────────────

/**
 * Identifier used in the `Verification` table to store the authoritative
 * Parent → [AthleteId] relationship.
 *
 * Format: "parent-children:{userId}:{organizationId}"
 *
 * The stored `value` is a JSON array of athleteIds the parent is authorized
 * to access in this organization.
 *
 * This avoids any schema migration while providing identity-based (not
 * name-based) parent authorization.
 */
function parentChildrenKey(userId: string, organizationId: string): string {
  return `parent-children:${userId}:${organizationId}`;
}

/**
 * Record the parent ↔ athlete relationships for a given parent userId in the
 * Verification table. Replaces any prior record for this key.
 *
 * Should be called during Admin provisioning of a parent account.
 */
export async function setParentAthleteRelationships(
  parentUserId: string,
  organizationId: string,
  athleteIds: string[]
): Promise<void> {
  const identifier = parentChildrenKey(parentUserId, organizationId);
  // 10 years — effectively permanent for the lifetime of the relationship
  const expiresAt = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
  const value = JSON.stringify(athleteIds);

  // identifier is not @unique in schema — find existing record first
  const existing = await prisma.verification.findFirst({ where: { identifier } });
  if (existing) {
    await prisma.verification.update({
      where: { id: existing.id },
      data: { value, expiresAt },
    });
  } else {
    await prisma.verification.create({
      data: { identifier, value, expiresAt },
    });
  }
}

/**
 * Retrieve the authoritative list of athleteIds that a parent userId is
 * allowed to access within an organization.
 *
 * Returns [] if no relationship record found (i.e., parent not yet linked).
 */
export async function getAuthorizedAthleteIds(
  parentUserId: string,
  organizationId: string
): Promise<string[]> {
  const identifier = parentChildrenKey(parentUserId, organizationId);
  // Use findFirst — identifier is not @unique in this schema
  const record = await prisma.verification.findFirst({ where: { identifier } });

  if (!record || new Date() > new Date(record.expiresAt)) {
    return [];
  }

  try {
    const ids = JSON.parse(record.value);
    if (!Array.isArray(ids)) return [];
    return ids.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

/**
 * Retrieve linked children for a specified parent userId in the caller's organization.
 * Accessible by Admin, Head Coach, or the Parent themselves.
 */
export async function getParentLinkedChildren(parentUserId: string): Promise<ParentChildItem[]> {
  const ctx = await requireOrgContext();

  // If not admin/head_coach, caller can only inspect their own parentUserId
  if (ctx.role !== "admin" && ctx.role !== "head_coach" && ctx.userId !== parentUserId) {
    return [];
  }

  // Ensure parentUserId is a member of the organization
  const parentMember = await prisma.member.findFirst({
    where: {
      userId: parentUserId,
      organizationId: ctx.organizationId,
    },
  });

  if (!parentMember) {
    return [];
  }

  const authorizedIds = await getAuthorizedAthleteIds(parentUserId, ctx.organizationId);
  if (authorizedIds.length === 0) {
    return [];
  }

  return prisma.athlete.findMany({
    where: {
      id: { in: authorizedIds },
      organizationId: ctx.organizationId,
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      sportCategory: true,
      jerseyNumber: true,
      dateOfBirth: true,
      photoUrl: true,
    },
    orderBy: { fullName: "asc" },
  });
}

/**
 * Admin: Add an athlete to a parent's authorized children list.
 * Identity-based storage via Verification table.
 */
export async function addChildToParent(
  parentUserId: string,
  athleteId: string
): Promise<{ success: boolean; error?: string; athleteIds?: string[] }> {
  try {
    const ctx = await requireOrgContext();

    if (ctx.role !== "admin") {
      return {
        success: false,
        error: "Hanya Admin yang dapat mengelola hubungan orang tua dan atlet.",
      };
    }

    // 1. Verify parent member exists in this organization
    const parentMember = await prisma.member.findFirst({
      where: {
        userId: parentUserId,
        organizationId: ctx.organizationId,
      },
      include: { user: true },
    });

    if (!parentMember || parentMember.role !== "parent") {
      return {
        success: false,
        error: "Akun orang tua tidak ditemukan dalam organisasi ini.",
      };
    }

    // 2. Verify athlete exists in this organization
    const athlete = await prisma.athlete.findFirst({
      where: {
        id: athleteId,
        organizationId: ctx.organizationId,
        isActive: true,
      },
    });

    if (!athlete) {
      return {
        success: false,
        error: "Atlet tidak ditemukan atau tidak aktif dalam organisasi ini.",
      };
    }

    // 3. Get current authorized IDs and add new one
    const currentIds = await getAuthorizedAthleteIds(parentUserId, ctx.organizationId);
    if (!currentIds.includes(athleteId)) {
      currentIds.push(athleteId);
    }

    // 4. Save updated relationship record
    await setParentAthleteRelationships(parentUserId, ctx.organizationId, currentIds);

    // 5. Update athlete display parentName if appropriate
    if (!athlete.parentName) {
      await prisma.athlete.update({
        where: { id: athleteId },
        data: { parentName: parentMember.user.name },
      });
    }

    return { success: true, athleteIds: currentIds };
  } catch (err) {
    console.error("[addChildToParent] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal menambahkan atlet ke orang tua.",
    };
  }
}

/**
 * Admin: Remove an athlete from a parent's authorized children list.
 * Note: Does not delete the athlete or parent account or historical records.
 */
export async function removeChildFromParent(
  parentUserId: string,
  athleteId: string
): Promise<{ success: boolean; error?: string; athleteIds?: string[] }> {
  try {
    const ctx = await requireOrgContext();

    if (ctx.role !== "admin") {
      return {
        success: false,
        error: "Hanya Admin yang dapat mengelola hubungan orang tua dan atlet.",
      };
    }

    // 1. Verify parent member exists in this organization
    const parentMember = await prisma.member.findFirst({
      where: {
        userId: parentUserId,
        organizationId: ctx.organizationId,
      },
    });

    if (!parentMember || parentMember.role !== "parent") {
      return {
        success: false,
        error: "Akun orang tua tidak ditemukan dalam organisasi ini.",
      };
    }

    // 2. Get current IDs and remove the specified one
    const currentIds = await getAuthorizedAthleteIds(parentUserId, ctx.organizationId);
    const updatedIds = currentIds.filter((id) => id !== athleteId);

    // 3. Save updated relationship record
    await setParentAthleteRelationships(parentUserId, ctx.organizationId, updatedIds);

    return { success: true, athleteIds: updatedIds };
  } catch (err) {
    console.error("[removeChildFromParent] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal menghapus atlet dari orang tua.",
    };
  }
}

// ─── Public query functions ───────────────────────────────────────────────────

export async function getParentAuthorizedChildren(): Promise<ParentChildItem[]> {
  const ctx = await requireOrgContext();

  // Authorization: identity-based, not name-based
  const authorizedIds = await getAuthorizedAthleteIds(ctx.userId, ctx.organizationId);

  if (authorizedIds.length === 0) {
    return [];
  }

  const athletes = await prisma.athlete.findMany({
    where: {
      id: { in: authorizedIds },
      organizationId: ctx.organizationId, // Cross-tenant guard
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      sportCategory: true,
      jerseyNumber: true,
      dateOfBirth: true,
      photoUrl: true,
    },
    orderBy: { fullName: "asc" },
  });

  return athletes;
}

export async function getParentChildPortalData(athleteId: string): Promise<{
  success: boolean;
  error?: string;
  payload?: {
    context: PortalAccessContext;
    profile: PortalAthleteProfile;
    snapshot: PortalAssessmentSnapshot | null;
    progress: {
      overallScore: number | null;
      overallGrade: string | null;
      trends: PortalComponentTrend[];
      totalAssessments: number;
    };
    trainingPlan: PortalTrainingPlan | null;
    schedule: PortalScheduleSession[];
    sessionLogs: PortalSessionLog[];
    reports: PortalReportItem[];
    achievements: PortalAchievementData;
    guidances: any[];
    feedbackSessions: any[];
    personalBests: PortalPersonalBestItem[];
    portalGoals: PortalAthleteGoalItem[];
    attendance: PortalAttendanceSummary | null;
    siblings: PortalSiblingItem[];
  };
}> {
  const ctx = await requireOrgContext();

  // ── Step 1: Org-scope check — athlete must be in the same organization ──
  const athlete = await prisma.athlete.findFirst({
    where: {
      id: athleteId,
      organizationId: ctx.organizationId,
      isActive: true,
    },
    include: {
      organization: { select: { name: true } },
    },
  });

  if (!athlete) {
    return {
      success: false,
      error: "UNAUTHORIZED_OR_NOT_FOUND: Atlet tidak ditemukan atau bukan bagian dari organisasi Anda.",
    };
  }

  // ── Step 2: Identity-based relationship check for parents ──────────────
  if (ctx.role === "parent") {
    const authorizedIds = await getAuthorizedAthleteIds(ctx.userId, ctx.organizationId);
    const isAuthorized = authorizedIds.includes(athleteId);

    if (!isAuthorized) {
      return {
        success: false,
        error: "FORBIDDEN: Anda tidak memiliki izin untuk mengakses data atlet ini.",
      };
    }
  }

  // ── Step 3: Construct the authorized context and fetch data ────────────
  const portalContext: PortalAccessContext = {
    portalAccessId: `auth-parent-${ctx.userId}-${athlete.id}`,
    organizationId: ctx.organizationId,
    organizationName: athlete.organization.name,
    athleteId: athlete.id,
    athleteName: athlete.fullName,
    accessType: "PARENT",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };

  const [
    profileData,
    progressData,
    planData,
    scheduleData,
    logsData,
    reportsData,
    guidanceData,
    performanceData,
    portalGoals,
    attendanceData,
    siblings,
  ] = await Promise.all([
    getPortalAthleteProfile(portalContext),
    getPortalAthleteProgress(portalContext),
    getPortalAthleteTrainingPlan(portalContext),
    getPortalAthleteSchedule(portalContext),
    getPortalAthleteSessionLogs(portalContext),
    getPortalAthleteReports(portalContext),
    getPortalAthleteGuidances(portalContext),
    getPortalAthletePerformanceOverview(portalContext),
    getPortalAthleteGoals(portalContext),
    getPortalAthleteAttendance(portalContext),
    getPortalAthleteSiblings(portalContext),
  ]);

  if (!profileData || !progressData) {
    return {
      success: false,
      error: "PROFILE_DATA_ERROR: Gagal memuat profil atau progres atlet.",
    };
  }

  const [achievementsData, feedbackData] = await Promise.all([
    getPortalAthleteAchievements(
      portalContext,
      progressData.trends,
      reportsData?.reports
    ),
    getEligibleParentFeedbackSessions(portalContext.portalAccessId),
  ]);

  return {
    success: true,
    payload: {
      context: portalContext,
      profile: profileData.profile,
      snapshot: profileData.latestSnapshot,
      progress: {
        overallScore: progressData.overallScore,
        overallGrade: progressData.overallGrade,
        trends: progressData.trends,
        totalAssessments: progressData.totalAssessments,
      },
      trainingPlan: planData?.plan ?? null,
      schedule: scheduleData?.sessions ?? [],
      sessionLogs: logsData?.logs ?? [],
      reports: reportsData?.reports ?? [],
      guidances: guidanceData?.guidances ?? [],
      feedbackSessions: feedbackData.sessions ?? [],
      achievements: achievementsData?.achievements ?? {
        starRating: 0,
        starLabel: "Belum Ada Evaluasi",
        totalAssessments: 0,
        completedSessions: 0,
        badges: [],
      },
      personalBests: performanceData.personalBests,
      portalGoals,
      attendance: attendanceData?.attendance ?? null,
      siblings,
    },
  };
}

/**
 * Token-safe multi-child portal data retrieval.
 * Allows a parent viewing a portal via rawToken to switch context to an authorized sibling child.
 */
export async function getPortalChildDataByToken(
  rawToken: string,
  targetAthleteId: string
): Promise<{
  success: boolean;
  error?: string;
  payload?: any;
}> {
  const auth = await getPortalContextByToken(rawToken);
  if (!auth.success) {
    return { success: false, error: "Link portal tidak valid atau telah kedaluwarsa." };
  }

  if (auth.context.accessType !== "PARENT") {
    return { success: false, error: "Akses pergantian anak hanya diizinkan untuk akun Orang Tua." };
  }

  // Verify targetAthleteId belongs to the same parent in the same organization
  const siblings = await getPortalAthleteSiblings(auth.context);
  const isAuthorizedSibling = siblings.some((s) => s.id === targetAthleteId);

  if (!isAuthorizedSibling) {
    return {
      success: false,
      error: "UNAUTHORIZED_CHILD: Atlet yang dipilih tidak terhubung dengan akun Orang Tua Anda.",
    };
  }

  const targetAthlete = await prisma.athlete.findFirst({
    where: {
      id: targetAthleteId,
      organizationId: auth.context.organizationId,
      isActive: true,
    },
  });

  if (!targetAthlete) {
    return { success: false, error: "Data atlet tidak ditemukan atau tidak aktif." };
  }

  const portalContext: PortalAccessContext = {
    portalAccessId: auth.context.portalAccessId,
    organizationId: auth.context.organizationId,
    organizationName: auth.context.organizationName,
    athleteId: targetAthlete.id,
    athleteName: targetAthlete.fullName,
    accessType: "PARENT",
    expiresAt: auth.context.expiresAt,
  };

  const [
    profileData,
    progressData,
    planData,
    scheduleData,
    logsData,
    reportsData,
    guidanceData,
    performanceData,
    portalGoals,
    attendanceData,
  ] = await Promise.all([
    getPortalAthleteProfile(portalContext),
    getPortalAthleteProgress(portalContext),
    getPortalAthleteTrainingPlan(portalContext),
    getPortalAthleteSchedule(portalContext),
    getPortalAthleteSessionLogs(portalContext),
    getPortalAthleteReports(portalContext),
    getPortalAthleteGuidances(portalContext),
    getPortalAthletePerformanceOverview(portalContext),
    getPortalAthleteGoals(portalContext),
    getPortalAthleteAttendance(portalContext),
  ]);

  if (!profileData || !progressData) {
    return { success: false, error: "Gagal memuat profil atlet terpilih." };
  }

  const [achievementsData, feedbackData] = await Promise.all([
    getPortalAthleteAchievements(
      portalContext,
      progressData.trends,
      reportsData?.reports
    ),
    getEligibleParentFeedbackSessions(rawToken),
  ]);

  return {
    success: true,
    payload: {
      context: portalContext,
      profile: profileData.profile,
      snapshot: profileData.latestSnapshot,
      progress: {
        overallScore: progressData.overallScore,
        overallGrade: progressData.overallGrade,
        trends: progressData.trends,
        totalAssessments: progressData.totalAssessments,
      },
      trainingPlan: planData?.plan ?? null,
      schedule: scheduleData?.sessions ?? [],
      sessionLogs: logsData?.logs ?? [],
      reports: reportsData?.reports ?? [],
      guidances: guidanceData?.guidances ?? [],
      feedbackSessions: feedbackData.sessions ?? [],
      achievements: achievementsData?.achievements ?? {
        starRating: 0,
        starLabel: "Belum Ada Evaluasi",
        totalAssessments: 0,
        completedSessions: 0,
        badges: [],
      },
      personalBests: performanceData.personalBests,
      portalGoals,
      attendance: attendanceData?.attendance ?? null,
      siblings,
    },
  };
}

