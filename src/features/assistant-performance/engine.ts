import type { TrendStatus } from "./types";

export interface FeedbackRatingRecord {
  sessionRating: number;
  communicationRating: number;
  athleteAttentionRating: number;
}

/**
 * Calculates overall composite satisfaction:
 * AVG((sessionRating + communicationRating + athleteAttentionRating) / 3)
 */
export function calculateOverallSatisfaction(
  ratings: FeedbackRatingRecord[]
): number | null {
  if (!ratings || ratings.length === 0) return null;

  const sum = ratings.reduce((acc, r) => {
    const composite = (r.sessionRating + r.communicationRating + r.athleteAttentionRating) / 3;
    return acc + composite;
  }, 0);

  return Math.round((sum / ratings.length) * 100) / 100;
}

/**
 * Calculates individual component averages.
 */
export function calculateComponentAverages(ratings: FeedbackRatingRecord[]): {
  sessionQuality: number | null;
  communication: number | null;
  athleteAttention: number | null;
} {
  if (!ratings || ratings.length === 0) {
    return {
      sessionQuality: null,
      communication: null,
      athleteAttention: null,
    };
  }

  const count = ratings.length;
  const sessionSum = ratings.reduce((acc, r) => acc + r.sessionRating, 0);
  const commSum = ratings.reduce((acc, r) => acc + r.communicationRating, 0);
  const attentionSum = ratings.reduce((acc, r) => acc + r.athleteAttentionRating, 0);

  return {
    sessionQuality: Math.round((sessionSum / count) * 100) / 100,
    communication: Math.round((commSum / count) * 100) / 100,
    athleteAttention: Math.round((attentionSum / count) * 100) / 100,
  };
}

/**
 * Calculates feedback response rate:
 * (feedbackCount / eligibleOpportunities) * 100
 * Denominator is eligible athlete-session pairs, not total sessions.
 */
export function calculateResponseRate(
  feedbackCount: number,
  eligibleOpportunities: number
): number | null {
  if (eligibleOpportunities <= 0) return null;
  const rate = (feedbackCount / eligibleOpportunities) * 100;
  return Math.round(rate * 10) / 10;
}

/**
 * Determines trend between current period average and previous equal period average.
 * Enforces dual minimum sample size (>= 3 in current period AND >= 3 in previous period)
 * to prevent misleading or statistically fragile comparisons.
 */
export function calculateTrend(
  currentAvg: number | null,
  prevAvg: number | null,
  currentCount: number,
  prevCount: number
): {
  diff: number | null;
  status: TrendStatus;
  label: string;
} {
  if (currentCount < 3 || prevCount < 3) {
    return {
      diff: null,
      status: "INSUFFICIENT_DATA",
      label: "Belum cukup data untuk dibandingkan",
    };
  }

  if (currentAvg == null || prevAvg == null) {
    return {
      diff: null,
      status: "INSUFFICIENT_DATA",
      label: "Belum cukup data untuk dibandingkan",
    };
  }

  const diff = Math.round((currentAvg - prevAvg) * 100) / 100;

  if (diff >= 0.15) {
    const formattedDiff = diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
    return {
      diff,
      status: "HIGHER",
      label: `${formattedDiff} dibanding periode sebelumnya (↑)`,
    };
  }

  if (diff <= -0.15) {
    return {
      diff,
      status: "LOWER",
      label: `${diff.toFixed(1)} dibanding periode sebelumnya (↓)`,
    };
  }

  return {
    diff,
    status: "SIMILAR",
    label: "Rating rata-rata stabil (→)",
  };
}
