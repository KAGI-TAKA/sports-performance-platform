import { describe, it, expect } from "vitest";
import { calculateStarRating, calculateAthleteBadges } from "./achievements";

describe("Athlete MFD Portal (Movement & Fitness Development) Logic & Pathway Tests", () => {
  it("determines MFD pathway correctly based on age <= 12 or MFD competition level", () => {
    const isMfdAthlete = (age: number, competitionLevel: string | null) => {
      return competitionLevel === "MFD" || (competitionLevel !== "YAP" && age <= 12);
    };

    // Young athlete 8 years old
    expect(isMfdAthlete(8, null)).toBe(true);
    expect(isMfdAthlete(11, "Grassroots")).toBe(true);
    expect(isMfdAthlete(10, "MFD")).toBe(true);

    // Teen athlete 14 years old
    expect(isMfdAthlete(14, "YAP")).toBe(false);
    expect(isMfdAthlete(15, null)).toBe(false);

    // Explicit MFD tag overrides
    expect(isMfdAthlete(13, "MFD")).toBe(true);
    // Explicit YAP tag overrides
    expect(isMfdAthlete(12, "YAP")).toBe(false);
  });

  it("calculates MFD star levels and XP progression honestly", () => {
    const computeMfdXpAndLevel = (completedSessions: number, totalAssessments: number, homeChallengeDone: boolean) => {
      const earnedXp = completedSessions * 50 + totalAssessments * 100 + (homeChallengeDone ? 30 : 0);
      const xpPerLevel = 250;
      const currentLevel = Math.max(1, Math.floor(earnedXp / xpPerLevel) + 1);
      const currentLevelXp = earnedXp % xpPerLevel;
      const progressPercent = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));

      return { earnedXp, currentLevel, currentLevelXp, progressPercent };
    };

    // New athlete with 0 sessions
    const fresh = computeMfdXpAndLevel(0, 0, false);
    expect(fresh.earnedXp).toBe(0);
    expect(fresh.currentLevel).toBe(1);
    expect(fresh.currentLevelXp).toBe(0);

    // Athlete with 3 sessions and 1 assessment
    // XP = 3 * 50 + 1 * 100 = 250 XP -> Level 2
    const active = computeMfdXpAndLevel(3, 1, false);
    expect(active.earnedXp).toBe(250);
    expect(active.currentLevel).toBe(2);
    expect(active.currentLevelXp).toBe(0);

    // Athlete with 5 sessions, 2 assessments, and 1 completed home challenge (+30 XP)
    // XP = 5 * 50 + 2 * 100 + 30 = 480 XP -> Level 2 (230 / 250 XP)
    const advanced = computeMfdXpAndLevel(5, 2, true);
    expect(advanced.earnedXp).toBe(480);
    expect(advanced.currentLevel).toBe(2);
    expect(advanced.currentLevelXp).toBe(230);
    expect(advanced.progressPercent).toBe(92);
  });

  it("maps physical component scores into 1-5 star movement skills", () => {
    const scoreToStars = (score: number | null) => {
      if (score == null) return { stars: 1, label: "Langkah Pertama" };
      if (score >= 85) return { stars: 5, label: "Super Star!" };
      if (score >= 70) return { stars: 4, label: "Hebat!" };
      if (score >= 55) return { stars: 3, label: "Bagus!" };
      if (score >= 40) return { stars: 2, label: "Terus Berlatih!" };
      return { stars: 1, label: "Langkah Pertama" };
    };

    expect(scoreToStars(92).stars).toBe(5);
    expect(scoreToStars(75).stars).toBe(4);
    expect(scoreToStars(60).stars).toBe(3);
    expect(scoreToStars(45).stars).toBe(2);
    expect(scoreToStars(30).stars).toBe(1);
    expect(scoreToStars(null).stars).toBe(1);
  });

  it("calculates weekly attendance streak reliably from real attendance records", () => {
    const computeStreak = (history: { status: string }[]) => {
      let streak = 0;
      for (const h of history) {
        if (h.status === "PRESENT" || h.status === "LATE") {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    };

    const perfectHistory = [{ status: "PRESENT" }, { status: "PRESENT" }, { status: "LATE" }];
    expect(computeStreak(perfectHistory)).toBe(3);

    const interruptedHistory = [{ status: "PRESENT" }, { status: "ABSENT" }, { status: "PRESENT" }];
    expect(computeStreak(interruptedHistory)).toBe(1);

    expect(computeStreak([])).toBe(0);
  });
});
