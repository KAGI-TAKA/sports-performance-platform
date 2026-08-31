import { Star, Quote, MessageSquare } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Orang Tua Atlet Sepak Bola U-14",
      role: "Klien Private Performance",
      rating: 5,
      comment:
        "Kelincahan dan akselerasi anak saya di lapangan meningkat sangat nyata setelah 8 minggu program. Laporan evaluasi fisiknya sangat jelas dan pelatih mendampingi dengan penuh kesabaran.",
    },
    {
      name: "Orang Tua Atlet Bola Basket U-16",
      role: "Klien Physical Assessment & Training",
      rating: 5,
      comment:
        "Data tes fisik awal sangat membantu kami memahami kenapa anak sering cepat lelah di kuarter akhir. Program daya tahan yang disusun Coach Zulfi tepat sasaran dan terarah.",
    },
    {
      name: "Orang Tua Atlet Bulutangkis U-12",
      role: "Klien Small Group Conditioning",
      rating: 5,
      comment:
        "Anak saya jadi lebih disiplin dan mengerti pentingnya latihan fisik. Portal pemantauan dari Coach Zulfi sangat membantu kami melihat jadwal dan checklist latihan mandirinya di rumah.",
    },
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-slate-900/50 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Testimoni &amp; Pengalaman Klien
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Pengalaman Nyata Orang Tua &amp; Atlet Binaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Kepercayaan keluarga atlet adalah prioritas tertinggi kami dalam memberikan pembinaan fisik yang aman dan berdampak.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div className="space-y-3">
                {/* Star Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &quot;{t.comment}&quot;
                </p>
              </div>

              {/* Author */}
              <div className="pt-3 border-t border-slate-900">
                <div className="text-xs font-bold text-white">{t.name}</div>
                <div className="text-[11px] text-indigo-400">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
