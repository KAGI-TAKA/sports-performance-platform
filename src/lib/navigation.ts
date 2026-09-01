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
  UserCheck,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  step?: string;
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
        description: "Pusat komando pembinaan fisik terstruktur dan agenda harian",
      },
      {
        href: "/schedule",
        label: "Jadwal & Timetable",
        icon: Calendar,
        step: "04",
        keywords: ["jadwal", "kalender", "timetable", "sesi", "latihan", "agenda", "waktu", "eksekusi"],
        description: "04. DEVELOP — Manajemen kalender sesi latihan mingguan dan timetable",
      },
      {
        href: "/athletes",
        label: "Direktori Atlet",
        icon: Users,
        keywords: ["atlet", "pemain", "murid", "roster", "direktori", "profil fisik", "antropometri", "mfd"],
        description: "Daftar atlet aktif, profil dual-pathway (MFD / Performance)",
      },
    ],
  },
  {
    title: "Coaching",
    items: [
      {
        href: "/assessments",
        label: "Assessment Fisik",
        icon: ClipboardList,
        step: "01",
        keywords: ["asesmen", "assessment", "tes fisik", "evaluasi", "radar chart", "skor", "grade", "komponen"],
        description: "01. ASSESS — Pengujian profil awal gerak & kapasitas fisik atlet",
      },
      {
        href: "/training-plans",
        label: "Program Latihan",
        icon: Dumbbell,
        step: "03",
        keywords: ["program", "training plan", "drill", "gerakan", "kurikulum", "latihan", "sets", "reps"],
        description: "03. PLAN — Penyusunan kurikulum latihan dan library gerakan",
      },
      {
        href: "/session-logs",
        label: "Catatan Sesi",
        icon: ClipboardCheck,
        step: "05",
        keywords: ["catatan", "log", "session log", "presensi", "kehadiran", "evaluasi harian", "video", "monitor"],
        description: "05. MONITOR — Rekap pelaksanaan sesi harian, presensi, dan catatan video",
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
        step: "02",
        keywords: ["progres", "progress", "analisis", "tren", "perkembangan", "grafik", "riwayat", "identifikasi"],
        description: "02. IDENTIFY — Pantau tren perkembangan skor fisik dan personal best",
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
        step: "06",
        keywords: ["laporan", "reports", "ekspor", "export", "pdf", "csv", "whatsapp", "wa", "reassess"],
        description: "06. REASSESS — Unduh laporan resmi PDF/CSV dan ringkasan orang tua",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        href: "/users",
        label: "Manajemen Pengguna",
        icon: UserCheck,
        allowedRoles: ["admin"],
        keywords: [
          "pengguna",
          "users",
          "manajemen pengguna",
          "role",
          "hak akses",
          "pelatih",
          "orang tua",
          "atlet",
          "aktivasi",
        ],
        description: "Kelola akun, akses, peran, dan hubungan pengguna akademi",
      },
      {
        href: "/benchmarks",
        label: "Master Benchmark",
        icon: SlidersHorizontal,
        keywords: ["benchmark", "standar", "ambang batas", "grade a", "grade b", "norma fisik"],
        description: "Konfigurasi ambang batas nilai A/B/C/D per item tes fisik",
      },
      {
        href: "/settings",
        label: "Pengaturan Sistem",
        icon: Settings,
        keywords: ["pengaturan", "settings", "profil organisasi", "supervisi", "klub"],
        description: "Konfigurasi profil organisasi dan supervisi mutu",
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
    title: "Asesmen Squad Lapangan",
    subtitle: "Matrix input massal satu squad di lapangan",
    href: "/assessments/new?mode=squad",
    icon: PlusCircle,
    keywords: ["squad assessment", "tes squad", "input massal", "tes lapangan"],
  },
  {
    id: "qa-new-plan",
    title: "Susun Program Latihan",
    subtitle: "Buat silabus latihan atau template kurikulum",
    href: "/training-plans",
    icon: Dumbbell,
    keywords: ["buat program", "training plan", "kurikulum", "drill", "menu latihan", "plan"],
  },
  {
    id: "qa-new-schedule",
    title: "Jadwalkan Sesi Latihan",
    subtitle: "Tambah jadwal sesi latihan ke kalender",
    href: "/schedule",
    icon: Calendar,
    keywords: ["tambah jadwal", "jadwal baru", "sesi baru", "new session", "schedule"],
  },
  {
    id: "qa-session-execution",
    title: "Eksekusi Lapangan",
    subtitle: "Buka cockpit presensi & checklist latihan aktif",
    href: "/schedule",
    icon: PlayCircle,
    keywords: ["eksekusi", "presensi lapangan", "mulai sesi", "checklist"],
  },
  {
    id: "qa-new-session-log",
    title: "Catat Log Harian",
    subtitle: "Input catatan latihan, feedback, & video rekaman",
    href: "/session-logs",
    icon: ClipboardCheck,
    keywords: ["catatan sesi", "input log", "session log", "presensi", "feedback"],
  },
];

export const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Command Center",
  schedule: "Jadwal & Timetable",
  athletes: "Direktori Atlet",
  "training-plans": "Program Latihan",
  "session-logs": "Catatan Sesi",
  assessments: "Assessment Fisik",
  progress: "Analisis Progres",
  compare: "Komparasi Atlet",
  reports: "Laporan & Ekspor",
  benchmarks: "Master Benchmark",
  settings: "Pengaturan Sistem",
  users: "Manajemen Pengguna",
  new: "Baru",
  edit: "Ubah",
  execute: "Eksekusi Lapangan",
  templates: "Template Kurikulum",
  exercises: "Library Latihan",
};

export function getBreadcrumbTitle(segment: string): string {
  if (BREADCRUMB_MAP[segment]) {
    return BREADCRUMB_MAP[segment];
  }
  return segment;
}
