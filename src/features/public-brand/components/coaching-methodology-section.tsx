import { Activity, BarChart3, Dumbbell, Zap, TrendingUp } from "lucide-react";

export function CoachingMethodologySection() {
  const steps = [
    {
      num: "01",
      icon: Activity,
      title: "Asesmen Awal (Baseline)",
      desc: "Mengukur 7 komponen fisik awal atlet untuk mendapatkan data objektif sebelum program dimulai.",
    },
    {
      num: "02",
      icon: BarChart3,
      title: "Analisis & Pemetaan",
      desc: "Memetakan kekuatan utama, titik lemah gerak, serta potensi risiko cedera yang harus diperkuat.",
    },
    {
      num: "03",
      icon: Dumbbell,
      title: "Penyusunan Program",
      desc: "Merancang menu latihan fisik spesifik sesuai usia biologis dan kebutuhan cabang olahraga atlet.",
    },
    {
      num: "04",
      icon: Zap,
      title: "Latihan Lapangan Terarah",
      desc: "Eksekusi sesi intensif dengan pengawasan teknik, presensi kehadiran, dan pencatatan log harian.",
    },
    {
      num: "05",
      icon: TrendingUp,
      title: "Evaluasi Berkala",
      desc: "Pengujian ulang berkala untuk membuktikan progres performa dan menyerahkan laporan resmi ke orang tua.",
    },
  ];

  return (
    <section id="methodology" className="py-16 sm:py-20 bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Metode Kepelatihan
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            5 Tahap Pembinaan Fisik Berbasis Sains
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Bukan sekadar latihan fisik tanpa arah. Setiap atlet menjalani siklus pembinaan yang terencana, terukur, dan dievaluasi secara berkelanjutan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono font-extrabold text-sm text-indigo-400">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="text-[11.5px] text-slate-400 leading-relaxed pt-1">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
