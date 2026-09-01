import { describe, it, expect } from "vitest";
import { MEMBER_ROLES, ROLE_LABELS, type MemberRole } from "@/lib/constants";
import { admin, headCoach, assistantCoach, parent, athlete } from "@/lib/permissions";

describe("Phase 4B-01: Role & Identity Foundation", () => {
  it("should define all 5 authoritative system roles", () => {
    expect(MEMBER_ROLES).toEqual([
      "admin",
      "head_coach",
      "assistant_coach",
      "parent",
      "athlete",
    ]);

    expect(ROLE_LABELS.admin).toBe("Admin / Owner");
    expect(ROLE_LABELS.head_coach).toBe("Head Coach");
    expect(ROLE_LABELS.assistant_coach).toBe("Assistant Coach");
    expect(ROLE_LABELS.parent).toBe("Orang Tua / Wali");
    expect(ROLE_LABELS.athlete).toBe("Atlet");
  });

  it("should enforce admin role capabilities (Coach Zulfi: admin + head_coach semantics)", () => {
    // Admin has full organizational and coaching permissions
    expect(admin.statements).toHaveProperty("organization");
    expect(admin.statements).toHaveProperty("member");
    expect(admin.statements).toHaveProperty("athlete");
    expect(admin.statements).toHaveProperty("assessment");
    expect(admin.statements).toHaveProperty("benchmark");
    expect(admin.statements).toHaveProperty("settings");
  });

  it("should enforce headCoach role boundaries", () => {
    expect(headCoach.statements).toHaveProperty("athlete");
    expect(headCoach.statements).toHaveProperty("assessment");
    expect(headCoach.statements).toHaveProperty("benchmark");
    // headCoach cannot delete organizations or alter critical billing settings
    expect(headCoach.statements).not.toHaveProperty("organization");
  });

  it("should enforce assistantCoach restricted boundaries", () => {
    expect(assistantCoach.statements).toHaveProperty("athlete");
    expect(assistantCoach.statements).toHaveProperty("assessment");
    // assistantCoach cannot manage members, invitations, benchmarks, or organization
    expect(assistantCoach.statements).not.toHaveProperty("member");
    expect(assistantCoach.statements).not.toHaveProperty("invitation");
    expect(assistantCoach.statements).not.toHaveProperty("benchmark");
    expect(assistantCoach.statements).not.toHaveProperty("organization");
  });

  it("should enforce parent and athlete access boundaries", () => {
    // Parent and Athlete cannot perform staff mutations
    expect(parent.statements.athlete).toEqual([]);
    expect(parent.statements.assessment).toEqual([]);
    expect(athlete.statements.athlete).toEqual([]);
    expect(athlete.statements.assessment).toEqual([]);
  });
});
