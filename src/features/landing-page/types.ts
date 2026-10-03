export interface PricingTier {
  id: string;
  type: string;
  price: string;
  unit: string;
  capacity: string;
  notes: string;
}

export interface PricingArea {
  id: string;
  name: string;
  badgeLabel?: string;
  venueLocation?: string;
  tiers: PricingTier[];
}

export interface AnnouncementConfig {
  enabled: boolean;
  badge: string;
  text: string;
  linkUrl?: string;
}

export interface ContactConfig {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  instagram: string;
  instagramUrl: string;
  salatigaLocation: string;
  semarangLocation: string;
}

export interface PricingConfig {
  yapAreas: PricingArea[];
  mfdPricing: PricingTier[];
  yapSalatiga?: PricingTier[];
  yapSemarang?: PricingTier[];
}

export interface LandingPageConfig {
  announcement: AnnouncementConfig;
  contact: ContactConfig;
  pricing: PricingConfig;
}

export const DEFAULT_LANDING_PAGE_CONFIG: LandingPageConfig = {
  announcement: {
    enabled: false,
    badge: "PENGUMUMAN",
    text: "Pendaftaran sesi latihan fisik batch terbaru wilayah Salatiga & Semarang telah dibuka!",
    linkUrl: "#pricing",
  },
  contact: {
    whatsappNumber: "628886602440",
    whatsappDefaultMessage: "Halo Coach Zulfi, saya ingin berkonsultasi mengenai program Youth Athletic Development & Strength & Conditioning.",
    instagram: "@zulficoach",
    instagramUrl: "https://www.instagram.com/zulficoach/",
    salatigaLocation: "Fasilitas Lintasan Atletik & Lapangan Rumput Salatiga",
    semarangLocation: "Fasilitas Pelatihan Atletik Terstandar Semarang",
  },
  pricing: {
    yapAreas: [
      {
        id: "salatiga",
        name: "Area Salatiga",
        badgeLabel: "Salatiga",
        venueLocation: "Fasilitas Lintasan Atletik & Lapangan Rumput Salatiga",
        tiers: [
          {
            id: "salatiga-individual",
            type: "Individual Session",
            price: "Rp150.000",
            unit: "/ session",
            capacity: "1 atlet",
            notes: "Cocok untuk atlet muda yang membutuhkan perhatian penuh, koreksi teknik mendalam, dan program terindividualisasi",
          },
          {
            id: "salatiga-duo",
            type: "Duo Session",
            price: "Rp200.000",
            unit: "/ session",
            capacity: "2 athletes",
            notes: "Cocok untuk 2 atlet dengan cabang olahraga atau fase perkembangan fisik yang sepadan",
          },
          {
            id: "salatiga-trio",
            type: "Trio Session",
            price: "Rp225.000",
            unit: "/ session",
            capacity: "3 athletes",
            notes: "Cocok untuk 3 atlet/rekan tim yang ingin berlatih fisik bersama dengan fokus terarah",
          },
          {
            id: "salatiga-group",
            type: "Group Session",
            price: "Rp260.000",
            unit: "/ session",
            capacity: "Group",
            notes: "Cocok untuk latihan kelompok atlet yang ingin membangun chemistry dan kapasitas fisik kompetitif",
          },
        ],
      },
      {
        id: "semarang",
        name: "Area Semarang",
        badgeLabel: "Semarang",
        venueLocation: "Fasilitas Pelatihan Atletik Terstandar Semarang",
        tiers: [
          {
            id: "semarang-individual",
            type: "Individual Session",
            price: "Rp200.000",
            unit: "/ session",
            capacity: "1 atlet",
            notes: "Cocok untuk atlet muda yang membutuhkan perhatian penuh, koreksi teknik mendalam, dan program terindividualisasi",
          },
          {
            id: "semarang-duo",
            type: "Duo Session",
            price: "Rp250.000",
            unit: "/ session",
            capacity: "2 athletes",
            notes: "Cocok untuk 2 atlet dengan cabang olahraga atau fase perkembangan fisik yang sepadan",
          },
          {
            id: "semarang-triple",
            type: "Triple Session",
            price: "Rp300.000",
            unit: "/ session",
            capacity: "3 athletes",
            notes: "Cocok untuk 3 atlet/rekan tim yang ingin berlatih fisik bersama dengan fokus terarah",
          },
          {
            id: "semarang-group",
            type: "Group Session",
            price: "Rp350.000",
            unit: "/ session",
            capacity: "Group",
            notes: "Cocok untuk latihan kelompok atlet yang ingin membangun chemistry dan kapasitas fisik kompetitif",
          },
        ],
      },
    ],
    mfdPricing: [
      {
        id: "mfd-individual",
        type: "Individual Session",
        price: "Rp125.000",
        unit: "/ session",
        capacity: "1 anak",
        notes: "Cocok untuk anak yang membutuhkan bimbingan intensif 1-on-1 dalam membangun literasi fisik & pola gerak dasar",
      },
      {
        id: "mfd-duo",
        type: "Duo Session",
        price: "Rp170.000",
        unit: "/ session",
        capacity: "2 children",
        notes: "Cocok untuk 2 anak/saudara yang ingin belajar koordinasi dan eksplorasi gerak bersama secara menyenangkan",
      },
      {
        id: "mfd-group",
        type: "Group Session",
        price: "Rp50.000",
        unit: "/ child / session",
        capacity: "Group",
        notes: "Sesi latihan kelompok terstruktur untuk membangun literasi fisik, kelincahan, reaksi, dan kerja sama tim",
      },
    ],
  },
};
