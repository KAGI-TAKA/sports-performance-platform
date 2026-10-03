import { describe, it, expect } from "vitest";
import { getHelpArticleForPath } from "./matcher";
import { DEFAULT_FALLBACK_HELP, HELP_REGISTRY } from "./registry";

describe("getHelpArticleForPath() Contextual Route Matcher", () => {
  it("should match exact root dashboard route", () => {
    const article = getHelpArticleForPath("/dashboard");
    expect(article.id).toBe("dashboard");
    expect(article.title).toContain("Dashboard");
  });

  it("should match exact /users route", () => {
    const article = getHelpArticleForPath("/users");
    expect(article.id).toBe("users");
    expect(article.title).toContain("Manajemen Pengguna");
  });

  it("should match exact /benchmarks route", () => {
    const article = getHelpArticleForPath("/benchmarks");
    expect(article.id).toBe("benchmarks");
    expect(article.title).toContain("Benchmark");
  });

  it("should match exact /assessments route", () => {
    const article = getHelpArticleForPath("/assessments");
    expect(article.id).toBe("assessments");
    expect(article.title).toContain("Riwayat Asesmen");
  });

  it("should match /assessments/new even with query parameters", () => {
    const article = getHelpArticleForPath("/assessments/new?athleteId=ath-1&mode=squad");
    expect(article.id).toBe("assessments-new");
    expect(article.title).toContain("Pelaksanaan Asesmen Baru");
  });

  it("should match dynamic /assessments/[id] for assessment details", () => {
    const article1 = getHelpArticleForPath("/assessments/cltest12345");
    expect(article1.id).toBe("assessment-detail");
    expect(article1.title).toContain("Detail Hasil");

    const article2 = getHelpArticleForPath("/assessments/xyz-999?tab=analysis");
    expect(article2.id).toBe("assessment-detail");
  });

  it("should match /reports, /progress, and /compare routes", () => {
    expect(getHelpArticleForPath("/reports").id).toBe("reports");
    expect(getHelpArticleForPath("/progress?athleteId=123").id).toBe("progress");
    expect(getHelpArticleForPath("/compare?mode=historical").id).toBe("compare");
  });

  it("should return default fallback article for unmapped routes", () => {
    const article = getHelpArticleForPath("/non-existent-page");
    expect(article.id).toBe(DEFAULT_FALLBACK_HELP.id);
    expect(article.title).toBe(DEFAULT_FALLBACK_HELP.title);
  });

  it("should handle empty or malformed strings gracefully", () => {
    expect(getHelpArticleForPath("").id).toBe(DEFAULT_FALLBACK_HELP.id);
    expect(getHelpArticleForPath("/").id).toBe(DEFAULT_FALLBACK_HELP.id);
  });
});
