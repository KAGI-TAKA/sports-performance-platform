export interface AvatarPreset {
  id: string;
  label: string;
  role: "coach" | "parent" | "athlete" | "all";
  url: string;
}

// Generates 100% reliable, self-contained SVG Data URLs with modern gradients and athletic avatars
function createSvgAvatar(bgGradient: [string, string], emoji: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="30" fill="url(#grad)" />
    <circle cx="60" cy="60" r="48" fill="rgba(255,255,255,0.12)" />
    <text x="60" y="66" font-size="44" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <rect x="20" y="92" width="80" height="18" rx="9" fill="rgba(0,0,0,0.3)" />
    <text x="60" y="104" font-size="9.5" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${text}</text>
  </svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const COACH_AVATARS: AvatarPreset[] = [
  {
    id: "coach-m1",
    label: "Head Coach (Pria)",
    role: "coach",
    url: createSvgAvatar(["#2563eb", "#1d4ed8"], "👨‍💼", "HEAD COACH"),
  },
  {
    id: "coach-f1",
    label: "Head Coach (Wanita)",
    role: "coach",
    url: createSvgAvatar(["#7c3aed", "#6d28d9"], "👩‍💼", "HEAD COACH"),
  },
  {
    id: "coach-asst-m",
    label: "Asisten Coach (Pria)",
    role: "coach",
    url: createSvgAvatar(["#059669", "#047857"], "🏃‍♂️", "ASST COACH"),
  },
  {
    id: "coach-asst-f",
    label: "Asisten Coach (Wanita)",
    role: "coach",
    url: createSvgAvatar(["#0d9488", "#0f766e"], "🏃‍♀️", "ASST COACH"),
  },
  {
    id: "coach-tactical",
    label: "Pelatih Taktikal",
    role: "coach",
    url: createSvgAvatar(["#4f46e5", "#3730a3"], "📋", "TACTICAL"),
  },
  {
    id: "coach-physio",
    label: "Fisik & Performa",
    role: "coach",
    url: createSvgAvatar(["#ea580c", "#c2410c"], "⚡", "PERFORMANCE"),
  },
];

export const PARENT_AVATARS: AvatarPreset[] = [
  {
    id: "parent-father",
    label: "Ayah / Wali Pria",
    role: "parent",
    url: createSvgAvatar(["#d97706", "#b45309"], "👨", "ORANG TUA"),
  },
  {
    id: "parent-mother",
    label: "Ibu / Wali Wanita",
    role: "parent",
    url: createSvgAvatar(["#db2777", "#be185d"], "👩", "ORANG TUA"),
  },
  {
    id: "parent-family",
    label: "Keluarga Atlet",
    role: "parent",
    url: createSvgAvatar(["#ca8a04", "#a16207"], "👨‍👩‍👧", "KELUARGA"),
  },
];

export const ATHLETE_AVATARS: AvatarPreset[] = [
  {
    id: "ath-m-pro",
    label: "Atlet Putra",
    role: "athlete",
    url: createSvgAvatar(["#0284c7", "#0369a1"], "🏃‍♂️", "ATLET"),
  },
  {
    id: "ath-f-pro",
    label: "Atlet Putri",
    role: "athlete",
    url: createSvgAvatar(["#e11d48", "#be123c"], "🏃‍♀️", "ATLET"),
  },
  {
    id: "ath-gold",
    label: "Atlet Juara",
    role: "athlete",
    url: createSvgAvatar(["#eab308", "#ca8a04"], "🥇", "CHAMPION"),
  },
  {
    id: "ath-basketball",
    label: "Atlet Basket",
    role: "athlete",
    url: createSvgAvatar(["#f97316", "#ea580c"], "🏀", "BASKETBALL"),
  },
  {
    id: "ath-badminton",
    label: "Atlet Raket / Bulutangkis",
    role: "athlete",
    url: createSvgAvatar(["#10b981", "#059669"], "🏸", "BADMINTON"),
  },
  {
    id: "ath-football",
    label: "Atlet Sepakbola",
    role: "athlete",
    url: createSvgAvatar(["#14b8a6", "#0d9488"], "⚽", "FOOTBALL"),
  },
];

export const ALL_AVATAR_PRESETS: AvatarPreset[] = [
  ...COACH_AVATARS,
  ...PARENT_AVATARS,
  ...ATHLETE_AVATARS,
];
