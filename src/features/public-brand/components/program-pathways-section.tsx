import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Compass, ArrowRight, MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function ProgramPathwaysSection() {
  const programs = [
    {
      id: "youth-performance",
      name: "Youth Athlete Performance",
      badge: "SPORT-SPECIFIC DEVELOPMENT",
      variant: "amber" as const,
      accentBorder: "border-accent/40",
      accentBg: "bg-accent-bg/30",
      icon: Zap,
      whoItsFor:
        "Untuk atlet muda yang telah aktif di cabang olahraga tertentu (Sepak Bola, Basket, Bulutangkis, dll.) dan ingin meningkatkan kapasitas fisik penunjang performa pertandingan.",
      focusPoints: [
        "Kecepatan lari & akselerasi langkah awal",
        "Kelincahan & kemampuan ubah arah (*change of direction*)",
        "Kekuatan fungsional & stabilitas core",
        "Power ledak & mekanika lompat-mendarat (*landing mechanics*)",
        "Pencegahan cedera & efisiensi gerak spesifik cabang",
      ],
      idealAge: "Usia 9–16 Tahun (atau memiliki basic olahraga)",
      whatsappTag: "Youth Athlete Performance",
    },
    {
      id: "multilateral-development",
      name: "Multilateral Athletic Development",
      badge: "FOUNDATION & PHYSICAL LITERACY",
      variant: "indigo" as const,
      accentBorder: "border-indigo/40",
      accentBg: "bg-indigo-bg/30",
      icon: Compass,
      whoItsFor:
        "Untuk anak yang sedang membangun kecakapan gerak dasar (*physical literacy*), koordinasi motorik, dan variasi gerak menyeluruh sebelum spesialisasi olahraga.",
      focusPoints: [
        "Pola gerak dasar (lari, lompat, lempar, tangkap, merayap)",
        "Keseimbangan dinamis & kesadaran ruang (*spatial awareness*)",
        "Koordinasi motorik & kecepatan reaksi",
        "Kekuatan alami berbasis berat badan",
        "Eksplorasi aktivitas gerak multi-cabang yang menyenangkan",
      ],
      idealAge: "Usia 6–12 Tahun (tahap pondasi motorik)",
      whatsappTag: "Multilateral Athletic Development",
    },
  ];

  return (
    <section id="programs" className="py-14 sm:py-20 border-b border-border/40 bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Pilihan Program"
          title="Dua Jalur Pembinaan Atletik Sesuai Kesiapan Anak"
          description="Kami membedakan jalur latihan bukan berdasarkan 'level bagus/buruk', melainkan kebutuhan biologis anak: membangun fondasi gerak menyeluruh atau mengasah performa cabang olahraga."
        />

        {/* Side-by-Side Programs */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {programs.map((prog) => {
            const Icon = prog.icon;
            return (
              <div
                key={prog.id}
                className={`rounded-2xl border ${prog.accentBorder} bg-surface-2/30 p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden transition-all shadow-2xs hover:shadow-sm`}
              >
                {/* Micro Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={prog.variant} size="default">
                      {prog.badge}
                    </Badge>
                    <div className="h-9 w-9 rounded-xl bg-surface-1 border border-border flex items-center justify-center text-foreground">
                      <Icon className="h-4.5 w-4.5 text-accent" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      {prog.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                      {prog.whoItsFor}
                    </p>
                  </div>

                  {/* Target Age Banner */}
                  <div className="px-3.5 py-2 rounded-lg bg-surface-1 border border-border text-xs font-semibold text-foreground flex items-center gap-2">
                    <span className="text-muted text-[11px] uppercase font-bold">Sasaran:</span>
                    <span>{prog.idealAge}</span>
                  </div>

                  {/* Focus Areas List */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Fokus Pengembangan:
                    </span>
                    <ul className="space-y-2 text-xs text-secondary">
                      {prog.focusPoints.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href={APP_CONFIG.whatsappInquiryTemplate(prog.whatsappTag)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant={prog.variant === "amber" ? "amber" : "default"} size="default" className="w-full gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Konsultasikan Jalur Ini</span>
                    </Button>
                  </a>
                  <a href="#pricing" className="text-xs font-semibold text-secondary hover:text-foreground text-center py-2 px-3">
                    Lihat Rincian Biaya →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
