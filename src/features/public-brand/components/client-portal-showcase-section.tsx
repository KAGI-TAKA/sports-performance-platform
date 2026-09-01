import { Award, Users, CheckCircle2, FileText, Smartphone, Eye, BarChart2, MessageSquare } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

export function ClientPortalShowcaseSection() {
  const pillars = [
    {
      title: "Training Progress",
      subtitle: "Presensi & Fokus Latihan",
      desc: "Memantau kehadiran, konsistensi sesi, dan ketercapaian target modul latihan mingguan.",
      icon: CheckCircle2,
      points: ["Attendance & session log", "Weekly training focus", "Skill development tracking"],
    },
    {
      title: "Physical Progress",
      subtitle: "Kapasitas & Kualitas Gerak",
      desc: "Melihat grafik perkembangan kualitas fisik objektif dari fase awal hingga berkala.",
      icon: BarChart2,
      points: ["Speed & acceleration", "Strength & functional power", "Movement & landing quality"],
    },
    {
      title: "Coach Feedback",
      subtitle: "Catatan Langsung dari Pelatih",
      desc: "Ulasan berkala bahasa awam mengenai keunggulan anak, area perbaikan, dan target latihan berikutnya.",
      icon: MessageSquare,
      points: ["Identified strengths", "Areas to improve", "Next development priority"],
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-b border-border/40 bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Transparansi Perkembangan"
          title="PROGRESS YOU CAN UNDERSTAND"
          description="Parents tidak seharusnya hanya mengetahui bahwa anak mereka 'sudah latihan'. Anda perlu memahami apa yang sedang dikembangkan, mengapa latihan tersebut diberikan, bagaimana kemajuan anak, dan apa fokus latihan selanjutnya."
        />

        {/* 3 Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-surface-2/40 p-6 space-y-4 shadow-2xs hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-muted font-medium">
                      {p.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-secondary leading-relaxed">
                  {p.desc}
                </p>

                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  {p.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-2 text-[11px] text-muted font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Supporting System Context Note */}
        <div className="p-5 rounded-2xl border border-border bg-surface-2/60 text-xs text-secondary flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-display font-bold text-foreground text-xs sm:text-sm block">
              Transparent Development Support
            </span>
            <p className="text-muted text-xs leading-relaxed">
              Portal adalah <em>supporting system</em> pendukung proses coaching agar perkembangan anak terdokumentasi dan terpantau secara terukur, bukan produk terpisah.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full shrink-0">
            Termasuk dalam Layanan
          </span>
        </div>
      </div>
    </section>
  );
}
