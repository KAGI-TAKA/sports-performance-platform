import { PhysicalComponent, ScoreDirection, Gender } from "@prisma/client";
import { scoreToGrade } from "@/lib/constants";

export interface TestItemValue {
  testItemId: string;
  physicalComponent: PhysicalComponent;
  rawValue: number;
  scoreDirection: ScoreDirection;
  thresholdA?: number; // Nilai acuan Grade A (mis. 90-100)
  thresholdB?: number; // Nilai acuan Grade B (mis. 75-89)
  thresholdC?: number; // Nilai acuan Grade C (mis. 60-74)
  thresholdD?: number; // Nilai acuan Grade D (mis. 40-59)
}

export interface EngineResult {
  overallScore: number;
  overallGrade: string;
  componentScores: Partial<Record<PhysicalComponent, number>>;
  bestComponent: PhysicalComponent | null;
  weakestComponents: PhysicalComponent[];
  insightText: string;
  recommendationText: string;
  itemScores: Record<string, number>;
}

// 7 komponen fisik standar
export const PHYSICAL_COMPONENTS = [
  "FLEXIBILITY",
  "SPEED",
  "POWER",
  "AGILITY",
  "MUSCULAR_ENDURANCE",
  "ANAEROBIC_ENDURANCE",
  "AEROBIC_ENDURANCE",
] as const;

/**
 * Kalkulasi usia atlet pada tanggal assessment berdasarkan tanggal lahir.
 * Menggunakan perbandingan kalender bulan/hari yang presisi.
 */
export function calculateAgeAtDate(dateOfBirth: Date, targetDate: Date = new Date()): number {
  const dob = new Date(dateOfBirth);
  const target = new Date(targetDate);
  if (isNaN(dob.getTime()) || isNaN(target.getTime())) return 0;

  let age = target.getFullYear() - dob.getFullYear();
  const monthDiff = target.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Pemilihan Benchmark Terbaik sesuai spesifikasi profil atlet.
 * Priority rules:
 *   1. Gender persis + rentang usia cocok
 *   2. Gender universal (null) + rentang usia cocok
 *   3. Gender persis
 *   4. Rentang usia cocok
 *   5. Fallback ke benchmark pertama
 */
export function pickBestBenchmark(
  benchmarks: {
    ageMin: number;
    ageMax: number;
    gender: Gender | string | null;
    thresholdA: unknown;
    thresholdB: unknown;
    thresholdC: unknown;
    thresholdD: unknown;
  }[],
  athleteGender: string,
  athleteAge: number
) {
  if (!benchmarks || benchmarks.length === 0) return undefined;

  const ageMatch = (b: (typeof benchmarks)[0]) => athleteAge >= b.ageMin && athleteAge <= b.ageMax;

  return (
    benchmarks.find((b) => b.gender === athleteGender && ageMatch(b)) ??
    benchmarks.find((b) => (b.gender === null || b.gender === undefined) && ageMatch(b)) ??
    benchmarks.find((b) => b.gender === athleteGender) ??
    benchmarks.find((b) => ageMatch(b)) ??
    benchmarks[0]
  );
}

/**
 * Kalkulasi skor 0-100 untuk item tes mentah.
 * Clamped antara 0 dan 100, aman dari NaN / Infinity / division-by-zero.
 */
export function calculateItemScore(item: TestItemValue): number {
  const { rawValue, scoreDirection, thresholdA = 80, thresholdB = 60, thresholdC = 40, thresholdD = 20 } = item;

  // Penanganan nilai mentah tidak valid / NaN / Infinity
  if (rawValue == null || isNaN(rawValue) || !isFinite(rawValue)) {
    return 0;
  }

  // HIGHER_IS_BETTER
  if (scoreDirection === "HIGHER_IS_BETTER") {
    if (rawValue >= thresholdA) {
      const extra = ((rawValue - thresholdA) / (thresholdA || 1)) * 10;
      return Math.min(100, Math.max(0, Math.round(90 + extra)));
    }
    if (rawValue >= thresholdB) {
      const denom = thresholdA - thresholdB || 1;
      return Math.min(100, Math.max(0, Math.round(75 + ((rawValue - thresholdB) / denom) * 14)));
    }
    if (rawValue >= thresholdC) {
      const denom = thresholdB - thresholdC || 1;
      return Math.min(100, Math.max(0, Math.round(60 + ((rawValue - thresholdC) / denom) * 14)));
    }
    if (rawValue >= thresholdD) {
      const denom = thresholdC - thresholdD || 1;
      return Math.min(100, Math.max(0, Math.round(40 + ((rawValue - thresholdD) / denom) * 19)));
    }
    const denom = thresholdD || 1;
    return Math.min(100, Math.max(0, Math.round((rawValue / denom) * 40)));
  }

  // LOWER_IS_BETTER (misal: sprint detik, shuttle run detik)
  if (rawValue <= thresholdA) {
    const extra = ((thresholdA - rawValue) / (thresholdA || 1)) * 10;
    return Math.min(100, Math.max(0, Math.round(90 + extra)));
  }
  if (rawValue <= thresholdB) {
    const denom = thresholdB - thresholdA || 1;
    return Math.min(100, Math.max(0, Math.round(75 + ((thresholdB - rawValue) / denom) * 14)));
  }
  if (rawValue <= thresholdC) {
    const denom = thresholdC - thresholdB || 1;
    return Math.min(100, Math.max(0, Math.round(60 + ((thresholdC - rawValue) / denom) * 14)));
  }
  if (rawValue <= thresholdD) {
    const denom = thresholdD - thresholdC || 1;
    return Math.min(100, Math.max(0, Math.round(40 + ((thresholdD - rawValue) / denom) * 19)));
  }
  return Math.min(100, Math.max(0, Math.round(40 - (rawValue - thresholdD))));
}

/**
 * Kalkulasi agregat assessment fisik.
 * Hanya komponen yang memiliki item tes yang dihitung dalam overallScore.
 */
export function calculateAssessmentEngine(items: TestItemValue[]): EngineResult {
  const itemScores: Record<string, number> = {};
  const compSums: Record<string, { total: number; count: number }> = {};

  items.forEach((item) => {
    const score = calculateItemScore(item);
    itemScores[item.testItemId] = score;

    if (!compSums[item.physicalComponent]) {
      compSums[item.physicalComponent] = { total: 0, count: 0 };
    }
    compSums[item.physicalComponent].total += score;
    compSums[item.physicalComponent].count += 1;
  });

  const componentScores: Partial<Record<PhysicalComponent, number>> = {};
  let sumAll = 0;
  let countComp = 0;

  Object.entries(compSums).forEach(([comp, data]) => {
    const avg = Math.round(data.total / data.count);
    componentScores[comp as PhysicalComponent] = avg;
    sumAll += avg;
    countComp += 1;
  });

  // overallScore hanya dihitung dari komponen yang benar-benar diisi
  const overallScore = countComp > 0 ? Math.min(100, Math.max(0, Math.round(sumAll / countComp))) : 0;
  const overallGrade = scoreToGrade(overallScore);

  // Best & weakest components
  const sortedComps = Object.entries(componentScores).sort((a, b) => b[1] - a[1]);
  const bestComponent = sortedComps.length > 0 ? (sortedComps[0][0] as PhysicalComponent) : null;
  const weakestComponents = sortedComps.slice(-2).map((c) => c[0] as PhysicalComponent);

  // Rekomendasi otomatis berbasis aturan domain
  const recs: string[] = [];
  weakestComponents.forEach((comp) => {
    if (comp === "POWER") recs.push("plyometric (box jump, depth jump)");
    else if (comp === "SPEED" || comp === "ANAEROBIC_ENDURANCE") recs.push("sprint interval (repeat sprint ability)");
    else if (comp === "AGILITY") recs.push("agility ladder & cone drills");
    else if (comp === "AEROBIC_ENDURANCE") recs.push("aerobic zone 2 running / Yo-Yo interval training");
    else if (comp === "MUSCULAR_ENDURANCE" || comp === "FLEXIBILITY") recs.push("strength training & mobility routine 6-8 minggu");
  });

  const bestScore = bestComponent ? (componentScores[bestComponent] ?? 0) : 0;
  const insightText = `Atlet menunjukkan keunggulan pada komponen ${
    bestComponent ? bestComponent.replace(/_/g, " ").toLowerCase() : "fisik utama"
  } (${bestScore}%), namun memerlukan peningkatan pada ${weakestComponents
    .map((w) => w.replace(/_/g, " ").toLowerCase())
    .join(" & ")}.`;

  const recommendationText = `Rekomendasi program latihan 6-8 minggu: ${
    recs.length > 0 ? recs.join(", ") : "fokus pada pengembangan daya tahan dan power eksplosif."
  }`;

  return {
    overallScore,
    overallGrade,
    componentScores,
    bestComponent,
    weakestComponents,
    insightText,
    recommendationText,
    itemScores,
  };
}
