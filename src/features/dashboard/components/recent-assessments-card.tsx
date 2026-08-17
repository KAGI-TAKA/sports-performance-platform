import Link from "next/link";
import { ClipboardList, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const gradeVariantMap: Record<string, "success" | "accent" | "warning" | "danger" | "outline"> = {
  A: "success",
  "B+": "success",
  B: "accent",
  "C+": "warning",
  C: "warning",
  D: "danger",
};

export function RecentAssessmentsCard({ assessments }: RecentAssessmentsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-semibold">Assessment Terbaru</CardTitle>
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
                className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition-colors"
              >
                + Assessment Baru
              </Link>
            }
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atlet</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Skor Akhir</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
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

                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2.5">
                        <Avatar fallback={initials} size="sm" alt={a.athlete.fullName} />
                        <div>
                          <span className="block text-xs font-semibold text-foreground">
                            {a.athlete.fullName}
                          </span>
                          {a.athlete.position && a.athlete.position !== "UNSPECIFIED" && (
                            <span className="block text-[10px] text-muted font-normal">
                              {a.athlete.position.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted tabular-nums font-mono">
                      {dateStr}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={a.status === "COMPLETED" ? "success" : "warning"}
                        className="text-[9.5px]"
                      >
                        {a.status === "COMPLETED" ? "Selesai" : "Draf"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center font-mono font-bold text-xs text-foreground tabular-nums">
                      {a.overallScore != null ? `${a.overallScore}%` : "—"}
                    </TableCell>

                    <TableCell className="text-center">
                      {a.overallGrade ? (
                        <Badge
                          variant={gradeVariantMap[a.overallGrade] ?? "outline"}
                          className="text-[10px] min-w-[2rem] justify-center"
                        >
                          {a.overallGrade}
                        </Badge>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link
                        href={`/assessments/${a.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-secondary hover:text-accent hover:bg-accent-bg transition-colors"
                      >
                        Detail
                        <ArrowUpRight className="h-3 w-3" />
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
