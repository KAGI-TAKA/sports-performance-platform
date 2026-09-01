"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env.server";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema, resetPasswordSchema } from "./schema";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 Hour (60 minutes)
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 Seconds Cooldown

function resetIdentifier(email: string): string {
  return `password-reset:${email.toLowerCase().trim()}`;
}

export interface RequestPasswordResetResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface ValidateResetTokenResult {
  valid: boolean;
  email?: string;
  error?: string;
}

export interface PerformPasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Request a password reset email.
 * ALWAYS returns a generic success message to prevent user enumeration.
 */
export async function requestPasswordReset(emailInput: string): Promise<RequestPasswordResetResult> {
  const genericMessage =
    "Jika akun dengan email tersebut tersedia, kami akan mengirimkan instruksi reset password ke kotak masuk Anda.";

  try {
    const parsed = forgotPasswordSchema.safeParse({ email: emailInput?.trim().toLowerCase() });
    if (!parsed.success) {
      return {
        success: false,
        error: "Format email tidak valid.",
        message: genericMessage,
      };
    }

    const normalizedEmail = parsed.data.email;
    const identifier = resetIdentifier(normalizedEmail);

    // 1. Check if user exists and is eligible for password reset
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        accounts: { where: { providerId: "credential" } },
      },
    });

    // If user does not exist or has an internal non-email identity (e.g. athlete.internal), return generic response
    if (!user || normalizedEmail.endsWith("@athlete.internal")) {
      return {
        success: true,
        message: genericMessage,
      };
    }

    // 2. Rate limiting / cooldown check
    const existing = await prisma.verification.findFirst({ where: { identifier } });
    if (existing) {
      const timeSinceUpdate = Date.now() - new Date(existing.updatedAt).getTime();
      if (timeSinceUpdate < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceUpdate) / 1000);
        return {
          success: false,
          error: `Mohon tunggu ${remainingSeconds} detik sebelum meminta tautan reset password baru.`,
          message: genericMessage,
        };
      }
    }

    // 3. Generate 32-byte cryptographic random token (64 hex characters)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    // 4. Store SHA-256 hash in Verification table (replaces any previous reset token)
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

    // 5. Construct secure reset URL
    const baseUrl = env.BETTER_AUTH_URL.replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // 6. Send transactional password reset email
    await sendPasswordResetEmail({
      to: normalizedEmail,
      userName: user.name,
      resetUrl,
      expiresInMinutes: 60,
    }).catch((err) => {
      console.error("[requestPasswordReset] Gagal mengirim email reset (non-fatal):", err);
    });

    return {
      success: true,
      message: genericMessage,
    };
  } catch (err) {
    console.error("[requestPasswordReset] Gagal:", err);
    return {
      success: true,
      message: genericMessage,
    };
  }
}

/**
 * Validate a password reset token before showing the reset password form.
 */
export async function validatePasswordResetToken(
  rawToken: string,
  email?: string
): Promise<ValidateResetTokenResult> {
  try {
    if (!rawToken || rawToken.length !== 64) {
      return {
        valid: false,
        error: "Link reset password tidak valid atau sudah kedaluwarsa.",
      };
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Look up by identifier or scan password-reset identifiers
    let record = null;
    if (email) {
      const identifier = resetIdentifier(email);
      record = await prisma.verification.findFirst({ where: { identifier } });
    } else {
      // If email is not in query params, find matching token hash among password-reset tokens
      const records = await prisma.verification.findMany({
        where: { identifier: { startsWith: "password-reset:" } },
      });
      const incomingHash = Buffer.from(tokenHash, "hex");
      for (const rec of records) {
        const storedHash = Buffer.from(rec.value, "hex");
        if (
          storedHash.length === incomingHash.length &&
          crypto.timingSafeEqual(storedHash, incomingHash)
        ) {
          record = rec;
          break;
        }
      }
    }

    if (!record) {
      return {
        valid: false,
        error: "Link reset password tidak valid atau sudah kedaluwarsa.",
      };
    }

    // Check expiration (1 Hour TTL)
    if (new Date() > new Date(record.expiresAt)) {
      return {
        valid: false,
        error: "Link reset password telah kedaluwarsa (berlaku 1 jam). Silakan minta tautan baru.",
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
        valid: false,
        error: "Link reset password tidak valid atau sudah kedaluwarsa.",
      };
    }

    const resolvedEmail = record.identifier.replace("password-reset:", "");
    return {
      valid: true,
      email: resolvedEmail,
    };
  } catch (err) {
    console.error("[validatePasswordResetToken] Gagal:", err);
    return {
      valid: false,
      error: "Terjadi kesalahan saat memvalidasi tautan reset password.",
    };
  }
}

/**
 * Perform password reset:
 * 1. Validates token & expiration.
 * 2. Hashes new password with bcrypt (10 rounds).
 * 3. Updates Account (credential).
 * 4. Synchronizes PortalAccess.passwordHash if user is an athlete.
 * 5. Invalidates ALL active sessions for this user (critical security policy).
 * 6. Deletes single-use reset token.
 */
export async function performPasswordReset(input: {
  token: string;
  email?: string;
  newPassword: string;
}): Promise<PerformPasswordResetResult> {
  try {
    const { token: rawToken, email, newPassword } = input;

    // Validate password complexity / length
    const parsedPassword = resetPasswordSchema.safeParse({ newPassword });
    if (!parsedPassword.success) {
      return {
        success: false,
        error: parsedPassword.error.flatten().fieldErrors.newPassword?.[0] || "Password minimal 8 karakter.",
      };
    }

    // Validate reset token
    const validation = await validatePasswordResetToken(rawToken, email);
    if (!validation.valid || !validation.email) {
      return {
        success: false,
        error: validation.error || "Link reset password tidak valid atau sudah kedaluwarsa.",
      };
    }

    const normalizedEmail = validation.email.toLowerCase().trim();

    // 1. Locate user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        success: false,
        error: "Akun pengguna tidak ditemukan.",
      };
    }

    // 2. Hash new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update or create Account record (credential provider)
    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword, updatedAt: new Date() },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: "credential",
          password: hashedPassword,
        },
      });
    }

    // 4. If this user is linked to an Athlete PortalAccess, synchronize passwordHash
    const portalAccess = await prisma.portalAccess.findFirst({
      where: {
        OR: [
          { username: normalizedEmail.split("@")[0] },
          { athlete: { organizationId: { not: "" } } },
        ],
      },
    });

    if (portalAccess) {
      await prisma.portalAccess.updateMany({
        where: { id: portalAccess.id },
        data: { passwordHash: hashedPassword },
      });
    }

    // 5. CRITICAL SECURITY POLICY: Invalidate all active sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    }).catch(() => {
      // ignore
    });

    // 6. Delete single-use verification token
    const identifier = resetIdentifier(normalizedEmail);
    const verificationRecord = await prisma.verification.findFirst({ where: { identifier } });
    if (verificationRecord) {
      await prisma.verification.delete({
        where: { id: verificationRecord.id },
      }).catch(() => {
        // ignore
      });
    }

    return {
      success: true,
      message: "Password berhasil diperbarui. Silakan masuk kembali menggunakan password baru Anda.",
    };
  } catch (err) {
    console.error("[performPasswordReset] Gagal:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan password baru.",
    };
  }
}
