import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { CoachShell } from "@/components/layout/coach-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireOrgContext();

  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { name: true },
  });

  return (
    <CoachShell
      userName={ctx.userName}
      userEmail={ctx.userEmail}
      orgName={org?.name}
      role={ctx.role}
    >
      {children}
    </CoachShell>
  );
}
