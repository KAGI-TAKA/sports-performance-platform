import type { ScoreDirection } from "@prisma/client";
import type { GoalProgressResult } from "./types";

export interface HistoricalAssessmentResult {
  rawValue: number;
  assessmentDate: Date;
  assessmentId: string;
}

/**
 * Calculates the authoritative Personal Best (PB) from a list of valid completed assessment results.
 * - HIGHER_IS_BETTER: maximum rawValue.
 * - LOWER_IS_BETTER: minimum rawValue.
 * In case of ties, the latest assessment date is chosen deterministically.
 */
export function calculatePersonalBest(
  scoreDirection: ScoreDirection,
  results: HistoricalAssessmentResult[]
): {
  pbValue: number;
  achievedDate: Date;
  assessmentId: string;
} | null {
  if (!results || results.length === 0) {
    return null;
  }

  let best = results[0];

  for (let i = 1; i < results.length; i++) {
    const current = results[i];
    if (scoreDirection === "HIGHER_IS_BETTER") {
      if (
        current.rawValue > best.rawValue ||
        (current.rawValue === best.rawValue &&
          new Date(current.assessmentDate).getTime() >
            new Date(best.assessmentDate).getTime())
      ) {
        best = current;
      }
    } else {
      // LOWER_IS_BETTER
      if (
        current.rawValue < best.rawValue ||
        (current.rawValue === best.rawValue &&
          new Date(current.assessmentDate).getTime() >
            new Date(best.assessmentDate).getTime())
      ) {
        best = current;
      }
    }
  }

  return {
    pbValue: Number(best.rawValue),
    achievedDate: new Date(best.assessmentDate),
    assessmentId: best.assessmentId,
  };
}

/**
 * Resolves the latest Current Performance value from historical completed assessment results.
 */
export function resolveCurrentValue(
  results: HistoricalAssessmentResult[]
): {
  currentValue: number;
  assessmentDate: Date;
  assessmentId: string;
} | null {
  if (!results || results.length === 0) {
    return null;
  }

  // Sort descending by date, tie-break by assessmentId descending
  const sorted = [...results].sort((a, b) => {
    const timeDiff =
      new Date(b.assessmentDate).getTime() -
      new Date(a.assessmentDate).getTime();
    if (timeDiff !== 0) return timeDiff;
    return b.assessmentId.localeCompare(a.assessmentId);
  });

  const latest = sorted[0];
  return {
    currentValue: Number(latest.rawValue),
    assessmentDate: new Date(latest.assessmentDate),
    assessmentId: latest.assessmentId,
  };
}

/**
 * Validates that a proposed goal target is strictly better than the baseline value.
 */
export function validateGoalTarget(
  baselineValue: number,
  targetValue: number,
  scoreDirection: ScoreDirection
): { valid: boolean; reason?: string } {
  if (baselineValue === targetValue) {
    return {
      valid: false,
      reason: "Nilai target tidak boleh sama dengan nilai baseline (harus ada peningkatan).",
    };
  }

  if (scoreDirection === "HIGHER_IS_BETTER") {
    if (targetValue <= baselineValue) {
      return {
        valid: false,
        reason: `Untuk parameter ini (semakin tinggi semakin baik), nilai target (${targetValue}) harus lebih tinggi dari baseline (${baselineValue}).`,
      };
    }
  } else {
    // LOWER_IS_BETTER
    if (targetValue >= baselineValue) {
      return {
        valid: false,
        reason: `Untuk parameter ini (semakin rendah/cepat semakin baik), nilai target (${targetValue}) harus lebih rendah dari baseline (${baselineValue}).`,
      };
    }
  }

  return { valid: true };
}

/**
 * Checks whether the current performance value meets or exceeds the goal target.
 */
export function isGoalTargetAchieved(
  targetValue: number,
  currentValue: number | null,
  scoreDirection: ScoreDirection
): boolean {
  if (currentValue === null || isNaN(currentValue)) {
    return false;
  }

  if (scoreDirection === "HIGHER_IS_BETTER") {
    return currentValue >= targetValue;
  } else {
    // LOWER_IS_BETTER
    return currentValue <= targetValue;
  }
}

/**
 * Calculates directional progress (0% - 100%) and delta metrics between baseline, target, and current.
 */
export function calculateGoalProgress(
  baselineValue: number,
  targetValue: number,
  currentValue: number | null,
  scoreDirection: ScoreDirection
): GoalProgressResult {
  if (currentValue === null || isNaN(currentValue)) {
    return {
      progressPercent: 0,
      deltaFromBaseline: 0,
      isImproving: false,
      isTargetReached: false,
      state: "NO_CURRENT_VALUE",
    };
  }

  const deltaFromBaseline = Number((currentValue - baselineValue).toFixed(2));
  const isTargetReached = isGoalTargetAchieved(
    targetValue,
    currentValue,
    scoreDirection
  );

  let rawProgress = 0;
  let isImproving = false;

  if (scoreDirection === "HIGHER_IS_BETTER") {
    isImproving = currentValue > baselineValue;
    const denominator = targetValue - baselineValue;
    if (denominator !== 0) {
      rawProgress = ((currentValue - baselineValue) / denominator) * 100;
    }
  } else {
    // LOWER_IS_BETTER
    isImproving = currentValue < baselineValue;
    const denominator = baselineValue - targetValue;
    if (denominator !== 0) {
      rawProgress = ((baselineValue - currentValue) / denominator) * 100;
    }
  }

  if (isTargetReached) {
    return {
      progressPercent: 100,
      deltaFromBaseline,
      isImproving: true,
      isTargetReached: true,
      state: "ACHIEVED",
    };
  }

  const clampedProgress = Math.min(
    100,
    Math.max(0, Number(rawProgress.toFixed(1)))
  );

  return {
    progressPercent: clampedProgress,
    deltaFromBaseline,
    isImproving,
    isTargetReached: false,
    state: "IN_PROGRESS",
  };
}

/**
 * Validates member authorization to manage athlete goals.
 */
export function canMemberManageGoals(memberRole: string): boolean {
  const role = memberRole.toLowerCase();
  return (
    role === "owner" ||
    role === "admin" ||
    role === "head_coach" ||
    role === "assistant_coach"
  );
}
