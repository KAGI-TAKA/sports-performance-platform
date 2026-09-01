import { PHYSICAL_COMPONENTS } from "@/lib/constants";
import type {
  ComparedAthleteDTO,
  ComparedTestItemRow,
  AthleteComplementaryStrength,
  MultiAthleteComparisonResult,
} from "./types";
import { COMPARE_COLORS } from "./types";
import type { ScoreDirection } from "@prisma/client";

export interface RawAssessmentData {
  id: string;
  fullName: string;
  position: string;
  jerseyNumber: number | null;
  dateOfBirth: Date;
  gender: string;
  assessment: {
    id: string;
    assessmentDate: Date;
    overallScore: number | null;
    overallGrade: string | null;
    resultItems: Array<{
      id: string;
      rawValue: number | null;
      score: number | null;
      testItem: {
        id: string;
        name: string;
        unit: string;
        scoreDirection: ScoreDirection;
        physicalComponent: string | null;
      };
    }>;
    analysis: {
      componentScores: unknown;
      bestComponent: string | null;
      weakestComponents: string[];
    } | null;
  } | null;
}

export function parseComponentScoresJson(raw: unknown): Record<string, number> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof raw === "object" && raw !== null ? (raw as Record<string, number>) : {};
}

export function calculateAge(dateOfBirth: Date, targetDate: Date = new Date()): number {
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

function formatComponentName(comp: string | null): string {
  if (!comp) return "Umum";
  const map: Record<string, string> = {
    FLEXIBILITY: "Fleksibilitas",
    SPEED: "Kecepatan (Speed)",
    POWER: "Daya Ledak (Power)",
    AGILITY: "Kelincahan (Agility)",
    MUSCULAR_ENDURANCE: "Daya Tahan Otot",
    ANAEROBIC_ENDURANCE: "Daya Tahan Anaerobik",
    AEROBIC_ENDURANCE: "Daya Tahan Aerobik",
  };
  return map[comp] ?? comp.replace(/_/g, " ");
}

/**
 * Pure deterministic resolver for individual relative strengths without ranking or competition labels.
 */
export function resolveComplementaryStrengths(
  athletes: ComparedAthleteDTO[]
): AthleteComplementaryStrength[] {
  return athletes.map((ath) => {
    const compScores = ath.componentScores;
    const entries = Object.entries(compScores).map(([comp, score]) => ({
      comp,
      score: Number(score),
    }));

    if (entries.length === 0) {
      return {
        athleteId: ath.id,
        athleteName: ath.fullName,
        color: ath.color,
        strengthComponent: null,
        focusComponent: null,
        summaryText: "Belum memiliki data komponen fisik terperinci pada asesmen terakhir.",
      };
    }

    // Sort descending by score for strength, tie break deterministically by component name
    const sortedDesc = [...entries].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.comp.localeCompare(b.comp);
    });

    const highest = sortedDesc[0];
    const lowest = sortedDesc[sortedDesc.length - 1];

    const strengthName = formatComponentName(highest.comp);
    const focusName = lowest.score < highest.score ? formatComponentName(lowest.comp) : null;

    let summaryText = `Menunjukkan profil kekuatan relatif pada ${strengthName} (${highest.score.toFixed(0)}%).`;
    if (focusName && lowest.score < 70) {
      summaryText += ` Area fokus pengembangan latihan: ${focusName} (${lowest.score.toFixed(0)}%).`;
    }

    return {
      athleteId: ath.id,
      athleteName: ath.fullName,
      color: ath.color,
      strengthComponent: highest.comp,
      focusComponent: focusName ? lowest.comp : null,
      summaryText,
    };
  });
}

/**
 * Pure comparison engine for 2-4 athletes.
 * Constructs side-by-side normalized test items table with honest NOT_TESTED semantics.
 */
export function calculateMultiAthleteComparison(
  rawAthletes: RawAssessmentData[]
): MultiAthleteComparisonResult {
  // Enforce 2-4 athletes
  const capped = rawAthletes.slice(0, 4);

  const athletes: ComparedAthleteDTO[] = capped.map((ath, idx) => {
    const color = COMPARE_COLORS[idx % COMPARE_COLORS.length];
    const ass = ath.assessment;
    const compScores = parseComponentScoresJson(ass?.analysis?.componentScores);
    const age = calculateAge(ath.dateOfBirth, ass?.assessmentDate ?? new Date());

    return {
      id: ath.id,
      fullName: ath.fullName,
      position: ath.position,
      jerseyNumber: ath.jerseyNumber,
      age,
      gender: ath.gender,
      color,
      assessmentId: ass?.id ?? null,
      assessmentDate: ass?.assessmentDate ?? null,
      overallScore: ass?.overallScore != null ? Number(ass.overallScore) : null,
      overallGrade: ass?.overallGrade ?? null,
      componentScores: compScores,
      bestComponent: ass?.analysis?.bestComponent ?? null,
    };
  });

  // Collect unique test items across all compared athletes
  const testItemsMap = new Map<
    string,
    {
      id: string;
      name: string;
      unit: string;
      scoreDirection: ScoreDirection;
      physicalComponent: string | null;
    }
  >();

  capped.forEach((ath) => {
    ath.assessment?.resultItems.forEach((r) => {
      if (r.testItem && !testItemsMap.has(r.testItem.id)) {
        testItemsMap.set(r.testItem.id, {
          id: r.testItem.id,
          name: r.testItem.name,
          unit: r.testItem.unit,
          scoreDirection: r.testItem.scoreDirection,
          physicalComponent: r.testItem.physicalComponent,
        });
      }
    });
  });

  // Build comparison table rows with explicit NOT_TESTED semantics
  const comparisonTable: ComparedTestItemRow[] = Array.from(testItemsMap.values()).map(
    (item) => {
      const athleteValues: ComparedTestItemRow["athleteValues"] = {};

      capped.forEach((ath) => {
        const matchingResult = ath.assessment?.resultItems.find(
          (r) => r.testItem?.id === item.id && r.rawValue != null
        );

        if (matchingResult && matchingResult.rawValue != null) {
          athleteValues[ath.id] = {
            rawValue: Number(matchingResult.rawValue),
            score: matchingResult.score != null ? Number(matchingResult.score) : null,
            isNotTested: false,
          };
        } else {
          athleteValues[ath.id] = {
            rawValue: null,
            score: null,
            isNotTested: true,
          };
        }
      });

      return {
        testItemId: item.id,
        testItemName: item.name,
        unit: item.unit,
        scoreDirection: item.scoreDirection,
        physicalComponent: item.physicalComponent,
        athleteValues,
      };
    }
  );

  const complementaryStrengths = resolveComplementaryStrengths(athletes);

  return {
    athletes,
    comparisonTable,
    complementaryStrengths,
  };
}
