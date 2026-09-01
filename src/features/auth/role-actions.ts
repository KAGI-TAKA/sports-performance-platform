"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultRouteForRole } from "@/lib/access-policy";

/**
 * Resolves the role-specific post-login destination URL for the authenticated user.
 */
export async function getPostAuthRedirectUrl(): Promise<{ success: boolean; redirectUrl: string }> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session || !session.user) {
      return { success: false, redirectUrl: "/login" };
    }

    const userId = session.user.id;
    let organizationId = session.session.activeOrganizationId;

    let member = await prisma.member.findFirst({
      where: {
        userId,
        ...(organizationId ? { organizationId } : {}),
      },
      select: { role: true, organizationId: true },
    });

    if (!member) {
      // Find any organization member
      member = await prisma.member.findFirst({
        where: { userId },
        select: { role: true, organizationId: true },
      });
    }

    if (!member) {
      return { success: true, redirectUrl: "/onboarding/organization" };
    }

    const defaultRoute = getDefaultRouteForRole(member.role);
    return { success: true, redirectUrl: defaultRoute };
  } catch (err) {
    console.error("Error resolving post-auth redirect:", err);
    return { success: false, redirectUrl: "/dashboard" };
  }
}
