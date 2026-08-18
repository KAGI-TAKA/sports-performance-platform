"use client";

import { useState } from "react";
import Link from "next/link";
import type { Athlete, AthleteInjuryHistory, Assessment } from "@prisma/client";
import { InjuryDialog } from "./injury-dialog";
import { deleteAthleteInjury } from "../actions";
import {
  Ruler,
  Weight,
  ArrowUpRight,
  TrendingUp,
  ClipboardList,
  ClipboardCheck,
  ShieldAlert,
  Plus,
  Star,
} from "lucide-react";
import { calculateStarRating } from "@/features/portal/achievements";

type AthleteWithRelations = Athlete & {
  injuryHistories: AthleteInjuryHistory[];
  assessments: Assessment[];
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const GRADE_COLORS: Record<string, { text: string; bg: string }> = {
  A: { text: "#16A34A", bg: "#F0FDF4" },
  "B+": { text: "#2563EB", bg: "#EFF6FF" },
  B: { text: "#2563EB", bg: "#EFF6FF" },
  "C+": { text: "#D97706", bg: "#FFFBEB" },
  C: { text: "#D97706", bg: "#FFFBEB" },
  D: { text: "#DC2626", bg: "#FEF2F2" },
};

export function AthleteDetailPanel({
  athlete,
  age,
  role,
}: {
  athlete: AthleteWithRelations | null;
  age: number | null;
  /** Role member saat ini — dipakai untuk menyembunyikan aksi destructive. */
  role: string;
}) {
  const [activeTab, setActiveTab] = useState<"assessment" | "progress" | "cedera" | "sessionLogs">("assessment");
  // assistant_coach tidak memiliki izin athlete:delete
  const canDelete = role !== "assistant_coach";

  if (!athlete) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
          <ClipboardList className="h-6 w-6 text-muted" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Pilih atlet dari daftar</p>
          <p className="mt-1 text-xs text-muted">Detail profil, riwayat assessment, dan catatan cedera akan tampil di sini.</p>
        </div>
      </div>
    );
  }

  async function handleDeleteInjury(id: string) {
    if (confirm("Hapus catatan cedera ini?")) {
      await deleteAthleteInjury(id);
    }
  }

  const lastAssessment = athlete.assessments[0];
  const firstAssessment = athlete.assessments[athlete.assessments.length - 1];
  const delta =
    athlete.assessments.length >= 2 && lastAssessment?.overallScore && firstAssessment?.overallScore
      ? Number(lastAssessment.overallScore) - Number(firstAssessment.overallScore)
      : null;

  // Calculate BMI dynamically
  const heightM = athlete.heightCm ? Number(athlete.heightCm) / 100 : null;
  const weightKg = athlete.weightKg ? Number(athlete.weightKg) : null;
  const bmiValue = heightM && weightKg && heightM > 0 ? weightKg / (heightM * heightM) : null;
  const bmiFormatted = bmiValue ? bmiValue.toFixed(1) : "—";

  let bmiCategory = "";
  let bmiColor = "text-muted";
  if (bmiValue) {
    if (bmiValue < 18.5) {
      bmiCategory = "Kurang";
      bmiColor = "text-blue-400";
    } else if (bmiValue <= 24.9) {
      bmiCategory = "Ideal";
      bmiColor = "text-emerald-400";
    } else if (bmiValue <= 29.9) {
      bmiCategory = "Berlebih";
      bmiColor = "text-amber-400";
    } else {
      bmiCategory = "Obesa";
      bmiColor = "text-rose-400";
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Profile Header */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-base font-bold text-white shadow-sm"
          style={{
            background: "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))",
          }}
        >
          {athlete.fullName
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-base font-bold text-foreground truncate">
            {athlete.fullName}
          </h2>
          <p className="mt-0.5 text-xs text-muted font-medium">
            Level: <span className="text-foreground font-semibold">{athlete.competitionLevel ?? "Pemula"}</span>
            {age != null && ` · ${age} tahun`}
            {athlete.jerseyNumber != null && ` · #${athlete.jerseyNumber}`}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {athlete.gender === "FEMALE" ? "Perempuan" : "Laki-laki"} ·{" "}
            Lahir {formatDate(athlete.dateOfBirth)}
          </p>

          {/* Parent contact info */}
          {(athlete.parentName || athlete.parentPhone) && (
            <p className="mt-1 text-[11px] text-accent font-medium">
              Ortu: {athlete.parentName || "—"}{" "}
              {athlete.parentPhone && `(${athlete.parentPhone})`}
            </p>
          )}

          {/* Allergies / Health Notes */}
          {(athlete.allergies || athlete.healthNotes) && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {athlete.allergies && (
                <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                  Alergi: {athlete.allergies}
                </span>
              )}
              {athlete.healthNotes && (
                <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                  Kesehatan: {athlete.healthNotes}
                </span>
              )}
            </div>
          )}
        </div>
        <Link
          href={`/athletes/${athlete.id}/edit`}
          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary hover:text-foreground hover:bg-surface-2 transition"
        >
          Edit
        </Link>
      </div>

      {/* Physical Metrics + Dynamic BMI */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Ruler, label: "Tinggi", value: athlete.heightCm ? `${athlete.heightCm} cm` : "—", color: "text-foreground" },
          { icon: Weight, label: "Berat", value: athlete.weightKg ? `${athlete.weightKg} kg` : "—", color: "text-foreground" },
          { icon: Weight, label: `BMI ${bmiCategory ? `(${bmiCategory})` : ""}`, value: bmiFormatted, color: bmiColor },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-lg bg-surface-2 px-2 py-2.5 text-center">
            <div className={`font-mono text-xs font-bold ${color}`}>{value}</div>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[9px] text-muted truncate">
              <Icon className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Last score & Star Rating quick badge */}
      {lastAssessment?.overallScore != null && (
        <div className="flex items-center gap-2.5 rounded-lg bg-accent/8 border border-accent/20 px-4 py-2.5">
          <div>
            <div className="text-[10px] text-muted font-medium uppercase tracking-wide">Skor Terakhir &amp; Rating</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold font-mono text-accent">
                {Number(lastAssessment.overallScore).toFixed(1)}%
              </span>
              <div className="flex items-center gap-0.5" title={calculateStarRating(Number(lastAssessment.overallScore), lastAssessment.overallGrade).label}>
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const rating = calculateStarRating(Number(lastAssessment.overallScore), lastAssessment.overallGrade).stars;
                  return (
                    <Star
                      key={starIndex}
                      className={`h-3.5 w-3.5 ${
                        starIndex <= rating ? "text-amber-400 fill-amber-400" : "text-border"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          {lastAssessment.overallGrade && (
            <div
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold"
              style={{
                backgroundColor: (GRADE_COLORS[lastAssessment.overallGrade] ?? GRADE_COLORS["C"]).bg,
                color: (GRADE_COLORS[lastAssessment.overallGrade] ?? GRADE_COLORS["C"]).text,
              }}
            >
              {lastAssessment.overallGrade}
            </div>
          )}
          {delta !== null && (
            <div className={`text-xs font-semibold ${delta >= 0 ? "text-success" : "text-danger"}`}>
              {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          {[
            { id: "assessment", label: "Assessment", icon: ClipboardList, count: athlete.assessments.length },
            { id: "sessionLogs", label: "Catatan Sesi", icon: ClipboardCheck, count: null },
            { id: "progress", label: "Progress", icon: TrendingUp, count: null },
            { id: "cedera", label: "Cedera", icon: ShieldAlert, count: athlete.injuryHistories.length },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-1.5 pb-2.5 text-xs font-medium transition border-b-2 ${
                activeTab === id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-secondary"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {count != null && count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none ${
                    activeTab === id ? "bg-accent/20 text-accent" : "bg-surface-3 text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        {activeTab === "assessment" && (
          <div className="space-y-2">
            <div className="flex justify-end mb-1">
              <Link
                href={`/assessments/new?athleteId=${athlete.id}`}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))" }}
              >
                <Plus className="h-3.5 w-3.5" />
                Assessment Baru
              </Link>
            </div>

            {athlete.assessments.length === 0 ? (
              <div className="py-8 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-muted mb-2" />
                <p className="text-sm text-muted">Belum ada assessment untuk atlet ini.</p>
              </div>
            ) : (
              athlete.assessments.map((a, idx) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-surface-2/60 border border-border/50 px-4 py-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      {formatDate(a.assessmentDate)}
                      {idx === 0 && (
                        <span className="ml-2 text-[9px] font-bold text-accent bg-accent/10 rounded px-1.5 py-0.5">TERBARU</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {a.overallScore != null
                        ? `${Number(a.overallScore).toFixed(1)}% · Grade ${a.overallGrade ?? "—"}`
                        : "Belum selesai"}
                    </div>
                  </div>
                  <Link
                    href={`/assessments/${a.id}`}
                    className="flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    Detail
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "progress" && (
          <div>
            {athlete.assessments.length < 2 ? (
              <div className="py-8 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-muted mb-2" />
                <p className="text-sm text-muted">Butuh minimal 2 assessment untuk melihat tren.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Trend summary */}
                <div className="rounded-lg border border-border bg-surface-2/40 p-4">
                  <div className="text-xs font-medium text-muted mb-3 uppercase tracking-wide">Tren Skor Keseluruhan</div>
                  <div className="flex items-end gap-4">
                    <div>
                      <div className="text-[10px] text-muted">Pertama</div>
                      <div className="font-mono font-bold text-foreground">
                        {Number(firstAssessment?.overallScore ?? 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex-1 h-1 rounded-full bg-border" />
                    <div className="text-right">
                      <div className="text-[10px] text-muted">Terakhir</div>
                      <div className="font-mono font-bold text-foreground">
                        {Number(lastAssessment?.overallScore ?? 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  {delta !== null && (
                    <div className={`mt-3 text-center text-sm font-semibold ${delta >= 0 ? "text-success" : "text-danger"}`}>
                      {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} poin{" "}
                      {delta >= 0 ? "peningkatan" : "penurunan"}
                    </div>
                  )}
                </div>

                {/* Assessment history in chronological order */}
                <div className="space-y-1.5">
                  {[...athlete.assessments].reverse().map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <span className="text-[10px] text-muted w-4 tabular-nums">{i + 1}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${a.overallScore ?? 0}%`,
                            background: "linear-gradient(90deg, hsl(230 85% 58%), hsl(250 80% 65%))",
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-foreground w-10 text-right">
                        {Number(a.overallScore ?? 0).toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-muted hidden sm:block">
                        {new Date(a.assessmentDate).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "cedera" && (
          <div className="space-y-2">
            <div className="flex justify-end mb-1">
              <InjuryDialog athleteId={athlete.id} athleteName={athlete.fullName} />
            </div>

            {athlete.injuryHistories.length === 0 ? (
              <div className="py-8 text-center">
                <ShieldAlert className="mx-auto h-8 w-8 text-muted mb-2" />
                <p className="text-sm text-muted">Tidak ada riwayat cedera tercatat.</p>
              </div>
            ) : (
              athlete.injuryHistories.map((inj) => (
                <div
                  key={inj.id}
                  className="flex items-start justify-between rounded-lg bg-surface-2/60 border border-border/50 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{inj.injuryType}</span>
                      {inj.severity && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            inj.severity === "BERAT"
                              ? "bg-danger-bg text-danger"
                              : inj.severity === "SEDANG"
                              ? "bg-warning-bg text-warning"
                              : "bg-success-bg text-success"
                          }`}
                        >
                          {inj.severity}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {formatDate(inj.injuryDate)}
                      {inj.recoveredAt && ` → Pulih ${formatDate(inj.recoveredAt)}`}
                    </div>
                    {inj.description && (
                      <p className="mt-1 text-xs text-secondary">{inj.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteInjury(inj.id)}
                    className={`ml-3 shrink-0 p-1 rounded transition ${
                      canDelete
                        ? "text-muted hover:text-danger"
                        : "cursor-not-allowed opacity-30 text-muted"
                    }`}
                    title={canDelete ? "Hapus" : "Hanya Admin/Head Coach"}
                    disabled={!canDelete}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
