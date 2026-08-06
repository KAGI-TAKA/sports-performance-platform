import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "./prisma";
import { env } from "./env.server";
import { ac, admin, headCoach, assistantCoach } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // TODO: ganti console.log ini dengan pengiriman email asli begitu
    // provider email (mis. Resend) sudah diputuskan & disetup.
    sendResetPassword: async ({ user, url }) => {
      console.log(`[DEV] Link reset password untuk ${user.email}: ${url}`);
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
