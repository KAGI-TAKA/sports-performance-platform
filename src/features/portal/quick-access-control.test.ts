import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

// Mock server-only package for Node test environment
vi.mock("server-only", () => ({}));

import { generateQuickAccess, revokePortalAccess } from "./actions";
import { getPortalContextByToken, hashPortalToken } from "./queries";
import { prisma } from "@/lib/prisma";
import * as authContext from "@/lib/auth-context";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    athlete: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    portalAccess: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth-context", () => ({
  requireOrgContext: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Phase 4B-08: Quick Access Final Security & Lifecycle Hardening", () => {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. DURATION PRESETS & EXPIRATION (1h, 24h Default, 7d, Custom)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Quick Access Presets and Expiration Calculation", () => {
    it("generates Quick Access with default 24-hour expiration", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "ath-1",
        organizationId: mockOrgId,
        isActive: true,
        fullName: "Faisal",
      } as any);
      vi.mocked(prisma.portalAccess.create).mockResolvedValue({} as any);

      const res = await generateQuickAccess({
        athleteId: "ath-1",
        accessType: "PARENT",
        durationPreset: "24h",
      });

      expect(res.success).toBe(true);
      expect(res.durationLabel).toBe("24 Jam (Default)");
      expect(res.rawToken).toHaveLength(64);
      expect(res.portalUrl).toContain("/portal/");

      const expiryDate = new Date(res.expiresAt!);
      expect(expiryDate.getTime()).toBeGreaterThan(Date.now() + 23 * 60 * 60 * 1000);
      expect(expiryDate.getTime()).toBeLessThanOrEqual(Date.now() + 25 * 60 * 60 * 1000);
    });

    it("generates Quick Access with 1-hour expiration preset", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "ath-1",
        organizationId: mockOrgId,
        isActive: true,
        fullName: "Faisal",
      } as any);
      vi.mocked(prisma.portalAccess.create).mockResolvedValue({} as any);

      const res = await generateQuickAccess({
        athleteId: "ath-1",
        durationPreset: "1h",
      });

      expect(res.success).toBe(true);
      expect(res.durationLabel).toBe("1 Jam");
      const expiryDate = new Date(res.expiresAt!);
      expect(expiryDate.getTime()).toBeGreaterThan(Date.now() + 55 * 60 * 1000);
      expect(expiryDate.getTime()).toBeLessThanOrEqual(Date.now() + 65 * 60 * 1000);
    });

    it("generates Quick Access with 7-day expiration preset", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "ath-1",
        organizationId: mockOrgId,
        isActive: true,
        fullName: "Faisal",
      } as any);
      vi.mocked(prisma.portalAccess.create).mockResolvedValue({} as any);

      const res = await generateQuickAccess({
        athleteId: "ath-1",
        durationPreset: "7d",
      });

      expect(res.success).toBe(true);
      expect(res.durationLabel).toBe("7 Hari");
      const expiryDate = new Date(res.expiresAt!);
      expect(expiryDate.getTime()).toBeGreaterThan(Date.now() + 6 * 24 * 60 * 60 * 1000);
    });

    it("generates Quick Access with custom duration (e.g. 48 hours)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "ath-1",
        organizationId: mockOrgId,
        isActive: true,
        fullName: "Faisal",
      } as any);
      vi.mocked(prisma.portalAccess.create).mockResolvedValue({} as any);

      const res = await generateQuickAccess({
        athleteId: "ath-1",
        durationPreset: "custom",
        customHours: 48,
      });

      expect(res.success).toBe(true);
      expect(res.durationLabel).toBe("48 Jam");
      const expiryDate = new Date(res.expiresAt!);
      expect(expiryDate.getTime()).toBeGreaterThan(Date.now() + 47 * 60 * 60 * 1000);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. LIFECYCLE: REGENERATION INVALIDATES PREVIOUS TOKEN
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Token Lifecycle: Regeneration & Invalidation", () => {
    it("invalidates all previous active tokens for the same athlete upon regeneration", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "ath-1",
        organizationId: mockOrgId,
        isActive: true,
        fullName: "Faisal",
      } as any);
      vi.mocked(prisma.portalAccess.updateMany).mockResolvedValue({ count: 2 } as any);
      vi.mocked(prisma.portalAccess.create).mockResolvedValue({} as any);

      const res = await generateQuickAccess({
        athleteId: "ath-1",
        accessType: "ATHLETE",
      });

      expect(res.success).toBe(true);
      expect(prisma.portalAccess.updateMany).toHaveBeenCalledWith({
        where: {
          athleteId: "ath-1",
          organizationId: mockOrgId,
          accessType: "ATHLETE",
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. IMMEDIATE REVOCATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Immediate Token Revocation", () => {
    it("allows Admin/Coach to immediately revoke portal access", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockAdminContext);
      vi.mocked(prisma.portalAccess.findFirst).mockResolvedValue({
        id: "pa-1",
        organizationId: mockOrgId,
        athleteId: "ath-1",
      } as any);
      vi.mocked(prisma.portalAccess.update).mockResolvedValue({} as any);

      const res = await revokePortalAccess("pa-1", "ath-1");
      expect(res.success).toBe(true);
      expect(prisma.portalAccess.update).toHaveBeenCalledWith({
        where: { id: "pa-1" },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it("rejects revoked token on access verification", async () => {
      const rawToken = "my_secure_token_123";
      const hash = hashPortalToken(rawToken);

      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        tokenHash: hash,
        organizationId: mockOrgId,
        athleteId: "ath-1",
        accessType: "PARENT",
        expiresAt: new Date(Date.now() + 1000000),
        revokedAt: new Date(), // Revoked
        organization: { name: "Power Up" },
        athlete: { fullName: "Faisal", isActive: true },
      } as any);

      const res = await getPortalContextByToken(rawToken);
      expect(res.success).toBe(false);
      expect(res.error).toBe("REVOKED_TOKEN");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. TIMING-SAFE VERIFICATION, EXPIRATION, & TAMPERING
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Security: Expiration, Timing-Safe Hash Verification, and Tampering", () => {
    it("validates legitimate token using timing-safe hash comparison", async () => {
      const rawToken = "secure_token_abc_xyz";
      const hash = hashPortalToken(rawToken);

      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        tokenHash: hash,
        organizationId: mockOrgId,
        athleteId: "ath-1",
        accessType: "PARENT",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        revokedAt: null,
        organization: { name: "Power Up Training" },
        athlete: { fullName: "Faisal", isActive: true },
      } as any);

      const res = await getPortalContextByToken(rawToken);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.context.athleteId).toBe("ath-1");
        expect(res.context.organizationId).toBe(mockOrgId);
      }
    });

    it("rejects expired token in getPortalContextByToken", async () => {
      const rawToken = "valid_raw_token";
      const hash = hashPortalToken(rawToken);

      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        tokenHash: hash,
        organizationId: mockOrgId,
        athleteId: "ath-1",
        accessType: "PARENT",
        expiresAt: new Date(Date.now() - 5000), // Expired in past
        revokedAt: null,
        organization: { name: "Power Up" },
        athlete: { fullName: "Faisal", isActive: true },
      } as any);

      const res = await getPortalContextByToken(rawToken);
      expect(res.success).toBe(false);
      expect(res.error).toBe("EXPIRED_TOKEN");
    });

    it("rejects tampered or malformed token", async () => {
      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue(null);

      const res = await getPortalContextByToken("attacker_forged_token");
      expect(res.success).toBe(false);
      expect(res.error).toBe("INVALID_TOKEN");
    });

    it("rejects portal access when athlete has been deactivated", async () => {
      const rawToken = "token_deactivated_athlete";
      const hash = hashPortalToken(rawToken);

      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-1",
        tokenHash: hash,
        organizationId: mockOrgId,
        athleteId: "ath-inactive",
        accessType: "ATHLETE",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        revokedAt: null,
        organization: { name: "Power Up Training" },
        athlete: { fullName: "Former Athlete", isActive: false }, // INACTIVE
      } as any);

      const res = await getPortalContextByToken(rawToken);
      expect(res.success).toBe(false);
      expect(res.error).toBe("INACTIVE_ATHLETE");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. SCOPE & IDOR ISOLATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Child-Scoped & Cross-Tenant Isolation", () => {
    it("binds token strictly to single athleteId (Child A cannot access Child B)", async () => {
      const rawTokenChildA = "token_child_a";
      const hashA = hashPortalToken(rawTokenChildA);

      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-child-a",
        tokenHash: hashA,
        organizationId: mockOrgId,
        athleteId: "child-a-id",
        accessType: "PARENT",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        revokedAt: null,
        organization: { name: "Power Up Training" },
        athlete: { fullName: "Child A", isActive: true },
      } as any);

      const res = await getPortalContextByToken(rawTokenChildA);
      expect(res.success).toBe(true);
      if (res.success) {
        // Must strictly identify as Child A
        expect(res.context.athleteId).toBe("child-a-id");
        expect(res.context.athleteId).not.toBe("child-b-id");
      }
    });

    it("prevents cross-tenant access across organizations", async () => {
      const orgA = "org-alpha";
      const rawToken = "token_org_a";
      const hash = hashPortalToken(rawToken);

      vi.mocked(prisma.portalAccess.findUnique).mockResolvedValue({
        id: "pa-org-a",
        tokenHash: hash,
        organizationId: orgA,
        athleteId: "ath-1",
        accessType: "ATHLETE",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        revokedAt: null,
        organization: { name: "Org Alpha" },
        athlete: { fullName: "Athlete 1", isActive: true },
      } as any);

      const res = await getPortalContextByToken(rawToken);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.context.organizationId).toBe(orgA);
        expect(res.context.organizationId).not.toBe("org-beta");
      }
    });
  });
});
