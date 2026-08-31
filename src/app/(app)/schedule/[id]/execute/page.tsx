import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth-context";
import { getSessionExecutionData } from "@/features/session-execution/queries";
import { SessionExecutionCockpit } from "@/features/session-execution/components/session-execution-cockpit";

interface SessionExecutionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Eksekusi Sesi Latihan ? Coach Zulfi Platform",
  description: "Workspace lapangan untuk presensi, eksekusi checklist latihan, dan pencatatan sesi.",
};

export default async function SessionExecutionPage({ params }: SessionExecutionPageProps) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const sessionData = await getSessionExecutionData(
    ctx.organizationId,
    id,
    ctx.memberId,
    ctx.role
  );

  if (!sessionData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-surface-base">
      <SessionExecutionCockpit initialData={sessionData} />
    </main>
  );
}
