import { z } from "zod";

export const athletePositionEnum = z.enum([
  "POINT_GUARD",
  "SHOOTING_GUARD",
  "SMALL_FORWARD",
  "POWER_FORWARD",
  "CENTER",
  "UNSPECIFIED",
]);
export const genderEnum = z.enum(["MALE", "FEMALE"]);

export const createAthleteSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  jerseyNumber: z.coerce.number().int().min(0).max(99).optional(),
  sportCategory: z.string().optional(),
  position: athletePositionEnum.default("UNSPECIFIED"),
  gender: genderEnum,
  dateOfBirth: z.coerce.date(),
  heightCm: z.coerce.number().positive().optional(),
  weightKg: z.coerce.number().positive().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  allergies: z.string().optional(),
  healthNotes: z.string().optional(),
  competitionLevel: z.string().optional(),
});
export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;

export const updateAthleteSchema = createAthleteSchema.partial().extend({
  id: z.string(),
});
export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;

export const createInjurySchema = z.object({
  athleteId: z.string(),
  injuryType: z.string().min(2, "Jenis cedera minimal 2 karakter"),
  description: z.string().optional(),
  injuryDate: z.coerce.date(),
  recoveredAt: z.coerce.date().optional(),
  severity: z.enum(["RINGAN", "SEDANG", "BERAT"]).optional(),
});
export type CreateInjuryInput = z.infer<typeof createInjurySchema>;
