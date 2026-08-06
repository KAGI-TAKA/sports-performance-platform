import { headers } from "next/headers";
import { requireOrgContext } from "@/lib/auth-context";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

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
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <AppHeader
          userName={session?.user.name}
          userEmail={session?.user.email}
          orgName={org?.name}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
