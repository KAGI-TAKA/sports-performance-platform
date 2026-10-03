\"use client\";

import { useState } from \"react\";
import { CheckCircle2, MessageCircle, MapPin } from \"lucide-react\";
import { APP_CONFIG } from \"@/lib/constants\";
import { DEFAULT_LANDING_PAGE_CONFIG, type LandingPageConfig } from \"@/features/landing-page/types\";

interface PricingSectionProps {
  initialConfig?: LandingPageConfig;
}

export function PricingSection({ initialConfig }: PricingSectionProps) {
  const config = initialConfig || DEFAULT_LANDING_PAGE_CONFIG;
  const yapAreas = config.pricing.yapAreas && config.pricing.yapAreas.length > 0
    ? config.pricing.yapAreas
    : DEFAULT_LANDING_PAGE_CONFIG.pricing.yapAreas;

  const [selectedAreaId, setSelectedAreaId] = useState<string>(yapAreas[0]?.id || \"salatiga\");
  const currentArea = yapAreas.find((a) => a.id === selectedAreaId) || yapAreas[0];

  const multilateralPricing = config.pricing.mfdPricing;
  const targetWaNumber = config.contact.whatsappNumber || APP_CONFIG.whatsappNumber;

  const getWaLink = (programTitle: string) => {
    const text = Halo Coach Zulfi, saya ingin berkonsultasi mengenai program \"\" untuk ananda/atlet kami.;
    return https://wa.me/?text=;
  };

  const includedValues = [
    \"Program terindividualisasi sesuai fase perkembangan\",
    \"Sesi pembinaan langsung bersama Coach Zulfi\",
    \"Peralatan latihan & agility setup standar kepelatihan\",
    \"Monitoring kualitas gerak dan catatan evaluasi berkala\",
    \"Konsultasi berkala perkembangan fisik bersama orang tua\",
  ];

  return (
    <section id=\"pricing\" className=\"py-16 sm:py-24 bg-[#0A101D] text-white border-b border-slate-800 relative\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12\">
        {/* Section Header */}
        <div className=\"space-y-2\">
          <span className=\"text-xs font-mono font-bold uppercase tracking-wider text-blue-400\">
            Investasi Pembinaan Terstruktur
          </span>
          <h2 className=\"font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white\">
            PRICELIST &amp; BIAYA SESI
          </h2>
          <p className=\"text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed\">
            Biaya sesi pelatihan transparan dan disusun berdasarkan format rasio atlet-ke-pelatih
            untuk menjaga kualitas perhatian teknis di setiap pertemuan.
          </p>
        </div>

        {/* Dual Program Pricing Grid */}
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8 items-start\">
          {/* Program 1: Youth Athlete Performance (YAP) */}
          <div className=\"rounded-3xl border border-blue-500/20 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full\">
            <div className=\"space-y-6\">
              <div className=\"flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5\">
                <div>
                  <span className=\"text-xs font-mono font-semibold uppercase tracking-wider text-blue-400 block\">
                    Program 02
                  </span>
                  <h3 className=\"font-display text-xl sm:text-2xl font-black text-white mt-1\">
                    Youth Athlete Performance (YAP)
                  </h3>
                </div>
                <span className=\"px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20\">
                  Prestasi Cabor
                </span>
              </div>

              {/* Area Switcher: Jika ada lebih dari 1 wilayah tampilkan tab pemilih. Jika hanya 1 wilayah, tampilkan badge tunggal */}
              {yapAreas.length > 1 ? (
                <div className=\"space-y-2\">
                  <div className=\"flex items-center justify-between text-xs text-slate-400\">
                    <span className=\"font-medium\">Pilih Wilayah Sesi:</span>
                    <span className=\"font-mono text-blue-400 text-[11px] font-semibold flex items-center gap-1\">
                      <MapPin className=\"h-3 w-3\" />
                      {currentArea.name}
                    </span>
                  </div>
                  <div className=\"flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800\">
                    {yapAreas.map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => setSelectedAreaId(area.id)}
                        className={lex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer }
                      >
                        <MapPin className=\"h-3.5 w-3.5\" />
                        <span>{area.name}</span>
                      </button>
                    ))}
                  </div>
                  {currentArea.venueLocation && (
                    <p className=\"text-[11px] text-slate-400 italic\">
                      Venue: {currentArea.venueLocation}
                    </p>
                  )}
                </div>
              ) : (
                <div className=\"rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1\">
                  <div className=\"flex items-center gap-1.5 text-xs font-semibold text-blue-400\">
                    <MapPin className=\"h-3.5 w-3.5\" />
                    <span>{currentArea.name}</span>
                  </div>
                  {currentArea.venueLocation && (
                    <p className=\"text-[11px] text-slate-400 italic\">
                      Venue: {currentArea.venueLocation}
                    </p>
                  )}
                </div>
              )}

              {/* Tiers List for Current Area */}
              <div className=\"space-y-3\">
                {currentArea.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className=\"p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 transition-colors space-y-2 group\"
                  >
                    <div className=\"flex items-center justify-between gap-2\">
                      <div className=\"flex items-center gap-2\">
                        <h4 className=\"font-display text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors\">
                          {tier.type}
                        </h4>
                        <span className=\"px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700\">
                          {tier.capacity}
                        </span>
                      </div>
                      <div className=\"text-right\">
                        <span className=\"font-display font-black text-base sm:text-lg text-blue-400\">
                          {tier.price}
                        </span>
                        <span className=\"text-[10px] text-slate-500 block\">
                          {tier.unit}
                        </span>
                      </div>
                    </div>
                    <p className=\"text-xs text-slate-400 leading-relaxed\">
                      {tier.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className=\"pt-4\">
              <a
                href={getWaLink(Youth Athlete Performance ())}
                target=\"_blank\"
                rel=\"noopener noreferrer\"
                className=\"w-full block\"
              >
                <button
                  type=\"button\"
                  className=\"w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition cursor-pointer uppercase tracking-wider\"
                >
                  <MessageCircle className=\"h-4 w-4\" />
                  <span>Daftar YAP ({currentArea.name})</span>
                </button>
              </a>
            </div>
          </div>

          {/* Program 2: Multilateral Athletic Development (MFD) */}
          <div className=\"rounded-3xl border border-emerald-500/20 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full\">
            <div className=\"space-y-6\">
              <div className=\"flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5\">
                <div>
                  <span className=\"text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 block\">
                    Program 01
                  </span>
                  <h3 className=\"font-display text-xl sm:text-2xl font-black text-white mt-1\">
                    Multilateral Athletic Development (MFD)
                  </h3>
                </div>
                <span className=\"px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20\">
                  Fondasi Gerak
                </span>
              </div>

              {/* Tiers List for MFD */}
              <div className=\"space-y-3\">
                {multilateralPricing.map((tier) => (
                  <div
                    key={tier.id}
                    className=\"p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-2 group\"
                  >
                    <div className=\"flex items-center justify-between gap-2\">
                      <div className=\"flex items-center gap-2\">
                        <h4 className=\"font-display text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors\">
                          {tier.type}
                        </h4>
                        <span className=\"px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700\">
                          {tier.capacity}
                        </span>
                      </div>
                      <div className=\"text-right\">
                        <span className=\"font-display font-black text-base sm:text-lg text-emerald-400\">
                          {tier.price}
                        </span>
                        <span className=\"text-[10px] text-slate-500 block\">
                          {tier.unit}
                        </span>
                      </div>
                    </div>
                    <p className=\"text-xs text-slate-400 leading-relaxed\">
                      {tier.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className=\"pt-4\">
              <a
                href={getWaLink(\"Multilateral Athletic Development\")}
                target=\"_blank\"
                rel=\"noopener noreferrer\"
                className=\"w-full block\"
              >
                <button
                  type=\"button\"
                  className=\"w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer uppercase tracking-wider\"
                >
                  <MessageCircle className=\"h-4 w-4\" />
                  <span>Daftar Multilateral Development</span>
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Value Included Banner */}
        <div className=\"rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-4\">
          <h4 className=\"font-display text-sm sm:text-base font-bold text-white text-center sm:text-left\">
            Semua Pilihan Program &amp; Wilayah Sesi Sudah Termasuk:
          </h4>
          <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2\">
            {includedValues.map((val, idx) => (
              <div key={idx} className=\"flex items-center gap-2.5 text-xs text-slate-300\">
                <CheckCircle2 className=\"h-4 w-4 text-blue-400 shrink-0\" />
                <span>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
