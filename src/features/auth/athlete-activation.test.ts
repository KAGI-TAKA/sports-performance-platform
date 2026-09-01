import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only package for Node test environment
vi.mock("server-only", () => ({}));

// Mock env.server to provide clean testing values
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

// Mock auth-context so env.server/auth.ts are never imported
vi.mock("@/lib/auth-context", () => ({
  requireOrgContext: vi.fn(),
}));

import { activateAthleteAccount, validateActivationToken } from "./athlete-actions";
import { prisma } from "@/lib/prisma";

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

import crypto from "node:crypto";

function makeValidToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

describe("Phase 4B-04 (Regression): Athlete Activation (token-based)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully activate athlete account with a valid token and hash password", async () => {
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
      id: "pa-athlete-1",
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
      password: "MyAthletePassword123!",
    });

    expect(res.success).toBe(true);
    expect(prisma.portalAccess.update).toHaveBeenCalledWith({
      where: { id: "pa-athlete-1" },
      data: {
        passwordHash: expect.any(String),
        plainPassword: null,
      },
    });
    // Token must be deleted after use
    expect(prisma.verification.delete).toHaveBeenCalled();
  });

  it("should reject activation if no Verification record exists (username alone insufficient)", async () => {
    vi.mocked(prisma.verification.findFirst).mockResolvedValue(null);

    const { raw } = makeValidToken();
    const res = await activateAthleteAccount({
      rawToken: raw,
      username: "unknown_user",
      password: "Password123!",
    });

    expect(res.success).toBe(false);
  });

  it("should reject activation if portal access is revoked", async () => {
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
      id: "pa-revoked",
      username: "faisal_youth",
      revokedAt: new Date(),
      athlete: { fullName: "Faisal" },
    } as any);

    const res = await activateAthleteAccount({
      rawToken: raw,
      username: "faisal_youth",
      password: "Password123!",
    });

    expect(res.success).toBe(false);
  });
});
