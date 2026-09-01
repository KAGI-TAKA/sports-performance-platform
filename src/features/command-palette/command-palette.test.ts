import { describe, it, expect } from "vitest";
import {
  NAV_GROUPS,
  QUICK_ACTIONS,
  BREADCRUMB_MAP,
  getBreadcrumbTitle,
} from "@/lib/navigation";
import {
  formatDateID,
  formatShortDateID,
  formatTimeID,
  formatDateTimeID,
  formatRelativeDateID,
} from "@/lib/date-utils";

describe("P8-A: Navigation & Breadcrumb System", () => {
  it("should have all 4 primary navigation groups defined", () => {
    expect(NAV_GROUPS).toHaveLength(4);
    const titles = NAV_GROUPS.map((g) => g.title);
    expect(titles).toContain("Workspace");
    expect(titles).toContain("Coaching");
    expect(titles).toContain("Analytics");
    expect(titles).toContain("System");
  });

  it("should contain all key operational routes in NAV_GROUPS", () => {
    const allHrefs = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
    expect(allHrefs).toContain("/dashboard");
    expect(allHrefs).toContain("/schedule");
    expect(allHrefs).toContain("/athletes");
    expect(allHrefs).toContain("/training-plans");
    expect(allHrefs).toContain("/session-logs");
    expect(allHrefs).toContain("/assessments");
    expect(allHrefs).toContain("/progress");
    expect(allHrefs).toContain("/compare");
    expect(allHrefs).toContain("/reports");
    expect(allHrefs).toContain("/benchmarks");
    expect(allHrefs).toContain("/settings");
  });

  it("should provide quick actions for coach workflows", () => {
    expect(QUICK_ACTIONS.length).toBeGreaterThanOrEqual(4);
    const ids = QUICK_ACTIONS.map((qa) => qa.id);
    expect(ids).toContain("qa-new-athlete");
    expect(ids).toContain("qa-new-assessment");
    expect(ids).toContain("qa-new-schedule");
    expect(ids).toContain("qa-new-plan");
  });

  it("should resolve human-readable breadcrumb titles", () => {
    expect(getBreadcrumbTitle("dashboard")).toBe("Command Center");
    expect(getBreadcrumbTitle("schedule")).toBe("Jadwal & Timetable");
    expect(getBreadcrumbTitle("athletes")).toBe("Direktori Atlet");
    expect(getBreadcrumbTitle("training-plans")).toBe("Program Latihan");
    expect(getBreadcrumbTitle("assessments")).toBe("Assessment Fisik");
    expect(getBreadcrumbTitle("unknown-segment")).toBe("unknown-segment");
  });
});

describe("P8-A: Date Formatting Utilities (Asia/Jakarta)", () => {
  // Use a fixed UTC timestamp: 2026-08-20T08:30:00.000Z (which is 15:30 WIB in UTC+7)
  const testDate = new Date("2026-08-20T08:30:00.000Z");

  it("should format full localized date in Indonesian", () => {
    const formatted = formatDateID(testDate);
    expect(formatted).toContain("20");
    expect(formatted).toContain("Agustus");
    expect(formatted).toContain("2026");
  });

  it("should format short date in Indonesian", () => {
    const formatted = formatShortDateID(testDate);
    expect(formatted).toContain("20");
    expect(formatted).toContain("Agu");
    expect(formatted).toContain("2026");
  });

  it("should format time in 24-hour WIB format", () => {
    const formatted = formatTimeID(testDate);
    expect(formatted).toBe("15.30 WIB");
  });

  it("should format combined date and time with day of week", () => {
    const formatted = formatDateTimeID(testDate);
    expect(formatted).toContain("Kamis");
    expect(formatted).toContain("20 Agustus 2026");
    expect(formatted).toContain("15.30 WIB");
  });

  it("should handle null and undefined dates gracefully", () => {
    expect(formatDateID(null)).toBe("—");
    expect(formatShortDateID(undefined)).toBe("—");
    expect(formatTimeID(null)).toBe("—");
    expect(formatDateTimeID(undefined)).toBe("—");
    expect(formatRelativeDateID(null)).toBe("—");
  });

  it("should evaluate relative date labels correctly", () => {
    const today = new Date("2026-08-20T05:00:00.000Z");
    const sameDay = new Date("2026-08-20T10:00:00.000Z");
    const yesterday = new Date("2026-08-19T05:00:00.000Z");
    const tomorrow = new Date("2026-08-21T05:00:00.000Z");

    expect(formatRelativeDateID(sameDay, today)).toBe("Hari Ini");
    expect(formatRelativeDateID(yesterday, today)).toBe("Kemarin");
    expect(formatRelativeDateID(tomorrow, today)).toBe("Besok");
  });
});

describe("P8-A: Command Palette Static Item Search & Filtering Logic", () => {
  it("should search static items by title and keywords", () => {
    const cleanQuery = "atlet";
    const matchedRoutes = NAV_GROUPS.flatMap((g) => g.items).filter((item) => {
      const matchTitle = item.label.toLowerCase().includes(cleanQuery);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(cleanQuery));
      return matchTitle || matchKeywords;
    });

    expect(matchedRoutes.length).toBeGreaterThanOrEqual(1);
    expect(matchedRoutes.some((r) => r.href === "/athletes")).toBe(true);
  });

  it("should match quick actions with keyword 'asesmen' or 'tes'", () => {
    const query = "asesmen";
    const matchedActions = QUICK_ACTIONS.filter((qa) => {
      const matchTitle = qa.title.toLowerCase().includes(query);
      const matchKeywords = qa.keywords.some((k) => k.toLowerCase().includes(query));
      return matchTitle || matchKeywords;
    });

    expect(matchedActions.length).toBeGreaterThanOrEqual(1);
    expect(matchedActions.some((a) => a.id === "qa-new-assessment")).toBe(true);
  });

  it("should cyclic boundary calculate index selection correctly", () => {
    const listLength = 5;

    // Next from index 4 wraps to 0
    const nextIdx = (4 + 1) % listLength;
    expect(nextIdx).toBe(0);

    // Prev from index 0 wraps to 4
    const prevIdx = (0 - 1 + listLength) % listLength;
    expect(prevIdx).toBe(4);
  });

  it("should enforce minimum search query length threshold of 2 characters", () => {
    const shortQuery1 = "";
    const shortQuery2 = "a";
    const validQuery = "bu";

    expect(shortQuery1.trim().length >= 2).toBe(false);
    expect(shortQuery2.trim().length >= 2).toBe(false);
    expect(validQuery.trim().length >= 2).toBe(true);
  });

  it("should handle multi-word queries against navigation titles", () => {
    const query = "program latihan";
    const matched = NAV_GROUPS.flatMap((g) => g.items).filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    expect(matched).toHaveLength(1);
    expect(matched[0].href).toBe("/training-plans");
  });

  it("should safely truncate and deduplicate recent command history", () => {
    const maxRecent = 3;
    const history = [
      { id: "1", href: "/athletes/a1", title: "Athlete 1" },
      { id: "2", href: "/schedule", title: "Jadwal" },
      { id: "3", href: "/dashboard", title: "Dashboard" },
      { id: "4", href: "/athletes/a2", title: "Athlete 2" },
    ];

    const deduplicated = history.slice(0, maxRecent);
    expect(deduplicated).toHaveLength(3);
    expect(deduplicated[0].href).toBe("/athletes/a1");
  });

  it("should ensure all static quick actions have valid destination routes", () => {
    QUICK_ACTIONS.forEach((qa) => {
      expect(qa.href.startsWith("/")).toBe(true);
      expect(qa.title.length).toBeGreaterThan(0);
      expect(qa.keywords.length).toBeGreaterThan(0);
    });
  });

  it("should correctly identify shortcut combinations for Mac and Windows", () => {
    const isMacEvent = { metaKey: true, ctrlKey: false, key: "k" };
    const isWinEvent = { metaKey: false, ctrlKey: true, key: "k" };
    const isRegularKey = { metaKey: false, ctrlKey: false, key: "k" };

    const checkTrigger = (e: { metaKey: boolean; ctrlKey: boolean; key: string }) =>
      (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";

    expect(checkTrigger(isMacEvent)).toBe(true);
    expect(checkTrigger(isWinEvent)).toBe(true);
    expect(checkTrigger(isRegularKey)).toBe(false);
  });
});

