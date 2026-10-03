import { describe, it, expect } from "vitest";
import { DEFAULT_LANDING_PAGE_CONFIG } from "./types";
import { landingPageConfigSchema } from "./schema";
import { mergeWithDefaultConfig } from "./queries";

describe("Landing Page Config & Dynamic Pricing System", () => {
  it("validates DEFAULT_LANDING_PAGE_CONFIG against schema successfully", () => {
    const parsed = landingPageConfigSchema.safeParse(DEFAULT_LANDING_PAGE_CONFIG);
    expect(parsed.success).toBe(true);
  });

  it("ensures YAP has dynamic areas with Area Salatiga and Area Semarang", () => {
    const areas = DEFAULT_LANDING_PAGE_CONFIG.pricing.yapAreas;
    expect(areas.length).toBeGreaterThanOrEqual(2);

    const salatiga = areas.find((a) => a.id === "salatiga");
    expect(salatiga).toBeDefined();
    expect(salatiga?.name).toBe("Area Salatiga");
    expect(salatiga?.tiers).toHaveLength(4);

    const semarang = areas.find((a) => a.id === "semarang");
    expect(semarang).toBeDefined();
    expect(semarang?.name).toBe("Area Semarang");
    expect(semarang?.tiers).toHaveLength(4);

    const semarangIndiv = semarang?.tiers.find((s) => s.type === "Individual Session");
    const semarangDuo = semarang?.tiers.find((s) => s.type === "Duo Session");
    const semarangTriple = semarang?.tiers.find((s) => s.type === "Triple Session");
    const semarangGroup = semarang?.tiers.find((s) => s.type === "Group Session");

    expect(semarangIndiv?.price).toBe("Rp200.000");
    expect(semarangDuo?.price).toBe("Rp250.000");
    expect(semarangTriple?.price).toBe("Rp300.000");
    expect(semarangGroup?.price).toBe("Rp350.000");
  });

  it("merges partial saved metadata with defaults without losing dynamic areas", () => {
    const partialSaved = {
      announcement: {
        enabled: true,
        badge: "PROMO",
        text: "Diskon Khusus Bulan Ini",
      },
    };

    const merged = mergeWithDefaultConfig(partialSaved);
    expect(merged.announcement.enabled).toBe(true);
    expect(merged.announcement.badge).toBe("PROMO");
    expect(merged.pricing.yapAreas).toHaveLength(2);
    expect(merged.contact.whatsappNumber).toBe("628886602440");
  });

  it("supports adding custom custom areas into yapAreas seamlessly", () => {
    const customConfig = {
      ...DEFAULT_LANDING_PAGE_CONFIG,
      pricing: {
        ...DEFAULT_LANDING_PAGE_CONFIG.pricing,
        yapAreas: [
          ...DEFAULT_LANDING_PAGE_CONFIG.pricing.yapAreas,
          {
            id: "solo",
            name: "Area Solo Raya (Manahan)",
            badgeLabel: "Solo",
            venueLocation: "Kompleks Stadion Manahan Solo",
            tiers: [
              {
                id: "solo-1",
                type: "Individual Session",
                price: "Rp220.000",
                unit: "/ session",
                capacity: "1 Atlet",
                notes: "Private Performance Coaching di Solo",
              },
            ],
          },
        ],
      },
    };

    const parsed = landingPageConfigSchema.safeParse(customConfig);
    expect(parsed.success).toBe(true);

    const merged = mergeWithDefaultConfig(customConfig);
    expect(merged.pricing.yapAreas).toHaveLength(3);
    expect(merged.pricing.yapAreas[2].name).toBe("Area Solo Raya (Manahan)");
  });

  it("handles null or undefined input gracefully by returning defaults", () => {
    expect(mergeWithDefaultConfig(null)).toEqual(DEFAULT_LANDING_PAGE_CONFIG);
    expect(mergeWithDefaultConfig(undefined)).toEqual(DEFAULT_LANDING_PAGE_CONFIG);
  });
});
