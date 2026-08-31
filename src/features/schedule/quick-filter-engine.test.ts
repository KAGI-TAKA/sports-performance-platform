import { describe, it, expect } from "vitest";
import {
  resolveDefaultScope,
  normalizeScope,
  normalizePeriod,
  getTodayRangeJakarta,
  getWeekRangeJakarta,
  resolveEffectiveScheduleFilters,
  getQuickFilterEmptyState,
} from "./quick-filter-engine";

describe("Schedule Quick Filter Engine (P7-B4)", () => {
  describe("Role Default Scope Resolution", () => {
    it("1. resolves assistant_coach role to 'mine' default scope", () => {
      expect(resolveDefaultScope("assistant_coach")).toBe("mine");
      expect(resolveDefaultScope("ASSISTANT_COACH")).toBe("mine");
      expect(resolveDefaultScope("assistant")).toBe("mine");
    });

    it("2. resolves head_coach, admin, and owner roles to 'all' default scope", () => {
      expect(resolveDefaultScope("head_coach")).toBe("all");
      expect(resolveDefaultScope("admin")).toBe("all");
      expect(resolveDefaultScope("owner")).toBe("all");
      expect(resolveDefaultScope("coach")).toBe("all");
      expect(resolveDefaultScope("")).toBe("all");
    });
  });

  describe("Parameter Normalization", () => {
    it("3. normalizes valid and invalid scope values", () => {
      expect(normalizeScope("mine", "all")).toBe("mine");
      expect(normalizeScope("all", "mine")).toBe("all");
      expect(normalizeScope("invalid_scope", "mine")).toBe("mine");
      expect(normalizeScope(null, "all")).toBe("all");
    });

    it("4. normalizes valid and invalid period values", () => {
      expect(normalizePeriod("today")).toBe("today");
      expect(normalizePeriod("week")).toBe("week");
      expect(normalizePeriod("all")).toBe("all");
      expect(normalizePeriod("invalid_period")).toBe("all");
      expect(normalizePeriod(undefined)).toBe("all");
    });
  });

  describe("Jakarta Date Ranges (WIB)", () => {
    // 2026-08-31 10:00:00 UTC = 2026-08-31 17:00:00 WIB
    const fixedNow = new Date("2026-08-31T10:00:00.000Z");

    it("5. computes today range in Jakarta time (00:00:00 - 23:59:59.999 WIB)", () => {
      const today = getTodayRangeJakarta(fixedNow);
      expect(today.todayIso).toBe("2026-08-31");
      // In UTC, 2026-08-31 00:00:00 WIB is 2026-08-30 17:00:00 UTC
      expect(today.startDate.toISOString()).toBe("2026-08-30T17:00:00.000Z");
      // 24h - 1ms later
      expect(today.endDate.toISOString()).toBe("2026-08-31T16:59:59.999Z");
    });

    it("6. computes week range in Jakarta time (7 consecutive days)", () => {
      const week = getWeekRangeJakarta(fixedNow);
      expect(week.startIso).toBe("2026-08-31");
      expect(week.endIso).toBe("2026-09-06");
      expect(week.startDate.toISOString()).toBe("2026-08-30T17:00:00.000Z");
      expect(week.endDate.toISOString()).toBe("2026-09-06T16:59:59.999Z");
    });
  });

  describe("resolveEffectiveScheduleFilters", () => {
    const fixedNow = new Date("2026-08-31T10:00:00.000Z");

    it("7. defaults Assistant Coach landing page to 'mine' scope and 'all' period", () => {
      const res = resolveEffectiveScheduleFilters({
        role: "assistant_coach",
        memberId: "coach-assistant-1",
        searchParams: {},
        now: fixedNow,
      });

      expect(res.scope).toBe("mine");
      expect(res.period).toBe("all");
      expect(res.activeQuickFilter).toBe("mine");
      expect(res.effectiveCoachId).toBe("coach-assistant-1");
      expect(res.startDate).toBeUndefined();
      expect(res.endDate).toBeUndefined();
    });

    it("8. defaults Head Coach landing page to 'all' scope and 'all' period", () => {
      const res = resolveEffectiveScheduleFilters({
        role: "head_coach",
        memberId: "coach-head-1",
        searchParams: {},
        now: fixedNow,
      });

      expect(res.scope).toBe("all");
      expect(res.period).toBe("all");
      expect(res.activeQuickFilter).toBe("all");
      expect(res.effectiveCoachId).toBeUndefined();
    });

    it("9. resolves period=today with correct Jakarta date range", () => {
      const res = resolveEffectiveScheduleFilters({
        role: "head_coach",
        memberId: "coach-head-1",
        searchParams: { period: "today" },
        now: fixedNow,
      });

      expect(res.period).toBe("today");
      expect(res.activeQuickFilter).toBe("today");
      expect(res.startDate).toBeDefined();
      expect(res.endDate).toBeDefined();
      expect(res.startDate?.toISOString()).toBe("2026-08-30T17:00:00.000Z");
    });

    it("10. resolves period=week with 7-day range", () => {
      const res = resolveEffectiveScheduleFilters({
        role: "assistant_coach",
        memberId: "coach-assistant-1",
        searchParams: { period: "week" },
        now: fixedNow,
      });

      expect(res.period).toBe("week");
      expect(res.activeQuickFilter).toBe("week");
      expect(res.effectiveCoachId).toBe("coach-assistant-1");
      expect(res.startDate).toBeDefined();
      expect(res.endDate).toBeDefined();
    });

    it("11. forces effectiveCoachId to memberId when scope=mine even if coachId query exists", () => {
      const res = resolveEffectiveScheduleFilters({
        role: "head_coach",
        memberId: "coach-head-1",
        searchParams: { scope: "mine", coachId: "coach-other-99" },
        now: fixedNow,
      });

      expect(res.scope).toBe("mine");
      expect(res.effectiveCoachId).toBe("coach-head-1");
    });

    it("12. preserves specific date search parameter when period=all", () => {
      const res = resolveEffectiveScheduleFilters({
        role: "head_coach",
        memberId: "coach-head-1",
        searchParams: { date: "2026-09-05" },
        now: fixedNow,
      });

      expect(res.isSpecificDate).toBe(true);
      expect(res.startDate?.toISOString()).toBe("2026-09-04T17:00:00.000Z");
    });
  });

  describe("getQuickFilterEmptyState", () => {
    it("13. returns tailored empty states for each active quick filter", () => {
      const todayEmpty = getQuickFilterEmptyState("today", "assistant_coach");
      expect(todayEmpty.title).toContain("Hari Ini");
      expect(todayEmpty.description).toContain("ditugaskan");

      const weekEmpty = getQuickFilterEmptyState("week", "head_coach");
      expect(weekEmpty.title).toContain("7 Hari");

      const mineEmpty = getQuickFilterEmptyState("mine", "assistant_coach");
      expect(mineEmpty.title).toContain("Belum Ada Sesi");
    });
  });
});
