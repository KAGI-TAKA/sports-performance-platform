import { z } from "zod";

export const createAthleteGoalSchema = z.object({
  athleteId: z.string().min(1, "ID atlet wajib diisi"),
  testItemId: z.string().min(1, "Parameter uji fisik wajib dipilih"),
  targetValue: z.number({
    error: "Nilai target harus berupa angka yang valid",
  }).positive("Nilai target harus bernilai positif"),
  baselineValue: z.number().positive("Nilai baseline harus bernilai positif").optional(),
  title: z
    .string()
    .max(100, "Judul target maksimal 100 karakter")
    .optional()
    .nullable(),
  targetDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Format tanggal target tidak valid"
    ),
  notes: z
    .string()
    .max(500, "Catatan target maksimal 500 karakter")
    .optional()
    .nullable(),
});

export type CreateAthleteGoalInput = z.infer<typeof createAthleteGoalSchema>;

export const updateAthleteGoalSchema = z.object({
  goalId: z.string().min(1, "ID target wajib diisi"),
  title: z
    .string()
    .max(100, "Judul target maksimal 100 karakter")
    .optional()
    .nullable(),
  targetValue: z
    .number({
      error: "Nilai target harus berupa angka yang valid",
    })
    .positive("Nilai target harus bernilai positif")
    .optional(),
  targetDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Format tanggal target tidak valid"
    ),
  notes: z
    .string()
    .max(500, "Catatan target maksimal 500 karakter")
    .optional()
    .nullable(),
});

export type UpdateAthleteGoalInput = z.infer<typeof updateAthleteGoalSchema>;
