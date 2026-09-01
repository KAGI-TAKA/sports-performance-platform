import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Check, HelpCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function PricingSection() {
  const youthPricing = [
    { type: "Individual Session", price: "Rp150.000", unit: "/ sesi", notes: "1 Atlet (Fokus Eksklusif 1-on-1)" },
    { type: "Duo Session", price: "Rp200.000", unit: "/ sesi", notes: "2 Atlet (Rp100.000 / atlet)" },
    { type: "Trio Session", price: "Rp225.000", unit: "/ sesi", notes: "3 Atlet (Rp75.000 / atlet)" },
    { type: "Small Group Session", price: "Rp260.000", unit: "/ sesi", notes: "4 Atlet (Rp65.000 / atlet)" },
  ];

  const multilateralPricing = [
    { type: "Individual Session", price: "Rp125.000", unit: "/ sesi", notes: "1 Anak (Fondasi Gerak Eksklusif)" },
    { type: "Duo Session", price: "Rp170.000", unit: "/ sesi", notes: "2 Anak (Rp85.000 / anak)" },
    { type: "Group Session", price: "Rp50.000", unit: "/ anak / sesi", notes: "Maksimal 8 Anak per grup" },
  ];

  return (
    <section id="pricing" className="py-14 sm:py-20 border-b border-border/40 bg-surface-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Transparansi Biaya"
          title="Biaya Sesi Pelatihan"
          description="Pilihan paket sesi terstruktur yang transparan tanpa biaya tersembunyi. Penentuan program didasarkan pada hasil observasi kebutuhan dan tahap perkembangan anak."
        />

        {/* Pricing Grids */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Column 1: Youth Athlete Performance */}
          <div className="rounded-2xl border border-accent/40 bg-surface-1 p-6 sm:p-7 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <Badge variant="amber" size="sm">
                  SPORT-SPECIFIC
                </Badge>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mt-1.5">
                  Youth Athlete Performance
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Untuk atlet muda dengan latar belakang cabang olahraga
                </p>
              </div>
            </div>

            {/* Rate Tiers */}
            <div className="space-y-3">
              {youthPricing.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border/60"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs text-foreground">
                      {item.type}
                    </div>
                    <div className="text-[11px] text-muted">
                      {item.notes}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-sm sm:text-base text-foreground tabular-nums">
                      {item.price}
                    </span>
                    <span className="text-[10px] text-muted block -mt-0.5">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Youth Athlete Performance")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <Button variant="amber" size="default" className="w-full gap-2 justify-center">
                  <MessageCircle className="h-4 w-4" />
                  <span>Daftar Sesi Youth Performance</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Column 2: Multilateral Athletic Development */}
          <div className="rounded-2xl border border-indigo/40 bg-surface-1 p-6 sm:p-7 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <Badge variant="indigo" size="sm">
                  FOUNDATION &amp; MOTOR LITERACY
                </Badge>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mt-1.5">
                  Multilateral Athletic Development
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Untuk anak yang membangun fondasi gerak &amp; koordinasi
                </p>
              </div>
            </div>

            {/* Rate Tiers */}
            <div className="space-y-3">
              {multilateralPricing.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/60 border border-border/60"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs text-foreground">
                      {item.type}
                    </div>
                    <div className="text-[11px] text-muted">
                      {item.notes}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-sm sm:text-base text-foreground tabular-nums">
                      {item.price}
                    </span>
                    <span className="text-[10px] text-muted block -mt-0.5">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Multilateral Athletic Development")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <Button variant="default" size="default" className="w-full gap-2 justify-center">
                  <MessageCircle className="h-4 w-4" />
                  <span>Daftar Sesi Multilateral Development</span>
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Pricing Invariant Note */}
        <div className="p-4 rounded-xl bg-surface-2 border border-border flex items-start gap-3 text-xs text-secondary">
          <HelpCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-foreground block">
              Konsultasi &amp; Penentuan Jalur Awal
            </span>
            <p className="text-muted leading-relaxed">
              Jika Anda belum yakin jalur mana yang paling sesuai, Anda dapat berkonsultasi terlebih dahulu dengan Coach Zulfi untuk mendiskusikan riwayat aktivitas dan tujuan sang anak sebelum sesi latihan pertama dijadwalkan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
