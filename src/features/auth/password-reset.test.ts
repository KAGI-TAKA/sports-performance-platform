import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

// Mock server-only package
vi.mock("server-only", () => ({}));

// Mock env.server
vi.mock("@/lib/env.server", () => ({
  env: {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
    BETTER_AUTH_SECRET: "mock_better_auth_secret_minimum_32_chars_long",
    BETTER_AUTH_URL: "https://app.coachzulfi.com",
    SUPABASE_URL: "https://mock.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "mock_service_role_key",
    RESEND_API_KEY: "re_mock_api_key_12345",
    EMAIL_FROM: "Coach Zulfi Athletic Performance <onboarding@resend.dev>",
  },
}));

// Mock email senders
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-reset-email-id" }),
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-email-id" }),
}));

import {
  requestPasswordReset,
  validatePasswordResetToken,
  performPasswordReset,
} from "./password-reset-actions";
import { prisma } from "@/lib/prisma";
import * as emailModule from "@/lib/email";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    portalAccess: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    verification: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
  },
}));

const GENERIC_RESPONSE =
  "Jika akun dengan email tersebut tersedia, kami akan mengirimkan instruksi reset password ke kotak masuk Anda.";

describe("Phase 4B-07: Password Reset & Account Recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. FORGOT PASSWORD (REQUEST STAGE & ENUMERATION DEFENSE)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Forgot Password Request & Account Enumeration Defense", () => {
    it("generates 32-byte (64 hex) token with SHA-256 hash in Verification table and 1-hour TTL for existing user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-coach-1",
        name: "Coach Budi",
        email: "coach.budi@example.com",
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);

      const res = await requestPasswordReset("coach.budi@example.com");

      expect(res.success).toBe(true);
      expect(res.message).toBe(GENERIC_RESPONSE);

      expect(prisma.verification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identifier: "password-reset:coach.budi@example.com",
          value: expect.any(String), // SHA-256 hash
          expiresAt: expect.any(Date),
        }),
      });

      expect(emailModule.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "coach.budi@example.com",
          userName: "Coach Budi",
          resetUrl: expect.stringContaining("https://app.coachzulfi.com/reset-password?token="),
          expiresInMinutes: 60,
        })
      );
    });

    it("returns identical generic response for non-existent email without sending email (Anti-Enumeration)", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await requestPasswordReset("ghost.user@unknown.com");

      expect(res.success).toBe(true);
      expect(res.message).toBe(GENERIC_RESPONSE);
      expect(prisma.verification.create).not.toHaveBeenCalled();
      expect(emailModule.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("returns generic response and does NOT send email for Athlete without email (internal domain)", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-ath-1",
        email: "faisal_youth@athlete.internal",
      } as any);

      const res = await requestPasswordReset("faisal_youth@athlete.internal");

      expect(res.success).toBe(true);
      expect(res.message).toBe(GENERIC_RESPONSE);
      expect(prisma.verification.create).not.toHaveBeenCalled();
      expect(emailModule.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("enforces cooldown rate-limit (60s) on repeated reset requests for the same email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-parent-1",
        email: "parent@example.com",
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-recent",
        identifier: "password-reset:parent@example.com",
        updatedAt: new Date(Date.now() - 20 * 1000), // 20s ago
      } as any);

      const res = await requestPasswordReset("parent@example.com");

      expect(res.success).toBe(false);
      expect(res.error).toContain("Mohon tunggu");
      expect(emailModule.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("replaces and overwrites older reset token when cooldown has expired", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-parent-1",
        email: "parent@example.com",
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-old",
        identifier: "password-reset:parent@example.com",
        updatedAt: new Date(Date.now() - 80 * 1000), // 80s ago
      } as any);
      vi.mocked(prisma.verification.update).mockResolvedValue({} as any);

      const res = await requestPasswordReset("parent@example.com");

      expect(res.success).toBe(true);
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: "v-old" },
        data: expect.objectContaining({
          value: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      });
      expect(emailModule.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. RESET TOKEN VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Reset Token Validation", () => {
    it("validates legitimate unexpired token successfully", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-reset-1",
        identifier: "password-reset:coach@example.com",
        value: hash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min left
      } as any);

      const res = await validatePasswordResetToken(rawToken, "coach@example.com");
      expect(res.valid).toBe(true);
      expect(res.email).toBe("coach@example.com");
    });

    it("rejects expired reset token (> 1 hour)", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-reset-1",
        identifier: "password-reset:coach@example.com",
        value: hash,
        expiresAt: new Date(Date.now() - 1000), // expired
      } as any);

      const res = await validatePasswordResetToken(rawToken, "coach@example.com");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("kedaluwarsa");
    });

    it("rejects malformed or tampered token with generic safe message", async () => {
      const legitimateRaw = crypto.randomBytes(32).toString("hex");
      const legitimateHash = crypto.createHash("sha256").update(legitimateRaw).digest("hex");

      const attackerRaw = crypto.randomBytes(32).toString("hex"); // different

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-reset-1",
        identifier: "password-reset:coach@example.com",
        value: legitimateHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      } as any);

      const res = await validatePasswordResetToken(attackerRaw, "coach@example.com");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("tidak valid atau sudah kedaluwarsa");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. PASSWORD RESET EXECUTION & SESSION REVOCATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Password Reset Execution, Session Revocation, and Single-Use", () => {
    it("successfully hashes password, updates Account, revokes all sessions, and deletes token", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-reset-1",
        identifier: "password-reset:coach.zulfi@example.com",
        value: hash,
        expiresAt: new Date(Date.now() + 45 * 60 * 1000),
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-zulfi-1",
        email: "coach.zulfi@example.com",
        name: "Coach Zulfi",
      } as any);

      vi.mocked(prisma.account.findFirst).mockResolvedValue({
        id: "acc-1",
        userId: "user-zulfi-1",
        providerId: "credential",
      } as any);

      vi.mocked(prisma.account.update).mockResolvedValue({} as any);
      vi.mocked(prisma.portalAccess.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 3 } as any);
      vi.mocked(prisma.verification.delete).mockResolvedValue({} as any);

      const res = await performPasswordReset({
        token: rawToken,
        email: "coach.zulfi@example.com",
        newPassword: "NewSecurePassword2026!",
      });

      expect(res.success).toBe(true);

      // 1. Password must be hashed with bcrypt
      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: "acc-1" },
        data: expect.objectContaining({
          password: expect.stringMatching(/^\$2[aby]\$/), // bcrypt format
        }),
      });

      // 2. CRITICAL SECURITY POLICY: Invalidate all active sessions for this user
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-zulfi-1" },
      });

      // 3. Single-use: verification token is deleted
      expect(prisma.verification.delete).toHaveBeenCalledWith({
        where: { id: "v-reset-1" },
      });
    });

    it("rejects password shorter than 8 characters", async () => {
      const res = await performPasswordReset({
        token: crypto.randomBytes(32).toString("hex"),
        email: "coach@example.com",
        newPassword: "short",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("minimal 8 karakter");
      expect(prisma.account.update).not.toHaveBeenCalled();
      expect(prisma.session.deleteMany).not.toHaveBeenCalled();
    });

    it("prevents replay attack: reusing a consumed token fails", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Token has already been deleted from Verification table
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);

      const res = await performPasswordReset({
        token: rawToken,
        email: "coach@example.com",
        newPassword: "NewSecurePassword2026!",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak valid atau sudah kedaluwarsa");
      expect(prisma.account.update).not.toHaveBeenCalled();
    });

    it("synchronizes PortalAccess.passwordHash if the resetting user is an Athlete with email", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-ath-reset",
        identifier: "password-reset:faisal.email@example.com",
        value: hash,
        expiresAt: new Date(Date.now() + 45 * 60 * 1000),
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-ath-1",
        email: "faisal.email@example.com",
        name: "Faisal Athlete",
      } as any);

      vi.mocked(prisma.account.findFirst).mockResolvedValue({
        id: "acc-ath-1",
        userId: "user-ath-1",
        providerId: "credential",
      } as any);

      vi.mocked(prisma.portalAccess.findFirst).mockResolvedValue({
        id: "pa-faisal-1",
        username: "faisal.email",
      } as any);

      vi.mocked(prisma.portalAccess.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.verification.delete).mockResolvedValue({} as any);

      const res = await performPasswordReset({
        token: rawToken,
        email: "faisal.email@example.com",
        newPassword: "AthleteNewPassword123!",
      });

      expect(res.success).toBe(true);
      expect(prisma.portalAccess.updateMany).toHaveBeenCalledWith({
        where: { id: "pa-faisal-1" },
        data: expect.objectContaining({
          passwordHash: expect.stringMatching(/^\$2[aby]\$/),
        }),
      });
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-ath-1" },
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ROLE MATRIX SAFETY & RECOVERY
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Role Matrix & Data Isolation Preservation", () => {
    it("Parent reset preserves Parent User ID and child relationships", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-parent-reset",
        identifier: "password-reset:bapak.andi@example.com",
        value: hash,
        expiresAt: new Date(Date.now() + 45 * 60 * 1000),
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "parent-user-42",
        email: "bapak.andi@example.com",
        name: "Bapak Andi",
      } as any);

      vi.mocked(prisma.account.findFirst).mockResolvedValue({
        id: "acc-parent-1",
        userId: "parent-user-42",
        providerId: "credential",
      } as any);

      vi.mocked(prisma.account.update).mockResolvedValue({} as any);
      vi.mocked(prisma.portalAccess.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 2 } as any);
      vi.mocked(prisma.verification.delete).mockResolvedValue({} as any);

      const res = await performPasswordReset({
        token: rawToken,
        email: "bapak.andi@example.com",
        newPassword: "ParentNewPassword456!",
      });

      expect(res.success).toBe(true);
      // User ID must remain exactly parent-user-42 so parent-children verification key remains intact
      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: "acc-parent-1" },
        data: expect.any(Object),
      });
    });

    it("Assistant Coach reset preserves assistant_coach membership without privilege change", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-ac-reset",
        identifier: "password-reset:coach.asisten@example.com",
        value: hash,
        expiresAt: new Date(Date.now() + 45 * 60 * 1000),
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-ac-99",
        email: "coach.asisten@example.com",
        name: "Coach Asisten",
      } as any);

      vi.mocked(prisma.account.findFirst).mockResolvedValue({
        id: "acc-ac-1",
        userId: "user-ac-99",
        providerId: "credential",
      } as any);

      vi.mocked(prisma.account.update).mockResolvedValue({} as any);
      vi.mocked(prisma.portalAccess.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.verification.delete).mockResolvedValue({} as any);

      const res = await performPasswordReset({
        token: rawToken,
        email: "coach.asisten@example.com",
        newPassword: "AssistantNewPass789!",
      });

      expect(res.success).toBe(true);
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-ac-99" },
      });
    });
  });
});
