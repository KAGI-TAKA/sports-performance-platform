import {
  FileText,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  MessageSquareHeart,
  CheckCircle2,
} from "lucide-react";

export function ParentValueSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Perkembangan Fisik Terukur",
      desc: "Tidak ada lagi tebak-tebakan. Peningkatan kecepatan, kelincahan, dan daya tahan anak tercatat dalam data angka yang nyata.",
    },
    {
      icon: FileText,
      title: "Laporan Evaluasi Resmi (PDF)",
      desc: "Orang tua menerima dokumen laporan evaluasi fisik berkop resmi yang dapat diunduh untuk arsip perkembangan ananda.",
    },
    {
      icon: CalendarCheck,
      title: "Jadwal & Presensi Transparan",
      desc: "Status kehadiran dan materi latihan setiap sesi tercatat rapi, memastikan kedisiplinan dan konsistensi pembinaan.",
    },
    {
      icon: MessageSquareHeart,
      title: "Ulasan & Komunikasi Terbuka",
      desc: "Orang tua dapat memberikan ulasan bintang dan masukan langsung setelah sesi selesai untuk memastikan mutu pendampingan terbaik.",
    },
    {
      icon: ShieldCheck,
      title: "Rasa Aman & Pencegahan Cedera",
      desc: "Setiap gerakan dikontrol ketat oleh pelatih berpengalaman untuk memastikan pertumbuhan tulang dan sendi anak tetap aman.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Nilai untuk Orang Tua
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Yang Orang Tua Dapatkan Bersama Coach Zulfi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Kami memahami bahwa orang tua menginginkan rasa aman, ketertiban jadwal, dan bukti nyata hasil investasi latihan anak.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}

          {/* Callout box for parents */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900 p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Komitmen Pembinaan
              </span>
              <h3 className="font-display font-bold text-base text-white">
                Tanpa Beban Berlebih, Menumbuhkan Rasa Percaya Diri.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kami membangun mental pantang menyerah dan kecintaan atlet muda pada proses latihan fisik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
