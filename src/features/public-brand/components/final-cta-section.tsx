import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function FinalCtaSection() {
  return (
    <section id="contact" className="py-16 sm:py-24 border-b border-border/40 bg-surface-0 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7">
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Langkah Pertama Pembinaan Fisik</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            START WITH UNDERSTANDING THE ATHLETE.
          </h2>
          <div className="space-y-1.5 text-sm sm:text-base text-secondary max-w-xl mx-auto leading-relaxed">
            <p className="font-medium text-foreground">
              Every athlete starts from a different point.
            </p>
            <p>
              Let&apos;s understand where your child is now, identify what needs to be developed, and build the next step together.
            </p>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={APP_CONFIG.whatsappInquiryTemplate("Konsultasi Awal Pembinaan")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-1 hover:bg-surface-2 px-5 py-3.5 text-xs sm:text-sm font-semibold text-foreground transition cursor-pointer"
            >
              <span>ASK ABOUT OUR PROGRAMS</span>
              <ArrowRight className="h-4 w-4 text-muted" />
            </button>
          </a>
        </div>

        <p className="text-[11px] text-muted max-w-md mx-auto">
          Konsultasi awal via WhatsApp membantu Coach Zulfi memahami latar belakang olahraga dan kebutuhan anak Anda sebelum sesi observasi dijadwalkan.
        </p>
      </div>
    </section>
  );
}
