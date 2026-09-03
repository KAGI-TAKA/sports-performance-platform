import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { CoachShell } from "@/components/layout/coach-shell";
import { isRouteAllowedForRole, getDefaultRouteForRole } from "@/lib/access-policy";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireOrgContext();

  // Server-side route authorization check against x-pathname injected by proxy
  const headersList = await headers();
  const currentPath = headersList.get("x-pathname");
  if (currentPath && !isRouteAllowedForRole(ctx.role, currentPath)) {
    redirect(getDefaultRouteForRole(ctx.role));
  }

  const [org, user] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { name: true, image: true },
    }),
  ]);

  return (
    <CoachShell
      userName={user?.name ?? ctx.userName}
      userEmail={ctx.userEmail}
      userImage={user?.image}
      orgName={org?.name}
      role={ctx.role}
    >
      {children}
    </CoachShell>
  );
}
