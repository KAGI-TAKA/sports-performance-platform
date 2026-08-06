import { PhysicalComponent, ScoreDirection } from "@prisma/client";

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

export function calculateItemScore(item: TestItemValue): number {
  const { rawValue, scoreDirection, thresholdA = 80, thresholdB = 60, thresholdC = 40, thresholdD = 20 } = item;

  // Jika HIGHER_IS_BETTER
  if (scoreDirection === "HIGHER_IS_BETTER") {
    if (rawValue >= thresholdA) return Math.min(100, 90 + ((rawValue - thresholdA) / (thresholdA || 1)) * 10);
    if (rawValue >= thresholdB) return 75 + ((rawValue - thresholdB) / (thresholdA - thresholdB || 1)) * 14;
    if (rawValue >= thresholdC) return 60 + ((rawValue - thresholdC) / (thresholdB - thresholdC || 1)) * 14;
    if (rawValue >= thresholdD) return 40 + ((rawValue - thresholdD) / (thresholdC - thresholdD || 1)) * 19;
    return Math.max(10, (rawValue / (thresholdD || 1)) * 40);
  }

  // Jika LOWER_IS_BETTER (mis. sprint detik, shuttle run detik)
  if (rawValue <= thresholdA) return Math.min(100, 90 + ((thresholdA - rawValue) / (thresholdA || 1)) * 10);
  if (rawValue <= thresholdB) return 75 + ((thresholdB - rawValue) / (thresholdB - thresholdA || 1)) * 14;
  if (rawValue <= thresholdC) return 60 + ((thresholdC - rawValue) / (thresholdC - thresholdB || 1)) * 14;
  if (rawValue <= thresholdD) return 40 + ((thresholdD - rawValue) / (thresholdD - thresholdC || 1)) * 19;
  return Math.max(10, 40 - (rawValue - thresholdD));
}

export function calculateAssessmentEngine(items: TestItemValue[]): EngineResult {
  const itemScores: Record<string, number> = {};
  const compSums: Record<string, { total: number; count: number }> = {};

  items.forEach((item) => {
    const score = Math.round(calculateItemScore(item));
    itemScores[item.testItemId] = score;

    if (!compSums[item.physicalComponent]) {
      compSums[item.physicalComponent] = { total: 0, count: 0 };
    }
    compSums[item.physicalComponent].total += score;
    compSums[item.physicalComponent].count += 1;
  });

  // Hanya komponen yang benar-benar diisi item tesnya yang masuk componentScores
  // Komponen tanpa item tes TIDAK diberi default 70 — hanya yang diisi yang dihitung
  const componentScores: Partial<Record<PhysicalComponent, number>> = {};

  let sumAll = 0;
  let countComp = 0;

  Object.entries(compSums).forEach(([comp, data]) => {
    const avg = Math.round(data.total / data.count);
    componentScores[comp as PhysicalComponent] = avg;
    sumAll += avg;
    countComp += 1;
  });

  // overallScore hanya dari komponen yang benar-benar diisi
  const overallScore = countComp > 0 ? Math.round(sumAll / countComp) : 0;

  // Tentukan overallGrade
  let overallGrade = "C";
  if (overallScore >= 88) overallGrade = "A";
  else if (overallScore >= 80) overallGrade = "B+";
  else if (overallScore >= 72) overallGrade = "B";
  else if (overallScore >= 65) overallGrade = "C+";
  else if (overallScore >= 55) overallGrade = "C";
  else overallGrade = "D";

  // Cari best & weakest components
  const sortedComps = Object.entries(componentScores).sort((a, b) => b[1] - a[1]);
  const bestComponent = sortedComps.length > 0 ? (sortedComps[0][0] as PhysicalComponent) : null;
  const weakestComponents = sortedComps.slice(-2).map((c) => c[0] as PhysicalComponent);

  // Generate rule-based recommendations
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
