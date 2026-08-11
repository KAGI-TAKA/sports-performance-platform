export interface AssessmentWhatsAppSummary {
  athleteName: string;
  assessmentDate: Date;
  overallScore: number | null;
  overallGrade: string | null;
  bestComponent?: string | null;
  weakestComponent?: string | null;
  reportUrl?: string | null;
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

  let text = `🏀 *KINETIQ - LAPORAN HASIL TES FISIK*\n`;
  text += `------------------------------------\n`;
  text += `👤 *Atlet:* ${data.athleteName}\n`;
  text += `📅 *Tanggal:* ${formattedDate}\n`;
  text += `🏆 *Skor Akhir:* ${scoreStr} (Grade *${gradeStr}*)\n\n`;

  if (data.bestComponent) {
    text += `💪 *Keunggulan Utama:* ${data.bestComponent}\n`;
  }
  if (data.weakestComponent) {
    text += `🎯 *Area Pengembangan:* ${data.weakestComponent}\n`;
  }

  text += `\nLaporan hasil tes fisik telah diperbarui oleh pelatih. Tetap semangat berlatih! 🔥\n`;

  if (data.reportUrl) {
    text += `\n📄 *Lihat Laporan PDF Lengkap:*\n${data.reportUrl}`;
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
    // Clean phone number (replace 08xx with 628xx if needed)
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  return `https://wa.me/?text=${encodedText}`;
}
