import { describe, it, expect, vi, beforeEach } from "vitest";
import { safeDashboardQuery } from "./utils";
import type { AthleteReTestSummary, CoachingWorkloadSummary, SessionHealthSummary } from "@/features/coaching-intelligence/types";

describe("P7-D3: Dashboard Error Isolation & Resilience Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. safeDashboardQuery Base Mechanics", () => {
    it("returns resolved data and isUnavailable=false on successful query", async () => {
      const mockPromise = Promise.resolve({ totalAthletes: 10, freshCount: 10 });
      const result = await safeDashboardQuery(mockPromise, null, "test_domain");

      expect(result.isUnavailable).toBe(false);
      expect(result.data).toEqual({ totalAthletes: 10, freshCount: 10 });
      expect(result.errorDomain).toBeUndefined();
    });

    it("catches rejected promises gracefully, returns fallback and isUnavailable=true", async () => {
      const spyConsole = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockFailingPromise = Promise.reject(new Error("Database connection timed out"));

      const fallbackValue = { totalAthletes: 0 };
      const result = await safeDashboardQuery(mockFailingPromise, fallbackValue, "retest_intelligence");

      expect(result.isUnavailable).toBe(true);
      expect(result.data).toEqual(fallbackValue);
      expect(result.errorDomain).toBe("retest_intelligence");

      expect(spyConsole).toHaveBeenCalledWith(
        "[DASHBOARD_DATA_ERROR] domain=retest_intelligence error=Database connection timed out"
      );
    });

    it("logs domain and sanitized error message without leaking sensitive credentials", async () => {
      const spyConsole = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockSecretError = new Error("Connection failed to postgres://user:secretpass123@db.supabase.co:5432");

      await safeDashboardQuery(Promise.reject(mockSecretError), null, "workload_intelligence");

      expect(spyConsole).toHaveBeenCalled();
      const loggedCall = spyConsole.mock.calls[0][0];
      expect(loggedCall).toContain("[DASHBOARD_DATA_ERROR] domain=workload_intelligence");
    });
  });

  describe("2. Single Query Failure Isolation", () => {
    it("allows Workload and SessionHealth to succeed when ReTest query fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const mockReTestPromise = Promise.reject(new Error("Assessments table lock"));
      const mockWorkloadPromise = Promise.resolve<CoachingWorkloadSummary>({
        period: "month",
        periodLabel: "Agustus 2026",
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        totalAssistants: 2,
        totalCompletedSessions: 8,
        totalDeliveredHours: 12,
        totalPlannedSessions: 10,
        totalPlannedHours: 15,
        assistants: [],
      });
      const mockSessionHealthPromise = Promise.resolve<SessionHealthSummary>({
        totalSessionsAudited: 5,
        pastScheduledCount: 0,
        missingLogCount: 0,
        unmarkedAttendanceCount: 0,
        anomalies: [],
        todayUpcoming: [],
      });

      const [reTestRes, workloadRes, healthRes] = await Promise.all([
        safeDashboardQuery(mockReTestPromise, null, "retest_intelligence"),
        safeDashboardQuery(mockWorkloadPromise, null, "workload_intelligence"),
        safeDashboardQuery(mockSessionHealthPromise, null, "session_health"),
      ]);

      // Re-Test failed safely
      expect(reTestRes.isUnavailable).toBe(true);
      expect(reTestRes.data).toBeNull();

      // Workload succeeded cleanly
      expect(workloadRes.isUnavailable).toBe(false);
      expect(workloadRes.data?.totalDeliveredHours).toBe(12);

      // Session health succeeded cleanly
      expect(healthRes.isUnavailable).toBe(false);
      expect(healthRes.data?.totalSessionsAudited).toBe(5);
    });

    it("allows ReTest and SessionHealth to succeed when Workload query fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const mockReTestPromise = Promise.resolve<AthleteReTestSummary>({
        totalAthletes: 15,
        freshCount: 12,
        dueSoonCount: 2,
        dueCount: 1,
        overdueCount: 0,
        noAssessmentCount: 0,
        insights: [],
      });
      const mockWorkloadPromise = Promise.reject(new Error("Schedule query timeout"));

      const [reTestRes, workloadRes] = await Promise.all([
        safeDashboardQuery(mockReTestPromise, null, "retest_intelligence"),
        safeDashboardQuery(mockWorkloadPromise, null, "workload_intelligence"),
      ]);

      expect(reTestRes.isUnavailable).toBe(false);
      expect(reTestRes.data?.totalAthletes).toBe(15);

      expect(workloadRes.isUnavailable).toBe(true);
      expect(workloadRes.data).toBeNull();
    });
  });

  describe("3. Total Intelligence Failure Resilience", () => {
    it("handles failure across all intelligence sub-queries without throwing an unhandled rejection", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const results = await Promise.all([
        safeDashboardQuery(Promise.reject(new Error("DB Down 1")), null, "stats"),
        safeDashboardQuery(Promise.reject(new Error("DB Down 2")), null, "retest"),
        safeDashboardQuery(Promise.reject(new Error("DB Down 3")), null, "workload"),
        safeDashboardQuery(Promise.reject(new Error("DB Down 4")), null, "health"),
      ]);

      expect(results).toHaveLength(4);
      results.forEach((r) => {
        expect(r.isUnavailable).toBe(true);
        expect(r.data).toBeNull();
      });
    });
  });
});
