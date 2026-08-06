import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

export default async function ProgressPage() {
  const ctx = await requireOrgContext();
  const athletes = await prisma.athlete.findMany({
    where: { organizationId: ctx.organizationId, isActive: true },
    include: {
      assessments: {
        orderBy: { assessmentDate: "desc" },
      },
    },
  });

  return (
    <div className="p-7 space-y-6">
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">
          Timeline & Grafik Progress Perkembangan Atlet
        </h1>
        <p className="mt-0.5 text-xs text-muted">
          Pantau perkembangan skor fisik atlet dari waktu ke waktu antar sesi tes berkala.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {athletes.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-surface-1 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {a.fullName}
                </h3>
                <p className="text-xs text-muted">
                  {a.position.replace("_", " ")} · {a.assessments.length} Assessment
                </p>
              </div>
              <Link
                href={`/athletes?athleteId=${a.id}`}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Detail Progress →
              </Link>
            </div>

            {a.assessments.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-border">
                {a.assessments.map((ass) => (
                  <div key={ass.id} className="flex justify-between text-xs bg-surface-2 p-2 rounded">
                    <span className="text-muted">
                      {new Date(ass.assessmentDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      Skor {ass.overallScore?.toString() ?? "—"}% (Grade {ass.overallGrade || "—"})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted py-2">Belum ada riwayat assessment.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
