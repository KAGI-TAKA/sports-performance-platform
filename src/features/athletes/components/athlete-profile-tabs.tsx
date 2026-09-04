"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Calendar,
  User,
  ShieldAlert,
  ClipboardCheck,
  Video,
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssessmentRadarChart } from "@/features/assessments/components/radar-chart";
import { PHYSICAL_COMPONENTS } from "@/lib/constants";
import { PortalAccessManager } from "@/features/portal/components/portal-access-manager";
import { AthleteGoalsTab } from "@/features/athlete-goals/components/athlete-goals-tab";
import { Target, Trophy } from "lucide-react";

const gradeColorMap: Record<string, string> = {
  A: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "B+": "text-emerald-700 bg-emerald-50 border-emerald-200",
  B: "text-indigo-700 bg-indigo-50 border-indigo-200",
  "C+": "text-amber-700 bg-amber-50 border-amber-200",
  C: "text-amber-700 bg-amber-50 border-amber-200",
  D: "text-rose-700 bg-rose-50 border-rose-200",
};

interface AthleteProfileTabsProps {
  athlete: any;
  portalAccesses: any[];
  componentScores: Record<string, number> | null;
  bmiValue: number | null;
  age: number;
  personalBests?: any[];
  currentPerformance?: any[];
  goals?: any[];
  availableTestItems?: any[];
  canManageGoals?: boolean;
}

export function AthleteProfileTabs({
  athlete,
  portalAccesses,
  componentScores,
  bmiValue,
  personalBests = [],
  currentPerformance = [],
  goals = [],
  availableTestItems = [],
  canManageGoals = false,
}: AthleteProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"assessments" | "goals" | "training" | "info">("assessments");

  const latestAssessment = athlete.assessments[0];
  const activeTrainingPlan = athlete.trainingPlans?.[0];

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const activeGoalsCount = goals.filter((g: any) => g.status === "ACTIVE").length;

  return (
    <div className="space-y-4">
      {/* Segmented Tab Navigation */}
      <div className="flex border-b border-border gap-1 sm:gap-2 select-none overflow-x-auto pb-0.5 scrollbar-thin px-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("assessments")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors shrink-0 whitespace-nowrap ${
            activeTab === "assessments"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Rapor &amp; Grafik Fisik ({athlete.assessments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("goals")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors shrink-0 whitespace-nowrap ${
            activeTab === "goals"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Target &amp; Rekor ({activeGoalsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("training")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors shrink-0 whitespace-nowrap ${
            activeTab === "training"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Program Latihan &amp; Sesi ({athlete.sessionLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors shrink-0 whitespace-nowrap ${
            activeTab === "info"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Biodata, Medis &amp; Portal</span>
        </button>
      </div>

      {/* ── TAB 1: ASSESSMENTS & RADAR ──────────────────────────────── */}
      {activeTab === "assessments" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Latest Score & 7 Components */}
            <Card className="lg:col-span-2 border border-border bg-surface-1 shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <span>Evaluasi Fisik Terbaru</span>
                </CardTitle>
                <Link
                  href="/assessments/new"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  <Plus className="h-3 w-3" /> Asesmen Baru
                </Link>
              </CardHeader>

              <CardContent className="p-4 sm:p-5">
                {latestAssessment ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-2/60 border border-border">
                      <div>
                        <span className="text-[11px] text-muted">Tanggal Evaluasi</span>
                        <h4 className="text-sm font-bold text-foreground font-mono">
                          {formatDate(latestAssessment.assessmentDate)}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-muted block">Skor Fisik</span>
                          <span className="font-mono text-2xl font-bold text-foreground">
                            {latestAssessment.overallScore ? `${Number(latestAssessment.overallScore)}%` : "—"}
                          </span>
                        </div>
                        {latestAssessment.overallGrade && (
                          <span
                            className={`inline-flex items-center justify-center h-8 w-9 rounded font-mono font-bold text-sm border ${
                              gradeColorMap[latestAssessment.overallGrade] ?? "text-foreground bg-surface-2 border-border"
                            }`}
                          >
                            {latestAssessment.overallGrade}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 7 Component Scores Bar */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                        Rincian Nilai 7 Komponen Fisik
                      </span>

                      {PHYSICAL_COMPONENTS.map((comp) => {
                        const score = componentScores ? componentScores[comp.value] : null;

                        return (
                          <div key={comp.value} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-foreground">{comp.label}</span>
                              <span className="font-mono font-bold text-foreground">
                                {score != null ? `${Math.round(score)}%` : "—"}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  score != null
                                    ? score >= 80
                                      ? "bg-emerald-500"
                                      : score >= 65
                                      ? "bg-indigo-500"
                                      : "bg-amber-500"
                                    : "bg-transparent"
                                }`}
                                style={{ width: `${score ?? 0}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Activity}
                    title="Belum Ada Assessment"
                    description="Lakukan pengujian fisik pertama untuk membuat rapor dan analisis performa atlet."
                    action={
                      <Link
                        href="/assessments/new"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Mulai Assessment Pertama
                      </Link>
                    }
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>

            {/* Right: Radar Chart */}
            <Card className="border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <span>Grafik Spider Radar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col items-center justify-center">
                {componentScores ? (
                  <AssessmentRadarChart componentScores={componentScores} />
                ) : (
                  <p className="text-xs text-muted text-center py-12">
                    Grafik radar akan tampil setelah hasil assessment disimpan.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical Assessments Table */}
          <Card className="border border-border bg-surface-1 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold">
                Riwayat Lengkap Assessment ({athlete.assessments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {athlete.assessments.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted">Belum ada riwayat asesmen lampau.</div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted">Tanggal Tes</TableHead>
                        <TableHead className="text-xs font-semibold text-muted">Status</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-muted">Skor Fisik</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-muted">Grade</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-muted">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {athlete.assessments.map((a: any) => (
                        <TableRow key={a.id} className="border-border hover:bg-surface-2/40">
                          <TableCell className="font-mono text-xs text-foreground py-3">
                            {formatDate(a.assessmentDate)}
                          </TableCell>
                          <TableCell className="py-3">
                            <span
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                                a.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {a.status === "COMPLETED" ? "Selesai" : "Draf"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-mono font-bold text-xs py-3">
                            {a.overallScore ? `${Number(a.overallScore)}%` : "—"}
                          </TableCell>
                          <TableCell className="text-center py-3">
                            {a.overallGrade ? (
                              <span
                                className={`inline-flex items-center justify-center h-5 w-6 rounded font-mono font-bold text-[10px] border ${
                                  gradeColorMap[a.overallGrade] ?? "bg-surface-2 border-border"
                                }`}
                              >
                                {a.overallGrade}
                              </span>
                            ) : (
                              "—"
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 2: TARGET & REKOR (P6-B) ────────────────────────────── */}
      {activeTab === "goals" && (
        <AthleteGoalsTab
          athleteId={athlete.id}
          athleteName={athlete.fullName}
          personalBests={personalBests}
          currentPerformance={currentPerformance}
          goals={goals}
          availableTestItems={availableTestItems}
          canManage={canManageGoals}
        />
      )}

      {/* ── TAB 3: TRAINING PLANS & SESSIONS ────────────────────────── */}
      {activeTab === "training" && (
        <div className="space-y-5">
          {/* Active Training Plan */}
          <Card className="border border-border bg-surface-1 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-accent" />
                <span>Program Latihan Aktif</span>
              </CardTitle>
              <Link
                href="/training-plans"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                Semua Program
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {activeTrainingPlan ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-surface-2/60 border border-border">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{activeTrainingPlan.title}</h4>
                      <p className="text-xs text-muted mt-0.5">{activeTrainingPlan.description ?? "Program latihan spesifik atlet."}</p>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 self-start sm:self-center">
                      🟢 Program Aktif
                    </span>
                  </div>

                  {/* Exercises List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                      Daftar Latihan ({activeTrainingPlan.exercises?.length ?? 0} Drill)
                    </span>
                    {activeTrainingPlan.exercises && activeTrainingPlan.exercises.length > 0 ? (
                      <div className="divide-y divide-border/60 border border-border rounded-lg overflow-hidden">
                        {activeTrainingPlan.exercises.map((ex: any, idx: number) => (
                          <div key={ex.id} className="p-3 bg-surface-1 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[10px] font-bold text-muted">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-semibold text-foreground">{ex.name}</span>
                                {ex.category && (
                                  <span className="ml-2 text-[10px] text-muted">({ex.category})</span>
                                )}
                                {ex.notes && <p className="text-[11px] text-muted mt-0.5">{ex.notes}</p>}
                              </div>
                            </div>
                            <div className="text-right font-mono shrink-0">
                              <span className="font-bold text-foreground">{ex.sets ? `${ex.sets} Sets` : ""} {ex.reps ? `× ${ex.reps}` : ""}</span>
                              {ex.restSeconds && <span className="block text-[10px] text-muted">Istirahat: {ex.restSeconds}s</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted">Belum ada drill latihan yang dimasukkan dalam program ini.</p>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Dumbbell}
                  title="Belum Ada Program Latihan"
                  description="Buat program latihan khusus untuk membimbing sesi latihan mandiri atlet."
                  action={
                    <Link
                      href={`/training-plans/new?athleteId=${athlete.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Buat Program Latihan</span>
                    </Link>
                  }
                  className="py-6"
                />
              )}
            </CardContent>
          </Card>

          {/* Session Logs */}
          <Card className="border border-border bg-surface-1 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-accent" />
                <span>Catatan Sesi Latihan & Feedback Pelatih ({athlete.sessionLogs.length})</span>
              </CardTitle>
              <Link
                href="/session-logs"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                Semua Log Sesi
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {athlete.sessionLogs.length === 0 ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title="Belum Ada Catatan Sesi"
                  description="Catatan evaluasi harian dan tautan video latihan atlet akan muncul di sini."
                  className="py-8"
                />
              ) : (
                athlete.sessionLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-lg border border-border bg-surface-1 hover:bg-surface-2/30 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {formatDate(log.sessionDate)}
                      </span>
                      {log.videoUrl && (
                        <a
                          href={log.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                        >
                          <Video className="h-3.5 w-3.5" /> Tonton Video
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-foreground">
                      <strong className="text-muted block text-[10px] uppercase font-bold">Aktivitas Dilakukan:</strong>
                      <p className="mt-0.5">{log.activitiesDone}</p>
                    </div>
                    {log.coachFeedback && (
                      <div className="text-xs bg-surface-2 p-2.5 rounded border border-border text-secondary">
                        <strong className="text-accent block text-[10px] uppercase font-bold">Catatan Evaluasi Pelatih:</strong>
                        <p className="mt-0.5">{log.coachFeedback}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 3: INFO, MEDICAL & PORTAL ACCESS ─────────────────────── */}
      {activeTab === "info" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Identity & Health Card */}
            <Card className="border border-border bg-surface-1 shadow-2xs">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-accent" />
                  <span>Data Fisik & Kontak Orang Tua</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-surface-2/60 border border-border text-center">
                  <div>
                    <span className="text-muted block text-[10px] font-medium">Tinggi Badan</span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {athlete.heightCm ? `${athlete.heightCm} cm` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] font-medium">Berat Badan</span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {athlete.weightKg ? `${athlete.weightKg} kg` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] font-medium">BMI Index</span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {bmiValue ? bmiValue.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted">Nama Orang Tua / Wali</span>
                    <span className="font-medium text-foreground">{athlete.parentName ?? "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted">No. WhatsApp / Telepon</span>
                    <span className="font-mono font-medium text-foreground">{athlete.parentPhone ?? "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted">Alergi & Riwayat Medis</span>
                    <span className="text-foreground">{athlete.allergies ?? "Tidak ada"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted">Catatan Kesehatan Tambahan</span>
                    <span className="text-foreground">{athlete.healthNotes ?? "Tidak ada"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portal Access Management */}
            <Card className="border border-border bg-surface-1 shadow-2xs">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-accent" />
                  <span>Kredensial & Akses Portal Klien</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <PortalAccessManager
                  athleteId={athlete.id}
                  athleteName={athlete.fullName}
                  parentPhone={athlete.parentPhone}
                  accesses={portalAccesses}
                />
              </CardContent>
            </Card>
          </div>

          {/* Injury & Medical History */}
          <Card className="border border-border bg-surface-1 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Riwayat Cedera & Medis ({athlete.injuryHistories?.length ?? 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {athlete.injuryHistories?.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted">Tidak ada riwayat cedera yang tercatat.</div>
              ) : (
                <div className="divide-y divide-border/60">
                  {athlete.injuryHistories.map((inj: any) => {
                    const isRecovered = !!inj.recoveredAt;
                    return (
                      <div key={inj.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{inj.injuryType}</span>
                            <span
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                                isRecovered
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {isRecovered ? "🟢 Pulih" : "🔴 Cedera Aktif"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted">{inj.description ?? "Tidak ada deskripsi rinci."}</p>
                        </div>
                        <div className="text-right font-mono text-[11px] text-muted shrink-0">
                          <span>Terjadi: {formatDate(inj.injuryDate)}</span>
                          {isRecovered && <span className="block text-emerald-700">Pulih: {formatDate(inj.recoveredAt)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
