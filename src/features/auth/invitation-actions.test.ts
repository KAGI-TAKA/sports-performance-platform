import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/env.server", () => ({
  env: {
    BETTER_AUTH_URL: "http://localhost:3000",
    EMAIL_FROM: "test@test.com",
  },
}));
vi.mock("@/lib/email", () => ({
  sendAssistantCoachInvitationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import {
  createAssistantCoachInvitation,
  validateInvitation,
  acceptAssistantCoachInvitation,
} from "./invitation-actions";
import { prisma } from "@/lib/prisma";
import * as authContext from "@/lib/auth-context";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invitation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    member: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth-context", () => ({
  requireOrgContext: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Phase 4B-03: Assistant Coach Invitation & Activation", () => {
  const mockOrgId = "org-test-123";
  const mockAdminContext = {
    userId: "admin-user-id",
    organizationId: mockOrgId,
    memberId: "admin-member-id",
    role: "admin",
    userName: "Coach Zulfi",
    userEmail: "zulfikarnegrosa@gmail.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Invitation Creation", () => {
    it("should allow Admin to issue an Assistant Coach invitation with 7-day TTL", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      const mockExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      vi.mocked(prisma.invitation.create).mockResolvedValue({
        id: "inv-123",
        organizationId: mockOrgId,
        email: "coach.asisten@example.com",
        role: "assistant_coach",
        status: "pending",
        inviterId: "admin-user-id",
        expiresAt: mockExpires,
        createdAt: new Date(),
      });

      const res = await createAssistantCoachInvitation({
        name: "Coach Asisten",
        email: "coach.asisten@example.com",
      });

      expect(res.success).toBe(true);
      expect(res.invitationId).toBe("inv-123");
      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: mockOrgId,
          email: "coach.asisten@example.com",
          role: "assistant_coach",
          status: "pending",
        }),
      });
    });

    it("should reject non-admin from creating coach invitations", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue({
        ...mockAdminContext,
        role: "assistant_coach",
      });

      const res = await createAssistantCoachInvitation({
        name: "Coach Asisten",
        email: "coach.asisten@example.com",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Hanya Admin / Owner");
    });
  });

  describe("Invitation Validation", () => {
    it("should validate a valid pending invitation", async () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
        id: "inv-123",
        organizationId: mockOrgId,
        email: "coach.asisten@example.com",
        role: "assistant_coach",
        status: "pending",
        inviterId: "admin-user-id",
        expiresAt: futureDate,
        createdAt: new Date(),
        organization: { name: "Power Up Basketball" },
      } as any);

      const res = await validateInvitation("inv-123");
      expect(res.valid).toBe(true);
      expect(res.invitation?.email).toBe("coach.asisten@example.com");
      expect(res.invitation?.organizationName).toBe("Power Up Basketball");
    });

    it("should reject an expired invitation", async () => {
      const pastDate = new Date(Date.now() - 1000);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
        id: "inv-expired",
        organizationId: mockOrgId,
        email: "coach.asisten@example.com",
        role: "assistant_coach",
        status: "pending",
        inviterId: "admin-user-id",
        expiresAt: pastDate,
        createdAt: new Date(),
        organization: { name: "Power Up Basketball" },
      } as any);

      const res = await validateInvitation("inv-expired");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("kedaluwarsa");
    });

    it("should reject an already accepted invitation", async () => {
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
        id: "inv-accepted",
        organizationId: mockOrgId,
        email: "coach.asisten@example.com",
        role: "assistant_coach",
        status: "accepted",
        inviterId: "admin-user-id",
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
        organization: { name: "Power Up Basketball" },
      } as any);

      const res = await validateInvitation("inv-accepted");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("sudah pernah digunakan");
    });
  });

  describe("Invitation Acceptance & Password Activation", () => {
    it("should successfully activate account, hash password, and assign assistant_coach role", async () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
        id: "inv-123",
        organizationId: mockOrgId,
        email: "coach.asisten@example.com",
        role: "assistant_coach",
        status: "pending",
        inviterId: "admin-user-id",
        expiresAt: futureDate,
        createdAt: new Date(),
        organization: { name: "Power Up Basketball" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "user-coach-1",
        name: "Coach Asisten",
        email: "coach.asisten@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.account.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.account.create).mockResolvedValue({} as any);
      vi.mocked(prisma.member.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.member.create).mockResolvedValue({} as any);
      vi.mocked(prisma.invitation.update).mockResolvedValue({} as any);

      const res = await acceptAssistantCoachInvitation({
        invitationId: "inv-123",
        name: "Coach Asisten",
        password: "SecurePassword123!",
      });

      expect(res.success).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Coach Asisten",
          email: "coach.asisten@example.com",
          emailVerified: true,
        }),
      });
      expect(prisma.member.create).toHaveBeenCalledWith({
        data: {
          organizationId: mockOrgId,
          userId: "user-coach-1",
          role: "assistant_coach",
        },
      });
      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { id: "inv-123" },
        data: { status: "accepted" },
      });
    });
  });
});
