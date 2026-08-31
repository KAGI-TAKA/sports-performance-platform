import { Award, Users, CheckCircle2, FileText, Smartphone } from "lucide-react";

export function ClientPortalShowcaseSection() {
  return (
    <section className="py-16 sm:py-20 bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Nilai Tambah Layanan
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Portal Pemantauan Personal untuk Setiap Klien
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Tanpa biaya aplikasi tambahan. Setiap atlet dan orang tua menerima tautan portal pribadi yang dapat diakses langsung dari browser ponsel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Athlete View Card */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Tampilan Khusus Atlet
                </h3>
                <p className="text-xs text-indigo-300">
                  Fokus: Motivasi, Latihan Mandiri, &amp; Capaian Pribadi
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Checklist Menu Latihan Mandiri di Rumah</strong> lengkap dengan set, reps, dan catatan teknik.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Lencana Pencapaian &amp; Bintang Prestasi</strong> (Speed Demon, Explosive Jumper, Endurance Master).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Jadwal Sesi Latihan Terdekat</strong> agar selalu siap dan tepat waktu di lapangan.</span>
              </li>
            </ul>
          </div>

          {/* Parent View Card */}
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-900 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Tampilan Khusus Orang Tua
                </h3>
                <p className="text-xs text-violet-300">
                  Fokus: Laporan Transparan, Presensi, &amp; Masukan Pelatih
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Rangkuman Perkembangan Bahasa Awam</strong> tanpa istilah olahraga yang membingungkan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Unduh Laporan Evaluasi Fisik Resmi (PDF)</strong> berkop dan berskor akurat untuk arsip keluarga.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Formulir Ulasan Bintang Sesi</strong> untuk memberi masukan langsung terhadap pendampingan pelatih.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
