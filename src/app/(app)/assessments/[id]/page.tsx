import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { getAssessmentById, getPreviousAssessment } from "@/features/assessments/queries";
import { AssessmentRadarChart } from "@/features/assessments/components/radar-chart";
import { AssessmentQuickGoalButton } from "@/features/athlete-goals/components/assessment-quick-goal-button";
import { canMemberManageGoals } from "@/features/athlete-goals/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { scoreToGrade } from "@/lib/constants";
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Bot,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Target,
} from "lucide-react";

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

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const [assessment, activeGoals] = await Promise.all([
    getAssessmentById(ctx.organizationId, id),
    prisma.athleteGoal.findMany({
      where: {
        organizationId: ctx.organizationId,
        status: "ACTIVE",
      },
      select: { athleteId: true, testItemId: true },
    }),
  ]);

  if (!assessment) notFound();

  const prevAssessment = await getPreviousAssessment(
    ctx.organizationId,
    assessment.athleteId,
    assessment.assessmentDate
  );

  const activeGoalsSet = new Set(
    activeGoals
      .filter((g) => g.athleteId === assessment.athleteId)
      .map((g) => g.testItemId)
  );
  const canManage = canMemberManageGoals(ctx.role);

  const currentScore = Number(assessment.overallScore ?? 0);
  const prevScore = prevAssessment ? Number(prevAssessment.overallScore ?? 0) : null;
  const scoreDelta = prevScore != null ? currentScore - prevScore : null;

  // Parse componentScores JSON from analysis safely
  let componentScores: Record<string, number> = {};
  if (assessment.analysis?.componentScores) {
    try {
      componentScores =
        typeof assessment.analysis.componentScores === "string"
          ? JSON.parse(assessment.analysis.componentScores)
          : (assessment.analysis.componentScores as Record<string, number>);
    } catch {
      componentScores = {};
    }
  }

  const bestComponent = assessment.analysis?.bestComponent;
  const weakestComponents = assessment.analysis?.weakestComponents ?? [];
  const grade = assessment.overallGrade || scoreToGrade(currentScore);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Top Header & Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link href="/assessments">
            <Button variant="outline" size="xs" className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                Hasil Assessment Fisik — {assessment.athlete.fullName}
              </h1>
              <Badge variant="accent" className="font-mono text-xs">
                Grade {grade}
              </Badge>
              {assessment.assessmentType === "PROGRESS_BASED" ? (
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  🌱 Mode Progress / Baseline
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                  🏆 Mode Benchmark
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {assessment.athlete.sportCategory ?? "Atletik"} · {assessment.athlete.gender === "MALE" ? "👦 Putra" : "👧 Putri"} · Tanggal Tes: {formatDate(assessment.assessmentDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/api/assessments/${assessment.id}/pdf`} target="_blank">
            <Button size="xs" className="bg-accent hover:bg-accent/90 text-white font-semibold gap-1.5 shadow-sm">
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Button>
          </Link>
          <Link href={`/athletes/${assessment.athleteId}`}>
            <Button variant="outline" size="xs" className="gap-1">
              Profil Atlet <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Score */}
        <Card className="border-accent/30 bg-accent-bg/30">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider block">
              Skor Assessment Keseluruhan
            </span>
            <div className="font-display text-3xl font-bold text-foreground font-mono mt-1">
              {currentScore}%
            </div>
            <p className="text-[11px] text-muted mt-1">Agregat 7 komponen fisik standar</p>
          </CardContent>
        </Card>

        {/* Overall Grade */}
        <Card className="border-success/30 bg-success-bg/30">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-success uppercase tracking-wider block">
              Predikat Performance
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-display text-3xl font-bold text-foreground font-mono">
                Grade {grade}
              </span>
              <Badge variant={GRADE_BADGE_VARIANTS[grade] ?? "accent"} className="text-sm px-2.5 py-0.5">
                {grade}
              </Badge>
            </div>
            <p className="text-[11px] text-muted mt-1">Ambang batas acuan nasional U-12/U-18</p>
          </CardContent>
        </Card>

        {/* Previous Assessment Comparison */}
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
              Progres vs Assessment Lalu
            </span>
            {scoreDelta != null ? (
              <div className="flex items-center gap-2 mt-1">
                {scoreDelta >= 0 ? (
                  <div className="flex items-center gap-1 text-success font-bold text-lg font-mono">
                    <TrendingUp className="h-5 w-5" />
                    +{scoreDelta} poin
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-danger font-bold text-lg font-mono">
                    <TrendingDown className="h-5 w-5" />
                    {scoreDelta} poin
                  </div>
                )}
                <span className="text-xs text-muted">
                  ({scoreDelta >= 0 ? "Peningkatan" : "Penurunan"})
                </span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-foreground mt-2">
                Assessment Pertama (Baseline)
              </div>
            )}
            <p className="text-[11px] text-muted mt-1">
              {prevAssessment
                ? `Dibandingkan tes tanggal ${formatDate(prevAssessment.assessmentDate)}`
                : "Belum ada tes sebelumnya sebagai pembanding"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: 7-Component Radar Chart & Best/Weakest Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              Radar Chart 7 Komponen Fisik
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <AssessmentRadarChart componentScores={componentScores} />
          </CardContent>
        </Card>

        {/* Highlights Side Panel */}
        <div className="space-y-4">
          <Card className="border-success/30 bg-success-bg/20">
            <CardContent className="p-5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-success uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                Komponen Fisik Terbaik
              </div>
              <div className="font-display text-base font-bold text-foreground capitalize">
                {bestComponent ? bestComponent.replace(/_/g, " ").toLowerCase() : "—"}
              </div>
              <p className="text-xs text-muted">
                Performa fisik paling menonjol pada tes ini.
              </p>
            </CardContent>
          </Card>

          <Card className="border-warning/30 bg-warning-bg/20">
            <CardContent className="p-5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-warning uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                Fokus Penguatan (Weakest)
              </div>
              <div className="font-display text-base font-bold text-foreground capitalize">
                {weakestComponents.length > 0
                  ? weakestComponents.map((w) => w.replace(/_/g, " ").toLowerCase()).join(", ")
                  : "—"}
              </div>
              <p className="text-xs text-muted">
                Dibutuhkan latihan terprogram untuk meningkatkan komponen ini.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rule-Engine Automated Insight & Recommendation Box */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent" />
            Insight &amp; Rekomendasi Program Latihan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          <div className="p-4 rounded-xl bg-surface-2/60 border border-border/40 text-xs leading-relaxed space-y-2">
            <p className="text-foreground">
              {assessment.analysis?.insightText || "Analisis otomatis belum tersedia untuk tes ini."}
            </p>
            <p className="font-bold text-accent">
              {assessment.analysis?.recommendationText || "Lanjutkan program latihan rutin 6-8 minggu."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Result Items Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            Rincian Hasiltes Per Item
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Tes</TableHead>
                <TableHead>Komponen Fisik</TableHead>
                <TableHead className="text-right">Hasil Mentah (Raw)</TableHead>
                <TableHead className="text-right">Skor Terhitung</TableHead>
                <TableHead className="text-right">Aksi Sasaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessment.resultItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-xs text-foreground">
                    {item.testItem.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {item.testItem.physicalComponent ? item.testItem.physicalComponent.replace(/_/g, " ") : "GENERAL"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs text-foreground">
                    {item.rawValue != null
                      ? `${item.rawValue.toString()} ${item.testItem.unit.toLowerCase()}`
                      : item.qualitativeValue ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-accent">
                    {item.score?.toString() ?? "—"}%
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && item.testItem.testType === "NUMERIC" && item.testItem.isActive && item.rawValue != null ? (
                      <AssessmentQuickGoalButton
                        athleteId={assessment.athleteId}
                        athleteName={assessment.athlete.fullName}
                        testItemId={item.testItemId}
                        testItemName={item.testItem.name}
                        unit={item.testItem.unit}
                        scoreDirection={item.testItem.scoreDirection}
                        currentRawValue={Number(item.rawValue)}
                        hasActiveGoal={activeGoalsSet.has(item.testItemId)}
                      />
                    ) : (
                      <span className="text-muted text-[11px]">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
