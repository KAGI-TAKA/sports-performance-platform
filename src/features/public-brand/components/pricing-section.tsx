import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Check, HelpCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function PricingSection() {
  const youthPricing = [
    {
      type: "Individual Session",
      price: "Rp150.000",
      unit: "/ session",
      capacity: "1 atlet",
      notes: "Cocok untuk atlet muda yang membutuhkan perhatian penuh, koreksi teknik mendalam, dan program terindividualisasi",
    },
    {
      type: "Duo Session",
      price: "Rp200.000",
      unit: "/ session",
      capacity: "2 athletes",
      notes: "Cocok untuk 2 atlet dengan cabang olahraga atau fase perkembangan fisik yang sepadan",
    },
    {
      type: "Trio Session",
      price: "Rp225.000",
      unit: "/ session",
      capacity: "3 athletes",
      notes: "Cocok untuk 3 atlet/rekan tim yang ingin berlatih fisik bersama dengan fokus terarah",
    },
    {
      type: "Small Group Session",
      price: "Rp260.000",
      unit: "/ session",
      capacity: "4 athletes",
      notes: "Cocok untuk grup kecil atlet (4 atlet) yang ingin membangun chemistry dan kapasitas fisik kompetitif",
    },
  ];

  const multilateralPricing = [
    {
      type: "Individual Session",
      price: "Rp125.000",
      unit: "/ session",
      capacity: "1 anak",
      notes: "Cocok untuk anak yang membutuhkan bimbingan intensif 1-on-1 dalam membangun literasi fisik & pola gerak dasar",
    },
    {
      type: "Duo Session",
      price: "Rp170.000",
      unit: "/ session",
      capacity: "2 children",
      notes: "Cocok untuk 2 anak/saudara yang ingin belajar koordinasi dan eksplorasi gerak bersama secara menyenangkan",
    },
    {
      type: "Group Session",
      price: "Rp50.000",
      unit: "/ child / session",
      capacity: "maximum 8 children",
      notes: "Cocok untuk kelompok anak (maksimal 8 anak) yang ingin mengembangkan kelincahan, reaksi, dan kerja sama tim",
    },
  ];

  const includedValues = [
    "Structured Programming",
    "Coach-led Training",
    "Progress Monitoring",
    "Periodic Reassessment",
    "Parent Feedback",
  ];

  return (
    <section id="pricing" className="py-14 sm:py-20 border-b border-border/40 bg-surface-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Transparansi &amp; Nilai Layanan"
          title="Pricelist &amp; Biaya Sesi"
          description="Investasi pembinaan fisik anak yang transparan dan terstruktur. Setiap sesi dirancang berdasarkan fase perkembangan dan kebutuhan spesifik atlet."
        />

        {/* Pricing Grids */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Column 1: Youth Athlete Performance */}
          <div className="rounded-2xl border border-blue-600/30 bg-surface-1 p-6 sm:p-7 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded">
                  FOR ATHLETES WITH SPORT BACKGROUND
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mt-2">
                  YOUTH ATHLETE PERFORMANCE
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Untuk anak &amp; remaja yang sudah memiliki basic/cabor dan ingin meningkatkan physical performance.
                </p>
              </div>
            </div>

            {/* Rate Tiers */}
            <div className="space-y-3">
              {youthPricing.map((item) => (
                <div
                  key={item.type}
                  className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">
                        {item.type}
                      </span>
                      <span className="text-[10px] font-medium text-muted bg-surface-1 border border-border px-1.5 py-0.2 rounded">
                        {item.capacity}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-sm sm:text-base text-blue-600 dark:text-blue-400 tabular-nums">
                        {item.price}
                      </span>
                      <span className="text-[10px] text-muted ml-1">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {item.notes}
                  </p>
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
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span>Daftar Youth Athlete Performance</span>
                </button>
              </a>
            </div>
          </div>

          {/* Column 2: Multilateral Athletic Development */}
          <div className="rounded-2xl border border-emerald-500/30 bg-surface-1 p-6 sm:p-7 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                  FOR FUNDAMENTAL MOVEMENT &amp; LITERACY
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mt-2">
                  MULTILATERAL ATHLETIC DEVELOPMENT
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Untuk anak yang membangun fundamental movement skills dan physical literacy sebelum spesialisasi olahraga.
                </p>
              </div>
            </div>

            {/* Rate Tiers */}
            <div className="space-y-3">
              {multilateralPricing.map((item) => (
                <div
                  key={item.type}
                  className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">
                        {item.type}
                      </span>
                      <span className="text-[10px] font-medium text-muted bg-surface-1 border border-border px-1.5 py-0.2 rounded">
                        {item.capacity}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {item.price}
                      </span>
                      <span className="text-[10px] text-muted ml-1">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {item.notes}
                  </p>
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
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span>Daftar Multilateral Development</span>
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Pricing Value Invariant Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-1 border border-border space-y-4 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Nilai Pembinaan Terstruktur:
            </span>
            <p className="text-xs sm:text-sm text-foreground font-semibold">
              &ldquo;Every session follows an individualized training direction based on the athlete&apos;s current needs and development phase.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-border/60">
            {includedValues.map((val) => (
              <div key={val} className="flex items-center gap-2 text-xs text-secondary">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-medium text-[11px] sm:text-xs">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
