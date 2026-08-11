import type { PhysicalComponent } from "@prisma/client";

export const PHYSICAL_COMPONENTS: {
  value: PhysicalComponent;
  label: string;
  order: number;
  color: string; // hex, sinkron dengan design tokens Phase 2 §2.5
}[] = [
  { value: "FLEXIBILITY", label: "Fleksibilitas", order: 1, color: "#7F77DD" },
  { value: "SPEED", label: "Kecepatan", order: 2, color: "#378ADD" },
  { value: "POWER", label: "Power", order: 3, color: "#FF6B35" },
  { value: "AGILITY", label: "Kelincahan", order: 4, color: "#1D9E75" },
  { value: "MUSCULAR_ENDURANCE", label: "Daya Tahan Otot", order: 5, color: "#D4537E" },
  { value: "ANAEROBIC_ENDURANCE", label: "Daya Tahan Anaerobik", order: 6, color: "#D85A30" },
  { value: "AEROBIC_ENDURANCE", label: "Daya Tahan Aerobik", order: 7, color: "#639922" },
];

// Ambang skor 0-100 → grade huruf. Dipakai di rule engine (Phase AI Analysis)
// dan di mana pun grade perlu ditampilkan dari angka mentah.
export const GRADE_THRESHOLDS = [
  { min: 90, grade: "A" },
  { min: 80, grade: "B+" },
  { min: 70, grade: "B" },
  { min: 60, grade: "C+" },
  { min: 50, grade: "C" },
  { min: 0, grade: "D" },
] as const;

export function scoreToGrade(score: number): string {
  const match = GRADE_THRESHOLDS.find((t) => score >= t.min);
  return match?.grade ?? "D";
}

// Role coach di dalam satu organisasi (String di skema Better Auth, divalidasi di sini)
export const MEMBER_ROLES = ["admin", "head_coach", "assistant_coach"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

// ─── Satu sumber kebenaran untuk label & urutan komponen fisik ───────────────
// Semua halaman (benchmarks, report, engine) HARUS import dari sini — jangan
// redefinisi lokal.
export const COMPONENT_LABELS: Record<string, string> = Object.fromEntries(
  PHYSICAL_COMPONENTS.map((c) => [c.value, c.label])
);

export const COMPONENT_ORDER: string[] = PHYSICAL_COMPONENTS.map((c) => c.value);