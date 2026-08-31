export interface ResetPasswordEmailProps {
  userName?: string | null;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface GeneratedEmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Utility to escape dynamic user-controlled strings before inserting into HTML templates.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates brand-consistent, professional HTML & Plain Text templates
 * for the password reset transactional email.
 */
export function generateResetPasswordEmailTemplate({
  userName,
  resetUrl,
  expiresInMinutes = 60,
}: ResetPasswordEmailProps): GeneratedEmailTemplate {
  const rawDisplayName = userName?.trim() ? userName.trim() : "Coach";
  const safeDisplayName = escapeHtml(rawDisplayName);
  const subject = "Atur Ulang Kata Sandi — Coach Zulfi Athletic Performance";

  const text = `Halo ${rawDisplayName},

Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di Coach Zulfi Athletic Performance Platform.

Klik tautan berikut untuk membuat kata sandi baru:
${resetUrl}

Tautan ini hanya berlaku selama ${expiresInMinutes} menit dan hanya dapat digunakan 1 kali.

Jika Anda tidak meminta perubahan kata sandi ini, abaikan email ini dengan aman. Kata sandi Anda saat ini tetap aman dan tidak akan berubah.

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
      background-color: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-bottom: 1px solid #334155;
      padding: 24px;
      text-align: center;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 700;
      color: #10b981;
      letter-spacing: -0.025em;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #f8fafc;
      margin: 0 0 16px 0;
    }
    .paragraph {
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0 0 20px 0;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
    }
    .notice-box {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .notice-box strong {
      color: #e2e8f0;
    }
    .fallback-url {
      font-size: 11px;
      color: #64748b;
      word-break: break-all;
      line-height: 1.4;
      margin-top: 16px;
      border-top: 1px solid #1f2937;
      padding-top: 16px;
    }
    .fallback-url a {
      color: #10b981;
      text-decoration: underline;
    }
    .footer {
      border-top: 1px solid #1f2937;
      padding: 20px 24px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      background-color: #0b0f17;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="brand-title">Coach Zulfi Athletic Performance</h1>
      <div class="brand-subtitle">Platform Manajemen & Analisis Performa Atletik</div>
    </div>

    <div class="content">
      <p class="greeting">Halo ${safeDisplayName},</p>
      
      <p class="paragraph">
        Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:
      </p>

      <div class="button-container">
        <a href="${resetUrl}" class="button" target="_blank" rel="noopener noreferrer">
          Atur Ulang Kata Sandi
        </a>
      </div>

      <div class="notice-box">
        <strong>Penting:</strong> Tautan ini hanya berlaku selama <strong>${expiresInMinutes} menit</strong> dan hanya dapat digunakan satu kali.
      </div>

      <p class="paragraph" style="font-size: 12px; color: #94a3b8;">
        Jika Anda tidak meminta pengaturan ulang kata sandi ini, Anda dapat mengabaikan email ini dengan aman. Kata sandi Anda saat ini tidak akan berubah.
      </p>

      <div class="fallback-url">
        Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </div>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} Coach Zulfi Athletic Performance Platform. Seluruh hak cipta dilindungi.
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}
