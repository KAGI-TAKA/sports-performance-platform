import Link from "next/link";
import {
  ClipboardList,
  TrendingUp,
  Dumbbell,
  Calendar,
  ClipboardCheck,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function DashboardWorkflowGuide() {
  const steps = [
    {
      num: "01",
      name: "ASSESS",
      title: "Asesmen & Observasi",
      desc: "Uji fisik awal & observasi kualitas gerak",
      href: "/assessments/new",
      actionText: "Input Asesmen",
      icon: ClipboardList,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      num: "02",
      name: "IDENTIFY",
      title: "Identifikasi Area",
      desc: "Petakan keunggulan & prioritas penguatan",
      href: "/progress",
      actionText: "Lihat Tren",
      icon: TrendingUp,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      num: "03",
      name: "PLAN",
      title: "Susun Program",
      desc: "Rancang silabus MFD / Athlete Performance",
      href: "/training-plans",
      actionText: "Buka Silabus",
      icon: Dumbbell,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      num: "04",
      name: "DEVELOP",
      title: "Eksekusi Lapangan",
      desc: "Jadwalkan & jalankan sesi dengan checklist",
      href: "/schedule",
      actionText: "Buka Jadwal",
      icon: Calendar,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      num: "05",
      name: "MONITOR",
      title: "Catatan & Monitor",
      desc: "Presensi harian, evaluasi, & video rekaman",
      href: "/session-logs",
      actionText: "Catat Log",
      icon: ClipboardCheck,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      num: "06",
      name: "REASSESS",
      title: "Evaluasi & Rapor",
      desc: "Uji berkala & ekspor laporan resmi orang tua",
      href: "/reports",
      actionText: "Unduh Rapor",
      icon: FileText,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <Card className="border border-border bg-surface-1 shadow-2xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground tracking-tight">
              FROM ASSESSMENT TO DEVELOPMENT (Alur Kerja 6 Tahap)
            </CardTitle>
            <span className="text-[10px] text-muted block">
              Klik setiap tahap untuk langsung membuka modul kerja pelatih
            </span>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
          Siklus Pembinaan Terstruktur ↺
        </span>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.name}
                href={s.href}
                className="group relative rounded-xl border border-border bg-surface-2/40 p-3.5 flex flex-col justify-between hover:bg-surface-2 hover:border-blue-500/40 transition-all shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border font-mono ${s.bg} ${s.color}`}>
                      {s.num}
                    </span>
                    <div className="h-6 w-6 rounded-md bg-surface-3 flex items-center justify-center text-secondary group-hover:text-foreground transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                      {s.name}
                    </span>
                    <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {s.title}
                    </h4>
                  </div>

                  <p className="text-[10px] text-secondary line-clamp-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  <span>{s.actionText}</span>
                  <ArrowRight className="h-3 w-3 inline transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
