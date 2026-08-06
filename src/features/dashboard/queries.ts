import "server-only";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats(organizationId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalAthletes, assessmentsThisMonth] = await Promise.all([
    prisma.athlete.count({ where: { organizationId, isActive: true } }),
    prisma.assessment.count({
      where: { organizationId, assessmentDate: { gte: startOfMonth } },
    }),
  ]);

  // Squad average score (real DB, null jika belum ada data)
  const completedAssessments = await prisma.assessment.findMany({
    where: { organizationId, status: "COMPLETED", overallScore: { not: null } },
    select: { overallScore: true },
  });

  const avgScore =
    completedAssessments.length > 0
      ? Math.round(
          completedAssessments.reduce(
            (acc, cur) => acc + Number(cur.overallScore ?? 0),
            0
          ) / completedAssessments.length
        )
      : null;

  // Atlet teraktif bulan ini (atlet dengan assessment terbanyak di bulan ini)
  const assessmentsThisMonthWithAthlete = await prisma.assessment.groupBy({
    by: ["athleteId"],
    where: { organizationId, assessmentDate: { gte: startOfMonth } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  let topActiveAthlete: { fullName: string; count: number } | null = null;
  if (assessmentsThisMonthWithAthlete.length > 0) {
    const topEntry = assessmentsThisMonthWithAthlete[0];
    const athlete = await prisma.athlete.findFirst({
      where: { id: topEntry.athleteId, organizationId },
      select: { fullName: true },
    });
    if (athlete) {
      topActiveAthlete = {
        fullName: athlete.fullName,
        count: topEntry._count.id,
      };
    }
  }

  // Component averages across all completed assessments
  const completedAnalyses = await prisma.assessmentAnalysis.findMany({
    where: { assessment: { organizationId, status: "COMPLETED" } },
    select: { componentScores: true },
  });

  let squadComponentScores: Record<string, number> | null = null;

  if (completedAnalyses.length > 0) {
    const compSums: Record<string, { total: number; count: number }> = {};
    completedAnalyses.forEach((a) => {
      let scores: Record<string, number> = {};
      try {
        scores =
          typeof a.componentScores === "string"
            ? JSON.parse(a.componentScores)
            : (a.componentScores as Record<string, number>);
      } catch {}

      Object.entries(scores).forEach(([comp, score]) => {
        if (!compSums[comp]) compSums[comp] = { total: 0, count: 0 };
        compSums[comp].total += Number(score);
        compSums[comp].count += 1;
      });
    });

    squadComponentScores = {};
    Object.entries(compSums).forEach(([comp, data]) => {
      squadComponentScores![comp] = Math.round(data.total / data.count);
    });
  }

  const latestAssessments = await prisma.assessment.findMany({
    where: { organizationId },
    include: {
      athlete: { select: { id: true, fullName: true, position: true } },
    },
    orderBy: { assessmentDate: "desc" },
    take: 6,
  });

  return {
    totalAthletes,
    assessmentsThisMonth,
    avgScore,
    topActiveAthlete,
    squadComponentScores,
    latestAssessments,
  };
}
