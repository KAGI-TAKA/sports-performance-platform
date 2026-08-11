import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { COMPONENT_LABELS, COMPONENT_ORDER } from "@/lib/constants";
import { BenchmarkEditForm } from "@/features/benchmarks/components/benchmark-edit-form";
import { TestItemCreateForm } from "@/features/benchmarks/components/test-item-create-form";
import { TestItemDeactivateButton } from "@/features/benchmarks/components/test-item-deactivate-button";
import { SlidersHorizontal, ArrowUp, ArrowDown } from "lucide-react";



export default async function BenchmarksPage() {
  const ctx = await requireOrgContext();
  // assistant_coach tidak memiliki izin benchmark:update
  const canEdit = ctx.role !== "assistant_coach";

  const testItems = await prisma.testItem.findMany({
    where: { organizationId: ctx.organizationId, isActive: true },
    include: { benchmarks: true },
    orderBy: { order: "asc" },
  });

  // Group by component
  const grouped: Record<string, typeof testItems> = {};
  for (const item of testItems) {
    const comp = item.physicalComponent;
    if (!grouped[comp]) grouped[comp] = [];
    grouped[comp].push(item);
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
          Benchmark &amp; Item Tes
        </h1>
        <p className="mt-1 text-sm text-muted">
          Nilai acuan standar per item tes. Klik <strong>Edit</strong> untuk mengubah threshold grade A/B/C/D.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center text-xs text-muted">
        <span className="font-medium text-secondary">Grade:</span>
        {[
          { label: "A — Sangat Baik", color: "bg-emerald-500/10 text-emerald-400" },
          { label: "B — Baik", color: "bg-blue-500/10 text-blue-400" },
          { label: "C — Cukup", color: "bg-amber-500/10 text-amber-400" },
          { label: "D — Kurang", color: "bg-red-500/10 text-red-400" },
        ].map((g) => (
          <span key={g.label} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${g.color}`}>
            {g.label}
          </span>
        ))}
        <span className="ml-2 text-muted/60">|</span>
        <span className="flex items-center gap-1">
          <ArrowUp className="h-3 w-3 text-success" /> nilai lebih tinggi = lebih baik
        </span>
        <span className="flex items-center gap-1">
          <ArrowDown className="h-3 w-3 text-danger" /> nilai lebih rendah = lebih baik
        </span>
      </div>

      {testItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-1 p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 mx-auto">
            <SlidersHorizontal className="h-6 w-6 text-muted" />
          </div>
          <p className="text-sm font-medium text-foreground">Belum ada item tes</p>
          <p className="text-xs text-muted max-w-xs mx-auto">
            Item tes dan benchmark default dibuat otomatis saat onboarding. Hubungi admin jika halaman ini kosong.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {COMPONENT_ORDER.filter((c) => grouped[c]).map((comp) => (
            <div key={comp} className="rounded-xl border border-border bg-surface-1 overflow-hidden">
              {/* Component Header */}
              <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-surface-2/40">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  {COMPONENT_LABELS[comp] ?? comp}
                </h2>
                <span className="ml-auto text-xs text-muted">
                  {grouped[comp].length} item tes
                </span>
              </div>

              {/* Items Table */}
              <div className="divide-y divide-border">
                {grouped[comp].map((item) => {
                  const bm = item.benchmarks[0];
                  return (
                    <div key={item.id} className="px-5 py-4 grid grid-cols-[1fr_auto] gap-4 items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                          <span className="text-[10px] font-mono text-muted bg-surface-2 rounded px-1.5 py-0.5 uppercase">
                            {item.unit}
                          </span>
                          {item.testType === "QUALITATIVE" && (
                            <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5">
                              Rubrik Teknik
                            </span>
                          )}
                          {item.scoreDirection === "HIGHER_IS_BETTER" ? (
                            <span className="flex items-center gap-0.5 text-[10px] text-success">
                              <ArrowUp className="h-2.5 w-2.5" /> tinggi lebih baik
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-[10px] text-danger">
                              <ArrowDown className="h-2.5 w-2.5" /> rendah lebih baik
                            </span>
                          )}
                          {canEdit && <TestItemDeactivateButton testItemId={item.id} itemName={item.name} />}
                        </div>
                      </div>

                      {bm ? (
                        <BenchmarkEditForm
                          benchmarkId={bm.id}
                          thresholdA={Number(bm.thresholdA)}
                          thresholdB={Number(bm.thresholdB)}
                          thresholdC={Number(bm.thresholdC)}
                          thresholdD={Number(bm.thresholdD)}
                          scoreDirection={item.scoreDirection as "HIGHER_IS_BETTER" | "LOWER_IS_BETTER"}
                          canEdit={canEdit}
                        />
                      ) : (
                        <span className="text-xs text-muted">Belum ada benchmark</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <TestItemCreateForm physicalComponent={comp} canCreate={canEdit} />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted text-center pb-4">
        Sumber norma: topendsports.com &amp; matassessment.com
      </p>
    </div>
  );
}
