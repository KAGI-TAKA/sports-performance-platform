export interface AssessmentWhatsAppSummary {
  athleteName: string;
  assessmentDate: Date;
  overallScore: number | null;
  overallGrade: string | null;
  bestComponent?: string | null;
  weakestComponent?: string | null;
  reportUrl?: string | null;
}

export interface ShareSafeProgressDTO {
  athlete: {
    id: string;
    fullName: string;
    age: number;
    jerseyNumber: number | null;
    position: string | null;
  };
  period: {
    label: string;
    assessmentDate: string;
    totalAssessments: number;
  };
  overview: {
    overallScore: number | null;
    overallGrade: string | null;
    trend: "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA";
    deltaPercentage: number | null;
  };
  personalBests: Array<{
    testItemName: string;
    rawValue: number;
    unit: string;
    achievedDate: string;
  }>;
  keyImprovements: Array<{
    testItemName: string;
    deltaValue: number;
    unit: string;
    percentChange: number | null;
  }>;
  goals: Array<{
    title: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    isAchieved: boolean;
  }>;
  focusAreas: string[];
  recommendation?: string | null;
  reportUrl?: string | null;
  latestAssessmentId?: string | null;
}

export function formatAssessmentWhatsAppText(
  data: AssessmentWhatsAppSummary
): string {
  const formattedDate = new Date(data.assessmentDate).toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const scoreStr =
    data.overallScore != null ? `${data.overallScore.toFixed(1)}%` : "—";
  const gradeStr = data.overallGrade ?? "—";

  let text = `⚡ *COACH ZULFI - LAPORAN PERFORMA FISIK ATLET*\n`;
  text += `------------------------------------\n`;
  text += `👤 *Atlet:* ${data.athleteName}\n`;
  text += `📅 *Tanggal Tes:* ${formattedDate}\n`;
  text += `🏆 *Skor Akhir:* ${scoreStr} (Grade *${gradeStr}*)\n\n`;

  if (data.bestComponent) {
    text += `💪 *Keunggulan Utama:* ${data.bestComponent}\n`;
  }
  if (data.weakestComponent) {
    text += `🎯 *Fokus Pengembangan:* ${data.weakestComponent}\n`;
  }

  text += `\nLaporan hasil evaluasi fisik atlet telah diperbarui oleh Coach Zulfi (@zulficoach). Tetap semangat berlatih! 🔥\n`;

  if (data.reportUrl) {
    text += `\n📄 *Lihat Laporan Lengkap & PDF:*\n${data.reportUrl}`;
  }

  return text;
}

export function getWhatsAppShareLink(
  data: AssessmentWhatsAppSummary,
  phoneNumber?: string
): string {
  const text = formatAssessmentWhatsAppText(data);
  const encodedText = encodeURIComponent(text);

  if (phoneNumber) {
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  return `https://wa.me/?text=${encodedText}`;
}

/**
 * P8-C4: Formats a share-safe, growth-oriented progress summary message for WhatsApp.
 * Concise, readable, and strictly sanitized for parents and athletes.
 */
export function formatProgressWhatsAppSummary(dto: ShareSafeProgressDTO): string {
  const athlete = dto.athlete;
  const overview = dto.overview;

  const scoreStr =
    overview.overallScore != null ? `${overview.overallScore.toFixed(1)}%` : "—";
  const gradeStr = overview.overallGrade ?? "—";

  let trendLabel = "Stabil";
  if (overview.trend === "IMPROVING") trendLabel = "↗ Meningkat";
  else if (overview.trend === "DECLINING") trendLabel = "↘ Memerlukan Perhatian";
  else if (overview.trend === "INSUFFICIENT_DATA") trendLabel = "Asesmen Baseline";

  let text = `⚡ *COACH ZULFI - LAPORAN PERKEMBANGAN ATLET*\n`;
  text += `------------------------------------\n`;
  text += `👤 *Nama:* ${athlete.fullName} (${athlete.age} thn)\n`;
  if (athlete.jerseyNumber != null) {
    text += `🔢 *No. Punggung:* #${athlete.jerseyNumber}\n`;
  }
  text += `📅 *Asesmen Terkini:* ${dto.period.assessmentDate}\n`;
  text += `🏆 *Skor Fisik:* ${scoreStr} (Grade *${gradeStr}*) • Tren: *${trendLabel}*\n\n`;

  // Key improvements (Max 2 for concise readability)
  if (dto.keyImprovements.length > 0) {
    text += `📈 *Peningkatan Utama:*\n`;
    dto.keyImprovements.slice(0, 2).forEach((item) => {
      const deltaSign = item.deltaValue > 0 ? "+" : "";
      const pctStr =
        item.percentChange != null
          ? ` (${item.percentChange > 0 ? "+" : ""}${item.percentChange.toFixed(1)}%)`
          : "";
      text += `• ${item.testItemName}: ${deltaSign}${item.deltaValue} ${item.unit}${pctStr}\n`;
    });
    text += `\n`;
  }

  // Personal Bests (Max 2 highlights)
  if (dto.personalBests.length > 0) {
    text += `⭐ *Rekor Terbaik Pribadi (Personal Best):*\n`;
    dto.personalBests.slice(0, 2).forEach((pb) => {
      text += `• ${pb.testItemName}: *${pb.rawValue} ${pb.unit}* (${pb.achievedDate})\n`;
    });
    text += `\n`;
  }

  // Goals progress if present (Max 2)
  if (dto.goals.length > 0) {
    text += `🎯 *Target Latihan:*\n`;
    dto.goals.slice(0, 2).forEach((g) => {
      const statusLabel = g.isAchieved ? "✅ Tercapai" : "🏃 Berjalan";
      text += `• ${g.title}: ${g.currentValue}/${g.targetValue} ${g.unit} (${statusLabel})\n`;
    });
    text += `\n`;
  }

  // Focus areas
  if (dto.focusAreas.length > 0) {
    text += `🔍 *Fokus Pengembangan:* ${dto.focusAreas.slice(0, 2).join(", ")}\n`;
  }

  // Safe training recommendation
  if (dto.recommendation) {
    text += `💡 *Catatan Pelatih:* ${dto.recommendation}\n`;
  } else {
    text += `💡 *Catatan Pelatih:* Pertahankan konsistensi latihan dan disiplin pemulihan fisik. Tetap semangat! 🔥\n`;
  }

  if (dto.reportUrl) {
    text += `\n📄 *Lihat Rapor Lengkap & PDF:*\n${dto.reportUrl}`;
  }

  return text;
}

export function getWhatsAppProgressShareLink(
  dto: ShareSafeProgressDTO,
  phoneNumber?: string
): string {
  const text = formatProgressWhatsAppSummary(dto);
  const encodedText = encodeURIComponent(text);

  if (phoneNumber) {
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  return `https://wa.me/?text=${encodedText}`;
}
