import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./prisma";

export const requireOrgContext = cache(async function requireOrgContext() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) redirect("/login");

  let organizationId = session.session.activeOrganizationId;

  if (!organizationId) {
    const firstMember = await prisma.member.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: { organizationId: true },
    });

    if (!firstMember) {
      redirect("/onboarding/organization");
    }

    organizationId = firstMember.organizationId;

    try {
      await auth.api.setActiveOrganization({
        headers: reqHeaders,
        body: { organizationId },
      });
    } catch (err) {
      console.error("Gagal auto-set active organization:", err);
    }
  }

  // Optimized indexed direct lookup by compound key (organizationId, userId)
  const dbMember = await prisma.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: organizationId,
        userId: session.user.id,
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!dbMember) {
    redirect("/onboarding/organization");
  }

  return {
    userId: session.user.id,
    organizationId,
    memberId: dbMember.id,
    role: dbMember.role,
    userName: session.user.name,
    userEmail: session.user.email,
  };
});
