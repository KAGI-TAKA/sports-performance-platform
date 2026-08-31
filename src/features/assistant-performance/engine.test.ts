import { describe, it, expect } from "vitest";
import {
  calculateOverallSatisfaction,
  calculateComponentAverages,
  calculateResponseRate,
  calculateTrend,
} from "./engine";

describe("Assistant Performance Engine", () => {
  describe("calculateOverallSatisfaction", () => {
    it("returns null for empty ratings", () => {
      expect(calculateOverallSatisfaction([])).toBeNull();
    });

    it("calculates exact composite average for single feedback", () => {
      const single = [{ sessionRating: 5, communicationRating: 4, athleteAttentionRating: 3 }];
      // (5 + 4 + 3) / 3 = 4.0
      expect(calculateOverallSatisfaction(single)).toBe(4);
    });

    it("calculates composite average across multiple feedbacks", () => {
      const records = [
        { sessionRating: 5, communicationRating: 5, athleteAttentionRating: 5 }, // 5.0
        { sessionRating: 4, communicationRating: 4, athleteAttentionRating: 4 }, // 4.0
      ];
      // (5.0 + 4.0) / 2 = 4.5
      expect(calculateOverallSatisfaction(records)).toBe(4.5);
    });
  });

  describe("calculateComponentAverages", () => {
    it("returns nulls when empty", () => {
      expect(calculateComponentAverages([])).toEqual({
        sessionQuality: null,
        communication: null,
        athleteAttention: null,
      });
    });

    it("calculates accurate individual component averages", () => {
      const records = [
        { sessionRating: 5, communicationRating: 4, athleteAttentionRating: 3 },
        { sessionRating: 3, communicationRating: 4, athleteAttentionRating: 5 },
      ];
      const res = calculateComponentAverages(records);
      expect(res.sessionQuality).toBe(4);
      expect(res.communication).toBe(4);
      expect(res.athleteAttention).toBe(4);
    });
  });

  describe("calculateResponseRate", () => {
    it("returns null if eligible opportunities <= 0 (prevents divide by zero)", () => {
      expect(calculateResponseRate(0, 0)).toBeNull();
      expect(calculateResponseRate(5, 0)).toBeNull();
      expect(calculateResponseRate(5, -2)).toBeNull();
    });

    it("calculates percentage accurately", () => {
      expect(calculateResponseRate(18, 24)).toBe(75);
      expect(calculateResponseRate(1, 3)).toBe(33.3);
      expect(calculateResponseRate(10, 10)).toBe(100);
      expect(calculateResponseRate(0, 10)).toBe(0);
    });
  });

  describe("calculateTrend & Dual Minimum Sample Size", () => {
    it("returns INSUFFICIENT_DATA when current sample size < 3 feedbacks", () => {
      const result1 = calculateTrend(4.8, 4.0, 0, 5);
      expect(result1.status).toBe("INSUFFICIENT_DATA");
      expect(result1.label).toContain("Belum cukup data untuk dibandingkan");

      const result2 = calculateTrend(4.8, 4.0, 2, 4);
      expect(result2.status).toBe("INSUFFICIENT_DATA");
      expect(result2.label).toContain("Belum cukup data untuk dibandingkan");
    });

    it("returns INSUFFICIENT_DATA when previous sample size < 3 feedbacks (e.g. current 3 / prev 0)", () => {
      const res = calculateTrend(4.8, null, 3, 0);
      expect(res.status).toBe("INSUFFICIENT_DATA");
      expect(res.label).toContain("Belum cukup data untuk dibandingkan");

      const res2 = calculateTrend(4.8, 4.2, 5, 2);
      expect(res2.status).toBe("INSUFFICIENT_DATA");
      expect(res2.label).toContain("Belum cukup data untuk dibandingkan");
    });

    it("returns INSUFFICIENT_DATA when either period average is null", () => {
      expect(calculateTrend(4.5, null, 5, 5).status).toBe("INSUFFICIENT_DATA");
      expect(calculateTrend(null, 4.5, 5, 5).status).toBe("INSUFFICIENT_DATA");
    });

    it("detects HIGHER trend when diff >= +0.15 with current >= 3 AND prev >= 3", () => {
      const res = calculateTrend(4.65, 4.2, 5, 4);
      expect(res.status).toBe("HIGHER");
      expect(res.diff).toBe(0.45);
      expect(res.label).toContain("+0.5 dibanding periode sebelumnya (↑)");
    });

    it("detects LOWER trend when diff <= -0.15 with current >= 3 AND prev >= 3", () => {
      const res = calculateTrend(4.0, 4.3, 4, 3);
      expect(res.status).toBe("LOWER");
      expect(res.diff).toBe(-0.3);
      expect(res.label).toContain("-0.3 dibanding periode sebelumnya (↓)");
    });

    it("detects SIMILAR trend when diff is between -0.15 and +0.15 with current >= 3 AND prev >= 3", () => {
      const res = calculateTrend(4.5, 4.45, 6, 5);
      expect(res.status).toBe("SIMILAR");
      expect(res.diff).toBe(0.05);
      expect(res.label).toContain("Rating rata-rata stabil (→)");
    });
  });
});
