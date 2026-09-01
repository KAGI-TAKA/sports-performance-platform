import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Dumbbell,
  ClipboardCheck,
  ClipboardList,
  TrendingUp,
  GitCompare,
  FileText,
  SlidersHorizontal,
  Settings,
  PlusCircle,
  PlayCircle,
  UserPlus,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  keywords?: string[];
  description?: string;
  allowedRoles?: string[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  keywords: string[];
  allowedRoles?: string[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Command Center",
        icon: LayoutDashboard,
        keywords: ["beranda", "dashboard", "kpi", "ringkasan", "ikhtisar", "agenda", "jadwal hari ini"],
        description: "Ikhtisar operasional, KPI tim, dan agenda sesi hari ini",
      },
      {
        href: "/schedule",
        label: "Jadwal & Timetable",
        icon: Calendar,
        keywords: ["jadwal", "kalender", "timetable", "sesi", "latihan", "agenda", "waktu"],
        description: "Manajemen kalender sesi latihan mingguan dan timetable",
      },
      {
        href: "/athletes",
        label: "Direktori Atlet",
        icon: Users,
        keywords: ["atlet", "pemain", "murid", "roster", "direktori", "profil fisik", "antropometri"],
        description: "Daftar atlet aktif, profil antropometri, dan riwayat perkembangan",
      },
    ],
  },
  {
    title: "Coaching",
    items: [
      {
        href: "/training-plans",
        label: "Program Latihan",
        icon: Dumbbell,
        keywords: ["program", "training plan", "drill", "gerakan", "kurikulum", "latihan", "sets", "reps"],
        description: "Penyusunan kurikulum latihan dan library gerakan",
      },
      {
        href: "/session-logs",
        label: "Catatan Sesi",
        icon: ClipboardCheck,
        keywords: ["catatan", "log", "session log", "presensi", "kehadiran", "evaluasi harian", "video"],
        description: "Rekap pelaksanaan sesi harian, presensi, dan catatan video",
      },
      {
        href: "/assessments",
        label: "Assessment Fisik",
        icon: ClipboardList,
        keywords: ["asesmen", "assessment", "tes fisik", "evaluasi", "radar chart", "skor", "grade", "komponen"],
        description: "Pengujian performa fisik atlet 7 komponen dan rapor evaluasi",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        href: "/progress",
        label: "Analisis Progres",
        icon: TrendingUp,
        keywords: ["progres", "progress", "analisis", "tren", "perkembangan", "grafik", "riwayat"],
        description: "Pantau tren perkembangan skor fisik dan personal best",
      },
      {
        href: "/compare",
        label: "Komparasi Atlet",
        icon: GitCompare,
        keywords: ["komparasi", "compare", "bandingkan", "head to head", "perbandingan atlet", "radar"],
        description: "Perbandingan performa fisik head-to-head antar atlet",
      },
      {
        href: "/reports",
        label: "Laporan & Ekspor",
        icon: FileText,
        keywords: ["laporan", "reports", "ekspor", "export", "pdf", "csv", "whatsapp", "wa"],
        description: "Unduh laporan resmi PDF/CSV dan generator ringkasan WhatsApp",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        href: "/benchmarks",
        label: "Master Benchmark",
        icon: SlidersHorizontal,
        keywords: ["benchmark", "standar", "ambang batas", "grade a", "grade b", "norma fisik"],
        description: "Konfigurasi ambang batas nilai A/B/C/D per item tes fisik",
      },
      {
        href: "/settings",
        label: "Pengaturan & Staf",
        icon: Settings,
        keywords: ["pengaturan", "settings", "profil organisasi", "staf", "pelatih", "supervisi", "klub"],
        description: "Konfigurasi profil organisasi, manajemen staf tim pelatih, dan supervisi",
      },
    ],
  },
];

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "qa-new-athlete",
    title: "Tambah Atlet Baru",
    subtitle: "Daftarkan profil atlet baru ke organisasi",
    href: "/athletes/new",
    icon: UserPlus,
    keywords: ["tambah atlet", "daftar atlet", "murid baru", "registrasi", "new athlete", "add athlete"],
  },
  {
    id: "qa-new-assessment",
    title: "Buat Assessment Baru",
    subtitle: "Input evaluasi fisik atlet (Progress / Benchmark)",
    href: "/assessments/new",
    icon: PlusCircle,
    keywords: ["buat asesmen", "tes baru", "new assessment", "input tes fisik", "skor fisik"],
  },
  {
    id: "qa-squad-assessment",
    title: "Penilaian Squad (Massal)",
    subtitle: "Input nilai tes fisik massal untuk seluruh tim di lapangan",
    href: "/assessments/new?mode=squad",
    icon: Users,
    keywords: ["squad assessment", "penilaian squad", "tes massal", "matriks tes", "tes tim", "sprint squad"],
  },
  {
    id: "qa-new-schedule",
    title: "Jadwalkan Sesi Latihan",
    subtitle: "Buka timetable dan buat jadwal latihan baru",
    href: "/schedule",
    icon: Calendar,
    keywords: ["buat jadwal", "tambah sesi", "jadwal baru", "new schedule", "sesi latihan"],
  },
  {
    id: "qa-new-plan",
    title: "Buat Program Latihan",
    subtitle: "Rancang program latihan mingguan & drill",
    href: "/training-plans",
    icon: Dumbbell,
    keywords: ["buat program", "training plan baru", "kurikulum", "new plan"],
  },
  {
    id: "qa-today-agenda",
    title: "Lihat Sesi Latihan Hari Ini",
    subtitle: "Buka agenda sesi yang terjadwal untuk hari ini",
    href: "/schedule",
    icon: PlayCircle,
    keywords: ["latihan hari ini", "sesi aktif", "agenda hari ini", "mulai sesi", "today session"],
  },
];

export const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Command Center",
  schedule: "Jadwal & Timetable",
  "training-plans": "Program Latihan",
  exercises: "Bank Gerakan",
  "session-logs": "Catatan Sesi",
  athletes: "Direktori Atlet",
  assessments: "Assessment Fisik",
  benchmarks: "Master Benchmark",
  progress: "Analisis Progres",
  compare: "Komparasi Atlet",
  reports: "Laporan & Ekspor",
  settings: "Pengaturan & Staf",
  new: "Tambah Baru",
  edit: "Edit Data",
  execute: "Eksekusi Sesi",
};

/**
 * Resolves a human-readable title for a path segment
 */
export function getBreadcrumbTitle(segment: string): string {
  return BREADCRUMB_MAP[segment] || segment;
}
