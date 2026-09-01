import { MessageCircle, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-border/40 bg-surface-0 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7">
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 rounded-pill bg-accent-bg border border-accent/20 px-3.5 py-1 text-xs font-bold text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>Langkah Pertama Pembinaan</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Mulai dari Memahami Kebutuhan Sang Atlet.
          </h2>
          <p className="text-sm sm:text-base text-secondary max-w-xl mx-auto leading-relaxed">
            Diskusikan latar belakang olahraga, kemampuan gerak saat ini, dan tujuan perkembangan fisik anak Anda langsung bersama <strong>Coach Zulfi</strong>.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={APP_CONFIG.whatsappInquiryTemplate()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="amber" size="lg" className="w-full sm:w-auto gap-2 shadow-sm">
              <MessageCircle className="h-4 w-4" />
              <span>Hubungi Coach Zulfi via WhatsApp</span>
            </Button>
          </a>

          <a href="#programs" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <span>Kembali ke Pilihan Program</span>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Button>
          </a>
        </div>

        <p className="text-[11px] text-muted max-w-md mx-auto">
          Konsultasi awal bertujuan untuk menyelaraskan harapan dan menentukan waktu observasi fisik perdana.
        </p>
      </div>
    </section>
  );
}
