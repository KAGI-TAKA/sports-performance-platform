import { escapeHtml, type GeneratedEmailTemplate } from "./reset-password";

export interface AthleteActivationEmailProps {
  athleteName?: string | null;
  username: string;
  organizationName?: string | null;
  activationUrl: string;
  expiresInHours?: number;
}

/**
 * Generates brand-consistent, professional HTML & Plain Text email template
 * for Athlete account activation when an email address is provided.
 */
export function generateAthleteActivationEmailTemplate({
  athleteName,
  username,
  organizationName,
  activationUrl,
  expiresInHours = 48,
}: AthleteActivationEmailProps): GeneratedEmailTemplate {
  const rawDisplayName = athleteName?.trim() ? athleteName.trim() : username;
  const safeDisplayName = escapeHtml(rawDisplayName);
  const safeUsername = escapeHtml(username);
  const safeOrgName = escapeHtml(organizationName?.trim() || "Coach Zulfi Athletic Performance");
  const subject = `Aktivasi Akun Atlet (@${safeUsername}) — ${safeOrgName}`;

  const text = `Halo ${rawDisplayName},

Akun atlet Anda di ${safeOrgName} telah disiapkan dengan username: @${username}

Klik tautan berikut untuk mengaktifkan akun dan membuat kata sandi Anda:
${activationUrl}

Tautan ini berlaku selama ${expiresInHours} jam dan hanya dapat digunakan 1 kali.

Setelah aktif, Anda dapat login menggunakan Username (@${username}) dan password yang telah Anda buat untuk melihat target capaian latihan, riwayat asesmen, dan progres fisik Anda.

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
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
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
      color: #cffafe;
      font-size: 13px;
    }
    .content {
      padding: 32px 24px;
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
    }
    .username-box {
      background-color: #083344;
      border: 1px solid #0e7490;
      color: #67e8f9;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 10px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      margin: 16px 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      background-color: #06b6d4;
      color: #082f49 !important;
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
      <h1>Aktivasi Akun Atlet</h1>
      <p>${safeOrgName}</p>
    </div>
    <div class="content">
      <p>Halo <strong>${safeDisplayName}</strong>,</p>
      <p>Akun latihan Anda di <strong>${safeOrgName}</strong> telah siap diaktifkan. Gunakan username berikut saat login:</p>
      
      <div class="username-box">@${safeUsername}</div>

      <p>Klik tombol di bawah ini untuk membuat kata sandi Anda dan mulai mengakses portal atlet:</p>

      <div class="btn-container">
        <a href="${activationUrl}" class="btn" target="_blank" rel="noopener noreferrer">Aktivasi Akun Atlet</a>
      </div>

      <div class="meta-box">
        <strong>Masa Berlaku:</strong> Tautan aktivasi ini berlaku selama <strong>${expiresInHours} jam</strong> dan hanya dapat digunakan 1 kali.
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
