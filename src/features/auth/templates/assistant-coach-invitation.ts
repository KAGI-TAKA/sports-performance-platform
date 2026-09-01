import { escapeHtml, type GeneratedEmailTemplate } from "./reset-password";

export interface AssistantCoachInvitationEmailProps {
  recipientName?: string | null;
  inviterName?: string | null;
  organizationName?: string | null;
  inviteUrl: string;
  expiresInDays?: number;
}

/**
 * Generates brand-consistent, professional HTML & Plain Text email template
 * for Assistant Coach account invitation.
 */
export function generateAssistantCoachInvitationEmailTemplate({
  recipientName,
  inviterName,
  organizationName,
  inviteUrl,
  expiresInDays = 7,
}: AssistantCoachInvitationEmailProps): GeneratedEmailTemplate {
  const rawDisplayName = recipientName?.trim() ? recipientName.trim() : "Pelatih";
  const rawInviterName = inviterName?.trim() || "Head Coach / Administrator";
  const rawOrgName = organizationName?.trim() || "Coach Zulfi Athletic Performance";
  const safeDisplayName = escapeHtml(rawDisplayName);
  const safeInviterName = escapeHtml(rawInviterName);
  const safeOrgName = escapeHtml(rawOrgName);
  const subject = `Undangan Bergabung sebagai Asisten Pelatih — ${safeOrgName}`;

  const text = `Halo ${rawDisplayName},

Anda telah diundang oleh ${rawInviterName} untuk bergabung sebagai Asisten Pelatih di ${safeOrgName} pada platform manajemen performa atletik.

Klik tautan berikut untuk mengaktifkan akun dan mengatur kata sandi Anda:
${inviteUrl}

Tautan ini berlaku selama ${expiresInDays} hari dan hanya dapat digunakan 1 kali.

Jika Anda merasa tidak mengenali undangan ini, Anda dapat mengabaikan email ini dengan aman.

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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
      color: #d1fae5;
      font-size: 13px;
    }
    .content {
      padding: 32px 24px;
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      background-color: #10b981;
      color: #022c22 !important;
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
      <h1>Undangan Staf Kepelatihan</h1>
      <p>${safeOrgName}</p>
    </div>
    <div class="content">
      <p>Halo <strong>${safeDisplayName}</strong>,</p>
      <p>Anda telah diundang oleh <strong>${safeInviterName}</strong> untuk bergabung sebagai <strong>Asisten Pelatih</strong> di <strong>${safeOrgName}</strong>.</p>
      <p>Sebagai asisten pelatih, Anda akan dapat mencatat presensi sesi latihan, menginput hasil asesmen fisik atlet, dan mengelola log latihan harian secara kolaboratif.</p>

      <div class="btn-container">
        <a href="${inviteUrl}" class="btn" target="_blank" rel="noopener noreferrer">Aktivasi Akun &amp; Buat Password</a>
      </div>

      <div class="meta-box">
        <strong>Penting:</strong> Tautan undangan ini berlaku selama <strong>${expiresInDays} hari</strong> dan hanya dapat digunakan 1 kali untuk aktivasi akun. Setelah aktivasi berhasil, alamat email Anda akan otomatis terverifikasi.
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
