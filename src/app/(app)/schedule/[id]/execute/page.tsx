import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarX } from "lucide-react";
import { requireOrgContext } from "@/lib/auth-context";
import { toLocalDateStr } from "@/features/schedule/utils";
import { getSessionExecutionData } from "@/features/session-execution/queries";
import { listTestItems } from "@/features/assessments/queries";
import { SessionExecutionCockpit } from "@/features/session-execution/components/session-execution-cockpit";

interface SessionExecutionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Eksekusi Sesi Latihan • Coach Zulfi Platform",
  description: "Workspace lapangan untuk presensi, eksekusi checklist latihan, stopwatch, tes fisik, dan pencatatan sesi.",
};

export default async function SessionExecutionPage({ params }: SessionExecutionPageProps) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const [sessionData, rawTestItems] = await Promise.all([
    getSessionExecutionData(ctx.organizationId, id, ctx.memberId, ctx.role),
    listTestItems(ctx.organizationId),
  ]);

  if (!sessionData) {
    notFound();
  }

  // Section 7: PREVENT FUTURE SESSION EXECUTION FOR ASSISTANT COACH
  if (ctx.role === "assistant_coach" && !sessionData.isReadOnly) {
    const todayDateStr = toLocalDateStr(new Date());
    const sessionDateStr = toLocalDateStr(sessionData.startTime);

    // Block future sessions
    if (sessionDateStr > todayDateStr) {
      const formattedDate = new Date(sessionData.startTime).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      });

      return (
        <main className="min-h-screen bg-surface-base flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-surface-1 border border-border rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <CalendarX className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Akses Dibatasi · Assistant Coach
              </div>
              <h1 className="text-xl font-display font-bold text-foreground">
                Sesi Belum Dapat Dijalankan
              </h1>
              <p className="text-xs text-secondary leading-relaxed">
                Sesi ini dijadwalkan pada hari <strong className="text-foreground">{formattedDate}</strong>.
                Sesuai standar operasional lapangan, asisten pelatih hanya dapat memulai eksekusi sesi pada hari H pelaksanaan latihan.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold px-5 py-3 shadow-sm transition active:scale-95"
              >
                Kembali ke Agenda Jadwal
              </Link>
            </div>
          </div>
        </main>
      );
    }

    // Block overdue sessions (past date, still SCHEDULED — should request reschedule instead)
    if (sessionDateStr < todayDateStr) {
      const formattedDate = new Date(sessionData.startTime).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      });

      return (
        <main className="min-h-screen bg-surface-base flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-surface-1 border border-border rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <CalendarX className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Sesi Terlewat · Tidak Dapat Dieksekusi
              </div>
              <h1 className="text-xl font-display font-bold text-foreground">
                Sesi Sudah Melewati Jadwal
              </h1>
              <p className="text-xs text-secondary leading-relaxed">
                Sesi ini seharusnya dilaksanakan pada <strong className="text-foreground">{formattedDate}</strong>{" "}
                namun belum terlaksana. Ajukan permintaan reschedule kepada Head Coach melalui halaman jadwal.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold px-5 py-3 shadow-sm transition active:scale-95"
              >
                Kembali & Minta Reschedule
              </Link>
            </div>
          </div>
        </main>
      );
    }
  }

  const availableTestItems = rawTestItems.map((item) => ({
    id: item.id,
    name: item.name,
    unit: item.unit,
    physicalComponent: item.physicalComponent,
    scoreDirection: item.scoreDirection,
  }));

  return (
    <main className="min-h-screen bg-surface-base">
      <SessionExecutionCockpit
        initialData={sessionData}
        availableTestItems={availableTestItems}
        userRole={ctx.role}
      />
    </main>
  );
}
