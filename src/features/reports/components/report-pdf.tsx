import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ─── Styles ───────────────────────────────────────────────────────────────────

const C = {
  navy: "#0F2044",
  navyLight: "#1A3560",
  accent: "#2563EB",
  accentLight: "#EFF6FF",
  success: "#16A34A",
  successLight: "#F0FDF4",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  white: "#FFFFFF",
  gradeA: "#16A34A",
  gradeB: "#2563EB",
  gradeC: "#D97706",
  gradeD: "#DC2626",
};

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return C.gradeA;
  if (grade.startsWith("B")) return C.gradeB;
  if (grade.startsWith("C")) return C.gradeC;
  return C.gradeD;
}

function gapColor(gap: number): string {
  if (gap <= 15) return C.success;
  if (gap <= 30) return C.warning;
  return C.danger;
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    color: C.text,
    fontSize: 9,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.navy,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 8,
    color: C.textMuted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerLabel: { fontSize: 7, color: C.textMuted, marginBottom: 1 },
  headerValue: { fontSize: 9, fontWeight: "bold", color: C.text },
  // Section
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  // Profil
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    backgroundColor: C.surface,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
  },
  profileCell: { width: "30%", marginBottom: 4 },
  profileLabel: { fontSize: 7, color: C.textMuted, marginBottom: 1 },
  profileValue: { fontSize: 9, fontWeight: "bold", color: C.text },
  // Score summary
  scoreSummary: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  scoreCardMain: {
    flex: 2,
    backgroundColor: C.accentLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCardGrade: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: C.accent,
  },
  scoreLabel: { fontSize: 7, color: C.textMuted, marginBottom: 4, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  gradeNumber: { fontSize: 36, fontWeight: "bold" },
  // Table
  tableWrapper: { marginBottom: 14 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.navy,
    borderRadius: 4,
    padding: 5,
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tableRowAlt: {
    backgroundColor: C.surface,
  },
  th: { fontSize: 7, fontWeight: "bold", color: C.white },
  td: { fontSize: 8, color: C.text },
  // Mini bar
  miniBar: {
    height: 4,
    borderRadius: 99,
    backgroundColor: C.border,
    marginTop: 2,
    overflow: "hidden",
  },
  miniBarFill: { height: 4, borderRadius: 99 },
  // Component breakdown
  compGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  compCard: {
    width: "31%",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  compLabel: { fontSize: 7, color: C.textMuted, marginBottom: 3 },
  compScore: { fontSize: 14, fontWeight: "bold" },
  // Insight
  insightBox: {
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  insightLabel: { fontSize: 7, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  insightText: { fontSize: 8, lineHeight: 1.5 },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: C.textMuted },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportItem {
  name: string;
  component: string;
  rawValue: string;
  unit: string;
  score: number;
  benchmark?: number;
}

export interface AssessmentReportPDFProps {
  athleteName: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  club: string;
  position: string;
  assessmentDate: string;
  overallScore: number;
  overallGrade: string;
  items: ReportItem[];
  componentScores: Record<string, number>;
  insightText: string;
  recommendationText: string;
  orgName: string;
}

// ─── Component label map ──────────────────────────────────────────────────────

const COMP_LABELS: Record<string, string> = {
  FLEXIBILITY: "Fleksibilitas",
  SPEED: "Kecepatan",
  POWER: "Power",
  AGILITY: "Kelincahan",
  MUSCULAR_ENDURANCE: "Daya Tahan Otot",
  ANAEROBIC_ENDURANCE: "Daya Tahan Anaerobik",
  AEROBIC_ENDURANCE: "Daya Tahan Aerobik",
};

function compLabel(key: string): string {
  return COMP_LABELS[key] ?? key.replace(/_/g, " ").toLowerCase();
}

// ─── Main Document ────────────────────────────────────────────────────────────

export function AssessmentReportPDF({
  athleteName,
  gender,
  dateOfBirth,
  age,
  club,
  position,
  assessmentDate,
  overallScore,
  overallGrade,
  items,
  componentScores,
  insightText,
  recommendationText,
  orgName,
}: AssessmentReportPDFProps) {
  const gap = Math.max(0, 100 - overallScore);
  const gradeCol = gradeColor(overallGrade);

  return (
    <Document
      title={`Laporan Fisik — ${athleteName}`}
      author="Kinetiq Performance Platform"
      subject="Analisis Fisik Atlet Bolabasket"
    >
      {/* ── PAGE 1 ── */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>POWER UP PRIVATE TRAINING</Text>
            <Text style={styles.headerSub}>Sports Performance Assessment Report (Powered by Kinetiq)</Text>
            <Text style={[styles.headerSub, { marginTop: 4, color: C.textSecondary }]}>
              {orgName}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Tanggal Tes</Text>
            <Text style={styles.headerValue}>{assessmentDate}</Text>
            <Text style={[styles.headerLabel, { marginTop: 6 }]}>Digenerate oleh</Text>
            <Text style={styles.headerValue}>Kinetiq Platform</Text>
          </View>
        </View>

        {/* Profil Atlet */}
        <Text style={styles.sectionTitle}>PROFIL ATLET</Text>
        <View style={styles.profileGrid}>
          <View style={styles.profileCell}>
            <Text style={styles.profileLabel}>Nama</Text>
            <Text style={styles.profileValue}>{athleteName}</Text>
          </View>
          <View style={styles.profileCell}>
            <Text style={styles.profileLabel}>Jenis Kelamin</Text>
            <Text style={styles.profileValue}>{gender}</Text>
          </View>
          <View style={styles.profileCell}>
            <Text style={styles.profileLabel}>Tanggal Lahir</Text>
            <Text style={styles.profileValue}>{dateOfBirth}</Text>
          </View>
          <View style={styles.profileCell}>
            <Text style={styles.profileLabel}>Usia</Text>
            <Text style={styles.profileValue}>{age} tahun</Text>
          </View>
          <View style={styles.profileCell}>
            <Text style={styles.profileLabel}>Klub / Akademi</Text>
            <Text style={styles.profileValue}>{club || "—"}</Text>
          </View>
          <View style={styles.profileCell}>
            <Text style={styles.profileLabel}>Posisi</Text>
            <Text style={styles.profileValue}>{position}</Text>
          </View>
        </View>

        {/* Score Summary */}
        <Text style={styles.sectionTitle}>RINGKASAN HASIL</Text>
        <View style={styles.scoreSummary}>
          <View style={styles.scoreCardMain}>
            <Text style={styles.scoreLabel}>% Kondisi Fisik Keseluruhan</Text>
            <Text style={styles.scoreNumber}>{overallScore.toFixed(2)}%</Text>
            <View style={[styles.miniBar, { width: "70%", marginTop: 6 }]}>
              <View
                style={[
                  styles.miniBarFill,
                  { width: `${overallScore}%`, backgroundColor: gradeCol },
                ]}
              />
            </View>
            <Text style={[styles.insightText, { color: C.textMuted, marginTop: 4 }]}>
              GAP menuju 100%: {gap.toFixed(2)}%
            </Text>
          </View>
          <View
            style={[
              styles.scoreCardGrade,
              { backgroundColor: gradeCol + "18", borderColor: gradeCol + "44" },
            ]}
          >
            <Text style={[styles.scoreLabel, { color: gradeCol }]}>GRADE</Text>
            <Text style={[styles.gradeNumber, { color: gradeCol }]}>{overallGrade}</Text>
            <Text style={[styles.insightText, { color: C.textMuted, marginTop: 6, textAlign: "center" }]}>
              {overallGrade.startsWith("A")
                ? "Sangat Baik"
                : overallGrade.startsWith("B")
                ? "Baik"
                : overallGrade.startsWith("C")
                ? "Cukup"
                : "Perlu Peningkatan"}
            </Text>
          </View>
        </View>

        {/* Results Table */}
        <Text style={styles.sectionTitle}>HASIL EVALUASI FISIK PER ITEM TES</Text>
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 18 }]}>NO</Text>
            <Text style={[styles.th, { flex: 2.5 }]}>KOMPONEN FISIK</Text>
            <Text style={[styles.th, { flex: 3 }]}>ITEM TES</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: "center" }]}>SATUAN</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>HASIL</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: "right" }]}>BENCHMARK</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: "right" }]}>PERSEN (%)</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>GAP (%)</Text>
          </View>

          {items.map((item, idx) => {
            const itemGap = Math.max(0, 100 - item.score);
            return (
              <View
                key={idx}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.td, { width: 18, color: C.textMuted }]}>{idx + 1}</Text>
                <Text style={[styles.td, { flex: 2.5, color: C.textSecondary }]}>
                  {compLabel(item.component)}
                </Text>
                <Text style={[styles.td, { flex: 3, fontWeight: "bold" }]}>{item.name}</Text>
                <Text style={[styles.td, { flex: 1.2, textAlign: "center", fontFamily: "Courier", color: C.textMuted }]}>
                  {item.unit}
                </Text>
                <Text style={[styles.td, { flex: 1.2, textAlign: "right", fontFamily: "Courier", fontWeight: "bold" }]}>
                  {item.rawValue}
                </Text>
                <Text style={[styles.td, { flex: 1.5, textAlign: "right", fontFamily: "Courier", color: C.textSecondary }]}>
                  {item.benchmark != null ? item.benchmark : "—"}
                </Text>
                <Text
                  style={[
                    styles.td,
                    { flex: 1.5, textAlign: "right", fontFamily: "Courier", fontWeight: "bold", color: gradeColor(item.score >= 80 ? "A" : item.score >= 60 ? "B" : "C") },
                  ]}
                >
                  {item.score.toFixed(2)}%
                </Text>
                <Text
                  style={[
                    styles.td,
                    { flex: 1, textAlign: "right", fontFamily: "Courier", color: gapColor(itemGap) },
                  ]}
                >
                  {itemGap.toFixed(2)}%
                </Text>
              </View>
            );
          })}

          {/* Total row */}
          <View style={[styles.tableRow, { backgroundColor: C.navy, borderBottomWidth: 0, borderRadius: 4, marginTop: 2, paddingHorizontal: 2 }]}>
            <Text style={[styles.th, { flex: 1 }]}>% KONDISI FISIK KESELURUHAN</Text>
            <Text style={[styles.th, { textAlign: "right", fontFamily: "Courier", fontSize: 10 }]}>
              {overallScore.toFixed(2)}%
            </Text>
            <Text style={[styles.th, { width: 40, textAlign: "right", fontFamily: "Courier", color: "#FCA5A5" }]}>
              {gap.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Footer Page 1 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sumber Norma: topendsports.com &amp; matassessment.com
          </Text>
          <Text style={styles.footerText}>Halaman 1 dari 2</Text>
        </View>
      </Page>

      {/* ── PAGE 2 — Komponen + Rekomendasi ── */}
      <Page size="A4" style={styles.page}>
        {/* Mini header */}
        <View style={[styles.header, { paddingBottom: 8, marginBottom: 12 }]}>
          <View>
            <Text style={[styles.headerTitle, { fontSize: 12 }]}>KINETIQ</Text>
            <Text style={styles.headerSub}>Laporan Lanjutan — {athleteName} · {assessmentDate}</Text>
          </View>
          <Text style={[styles.headerSub, { alignSelf: "flex-end" }]}>{orgName}</Text>
        </View>

        {/* Skor Per Komponen */}
        <Text style={styles.sectionTitle}>% KONDISI FISIK PER KOMPONEN</Text>
        <View style={styles.compGrid}>
          {Object.entries(componentScores)
            .sort((a, b) => b[1] - a[1])
            .map(([key, score]) => {
              const scoreGap = Math.max(0, 100 - score);
              const col = gradeColor(score >= 80 ? "A" : score >= 60 ? "B" : "C");
              return (
                <View key={key} style={styles.compCard}>
                  <Text style={styles.compLabel}>{compLabel(key)}</Text>
                  <Text style={[styles.compScore, { color: col }]}>{score}%</Text>
                  <View style={[styles.miniBar, { marginTop: 4 }]}>
                    <View style={[styles.miniBarFill, { width: `${score}%`, backgroundColor: col }]} />
                  </View>
                  <Text style={[styles.footerText, { marginTop: 3 }]}>GAP: {scoreGap}%</Text>
                </View>
              );
            })}
        </View>

        {/* Insight */}
        <Text style={styles.sectionTitle}>ANALISIS OTOMATIS</Text>
        <View style={[styles.insightBox, { backgroundColor: C.accentLight, borderColor: "#BFDBFE" }]}>
          <Text style={[styles.insightLabel, { color: C.accent }]}>Insight Kondisi Fisik</Text>
          <Text style={[styles.insightText, { color: C.navyLight }]}>{insightText}</Text>
        </View>

        {/* Rekomendasi */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>PROGRAM LATIHAN YANG DIREKOMENDASIKAN</Text>
        <View style={[styles.insightBox, { backgroundColor: C.successLight, borderColor: "#BBF7D0" }]}>
          <Text style={[styles.insightLabel, { color: C.success }]}>Rekomendasi Pelatih</Text>
          <Text style={[styles.insightText, { color: "#14532D" }]}>{recommendationText}</Text>
        </View>

        {/* Catatan tanda tangan */}
        <View style={{ flexDirection: "row", gap: 20, marginTop: 24 }}>
          {["Pelatih / Asesor", "Orang Tua / Wali"].map((label) => (
            <View key={label} style={{ flex: 1, alignItems: "center" }}>
              <Text style={[styles.footerText, { marginBottom: 28 }]}>{label}</Text>
              <View style={{ width: "80%", borderBottomWidth: 1, borderBottomColor: C.border }} />
              <Text style={[styles.footerText, { marginTop: 4 }]}>Nama &amp; Tanda Tangan</Text>
            </View>
          ))}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={[styles.footerText, { marginBottom: 28 }]}>Mengetahui</Text>
            <View style={{ width: "80%", borderBottomWidth: 1, borderBottomColor: C.border }} />
            <Text style={[styles.footerText, { marginTop: 4 }]}>Kepala Pelatih / Direktur</Text>
          </View>
        </View>

        {/* Footer Page 2 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dokumen resmi hasil tes fisik — Digenerate secara otomatis oleh Kinetiq Performance Platform
          </Text>
          <Text style={styles.footerText}>Halaman 2 dari 2</Text>
        </View>
      </Page>
    </Document>
  );
}
