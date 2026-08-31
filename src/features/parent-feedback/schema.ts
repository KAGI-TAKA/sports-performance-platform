import { z } from "zod";

export const ratingFieldSchema = z
  .number({
    message: "Rating harus berupa angka 1 sampai 5",
  })
  .int("Rating harus berupa bilangan bulat")
  .min(1, "Rating minimal bernilai 1")
  .max(5, "Rating maksimal bernilai 5");

export const submitParentFeedbackSchema = z.object({
  token: z.string().trim().min(1, "Token portal wajib disertakan").max(256),
  scheduleSessionId: z.string().trim().min(1, "ID sesi jadwal wajib disertakan"),
  sessionRating: ratingFieldSchema,
  communicationRating: ratingFieldSchema,
  athleteAttentionRating: ratingFieldSchema,
  comment: z
    .string()
    .trim()
    .max(1000, "Ulasan maksimal 1000 karakter")
    .optional()
    .nullable(),
});

export const reviewParentFeedbackSchema = z.object({
  feedbackId: z.string().trim().min(1, "ID feedback wajib disertakan"),
  isReviewed: z.boolean().default(true),
  headCoachNotes: z
    .string()
    .trim()
    .max(1000, "Catatan Head Coach maksimal 1000 karakter")
    .optional()
    .nullable(),
});

export type SubmitParentFeedbackInput = z.infer<typeof submitParentFeedbackSchema>;
export type ReviewParentFeedbackInput = z.infer<typeof reviewParentFeedbackSchema>;
