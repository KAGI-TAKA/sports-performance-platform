import { z } from "zod/v4";

export const pricingTierSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Nama tipe sesi wajib diisi"),
  price: z.string().min(1, "Harga wajib diisi"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  capacity: z.string().min(1, "Kapasitas wajib diisi"),
  notes: z.string().min(1, "Catatan paket wajib diisi"),
});

export const pricingAreaSchema = z.object({
  id: z.string().min(1, "ID wilayah wajib diisi"),
  name: z.string().min(1, "Nama wilayah wajib diisi"),
  badgeLabel: z.string().optional(),
  venueLocation: z.string().optional(),
  tiers: z.array(pricingTierSchema),
});

export const announcementConfigSchema = z.object({
  enabled: z.boolean(),
  badge: z.string().min(1, "Badge pengumuman wajib diisi"),
  text: z.string().min(1, "Teks pengumuman wajib diisi"),
  linkUrl: z.string().optional(),
});

export const contactConfigSchema = z.object({
  whatsappNumber: z.string().min(8, "Nomor WhatsApp tidak valid"),
  whatsappDefaultMessage: z.string().min(5, "Template pesan wajib diisi"),
  instagram: z.string().min(2, "Akun Instagram wajib diisi"),
  instagramUrl: z.string().url("URL Instagram tidak valid"),
  salatigaLocation: z.string().min(3, "Lokasi Salatiga wajib diisi"),
  semarangLocation: z.string().min(3, "Lokasi Semarang wajib diisi"),
});

export const pricingConfigSchema = z.object({
  yapAreas: z.array(pricingAreaSchema),
  mfdPricing: z.array(pricingTierSchema),
  yapSalatiga: z.array(pricingTierSchema).optional(),
  yapSemarang: z.array(pricingTierSchema).optional(),
});

export const landingPageConfigSchema = z.object({
  announcement: announcementConfigSchema,
  contact: contactConfigSchema,
  pricing: pricingConfigSchema,
});
