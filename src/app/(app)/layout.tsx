import { headers } from "next/headers";
import { requireOrgContext } from "@/lib/auth-context";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoachShell } from "@/components/layout/coach-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireOrgContext();
  const session = await auth.api.getSession({ headers: await headers() });

  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { name: true },
  });

  return (
    <CoachShell
      userName={session?.user.name}
      userEmail={session?.user.email}
      orgName={org?.name}
    >
      {children}
    </CoachShell>
  );
}
