"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { sendAthleteActivationEmail } from "@/lib/email";

// ─── Activation Token Helpers ─────────────────────────────────────────────────

const ACTIVATION_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Build the Verification.identifier for an athlete activation token.
 * Format: "athlete-activate:{username}"
 */
function activationIdentifier(username: string): string {
  return `athlete-activate:${username.toLowerCase().trim()}`;
}

/**
 * Admin: generate a cryptographically secure activation token for an athlete username.
 * Stores a hashed version in the Verification table.
 * Returns the raw token to be sent to the athlete (e.g. via activation link).
 *
 * Token is single-use: validated then deleted on successful activation.
 * Token is bound to the specific username — cannot activate another account.
 */
export async function generateAthleteActivationToken(
  username: string,
  sendEmailTo?: string
): Promise<{
  success: boolean;
  error?: string;
  activationUrl?: string;
  rawToken?: string;
  expiresAt?: string;
}> {
  try {
    const ctx = await requireOrgContext();

    if (ctx.role !== "admin" && ctx.role !== "head_coach") {
      return {
        success: false,
        error: "Hanya Admin atau Pelatih Kepala yang dapat membuat token aktivasi atlet.",
      };
    }

    const normalizedUsername = username.toLowerCase().trim();

    // Verify this athlete username exists in the org
    const portalAccess = await prisma.portalAccess.findUnique({
      where: { username: normalizedUsername },
      include: {
        athlete: {
          select: { fullName: true, organizationId: true },
        },
      },
    });

    if (
      !portalAccess ||
      portalAccess.athlete.organizationId !== ctx.organizationId
    ) {
      return {
        success: false,
        error: "Username atlet tidak ditemukan dalam organisasi ini.",
      };
    }

    if (portalAccess.revokedAt != null) {
      return {
        success: false,
        error: "Akses atlet ini telah dicabut dan tidak dapat diaktivasi.",
      };
    }

    // Generate secure raw token (32 bytes = 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");
    // Hash for storage — never store raw token
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const identifier = activationIdentifier(normalizedUsername);
    const expiresAt = new Date(Date.now() + ACTIVATION_TTL_MS);

    // identifier is not @unique in schema — findFirst then create/update
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

    const activationUrl = `/activate?token=${rawToken}&u=${encodeURIComponent(normalizedUsername)}`;

    // If an email is provided (or configured), send the activation email
    if (sendEmailTo && sendEmailTo.includes("@") && !sendEmailTo.endsWith("@athlete.internal")) {
      await sendAthleteActivationEmail({
        to: sendEmailTo.toLowerCase().trim(),
        athleteName: portalAccess.athlete.fullName,
        username: normalizedUsername,
        activationUrl,
        expiresInHours: 48,
      }).catch((err) => {
        console.error("[generateAthleteActivationToken] Gagal mengirim email atlet (non-fatal):", err);
      });
    }

    return {
      success: true,
      rawToken,
      activationUrl,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (err) {
    console.error("[generateAthleteActivationToken] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal membuat token aktivasi.",
    };
  }
}

/**
 * Admin / Head Coach: Regenerate activation link for an athlete.
 * Automatically invalidates previous active activation token by overwriting the Verification record.
 */
export async function regenerateAthleteActivationToken(username: string): Promise<{
  success: boolean;
  error?: string;
  activationUrl?: string;
  rawToken?: string;
  expiresAt?: string;
}> {
  return generateAthleteActivationToken(username);
}

/**
 * Admin / Head Coach: Invalidate a pending athlete activation link.
 * Deletes the pending Verification token without deleting the account or athlete record.
 */
export async function invalidateAthleteActivationToken(username: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const ctx = await requireOrgContext();

    if (ctx.role !== "admin" && ctx.role !== "head_coach") {
      return {
        success: false,
        error: "Hanya Admin atau Pelatih Kepala yang dapat membatalkan token aktivasi.",
      };
    }

    const normalizedUsername = username.toLowerCase().trim();

    // Verify this athlete username exists in the caller's organization
    const portalAccess = await prisma.portalAccess.findUnique({
      where: { username: normalizedUsername },
      include: { athlete: { select: { organizationId: true } } },
    });

    if (
      !portalAccess ||
      portalAccess.athlete.organizationId !== ctx.organizationId
    ) {
      return {
        success: false,
        error: "Username atlet tidak ditemukan dalam organisasi ini.",
      };
    }

    const identifier = activationIdentifier(normalizedUsername);
    const existing = await prisma.verification.findFirst({ where: { identifier } });

    if (existing) {
      await prisma.verification.delete({ where: { id: existing.id } });
    }

    return { success: true };
  } catch (err) {
    console.error("[invalidateAthleteActivationToken] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal membatalkan token aktivasi.",
    };
  }
}

/**
 * Get comprehensive activation status for an athlete by username.
 */
export async function getAthleteActivationStatus(username: string): Promise<{
  success: boolean;
  error?: string;
  status?: "ACTIVE" | "PENDING_ACTIVATION" | "ACTIVATION_EXPIRED" | "ACTIVATION_REVOKED" | "NO_ACTIVATION_LINK";
  expiresAt?: string;
  athleteName?: string;
}> {
  try {
    const ctx = await requireOrgContext();

    const normalizedUsername = username.toLowerCase().trim();

    const portalAccess = await prisma.portalAccess.findUnique({
      where: { username: normalizedUsername },
      include: { athlete: { select: { fullName: true, organizationId: true } } },
    });

    if (
      !portalAccess ||
      portalAccess.athlete.organizationId !== ctx.organizationId
    ) {
      return {
        success: false,
        error: "Username atlet tidak ditemukan dalam organisasi ini.",
      };
    }

    // 1. If revoked
    if (portalAccess.revokedAt != null) {
      return {
        success: true,
        status: "ACTIVATION_REVOKED",
        athleteName: portalAccess.athlete.fullName,
      };
    }

    // 2. If already activated (password set)
    if (portalAccess.passwordHash != null) {
      return {
        success: true,
        status: "ACTIVE",
        athleteName: portalAccess.athlete.fullName,
      };
    }

    // 3. Check Verification record
    const identifier = activationIdentifier(normalizedUsername);
    const record = await prisma.verification.findFirst({ where: { identifier } });

    if (!record) {
      return {
        success: true,
        status: "NO_ACTIVATION_LINK",
        athleteName: portalAccess.athlete.fullName,
      };
    }

    if (new Date() > new Date(record.expiresAt)) {
      return {
        success: true,
        status: "ACTIVATION_EXPIRED",
        expiresAt: record.expiresAt.toISOString(),
        athleteName: portalAccess.athlete.fullName,
      };
    }

    return {
      success: true,
      status: "PENDING_ACTIVATION",
      expiresAt: record.expiresAt.toISOString(),
      athleteName: portalAccess.athlete.fullName,
    };
  } catch (err) {
    console.error("[getAthleteActivationStatus] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal memeriksa status aktivasi.",
    };
  }
}

/**
 * Validate an activation token without consuming it.
 * Used by the activation page to prefill and verify before showing the form.
 */
export async function validateActivationToken(rawToken: string, username: string): Promise<{
  valid: boolean;
  error?: string;
  username?: string;
}> {
  try {
    if (!rawToken || rawToken.length !== 64) {
      // Use a generic message — do not reveal token format details
      return { valid: false, error: "Tautan aktivasi tidak valid atau sudah kedaluwarsa." };
    }

    if (!username) {
      return { valid: false, error: "Tautan aktivasi tidak valid atau sudah kedaluwarsa." };
    }

    const normalizedUsername = username.toLowerCase().trim();
    const identifier = activationIdentifier(normalizedUsername);
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Use findFirst — identifier is not @unique in this schema
    const record = await prisma.verification.findFirst({ where: { identifier } });

    if (!record) {
      // Generic — do not reveal whether username exists
      return { valid: false, error: "Tautan aktivasi tidak valid atau sudah kedaluwarsa." };
    }

    if (new Date() > new Date(record.expiresAt)) {
      return { valid: false, error: "Tautan aktivasi tidak valid atau sudah kedaluwarsa." };
    }

    // Constant-time comparison to prevent timing attacks
    const storedHash = Buffer.from(record.value, "hex");
    const incomingHash = Buffer.from(tokenHash, "hex");
    const isMatch =
      storedHash.length === incomingHash.length &&
      crypto.timingSafeEqual(storedHash, incomingHash);

    if (!isMatch) {
      return { valid: false, error: "Tautan aktivasi tidak valid atau sudah kedaluwarsa." };
    }

    // Verify the portal access still exists and is not revoked
    const portalAccess = await prisma.portalAccess.findUnique({
      where: { username: normalizedUsername },
    });

    if (!portalAccess || portalAccess.revokedAt != null) {
      return { valid: false, error: "Tautan aktivasi tidak valid atau sudah kedaluwarsa." };
    }

    return { valid: true, username: normalizedUsername };
  } catch (err) {
    console.error("[validateActivationToken] Gagal:", err);
    return { valid: false, error: "Tautan aktivasi tidak valid atau sudah kedaluwarsa." };
  }
}

/**
 * Athlete: complete activation using a valid token + chosen password.
 *
 * Security properties:
 * - Token must be valid and unexpired
 * - Token is bound to the username — cannot activate another account
 * - Token is deleted (single-use) after successful activation
 * - Password is hashed with bcrypt — never stored plaintext
 * - Username alone cannot activate the account
 */
export async function activateAthleteAccount(input: {
  rawToken: string;
  username: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { rawToken, username, password } = input;

    if (!password || password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    // Re-validate token (authoritative check — not from client state)
    const validation = await validateActivationToken(rawToken, username);
    if (!validation.valid || !validation.username) {
      return { success: false, error: validation.error || "Tautan aktivasi tidak valid." };
    }

    const normalizedUsername = validation.username;
    const passwordHash = await bcrypt.hash(password, 10);

    // Update the PortalAccess credential
    const portalAccess = await prisma.portalAccess.findUnique({
      where: { username: normalizedUsername },
      include: { athlete: true },
    });

    if (!portalAccess) {
      return { success: false, error: "Tautan aktivasi tidak valid atau sudah kedaluwarsa." };
    }

    await prisma.portalAccess.update({
      where: { id: portalAccess.id },
      data: {
        passwordHash,
        plainPassword: null, // Clear any legacy plaintext password
      },
    });

    // ── Delete the activation token (single-use) ──────────────────────────
    const identifier = activationIdentifier(normalizedUsername);
    // findFirst then delete by id (identifier not @unique)
    const verRecord = await prisma.verification.findFirst({ where: { identifier } });
    if (verRecord) {
      await prisma.verification.delete({ where: { id: verRecord.id } }).catch(() => {
        // Non-fatal: token may have already been deleted in a race condition
      });
    }

    // ── Sync password to User credential account if it exists ────────────
    const athleteEmail = `${normalizedUsername}@athlete.internal`;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: athleteEmail }, { name: portalAccess.athlete.fullName }] },
    });

    if (user) {
      const existingAccount = await prisma.account.findFirst({
        where: { userId: user.id, providerId: "credential" },
      });

      if (existingAccount) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { password: passwordHash },
        });
      } else {
        await prisma.account.create({
          data: {
            userId: user.id,
            providerId: "credential",
            accountId: user.id,
            password: passwordHash,
          },
        });
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[activateAthleteAccount] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal mengaktifkan akun atlet.",
    };
  }
}
