import { SectionHeader } from "@/components/ui/section-header";
import {
  ClipboardCheck,
  LineChart,
  CalendarCheck,
  Dumbbell,
  Eye,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

export function CoachingProcessSection() {
  const steps = [
    {
      step: "01",
      name: "ASSESS",
      title: "Uji & Observasi Awal",
      desc: "Mengukur profil kebugaran fisik objektif (kecepatan, power, kelincahan, daya tahan) dan menganalisis kualitas mekanika gerak dasar atlet.",
      icon: ClipboardCheck,
    },
    {
      step: "02",
      name: "ANALYZE",
      title: "Analisis Profil Fisik",
      desc: "Memetakan komponen terkuat dan area yang memerlukan penguatan khusus sebagai dasar pembuatan keputusan latihan.",
      icon: LineChart,
    },
    {
      step: "03",
      name: "PROGRAM",
      title: "Penyusunan Program",
      desc: "Merancang silabus dan menu latihan mingguan yang terarah, progresif, dan sesuai kapasitas fisik sang atlet.",
      icon: CalendarCheck,
    },
    {
      step: "04",
      name: "DEVELOP",
      title: "Eksekusi Sesi Latihan",
      desc: "Pelatihan intensif di lapangan dengan koreksi teknik presisi, drill kelincahan, penguatan otot, dan mekanika deselerasi.",
      icon: Dumbbell,
    },
    {
      step: "05",
      name: "MONITOR",
      title: "Pemantauan Adaptasi",
      desc: "Mencatat presensi, beban latihan, evaluasi harian, dan memberikan catatan umpan balik langsung kepada orang tua.",
      icon: Eye,
    },
    {
      step: "06",
      name: "REASSESS",
      title: "Evaluasi Berkala",
      desc: "Pengujian ulang secara periodik untuk memvalidasi kenaikan performa (Personal Best) dan memperbarui target siklus latihan baru.",
      icon: RotateCcw,
    },
  ];

  return (
    <section id="process" className="py-14 sm:py-20 border-b border-border/40 bg-surface-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Metodologi Kepelatihan"
          title="Alur Pembinaan Terstruktur 6 Tahap"
          description="Siklus terpadu dari asesmen awal hingga evaluasi berkala untuk memastikan setiap sesi latihan memberikan dampak nyata terhadap perkembangan fisik anak."
        />

        {/* Process Flow Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="relative rounded-xl border border-border bg-surface-1 p-5 sm:p-6 space-y-3 shadow-2xs hover:border-border-strong transition-all group"
              >
                {/* Step badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-xs text-accent px-2 py-0.5 rounded bg-accent-bg border border-accent/20">
                      STEP {item.step}
                    </span>
                    <span className="font-display font-bold text-xs tracking-wider text-muted">
                      {item.name}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-surface-2 flex items-center justify-center text-secondary group-hover:text-accent group-hover:bg-accent-bg transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="font-display font-bold text-base text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {item.desc}
                </p>

                {/* Flow connector indicator on bottom */}
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  <span>Tahap {index + 1} dari 6</span>
                  {index < 5 && <ArrowRight className="h-3 w-3 text-accent inline ml-auto" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coach Role Note */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 text-xs text-secondary leading-relaxed text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-display font-bold text-foreground block">
              Keputusan Dibuat Berdasarkan Pengamatan Pelatih Profesional
            </span>
            <span className="text-muted">
              Sistem analitis membantu menyajikan data komparasi, sementara keputusan program dan intensitas tetap dipandu langsung oleh Coach Zulfi.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
