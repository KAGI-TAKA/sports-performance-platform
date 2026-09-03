"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import type { CommandPaletteSearchResult } from "./types";

const SearchInputSchema = z.object({
  query: z.string().trim().min(2, "Minimal 2 karakter").max(100, "Maksimal 100 karakter"),
});

/**
 * Searches multi-entity resources for the Global Command Palette.
 * Strictly scoped by authenticated user's organizationId and RBAC.
 */
export async function searchCommandPaletteAction(
  rawQuery: string
): Promise<{ success: boolean; data?: CommandPaletteSearchResult; error?: string }> {
  try {
    const ctx = await requireOrgContext();

    const parsed = SearchInputSchema.safeParse({ query: rawQuery });
    if (!parsed.success) {
      return {
        success: true,
        data: { athletes: [], sessions: [], trainingPlans: [], assessments: [] },
      };
    }

    const { query } = parsed.data;
    const isAssistant = (ctx.role || "").toLowerCase() === "assistant_coach";

    // Parallel execution across independent database tables
    const [rawAthletes, rawSessions, rawPlans, rawAssessments] = await Promise.all([
      // 1. Search Athletes (Max 5)
      prisma.athlete.findMany({
        where: {
          organizationId: ctx.organizationId,
          isActive: true,
          fullName: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          fullName: true,
          sportCategory: true,
          trainingLevel: true,
          jerseyNumber: true,
          photoUrl: true,
        },
        orderBy: { fullName: "asc" },
        take: 5,
      }),

      // 2. Search Schedule Sessions (Max 4)
      prisma.scheduleSession.findMany({
        where: {
          organizationId: ctx.organizationId,
          title: { contains: query, mode: "insensitive" },
          // If assistant, prioritize or scope according to assignment if desired, but allow viewing club timetable
          ...(isAssistant ? { coachId: ctx.memberId } : {}),
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          location: true,
          status: true,
          coach: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { startTime: "desc" },
        take: 4,
      }),

      // 3. Search Training Plans (Max 3) — Forbidden for Assistant Coach
      isAssistant
        ? Promise.resolve([])
        : prisma.trainingPlan.findMany({
            where: {
              organizationId: ctx.organizationId,
              title: { contains: query, mode: "insensitive" },
            },
            select: {
              id: true,
              title: true,
              status: true,
              _count: {
                select: { exercises: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
          }),

      // 4. Search Completed Assessments — Forbidden for Assistant Coach
      isAssistant
        ? Promise.resolve([])
        : prisma.assessment.findMany({
            where: {
              organizationId: ctx.organizationId,
              status: "COMPLETED",
              athlete: {
                fullName: { contains: query, mode: "insensitive" },
              },
            },
            select: {
              id: true,
              assessmentDate: true,
              overallScore: true,
              overallGrade: true,
              athlete: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
            orderBy: { assessmentDate: "desc" },
            take: 3,
          }),
    ]);

    const result: CommandPaletteSearchResult = {
      athletes: rawAthletes.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        sportCategory: a.sportCategory,
        trainingLevel: a.trainingLevel,
        jerseyNumber: a.jerseyNumber,
        photoUrl: a.photoUrl,
      })),
      sessions: rawSessions.map((s) => ({
        id: s.id,
        title: s.title,
        startTime: s.startTime,
        location: s.location,
        status: s.status,
        coachName: s.coach?.user?.name || "Coach",
      })),
      trainingPlans: rawPlans.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        exerciseCount: p._count.exercises,
      })),
      assessments: rawAssessments.map((ass) => ({
        id: ass.id,
        athleteId: ass.athlete.id,
        athleteName: ass.athlete.fullName,
        assessmentDate: ass.assessmentDate,
        overallScore: ass.overallScore ? Number(ass.overallScore) : null,
        overallGrade: ass.overallGrade,
      })),
    };

    return { success: true, data: result };
  } catch (error) {
    console.error("Command Palette search failed:", error);
    return {
      success: false,
      error: "Pencarian sementara tidak tersedia. Silakan coba kembali.",
    };
  }
}
