import "server-only";
import { prisma } from "@/lib/prisma";

// Mapping age group ke rentang tahun kelahiran
function ageGroupToBirthRange(ageGroup: string): { gte: Date; lte: Date } | null {
  const now = new Date();
  const currentYear = now.getFullYear();
  const cutoffs: Record<string, [number, number]> = {
    U12: [currentYear - 12, currentYear - 8],
    U14: [currentYear - 14, currentYear - 12],
    U16: [currentYear - 16, currentYear - 14],
    U18: [currentYear - 18, currentYear - 16],
    SENIOR: [currentYear - 50, currentYear - 18],
  };
  const range = cutoffs[ageGroup];
  if (!range) return null;
  return {
    gte: new Date(`${range[0]}-01-01`),
    lte: new Date(`${range[1]}-12-31`),
  };
}

export async function listAthletes(
  organizationId: string,
  opts?: { search?: string; position?: string; ageGroup?: string }
) {
  const birthRange =
    opts?.ageGroup && opts.ageGroup !== "ALL"
      ? ageGroupToBirthRange(opts.ageGroup)
      : null;

  return prisma.athlete.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(opts?.search
        ? { fullName: { contains: opts.search, mode: "insensitive" as const } }
        : {}),
      ...(opts?.position && opts.position !== "ALL"
        ? { position: opts.position as any }
        : {}),
      ...(birthRange
        ? { dateOfBirth: birthRange }
        : {}),
    },
    orderBy: { fullName: "asc" },
  });
}

export async function getAthleteById(
  organizationId: string,
  athleteId: string
) {
  return prisma.athlete.findFirst({
    where: { id: athleteId, organizationId },
    include: {
      injuryHistories: { orderBy: { injuryDate: "desc" } },
      assessments: { orderBy: { assessmentDate: "desc" }, take: 10 },
    },
  });
}
