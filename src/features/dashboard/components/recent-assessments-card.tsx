import Link from "next/link";
import { ClipboardList, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { DashboardStats } from "../types";

interface RecentAssessmentsCardProps {
  assessments: DashboardStats["latestAssessments"];
}

const gradeColorMap: Record<string, string> = {
  A: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "B+": "text-emerald-700 bg-emerald-50 border-emerald-200",
  B: "text-indigo-700 bg-indigo-50 border-indigo-200",
  "C+": "text-amber-700 bg-amber-50 border-amber-200",
  C: "text-amber-700 bg-amber-50 border-amber-200",
  D: "text-rose-700 bg-rose-50 border-rose-200",
};

export function RecentAssessmentsCard({ assessments }: RecentAssessmentsCardProps) {
  return (
    <Card className="border border-border bg-surface-1 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-semibold text-foreground">Assessment Fisik Terbaru</CardTitle>
        </div>
        <Link
          href="/assessments"
          className="flex items-center gap-1 text-xs text-muted hover:text-accent font-medium transition-colors"
        >
          Lihat Semua
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {assessments.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum Ada Assessment"
            description="Lakukan pengujian fisik pertama atlet untuk mulai mengumpulkan data skor dan profil radar."
            action={
              <Link
                href="/assessments/new"
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition-colors shadow-2xs"
              >
                + Assessment Baru
              </Link>
            }
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted">Atlet</TableHead>
                <TableHead className="text-xs font-semibold text-muted">Tanggal Tes</TableHead>
                <TableHead className="text-xs font-semibold text-muted">Status</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted">Skor Fisik</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted">Grade</TableHead>
                <TableHead className="text-right text-xs font-semibold text-muted">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((a) => {
                const dateStr = new Date(a.assessmentDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                const initials = a.athlete.fullName
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                const isDraft = a.status === "DRAFT";
                const gradeClass = a.overallGrade ? gradeColorMap[a.overallGrade] : "text-muted bg-surface-2 border-border";

                return (
                  <TableRow key={a.id} className="border-border hover:bg-surface-2/40">
                    <TableCell className="font-semibold py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar fallback={initials} size="sm" alt={a.athlete.fullName} />
                        <div>
                          <span className="block text-xs font-semibold text-foreground">
                            {a.athlete.fullName}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted font-mono py-3">
                      {dateStr}
                    </TableCell>

                    <TableCell className="py-3">
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                          isDraft
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {isDraft ? "Draf" : "Selesai"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-mono font-bold text-xs text-foreground py-3">
                      {a.overallScore != null ? `${a.overallScore}%` : "—"}
                    </TableCell>

                    <TableCell className="text-center py-3">
                      {a.overallGrade ? (
                        <span className={`inline-flex items-center justify-center h-6 w-7 rounded font-mono font-bold text-xs border ${gradeClass}`}>
                          {a.overallGrade}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right py-3">
                      <Link
                        href={`/assessments/${a.id}`}
                        className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                      >
                        Lihat Rapor
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
