import { SectionHeader } from "@/components/ui/section-header";
import {
  ClipboardCheck,
  Search,
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
      title: "Understand the Athlete",
      desc: "Memahami kondisi awal atlet, latar belakang olahraga, usia biologis, dan riwayat gerak.",
      icon: ClipboardCheck,
    },
    {
      step: "02",
      name: "IDENTIFY",
      title: "Find Strengths & Areas to Develop",
      desc: "Menemukan keunggulan atlet dan memetakan area kualitas gerak yang memerlukan prioritas pembinaan.",
      icon: Search,
    },
    {
      step: "03",
      name: "PLAN",
      title: "Set Priorities & Training Direction",
      desc: "Menentukan prioritas latihan dan merancang arah silabus program yang sesuai fase perkembangan.",
      icon: CalendarCheck,
    },
    {
      step: "04",
      name: "DEVELOP",
      title: "Train Progressively",
      desc: "Menjalankan latihan bertahap dengan penekanan pada kualitas gerak, teknik presisi, dan beban adaptif.",
      icon: Dumbbell,
    },
    {
      step: "05",
      name: "MONITOR",
      title: "Track Response & Progress",
      desc: "Memantau adaptasi latihan, presensi, respons pemulihan atlet, dan memberikan catatan berkala ke orang tua.",
      icon: Eye,
    },
    {
      step: "06",
      name: "REASSESS",
      title: "Evaluate & Adjust the Next Phase",
      desc: "Melakukan evaluasi ulang berkala untuk mengukur kemajuan dan menyesuaikan target siklus latihan selanjutnya.",
      icon: RotateCcw,
    },
  ];

  return (
    <section id="process" className="py-14 sm:py-20 border-b border-border/40 bg-surface-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Metodologi Kepelatihan"
          title="FROM ASSESSMENT TO DEVELOPMENT"
          description="Assessment bukan tujuan akhir dan bukan produk utama. Assessment adalah alat untuk membantu coach memahami atlet dan mengambil keputusan terbaik dalam menyusun program latihan."
        />

        {/* 6-Step Process Flow Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="relative rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 space-y-3.5 shadow-2xs hover:border-blue-500/40 transition-all group"
              >
                {/* Step badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-[11px] text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      STEP {item.step}
                    </span>
                    <span className="font-display font-bold text-xs tracking-wider text-muted">
                      {item.name}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-surface-2 flex items-center justify-center text-secondary group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Title & Desc */}
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Flow connector indicator */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-semibold text-muted">
                  <span>Tahap {index + 1} dari 6</span>
                  {index < 5 ? (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[10px]">
                      Lanjut ke Step 0{index + 2}
                      <ArrowRight className="h-3 w-3 inline" />
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">
                      Siklus Berkelanjutan ↺
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Methodology Bottom Banner */}
        <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 text-xs text-secondary leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-display font-bold text-sm text-foreground block">
              Coaching Guided by Sport Science
            </span>
            <span className="text-muted text-xs">
              Program latihan menggunakan prinsip sport science, tetapi setiap keputusan latihan tetap mempertimbangkan kondisi nyata atlet, kualitas gerak, dan tujuan jangka panjangnya.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
