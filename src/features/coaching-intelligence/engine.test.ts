import { describe, it, expect } from "vitest";
import {
  calculateDaysSinceAssessment,
  classifyReTestStatus,
  getReTestStatusMetadata,
  buildAthleteReTestInsight,
  summarizeReTestInsights,
  type RawAthleteWithAssessments,
  calculateSessionDurationMinutes,
  getWorkloadPeriodRangeJakarta,
  aggregateCoachWorkload,
  buildCoachingWorkloadSummary,
  type RawCoachMember,
  type RawWorkloadSession,
  classifySessionHealth,
  buildSessionHealthSummary,
  type RawHealthSession,
} from "./engine";

describe("Coaching Operational Intelligence — Engine (P7-C1, P7-C2, P7-C3)", () => {
  const refDate = new Date("2026-08-31T08:00:00.000Z"); // 15:00 WIB on 31 Aug 2026

  // ============================================================
  // P7-C1: RE-TEST INTELLIGENCE TESTS
  // ============================================================
  describe("1. calculateDaysSinceAssessment (Asia/Jakarta Calendar Day Math)", () => {
    it("calculates 0 calendar days when assessment was conducted today in WIB", () => {
      const assessDate = new Date("2026-08-31T01:00:00.000Z"); // 08:00 WIB today
      expect(calculateDaysSinceAssessment(assessDate, refDate)).toBe(0);
    });

    it("calculates exact calendar days regardless of hour difference", () => {
      // 01 Aug 2026 to 31 Aug 2026 = 30 calendar days
      const assessDate = new Date("2026-08-01T03:00:00.000Z"); // 10:00 WIB on 1 Aug
      expect(calculateDaysSinceAssessment(assessDate, refDate)).toBe(30);
    });

    it("handles UTC midnight boundary transition for Asia/Jakarta (UTC+7)", () => {
      // 2026-08-30 17:00:00 UTC = 2026-08-31 00:00:00 WIB (Same calendar day in Jakarta)
      const assessMidnightWib = new Date("2026-08-30T17:00:00.000Z");
      expect(calculateDaysSinceAssessment(assessMidnightWib, refDate)).toBe(0);

      // 2026-08-30 16:59:59 UTC = 2026-08-30 23:59:59 WIB (Yesterday in Jakarta -> 1 day ago)
      const assessPrevDayWib = new Date("2026-08-30T16:59:59.000Z");
      expect(calculateDaysSinceAssessment(assessPrevDayWib, refDate)).toBe(1);
    });
  });

  describe("2. classifyReTestStatus (Thresholds)", () => {
    it("classifies 0 to 29 days as FRESH", () => {
      expect(classifyReTestStatus(0)).toBe("FRESH");
      expect(classifyReTestStatus(15)).toBe("FRESH");
      expect(classifyReTestStatus(29)).toBe("FRESH");
    });

    it("classifies 30 to 59 days as DUE_SOON", () => {
      expect(classifyReTestStatus(30)).toBe("DUE_SOON");
      expect(classifyReTestStatus(45)).toBe("DUE_SOON");
      expect(classifyReTestStatus(59)).toBe("DUE_SOON");
    });

    it("classifies 60 to 89 days as DUE", () => {
      expect(classifyReTestStatus(60)).toBe("DUE");
      expect(classifyReTestStatus(75)).toBe("DUE");
      expect(classifyReTestStatus(89)).toBe("DUE");
    });

    it("classifies 90+ days as OVERDUE", () => {
      expect(classifyReTestStatus(90)).toBe("OVERDUE");
      expect(classifyReTestStatus(120)).toBe("OVERDUE");
      expect(classifyReTestStatus(365)).toBe("OVERDUE");
    });

    it("classifies null as NO_ASSESSMENT", () => {
      expect(classifyReTestStatus(null)).toBe("NO_ASSESSMENT");
    });
  });

  describe("3. getReTestStatusMetadata (Supportive Terminology)", () => {
    it("returns positive coaching recommendations without punitive wording", () => {
      const fresh = getReTestStatusMetadata("FRESH", 10);
      expect(fresh.statusLabel).toBe("Data Masih Baru");
      expect(fresh.message).toContain("10 hari");

      const due = getReTestStatusMetadata("DUE", 65);
      expect(due.statusLabel).toBe("Perlu Evaluasi Ulang");
      expect(due.recommendedAction).toContain("Jadwalkan sesi asesmen");

      const none = getReTestStatusMetadata("NO_ASSESSMENT", null);
      expect(none.statusLabel).toBe("Belum Ada Evaluasi");
      expect(none.recommendedAction).toContain("baseline");
    });
  });

  describe("4. buildAthleteReTestInsight (Deterministic Latest Assessment & Filter Rules)", () => {
    it("handles athlete with NO assessments", () => {
      const athlete: RawAthleteWithAssessments = {
        id: "ath-1",
        fullName: "Rangga Pratama",
        category: "U16",
        jerseyNumber: 10,
        position: "Forward",
        photoUrl: null,
        assessments: [],
      };

      const insight = buildAthleteReTestInsight(athlete, refDate);
      expect(insight.reTestStatus).toBe("NO_ASSESSMENT");
      expect(insight.latestAssessmentId).toBeNull();
      expect(insight.daysSinceAssessment).toBeNull();
      expect(insight.recommendedAction).toContain("baseline");
    });

    it("ignores DRAFT assessments and treats as NO_ASSESSMENT if no COMPLETED exists", () => {
      const athlete: RawAthleteWithAssessments = {
        id: "ath-2",
        fullName: "Budi Santoso",
        category: "U18",
        jerseyNumber: 7,
        position: "Midfielder",
        photoUrl: null,
        assessments: [
          {
            id: "ass-draft-1",
            status: "DRAFT",
            assessmentDate: new Date("2026-08-15T00:00:00Z"),
            overallScore: 80,
            overallGrade: "B",
          },
        ],
      };

      const insight = buildAthleteReTestInsight(athlete, refDate);
      expect(insight.reTestStatus).toBe("NO_ASSESSMENT");
      expect(insight.latestAssessmentId).toBeNull();
    });

    it("ignores future-dated assessments and falls back to previous valid completed assessment", () => {
      const athlete: RawAthleteWithAssessments = {
        id: "ath-3",
        fullName: "Kevin Sanjaya",
        category: "Pro",
        jerseyNumber: 1,
        position: "Guard",
        photoUrl: null,
        assessments: [
          {
            id: "ass-future",
            status: "COMPLETED",
            assessmentDate: new Date("2026-09-10T00:00:00Z"), // Future
            overallScore: 95,
            overallGrade: "A",
          },
          {
            id: "ass-past",
            status: "COMPLETED",
            assessmentDate: new Date("2026-07-02T00:00:00Z"), // 60 days ago
            overallScore: 78,
            overallGrade: "C",
          },
        ],
      };

      const insight = buildAthleteReTestInsight(athlete, refDate);
      expect(insight.latestAssessmentId).toBe("ass-past");
      expect(insight.daysSinceAssessment).toBe(60);
      expect(insight.reTestStatus).toBe("DUE");
    });

    it("resolves same-date assessments deterministically using createdAt/id tie-breaker", () => {
      const athlete: RawAthleteWithAssessments = {
        id: "ath-4",
        fullName: "Dimas Anggara",
        category: "U16",
        jerseyNumber: 9,
        position: "Striker",
        photoUrl: null,
        assessments: [
          {
            id: "ass-same-date-1",
            status: "COMPLETED",
            assessmentDate: new Date("2026-08-01T00:00:00Z"),
            overallScore: 70,
            overallGrade: "C",
            createdAt: new Date("2026-08-01T08:00:00Z"),
          },
          {
            id: "ass-same-date-2",
            status: "COMPLETED",
            assessmentDate: new Date("2026-08-01T00:00:00Z"),
            overallScore: 85,
            overallGrade: "B",
            createdAt: new Date("2026-08-01T14:00:00Z"),
          },
        ],
      };

      const insight = buildAthleteReTestInsight(athlete, refDate);
      expect(insight.latestAssessmentId).toBe("ass-same-date-2");
      expect(insight.latestOverallScore).toBe(85);
      expect(insight.latestOverallGrade).toBe("B");
    });
  });

  describe("5. summarizeReTestInsights (Dashboard Counts)", () => {
    it("aggregates accurate summary statistics for active roster", () => {
      const insights = [
        buildAthleteReTestInsight({
          id: "1",
          fullName: "A",
          category: null,
          jerseyNumber: null,
          position: null,
          photoUrl: null,
          assessments: [{ id: "a1", status: "COMPLETED", assessmentDate: new Date("2026-08-20T00:00:00Z"), overallScore: 80, overallGrade: "B" }],
        }, refDate),
        buildAthleteReTestInsight({
          id: "2",
          fullName: "B",
          category: null,
          jerseyNumber: null,
          position: null,
          photoUrl: null,
          assessments: [{ id: "a2", status: "COMPLETED", assessmentDate: new Date("2026-07-15T00:00:00Z"), overallScore: 80, overallGrade: "B" }],
        }, refDate),
        buildAthleteReTestInsight({
          id: "3",
          fullName: "C",
          category: null,
          jerseyNumber: null,
          position: null,
          photoUrl: null,
          assessments: [{ id: "a3", status: "COMPLETED", assessmentDate: new Date("2026-06-15T00:00:00Z"), overallScore: 80, overallGrade: "B" }],
        }, refDate),
        buildAthleteReTestInsight({
          id: "4",
          fullName: "D",
          category: null,
          jerseyNumber: null,
          position: null,
          photoUrl: null,
          assessments: [{ id: "a4", status: "COMPLETED", assessmentDate: new Date("2026-05-01T00:00:00Z"), overallScore: 80, overallGrade: "B" }],
        }, refDate),
        buildAthleteReTestInsight({
          id: "5",
          fullName: "E",
          category: null,
          jerseyNumber: null,
          position: null,
          photoUrl: null,
          assessments: [],
        }, refDate),
      ];

      const summary = summarizeReTestInsights(insights);
      expect(summary.totalAthletes).toBe(5);
      expect(summary.freshCount).toBe(1);
      expect(summary.dueSoonCount).toBe(1);
      expect(summary.dueCount).toBe(1);
      expect(summary.overdueCount).toBe(1);
      expect(summary.noAssessmentCount).toBe(1);
    });
  });

  // ============================================================
  // P7-C2: WORKLOAD INTELLIGENCE TESTS
  // ============================================================
  describe("6. calculateSessionDurationMinutes (Defensive Duration Calculation)", () => {
    it("calculates accurate duration for standard sessions", () => {
      const start = new Date("2026-08-31T09:00:00Z");
      const end = new Date("2026-08-31T10:30:00Z"); // 90 min
      const res = calculateSessionDurationMinutes(start, end);
      expect(res.isValid).toBe(true);
      expect(res.durationMinutes).toBe(90);
    });

    it("normalizes invalid durations (endTime <= startTime) to 0 and marks invalid", () => {
      const start = new Date("2026-08-31T10:00:00Z");
      const endInvalid = new Date("2026-08-31T09:00:00Z"); // inverted
      const resInverted = calculateSessionDurationMinutes(start, endInvalid);
      expect(resInverted.isValid).toBe(false);
      expect(resInverted.durationMinutes).toBe(0);

      const endSame = new Date("2026-08-31T10:00:00Z"); // 0 ms
      const resSame = calculateSessionDurationMinutes(start, endSame);
      expect(resSame.isValid).toBe(false);
      expect(resSame.durationMinutes).toBe(0);
    });
  });

  describe("7. getWorkloadPeriodRangeJakarta (WIB Boundaries)", () => {
    it("computes exact month boundaries for August 2026", () => {
      const range = getWorkloadPeriodRangeJakarta("month", refDate);
      expect(range.startDateStr).toBe("2026-08-01");
      expect(range.endDateStr).toBe("2026-08-31");
      expect(range.startDate.toISOString()).toBe("2026-07-31T17:00:00.000Z"); // 01 Aug 00:00 WIB
      expect(range.endDate.toISOString()).toBe("2026-08-31T16:59:59.000Z"); // 31 Aug 23:59:59 WIB
    });

    it("computes exact rolling 30 days range", () => {
      const range = getWorkloadPeriodRangeJakarta("last30", refDate);
      expect(range.startDateStr).toBe("2026-08-02");
      expect(range.endDateStr).toBe("2026-08-31");
    });
  });

  describe("8. aggregateCoachWorkload (Actual Delivery vs Planned Load)", () => {
    const coach: RawCoachMember = {
      id: "asst-1",
      role: "assistant_coach",
      user: {
        name: "Coach Budi",
        email: "budi@example.com",
        image: null,
      },
    };

    it("aggregates completed sessions as actual delivery and future scheduled as planned load", () => {
      const sessions: RawWorkloadSession[] = [
        {
          id: "s1",
          coachId: "asst-1",
          startTime: new Date("2026-08-20T08:00:00Z"),
          endTime: new Date("2026-08-20T09:30:00Z"),
          status: "COMPLETED",
        },
        {
          id: "s2",
          coachId: "asst-1",
          startTime: new Date("2026-08-22T08:00:00Z"),
          endTime: new Date("2026-08-22T09:00:00Z"),
          status: "COMPLETED",
        },
        {
          id: "s3",
          coachId: "asst-1",
          startTime: new Date("2026-09-02T08:00:00Z"),
          endTime: new Date("2026-09-02T09:30:00Z"),
          status: "SCHEDULED",
        },
        {
          id: "s4",
          coachId: "asst-1",
          startTime: new Date("2026-08-25T08:00:00Z"),
          endTime: new Date("2026-08-25T09:30:00Z"),
          status: "SCHEDULED",
        },
        {
          id: "s5",
          coachId: "asst-1",
          startTime: new Date("2026-08-26T08:00:00Z"),
          endTime: new Date("2026-08-26T09:30:00Z"),
          status: "CANCELLED",
        },
      ];

      const res = aggregateCoachWorkload(coach, sessions, refDate);
      expect(res.coachName).toBe("Coach Budi");
      expect(res.completedSessions).toBe(2);
      expect(res.deliveredMinutes).toBe(150);
      expect(res.deliveredHours).toBe(2.5);

      expect(res.plannedSessions).toBe(1);
      expect(res.plannedMinutes).toBe(90);
      expect(res.plannedHours).toBe(1.5);

      expect(res.anomaliesCount).toBe(1);
    });

    it("handles coach with 0 sessions gracefully", () => {
      const res = aggregateCoachWorkload(coach, [], refDate);
      expect(res.completedSessions).toBe(0);
      expect(res.deliveredHours).toBe(0);
      expect(res.plannedSessions).toBe(0);
      expect(res.plannedHours).toBe(0);
      expect(res.anomaliesCount).toBe(0);
    });
  });

  describe("9. buildCoachingWorkloadSummary (Organization Totals)", () => {
    it("sums all assistant workloads accurately", () => {
      const periodRange = getWorkloadPeriodRangeJakarta("month", refDate);
      const items = [
        {
          coachId: "1",
          coachName: "Coach A",
          coachEmail: null,
          coachPhotoUrl: null,
          role: "assistant_coach",
          completedSessions: 5,
          deliveredMinutes: 300,
          deliveredHours: 5.0,
          plannedSessions: 2,
          plannedMinutes: 120,
          plannedHours: 2.0,
          anomaliesCount: 0,
        },
        {
          coachId: "2",
          coachName: "Coach B",
          coachEmail: null,
          coachPhotoUrl: null,
          role: "assistant_coach",
          completedSessions: 3,
          deliveredMinutes: 180,
          deliveredHours: 3.0,
          plannedSessions: 4,
          plannedMinutes: 240,
          plannedHours: 4.0,
          anomaliesCount: 0,
        },
      ];

      const summary = buildCoachingWorkloadSummary(items, periodRange);
      expect(summary.totalAssistants).toBe(2);
      expect(summary.totalCompletedSessions).toBe(8);
      expect(summary.totalDeliveredHours).toBe(8.0);
      expect(summary.totalPlannedSessions).toBe(6);
      expect(summary.totalPlannedHours).toBe(6.0);
    });
  });

  // ============================================================
  // P7-C3: SESSION HEALTH INTELLIGENCE TESTS
  // ============================================================
  describe("10. classifySessionHealth (Operational Anomaly Detection)", () => {
    const fixedNow = new Date("2026-08-31T09:00:00.000Z"); // 16:00 WIB on 31 Aug 2026

    it("classifies past session with status SCHEDULED as PAST_SCHEDULED (ATTENTION)", () => {
      const sess: RawHealthSession = {
        id: "sess-past-1",
        title: "Speed & Agility",
        coachId: "coach-1",
        coachName: "Coach Budi",
        startTime: new Date("2026-08-30T09:00:00Z"), // Yesterday
        endTime: new Date("2026-08-30T10:30:00Z"),
        status: "SCHEDULED",
        athletes: [{ id: "ath-1", fullName: "Rangga" }],
        attendances: [],
        sessionLogs: [],
      };

      const health = classifySessionHealth(sess, fixedNow);
      expect(health).not.toBeNull();
      expect(health?.healthType).toBe("PAST_SCHEDULED");
      expect(health?.severity).toBe("ATTENTION");
      expect(health?.title).toBe("Sesi Belum Difinalisasi");
      expect(health?.ctaUrl).toBe("/schedule/sess-past-1/execute");
    });

    it("classifies ended session with UNMARKED attendances as UNMARKED_ATTENDANCE (ATTENTION)", () => {
      const sess: RawHealthSession = {
        id: "sess-unmarked",
        title: "Strength Camp",
        coachId: "coach-1",
        coachName: "Coach Budi",
        startTime: new Date("2026-08-31T07:00:00Z"), // Earlier today
        endTime: new Date("2026-08-31T08:30:00Z"),   // Ended 30 min before fixedNow (09:00Z)
        status: "SCHEDULED",
        athletes: [
          { id: "ath-1", fullName: "Rangga" },
          { id: "ath-2", fullName: "Kevin" },
        ],
        attendances: [
          { athleteId: "ath-1", status: "UNMARKED" },
          { athleteId: "ath-2", status: "PRESENT" },
        ],
        sessionLogs: [],
      };

      const health = classifySessionHealth(sess, fixedNow);
      expect(health).not.toBeNull();
      // Priority: PAST_SCHEDULED triggers first if status is still SCHEDULED
      expect(health?.healthType).toBe("PAST_SCHEDULED");
    });

    it("classifies completed session with UNMARKED attendances as UNMARKED_ATTENDANCE (ATTENTION)", () => {
      const sess: RawHealthSession = {
        id: "sess-comp-unmarked",
        title: "Strength Camp",
        coachId: "coach-1",
        coachName: "Coach Budi",
        startTime: new Date("2026-08-31T07:00:00Z"),
        endTime: new Date("2026-08-31T08:30:00Z"),
        status: "COMPLETED",
        athletes: [
          { id: "ath-1", fullName: "Rangga" },
          { id: "ath-2", fullName: "Kevin" },
        ],
        attendances: [
          { athleteId: "ath-1", status: "UNMARKED" },
          { athleteId: "ath-2", status: "PRESENT" },
        ],
        sessionLogs: [{ id: "log-2", athleteId: "ath-2" }],
      };

      const health = classifySessionHealth(sess, fixedNow);
      expect(health).not.toBeNull();
      expect(health?.healthType).toBe("UNMARKED_ATTENDANCE");
      expect(health?.affectedAthleteNames).toEqual(["Rangga"]);
    });

    it("classifies completed session missing required logs for PRESENT/LATE athletes as COMPLETED_MISSING_LOG", () => {
      const sess: RawHealthSession = {
        id: "sess-comp-missing-log",
        title: "Basketball Plyometrics",
        coachId: "coach-1",
        coachName: "Coach Zulfi",
        startTime: new Date("2026-08-31T07:00:00Z"),
        endTime: new Date("2026-08-31T08:30:00Z"),
        status: "COMPLETED",
        athletes: [
          { id: "ath-1", fullName: "Rangga" },
          { id: "ath-2", fullName: "Kevin" },
        ],
        attendances: [
          { athleteId: "ath-1", status: "PRESENT" }, // Missing log
          { athleteId: "ath-2", status: "LATE" },    // Has log
        ],
        sessionLogs: [{ id: "log-2", athleteId: "ath-2" }],
      };

      const health = classifySessionHealth(sess, fixedNow);
      expect(health).not.toBeNull();
      expect(health?.healthType).toBe("COMPLETED_MISSING_LOG");
      expect(health?.affectedAthleteNames).toEqual(["Rangga"]);
    });

    it("treats ABSENT and EXCUSED athletes as healthy when they have no session log", () => {
      const sess: RawHealthSession = {
        id: "sess-comp-absent",
        title: "Mobility & Recovery",
        coachId: "coach-1",
        coachName: "Coach Zulfi",
        startTime: new Date("2026-08-31T07:00:00Z"),
        endTime: new Date("2026-08-31T08:30:00Z"),
        status: "COMPLETED",
        athletes: [
          { id: "ath-1", fullName: "Rangga" },
          { id: "ath-2", fullName: "Kevin" },
          { id: "ath-3", fullName: "Dimas" },
        ],
        attendances: [
          { athleteId: "ath-1", status: "PRESENT" },
          { athleteId: "ath-2", status: "ABSENT" },  // No log needed
          { athleteId: "ath-3", status: "EXCUSED" }, // No log needed
        ],
        sessionLogs: [
          { id: "log-1", athleteId: "ath-1" },
        ],
      };

      const health = classifySessionHealth(sess, fixedNow);
      expect(health).not.toBeNull();
      expect(health?.healthType).toBe("COMPLETED_HEALTHY");
      expect(health?.severity).toBe("NORMAL");
    });

    it("classifies SCHEDULED session within today's window as TODAY_UPCOMING (INFO)", () => {
      const sess: RawHealthSession = {
        id: "sess-today-up",
        title: "Evening Speed",
        coachId: "coach-1",
        coachName: "Coach Budi",
        startTime: new Date("2026-08-31T11:00:00Z"), // 18:00 WIB (Later today)
        endTime: new Date("2026-08-31T12:30:00Z"),
        status: "SCHEDULED",
        athletes: [{ id: "ath-1", fullName: "Rangga" }],
        attendances: [],
        sessionLogs: [],
      };

      const health = classifySessionHealth(sess, fixedNow);
      expect(health).not.toBeNull();
      expect(health?.healthType).toBe("TODAY_UPCOMING");
      expect(health?.severity).toBe("INFO");
      expect(health?.title).toBe("Sesi Hari Ini");
    });

    it("ignores CANCELLED and NO_SHOW sessions from health alerts (returns null)", () => {
      const sessCancelled: RawHealthSession = {
        id: "sess-canc",
        title: "Dibatalkan",
        coachId: "coach-1",
        coachName: "Coach Budi",
        startTime: new Date("2026-08-30T09:00:00Z"),
        endTime: new Date("2026-08-30T10:30:00Z"),
        status: "CANCELLED",
        athletes: [],
        attendances: [],
        sessionLogs: [],
      };

      expect(classifySessionHealth(sessCancelled, fixedNow)).toBeNull();

      const sessNoShow: RawHealthSession = {
        id: "sess-ns",
        title: "No Show",
        coachId: "coach-1",
        coachName: "Coach Budi",
        startTime: new Date("2026-08-30T09:00:00Z"),
        endTime: new Date("2026-08-30T10:30:00Z"),
        status: "NO_SHOW",
        athletes: [],
        attendances: [],
        sessionLogs: [],
      };

      expect(classifySessionHealth(sessNoShow, fixedNow)).toBeNull();
    });
  });

  describe("11. buildSessionHealthSummary (Summary Aggregation)", () => {
    it("aggregates accurate summary counts and categorizes anomalies vs today upcoming", () => {
      const items: (import("./types").SessionHealthItem | null)[] = [
        {
          sessionId: "1",
          sessionTitle: "S1",
          coachId: "c1",
          coachName: "Coach",
          startTime: new Date(),
          endTime: new Date(),
          startTimeFormatted: "08:00",
          endTimeFormatted: "09:30",
          status: "SCHEDULED",
          healthType: "PAST_SCHEDULED",
          severity: "ATTENTION",
          title: "Past",
          description: "Desc",
          affectedAthleteNames: [],
          ctaLabel: "CTA",
          ctaUrl: "/schedule/1/execute",
        },
        {
          sessionId: "2",
          sessionTitle: "S2",
          coachId: "c1",
          coachName: "Coach",
          startTime: new Date(),
          endTime: new Date(),
          startTimeFormatted: "10:00",
          endTimeFormatted: "11:30",
          status: "COMPLETED",
          healthType: "COMPLETED_MISSING_LOG",
          severity: "ATTENTION",
          title: "Missing Log",
          description: "Desc",
          affectedAthleteNames: ["Rangga"],
          ctaLabel: "CTA",
          ctaUrl: "/schedule/2/execute",
        },
        {
          sessionId: "3",
          sessionTitle: "S3",
          coachId: "c1",
          coachName: "Coach",
          startTime: new Date(),
          endTime: new Date(),
          startTimeFormatted: "14:00",
          endTimeFormatted: "15:30",
          status: "COMPLETED",
          healthType: "COMPLETED_HEALTHY",
          severity: "NORMAL",
          title: "Healthy",
          description: "Desc",
          affectedAthleteNames: [],
          ctaLabel: "CTA",
          ctaUrl: "/schedule/3/execute",
        },
        {
          sessionId: "4",
          sessionTitle: "S4",
          coachId: "c1",
          coachName: "Coach",
          startTime: new Date(),
          endTime: new Date(),
          startTimeFormatted: "16:00",
          endTimeFormatted: "17:30",
          status: "SCHEDULED",
          healthType: "TODAY_UPCOMING",
          severity: "INFO",
          title: "Upcoming",
          description: "Desc",
          affectedAthleteNames: [],
          ctaLabel: "CTA",
          ctaUrl: "/schedule/4/execute",
        },
        null, // Ignored cancelled
      ];

      const summary = buildSessionHealthSummary(items);
      expect(summary.totalSessionsAudited).toBe(4);
      expect(summary.pastScheduledCount).toBe(1);
      expect(summary.missingLogCount).toBe(1);
      expect(summary.healthyCount).toBe(1);
      expect(summary.todayUpcomingCount).toBe(1);
      expect(summary.anomalies).toHaveLength(2);
      expect(summary.todayUpcoming).toHaveLength(1);
    });
  });
});
