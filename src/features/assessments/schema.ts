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
