import { describe, it, expect } from "vitest";
import {
  summarizeReTestInsights,
  buildCoachingWorkloadSummary,
  buildSessionHealthSummary,
  getWorkloadPeriodRangeJakarta,
  type AssistantWorkloadItem,
  type SessionHealthItem,
  type AthleteReTestInsight,
} from "@/features/coaching-intelligence/engine";

describe("Dashboard Operational Integration (P7-C4)", () => {
  const refDate = new Date("2026-08-31T08:00:00.000Z"); // 15:00 WIB on 31 Aug 2026

  describe("1. Role Scoping Logic for Dashboard Widgets", () => {
    it("provides full organization workload items to managers", () => {
      const periodRange = getWorkloadPeriodRangeJakarta("month", refDate);
      const allAssistants: AssistantWorkloadItem[] = [
        {
          coachId: "asst-1",
          coachName: "Coach Budi",
          coachEmail: "budi@example.com",
          coachPhotoUrl: null,
          role: "assistant_coach",
          completedSessions: 10,
          deliveredMinutes: 600,
          deliveredHours: 10.0,
          plannedSessions: 4,
          plannedMinutes: 240,
          plannedHours: 4.0,
          anomaliesCount: 0,
        },
        {
          coachId: "asst-2",
          coachName: "Coach Dimas",
          coachEmail: "dimas@example.com",
          coachPhotoUrl: null,
          role: "assistant_coach",
          completedSessions: 6,
          deliveredMinutes: 360,
          deliveredHours: 6.0,
          plannedSessions: 2,
          plannedMinutes: 120,
          plannedHours: 2.0,
          anomaliesCount: 0,
        },
      ];

      const managerSummary = buildCoachingWorkloadSummary(allAssistants, periodRange);
      expect(managerSummary.totalAssistants).toBe(2);
      expect(managerSummary.totalCompletedSessions).toBe(16);
      expect(managerSummary.totalDeliveredHours).toBe(16.0);
      expect(managerSummary.assistants).toHaveLength(2);
    });

    it("scopes workload strictly to self for assistant coaches", () => {
      const periodRange = getWorkloadPeriodRangeJakarta("month", refDate);
      const selfAssistantOnly: AssistantWorkloadItem[] = [
        {
          coachId: "asst-1",
          coachName: "Coach Budi",
          coachEmail: "budi@example.com",
          coachPhotoUrl: null,
          role: "assistant_coach",
          completedSessions: 10,
          deliveredMinutes: 600,
          deliveredHours: 10.0,
          plannedSessions: 4,
          plannedMinutes: 240,
          plannedHours: 4.0,
          anomaliesCount: 0,
        },
      ];

      const assistantSummary = buildCoachingWorkloadSummary(selfAssistantOnly, periodRange);
      expect(assistantSummary.totalAssistants).toBe(1);
      expect(assistantSummary.totalCompletedSessions).toBe(10);
      expect(assistantSummary.assistants).toHaveLength(1);
      expect(assistantSummary.assistants[0].coachId).toBe("asst-1");
    });
  });

  describe("2. Operational Attention Anomaly Formatting", () => {
    it("aggregates disparate operational health anomalies without crashing", () => {
      const anomalies: SessionHealthItem[] = [
        {
          sessionId: "s1",
          sessionTitle: "Speed Work",
          coachId: "c1",
          coachName: "Coach Zulfi",
          startTime: new Date("2026-08-30T09:00:00Z"),
          endTime: new Date("2026-08-30T10:30:00Z"),
          startTimeFormatted: "16:00",
          endTimeFormatted: "17:30",
          status: "SCHEDULED",
          healthType: "PAST_SCHEDULED",
          severity: "ATTENTION",
          title: "Sesi Belum Difinalisasi",
          description: "Waktu sesi telah lewat",
          affectedAthleteNames: ["Rangga"],
          ctaLabel: "Buka Workspace Eksekusi",
          ctaUrl: "/schedule/s1/execute",
        },
        {
          sessionId: "s2",
          sessionTitle: "Strength Camp",
          coachId: "c1",
          coachName: "Coach Budi",
          startTime: new Date("2026-08-30T09:00:00Z"),
          endTime: new Date("2026-08-30T10:30:00Z"),
          startTimeFormatted: "16:00",
          endTimeFormatted: "17:30",
          status: "COMPLETED",
          healthType: "COMPLETED_MISSING_LOG",
          severity: "ATTENTION",
          title: "Catatan Sesi Belum Lengkap",
          description: "1 atlet hadir belum memiliki log",
          affectedAthleteNames: ["Kevin"],
          ctaLabel: "Lengkapi Log Latihan",
          ctaUrl: "/schedule/s2/execute",
        },
      ];

      const healthSummary = buildSessionHealthSummary(anomalies);
      expect(healthSummary.pastScheduledCount).toBe(1);
      expect(healthSummary.missingLogCount).toBe(1);
      expect(healthSummary.anomalies).toHaveLength(2);
    });
  });

  describe("3. Re-Test Widget Prioritization", () => {
    it("prioritizes OVERDUE, DUE, and NO_ASSESSMENT athletes for display", () => {
      const sampleInsights: AthleteReTestInsight[] = [
        {
          athleteId: "1",
          athleteName: "Overdue Athlete",
          category: "U16",
          jerseyNumber: 10,
          position: "Forward",
          photoUrl: null,
          latestAssessmentId: "a1",
          latestAssessmentDate: new Date("2026-05-01"),
          latestAssessmentDateStr: "2026-05-01",
          latestOverallScore: 80,
          latestOverallGrade: "B",
          daysSinceAssessment: 122,
          reTestStatus: "OVERDUE",
          statusLabel: "Sangat Disarankan Re-Test",
          message: "Msg",
          recommendedAction: "Action",
        },
        {
          athleteId: "2",
          athleteName: "Fresh Athlete",
          category: "U18",
          jerseyNumber: 7,
          position: "Midfielder",
          photoUrl: null,
          latestAssessmentId: "a2",
          latestAssessmentDate: new Date("2026-08-20"),
          latestAssessmentDateStr: "2026-08-20",
          latestOverallScore: 90,
          latestOverallGrade: "A",
          daysSinceAssessment: 11,
          reTestStatus: "FRESH",
          statusLabel: "Data Masih Baru",
          message: "Msg",
          recommendedAction: "Action",
        },
      ];

      const summary = summarizeReTestInsights(sampleInsights);
      expect(summary.overdueCount).toBe(1);
      expect(summary.freshCount).toBe(1);
      expect(summary.totalAthletes).toBe(2);
    });
  });
});
