import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function FinalCtaSection() {
  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#0B132B] text-white relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-10 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-8 relative z-10">
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-blue-300 uppercase">
          <Sparkles className="h-3.5 w-3.5 text-blue-300" />
          <span>Langkah Pertama Pembinaan Fisik</span>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.04]">
            START WITH UNDERSTANDING <br />
            <span className="text-blue-400">THE ATHLETE.</span>
          </h2>
          <div className="space-y-2 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
            <p className="font-semibold text-white">
              Every athlete starts from a different point.
            </p>
            <p className="text-neutral-300">
              Let&apos;s understand where your child is now, identify what needs to be developed, and build the next step together.
            </p>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
          <a
            href={APP_CONFIG.whatsappInquiryTemplate("Konsultasi Awal Pembinaan")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-8 py-4 text-xs sm:text-sm font-bold tracking-wide text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-white" />
              <span>START YOUR ATHLETE&apos;S DEVELOPMENT</span>
            </button>
          </a>

          <a
            href={APP_CONFIG.whatsappInquiryTemplate("Tanya Mengenai Program")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 px-7 py-4 text-xs sm:text-sm font-bold text-white transition backdrop-blur-md cursor-pointer"
            >
              <span>ASK ABOUT OUR PROGRAMS</span>
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </button>
          </a>
        </div>

        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed pt-2">
          Konsultasi awal via WhatsApp membantu Coach Zulfi memahami latar belakang olahraga dan kebutuhan anak Anda sebelum sesi observasi dijadwalkan.
        </p>
      </div>
    </section>
  );
}
