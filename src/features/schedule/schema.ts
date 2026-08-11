import { z } from "zod";

export const scheduleStatusEnum = z.enum([
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const createScheduleSchema = z.object({
  title: z.string().min(2, "Judul sesi minimal 2 karakter"),
  startTime: z.string().min(1, "Waktu mulai wajib diisi"),
  endTime: z.string().min(1, "Waktu selesai wajib diisi"),
  coachId: z.string().min(1, "Pelatih wajib dipilih"),
  athleteIds: z.array(z.string()).min(1, "Pilih minimal 1 atlet"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const updateScheduleSchema = createScheduleSchema.extend({
  status: scheduleStatusEnum.optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
