import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only so parent-queries.ts can be imported in test environment
vi.mock("server-only", () => ({}));

// Mock env.server
vi.mock("@/lib/env.server", () => ({
  env: {
    BETTER_AUTH_URL: "http://localhost:3000",
    EMAIL_FROM: "test@test.com",
  },
}));

// Mock email helpers
vi.mock("@/lib/email", () => ({
  sendAssistantCoachInvitationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendParentInvitationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendAthleteActivationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendEmailVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock the parent-queries module
vi.mock("@/features/portal/parent-queries", () => ({
  setParentAthleteRelationships: vi.fn().mockResolvedValue(undefined),
  addChildToParent: vi.fn().mockResolvedValue({ success: true }),
  removeChildFromParent: vi.fn().mockResolvedValue({ success: true }),
  getParentLinkedChildren: vi.fn().mockResolvedValue([]),
  getAuthorizedAthleteIds: vi.fn().mockResolvedValue([]),
}));

import {
  provisionUser,
  listOrganizationUsers,
  updateUserProfile,
  toggleUserActiveStatus,
  deleteUserPermanently,
  resendInvitationAction,
} from "./actions";
import { prisma } from "@/lib/prisma";
import * as authContext from "@/lib/auth-context";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
    athlete: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    portalAccess: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    invitation: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    verification: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("@/lib/auth-context", () => ({
  requireOrgContext: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Phase 4B-09: User Management & Role UX Correction", () => {
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

  describe("Server-side Authorization Checks", () => {
    it("should reject non-admin users attempting to provision a user", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue({
        ...mockAdminContext,
        role: "assistant_coach",
      });

      const res = await provisionUser({
        role: "assistant_coach",
        name: "Coach Budi",
        email: "budi@example.com",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Hanya Admin");
    });
  });

  describe("Assistant Coach & Head Coach Provisioning", () => {
    it("should provision Head Coach and create pending invitation link", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.member.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "hc-user-1",
        name: "Head Coach Andi",
        email: "andi@example.com",
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.member.create).mockResolvedValue({
        id: "hc-member-1",
        organizationId: mockOrgId,
        userId: "hc-user-1",
        role: "head_coach",
        createdAt: new Date(),
      });
      vi.mocked(prisma.invitation.create).mockResolvedValue({
        id: "inv-1",
        organizationId: mockOrgId,
        email: "andi@example.com",
        role: "head_coach",
        status: "pending",
        inviterId: "admin-user-id",
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const res = await provisionUser({
        role: "head_coach",
        name: "Head Coach Andi",
        email: "andi@example.com",
      });

      expect(res.success).toBe(true);
      expect(res.user?.role).toBe("head_coach");
      expect(res.inviteUrl).toContain("/invitations/accept?id=inv-1");
      expect(prisma.invitation.create).toHaveBeenCalled();
    });
  });

  describe("Parent Provisioning & Child Linking", () => {
    it("should successfully provision Parent and return inviteUrl", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.athlete.findMany).mockResolvedValue([
        { id: "ath-1", fullName: "Anak 1" } as any,
        { id: "ath-2", fullName: "Anak 2" } as any,
      ]);
      vi.mocked(prisma.member.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "parent-user-1",
        name: "Ibu Siti",
        email: "ibu.siti@example.com",
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.member.create).mockResolvedValue({
        id: "parent-member-1",
        organizationId: mockOrgId,
        userId: "parent-user-1",
        role: "parent",
        createdAt: new Date(),
      });
      vi.mocked(prisma.invitation.create).mockResolvedValue({
        id: "inv-parent-1",
        organizationId: mockOrgId,
        email: "ibu.siti@example.com",
        role: "parent",
        status: "pending",
        inviterId: "admin-user-id",
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const res = await provisionUser({
        role: "parent",
        name: "Ibu Siti",
        email: "ibu.siti@example.com",
        athleteIds: ["ath-1", "ath-2"],
      });

      expect(res.success).toBe(true);
      expect(res.user?.role).toBe("parent");
      expect(res.inviteUrl).toContain("/invitations/accept?id=inv-parent-1");
    });
  });

  describe("Athlete Provisioning & Automatic Name Derivation", () => {
    it("should auto-derive athlete name from athlete profile without throwing validation error", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "ath-1",
        fullName: "Faisal",
        organizationId: mockOrgId,
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "athlete-user-1",
        name: "Faisal",
        email: "faisal_youth@athlete.internal",
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.member.create).mockResolvedValue({
        id: "ath-mem-1",
        organizationId: mockOrgId,
        userId: "athlete-user-1",
        role: "athlete",
        createdAt: new Date(),
      });
      vi.mocked(prisma.portalAccess.create).mockResolvedValue({} as any);

      // Pass without explicit name - should succeed by auto-deriving from profile
      const res = await provisionUser({
        role: "athlete",
        username: "faisal_youth",
        athleteId: "ath-1",
      });

      expect(res.success).toBe(true);
      expect(res.user?.name).toBe("Faisal");
      expect(res.user?.role).toBe("athlete");
    });
  });

  describe("Lifecycle Controls: Edit User, Activate/Deactivate, Delete, and Resend Invitation", () => {
    it("should update user profile information", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-1",
        userId: "u-1",
        role: "assistant_coach",
        user: { email: "coach@test.com" },
      } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const res = await updateUserProfile({
        userId: "u-1",
        memberId: "mem-1",
        name: "Coach Budi Santoso",
        email: "budi.new@test.com",
      });

      expect(res.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u-1" },
        data: { name: "Coach Budi Santoso", email: "budi.new@test.com" },
      });
    });

    it("should prevent self-deactivation by the logged-in admin", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);

      const res = await toggleUserActiveStatus(
        "admin-user-id", // Same as ctx.userId
        "admin-member-id",
        false
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak dapat menonaktifkan akun Anda sendiri");
    });

    it("should deactivate user and purge their active sessions", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-target",
        userId: "target-user-id",
      } as any);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 2 } as any);

      const res = await toggleUserActiveStatus(
        "target-user-id",
        "mem-target",
        false // Deactivate
      );

      expect(res.success).toBe(true);
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "target-user-id" },
      });
    });

    it("should delete user permanently and clean up records", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-del-1",
        userId: "u-del-1",
        role: "parent",
        user: { id: "u-del-1", email: "delete.me@test.com", name: "Test User" },
      } as any);
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.member.delete).mockResolvedValue({} as any);
      vi.mocked(prisma.invitation.deleteMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.verification.deleteMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.member.count).mockResolvedValue(0);
      vi.mocked(prisma.user.delete).mockResolvedValue({} as any);

      const res = await deleteUserPermanently("u-del-1", "mem-del-1");

      expect(res.success).toBe(true);
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "u-del-1" } });
      expect(prisma.member.delete).toHaveBeenCalledWith({ where: { id: "mem-del-1" } });
    });

    it("should resend invitation by invalidating old pending invitation and creating a new one", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.invitation.deleteMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.invitation.create).mockResolvedValue({
        id: "new-inv-123",
      } as any);

      const res = await resendInvitationAction("coach@example.com", "assistant_coach");

      expect(res.success).toBe(true);
      expect(res.inviteUrl).toContain("new-inv-123");
      expect(prisma.invitation.deleteMany).toHaveBeenCalled();
      expect(prisma.invitation.create).toHaveBeenCalled();
    });
  });
});
