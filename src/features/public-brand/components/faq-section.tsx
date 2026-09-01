import { HelpCircle, ChevronDown } from "lucide-react";

export function FaqSection() {
  const faqs = [
    {
      q: "Berapa usia minimal atlet yang bisa mengikuti program ini?",
      a: "Program fisik dirancang aman untuk atlet muda mulai usia 8 tahun hingga usia kompetitif senior (18+ tahun). Menu latihan disesuaikan secara ketat dengan fase pertumbuhan biologis dan kesiapan fisik masing-masing atlet.",
    },
    {
      q: "Apakah program ini cocok untuk anak yang baru mulai atau belum pernah latihan fisik?",
      a: "Sangat cocok. Justru melalui asesmen fisik awal, kami dapat memetakan pondasi gerak dasar (fundamental movement skills) agar anak terbiasa bergerak dengan postur dan teknik yang benar sejak awal tanpa risiko cedera.",
    },
    {
      q: "Di mana lokasi sesi latihan fisik lapangan diadakan?",
      a: "Lokasi sesi latihan disepakati bersama saat konsultasi pendaftaran, dapat dilakukan di fasilitas lapangan atletik terdekat, lapangan sintetis/rumput, atau area latihan kebugaran yang terstandar.",
    },
    {
      q: "Apa saja yang perlu dipersiapkan sebelum sesi pengujian fisik (Physical Assessment)?",
      a: "Atlet cukup mengenakan pakaian olahraga yang nyaman, sepatu olahraga/lari (running shoes) yang pas, membawa botol air minum, serta memastikan tidur cukup dan makan ringan 1–2 jam sebelum tes.",
    },
    {
      q: "Bagaimana cara mendaftar dan memulai konsultasi?",
      a: "Klik tombol 'Konsultasi via WhatsApp' di website ini. Anda akan terhubung langsung dengan Coach Zulfi untuk mendiskusikan usia anak, cabang olahraga, riwayat aktivitas fisik, dan rekomendasi paket program yang tepat.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Tanya Jawab Umum
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Pertanyaan yang Sering Diajukan Orang Tua
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Hal-hal mendasar yang perlu Anda ketahui sebelum memulai program pembinaan fisik bersama Coach Zulfi.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 space-y-2 hover:border-slate-700 transition"
            >
              <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-start gap-2.5">
                <span className="text-indigo-400 shrink-0 font-mono">Q:</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
