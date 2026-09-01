import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env.server", () => ({
  env: {
    BETTER_AUTH_URL: "http://localhost:3000",
    EMAIL_FROM: "test@test.com",
  },
}));
vi.mock("@/lib/email", () => ({
  sendAthleteActivationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import {
  generateAthleteActivationToken,
  validateActivationToken,
  activateAthleteAccount,
} from "./athlete-actions";
import { prisma } from "@/lib/prisma";
import * as authContext from "@/lib/auth-context";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    portalAccess: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verification: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth-context", () => ({
  requireOrgContext: vi.fn(),
}));

const mockOrgId = "org-test-123";
const mockAdminContext = {
  userId: "admin-user-id",
  organizationId: mockOrgId,
  memberId: "admin-member-id",
  role: "admin",
  userName: "Coach Zulfi",
  userEmail: "zulfikarnegrosa@gmail.com",
};

function makeValidToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

describe("Phase 4B-04A: Athlete Activation Security (Token-Based)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Token Generation", () => {
    it("should allow Admin to generate an activation token for a valid athlete username", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        revokedAt: null,
        athlete: { organizationId: mockOrgId },
      } as any);
      // No existing token record
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);

      const res = await generateAthleteActivationToken("faisal_youth");
      expect(res.success).toBe(true);
      expect(res.rawToken).toHaveLength(64); // 32 bytes → 64 hex chars
      expect(res.activationUrl).toContain("/activate?token=");
      expect(res.activationUrl).toContain("u=faisal_youth");
      expect(prisma.verification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ identifier: "athlete-activate:faisal_youth" }),
      });
    });

    it("should reject non-admin from generating activation tokens", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue({
        ...mockAdminContext,
        role: "assistant_coach",
      });

      const res = await generateAthleteActivationToken("faisal_youth");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Hanya Admin atau Pelatih Kepala");
    });

    it("should reject token generation for revoked athlete access", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        revokedAt: new Date(),
        athlete: { organizationId: mockOrgId },
      } as any);

      const res = await generateAthleteActivationToken("faisal_youth");
      expect(res.success).toBe(false);
      expect(res.error).toContain("telah dicabut");
    });
  });

  describe("Token Validation", () => {
    it("should validate a valid unexpired token correctly", async () => {
      const { raw, hash } = makeValidToken();
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: "athlete-activate:faisal_youth",
        value: hash,
        expiresAt: new Date(Date.now() + 999999),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        revokedAt: null,
      } as any);

      const res = await validateActivationToken(raw, "faisal_youth");
      expect(res.valid).toBe(true);
      expect(res.username).toBe("faisal_youth");
    });

    it("should DENY an expired token with generic error (no username leakage)", async () => {
      const { raw, hash } = makeValidToken();
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: "athlete-activate:faisal_youth",
        value: hash,
        expiresAt: new Date(Date.now() - 5000), // Expired
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await validateActivationToken(raw, "faisal_youth");
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Tautan aktivasi tidak valid atau sudah kedaluwarsa.");
      // Must NOT reveal anything specific about the username
      expect(res.error).not.toContain("faisal_youth");
    });

    it("should DENY a wrong/tampered token", async () => {
      const { raw, hash } = makeValidToken();
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: "athlete-activate:faisal_youth",
        value: hash,
        expiresAt: new Date(Date.now() + 999999),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const tamperedToken = "a".repeat(64); // Wrong token, right length
      const res = await validateActivationToken(tamperedToken, "faisal_youth");
      expect(res.valid).toBe(false);
    });

    it("should DENY activation without any token (empty string)", async () => {
      const res = await validateActivationToken("", "faisal_youth");
      expect(res.valid).toBe(false);
      // Generic error — must not reveal username existence
      expect(res.error).toBe("Tautan aktivasi tidak valid atau sudah kedaluwarsa.");
    });

    it("should DENY when no Verification record exists (username existence enumeration defense)", async () => {
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);

      const { raw } = makeValidToken();
      const res = await validateActivationToken(raw, "nonexistent_user");
      expect(res.valid).toBe(false);
      // Must NOT say "tidak ditemukan" (reveals username existence)
      expect(res.error).toBe("Tautan aktivasi tidak valid atau sudah kedaluwarsa.");
      expect(res.error).not.toContain("tidak ditemukan");
    });
  });

  describe("Activation Completion & Single-Use", () => {
    it("should activate account, hash password, clear plaintext, and delete token (single-use)", async () => {
      const { raw, hash } = makeValidToken();

      // findFirst is called twice: once in validateActivationToken, once in deletion
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: "athlete-activate:faisal_youth",
        value: hash,
        expiresAt: new Date(Date.now() + 999999),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        revokedAt: null,
        athlete: { fullName: "Faisal" },
      } as any);
      vi.mocked(prisma.portalAccess.update).mockResolvedValue({} as any);
      vi.mocked(prisma.verification.delete).mockResolvedValue({} as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const res = await activateAthleteAccount({
        rawToken: raw,
        username: "faisal_youth",
        password: "SecurePass123!",
      });

      expect(res.success).toBe(true);
      // Password must be hashed, plainPassword must be cleared
      expect(prisma.portalAccess.update).toHaveBeenCalledWith({
        where: { id: "pa-1" },
        data: {
          passwordHash: expect.any(String),
          plainPassword: null,
        },
      });
      // Token must be deleted by id (single-use) — code does findFirst then delete({ where: { id } })
      expect(prisma.verification.delete).toHaveBeenCalledWith({
        where: { id: "v1" },
      });
    });

    it("should DENY account activation without a token (username-only flow blocked)", async () => {
      // No token in the call — rawToken is empty
      const res = await activateAthleteAccount({
        rawToken: "",
        username: "faisal_youth",
        password: "SecurePass123!",
      });

      expect(res.success).toBe(false);
      // Must fail — username alone is not sufficient
    });
  });
});
