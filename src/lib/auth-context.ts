import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./prisma";

export type OrgContext = {
  userId: string;
  organizationId: string;
  memberId: string;
  role: string;
  userName: string;
  userEmail: string;
};

// In-memory short-lived cache (15s TTL) for verified session tokens
interface CachedSessionContext {
  context: OrgContext;
  expiresAt: number;
}

const sessionContextCache = new Map<string, CachedSessionContext>();
const CACHE_TTL_MS = 15_000; // 15 seconds
const MAX_CACHE_SIZE = 1_000;

function getCachedContext(token: string): OrgContext | null {
  const item = sessionContextCache.get(token);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    sessionContextCache.delete(token);
    return null;
  }
  return item.context;
}

function setCachedContext(token: string, context: OrgContext): void {
  if (sessionContextCache.size >= MAX_CACHE_SIZE) {
    // Evict expired entries or oldest entry
    const now = Date.now();
    for (const [key, val] of sessionContextCache.entries()) {
      if (now > val.expiresAt) {
        sessionContextCache.delete(key);
      }
    }
    if (sessionContextCache.size >= MAX_CACHE_SIZE) {
      const firstKey = sessionContextCache.keys().next().value;
      if (firstKey) sessionContextCache.delete(firstKey);
    }
  }
  sessionContextCache.set(token, {
    context,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function invalidateSessionContext(token?: string): void {
  if (token) {
    sessionContextCache.delete(token);
  } else {
    sessionContextCache.clear();
  }
}

export const requireOrgContext = cache(async function requireOrgContext(): Promise<OrgContext> {
  const reqHeaders = await headers();
  
  // Extract session token from cookie header for fast cache lookup
  const cookieHeader = reqHeaders.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
  const rawCookieVal = tokenMatch ? decodeURIComponent(tokenMatch[1]) : "";
  const tokenKey = rawCookieVal.split(".")[0]; // Token prefix before signature

  if (tokenKey) {
    const cached = getCachedContext(tokenKey);
    if (cached) {
      return cached;
    }
  }

  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) redirect("/login");

  let organizationId = session.session.activeOrganizationId;

  if (!organizationId) {
    const firstMember = await prisma.member.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: { organizationId: true },
    });

    if (!firstMember) {
      redirect("/onboarding/organization");
    }

    organizationId = firstMember.organizationId;

    try {
      await auth.api.setActiveOrganization({
        headers: reqHeaders,
        body: { organizationId },
      });
    } catch (err) {
      console.error("Gagal auto-set active organization:", err);
    }
  }

  // Optimized indexed direct lookup by compound key (organizationId, userId)
  const dbMember = await prisma.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: organizationId,
        userId: session.user.id,
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!dbMember) {
    redirect("/onboarding/organization");
  }

  const orgContext: OrgContext = {
    userId: session.user.id,
    organizationId,
    memberId: dbMember.id,
    role: dbMember.role,
    userName: session.user.name,
    userEmail: session.user.email,
  };

  if (tokenKey) {
    setCachedContext(tokenKey, orgContext);
  }

  return orgContext;
});
