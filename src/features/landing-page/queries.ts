import { prisma } from "@/lib/prisma";
import { DEFAULT_LANDING_PAGE_CONFIG, type LandingPageConfig, type PricingArea } from "./types";

export function mergeWithDefaultConfig(saved?: Partial<LandingPageConfig> | null): LandingPageConfig {
  if (!saved) return DEFAULT_LANDING_PAGE_CONFIG;

  let resolvedYapAreas: PricingArea[] = [];

  if (saved.pricing?.yapAreas && saved.pricing.yapAreas.length > 0) {
    resolvedYapAreas = saved.pricing.yapAreas;
  } else if (
    (saved.pricing?.yapSalatiga && saved.pricing.yapSalatiga.length > 0) ||
    (saved.pricing?.yapSemarang && saved.pricing.yapSemarang.length > 0)
  ) {
    // Graceful migration from earlier structure
    resolvedYapAreas = [
      {
        id: "salatiga",
        name: "Area Salatiga",
        badgeLabel: "Salatiga",
        venueLocation: saved.contact?.salatigaLocation || "Fasilitas Lintasan Atletik & Lapangan Rumput Salatiga",
        tiers: saved.pricing.yapSalatiga || DEFAULT_LANDING_PAGE_CONFIG.pricing.yapAreas[0].tiers,
      },
      {
        id: "semarang",
        name: "Area Semarang",
        badgeLabel: "Semarang",
        venueLocation: saved.contact?.semarangLocation || "Fasilitas Pelatihan Atletik Terstandar Semarang",
        tiers: saved.pricing.yapSemarang || DEFAULT_LANDING_PAGE_CONFIG.pricing.yapAreas[1].tiers,
      },
    ];
  } else {
    resolvedYapAreas = DEFAULT_LANDING_PAGE_CONFIG.pricing.yapAreas;
  }

  return {
    announcement: {
      ...DEFAULT_LANDING_PAGE_CONFIG.announcement,
      ...(saved.announcement || {}),
    },
    contact: {
      ...DEFAULT_LANDING_PAGE_CONFIG.contact,
      ...(saved.contact || {}),
    },
    pricing: {
      yapAreas: resolvedYapAreas,
      mfdPricing: saved.pricing?.mfdPricing && saved.pricing.mfdPricing.length > 0
        ? saved.pricing.mfdPricing
        : DEFAULT_LANDING_PAGE_CONFIG.pricing.mfdPricing,
    },
  };
}

export async function getLandingPageConfig(orgId?: string): Promise<LandingPageConfig> {
  try {
    let org = null;
    if (orgId) {
      org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { metadata: true },
      });
    }

    // 1. Try exact slug for Coach Zulfi Hub
    if (!org || !org.metadata) {
      org = await prisma.organization.findUnique({
        where: { slug: "coach-zulfi-hub" },
        select: { metadata: true },
      });
    }

    // 2. Try any organization with landingPage configuration in metadata
    if (!org || !org.metadata) {
      org = await prisma.organization.findFirst({
        where: {
          metadata: {
            contains: "landingPage",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: { metadata: true },
      });
    }

    // 3. Fallback to any organization matching Zulfi with non-null metadata
    if (!org || !org.metadata) {
      org = await prisma.organization.findFirst({
        where: {
          name: { contains: "Zulfi", mode: "insensitive" },
          metadata: { not: null },
        },
        select: { metadata: true },
      });
    }

    if (org?.metadata) {
      const parsed = JSON.parse(org.metadata);
      if (parsed.landingPage) {
        return mergeWithDefaultConfig(parsed.landingPage);
      }
    }
  } catch (err) {
    console.error("[getLandingPageConfig] Fallback to default landing page config:", err);
  }

  return DEFAULT_LANDING_PAGE_CONFIG;
}
