import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only package for Node test environment
vi.mock("server-only", () => ({}));

// Mock all deep portal queries so ALLOW tests don't cascade into analytics
vi.mock("./queries", () => ({
  getPortalAthleteProfile: vi.fn().mockResolvedValue({
    profile: {
      fullName: "Faisal",
      position: "UNSPECIFIED",
      gender: "MALE",
      dateOfBirth: "2012-05-15",
      age: 13,
      photoUrl: null,
      jerseyNumber: null,
      heightCm: null,
      weightKg: null,
      wingspanCm: null,
      trainingLevel: "BEGINNER",
      sportCategory: "Basket",
    },
    latestSnapshot: null,
  }),
  getPortalAthleteProgress: vi.fn().mockResolvedValue({
    overallScore: null,
    overallGrade: null,
    trends: [],
    totalAssessments: 0,
  }),
  getPortalAthleteTrainingPlan: vi.fn().mockResolvedValue({ plan: null }),
  getPortalAthleteSchedule: vi.fn().mockResolvedValue({ sessions: [] }),
  getPortalAthleteSessionLogs: vi.fn().mockResolvedValue({ logs: [] }),
  getPortalAthleteReports: vi.fn().mockResolvedValue({ reports: [] }),
  getPortalAthleteGuidances: vi.fn().mockResolvedValue({ guidances: [] }),
  getPortalAthleteAchievements: vi.fn().mockResolvedValue({
    achievements: { starRating: 0, starLabel: "Belum Ada", totalAssessments: 0, completedSessions: 0, badges: [] },
  }),
  getPortalAthletePerformanceOverview: vi.fn().mockResolvedValue({ personalBests: [] }),
  getPortalAthleteGoals: vi.fn().mockResolvedValue([]),
  getPortalAthleteAttendance: vi.fn().mockResolvedValue({ attendance: null }),
  getPortalAthleteSiblings: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/features/parent-feedback/queries", () => ({
  getEligibleParentFeedbackSessions: vi.fn().mockResolvedValue({ sessions: [] }),
}));

import {
  getParentAuthorizedChildren,
  getParentChildPortalData,
  setParentAthleteRelationships,
} from "./parent-queries";
import { prisma } from "@/lib/prisma";
import * as authContext from "@/lib/auth-context";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    athlete: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    verification: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    portalAccess: {
      findMany: vi.fn(),
    },
    assessmentResultItem: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    assessment: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    trainingPlan: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    scheduleSession: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    sessionLog: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    report: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    coachGuidance: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    athleteGoal: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    attendance: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    parentFeedback: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("@/lib/auth-context", () => ({
  requireOrgContext: vi.fn(),
}));

const mockOrgA = "org-A-111";
const mockOrgB = "org-B-222";

const parentAContext = {
  userId: "user-parentA",
  organizationId: mockOrgA,
  memberId: "member-parentA",
  role: "parent",
  userName: "Ibu Siti",
  userEmail: "ibu.siti@example.com",
};

const parentBContext = {
  userId: "user-parentB",
  organizationId: mockOrgA,
  memberId: "member-parentB",
  role: "parent",
  userName: "Ibu Siti", // ← SAME NAME as Parent A — collision test
  userEmail: "ibu.siti2@example.com",
};

describe("Phase 4B-04A: Parent Relationship Security (Identity-Based)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Identity-based relationship (Verification table)", () => {
    it("should return only athletes explicitly linked to Parent A by userId, not by name", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(parentAContext);

      // Verification record shows Parent A is authorized for child-1 only
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: `parent-children:user-parentA:${mockOrgA}`,
        value: JSON.stringify(["child-1"]),
        expiresAt: new Date(Date.now() + 9999999),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(prisma.athlete.findMany).mockResolvedValue([
        { id: "child-1", fullName: "Faisal", sportCategory: "Basket", jerseyNumber: 10, dateOfBirth: new Date("2012-05-15"), photoUrl: null },
      ] as any);

      const children = await getParentAuthorizedChildren();
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe("child-1");

      // Must query DB with identity-based athleteId IN clause
      expect(prisma.athlete.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["child-1"] },
          organizationId: mockOrgA,
          isActive: true,
        },
        select: expect.any(Object),
        orderBy: { fullName: "asc" },
      });
    });

    it("CRITICAL: same-name Parent B CANNOT see Parent A's children (name collision)", async () => {
      // Parent B has same display name "Ibu Siti" but different userId
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(parentBContext);

      // Parent B's Verification record shows NO authorized children
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);

      const children = await getParentAuthorizedChildren();
      expect(children).toHaveLength(0);
      // Must NOT call athlete.findMany without a verified athlete list
      expect(prisma.athlete.findMany).not.toHaveBeenCalled();
    });

    it("should return empty list if no Verification record exists for parent", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(parentAContext);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);

      const children = await getParentAuthorizedChildren();
      expect(children).toHaveLength(0);
    });

    it("should return empty list if Verification record is expired", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(parentAContext);
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v-exp",
        identifier: `parent-children:user-parentA:${mockOrgA}`,
        value: JSON.stringify(["child-1"]),
        expiresAt: new Date(Date.now() - 5000), // Expired
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const children = await getParentAuthorizedChildren();
      expect(children).toHaveLength(0);
    });
  });

  describe("IDOR: getParentChildPortalData strict identity enforcement", () => {
    it("should DENY parent accessing an athlete not in their Verification record (IDOR)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(parentAContext);

      // Athlete exists in org
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "child-99",
        fullName: "Bambang",
        parentName: "Ibu Siti", // ← same name — but must NOT be enough
        organizationId: mockOrgA,
        isActive: true,
        organization: { name: "Power Up Academy" },
      } as any);

      // Parent A's Verification record does NOT include child-99
      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: `parent-children:user-parentA:${mockOrgA}`,
        value: JSON.stringify(["child-1"]), // ← child-99 NOT included
        expiresAt: new Date(Date.now() + 9999999),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await getParentChildPortalData("child-99");
      expect(res.success).toBe(false);
      expect(res.error).toContain("FORBIDDEN");
    });

    it("should DENY cross-tenant access (athlete in different org)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(parentAContext);

      // Prisma returns null because organizationId doesn't match
      vi.mocked(prisma.athlete.findFirst).mockResolvedValue(null);

      const res = await getParentChildPortalData("cross-tenant-ath");
      expect(res.success).toBe(false);
      expect(res.error).toContain("UNAUTHORIZED_OR_NOT_FOUND");
    });

    it("should ALLOW parent accessing their explicitly authorized child (auth gate passes)", async () => {
      vi.spyOn(authContext, "requireOrgContext").mockResolvedValue(parentAContext);

      vi.mocked(prisma.athlete.findFirst).mockResolvedValue({
        id: "child-1",
        fullName: "Faisal",
        parentName: "Ibu Siti",
        organizationId: mockOrgA,
        isActive: true,
        organization: { name: "Power Up Academy" },
        dateOfBirth: new Date("2012-05-15"),
        gender: "MALE",
        position: "UNSPECIFIED",
        trainingLevel: "BEGINNER",
        photoUrl: null,
        jerseyNumber: null,
        heightCm: null,
        weightKg: null,
        wingspanCm: null,
        sportCategory: "Basket",
        parentPhone: null,
        allergies: null,
        healthNotes: null,
      } as any);

      vi.mocked(prisma.verification.findFirst).mockResolvedValue({
        id: "v1",
        identifier: `parent-children:user-parentA:${mockOrgA}`,
        value: JSON.stringify(["child-1"]),
        expiresAt: new Date(Date.now() + 9999999),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await getParentChildPortalData("child-1");
      // Auth gate passes — success=true, NOT FORBIDDEN, NOT UNAUTHORIZED_OR_NOT_FOUND
      expect(res.success).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });

  describe("setParentAthleteRelationships (identity store)", () => {
    it("should store Verification record with correct key and athleteIds (findFirst+create pattern)", async () => {
      // Simulate no existing record
      vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.verification.create).mockResolvedValue({} as any);

      await setParentAthleteRelationships("user-parentA", mockOrgA, ["child-1", "child-2"]);

      expect(prisma.verification.create).toHaveBeenCalledWith({
        data: {
          identifier: `parent-children:user-parentA:${mockOrgA}`,
          value: JSON.stringify(["child-1", "child-2"]),
          expiresAt: expect.any(Date),
        },
      });
    });
  });
});
