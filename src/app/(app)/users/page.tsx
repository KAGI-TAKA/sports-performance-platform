import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getDefaultRouteForRole } from "@/lib/access-policy";
import { listOrganizationUsers } from "@/features/user-management/actions";
import { getAssistantPerformanceList } from "@/features/assistant-performance/queries";
import { UserManagementPanel } from "@/features/user-management/components/user-management-panel";

export const metadata = {
  title: "Manajemen Pengguna & Supervisi Tim | Platform Performa Olahraga",
  description: "Kelola akun, hak akses, peran pelatih, orang tua, atlet, dan evaluasi mutu supervisi tim.",
};

export default async function UsersPage() {
  const ctx = await requireOrgContext();

  // Route protection: Only Admin/Owner can access User Management
  if (ctx.role !== "admin") {
    redirect(getDefaultRouteForRole(ctx.role));
  }

  const [userList, athletes, perfData] = await Promise.all([
    listOrganizationUsers(),
    prisma.athlete.findMany({
      where: { organizationId: ctx.organizationId, isActive: true },
      select: { id: true, fullName: true, sportCategory: true },
      orderBy: { fullName: "asc" },
    }),
    getAssistantPerformanceList({ timeRange: "30d" }),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <UserManagementPanel
        users={userList}
        athletes={athletes}
        isAdmin={true}
        perfData={{
          role: perfData.role,
          isSupervisory: perfData.isSupervisory,
          assistants: perfData.assistants,
          unreviewedFeedbackCount: perfData.unreviewedFeedbackCount,
        }}
      />
    </div>
  );
}
