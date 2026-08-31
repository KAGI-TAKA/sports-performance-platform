import { Target, Users, Trophy, Sparkles } from "lucide-react";

export function WhoItsForSection() {
  return (
    <section className="py-16 bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Siapa yang Kami Dampingi
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Program Pelatihan Fisik untuk Siapa?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dirancang khusus untuk membangun pondasi fisik atletik yang kokoh bagi atlet muda dan atlet kompetitif di berbagai cabang olahraga.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Target 1 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-white">
                Atlet Muda Usia 8 – 18 Tahun
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Membangun koordinasi motorik, kelincahan dasar (*agility*), kecepatan reaksi, dan postur tubuh yang kokoh sejak usia dini secara aman.
              </p>
            </div>
          </div>

          {/* Target 2 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-white">
                Persiapan Seleksi &amp; Kompetisi
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Atlet yang mempersiapkan turnamen, seleksi akademi/klub, atau kejuaraan daerah yang memerlukan akselerasi stamina dan *power* maksimal.
              </p>
            </div>
          </div>

          {/* Target 3 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-indigo-500/40 transition-all sm:col-span-2 lg:col-span-1">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-white">
                Segala Cabang Olahraga
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pondasi atletik esensial untuk atlet Sepak Bola, Futsal, Bola Basket, Bulutangkis, Tenis, Lari/Atletik, Beladiri, dan Renang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
