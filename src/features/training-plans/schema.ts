import { z } from "zod";

export const createTrainingPlanSchema = z.object({
  title: z.string().min(2, "Judul program minimal 2 karakter"),
  description: z.string().optional(),
  athleteId: z.string().optional(), // Nullable for template plans
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateTrainingPlanSchema = createTrainingPlanSchema.extend({
  isActive: z.boolean().optional(),
});

export const createTrainingExerciseSchema = z.object({
  name: z.string().min(2, "Nama gerakan latihan minimal 2 karakter"),
  category: z.string().optional(), // Plyometrics, Core, Strength, Agility, Flexibility, etc.
  sets: z.coerce.number().int().min(1, "Jumlah set minimal 1").optional(),
  reps: z.string().optional(), // Misal "10 reps" atau "30 detik"
  restSeconds: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export type CreateTrainingPlanInput = z.infer<typeof createTrainingPlanSchema>;
export type UpdateTrainingPlanInput = z.infer<typeof updateTrainingPlanSchema>;
export type CreateTrainingExerciseInput = z.infer<typeof createTrainingExerciseSchema>;
