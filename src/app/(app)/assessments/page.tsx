import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { listAssessments, ASSESSMENTS_PER_PAGE } from "@/features/assessments/queries";
import { calculateAgeAtDate } from "@/features/assessments/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { scoreToGrade } from "@/lib/constants";
import { ClipboardCheck, Plus, ChevronRight, Activity } from "lucide-react";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const GRADE_BADGE_VARIANTS: Record<string, "success" | "accent" | "warning" | "danger"> = {
  A: "success",
  "B+": "accent",
  B: "accent",
  "C+": "warning",
  C: "warning",
  D: "danger",
};

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const ctx = await requireOrgContext();

  const { assessments, total } = await listAssessments(ctx.organizationId, {
    search: q,
    page,
  });

  const totalPages = Math.ceil(total / ASSESSMENTS_PER_PAGE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
            Riwayat &amp; Assessment Fisik
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {q
              ? `${total} hasil assessment ditemukan`
              : `${total} total catatan assessment fisik tersimpan`}
          </p>
        </div>

        <Link href="/assessments/new">
          <Button size="sm" className="bg-accent hover:bg-accent/90 text-white font-semibold gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            Assessment Baru
          </Button>
        </Link>
      </div>

      {/* Assessment Table / List Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Daftar Catatan Evaluasi Performa Fisik
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {assessments.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Belum Ada Record Assessment"
              description={
                q
                  ? `Tidak ada assessment yang cocok dengan kata kunci "${q}".`
                  : "Organisasi Anda belum memiliki catatan hasil tes fisik atlet."
              }
              action={
                <Link href="/assessments/new">
                  <Button size="sm" className="bg-accent text-white gap-1.5">
                    <Plus className="h-4 w-4" /> Buat Assessment Pertama
                  </Button>
                </Link>
              }
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atlet</TableHead>
                    <TableHead>Tanggal Tes</TableHead>
                    <TableHead>Komponen Utama</TableHead>
                    <TableHead className="text-right">Skor Keseluruhan</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((item) => {
                    const overallScoreNum = item.overallScore ? Number(item.overallScore) : 0;
                    const grade = item.overallGrade || scoreToGrade(overallScoreNum);
                    const bestComp = item.analysis?.bestComponent;

                    return (
                      <TableRow key={item.id} className="hover:bg-surface-2/40 transition-colors">
                        <TableCell className="font-semibold text-xs text-foreground">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-[11px]">
                              {item.athlete.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <Link
                                href={`/athletes/${item.athlete.id}`}
                                className="hover:text-accent transition-colors font-bold"
                              >
                                {item.athlete.fullName}
                              </Link>
                              <div className="text-[11px] text-muted font-normal flex items-center gap-1 mt-0.5">
                                <span>{item.athlete.gender === "MALE" ? "👦 Putra" : "👧 Putri"}</span>
                                <span>·</span>
                                <span>{calculateAgeAtDate(item.athlete.dateOfBirth)} Thn</span>
                                {item.athlete.sportCategory && (
                                  <>
                                    <span>·</span>
                                    <span className="text-accent">{item.athlete.sportCategory}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted font-mono">
                          {formatDate(item.assessmentDate)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {bestComp ? (
                            <Badge variant="accent" className="text-[10px]">
                              {bestComp.replace(/_/g, " ")}
                            </Badge>
                          ) : (
                            <span className="text-muted text-[11px]">7 Komponen Standard</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-extrabold text-sm text-foreground">
                          {overallScoreNum}%
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={GRADE_BADGE_VARIANTS[grade] ?? "accent"}
                            className="text-xs px-2.5 py-0.5 font-bold font-mono"
                          >
                            {grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/assessments/${item.id}`}>
                            <Button variant="outline" size="xs" className="gap-1 text-xs">
                              Detail <ChevronRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            path="/assessments"
            baseParams={{ q }}
          />
        </div>
      )}
    </div>
  );
}
