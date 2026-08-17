import { describe, it, expect } from "vitest";
import crypto from "node:crypto";

export function hashPortalToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

export interface PortalAccessRecord {
  id: string;
  organizationId: string;
  athleteId: string;
  tokenHash: string;
  accessType: "ATHLETE" | "PARENT";
  expiresAt: Date;
  revokedAt: Date | null;
  athleteIsActive: boolean;
}

export function validatePortalToken(
  token: string,
  records: PortalAccessRecord[]
):
  | { valid: true; record: PortalAccessRecord }
  | { valid: false; error: "INVALID_TOKEN" | "EXPIRED_TOKEN" | "REVOKED_TOKEN" | "INACTIVE_ATHLETE" } {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "INVALID_TOKEN" };
  }

  const tokenHash = hashPortalToken(token);
  const record = records.find((r) => r.tokenHash === tokenHash);

  if (!record) {
    return { valid: false, error: "INVALID_TOKEN" };
  }

  if (record.revokedAt != null) {
    return { valid: false, error: "REVOKED_TOKEN" };
  }

  if (new Date() > record.expiresAt) {
    return { valid: false, error: "EXPIRED_TOKEN" };
  }

  if (!record.athleteIsActive) {
    return { valid: false, error: "INACTIVE_ATHLETE" };
  }

  return { valid: true, record };
}

export function sanitizePortalProfile(athlete: {
  id: string;
  organizationId: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string;
  internalCoachNotes?: string;
  secretMetadata?: string;
}) {
  return {
    id: athlete.id,
    fullName: athlete.fullName,
    jerseyNumber: athlete.jerseyNumber,
    position: athlete.position,
  };
}

describe("Phase 5.9 Athlete & Parent Portal Domain Unit Tests", () => {
  const rawTokenA = "5f9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f";
  const tokenHashA = hashPortalToken(rawTokenA);

  const mockRecords: PortalAccessRecord[] = [
    {
      id: "acc-1",
      organizationId: "org-1",
      athleteId: "ath-1",
      tokenHash: tokenHashA,
      accessType: "PARENT",
      expiresAt: new Date(Date.now() + 86400000), // 1 day in future
      revokedAt: null,
      athleteIsActive: true,
    },
    {
      id: "acc-expired",
      organizationId: "org-1",
      athleteId: "ath-1",
      tokenHash: hashPortalToken("expired-token"),
      accessType: "ATHLETE",
      expiresAt: new Date(Date.now() - 86400000), // 1 day in past
      revokedAt: null,
      athleteIsActive: true,
    },
    {
      id: "acc-revoked",
      organizationId: "org-1",
      athleteId: "ath-1",
      tokenHash: hashPortalToken("revoked-token"),
      accessType: "PARENT",
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: new Date(Date.now() - 3600000),
      athleteIsActive: true,
    },
    {
      id: "acc-inactive",
      organizationId: "org-1",
      athleteId: "ath-2",
      tokenHash: hashPortalToken("inactive-athlete-token"),
      accessType: "ATHLETE",
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
      athleteIsActive: false,
    },
  ];

  it("1. validates raw token via SHA-256 hash match", () => {
    const res = validatePortalToken(rawTokenA, mockRecords);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.record.athleteId).toBe("ath-1");
      expect(res.record.accessType).toBe("PARENT");
    }
  });

  it("2. rejects invalid or non-existent token", () => {
    const res = validatePortalToken("non-existent-token", mockRecords);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toBe("INVALID_TOKEN");
    }
  });

  it("3. rejects expired portal token (expiresAt < now)", () => {
    const res = validatePortalToken("expired-token", mockRecords);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toBe("EXPIRED_TOKEN");
    }
  });

  it("4. rejects revoked portal token (revokedAt !== null)", () => {
    const res = validatePortalToken("revoked-token", mockRecords);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toBe("REVOKED_TOKEN");
    }
  });

  it("5. rejects portal token for inactive athlete (athlete.isActive === false)", () => {
    const res = validatePortalToken("inactive-athlete-token", mockRecords);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toBe("INACTIVE_ATHLETE");
    }
  });

  it("6. ensures portal profile DTO strips internal coach notes & metadata", () => {
    const dto = sanitizePortalProfile({
      id: "ath-1",
      organizationId: "org-1",
      fullName: "Budi Santoso",
      jerseyNumber: 7,
      position: "POINT_GUARD",
      internalCoachNotes: "Confidential note",
      secretMetadata: "Secret",
    });

    expect(dto).toEqual({
      id: "ath-1",
      fullName: "Budi Santoso",
      jerseyNumber: 7,
      position: "POINT_GUARD",
    });
    expect((dto as Record<string, unknown>).internalCoachNotes).toBeUndefined();
    expect((dto as Record<string, unknown>).secretMetadata).toBeUndefined();
  });
});
