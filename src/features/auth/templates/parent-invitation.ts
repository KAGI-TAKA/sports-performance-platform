import { escapeHtml, type GeneratedEmailTemplate } from "./reset-password";

export interface ParentInvitationEmailProps {
  parentName?: string | null;
  athleteNames?: string[];
  organizationName?: string | null;
  activationUrl: string;
  expiresInDays?: number;
}

/**
 * Generates brand-consistent, professional HTML & Plain Text email template
 * for Parent portal account invitation / activation.
 */
export function generateParentInvitationEmailTemplate({
  parentName,
  athleteNames = [],
  organizationName,
  activationUrl,
  expiresInDays = 7,
}: ParentInvitationEmailProps): GeneratedEmailTemplate {
  const rawDisplayName = parentName?.trim() ? parentName.trim() : "Bapak/Ibu Orang Tua Atlet";
  const safeDisplayName = escapeHtml(rawDisplayName);
  const safeOrgName = escapeHtml(organizationName?.trim() || "Coach Zulfi Athletic Performance");
  const childrenText = athleteNames.length > 0 ? athleteNames.join(", ") : "putra/putri Anda";
  const safeChildrenText = escapeHtml(childrenText);
  const subject = `Akses Portal Orang Tua — ${safeOrgName}`;

  const text = `Halo ${rawDisplayName},

Akademi ${safeOrgName} telah menyiapkan akun Portal Orang Tua untuk Anda guna memantau perkembangan fisik, hasil asesmen, dan jadwal latihan dari ${childrenText}.

Klik tautan berikut untuk mengaktifkan akun dan membuat kata sandi Anda:
${activationUrl}

Tautan ini berlaku selama ${expiresInDays} hari dan hanya dapat digunakan 1 kali.

Setelah mengaktifkan akun, Anda dapat login kapan saja menggunakan email dan password untuk melihat grafik perkembangan radar, sertifikat, dan presensi latihan anak Anda secara real-time.

---
${safeOrgName}
Sports Performance & Athlete Development Platform
`;

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f17;
      color: #e2e8f0;
      margin: 0;
      padding: 24px 12px;
    }
    .wrapper {
      max-width: 560px;
      margin: 0 auto;
      background-color: #131b2e;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #fef3c7;
      font-size: 13px;
    }
    .content {
      padding: 32px 24px;
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
    }
    .badge {
      background-color: #fef3c7;
      color: #92400e;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      display: inline-block;
      margin: 4px 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      background-color: #f59e0b;
      color: #451a03 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 14px 28px;
      border-radius: 10px;
      display: inline-block;
    }
    .meta-box {
      background-color: #1e293b;
      border-radius: 8px;
      padding: 14px;
      font-size: 12px;
      color: #94a3b8;
      margin-top: 24px;
    }
    .footer {
      border-top: 1px solid #1e293b;
      padding: 20px 24px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Portal Perkembangan Atlet</h1>
      <p>${safeOrgName}</p>
    </div>
    <div class="content">
      <p>Halo <strong>${safeDisplayName}</strong>,</p>
      <p>Akademi <strong>${safeOrgName}</strong> telah menyiapkan akun <strong>Portal Orang Tua</strong> untuk memantau perkembangan fisik, log latihan, dan hasil asesmen dari:</p>
      
      <p><span class="badge">Anak Terkait: ${safeChildrenText}</span></p>

      <p>Silakan klik tombol di bawah untuk mengaktifkan akun portal dan mengatur kata sandi Anda:</p>

      <div class="btn-container">
        <a href="${activationUrl}" class="btn" target="_blank" rel="noopener noreferrer">Aktivasi Portal Orang Tua</a>
      </div>

      <div class="meta-box">
        <strong>Keamanan Akun:</strong> Tautan aktivasi ini berlaku selama <strong>${expiresInDays} hari</strong> dan hanya dapat digunakan 1 kali. Setelah aktivasi, Anda dapat masuk secara mandiri kapan saja.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${safeOrgName}. Seluruh hak cipta dilindungi.
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}
