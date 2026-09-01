import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only package for Node test environment
vi.mock("server-only", () => ({}));


// Mock server-only package for Node test environment
vi.mock("server-only", () => ({}));

import {
  getParentAuthorizedChildren,
  getParentChildPortalData,
} from "./parent-queries";
import { prisma } from "@/lib/prisma";
import * as authContext from "@/lib/auth-context";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    athlete: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    assessment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    trainingPlan: {
      findFirst: vi.fn(),
    },
    scheduleSession: {
      findMany: vi.fn(),
    },
    sessionLog: {
      findMany: vi.fn(),
    },
    report: {
      findMany: vi.fn(),
    },
    coachGuidance: {
      findMany: vi.fn(),
    },
    athleteGoal: {
      findMany: vi.fn(),
    },
    attendance: {
      findMany: vi.fn(),
    },
    parentFeedback: {
      findMany: vi.fn(),
    },
    portalAccess: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    verification: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth-context", () => ({
  requireOrgContext: vi.fn(),
}));

describe("Phase 4B-04: Parent Multi-Child Portal & Strict IDOR Security", () => {
  const mockOrgId = "org-test-123";
  const mockParentContext = {
    userId: "parent-user-id",
    organizationId: mockOrgId,
    memberId: "parent-member-id",
    role: "parent",
    userName: "Ibu Siti",
    userEmail: "ibu.siti@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Parent Authorized Children Listing", () => {
    it("should return only athletes associated with the authenticated parent in the organization", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockParentContext);
      vi.mocked(prisma.athlete.findMany).mockResolvedValue([
        {
          id: "child-1",
          fullName: "Faisal",
          sportCategory: "Basket",
          jerseyNumber: 10,
          dateOfBirth: new Date("2012-05-15"),
          photoUrl: null,
        },
        {
          id: "child-2",
          fullName: "Aisyah",
          sportCategory: "Bulutangkis",
          jerseyNumber: null,
          dateOfBirth: new Date("2015-08-20"),
          photoUrl: null,
        },
      ] as any);

      // Verification record links parent to child-1 and child-2 by userId
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: `parent-children:parent-user-id:${mockOrgId}`,
        value: JSON.stringify(["child-1", "child-2"]),
        expiresAt: new Date(Date.now() + 9999999),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const children = await getParentAuthorizedChildren();
      expect(children).toHaveLength(2);
      expect(children[0].fullName).toBe("Faisal");
      expect(children[1].fullName).toBe("Aisyah");
      // Authorization is id-based, not name-based
      expect(prisma.athlete.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["child-1", "child-2"] },
          organizationId: mockOrgId,
          isActive: true,
        },
        select: expect.any(Object),
        orderBy: { fullName: "asc" },
      });
    });
  });

  describe("Strict Server-Side IDOR Prevention", () => {
    it("should strictly reject parent attempting to access an unauthorized child (IDOR)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockParentContext);

      // Verification record does NOT include foreign-child-99
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "foreign-child-99",
        fullName: "Bambang",
        parentName: "Pak Budi",
        organizationId: mockOrgId,
        isActive: true,
        organization: { name: "Power Up Academy" },
      } as any);

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: `parent-children:parent-user-id:${mockOrgId}`,
        value: JSON.stringify(["child-1"]), // foreign-child-99 NOT in list
        expiresAt: new Date(Date.now() + 9999999),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await getParentChildPortalData("foreign-child-99");
      expect(res.success).toBe(false);
      expect(res.error).toContain("FORBIDDEN: Anda tidak memiliki izin untuk mengakses data atlet ini");
    });

    it("should reject access if athlete is from a different organization (Cross-Tenant)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(mockParentContext);

      // Query returns null because organizationId does not match
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue(null);

      const res = await getParentChildPortalData("cross-tenant-ath");
      expect(res.success).toBe(false);
      expect(res.error).toContain("UNAUTHORIZED_OR_NOT_FOUND");
    });
  });
});
