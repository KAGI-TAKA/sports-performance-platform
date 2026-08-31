import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { clientEnv } from "./env.client";
import { ac, admin, headCoach, assistantCoach } from "./permissions";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : clientEnv.NEXT_PUBLIC_APP_URL,
  plugins: [
    organizationClient({
      ac,
      roles: {
        admin,
        head_coach: headCoach,
        assistant_coach: assistantCoach,
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
export const organization = authClient.organization;
