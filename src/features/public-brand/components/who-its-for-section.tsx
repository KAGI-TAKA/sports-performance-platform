import { CheckCircle2, Zap, Compass, ArrowRight } from "lucide-react";

export function WhoItsForSection() {
  const youthCriteria = [
    "Sudah aktif berlatih dalam cabang olahraga tertentu (Sepak Bola, Basket, Bulutangkis, dll.)",
    "Ingin meningkatkan physical performance penunjang cabang olahraganya",
    "Membutuhkan physical preparation dan penguatan kapasitas fisik terarah",
    "Ingin mengasah speed, power, strength, agility, atau conditioning",
    "Mempersiapkan turnamen kompetitif, seleksi tim, atau fase bertanding",
  ];

  const multilateralCriteria = [
    "Belum memiliki spesialisasi cabang olahraga tertentu",
    "Masih mengembangkan basic movement skills dan kontrol tubuh",
    "Membutuhkan peningkatan koordinasi gerak, kelincahan, dan keseimbangan",
    "Ingin mengenal berbagai variasi aktivitas olahraga secara positif & menyenangkan",
    "Membutuhkan fondasi gerak yang kuat sebelum masuk ke tahap sport-specific training",
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#0D1527] text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Panduan Penentuan Jalur
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            MANA JALUR YANG TEPAT UNTUK ANAK ANDA?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Gunakan panduan singkat ini untuk melihat keselarasan antara tahap perkembangan anak dan kurikulum pelatihan yang kami sediakan bersama Coach Zulfi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
          {/* Card 1: Youth Athlete Performance */}
          <div className="p-7 sm:p-9 rounded-3xl border border-blue-500/40 bg-slate-900/90 space-y-6 shadow-xl flex flex-col justify-between hover:border-blue-500 transition duration-300">
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300 block">
                    JALUR PRESTASI CABOR
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    Youth Athlete Performance (YAP)
                  </h3>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-300">
                {youthCriteria.map((c) => (
                  <li key={c} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-blue-400">
              <span>Rekomendasi: Youth Performance</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Card 2: Multilateral Athletic Development */}
          <div className="p-7 sm:p-9 rounded-3xl border border-emerald-500/40 bg-slate-900/90 space-y-6 shadow-xl flex flex-col justify-between hover:border-emerald-500 transition duration-300">
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 block">
                    JALUR FONDASI GERAK
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    Multilateral Athletic Development (MFD)
                  </h3>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-300">
                {multilateralCriteria.map((c) => (
                  <li key={c} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>Rekomendasi: Multilateral Development</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
