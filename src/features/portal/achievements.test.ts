import { describe, it, expect } from "vitest";
import {
  calculateStarRating,
  calculateAthleteBadges,
  getAthleteAchievements,
} from "./achievements";
import type { PortalComponentTrend, PortalReportItem } from "./types";

describe("Athlete Achievement System — Stars & Badges", () => {
  describe("calculateStarRating", () => {
    it("returns 0 stars for unrated athlete without score/grade", () => {
      const res = calculateStarRating(null, null);
      expect(res.stars).toBe(0);
      expect(res.label).toContain("Belum");
    });

    it("returns 5 stars for Grade A+ or score >= 90%", () => {
      expect(calculateStarRating(92, "A+").stars).toBe(5);
      expect(calculateStarRating(90, null).stars).toBe(5);
    });

    it("returns 4 stars for Grade A / B+ or score >= 75%", () => {
      expect(calculateStarRating(82, "A").stars).toBe(4);
      expect(calculateStarRating(78, "B+").stars).toBe(4);
    });

    it("returns 3 stars for Grade B or score >= 60%", () => {
      expect(calculateStarRating(65, "B").stars).toBe(3);
    });

    it("returns 2 stars for Grade C+ / C or score >= 45%", () => {
      expect(calculateStarRating(50, "C").stars).toBe(2);
    });

    it("returns 1 star for low score baseline (< 45%)", () => {
      expect(calculateStarRating(30, "D").stars).toBe(1);
    });
  });

  describe("calculateAthleteBadges", () => {
    const emptyTrends: PortalComponentTrend[] = [];
    const emptyReports: PortalReportItem[] = [];

    it("evaluates unearned badges correctly for a new athlete", () => {
      const badges = calculateAthleteBadges({
        totalAssessments: 0,
        completedSessions: 0,
        overallScore: null,
        overallGrade: null,
        bestComponent: null,
        trends: emptyTrends,
        reports: emptyReports,
      });

      expect(badges.length).toBe(5);
      const earnedCount = badges.filter((b) => b.earned).length;
      expect(earnedCount).toBe(0);
    });

    it("unlocks Pioneer Athlete badge when totalAssessments >= 1", () => {
      const badges = calculateAthleteBadges({
        totalAssessments: 1,
        completedSessions: 0,
        overallScore: 70,
        overallGrade: "B",
        bestComponent: null,
        trends: emptyTrends,
        reports: [{ assessmentId: "1", assessmentDate: "2026-08-01", overallScore: 70, overallGrade: "B", pdfUrl: "/pdf" }],
      });

      const pioneer = badges.find((b) => b.id === "pioneer_athlete");
      expect(pioneer?.earned).toBe(true);
      expect(pioneer?.earnedDate).toBe("2026-08-01");
    });

    it("unlocks Consistent Trainee badge when completedSessions >= 3", () => {
      const badges = calculateAthleteBadges({
        totalAssessments: 0,
        completedSessions: 3,
        overallScore: null,
        overallGrade: null,
        bestComponent: null,
        trends: emptyTrends,
        reports: emptyReports,
      });

      const consistent = badges.find((b) => b.id === "consistent_trainee");
      expect(consistent?.earned).toBe(true);
    });

    it("unlocks High Performer badge when Grade is A or score >= 80%", () => {
      const badges = calculateAthleteBadges({
        totalAssessments: 2,
        completedSessions: 4,
        overallScore: 85,
        overallGrade: "A",
        bestComponent: "SPEED",
        trends: emptyTrends,
        reports: emptyReports,
      });

      const highPerformer = badges.find((b) => b.id === "high_performer");
      expect(highPerformer?.earned).toBe(true);
    });

    it("unlocks Rising Star badge when a trend is IMPROVING", () => {
      const trends: PortalComponentTrend[] = [
        { component: "SPEED", latestScore: 80, previousScore: 70, change: 10, status: "IMPROVING" },
      ];

      const badges = calculateAthleteBadges({
        totalAssessments: 2,
        completedSessions: 2,
        overallScore: 75,
        overallGrade: "B+",
        bestComponent: "SPEED",
        trends,
        reports: emptyReports,
      });

      const risingStar = badges.find((b) => b.id === "rising_star");
      expect(risingStar?.earned).toBe(true);
    });
  });

  describe("getAthleteAchievements", () => {
    it("returns complete PortalAchievementData object", () => {
      const ach = getAthleteAchievements({
        totalAssessments: 3,
        completedSessions: 5,
        overallScore: 92,
        overallGrade: "A+",
        bestComponent: "AGILITY",
        trends: [],
        reports: [],
      });

      expect(ach.starRating).toBe(5);
      expect(ach.badges.length).toBe(5);
      expect(ach.badges.filter((b) => b.earned).length).toBeGreaterThanOrEqual(3);
    });
  });
});
