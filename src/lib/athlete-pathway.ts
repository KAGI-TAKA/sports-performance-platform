export type AthletePathway = "YAP" | "MFD";

export interface AthletePathwayInput {
  competitionLevel?: string | null;
  sportCategory?: string | null;
  age?: number | null;
}

/**
 * Menentukan jalur pembinaan atlet (YAP vs MFD).
 *
 * ATURAN BISNIS:
 * 1. Jalur BUKAN ditentukan oleh batas usia kaku (seperti <= 12 vs > 12).
 * 2. Jika pelatih secara eksplisit menentukan jalur di competitionLevel ("YAP" atau "MFD"),
 *    maka keputusan pelatih menjadi prioritas utama.
 * 3. Jika atlet memiliki cabang olahraga spesifik (Sepak Bola, Bola Basket, Bulutangkis,
 *    Renang, Lari/Sprint, Beladiri, Tenis, dll.), maka otomatis masuk ke YAP berapapun usianya.
 * 4. Jika atlet berada di kelas gerak dasar / Multi-Sport / Multilateral / belum memilih cabor spesifik,
 *    maka masuk ke MFD (Multilateral Athletic Development).
 */
export function resolveAthletePathway(athlete?: AthletePathwayInput | null): AthletePathway {
  if (!athlete) return "YAP";

  const comp = (athlete.competitionLevel || "").trim().toUpperCase();
  const sport = (athlete.sportCategory || "").trim().toLowerCase();

  // 1. Tag eksplisit MFD dari pelatih
  if (comp.startsWith("MFD") || comp.includes("MULTILATERAL") || comp.includes("FONDASI")) {
    return "MFD";
  }

  // 2. Tag eksplisit YAP dari pelatih
  if (comp.startsWith("YAP") || comp.includes("PERFORMANCE")) {
    return "YAP";
  }

  // 3. Kategori olahraga multilateral / fondasi umum / multi-sport
  const isMultilateralSport =
    sport === "" ||
    sport.includes("mfd") ||
    sport.includes("multilateral") ||
    sport.includes("fondasi") ||
    sport.includes("multi-sport") ||
    sport === "umum";

  if (isMultilateralSport) {
    return "MFD";
  }

  // 4. Jika memiliki cabor spesifik, berapapun usianya selalu masuk ke YAP
  return "YAP";
}

export function isMfdAthlete(athlete?: AthletePathwayInput | null): boolean {
  return resolveAthletePathway(athlete) === "MFD";
}

export function isYapAthlete(athlete?: AthletePathwayInput | null): boolean {
  return resolveAthletePathway(athlete) === "YAP";
}

export const PATHWAY_CONFIG = {
  YAP: {
    id: "YAP" as const,
    code: "YAP",
    title: "Youth Athlete Performance",
    shortTitle: "YAP",
    badgeLabel: "Jalur: Youth Athlete Performance (YAP)",
    description: "Program pembinaan performa cabang olahraga spesifik dan kesiapan kompetisi atlet muda.",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    activePillClass: "bg-blue-500 text-white border-blue-600",
  },
  MFD: {
    id: "MFD" as const,
    code: "MFD",
    title: "Multilateral Athletic Development",
    shortTitle: "MFD",
    badgeLabel: "Jalur: Multilateral Development (MFD)",
    description: "Program literasi fisik fundamental, variasi multilateral, dan kebugaran gerak dasar.",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    activePillClass: "bg-emerald-500 text-white border-emerald-600",
  },
} as const;
