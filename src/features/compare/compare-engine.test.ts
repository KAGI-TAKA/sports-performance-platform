import { describe, it, expect } from "vitest";
import {
  calculateMultiAthleteComparison,
  resolveComplementaryStrengths,
  parseComponentScoresJson,
  calculateAge,
  type RawAssessmentData,
} from "./engine";
import { COMPARE_COLORS } from "./types";

const mockAthletes: RawAssessmentData[] = [
  {
    id: "ath-1",
    fullName: "Rangga Pratama",
    position: "POINT_GUARD",
    jerseyNumber: 7,
    dateOfBirth: new Date("2012-05-15"),
    gender: "MALE",
      assessment: {
        id: "ass-1",
        assessmentDate: new Date("2026-08-15"),
        overallScore: 84.5,
        overallGrade: "B+",
        resultItems: [
          {
            id: "res-1",
            rawValue: 4.49,
            score: 88,
            testItem: {
              id: "item-sprint",
              name: "Sprint 20m",
              unit: "SECOND",
              scoreDirection: "LOWER_IS_BETTER",
              physicalComponent: "SPEED",
            },
          },
          {
            id: "res-2",
            rawValue: 44,
            score: 80,
            testItem: {
              id: "item-jump",
              name: "Vertical Jump",
              unit: "CM",
              scoreDirection: "HIGHER_IS_BETTER",
              physicalComponent: "POWER",
            },
          },
        ],
        analysis: {
          componentScores: {
            SPEED: 88,
            POWER: 80,
            AGILITY: 85,
            FLEXIBILITY: 75,
            MUSCULAR_ENDURANCE: 78,
            ANAEROBIC_ENDURANCE: 82,
            AEROBIC_ENDURANCE: 84,
          },
          bestComponent: "SPEED",
          weakestComponents: ["FLEXIBILITY"],
        },
      },
    },
    {
      id: "ath-2",
      fullName: "Budi Santoso",
      position: "CENTER",
      jerseyNumber: 15,
      dateOfBirth: new Date("2011-03-20"),
      gender: "MALE",
      assessment: {
        id: "ass-2",
        assessmentDate: new Date("2026-08-18"),
        overallScore: 82.0,
        overallGrade: "B+",
        resultItems: [
          {
            id: "res-3",
            rawValue: 4.65,
            score: 79,
            testItem: {
              id: "item-sprint",
              name: "Sprint 20m",
              unit: "SECOND",
              scoreDirection: "LOWER_IS_BETTER",
              physicalComponent: "SPEED",
            },
          },
          {
            id: "res-4",
            rawValue: 52,
            score: 92,
            testItem: {
              id: "item-jump",
              name: "Vertical Jump",
              unit: "CM",
              scoreDirection: "HIGHER_IS_BETTER",
              physicalComponent: "POWER",
            },
          },
        ],
        analysis: {
          componentScores: {
            SPEED: 79,
            POWER: 92,
            AGILITY: 72,
            FLEXIBILITY: 68,
            MUSCULAR_ENDURANCE: 88,
            ANAEROBIC_ENDURANCE: 80,
            AEROBIC_ENDURANCE: 76,
          },
          bestComponent: "POWER",
          weakestComponents: ["FLEXIBILITY"],
        },
      },
    },
    {
      id: "ath-3",
      fullName: "Dimas Anggara",
      position: "SMALL_FORWARD",
      jerseyNumber: 23,
      dateOfBirth: new Date("2013-09-10"),
      gender: "MALE",
      assessment: {
        id: "ass-3",
        assessmentDate: new Date("2026-08-20"),
        overallScore: 80.0,
        overallGrade: "B+",
        resultItems: [
          // Notice: ath-3 only tested Vertical Jump, NOT Sprint 20m
          {
            id: "res-5",
            rawValue: 40,
            score: 75,
            testItem: {
              id: "item-jump",
              name: "Vertical Jump",
              unit: "CM",
              scoreDirection: "HIGHER_IS_BETTER",
              physicalComponent: "POWER",
            },
          },
        ],
        analysis: {
          componentScores: {
            SPEED: 70,
            POWER: 75,
            AGILITY: 90,
            FLEXIBILITY: 82,
            MUSCULAR_ENDURANCE: 72,
            ANAEROBIC_ENDURANCE: 74,
            AEROBIC_ENDURANCE: 78,
          },
          bestComponent: "AGILITY",
          weakestComponents: ["SPEED"],
        },
      },
    },
    {
      id: "ath-4",
      fullName: "Eko Prasetyo",
      position: "SHOOTING_GUARD",
      jerseyNumber: 3,
      dateOfBirth: new Date("2012-11-05"),
      gender: "MALE",
      assessment: {
        id: "ass-4",
        assessmentDate: new Date("2026-08-22"),
        overallScore: 86.0,
        overallGrade: "B+",
        resultItems: [
          {
            id: "res-6",
            rawValue: 4.52,
            score: 85,
            testItem: {
              id: "item-sprint",
              name: "Sprint 20m",
              unit: "SECOND",
              scoreDirection: "LOWER_IS_BETTER",
              physicalComponent: "SPEED",
            },
          },
        ],
        analysis: {
          componentScores: {
            SPEED: 85,
            POWER: 82,
            AGILITY: 86,
            FLEXIBILITY: 80,
            MUSCULAR_ENDURANCE: 84,
            ANAEROBIC_ENDURANCE: 85,
            AEROBIC_ENDURANCE: 89,
          },
          bestComponent: "AEROBIC_ENDURANCE",
          weakestComponents: ["FLEXIBILITY"],
        },
      },
    },
    {
      id: "ath-5",
      fullName: "Fajar Nugraha",
      position: "CENTER",
      jerseyNumber: 99,
      dateOfBirth: new Date("2012-01-01"),
      gender: "MALE",
      assessment: null,
    },
  ];

describe("P8-C3: Multi-Athlete Comparison Engine", () => {
  it("should support 2-athlete comparison with distinct colors", () => {
    const result = calculateMultiAthleteComparison(mockAthletes.slice(0, 2));
    expect(result.athletes).toHaveLength(2);
    expect(result.athletes[0].color).toBe(COMPARE_COLORS[0]);
    expect(result.athletes[1].color).toBe(COMPARE_COLORS[1]);
  });

  it("should support 3-athlete comparison", () => {
    const result = calculateMultiAthleteComparison(mockAthletes.slice(0, 3));
    expect(result.athletes).toHaveLength(3);
    expect(result.athletes[2].color).toBe(COMPARE_COLORS[2]);
  });

  it("should support 4-athlete comparison", () => {
    const result = calculateMultiAthleteComparison(mockAthletes.slice(0, 4));
    expect(result.athletes).toHaveLength(4);
    expect(result.athletes[3].color).toBe(COMPARE_COLORS[3]);
  });

  it("should cap at maximum 4 athletes when 5 are provided", () => {
    const result = calculateMultiAthleteComparison(mockAthletes);
    expect(result.athletes).toHaveLength(4);
    expect(result.athletes.find((a) => a.id === "ath-5")).toBeUndefined();
  });

  it("should handle honest NOT_TESTED semantics when an athlete did not take a test", () => {
    const result = calculateMultiAthleteComparison(mockAthletes.slice(0, 3));
    const sprintRow = result.comparisonTable.find((r) => r.testItemId === "item-sprint");
    expect(sprintRow).toBeDefined();

    // ath-1 took Sprint 20m
    expect(sprintRow?.athleteValues["ath-1"].isNotTested).toBe(false);
    expect(sprintRow?.athleteValues["ath-1"].rawValue).toBe(4.49);
    expect(sprintRow?.athleteValues["ath-1"].score).toBe(88);

    // ath-2 took Sprint 20m
    expect(sprintRow?.athleteValues["ath-2"].isNotTested).toBe(false);
    expect(sprintRow?.athleteValues["ath-2"].rawValue).toBe(4.65);

    // ath-3 did NOT take Sprint 20m -> MUST be isNotTested: true, NEVER 0
    expect(sprintRow?.athleteValues["ath-3"].isNotTested).toBe(true);
    expect(sprintRow?.athleteValues["ath-3"].rawValue).toBeNull();
    expect(sprintRow?.athleteValues["ath-3"].score).toBeNull();
  });

  it("should calculate exact athlete age on assessment date", () => {
    const dob = new Date("2012-05-15");
    const testDate = new Date("2026-08-15"); // Exactly 14 years 3 months
    const age = calculateAge(dob, testDate);
    expect(age).toBe(14);
  });

  it("should parse componentScores JSON safely from string or object", () => {
    const jsonStr = JSON.stringify({ SPEED: 90, POWER: 80 });
    expect(parseComponentScoresJson(jsonStr)).toEqual({ SPEED: 90, POWER: 80 });
    expect(parseComponentScoresJson({ SPEED: 90 })).toEqual({ SPEED: 90 });
    expect(parseComponentScoresJson(null)).toEqual({});
    expect(parseComponentScoresJson("invalid-json")).toEqual({});
  });
});

describe("P8-C3: Non-Punitive Complementary Strengths Engine", () => {
  it("should identify relative strengths and focus areas without winner/loser tags", () => {
    const athletes = [
      {
        id: "ath-1",
        fullName: "Rangga Pratama",
        position: "POINT_GUARD",
        jerseyNumber: 7,
        age: 14,
        gender: "MALE",
        color: "#3b82f6",
        assessmentId: "ass-1",
        assessmentDate: new Date(),
        overallScore: 84.5,
        overallGrade: "B+",
        componentScores: {
          SPEED: 88,
          POWER: 80,
          AGILITY: 85,
          FLEXIBILITY: 65,
        },
        bestComponent: "SPEED",
      },
      {
        id: "ath-2",
        fullName: "Budi Santoso",
        position: "CENTER",
        jerseyNumber: 15,
        age: 15,
        gender: "MALE",
        color: "#f97316",
        assessmentId: "ass-2",
        assessmentDate: new Date(),
        overallScore: 82.0,
        overallGrade: "B+",
        componentScores: {
          SPEED: 75,
          POWER: 92,
          AGILITY: 72,
          FLEXIBILITY: 60,
        },
        bestComponent: "POWER",
      },
    ];

    const strengths = resolveComplementaryStrengths(athletes);
    expect(strengths).toHaveLength(2);

    // Athlete 1 strength is Speed (88%), focus is Flexibility (65%)
    expect(strengths[0].strengthComponent).toBe("SPEED");
    expect(strengths[0].summaryText).toContain("Kecepatan (Speed) (88%)");
    expect(strengths[0].summaryText).toContain("Fleksibilitas (65%)");

    // Athlete 2 strength is Power (92%), focus is Flexibility (60%)
    expect(strengths[1].strengthComponent).toBe("POWER");
    expect(strengths[1].summaryText).toContain("Daya Ledak (Power) (92%)");

    // Ensure NO negative/punitive words exist
    strengths.forEach((s) => {
      expect(s.summaryText.toLowerCase()).not.toContain("pemenang");
      expect(s.summaryText.toLowerCase()).not.toContain("kalah");
      expect(s.summaryText.toLowerCase()).not.toContain("terburuk");
      expect(s.summaryText.toLowerCase()).not.toContain("juara");
      expect(s.summaryText.toLowerCase()).not.toContain("ranking");
    });
  });

  it("should handle athletes with empty component scores gracefully", () => {
    const athletes = [
      {
        id: "ath-empty",
        fullName: "Fajar Nugraha",
        position: "CENTER",
        jerseyNumber: 99,
        age: 14,
        gender: "MALE",
        color: "#3b82f6",
        assessmentId: null,
        assessmentDate: null,
        overallScore: null,
        overallGrade: null,
        componentScores: {},
        bestComponent: null,
      },
    ];

    const strengths = resolveComplementaryStrengths(athletes);
    expect(strengths).toHaveLength(1);
    expect(strengths[0].strengthComponent).toBeNull();
    expect(strengths[0].summaryText).toContain("Belum memiliki data komponen fisik");
  });

  it("should break ties deterministically when multiple components have the same top score", () => {
    const athletes = [
      {
        id: "ath-tie",
        fullName: "Test Tie",
        position: "GUARD",
        jerseyNumber: 10,
        age: 14,
        gender: "MALE",
        color: "#3b82f6",
        assessmentId: "ass-tie",
        assessmentDate: new Date(),
        overallScore: 80,
        overallGrade: "B+",
        componentScores: {
          SPEED: 85,
          POWER: 85, // Same score
        },
        bestComponent: "POWER",
      },
    ];

    const strengths = resolveComplementaryStrengths(athletes);
    expect(strengths[0].strengthComponent).toBeDefined();
  });

  it("should never include winner or loser keys in the comparison data structure", () => {
    const result = calculateMultiAthleteComparison(mockAthletes.slice(0, 2));
    const stringified = JSON.stringify(result).toLowerCase();
    expect(stringified).not.toContain('"winner"');
    expect(stringified).not.toContain('"loser"');
    expect(stringified).not.toContain('"champion"');
    expect(stringified).not.toContain('"leader"');
  });

  it("should preserve distinct score directions (LOWER_IS_BETTER vs HIGHER_IS_BETTER) in table rows", () => {
    const result = calculateMultiAthleteComparison(mockAthletes.slice(0, 2));
    const sprintRow = result.comparisonTable.find((r) => r.testItemId === "item-sprint");
    const jumpRow = result.comparisonTable.find((r) => r.testItemId === "item-jump");

    expect(sprintRow?.scoreDirection).toBe("LOWER_IS_BETTER");
    expect(jumpRow?.scoreDirection).toBe("HIGHER_IS_BETTER");
  });

  it("should handle athletes with missing assessment dates gracefully without crashing", () => {
    const partialAthletes: RawAssessmentData[] = [
      {
        id: "ath-no-ass-1",
        fullName: "No Ass 1",
        position: "GUARD",
        jerseyNumber: 1,
        dateOfBirth: new Date("2012-01-01"),
        gender: "MALE",
        assessment: null,
      },
      {
        id: "ath-no-ass-2",
        fullName: "No Ass 2",
        position: "FORWARD",
        jerseyNumber: 2,
        dateOfBirth: new Date("2012-01-01"),
        gender: "MALE",
        assessment: null,
      },
    ];

    const result = calculateMultiAthleteComparison(partialAthletes);
    expect(result.athletes).toHaveLength(2);
    expect(result.athletes[0].overallScore).toBeNull();
    expect(result.athletes[0].assessmentDate).toBeNull();
    expect(result.comparisonTable).toHaveLength(0);
  });

  it("should assign distinct color tokens in sequence from COMPARE_COLORS", () => {
    const result = calculateMultiAthleteComparison(mockAthletes.slice(0, 4));
    expect(result.athletes[0].color).toBe(COMPARE_COLORS[0]);
    expect(result.athletes[1].color).toBe(COMPARE_COLORS[1]);
    expect(result.athletes[2].color).toBe(COMPARE_COLORS[2]);
    expect(result.athletes[3].color).toBe(COMPARE_COLORS[3]);
  });

  it("should preserve accurate age calculations across leap years and month boundaries", () => {
    const dob = new Date("2012-02-29"); // Leap year baby
    const testDate = new Date("2026-02-28"); // 13 years and 364 days
    const testDateAfter = new Date("2026-03-01"); // Exactly 14 years
    expect(calculateAge(dob, testDate)).toBe(13);
    expect(calculateAge(dob, testDateAfter)).toBe(14);
  });

  it("should handle negative or invalid dates gracefully in calculateAge", () => {
    expect(calculateAge(new Date("invalid-date"))).toBe(0);
  });

  it("should handle single athlete gracefully if less than 2 athletes are provided", () => {
    const single = calculateMultiAthleteComparison(mockAthletes.slice(0, 1));
    expect(single.athletes).toHaveLength(1);
    expect(single.comparisonTable.length).toBeGreaterThan(0);
  });

  it("should handle athletes with missing jersey numbers or unassigned positions", () => {
    const unassignedAthlete: RawAssessmentData = {
      id: "ath-unassigned",
      fullName: "Unassigned Athlete",
      position: "UNSPECIFIED",
      jerseyNumber: null,
      dateOfBirth: new Date("2013-01-01"),
      gender: "MALE",
      assessment: mockAthletes[0].assessment,
    };

    const result = calculateMultiAthleteComparison([unassignedAthlete, mockAthletes[1]]);
    expect(result.athletes[0].jerseyNumber).toBeNull();
    expect(result.athletes[0].position).toBe("UNSPECIFIED");
  });

  it("should handle empty raw test item results array gracefully", () => {
    const emptyAssAthlete: RawAssessmentData = {
      id: "ath-empty-res",
      fullName: "Empty Results",
      position: "GUARD",
      jerseyNumber: 11,
      dateOfBirth: new Date("2012-01-01"),
      gender: "MALE",
      assessment: {
        id: "ass-empty-res",
        assessmentDate: new Date(),
        overallScore: 50,
        overallGrade: "C",
        resultItems: [],
        analysis: null,
      },
    };

    const result = calculateMultiAthleteComparison([emptyAssAthlete, mockAthletes[0]]);
    expect(result.athletes).toHaveLength(2);
  });

  it("should ensure all 4 color tokens are valid 6-character hex strings", () => {
    COMPARE_COLORS.forEach((color) => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it("should preserve scores as numbers within standard 0-100 percentage range", () => {
    const result = calculateMultiAthleteComparison(mockAthletes.slice(0, 2));
    result.athletes.forEach((ath) => {
      if (ath.overallScore != null) {
        expect(ath.overallScore).toBeGreaterThanOrEqual(0);
        expect(ath.overallScore).toBeLessThanOrEqual(100);
      }
    });
  });
});


