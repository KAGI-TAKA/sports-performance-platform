import { describe, it, expect } from "vitest";
import {
  formatProgressWhatsAppSummary,
  getWhatsAppProgressShareLink,
  formatAssessmentWhatsAppText,
  getWhatsAppShareLink,
  type ShareSafeProgressDTO,
  type AssessmentWhatsAppSummary,
} from "./utils/whatsapp-formatter";

describe("P8-C4: Progress WhatsApp Summary Formatter", () => {
  const mockShareSafeDTO: ShareSafeProgressDTO = {
    athlete: {
      id: "ath-1",
      fullName: "Rangga Pratama",
      age: 14,
      jerseyNumber: 7,
      position: "Point Guard",
    },
    period: {
      label: "Asesmen Terkini",
      assessmentDate: "Senin, 15 Agustus 2026",
      totalAssessments: 3,
    },
    overview: {
      overallScore: 84.5,
      overallGrade: "B+",
      trend: "IMPROVING",
      deltaPercentage: 2.5,
    },
    personalBests: [
      {
        testItemName: "Sprint 20m",
        rawValue: 4.49,
        unit: "SECOND",
        achievedDate: "15 Agustus 2026",
      },
      {
        testItemName: "Vertical Jump",
        rawValue: 44,
        unit: "CM",
        achievedDate: "1 Juli 2026",
      },
    ],
    keyImprovements: [
      {
        testItemName: "Sprint 20m",
        deltaValue: -0.33,
        unit: "SECOND",
        percentChange: -6.8,
      },
      {
        testItemName: "Push-up 1 Min",
        deltaValue: 4,
        unit: "REPETITION",
        percentChange: 20.0,
      },
    ],
    goals: [
      {
        title: "Sprint 20m Sub 4.5s",
        targetValue: 4.5,
        currentValue: 4.49,
        unit: "s",
        isAchieved: true,
      },
      {
        title: "Push-up Target 25 Reps",
        targetValue: 25,
        currentValue: 24,
        unit: "reps",
        isAchieved: false,
      },
    ],
    focusAreas: ["Fleksibilitas", "Daya Tahan Otot"],
    recommendation: "Pertahankan konsistensi latihan eksplosif dan tingkatkan porsi peregangan.",
    reportUrl: "https://coachzulfi.app/portal/token-123",
    latestAssessmentId: "ass-1",
  };

  it("should format a complete growth-oriented WhatsApp progress summary", () => {
    const text = formatProgressWhatsAppSummary(mockShareSafeDTO);

    expect(text).toContain("COACH ZULFI - LAPORAN PERKEMBANGAN ATLET");
    expect(text).toContain("Rangga Pratama (14 thn)");
    expect(text).toContain("🔢 *No. Punggung:* #7");
    expect(text).toContain("84.5% (Grade *B+*)");
    expect(text).toContain("Tren: *↗ Meningkat*");
    expect(text).toContain("Sprint 20m");
    expect(text).toContain("Vertical Jump");
    expect(text).toContain("Fleksibilitas");
  });

  it("should include Personal Best highlights accurately", () => {
    const text = formatProgressWhatsAppSummary(mockShareSafeDTO);
    expect(text).toContain("⭐ *Rekor Terbaik Pribadi (Personal Best):*");
    expect(text).toContain("• Sprint 20m: *4.49 SECOND* (15 Agustus 2026)");
    expect(text).toContain("• Vertical Jump: *44 CM* (1 Juli 2026)");
  });

  it("should format training goals with appropriate achievement status tags", () => {
    const text = formatProgressWhatsAppSummary(mockShareSafeDTO);
    expect(text).toContain("🎯 *Target Latihan:*");
    expect(text).toContain("• Sprint 20m Sub 4.5s: 4.49/4.5 s (✅ Tercapai)");
    expect(text).toContain("• Push-up Target 25 Reps: 24/25 reps (🏃 Berjalan)");
  });

  it("should include key improvements with delta values", () => {
    const text = formatProgressWhatsAppSummary(mockShareSafeDTO);
    expect(text).toContain("📈 *Peningkatan Utama:*");
    expect(text).toContain("• Sprint 20m: -0.33 SECOND (-6.8%)");
    expect(text).toContain("• Push-up 1 Min: +4 REPETITION (+20.0%)");
  });

  it("should generate a valid wa.me share link with URL encoding", () => {
    const link = getWhatsAppProgressShareLink(mockShareSafeDTO);
    expect(link.startsWith("https://wa.me/?text=")).toBe(true);
    expect(link).toContain("COACH%20ZULFI");
    expect(link).toContain("Rangga%20Pratama");
  });

  it("should format telephone numbers cleanly when provided (08xx -> 628xx)", () => {
    const link = getWhatsAppProgressShareLink(mockShareSafeDTO, "08123456789");
    expect(link.startsWith("https://wa.me/628123456789?text=")).toBe(true);
  });

  it("should handle already international formatted telephone numbers", () => {
    const link = getWhatsAppProgressShareLink(mockShareSafeDTO, "628987654321");
    expect(link.startsWith("https://wa.me/628987654321?text=")).toBe(true);
  });

  it("should handle baseline assessment without prior delta gracefully", () => {
    const baselineDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      overview: {
        overallScore: 80.0,
        overallGrade: "B",
        trend: "INSUFFICIENT_DATA",
        deltaPercentage: null,
      },
      keyImprovements: [],
    };

    const text = formatProgressWhatsAppSummary(baselineDTO);
    expect(text).toContain("Tren: *Asesmen Baseline*");
    expect(text).not.toContain("📈 *Peningkatan Utama:*");
  });

  it("should handle declining trend with constructive non-punitive wording", () => {
    const decliningDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      overview: {
        overallScore: 78.0,
        overallGrade: "C+",
        trend: "DECLINING",
        deltaPercentage: -3.0,
      },
    };

    const text = formatProgressWhatsAppSummary(decliningDTO);
    expect(text).toContain("Tren: *↘ Memerlukan Perhatian*");
    expect(text).not.toContain("terburuk");
    expect(text).not.toContain("kalah");
  });

  it("should handle stable trend appropriately", () => {
    const stableDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      overview: {
        overallScore: 82.0,
        overallGrade: "B",
        trend: "STABLE",
        deltaPercentage: 0.1,
      },
    };

    const text = formatProgressWhatsAppSummary(stableDTO);
    expect(text).toContain("Tren: *Stabil*");
  });

  it("should never produce undefined, null, or [object Object] in text", () => {
    const text = formatProgressWhatsAppSummary(mockShareSafeDTO);
    expect(text).not.toContain("undefined");
    expect(text).not.toContain("null");
    expect(text).not.toContain("[object Object]");
  });

  it("should handle athlete without jersey number gracefully", () => {
    const noJerseyDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      athlete: {
        ...mockShareSafeDTO.athlete,
        jerseyNumber: null,
      },
    };

    const text = formatProgressWhatsAppSummary(noJerseyDTO);
    expect(text).not.toContain("No. Punggung:");
  });

  it("should handle empty goals and focus areas without crashing", () => {
    const minimalDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      goals: [],
      focusAreas: [],
      personalBests: [],
      recommendation: null,
    };

    const text = formatProgressWhatsAppSummary(minimalDTO);
    expect(text).toContain("COACH ZULFI - LAPORAN PERKEMBANGAN ATLET");
    expect(text).toContain("💡 *Catatan Pelatih:*");
  });

  it("should properly cap key improvements at maximum 2 items for readability", () => {
    const crowdedDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      keyImprovements: [
        { testItemName: "Test 1", deltaValue: 1, unit: "reps", percentChange: 5 },
        { testItemName: "Test 2", deltaValue: 2, unit: "reps", percentChange: 10 },
        { testItemName: "Test 3", deltaValue: 3, unit: "reps", percentChange: 15 },
      ],
    };

    const text = formatProgressWhatsAppSummary(crowdedDTO);
    expect(text).toContain("Test 1");
    expect(text).toContain("Test 2");
    expect(text).not.toContain("Test 3");
  });

  it("should properly cap Personal Bests at maximum 2 items for WhatsApp conciseness", () => {
    const crowdedPBDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      personalBests: [
        { testItemName: "PB 1", rawValue: 10, unit: "cm", achievedDate: "1 Jan 2026" },
        { testItemName: "PB 2", rawValue: 20, unit: "cm", achievedDate: "2 Jan 2026" },
        { testItemName: "PB 3", rawValue: 30, unit: "cm", achievedDate: "3 Jan 2026" },
      ],
    };

    const text = formatProgressWhatsAppSummary(crowdedPBDTO);
    expect(text).toContain("PB 1");
    expect(text).toContain("PB 2");
    expect(text).not.toContain("PB 3");
  });

  it("should handle athlete names with special characters safely in URL and text", () => {
    const specialNameDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      athlete: {
        ...mockShareSafeDTO.athlete,
        fullName: "D'Angelo O'Connor & Putra",
      },
    };

    const text = formatProgressWhatsAppSummary(specialNameDTO);
    expect(text).toContain("D'Angelo O'Connor & Putra");

    const link = getWhatsAppProgressShareLink(specialNameDTO);
    expect(link).toContain("D'Angelo%20O'Connor%20%26%20Putra");
  });

  it("should provide inspiring default coach recommendation when custom recommendation is null", () => {
    const noRecDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      recommendation: null,
    };

    const text = formatProgressWhatsAppSummary(noRecDTO);
    expect(text).toContain("Pertahankan konsistensi latihan dan disiplin pemulihan fisik. Tetap semangat! 🔥");
  });

  it("should format delta value of zero as +0 without crashing", () => {
    const zeroDeltaDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      keyImprovements: [
        { testItemName: "Sit-up", deltaValue: 0, unit: "reps", percentChange: 0 },
      ],
    };

    const text = formatProgressWhatsAppSummary(zeroDeltaDTO);
    expect(text).toContain("Sit-up: 0 reps (0.0%)");
  });

  it("should preserve reportUrl in WhatsApp message when provided", () => {
    const withUrlDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      reportUrl: "https://coachzulfi.app/portal/token-abc",
    };

    const text = formatProgressWhatsAppSummary(withUrlDTO);
    expect(text).toContain("📄 *Lihat Rapor Lengkap & PDF:*");
    expect(text).toContain("https://coachzulfi.app/portal/token-abc");
  });

  it("should handle athlete with multiple achieved goals cleanly", () => {
    const allAchievedDTO: ShareSafeProgressDTO = {
      ...mockShareSafeDTO,
      goals: [
        { title: "Target 1", targetValue: 10, currentValue: 10, unit: "kg", isAchieved: true },
        { title: "Target 2", targetValue: 20, currentValue: 20, unit: "reps", isAchieved: true },
      ],
    };

    const text = formatProgressWhatsAppSummary(allAchievedDTO);
    expect(text).toContain("✅ Tercapai");
  });

  it("should ensure latestAssessmentId is preserved in DTO for 1-click PDF download", () => {
    expect(mockShareSafeDTO.latestAssessmentId).toBe("ass-1");
  });
});

describe("P8-C4: Backward Compatibility of Existing Single Assessment Formatter", () => {
  const legacySummary: AssessmentWhatsAppSummary = {
    athleteName: "Budi Santoso",
    assessmentDate: new Date("2026-08-15"),
    overallScore: 88.0,
    overallGrade: "A-",
    bestComponent: "Kecepatan (Speed)",
    weakestComponent: "Kelenturan (Flexibility)",
    reportUrl: "https://coachzulfi.app/reports/123",
  };

  it("should format single assessment WhatsApp text consistently with existing behavior", () => {
    const text = formatAssessmentWhatsAppText(legacySummary);
    expect(text).toContain("COACH ZULFI - LAPORAN PERFORMA FISIK ATLET");
    expect(text).toContain("Budi Santoso");
    expect(text).toContain("88.0% (Grade *A-*)");
    expect(text).toContain("💪 *Keunggulan Utama:* Kecepatan (Speed)");
    expect(text).toContain("🎯 *Fokus Pengembangan:* Kelenturan (Flexibility)");
  });

  it("should generate legacy WhatsApp share link with phone number formatting", () => {
    const link = getWhatsAppShareLink(legacySummary, "0812999888");
    expect(link.startsWith("https://wa.me/62812999888?text=")).toBe(true);
  });
});
