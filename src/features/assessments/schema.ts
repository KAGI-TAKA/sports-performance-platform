import { z } from "zod";
import { PhysicalComponent } from "@prisma/client";

export const physicalComponentEnum = z.nativeEnum(PhysicalComponent);

export const createAssessmentResultItemSchema = z.object({
  testItemId: z.string(),
  rawValue: z.coerce.number(),
});

export const createAssessmentSchema = z.object({
  athleteId: z.string().min(1, "Atlet wajib dipilih"),
  assessmentDate: z.coerce.date().default(() => new Date()),
  assessmentType: z.enum(["PROGRESS_BASED", "BENCHMARK_BASED"]).optional(),
  results: z.array(createAssessmentResultItemSchema).min(1, "Minimal 1 hasil tes harus diisi"),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;

export const squadAssessmentEntrySchema = z.object({
  athleteId: z.string().min(1, "ID Atlet wajib ada"),
  rawValue: z.coerce
    .number()
    .positive("Nilai tes harus angka positif")
    .max(9999.99, "Nilai tes melebihi batas wajar"),
  notes: z.string().optional(),
});

export const batchSquadAssessmentSchema = z.object({
  testItemId: z.string().min(1, "Item tes wajib dipilih"),
  assessmentDate: z.coerce.date().default(() => new Date()),
  assessmentType: z.enum(["PROGRESS_BASED", "BENCHMARK_BASED"]).default("BENCHMARK_BASED"),
  entries: z
    .array(squadAssessmentEntrySchema)
    .min(1, "Minimal 1 atlet harus dinilai")
    .max(30, "Maksimal 30 atlet dalam satu batch penilaian"),
});

export type BatchSquadAssessmentInput = z.infer<typeof batchSquadAssessmentSchema>;

