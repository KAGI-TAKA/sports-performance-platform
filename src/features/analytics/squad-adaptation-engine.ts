import { PHYSICAL_COMPONENTS, type PhysicalComponentType } from "./types";
import { parseComponentScores } from "./engine";

export interface SquadComponentAdaptation {
  component: PhysicalComponentType;
  componentNameID: string;
  currentAverageScore: number | null;
  previousAverageScore: number | null;
  delta: number | null;
  trend: "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA";
  assessedCount: number;
}

export type DataQualityStatus = "ROBUST_DATA" | "LOW_COVERAGE" | "INSUFFICIENT_SAMPLE";

export interface SquadAdaptationSummaryDTO {
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalAthletesCount: number;
  assessedAthletesCount: number;
  coveragePercentage: number;
  dataQualityStatus: DataQualityStatus;
  components: SquadComponentAdaptation[];
  strongestAdaptiveComponent: string | null;
  focusDevelopmentComponent: string | null;
  squadDistribution: {
    improvingCount: number;
    stableCount: number;
    decliningCount: number;
  };
  actionableInsights: {
    what: string;
    why: string;
    action: string;
  };
}

export interface RawAthleteAssessmentForSquad {
  id: string;
  fullName: string;
  assessments: Array<{
    id: string;
    assessmentDate: Date;
    overallScore: number | null;
    analysis?: {
      componentScores: unknown;
    } | null;
  }>;
}

const COMPONENT_NAMES_ID: Record<PhysicalComponentType, string> = {
  FLEXIBILITY: "Fleksibilitas",
  SPEED: "Kecepatan (Speed)",
  POWER: "Daya Ledak (Power)",
  AGILITY: "Kelincahan (Agility)",
  MUSCULAR_ENDURANCE: "Daya Tahan Otot",
  ANAEROBIC_ENDURANCE: "Daya Tahan Anaerobik",
  AEROBIC_ENDURANCE: "Daya Tahan Aerobik",
};

/**
 * Pure deterministic resolver for squad adaptational insights based on the WHAT-WHY-ACTION framework.
 */
export function resolveSquadAdaptationalInsights(
  components: SquadComponentAdaptation[],
  dataQualityStatus: DataQualityStatus,
  assessedCount: number,
  totalAthletes: number,
  coveragePct: number
): {
  strongestAdaptiveComponent: string | null;
  focusDevelopmentComponent: string | null;
  actionableInsights: { what: string; why: string; action: string };
} {
  // Sort components by delta descending for highest improvement
  const componentsWithDelta = components.filter((c) => c.delta !== null);

  let strongestAdaptiveComponent: string | null = null;
  let focusDevelopmentComponent: string | null = null;

  if (componentsWithDelta.length > 0) {
    const sortedDesc = [...componentsWithDelta].sort((a, b) => {
      if (b.delta! !== a.delta!) return b.delta! - a.delta!;
      return a.component.localeCompare(b.component);
    });

    const highest = sortedDesc[0];
    const lowest = sortedDesc[sortedDesc.length - 1];

    if (highest.delta! > 0) {
      strongestAdaptiveComponent = highest.componentNameID;
    }
    if (lowest.delta! < highest.delta!) {
      focusDevelopmentComponent = lowest.componentNameID;
    }
  }

  // Statistical safety guards
  if (dataQualityStatus === "INSUFFICIENT_SAMPLE") {
    return {
      strongestAdaptiveComponent,
      focusDevelopmentComponent,
      actionableInsights: {
        what: "Data asesmen fisik squad masih dalam tahap awal pengumpulan.",
        why: `Hanya ${assessedCount} dari ${totalAthletes} atlet (${coveragePct}%) yang memiliki asesmen selesai pada periode 30 hari ini.`,
        action:
          "Jadwalkan sesi asesmen fisik berkala untuk seluruh kelompok atlet agar tren adaptasi tim dapat dianalisis secara akurat.",
      },
    };
  }

  if (dataQualityStatus === "LOW_COVERAGE") {
    const componentHighlight = strongestAdaptiveComponent
      ? `${strongestAdaptiveComponent} menunjukkan sinyal adaptasi awal positif`
      : "Tren adaptasi fisik mulai terbentuk";

    return {
      strongestAdaptiveComponent,
      focusDevelopmentComponent,
      actionableInsights: {
        what: `${componentHighlight}, namun cakupan pengujian tim masih di bawah 50%.`,
        why: `${assessedCount} dari ${totalAthletes} atlet (${coveragePct}%) telah mengikuti asesmen dalam periode aktif.`,
        action:
          "Lengkapi asesmen untuk sisa atlet skuad sebelum merombak periodisasi latihan secara menyeluruh.",
      },
    };
  }

  // Robust Data Insights
  const topComp = strongestAdaptiveComponent ?? "Kebugaran Fisik";
  const focusComp = focusDevelopmentComponent ?? "Komponen Pendukung";

  const improvingComps = components.filter((c) => c.trend === "IMPROVING");
  const improvingCount = improvingComps.length;

  return {
    strongestAdaptiveComponent,
    focusDevelopmentComponent,
    actionableInsights: {
      what: `${topComp} menunjukkan respons adaptasi paling positif dalam siklus 30 hari terakhir.`,
      why: `${assessedCount} atlet (${coveragePct}% skuad) memiliki data valid dengan ${improvingCount} dari 7 komponen fisik menunjukkan tren meningkat.`,
      action: `Pertahankan stimulus latihan saat ini untuk ${topComp}, dan alokasikan porsi latihan terarah pada ${focusComp} pada blok latihan berikutnya.`,
    },
  };
}

/**
 * Pure Anti-Domination Squad Aggregation Engine.
 * Ensures each athlete contributes exactly 1 representative score per physical component per period.
 */
export function computeSquadAdaptationSummary(
  athletes: RawAthleteAssessmentForSquad[],
  currentStart: Date,
  previousStart: Date,
  currentEnd: Date = new Date()
): SquadAdaptationSummaryDTO {
  const totalAthletesCount = athletes.length;

  // 1. Anti-domination partitioning: Select LATEST completed assessment per athlete in each period window
  const currentAthleteScores: Record<string, Record<string, number>> = {};
  const previousAthleteScores: Record<string, Record<string, number>> = {};

  let improvingAthletes = 0;
  let stableAthletes = 0;
  let decliningAthletes = 0;

  athletes.forEach((ath) => {
    // Current period window: (currentStart <= date <= currentEnd)
    const currentAssessments = ath.assessments.filter((a) => {
      const d = new Date(a.assessmentDate).getTime();
      return d >= currentStart.getTime() && d <= currentEnd.getTime();
    });

    // Previous period window: (previousStart <= date < currentStart)
    const previousAssessments = ath.assessments.filter((a) => {
      const d = new Date(a.assessmentDate).getTime();
      return d >= previousStart.getTime() && d < currentStart.getTime();
    });

    // Sort descending by date to take the latest representative assessment
    const latestCurrent = currentAssessments.sort(
      (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    )[0];

    const latestPrevious = previousAssessments.sort(
      (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    )[0];

    if (latestCurrent) {
      currentAthleteScores[ath.id] = parseComponentScores(
        latestCurrent.analysis?.componentScores
      );

      // Track athlete-level overall trend between periods if both exist
      if (latestPrevious && latestCurrent.overallScore != null && latestPrevious.overallScore != null) {
        const diff = Number(latestCurrent.overallScore) - Number(latestPrevious.overallScore);
        if (diff >= 0.5) improvingAthletes++;
        else if (diff <= -0.5) decliningAthletes++;
        else stableAthletes++;
      } else {
        stableAthletes++;
      }
    }

    if (latestPrevious) {
      previousAthleteScores[ath.id] = parseComponentScores(
        latestPrevious.analysis?.componentScores
      );
    }
  });

  const assessedAthletesCount = Object.keys(currentAthleteScores).length;
  const coveragePercentage =
    totalAthletesCount > 0
      ? Math.round((assessedAthletesCount / totalAthletesCount) * 100)
      : 0;

  // 2. Data Quality Status resolution
  let dataQualityStatus: DataQualityStatus = "ROBUST_DATA";
  if (assessedAthletesCount < 3) {
    dataQualityStatus = "INSUFFICIENT_SAMPLE";
  } else if (coveragePercentage < 50) {
    dataQualityStatus = "LOW_COVERAGE";
  }

  // 3. Component aggregation with 1:1 athlete weighting
  const components: SquadComponentAdaptation[] = PHYSICAL_COMPONENTS.map((comp) => {
    const compNameID = COMPONENT_NAMES_ID[comp];

    // Current period average
    const currentValues: number[] = [];
    Object.values(currentAthleteScores).forEach((scores) => {
      if (scores[comp] != null && !isNaN(Number(scores[comp]))) {
        currentValues.push(Number(scores[comp]));
      }
    });

    // Previous period average
    const previousValues: number[] = [];
    Object.values(previousAthleteScores).forEach((scores) => {
      if (scores[comp] != null && !isNaN(Number(scores[comp]))) {
        previousValues.push(Number(scores[comp]));
      }
    });

    const currentAvg =
      currentValues.length > 0
        ? Number(
            (
              currentValues.reduce((sum, v) => sum + v, 0) / currentValues.length
            ).toFixed(1)
          )
        : null;

    const prevAvg =
      previousValues.length > 0
        ? Number(
            (
              previousValues.reduce((sum, v) => sum + v, 0) / previousValues.length
            ).toFixed(1)
          )
        : null;

    let delta: number | null = null;
    let trend: SquadComponentAdaptation["trend"] = "INSUFFICIENT_DATA";

    if (currentAvg !== null && prevAvg !== null) {
      delta = Number((currentAvg - prevAvg).toFixed(1));
      if (delta >= 1.0) trend = "IMPROVING";
      else if (delta <= -1.0) trend = "DECLINING";
      else trend = "STABLE";
    } else if (currentAvg !== null) {
      trend = "STABLE";
    }

    return {
      component: comp,
      componentNameID: compNameID,
      currentAverageScore: currentAvg,
      previousAverageScore: prevAvg,
      delta,
      trend,
      assessedCount: currentValues.length,
    };
  });

  // 4. Resolve Actionable Insights
  const insightResult = resolveSquadAdaptationalInsights(
    components,
    dataQualityStatus,
    assessedAthletesCount,
    totalAthletesCount,
    coveragePercentage
  );

  return {
    periodLabel: "30 Hari Terakhir vs 30 Hari Sebelumnya",
    startDate: currentStart.toISOString().slice(0, 10),
    endDate: currentEnd.toISOString().slice(0, 10),
    totalAthletesCount,
    assessedAthletesCount,
    coveragePercentage,
    dataQualityStatus,
    components,
    strongestAdaptiveComponent: insightResult.strongestAdaptiveComponent,
    focusDevelopmentComponent: insightResult.focusDevelopmentComponent,
    squadDistribution: {
      improvingCount: improvingAthletes,
      stableCount: stableAthletes,
      decliningCount: decliningAthletes,
    },
    actionableInsights: insightResult.actionableInsights,
  };
}
