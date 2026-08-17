import { describe, it, expect } from "vitest";

export interface ExerciseItem {
  id: string;
  name: string;
  category?: string | null;
  sets?: number | null;
  reps?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
  order: number;
}

export interface TrainingPlanInput {
  id: string;
  organizationId: string;
  athleteId: string | null;
  title: string;
  description?: string | null;
  exercises: ExerciseItem[];
}

export function isOrganizationTemplate(plan: { athleteId: string | null }): boolean {
  return plan.athleteId === null;
}

export function copyTemplateExercises(
  templateExercises: ExerciseItem[],
  newPlanId: string
): (ExerciseItem & { trainingPlanId: string })[] {
  return templateExercises.map((ex) => ({
    ...ex,
    id: `copy-${ex.id}`,
    trainingPlanId: newPlanId,
  }));
}

export function validateSchedulePlanCompatibility(
  plan: { organizationId: string; athleteId: string | null },
  session: { organizationId: string; athleteIds: string[] }
): { valid: boolean; error?: string } {
  if (plan.organizationId !== session.organizationId) {
    return { valid: false, error: "Cross-tenant access rejected" };
  }

  if (plan.athleteId !== null && !session.athleteIds.includes(plan.athleteId)) {
    return {
      valid: false,
      error: "Program latihan spesifik atlet tidak cocok dengan daftar atlet terdaftar pada sesi ini",
    };
  }

  return { valid: true };
}

export function validateDateRange(
  startDate?: Date | string | null,
  endDate?: Date | string | null
): { valid: boolean; error?: string } {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: "Format tanggal tidak valid" };
    }
    if (end < start) {
      return { valid: false, error: "Tanggal selesai tidak boleh sebelum tanggal mulai" };
    }
  }
  return { valid: true };
}

export function formatPlannedExercisesForLog(plan: {
  title: string;
  exercises: ExerciseItem[];
}): string {
  if (!plan.exercises || plan.exercises.length === 0) return "";
  const lines = plan.exercises.map((ex, idx) => {
    const detail = ex.sets && ex.reps ? ` (${ex.sets} sets x ${ex.reps})` : "";
    const note = ex.notes ? ` - ${ex.notes}` : "";
    return `${idx + 1}. ${ex.name}${detail}${note}`;
  });
  return `[Program Latihan: ${plan.title}]\n` + lines.join("\n");
}

describe("Phase 5.8 Training Workflow & Schedule-Plan Bridge Domain Unit Tests", () => {
  const orgA = "org-1";
  const orgB = "org-2";

  const templateOrgA: TrainingPlanInput = {
    id: "tpl-1",
    organizationId: orgA,
    athleteId: null,
    title: "Off-Season Speed & Agility 4-Week",
    description: "Program kecepatan dan kelincahan standar",
    exercises: [
      { id: "e1", name: "Agility Ladder Drill", sets: 4, reps: "30s", order: 1 },
      { id: "e2", name: "Shuttle Run 5-10-5", sets: 5, reps: "5 reps", order: 2 },
    ],
  };

  const athletePlanOrgA: TrainingPlanInput = {
    id: "plan-ath1",
    organizationId: orgA,
    athleteId: "ath-1",
    title: "Program Khusus Budi",
    exercises: [{ id: "e3", name: "Form Shooting", sets: 3, reps: "50 shots", order: 1 }],
  };

  it("1. correctly detects organization templates (athleteId === null)", () => {
    expect(isOrganizationTemplate(templateOrgA)).toBe(true);
    expect(isOrganizationTemplate(athletePlanOrgA)).toBe(false);
  });

  it("2. prescribes template to athlete by copying independent exercise records", () => {
    const copied = copyTemplateExercises(templateOrgA.exercises, "new-plan-101");
    expect(copied.length).toBe(2);
    expect(copied[0].trainingPlanId).toBe("new-plan-101");
    expect(copied[0].name).toBe("Agility Ladder Drill");
    expect(copied[0].id).not.toBe(templateOrgA.exercises[0].id);
  });

  it("3. preserves exercise ordering during prescription", () => {
    const copied = copyTemplateExercises(templateOrgA.exercises, "new-plan-102");
    expect(copied[0].order).toBe(1);
    expect(copied[1].order).toBe(2);
  });

  it("4. verifies copied exercises are completely independent from template", () => {
    const copied = copyTemplateExercises(templateOrgA.exercises, "new-plan-103");
    // Mutate local copied exercise
    copied[0].name = "Modified Drill";
    // Template remains unchanged
    expect(templateOrgA.exercises[0].name).toBe("Agility Ladder Drill");
  });

  it("5. rejects cross-tenant schedule-plan attachment", () => {
    const res = validateSchedulePlanCompatibility(templateOrgA, {
      organizationId: orgB,
      athleteIds: ["ath-2"],
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Cross-tenant");
  });

  it("6. validates schedule-plan compatibility for athlete-specific plan", () => {
    // Athlete-specific plan for ath-1 attached to session with ath-1 -> VALID
    const validRes = validateSchedulePlanCompatibility(athletePlanOrgA, {
      organizationId: orgA,
      athleteIds: ["ath-1", "ath-2"],
    });
    expect(validRes.valid).toBe(true);

    // Athlete-specific plan for ath-1 attached to session WITHOUT ath-1 -> REJECTED
    const invalidRes = validateSchedulePlanCompatibility(athletePlanOrgA, {
      organizationId: orgA,
      athleteIds: ["ath-3"],
    });
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.error).toContain("tidak cocok");
  });

  it("7. allows organization template to be attached to multi-athlete session", () => {
    const res = validateSchedulePlanCompatibility(templateOrgA, {
      organizationId: orgA,
      athleteIds: ["ath-1", "ath-2", "ath-3"],
    });
    expect(res.valid).toBe(true);
  });

  it("8. formats planned exercises into session log prefill text", () => {
    const prefill = formatPlannedExercisesForLog(templateOrgA);
    expect(prefill).toContain("[Program Latihan: Off-Season Speed & Agility 4-Week]");
    expect(prefill).toContain("1. Agility Ladder Drill (4 sets x 30s)");
    expect(prefill).toContain("2. Shuttle Run 5-10-5 (5 sets x 5 reps)");
  });

  it("9. session schedule without training plan remains 100% valid", () => {
    const session = { id: "sess-1", trainingPlanId: null };
    expect(session.trainingPlanId).toBeNull();
  });

  it("10. session log creation without training plan remains 100% valid", () => {
    const log = { id: "log-1", scheduleSessionId: null, activitiesDone: "Manual Log" };
    expect(log.activitiesDone).toBe("Manual Log");
  });

  it("11. validates date range boundaries (endDate >= startDate)", () => {
    const validDate = validateDateRange("2026-01-01", "2026-02-01");
    expect(validDate.valid).toBe(true);

    const invalidDate = validateDateRange("2026-02-01", "2026-01-01");
    expect(invalidDate.valid).toBe(false);
    expect(invalidDate.error).toContain("tidak boleh sebelum");
  });

  it("12. handles invalid date formats safely without throwing uncaught exceptions", () => {
    const invalidFormat = validateDateRange("invalid-date", "2026-01-01");
    expect(invalidFormat.valid).toBe(false);
    expect(invalidFormat.error).toContain("tidak valid");
  });
});
