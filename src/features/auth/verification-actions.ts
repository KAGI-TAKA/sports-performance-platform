"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationEmail } from "@/lib/email";
import { requireOrgContext } from "@/lib/auth-context";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 Seconds Cooldown

function verificationIdentifier(email: string): string {
  return `email-verify:${email.toLowerCase().trim()}`;
}

/**
 * Generate a cryptographically secure email verification token and store its SHA-256 hash.
 */
export async function createEmailVerificationToken(email: string): Promise<{
  rawToken: string;
  verificationUrl: string;
  expiresAt: Date;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const identifier = verificationIdentifier(normalizedEmail);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  const existing = await prisma.verification.findFirst({ where: { identifier } });
  if (existing) {
    await prisma.verification.update({
      where: { id: existing.id },
      data: { value: tokenHash, expiresAt },
    });
  } else {
    await prisma.verification.create({
      data: { identifier, value: tokenHash, expiresAt },
    });
  }

  const verificationUrl = `/verify-email?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

  return {
    rawToken,
    verificationUrl,
    expiresAt,
  };
}

/**
 * Request an email verification link to be sent to the user's email address.
 * Rate-limited to prevent abuse / token spamming.
 */
export async function sendVerificationEmail(input: {
  email: string;
  userName?: string;
}): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const { email, userName } = input;
    if (!email || !email.includes("@")) {
      return { success: false, error: "Alamat email tidak valid." };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const identifier = verificationIdentifier(normalizedEmail);

    // Rate limiting check
    const existing = await prisma.verification.findFirst({ where: { identifier } });
    if (existing) {
      const timeSinceUpdate = Date.now() - new Date(existing.updatedAt).getTime();
      if (timeSinceUpdate < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceUpdate) / 1000);
        return {
          success: false,
          error: `Mohon tunggu ${remainingSeconds} detik sebelum meminta link verifikasi baru.`,
        };
      }
    }

    const { verificationUrl } = await createEmailVerificationToken(normalizedEmail);

    // Send transactional verification email
    await sendEmailVerificationEmail({
      to: normalizedEmail,
      userName,
      verificationUrl,
      expiresInHours: 24,
    });

    return {
      success: true,
      message: "Tautan verifikasi email berhasil dikirim. Silakan periksa kotak masuk Anda.",
    };
  } catch (err) {
    console.error("[sendVerificationEmail] Gagal:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengirim email verifikasi.",
    };
  }
}

/**
 * Verify an email token from the verification link.
 * Single-use: marks User.emailVerified = true and deletes the Verification record.
 */
export async function verifyEmailToken(input: {
  rawToken: string;
  email: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { rawToken, email } = input;

    if (!rawToken || rawToken.length !== 64 || !email) {
      return {
        success: false,
        error: "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
      };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const identifier = verificationIdentifier(normalizedEmail);
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const record = await prisma.verification.findFirst({ where: { identifier } });

    if (!record) {
      return {
        success: false,
        error: "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
      };
    }

    if (new Date() > new Date(record.expiresAt)) {
      return {
        success: false,
        error: "Tautan verifikasi telah kedaluwarsa (berlaku 24 jam). Silakan minta tautan baru.",
      };
    }

    // Constant-time hash verification
    const storedHash = Buffer.from(record.value, "hex");
    const incomingHash = Buffer.from(tokenHash, "hex");
    const isMatch =
      storedHash.length === incomingHash.length &&
      crypto.timingSafeEqual(storedHash, incomingHash);

    if (!isMatch) {
      return {
        success: false,
        error: "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
      };
    }

    // 1. Mark User emailVerified = true
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    // 2. Delete verification record (single-use)
    await prisma.verification.delete({
      where: { id: record.id },
    }).catch(() => {
      // ignore race condition deletion
    });

    return { success: true };
  } catch (err) {
    console.error("[verifyEmailToken] Gagal:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memverifikasi email.",
    };
  }
}

/**
 * Resend verification email for an unverified user.
 */
export async function resendVerificationEmail(email: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  return sendVerificationEmail({ email });
}
