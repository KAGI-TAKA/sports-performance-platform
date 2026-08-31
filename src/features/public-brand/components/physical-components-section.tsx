import {
  Zap,
  Flame,
  Activity,
  Dumbbell,
  TrendingUp,
  ShieldCheck,
  Award,
} from "lucide-react";

export function PhysicalComponentsSection() {
  const components = [
    {
      icon: Zap,
      color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      title: "Kecepatan (Speed)",
      test: "Sprint 30 Meter",
      desc: "Mengukur akselerasi langkah pertama, kecepatan transisi, dan kecepatan lari maksimal di lapangan.",
    },
    {
      icon: Flame,
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      title: "Power & Daya Ledak",
      test: "Vertical Jump",
      desc: "Mengukur daya dorong ledak otot tungkai untuk duel udara, loncatan, dan reaksi gerak eksplosif.",
    },
    {
      icon: Activity,
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      title: "Kelincahan (Agility)",
      test: "Pro Agility (5-10-5)",
      desc: "Mengukur kelincahan footwork, koordinasi langkah cepat, dan kemampuan memotong sudut gerak lawan.",
    },
    {
      icon: Dumbbell,
      color: "text-pink-400 bg-pink-400/10 border-pink-400/20",
      title: "Daya Tahan Otot",
      test: "Push-ups & Plank Test",
      desc: "Membangun ketahanan otot inti (core) dan tubuh atas agar postur tetap kokoh saat beradu fisik.",
    },
    {
      icon: TrendingUp,
      color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
      title: "Daya Tahan Anaerobik",
      test: "Repeated Sprint Ability",
      desc: "Kapasitas tubuh melakukan sprint berulang dengan jeda istirahat singkat tanpa penurunan performa.",
    },
    {
      icon: Award,
      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
      title: "Daya Tahan Aerobik",
      test: "Yo-Yo Intermittent Recovery",
      desc: "Stamina kardiovaskular dan kapasitas paru-paru agar stamina atlet stabil dari menit awal hingga akhir.",
    },
    {
      icon: ShieldCheck,
      color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
      title: "Fleksibilitas & Mobilitas",
      test: "Sit and Reach Test",
      desc: "Rentang gerak sendi (*range of motion*) dan kelenturan otot untuk meminimalisir risiko cedera hamstring.",
    },
  ];

  return (
    <section id="components" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Standar Pengujian Ilmiah
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            7 Parameter Pengujian Fisik Atletik
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Setiap parameter diuji menggunakan protokol lapangan berstandar internasional untuk memetakan kekuatan fisik atlet secara objektif.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {components.map((comp) => {
            const Icon = comp.icon;
            return (
              <div
                key={comp.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${comp.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                    {comp.test}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-white">
                    {comp.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {comp.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
