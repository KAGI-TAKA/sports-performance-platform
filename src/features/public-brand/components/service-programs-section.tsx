import { User, Users, Activity, CheckCircle2, MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function ServiceProgramsSection() {
  return (
    <section id="programs" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Pilihan Paket Layanan
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Program Pelatihan Performa Fisik
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Setiap program dirancang dengan kurikulum bertahap, pendampingan intensif, dan evaluasi hasil berkala.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Service 1: Private 1-on-1 */}
          <div className="rounded-2xl border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-950/40 to-slate-900 p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-xl shadow-indigo-950/40 relative">
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              Paling Populer
            </div>

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-white">
                  Private 1-on-1 Coaching
                </h3>
                <p className="text-xs text-indigo-300">
                  Pendampingan intensif khusus untuk 1 atlet per sesi.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-indigo-500/20">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Program latihan 100% dipersonalisasi sesuai kebutuhan cabor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Koreksi teknik gerak, biomekanik lari, dan landing posture.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Asesmen fisik lengkap &amp; laporan PDF berkala ke orang tua.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Akses portal pemantauan mandiri atlet &amp; orang tua.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Private 1-on-1 Performance Coaching")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Konsultasi Private 1-on-1</span>
              </a>
            </div>
          </div>

          {/* Service 2: Small Group */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 space-y-6 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-white">
                  Small Group Performance
                </h3>
                <p className="text-xs text-slate-400">
                  Kelompok kecil (2 – 4 atlet) untuk rekan satu tim/saudara.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Atmosfer latihan kompetitif yang memacu motivasi atlet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Fokus pada agility drills, reaction speed, dan stamina.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Evaluasi fisik terpisah untuk setiap atlet dalam kelompok.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Akses portal personal untuk masing-masing orang tua.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Small Group Performance (2-4 Atlet)")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>Konsultasi Small Group</span>
              </a>
            </div>
          </div>

          {/* Service 3: Physical Assessment Lab */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 space-y-6 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Activity className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-white">
                  Physical Assessment Lab
                </h3>
                <p className="text-xs text-slate-400">
                  Sesi khusus pengujian &amp; pemetaan profil fisik lengkap.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pengujian 7 parameter fisik berstandar resmi di lapangan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Analisis radar kelemahan, keunggulan, dan potensi cedera.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Lembar Laporan Evaluasi Fisik Resmi (PDF) berkop.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Saran rekomendasi latihan mandiri pasca-pengujian.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Physical Assessment & Testing Lab")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>Jadwalkan Asesmen Fisik</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
