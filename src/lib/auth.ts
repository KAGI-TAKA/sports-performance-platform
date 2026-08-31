import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "./prisma";
import { env } from "./env.server";
import { sendPasswordResetEmail } from "./email";
import { ac, admin, headCoach, assistantCoach } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  rateLimit: {
    enabled: true,
    window: 60, // 60 detik default window
    max: 100, // 100 requests default limit
    customRules: {
      "/sign-in/email": {
        window: 300, // 5 menit
        max: 5, // 5 failed attempts limit
      },
      "/forget-password": {
        window: 900, // 15 menit
        max: 3, // 3 requests limit
      },
      "/request-password-reset": {
        window: 900, // 15 menit
        max: 3, // 3 requests limit
      },
      "/reset-password": {
        window: 900, // 15 menit
        max: 5, // 5 attempts limit
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        resetUrl: url,
        expiresInMinutes: 60,
      });
    },
  },

  plugins: [
    organization({
      creatorRole: "admin", // pembuat organisasi langsung jadi admin, bukan "owner"
      ac,
      roles: {
        admin,
        head_coach: headCoach,
        assistant_coach: assistantCoach,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
