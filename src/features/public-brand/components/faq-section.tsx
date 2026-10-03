import { Sparkles, MapPin, ShieldCheck, Dumbbell, MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function FaqSection() {
  const infoCards = [
    {
      icon: Dumbbell,
      title: "Rentang Usia & Kesiapan Atlet",
      description:
        "Program pembinaan fisik dirancang aman dan bertahap untuk atlet muda mulai usia 8 tahun hingga kategori kompetitif senior (18+ tahun). Seluruh menu latihan disesuaikan secara ketat dengan tahapan pertumbuhan biologis dan kesiapan fisik masing-masing individu.",
    },
    {
      icon: ShieldCheck,
      title: "Pendampingan Pemula & Fondasi Gerak Dasar",
      description:
        "Sangat aman bagi anak yang baru memulai atau belum pernah menjalani latihan fisik. Melalui asesmen awal, kami memetakan literasi gerak dasar (fundamental movement skills) agar anak membiasakan postur dan mekanika gerak yang benar tanpa risiko cedera.",
    },
    {
      icon: MapPin,
      title: "Wilayah Pelatihan Lapangan (Salatiga & Semarang)",
      description:
        "Sesi latihan lapangan diselenggarakan di fasilitas lintasan atletik, lapangan rumput sintetis, atau gym kebugaran terstandar di wilayah Salatiga dan Semarang. Penentuan venue disepakati bersama saat konsultasi agar nyaman dan mudah dijangkau.",
    },
    {
      icon: Sparkles,
      title: "Persiapan Sesi Asesmen Fisik Perdana",
      description:
        "Atlet cukup mengenakan pakaian olahraga yang nyaman, sepatu olahraga/lari yang pas, membawa botol air minum, serta memastikan istirahat cukup dan makan ringan sekitar 1–2 jam sebelum pengujian dimulai.",
    },
    {
      icon: MessageCircle,
      title: "Alur Konsultasi & Pendaftaran Program",
      description:
        "Pendaftaran diawali dengan konsultasi langsung bersama Coach Zulfi melalui WhatsApp. Anda dapat berdiskusi mengenai usia anak, cabang olahraga spesifik, riwayat aktivitas fisik, hingga rekomendasi paket program (YAP atau MFD) yang paling tepat.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Panduan Informasi Program
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Hal-Hal Penting Sebelum Memulai Latihan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Informasi mendasar seputar kesiapan anak, cakupan area Salatiga &amp; Semarang, serta alur pembinaan terstruktur bersama Coach Zulfi.
          </p>
        </div>

        <div className="space-y-4">
          {infoCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 sm:p-6 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-11">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
