import { escapeHtml, type GeneratedEmailTemplate } from "./reset-password";

export interface EmailVerificationEmailProps {
  userName?: string | null;
  verificationUrl: string;
  expiresInHours?: number;
}

/**
 * Generates brand-consistent, professional HTML & Plain Text email template
 * for Email Verification link.
 */
export function generateEmailVerificationEmailTemplate({
  userName,
  verificationUrl,
  expiresInHours = 24,
}: EmailVerificationEmailProps): GeneratedEmailTemplate {
  const rawDisplayName = userName?.trim() ? userName.trim() : "Pengguna";
  const safeDisplayName = escapeHtml(rawDisplayName);
  const subject = "Verifikasi Alamat Email Akun Anda — Coach Zulfi Athletic Performance";

  const text = `Halo ${rawDisplayName},

Terima kasih telah mendaftar di Coach Zulfi Athletic Performance Platform.

Klik tautan berikut untuk memverifikasi alamat email Anda:
${verificationUrl}

Tautan ini berlaku selama ${expiresInHours} jam dan hanya dapat digunakan 1 kali.

Jika Anda tidak merasa membuat akun atau mendaftarkan alamat email ini, abaikan pesan ini dengan aman.

---
Coach Zulfi Athletic Performance Platform
Pusat Analisis & Manajemen Performa Atletik
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
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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
      color: #e0e7ff;
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
      background-color: #6366f1;
      color: #ffffff !important;
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
      <h1>Verifikasi Alamat Email</h1>
      <p>Coach Zulfi Athletic Performance</p>
    </div>
    <div class="content">
      <p>Halo <strong>${safeDisplayName}</strong>,</p>
      <p>Satu langkah lagi untuk memastikan akun Anda aktif dan aman. Silakan klik tombol di bawah untuk memverifikasi alamat email Anda:</p>

      <div class="btn-container">
        <a href="${verificationUrl}" class="btn" target="_blank" rel="noopener noreferrer">Verifikasi Email Saya</a>
      </div>

      <div class="meta-box">
        <strong>Informasi Keamanan:</strong> Tautan verifikasi ini berlaku selama <strong>${expiresInHours} jam</strong> dan hanya dapat digunakan 1 kali.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Coach Zulfi Athletic Performance. Seluruh hak cipta dilindungi.
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}
