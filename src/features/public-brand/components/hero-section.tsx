import { MessageCircle, ArrowRight, Activity, ShieldCheck, Target, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative pt-8 sm:pt-14 pb-14 sm:pb-20 border-b border-border/40 overflow-hidden bg-surface-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Brand Statement & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2 rounded-pill bg-accent-bg border border-accent/20 px-3.5 py-1 text-xs font-bold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>Strength &amp; Conditioning • Youth Athletic Development</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Setiap Atlet Memiliki Kebutuhan Berbeda.
              </h1>
              <p className="font-display text-lg sm:text-xl font-semibold text-accent leading-snug">
                &ldquo;Every Athlete Has Different Needs. Every Development Has Its Own Process.&rdquo;
              </p>
            </div>

            {/* Supporting Explanation */}
            <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              Pelatihan fisik terstruktur untuk atlet muda yang disesuaikan secara presisi berdasarkan usia biologis, kemampuan gerak dasar (movement literacy), latar belakang olahraga, dan target perkembangan jangka panjang bersama <strong>Coach Zulfi</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="amber" size="lg" className="w-full sm:w-auto gap-2 shadow-sm">
                  <MessageCircle className="h-4 w-4" />
                  <span>Konsultasi dengan Coach Zulfi</span>
                </Button>
              </a>

              <a href="#programs" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <span>Pelajari Pilihan Program</span>
                  <ArrowRight className="h-4 w-4 text-muted" />
                </Button>
              </a>
            </div>

            {/* Editorial Highlight Bar */}
            <div className="pt-6 border-t border-border/60 grid grid-cols-3 gap-3 text-left">
              <div className="p-2.5 rounded-lg bg-surface-1 border border-border/60">
                <div className="font-display font-bold text-sm sm:text-base text-foreground">
                  Individual
                </div>
                <div className="text-[11px] text-muted">
                  Bukan program generik
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-border/60">
                <div className="font-display font-bold text-sm sm:text-base text-foreground">
                  Sport Science
                </div>
                <div className="text-[11px] text-muted">
                  Data pengujian terukur
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-border/60">
                <div className="font-display font-bold text-sm sm:text-base text-accent">
                  Transparan
                </div>
                <div className="text-[11px] text-muted">
                  Laporan berkala orang tua
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Performance Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 shadow-sm space-y-4 relative">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-t-2xl" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3.5 pt-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    Profil Pembinaan Atletik
                  </span>
                  <div className="font-display font-bold text-sm text-foreground">
                    Sistem Evaluasi &amp; Pemrograman Fisik
                  </div>
                </div>
                <Badge variant="amber" size="sm">
                  TERSTRUKTUR
                </Badge>
              </div>

              {/* Key Qualities Preview */}
              <div className="space-y-2.5 text-xs">
                <div className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Fokus Pengembangan Fisik Terarah:
                </div>
                {[
                  { name: "Kecepatan & Akselerasi", desc: "Mekanika sprint & reaksi awal", level: "Speed" },
                  { name: "Kelincahan & Arah Gerak", desc: "Deselerasi & change of direction", level: "Agility" },
                  { name: "Power & Mekanika Landing", desc: "Eksplosif & pencegahan cedera", level: "Power" },
                  { name: "Kekuatan Fondasi Gerak", desc: "Core stability & posture control", level: "Strength" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2/60 border border-border/40"
                  >
                    <div>
                      <div className="font-semibold text-foreground text-xs">{item.name}</div>
                      <div className="text-[11px] text-muted">{item.desc}</div>
                    </div>
                    <span className="font-display font-bold text-[11px] text-accent px-2 py-0.5 rounded bg-surface-1 border border-border">
                      {item.level}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coaching Philosophy Quote */}
              <div className="p-3 rounded-xl bg-surface-2 border border-border/60 text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <Target className="h-3 w-3" />
                  Prinsip Pelatihan Coach Zulfi:
                </div>
                <p className="text-secondary italic text-[11px] leading-relaxed">
                  &ldquo;Asesmen bukan tujuan akhir, melainkan dasar penentuan program latihan yang tepat untuk perkembangan jangka panjang sang atlet.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
