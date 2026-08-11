import { z } from "zod";

export const createSessionLogSchema = z.object({
  athleteId: z.string().min(1, "Atlet wajib dipilih"),
  sessionDate: z.string().min(1, "Tanggal latihan wajib diisi"),
  activitiesDone: z.string().min(2, "Aktivitas latihan wajib diisi"),
  coachFeedback: z.string().optional(),
  videoUrl: z.string().url("URL video tidak valid").or(z.literal("")).optional(),
  scheduleSessionId: z.string().optional(),
});

export const updateSessionLogSchema = createSessionLogSchema.extend({
  id: z.string().min(1),
});

export type CreateSessionLogInput = z.infer<typeof createSessionLogSchema>;
export type UpdateSessionLogInput = z.infer<typeof updateSessionLogSchema>;
