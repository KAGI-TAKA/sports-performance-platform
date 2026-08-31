import { MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function WhatsappCtaSection() {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950 border-t border-slate-800 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 shadow-xs backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Konsultasi Bebas Biaya Awal</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          Siap Meningkatkan Kecepatan, Kelincahan, &amp; Power Fisik Atletik Anak Anda?
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Hubungi Coach Zulfi langsung untuk konsultasi kebutuhan pelatihan fisik, jadwal sesi private training, atau asesmen kebugaran atletik ananda.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={APP_CONFIG.whatsappInquiryTemplate()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-xl shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
          >
            <MessageCircle className="h-5 w-5 fill-white" />
            <span>Chat Langsung via WhatsApp</span>
          </a>
        </div>

        <p className="text-[11px] text-slate-500">
          Respon cepat dalam jam kerja operasional · Terbuka untuk semua cabang olahraga
        </p>
      </div>
    </section>
  );
}
