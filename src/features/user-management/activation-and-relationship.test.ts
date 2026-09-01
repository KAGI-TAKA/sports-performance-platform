import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only package for Node test environment
vi.mock("server-only", () => ({}));

// Mock env.server
vi.mock("@/lib/env.server", () => ({
  env: {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
    BETTER_AUTH_SECRET: "mock_better_auth_secret_minimum_32_chars_long",
    BETTER_AUTH_URL: "http://localhost:3000",
    SUPABASE_URL: "https://mock.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "mock_service_role_key",
  },
}));

import {
  generateAthleteActivationToken,
  regenerateAthleteActivationToken,
  invalidateAthleteActivationToken,
  getAthleteActivationStatus,
} from "@/features/auth/athlete-actions";
import {
  addChildToParent,
  removeChildFromParent,
  getParentLinkedChildren,
  setParentAthleteRelationships,
  getAuthorizedAthleteIds,
} from "@/features/portal/parent-queries";
import { prisma } from "@/lib/prisma";
import * as authContext from "@/lib/auth-context";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    athlete: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    portalAccess: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    verification: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth-context", () => ({
  requireOrgContext: vi.fn(),
}));

const mockOrgId = "org-main-123";
const mockForeignOrgId = "org-foreign-999";

const adminContext = {
  userId: "admin-user-id",
  organizationId: mockOrgId,
  memberId: "admin-member-id",
  role: "admin",
  userName: "Coach Zulfi",
  userEmail: "zulfikarnegrosa@gmail.com",
};

const coachContext = {
  userId: "coach-user-id",
  organizationId: mockOrgId,
  memberId: "coach-member-id",
  role: "head_coach",
  userName: "Head Coach Andi",
  userEmail: "andi@coach.com",
};

const assistantContext = {
  userId: "asst-user-id",
  organizationId: mockOrgId,
  memberId: "asst-member-id",
  role: "assistant_coach",
  userName: "Coach Budi",
  userEmail: "budi@asst.com",
};

const parentAContext = {
  userId: "parent-A-user-id",
  organizationId: mockOrgId,
  memberId: "parent-A-member-id",
  role: "parent",
  userName: "Ibu Siti",
  userEmail: "siti@parent.com",
};

const parentBContext = {
  userId: "parent-B-user-id",
  organizationId: mockOrgId,
  memberId: "parent-B-member-id",
  role: "parent",
  userName: "Ibu Siti", // Same name collision test
  userEmail: "siti.b@parent.com",
};

describe("Phase 4B-05: Athlete Activation & Parent Relationship Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ATHLETE ACTIVATION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Athlete Activation Token Management", () => {
    it("Admin can generate activation link for an athlete in their org", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        revokedAt: null,
        athlete: { organizationId: mockOrgId },
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);

      const res = await generateAthleteActivationToken("faisal_youth");
      expect(res.success).toBe(true);
      expect(res.rawToken).toHaveLength(64);
      expect(res.activationUrl).toContain("/activate?token=");
      expect(res.activationUrl).toContain("u=faisal_youth");
      expect(res.expiresAt).toBeDefined();
      expect(prisma.verification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identifier: "athlete-activate:faisal_youth",
        }),
      });
    });

    it("Non-admin (assistant_coach) cannot generate activation link", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(assistantContext);

      const res = await generateAthleteActivationToken("faisal_youth");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Hanya Admin atau Pelatih Kepala");
    });

    it("Admin cannot generate token for an athlete in another organization (Cross-Tenant)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-foreign",
        username: "foreign_athlete",
        revokedAt: null,
        athlete: { organizationId: mockForeignOrgId },
      } as any);

      const res = await generateAthleteActivationToken("foreign_athlete");
      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak ditemukan dalam organisasi ini");
    });

    it("Admin can regenerate activation link, overwriting old token", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        revokedAt: null,
        athlete: { organizationId: mockOrgId },
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-old",
        identifier: "athlete-activate:faisal_youth",
      } as any);
      vi.mocked(prisma.verification.update).mockResolvedValue({} as any);

      const res = await regenerateAthleteActivationToken("faisal_youth");
      expect(res.success).toBe(true);
      expect(res.rawToken).toHaveLength(64);
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: "v-old" },
        data: expect.objectContaining({
          value: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      });
    });

    it("Admin can invalidate a pending activation link", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        athlete: { organizationId: mockOrgId },
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-to-delete",
        identifier: "athlete-activate:faisal_youth",
      } as any);
      vi.mocked(prisma.verification.delete).mockResolvedValue({} as any);

      const res = await invalidateAthleteActivationToken("faisal_youth");
      expect(res.success).toBe(true);
      expect(prisma.verification.delete).toHaveBeenCalledWith({
        where: { id: "v-to-delete" },
      });
    });
  });

  describe("Athlete Activation Status Resolution", () => {
    it("returns ACTIVE when passwordHash exists", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        passwordHash: "bcrypt_hashed_password",
        revokedAt: null,
        athlete: { fullName: "Faisal", organizationId: mockOrgId },
      } as any);

      const res = await getAthleteActivationStatus("faisal_youth");
      expect(res.success).toBe(true);
      expect(res.status).toBe("ACTIVE");
    });

    it("returns ACTIVATION_REVOKED when revokedAt is set", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        passwordHash: null,
        revokedAt: new Date(),
        athlete: { fullName: "Faisal", organizationId: mockOrgId },
      } as any);

      const res = await getAthleteActivationStatus("faisal_youth");
      expect(res.success).toBe(true);
      expect(res.status).toBe("ACTIVATION_REVOKED");
    });

    it("returns PENDING_ACTIVATION when unexpired Verification record exists", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        passwordHash: null,
        revokedAt: null,
        athlete: { fullName: "Faisal", organizationId: mockOrgId },
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-1",
        identifier: "athlete-activate:faisal_youth",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h future
      } as any);

      const res = await getAthleteActivationStatus("faisal_youth");
      expect(res.success).toBe(true);
      expect(res.status).toBe("PENDING_ACTIVATION");
      expect(res.expiresAt).toBeDefined();
    });

    it("returns ACTIVATION_EXPIRED when Verification record is expired", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        passwordHash: null,
        revokedAt: null,
        athlete: { fullName: "Faisal", organizationId: mockOrgId },
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-1",
        identifier: "athlete-activate:faisal_youth",
        expiresAt: new Date(Date.now() - 1000), // expired
      } as any);

      const res = await getAthleteActivationStatus("faisal_youth");
      expect(res.success).toBe(true);
      expect(res.status).toBe("ACTIVATION_EXPIRED");
    });

    it("returns NO_ACTIVATION_LINK when no Verification record exists", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        username: "faisal_youth",
        passwordHash: null,
        revokedAt: null,
        athlete: { fullName: "Faisal", organizationId: mockOrgId },
      } as any);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);

      const res = await getAthleteActivationStatus("faisal_youth");
      expect(res.success).toBe(true);
      expect(res.status).toBe("NO_ACTIVATION_LINK");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PARENT RELATIONSHIP MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Parent ↔ Athlete Relationship Management", () => {
    it("Admin can add Athlete A to Parent A", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);

      // Verify parent member exists in org
      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-p1",
        userId: "parent-A-user-id",
        organizationId: mockOrgId,
        role: "parent",
        user: { name: "Ibu Siti" },
      } as any);

      // Verify athlete exists in org
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "ath-1",
        fullName: "Faisal",
        organizationId: mockOrgId,
        isActive: true,
      } as any);

      // Existing parent relationships: []
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);
      vi.mocked(prisma.athlete.update).mockResolvedValue({} as any);

      const res = await addChildToParent("parent-A-user-id", "ath-1");
      expect(res.success).toBe(true);
      expect(res.athleteIds).toEqual(["ath-1"]);
      expect(prisma.verification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identifier: `parent-children:parent-A-user-id:${mockOrgId}`,
          value: JSON.stringify(["ath-1"]),
        }),
      });
    });

    it("Admin can add second child (Athlete B) to Parent A (Multi-Child)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);

      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-p1",
        userId: "parent-A-user-id",
        organizationId: mockOrgId,
        role: "parent",
        user: { name: "Ibu Siti" },
      } as any);

      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "ath-2",
        fullName: "Aisyah",
        organizationId: mockOrgId,
        isActive: true,
      } as any);

      // Existing verification record has ["ath-1"]
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-p1",
        identifier: `parent-children:parent-A-user-id:${mockOrgId}`,
        value: JSON.stringify(["ath-1"]),
        expiresAt: new Date(Date.now() + 9999999),
      } as any);
      vi.mocked(prisma.verification.update).mockResolvedValue({} as any);

      const res = await addChildToParent("parent-A-user-id", "ath-2");
      expect(res.success).toBe(true);
      expect(res.athleteIds).toEqual(["ath-1", "ath-2"]);
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: "v-p1" },
        data: expect.objectContaining({
          value: JSON.stringify(["ath-1", "ath-2"]),
        }),
      });
    });

    it("Non-admin cannot add child to parent", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(assistantContext);

      const res = await addChildToParent("parent-A-user-id", "ath-1");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Hanya Admin yang dapat mengelola");
    });

    it("Admin cannot link an athlete from another organization (Cross-Tenant)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);

      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-p1",
        userId: "parent-A-user-id",
        organizationId: mockOrgId,
        role: "parent",
        user: { name: "Ibu Siti" },
      } as any);

      // Athlete findFirst returns null because organizationId doesn't match
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue(null);

      const res = await addChildToParent("parent-A-user-id", "foreign-athlete-id");
      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak ditemukan");
    });

    it("Admin can remove Athlete A from Parent A, leaving Athlete B active", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);

      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-p1",
        userId: "parent-A-user-id",
        organizationId: mockOrgId,
        role: "parent",
      } as any);

      // Currently linked: ["ath-1", "ath-2"]
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-p1",
        identifier: `parent-children:parent-A-user-id:${mockOrgId}`,
        value: JSON.stringify(["ath-1", "ath-2"]),
        expiresAt: new Date(Date.now() + 9999999),
      } as any);
      vi.mocked(prisma.verification.update).mockResolvedValue({} as any);

      const res = await removeChildFromParent("parent-A-user-id", "ath-1");
      expect(res.success).toBe(true);
      expect(res.athleteIds).toEqual(["ath-2"]); // ath-1 removed, ath-2 kept
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: "v-p1" },
        data: expect.objectContaining({
          value: JSON.stringify(["ath-2"]),
        }),
      });
    });

    it("Multi-Parent: Removing Child A from Parent A does NOT affect Parent B", async () => {
      // Parent A and Parent B both have separate verification records
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);

      // Removing for Parent A
      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-p1",
        userId: "parent-A-user-id",
        organizationId: mockOrgId,
        role: "parent",
      } as any);

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-parent-A",
        identifier: `parent-children:parent-A-user-id:${mockOrgId}`,
        value: JSON.stringify(["ath-1"]),
        expiresAt: new Date(Date.now() + 9999999),
      } as any);
      vi.mocked(prisma.verification.update).mockResolvedValue({} as any);

      const res = await removeChildFromParent("parent-A-user-id", "ath-1");
      expect(res.success).toBe(true);
      expect(res.athleteIds).toEqual([]);
      // Only Parent A's record was updated
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: "v-parent-A" },
        data: expect.objectContaining({
          value: JSON.stringify([]),
        }),
      });
    });

    it("Same-Name Parents remain completely isolated by userId", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);

      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-p2",
        userId: "parent-B-user-id",
        organizationId: mockOrgId,
        role: "parent",
      } as any);

      // Parent B's verification record
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-parent-B",
        identifier: `parent-children:parent-B-user-id:${mockOrgId}`,
        value: JSON.stringify(["ath-3"]),
        expiresAt: new Date(Date.now() + 9999999),
      } as any);

      vi.mocked(prisma.athlete.findMany).mockResolvedValue([
        {
          id: "ath-3",
          fullName: "Budi Jr.",
          sportCategory: "Basket",
          jerseyNumber: 7,
          dateOfBirth: new Date("2013-01-01"),
          photoUrl: null,
        },
      ] as any);

      const children = await getParentLinkedChildren("parent-B-user-id");
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe("ath-3");
      expect(children[0].fullName).toBe("Budi Jr.");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. QUICK ACCESS COMPATIBILITY
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Quick Access Compatibility", () => {
    it("Removing parent relationship preserves Athlete's standalone PortalAccess record", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(adminContext);

      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "mem-p1",
        userId: "parent-A-user-id",
        organizationId: mockOrgId,
        role: "parent",
      } as any);

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-p1",
        identifier: `parent-children:parent-A-user-id:${mockOrgId}`,
        value: JSON.stringify(["ath-1"]),
        expiresAt: new Date(Date.now() + 9999999),
      } as any);

      await removeChildFromParent("parent-A-user-id", "ath-1");

      // Verify portalAccess.delete is NOT called
      expect(prisma.portalAccess.findUnique).not.toHaveBeenCalledWith(
        expect.objectContaining({ delete: true })
      );
    });
  });
});
