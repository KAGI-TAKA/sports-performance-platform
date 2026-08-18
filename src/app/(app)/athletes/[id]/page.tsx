import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getAthleteFullProfile } from "@/features/athletes/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { scoreToGrade, PHYSICAL_COMPONENTS } from "@/lib/constants";
import { formatDateHeader } from "@/features/schedule/utils";
import { AthleteProfileActions } from "./athlete-profile-actions";
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  AlertTriangle,
  Activity,
  ClipboardCheck,
  Clock,
  FileText,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

import { listPortalAccessesForAthlete } from "@/features/portal/actions";
import { PortalAccessManager } from "@/features/portal/components/portal-access-manager";

function calculateAge(dateOfBirth: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

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

interface AthleteProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function AthleteProfilePage({ params }: AthleteProfilePageProps) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const [athlete, portalAccesses] = await Promise.all([
    getAthleteFullProfile(ctx.organizationId, id),
    listPortalAccessesForAthlete(id),
  ]);

  if (!athlete) {
    notFound();
  }

  const age = calculateAge(athlete.dateOfBirth);
  const initials = athlete.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  // BMI Calculation
  const heightM = athlete.heightCm ? Number(athlete.heightCm) / 100 : null;
  const weightKg = athlete.weightKg ? Number(athlete.weightKg) : null;
  const bmiValue = heightM && weightKg && heightM > 0 ? weightKg / (heightM * heightM) : null;

  // Assessments
  const latestAssessment = athlete.assessments[0];
  const activeInjuries = athlete.injuryHistories.filter((i) => !i.recoveredAt);

  // Extract latest component scores if available
  let componentScores: Record<string, number> | null = null;
  if (latestAssessment?.analysis?.componentScores) {
    try {
      componentScores =
        typeof latestAssessment.analysis.componentScores === "string"
          ? JSON.parse(latestAssessment.analysis.componentScores)
          : (latestAssessment.analysis.componentScores as Record<string, number>);
    } catch {
      // Fallback
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Navigation Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link href="/athletes">
            <Button variant="outline" size="xs" className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                {athlete.fullName}
              </h1>
              <Badge variant={athlete.isActive ? "success" : "outline"}>
                {athlete.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
              {athlete.jerseyNumber != null && (
                <Badge variant="default" className="font-mono">
                  #{athlete.jerseyNumber}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {athlete.position && athlete.position !== "UNSPECIFIED"
                ? `${athlete.position.replace(/_/g, " ")} · `
                : ""}
              {age} Tahun ({formatDate(athlete.dateOfBirth)}) ·{" "}
              {athlete.gender === "MALE" ? "Laki-laki" : "Perempuan"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PortalAccessManager
            athleteId={athlete.id}
            athleteName={athlete.fullName}
            parentPhone={athlete.parentPhone}
            accesses={portalAccesses}
          />
          <AthleteProfileActions athleteId={athlete.id} isActive={athlete.isActive} role={ctx.role} />
        </div>
      </div>

      {/* Active Injury Alert Banner */}
      {activeInjuries.length > 0 && (
        <Card className="border-danger/30 bg-danger-bg/50">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-danger/10 text-danger">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-danger">
                  Status Cedera Aktif ({activeInjuries.length})
                </h4>
                <p className="text-xs text-foreground/80 mt-0.5">
                  {activeInjuries
                    .map(
                      (i: { injuryType: string; description: string | null }) =>
                        `${i.injuryType}${i.description ? ` (${i.description})` : ""}`
                    )
                    .join(", ")}
                </p>
              </div>
            </div>
            <Badge variant="danger">Dalam Pemulihan</Badge>
          </CardContent>
        </Card>
      )}

      {/* Top Grid: Athlete Overview & Physical Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Identity Card */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar fallback={initials} size="lg" className="h-16 w-16 border-2 border-accent/20" />
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {athlete.fullName}
                </h3>
                {athlete.position && athlete.position !== "UNSPECIFIED" && (
                  <Badge variant="accent" className="text-[10px]">
                    {athlete.position.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
              <div>
                <span className="text-muted block">Tinggi Badan</span>
                <span className="font-semibold text-foreground font-mono">
                  {athlete.heightCm ? `${athlete.heightCm} cm` : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted block">Berat Badan</span>
                <span className="font-semibold text-foreground font-mono">
                  {athlete.weightKg ? `${athlete.weightKg} kg` : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted block">BMI Index</span>
                <span className="font-semibold text-foreground font-mono">
                  {bmiValue ? `${bmiValue.toFixed(1)}` : "—"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2 text-xs">
              {athlete.parentName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Orang Tua
                  </span>
                  <span className="font-medium text-foreground">{athlete.parentName}</span>
                </div>
              )}
              {athlete.parentPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> No. Telepon
                  </span>
                  <span className="font-medium text-foreground font-mono">{athlete.parentPhone}</span>
                </div>
              )}
              {athlete.competitionLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Tingkat Kompetisi</span>
                  <span className="font-medium text-foreground">{athlete.competitionLevel}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview & Latest Assessment Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                Ringkasan Performa &amp; Assessment Terbaru
              </span>
              {latestAssessment && (
                <Link href="/assessments">
                  <Button variant="ghost" size="xs" className="gap-1 text-accent">
                    Lihat Semua <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {latestAssessment ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface-2/60 border border-border/40">
                  <div>
                    <span className="text-xs text-muted">Assessment Terakhir</span>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      {formatDate(latestAssessment.assessmentDate)}
                    </h4>
                    <Badge
                      variant={latestAssessment.status === "COMPLETED" ? "success" : "outline"}
                      className="mt-1 text-[10px]"
                    >
                      {latestAssessment.status === "COMPLETED" ? "Selesai" : "Draf"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-muted block">Skor Skuad</span>
                      <span className="font-display text-2xl font-bold text-foreground font-mono">
                        {latestAssessment.overallScore ? Number(latestAssessment.overallScore) : "—"}
                      </span>
                    </div>
                    {latestAssessment.overallGrade && (
                      <Badge
                        variant={GRADE_BADGE_VARIANTS[latestAssessment.overallGrade] ?? "accent"}
                        className="text-lg px-3 py-1 font-display font-bold"
                      >
                        Grade {latestAssessment.overallGrade}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 7-Component Physical Scores Breakdown */}
                {componentScores && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Breakdown Komponen Fisik (7 Pilar)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {PHYSICAL_COMPONENTS.map((comp) => {
                        const val = componentScores![comp.value];
                        const grade = val != null ? scoreToGrade(val) : "—";
                        return (
                          <div
                            key={comp.value}
                            className="p-2.5 rounded-lg border border-border bg-surface-1 flex items-center justify-between"
                          >
                            <div>
                              <span className="text-[11px] font-medium text-foreground block">
                                {comp.label}
                              </span>
                              <span className="text-[10px] text-muted font-mono">
                                {val != null ? `${val} / 100` : "Belum diuji"}
                              </span>
                            </div>
                            {val != null && (
                              <Badge
                                variant={GRADE_BADGE_VARIANTS[grade] ?? "outline"}
                                className="text-[10px] font-mono"
                              >
                                {grade}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardCheck}
                title="Belum Ada Assessment"
                description="Atlet ini belum memiliki catatan hasil tes fisik atau assessment."
                action={
                  <Link href="/assessments/new">
                    <Button size="sm" className="bg-accent text-white gap-1.5">
                      + Buat Assessment Pertama
                    </Button>
                  </Link>
                }
                className="py-8"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Grid: Assessment History & Training Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment History */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Riwayat Assessment ({athlete.assessments.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {athlete.assessments.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="Belum Ada Riwayat"
                description="Riwayat tes dan evaluasi atlet akan muncul di sini."
                className="py-8"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Skor</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {athlete.assessments.map(
                    (a: {
                      id: string;
                      assessmentDate: Date;
                      status: string;
                      overallScore: unknown;
                      overallGrade: string | null;
                    }) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium text-xs">
                          {formatDate(a.assessmentDate)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={a.status === "COMPLETED" ? "success" : "outline"}
                            className="text-[10px]"
                          >
                            {a.status === "COMPLETED" ? "Selesai" : "Draf"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-xs">
                          {a.overallScore ? Number(a.overallScore) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {a.overallGrade ? (
                            <Badge
                              variant={GRADE_BADGE_VARIANTS[a.overallGrade] ?? "outline"}
                              className="text-[10px]"
                            >
                              {a.overallGrade}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Schedule & Training Activity */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                Agenda Sesi Latihan Terjadwal
              </span>
              <Link href="/schedule">
                <Button variant="ghost" size="xs" className="gap-1 text-accent">
                  Lihat Jadwal <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {athlete.scheduleSessions.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Belum Terjadwal"
                description="Atlet belum didaftarkan pada sesi latihan mendatang."
                className="py-8"
              />
            ) : (
              athlete.scheduleSessions.map(
                ({
                  session,
                }: {
                  session: {
                    id: string;
                    title: string;
                    startTime: Date;
                    location: string | null;
                    status: string;
                  };
                }) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg border border-border bg-surface-1 flex items-center justify-between gap-3 hover:border-accent/40 transition"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground leading-tight">
                        {session.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-muted">
                        <span className="font-mono">{formatDateHeader(session.startTime)}</span>
                        {session.location && <span>· {session.location}</span>}
                      </div>
                    </div>
                    <Badge
                      variant={
                        session.status === "COMPLETED"
                          ? "success"
                          : session.status === "CANCELLED"
                          ? "outline"
                          : session.status === "NO_SHOW"
                          ? "danger"
                          : "accent"
                      }
                      className="text-[10px]"
                    >
                      {session.status}
                    </Badge>
                  </div>
                )
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Injury History */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-accent" />
              Riwayat Cedera &amp; Pemulihan ({athlete.injuryHistories.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {athlete.injuryHistories.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="Belum Ada Riwayat Cedera"
              description="Atlet tidak memiliki catatan riwayat cedera."
              className="py-8"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Cedera</TableHead>
                  <TableHead>Jenis Cedera</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Tingkat Keparahan</TableHead>
                  <TableHead className="text-right">Status Pemulihan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {athlete.injuryHistories.map(
                  (injury: {
                    id: string;
                    injuryDate: Date;
                    injuryType: string;
                    description: string | null;
                    severity: string | null;
                    recoveredAt: Date | null;
                  }) => (
                    <TableRow key={injury.id}>
                      <TableCell className="font-medium text-xs">
                        {formatDate(injury.injuryDate)}
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {injury.injuryType}
                      </TableCell>
                      <TableCell className="text-xs text-muted max-w-xs truncate">
                        {injury.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {injury.severity ?? "Ringan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {injury.recoveredAt ? (
                          <Badge variant="success" className="text-[10px]">
                            Pulih ({formatDate(injury.recoveredAt)})
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px]">
                            Sedang Pemulihan
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
