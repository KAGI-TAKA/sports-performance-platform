import { z } from "zod";

export const attendanceStatusEnum = z.enum([
  "UNMARKED",
  "PRESENT",
  "LATE",
  "EXCUSED",
  "ABSENT",
  "RESCHEDULED",
]);

export const markAttendanceSchema = z.object({
  sessionId: z.string().trim().min(1, "ID sesi wajib diisi"),
  athleteId: z.string().trim().min(1, "ID atlet wajib diisi"),
  status: attendanceStatusEnum,
  notes: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter")
    .optional()
    .nullable(),
});

export const batchMarkAttendanceSchema = z.object({
  sessionId: z.string().trim().min(1, "ID sesi wajib diisi"),
  items: z
    .array(
      z.object({
        athleteId: z.string().trim().min(1, "ID atlet wajib diisi"),
        status: attendanceStatusEnum,
        notes: z
          .string()
          .trim()
          .max(500, "Catatan maksimal 500 karakter")
          .optional()
          .nullable(),
      })
    )
    .min(1, "Daftar presensi minimal berisi 1 atlet"),
});

export const resetAttendanceSchema = z.object({
  sessionId: z.string().trim().min(1, "ID sesi wajib diisi"),
  athleteId: z.string().trim().min(1, "ID atlet wajib diisi"),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type BatchMarkAttendanceInput = z.infer<typeof batchMarkAttendanceSchema>;
export type ResetAttendanceInput = z.infer<typeof resetAttendanceSchema>;
