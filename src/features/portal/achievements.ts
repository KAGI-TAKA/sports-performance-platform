import type { PortalBadge, PortalAchievementData, PortalComponentTrend, PortalReportItem } from "./types";

export interface CalculateAchievementsInput {
  totalAssessments: number;
  completedSessions: number;
  overallScore: number | null;
  overallGrade: string | null;
  bestComponent: string | null;
  trends: PortalComponentTrend[];
  reports: PortalReportItem[];
}

/**
 * Calculates 0-5 Gold Star performance rating based on physical evaluation grade & score.
 */
export function calculateStarRating(
  overallScore: number | null,
  overallGrade: string | null
): { stars: number; label: string } {
  if (overallScore == null && !overallGrade) {
    return { stars: 0, label: "Belum Ada Evaluasi Fisik" };
  }

  const grade = overallGrade?.toUpperCase() ?? "";

  if (grade === "A+" || (overallScore != null && overallScore >= 90)) {
    return { stars: 5, label: "Performa Elit 5 Bintang" };
  }

  if (grade === "A" || grade === "B+" || (overallScore != null && overallScore >= 75)) {
    return { stars: 4, label: "Performa Tinggi 4 Bintang" };
  }

  if (grade === "B" || (overallScore != null && overallScore >= 60)) {
    return { stars: 3, label: "Performa Solid 3 Bintang" };
  }

  if (grade === "C+" || grade === "C" || (overallScore != null && overallScore >= 45)) {
    return { stars: 2, label: "Atlet Berkembang 2 Bintang" };
  }

  return { stars: 1, label: "Evaluasi Fisik Selesai (1 Bintang)" };
}

/**
 * Calculates athletic physical achievement badges from derived performance & attendance data.
 */
export function calculateAthleteBadges(input: CalculateAchievementsInput): PortalBadge[] {
  const { totalAssessments, completedSessions, overallScore, overallGrade, bestComponent, trends, reports } = input;

  const firstReportDate = reports.length > 0 ? reports[reports.length - 1].assessmentDate : null;
  const latestReportDate = reports.length > 0 ? reports[0].assessmentDate : null;

  const hasImprovingTrend = trends.some((t) => t.status === "IMPROVING" || (t.change != null && t.change > 0));
  const isHighPerformer = (overallGrade != null && overallGrade.toUpperCase().startsWith("A")) || (overallScore != null && overallScore >= 80);

  return [
    {
      id: "pioneer_athlete",
      name: "Atlet Evaluasi Pertama",
      description: "Menyelesaikan 1 tes evaluasi fisik lengkap dengan pelatih.",
      category: "MILESTONE",
      earned: totalAssessments >= 1,
      earnedDate: firstReportDate,
      iconKey: "ShieldCheck",
    },
    {
      id: "consistent_trainee",
      name: "Konsistensi Latihan",
      description: "Menyelesaikan minimal 3 sesi latihan fisik terjadwal.",
      category: "CONSISTENCY",
      earned: completedSessions >= 3,
      earnedDate: null,
      iconKey: "Dumbbell",
    },
    {
      id: "high_performer",
      name: "Performa Unggul",
      description: "Mencapai Grade A atau skor rata-rata fisik >= 80%.",
      category: "PERFORMANCE",
      earned: isHighPerformer,
      earnedDate: latestReportDate,
      iconKey: "Award",
    },
    {
      id: "rising_star",
      name: "Perkembangan Positif",
      description: "Menunjukkan peningkatan positif pada tren komponen fisik.",
      category: "PROGRESS",
      earned: hasImprovingTrend,
      earnedDate: latestReportDate,
      iconKey: "TrendingUp",
    },
    {
      id: "physical_master",
      name: "Spesialis Komponen",
      description: `Memiliki keunggulan komponen fisik utama (${bestComponent ? bestComponent.replace(/_/g, " ") : "Fisik"}).`,
      category: "MASTERY",
      earned: bestComponent != null,
      earnedDate: latestReportDate,
      iconKey: "Zap",
    },
  ];
}

/**
 * Main helper to compute complete achievement context for Athlete Portal.
 */
export function getAthleteAchievements(input: CalculateAchievementsInput): PortalAchievementData {
  const { stars, label } = calculateStarRating(input.overallScore, input.overallGrade);
  const badges = calculateAthleteBadges(input);

  return {
    starRating: stars,
    starLabel: label,
    totalAssessments: input.totalAssessments,
    completedSessions: input.completedSessions,
    badges,
  };
}
