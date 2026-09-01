import { BarChart2, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { AssessmentRadarChart } from "@/features/assessments/components/radar-chart";
import { COMPONENT_LABELS } from "@/lib/constants";
import type { DashboardStats } from "../types";

interface SquadProfileCardProps {
  scores: DashboardStats["squadComponentScores"];
}

export function SquadProfileCard({ scores }: SquadProfileCardProps) {
  let weakestComps: Array<{ key: string; score: number }> = [];
  let bestComp: { key: string; score: number } | null = null;

  if (scores) {
    const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    if (sorted.length > 0) {
      weakestComps = sorted.slice(0, 2).map(([key, score]) => ({ key, score }));
      const best = sorted[sorted.length - 1];
      bestComp = { key: best[0], score: best[1] };
    }
  }

  const formatCompLabel = (key: string) =>
    COMPONENT_LABELS[key] ??
    key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-semibold">Profil Komponen Fisik Atlet Binaan</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex-1">
        {scores && bestComp ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Component Breakdown Bars */}
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                  Perlu Perhatian Peningkatan
                </div>
                <div className="space-y-2.5">
                  {weakestComps.map((comp) => (
                    <div key={comp.key} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground">
                          {formatCompLabel(comp.key)}
                        </span>
                        <span className="font-mono font-bold text-danger">
                          {comp.score}%
                        </span>
                      </div>
                      <Progress value={comp.score} variant="danger" className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                  Komponen Terkuat
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground">
                      {formatCompLabel(bestComp.key)}
                    </span>
                    <span className="font-mono font-bold text-success">
                      {bestComp.score}%
                    </span>
                  </div>
                  <Progress value={bestComp.score} variant="success" className="h-2" />
                </div>
              </div>
            </div>

            {/* Right: Radar Chart Visualization */}
            <div className="flex flex-col items-center justify-center min-h-[220px]">
              <AssessmentRadarChart componentScores={scores} />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={BarChart2}
            title="Belum Ada Evaluasi Komponen"
            description="Profil komponen gerak dan kualitas fisik atlet binaan akan terbentuk secara otomatis setelah asesmen pertama disimpan."
            className="border-0 bg-transparent py-10"
          />
        )}
      </CardContent>
    </Card>
  );
}
