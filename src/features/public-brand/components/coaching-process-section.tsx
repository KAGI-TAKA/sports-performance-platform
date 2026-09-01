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
      name: "Assess",
      title: "Understand the Athlete",
      desc: "Memahami kondisi awal atlet, latar belakang olahraga, usia biologis, dan riwayat gerak.",
      icon: ClipboardCheck,
    },
    {
      step: "02",
      name: "Identify",
      title: "Find Strengths & Areas to Develop",
      desc: "Menemukan keunggulan atlet dan memetakan area kualitas gerak yang memerlukan prioritas pembinaan.",
      icon: Search,
    },
    {
      step: "03",
      name: "Plan",
      title: "Set Priorities & Training Direction",
      desc: "Menentukan prioritas latihan dan merancang arah silabus program yang sesuai fase perkembangan.",
      icon: CalendarCheck,
    },
    {
      step: "04",
      name: "Develop",
      title: "Train Progressively",
      desc: "Menjalankan latihan bertahap dengan penekanan pada kualitas gerak, teknik presisi, dan beban adaptif.",
      icon: Dumbbell,
    },
    {
      step: "05",
      name: "Monitor",
      title: "Track Response & Progress",
      desc: "Memantau adaptasi latihan, presensi, respons pemulihan atlet, dan memberikan catatan berkala ke orang tua.",
      icon: Eye,
    },
    {
      step: "06",
      name: "Reassess",
      title: "Evaluate & Adjust the Next Phase",
      desc: "Melakukan evaluasi ulang berkala untuk mengukur kemajuan dan menyesuaikan target siklus latihan selanjutnya.",
      icon: RotateCcw,
    },
  ];

  return (
    <section id="process" className="py-16 sm:py-24 bg-[#0D1527] text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Metodologi Kepelatihan
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            FROM ASSESSMENT TO DEVELOPMENT
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Assessment bukan tujuan akhir dan bukan produk utama. Assessment adalah alat untuk membantu coach memahami atlet dan mengambil keputusan terbaik dalam menyusun program latihan.
          </p>
        </div>

        {/* 6-Step Connected Methodology Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="group space-y-3.5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-850 shadow-md transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
              >
                <div className="space-y-3">
                  {/* Step badge & Icon */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-300 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/60">
                        STEP {item.step}
                      </span>
                      <span className="font-mono font-semibold text-xs text-slate-400">
                        {item.name}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-blue-400 group-hover:bg-blue-950/80 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-base text-white group-hover:text-blue-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Flow connector indicator */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Tahap {index + 1} dari 6</span>
                  {index < 5 ? (
                    <span className="flex items-center gap-1 text-blue-400 font-medium">
                      Lanjut ke Step 0{index + 2}
                      <ArrowRight className="h-3 w-3 inline" />
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">
                      Siklus Berkelanjutan ↺
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Methodology Bottom Banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 text-slate-300 leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-base text-white">
              Coaching Guided by Sport Science
            </h3>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Program latihan menggunakan prinsip sport science, tetapi setiap keputusan latihan tetap mempertimbangkan kondisi nyata atlet, kualitas gerak, dan tujuan jangka panjangnya.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/60 px-3 py-1 rounded-full shrink-0">
            Methodology Verified
          </span>
        </div>
      </div>
    </section>
  );
}
