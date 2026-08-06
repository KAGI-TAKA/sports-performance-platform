import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET minimal 32 karakter"),
  BETTER_AUTH_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Environment variable (server) tidak valid:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Environment variable server tidak valid — cek .env.local");
}

export const env = parsed.data;
