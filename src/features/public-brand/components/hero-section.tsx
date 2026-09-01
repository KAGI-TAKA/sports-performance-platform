import { MessageCircle, ArrowRight, Target, ShieldCheck, CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-border/40 overflow-hidden bg-surface-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Brand Statement & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span>Strength &amp; Conditioning • Youth Athletic Development</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                BUILD THE ATHLETE BEFORE CHASING PERFORMANCE.
              </h1>
              <p className="font-display text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 leading-snug">
                &ldquo;Every Athlete Has Different Needs. Every Development Has Its Own Process.&rdquo;
              </p>
            </div>

            {/* Supporting Explanation */}
            <div className="space-y-2 text-sm sm:text-base text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              <p>
                Program pengembangan kemampuan fisik untuk anak dan atlet muda yang disusun berdasarkan kebutuhan individu, kualitas gerak, tahap perkembangan, dan tujuan jangka panjang bersama <strong>Coach Zulfi</strong>.
              </p>
              <p className="text-xs text-muted">
                Structured athletic development for children and young athletes — built around individual needs, movement quality, physical development, and long-term progression.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span>START YOUR ATHLETE&apos;S DEVELOPMENT</span>
                </button>
              </a>

              <a href="#programs" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-1 hover:bg-surface-2 px-5 py-3 text-xs sm:text-sm font-semibold text-foreground transition"
                >
                  <span>EXPLORE OUR PROGRAMS</span>
                  <ArrowRight className="h-4 w-4 text-muted" />
                </button>
              </a>
            </div>

            {/* Editorial Highlight Bar */}
            <div className="pt-6 border-t border-border/60 grid grid-cols-3 gap-3 text-left">
              <div className="p-3 rounded-xl bg-surface-1 border border-border/60">
                <div className="font-display font-bold text-xs sm:text-sm text-foreground">
                  Individualized
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  Sesuai usia &amp; tahap atlet
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-1 border border-border/60">
                <div className="font-display font-bold text-xs sm:text-sm text-foreground">
                  Movement Quality
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  Kualitas gerak fundamental
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-1 border border-border/60">
                <div className="font-display font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                  Long-term
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  Progresi jangka panjang
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Coaching Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 shadow-sm space-y-4 relative">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-2xl" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3.5 pt-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Dual Pathway Pembinaan
                  </span>
                  <div className="font-display font-bold text-sm text-foreground">
                    Sistem Pengembangan Terstruktur
                  </div>
                </div>
                <Badge variant="outline" size="sm" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 font-bold">
                  PROGRESSIVE
                </Badge>
              </div>

              {/* Pathways Preview */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-2/70 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-foreground">
                      Multilateral Athletic Development
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Fondasi Gerak
                    </span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Untuk anak yang sedang membangun fundamental movement skills, koordinasi, keseimbangan, dan physical literacy sebelum spesialisasi olahraga.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-2/70 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-foreground">
                      Youth Athlete Performance
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      Cabor &amp; S&amp;C
                    </span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Untuk anak/remaja yang sudah memiliki spesifikasi cabor dan ingin meningkatkan speed, power, strength, agility, dan physical preparation.
                  </p>
                </div>
              </div>

              {/* Coaching Philosophy Quote */}
              <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" />
                  Prinsip Coaching Coach Zulfi:
                </div>
                <p className="text-secondary italic text-[11px] leading-relaxed">
                  &ldquo;The goal is not simply to train harder. The goal is to develop better.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
