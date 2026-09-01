import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

// Mock server-only package
vi.mock("server-only", () => ({}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock env.server
vi.mock("@/lib/env.server", () => ({
  env: {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
    BETTER_AUTH_SECRET: "mock_better_auth_secret_minimum_32_chars_long",
    BETTER_AUTH_URL: "http://localhost:3000",
    SUPABASE_URL: "https://mock.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "mock_service_role_key",
    RESEND_API_KEY: "re_mock_api_key_12345",
    EMAIL_FROM: "Coach Zulfi Athletic Performance <onboarding@resend.dev>",
  },
}));

// Mock email senders
vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-email-id" }),
  sendAssistantCoachInvitationEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-invite-id" }),
  sendParentInvitationEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-parent-id" }),
  sendAthleteActivationEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-athlete-id" }),
  sendEmailVerificationEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-verify-id" }),
}));

import {
  createEmailVerificationToken,
  sendVerificationEmail,
  verifyEmailToken,
  resendVerificationEmail,
} from "./verification-actions";
import {
  createAssistantCoachInvitation,
  acceptAssistantCoachInvitation,
  validateInvitation,
} from "./invitation-actions";
import {
  generateAthleteActivationToken,
  activateAthleteAccount,
} from "./athlete-actions";
import { prisma } from "@/lib/prisma";
import * as authContext from "@/lib/auth-context";
import * as emailModule from "@/lib/email";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    member: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    invitation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
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

const mockOrgId = "org-test-4b06";
const mockAdminContext = {
  userId: "admin-user-1",
  organizationId: mockOrgId,
  memberId: "admin-mem-1",
  role: "admin",
  userName: "Coach Zulfi",
  userEmail: "zulfikarnegrosa@gmail.com",
};

describe("Phase 4B-06: Email Verification & Transactional Email Delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. EMAIL VERIFICATION TOKEN LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Email Verification Token Operations", () => {
    it("creates a 32-byte (64 hex) verification token with SHA-256 hash and 24h TTL", async () => {
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);

      const res = await createEmailVerificationToken("coach.andi@example.com");
      expect(res.rawToken).toHaveLength(64);
      expect(res.verificationUrl).toContain("/verify-email?token=");
      expect(res.verificationUrl).toContain("email=coach.andi%40example.com");
      expect(res.expiresAt.getTime()).toBeGreaterThan(Date.now() + 23 * 60 * 60 * 1000);

      expect(prisma.verification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identifier: "email-verify:coach.andi@example.com",
          value: expect.any(String), // SHA-256 hash
          expiresAt: expect.any(Date),
        }),
      });
    });

    it("verifies email successfully, marks User.emailVerified = true, and deletes token (single-use)", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-verify-1",
        identifier: "email-verify:coach.andi@example.com",
        value: hash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // unexpired
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-andi-1",
        email: "coach.andi@example.com",
        emailVerified: false,
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(prisma.verification.delete).mockResolvedValue({} as any);

      const res = await verifyEmailToken({
        rawToken,
        email: "coach.andi@example.com",
      });

      expect(res.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-andi-1" },
        data: { emailVerified: true },
      });
      expect(prisma.verification.delete).toHaveBeenCalledWith({
        where: { id: "v-verify-1" },
      });
    });

    it("rejects expired email verification token", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-verify-1",
        identifier: "email-verify:coach.andi@example.com",
        value: hash,
        expiresAt: new Date(Date.now() - 5000), // expired
      } as any);

      const res = await verifyEmailToken({
        rawToken,
        email: "coach.andi@example.com",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("kedaluwarsa");
    });

    it("rejects tampered / incorrect verification token", async () => {
      const legitimateRaw = crypto.randomBytes(32).toString("hex");
      const legitimateHash = crypto.createHash("sha256").update(legitimateRaw).digest("hex");

      const attackerRaw = crypto.randomBytes(32).toString("hex"); // different token

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-verify-1",
        identifier: "email-verify:coach.andi@example.com",
        value: legitimateHash,
        expiresAt: new Date(Date.now() + 100000),
      } as any);

      const res = await verifyEmailToken({
        rawToken: attackerRaw,
        email: "coach.andi@example.com",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak valid atau sudah kedaluwarsa");
    });

    it("token for User A cannot verify User B email", async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Searching for User B's identifier yields no match or wrong hash
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);

      const res = await verifyEmailToken({
        rawToken,
        email: "victim@example.com",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak valid atau sudah kedaluwarsa");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. RATE LIMITING & RESEND
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Verification Email Rate Limiting", () => {
    it("enforces cooldown when resending verification email within 60s", async () => {
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-recent",
        identifier: "email-verify:coach.andi@example.com",
        updatedAt: new Date(Date.now() - 15 * 1000), // requested 15s ago
      } as any);

      const res = await sendVerificationEmail({ email: "coach.andi@example.com" });
      expect(res.success).toBe(false);
      expect(res.error).toContain("Mohon tunggu");
      expect(emailModule.sendEmailVerificationEmail).not.toHaveBeenCalled();
    });

    it("allows resend when cooldown period (60s) has passed", async () => {
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-old",
        identifier: "email-verify:coach.andi@example.com",
        updatedAt: new Date(Date.now() - 90 * 1000), // 90s ago
      } as any);
      vi.mocked(prisma.verification.update).mockResolvedValue({} as any);

      const res = await resendVerificationEmail("coach.andi@example.com");
      expect(res.success).toBe(true);
      expect(emailModule.sendEmailVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "coach.andi@example.com",
          expiresInHours: 24,
        })
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. INVITATION != VERIFICATION (DECISION-04-xx OPTION A)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Invitation Email & Verification Policy", () => {
    it("Assistant Coach invitation creation dispatches transactional invitation email", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.invitation.updateMany).mockResolvedValue({ count: 0 });
      vi.mocked(prisma.invitation.create).mockResolvedValue({
        id: "inv-coach-1",
        email: "coach.baru@example.com",
        role: "assistant_coach",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        organization: { name: "Power Up Training" },
      } as any);

      const res = await createAssistantCoachInvitation({
        name: "Coach Budi",
        email: "coach.baru@example.com",
      });

      expect(res.success).toBe(true);
      expect(emailModule.sendAssistantCoachInvitationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "coach.baru@example.com",
          recipientName: "Coach Budi",
          inviteUrl: "/invitations/accept?id=inv-coach-1",
          expiresInDays: 7,
        })
      );
    });

    it("Option A: Accepting an email invitation marks User.emailVerified = true", async () => {
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
        id: "inv-coach-1",
        email: "coach.baru@example.com",
        role: "assistant_coach",
        status: "pending",
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        organizationId: mockOrgId,
        organization: { name: "Power Up Training" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "user-new-coach",
        email: "coach.baru@example.com",
        emailVerified: true,
      } as any);
      vi.mocked(prisma.account.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.account.create).mockResolvedValue({} as any);
      vi.mocked(prisma.member.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.member.create).mockResolvedValue({} as any);
      vi.mocked(prisma.invitation.update).mockResolvedValue({} as any);

      const res = await acceptAssistantCoachInvitation({
        invitationId: "inv-coach-1",
        name: "Coach Budi",
        password: "SuperSecretPassword123!",
      });

      expect(res.success).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "coach.baru@example.com",
          emailVerified: true, // Formal decision: email invitation proves mailbox possession
        }),
      });
      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { id: "inv-coach-1" },
        data: { status: "accepted" },
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ATHLETE ACTIVATION EMAIL (OPTIONAL EMAIL FLOW)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Athlete Email Activation Flow", () => {
    it("dispatches activation email when athlete email is provided", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        revokedAt: null,
        athlete: { fullName: "Faisal", organizationId: mockOrgId },
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);

      const res = await generateAthleteActivationToken("faisal_youth", "faisal@athlete.com");
      expect(res.success).toBe(true);
      expect(emailModule.sendAthleteActivationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "faisal@athlete.com",
          username: "faisal_youth",
          activationUrl: expect.stringContaining("/activate?token="),
        })
      );
    });

    it("does not dispatch email or create fake email if athlete has no email", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        revokedAt: null,
        athlete: { fullName: "Faisal", organizationId: mockOrgId },
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);

      const res = await generateAthleteActivationToken("faisal_youth");
      expect(res.success).toBe(true);
      expect(emailModule.sendAthleteActivationEmail).not.toHaveBeenCalled();
    });
  });
});
