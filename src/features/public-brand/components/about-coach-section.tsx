import { User, Award, CheckCircle2, Shield, HeartHandshake } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function AboutCoachSection() {
  return (
    <section id="about" className="py-16 sm:py-20 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Visual Profile Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Outer Glow & Gradient Border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 rounded-3xl blur-md opacity-30" />
              
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 text-center shadow-xl">
                {/* Profile Placeholder Avatar */}
                <div className="relative mx-auto h-28 w-28 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 border-2 border-indigo-400/40 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <User className="h-14 w-14 text-white/90" />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-900 shadow-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-xl text-white">
                    Coach Zulfi
                  </h3>
                  <p className="text-xs font-semibold text-indigo-400">
                    Physical Conditioning &amp; Athletic Specialist
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono pt-0.5">
                    {APP_CONFIG.instagram}
                  </p>
                </div>

                {/* Quick Profile Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fokus</span>
                    <span className="text-xs font-bold text-slate-200">Youth &amp; Pro Athlete</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Metode</span>
                    <span className="text-xs font-bold text-slate-200">Sport Science</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Philosophy */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Profil &amp; Filosofi Kepelatihan
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Membina Fisik Atlet Bukan Hanya Soal Lelah, Melainkan Ketepatan Gerak &amp; Data.
              </h2>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Banyak atlet muda berlatih sangat keras namun performanya mandek atau justru rentan mengalami cedera karena beban latihan yang tidak sesuai dengan fase biologis tubuhnya.
            </p>

            <p className="text-sm text-slate-300 leading-relaxed">
              Sebagai pelatih fisik, saya menerapkan pendekatan <strong>sport science</strong>: mengukur kekuatan awal atlet, memetakan kelemahan fisik, dan menyusun program bertahap yang presisi untuk cabang olahraganya — baik itu sepak bola, bola basket, bulutangkis, lari, maupun beladiri.
            </p>

            {/* Core Values List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs space-y-0.5">
                  <strong className="text-white">Keselamatan &amp; Pencegahan Cedera (Injury Prevention)</strong>
                  <p className="text-slate-400">Memperkuat otot stabilisator, fleksibilitas sendi, dan teknik pendaratan sebelum menambah intensitas beban.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs space-y-0.5">
                  <strong className="text-white">Progres Nyata &amp; Terukur</strong>
                  <p className="text-slate-400">Setiap kemajuan kecepatan sprint, tinggi lompatan, dan stamina diuji secara periodik dengan parameter standar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <HeartHandshake className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs space-y-0.5">
                  <strong className="text-white">Komunikasi Transparan ke Orang Tua</strong>
                  <p className="text-slate-400">Orang tua selalu mendapatkan laporan perkembangan berkala tanpa harus menebak-nebak apa yang dikerjakan anak di lapangan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
