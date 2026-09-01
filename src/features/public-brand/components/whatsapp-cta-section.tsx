import { MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function WhatsappCtaSection() {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/50 px-3.5 py-1.5 text-xs font-semibold text-blue-300 shadow-xs backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Konsultasi Awal Pembinaan</span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
          START WITH UNDERSTANDING THE ATHLETE.
        </h2>

        <div className="space-y-1.5 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          <p className="font-medium text-white">Every athlete starts from a different point.</p>
          <p>
            Let&apos;s understand where your child is now, identify what needs to be developed, and build the next step together.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={APP_CONFIG.whatsappInquiryTemplate("Konsultasi Awal Pembinaan")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 px-7 py-3.5 rounded-xl shadow-lg shadow-blue-950/60 transition-all flex items-center justify-center gap-2 border border-blue-400/30"
          >
            <MessageCircle className="h-4 w-4 fill-white" />
            <span>START YOUR ATHLETE&apos;S DEVELOPMENT</span>
          </a>
        </div>

        <p className="text-[11px] text-slate-500">
          Diskusikan fase perkembangan fisik dan tujuan olahraga anak Anda bersama Coach Zulfi.
        </p>
      </div>
    </section>
  );
}
