"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle, MapPin } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { DEFAULT_LANDING_PAGE_CONFIG, type LandingPageConfig } from "@/features/landing-page/types";

interface PricingSectionProps {
  initialConfig?: LandingPageConfig;
}

export function PricingSection({ initialConfig }: PricingSectionProps) {
  const config = initialConfig || DEFAULT_LANDING_PAGE_CONFIG;
  const yapAreas = config.pricing.yapAreas && config.pricing.yapAreas.length > 0
    ? config.pricing.yapAreas
    : DEFAULT_LANDING_PAGE_CONFIG.pricing.yapAreas;

  const [selectedAreaId, setSelectedAreaId] = useState<string>(yapAreas[0]?.id || "salatiga");
  const currentArea = yapAreas.find((a) => a.id === selectedAreaId) || yapAreas[0];

  const multilateralPricing = config.pricing.mfdPricing;
  const targetWaNumber = config.contact.whatsappNumber || APP_CONFIG.whatsappNumber;

  const getWaLink = (programTitle: string) => {
    const text = `Halo Coach Zulfi, saya ingin berkonsultasi mengenai program "${programTitle}" untuk ananda/atlet kami.`;
    return `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(text)}`;
  };

  const includedValues = [
    "Program terindividualisasi sesuai fase perkembangan",
    "Sesi pembinaan langsung bersama Coach Zulfi",
    "Peralatan latihan & agility setup standar kepelatihan",
    "Monitoring kualitas gerak dan catatan evaluasi berkala",
    "Konsultasi berkala perkembangan fisik bersama orang tua",
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#0A101D] text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Investasi Pembinaan Terstruktur
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            PRICELIST &amp; BIAYA SESI
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Biaya sesi pelatihan transparan dan disusun berdasarkan format rasio atlet-ke-pelatih untuk menjaga kualitas perhatian teknis di setiap pertemuan.
          </p>
        </div>

        {/* Pricing Tables Grid */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10">
          {/* YAP Pricing */}
          <div className="p-7 sm:p-9 rounded-3xl border border-blue-500/40 bg-slate-900/90 space-y-6 shadow-xl flex flex-col justify-between hover:border-blue-500 transition duration-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 block">
                    PROGRAM 02
                  </span>
                  <h3 className="font-display text-xl font-bold text-white">
                    Youth Athlete Performance (YAP)
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/60 px-3 py-1 rounded-full">
                  Prestasi Cabor
                </span>
              </div>

              {/* Dynamic Area Switcher Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium">Pilih Wilayah Sesi:</span>
                  <span className="font-mono text-blue-400 text-[11px] font-semibold">
                    📍 {currentArea.name}
                  </span>
                </div>
                {yapAreas.length > 1 ? (
                  <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    {yapAreas.map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => setSelectedAreaId(area.id)}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentArea.id === area.id
                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                            : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{area.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-2 text-xs font-semibold text-blue-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{currentArea.name}</span>
                  </div>
                )}
                {currentArea.venueLocation && (
                  <p className="text-[11px] text-slate-400 italic pt-0.5">
                    Venue: {currentArea.venueLocation}
                  </p>
                )}
              </div>

              {/* Rate List */}
              <div className="space-y-3.5">
                {currentArea.tiers.map((item) => (
                  <div
                    key={item.id || item.type}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="font-display font-bold text-sm sm:text-base text-white">
                          {item.type}
                        </strong>
                        <span className="text-[10px] font-mono font-semibold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                          {item.capacity}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-black text-sm sm:text-base text-blue-400">
                          {item.price}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.unit}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={getWaLink(
                `Youth Athlete Performance (${currentArea.name})`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-2"
            >
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-white" />
                <span>
                  DAFTAR YAP ({currentArea.name.toUpperCase()})
                </span>
              </button>
            </a>
          </div>

          {/* MFD Pricing */}
          <div className="p-7 sm:p-9 rounded-3xl border border-emerald-500/40 bg-slate-900/90 space-y-6 shadow-xl flex flex-col justify-between hover:border-emerald-500 transition duration-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                    PROGRAM 01
                  </span>
                  <h3 className="font-display text-xl font-bold text-white">
                    Multilateral Athletic Development (MFD)
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
                  Fondasi Gerak
                </span>
              </div>

              {/* Rate List */}
              <div className="space-y-3.5">
                {multilateralPricing.map((item) => (
                  <div
                    key={item.id || item.type}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="font-display font-bold text-sm sm:text-base text-white">
                          {item.type}
                        </strong>
                        <span className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                          {item.capacity}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-black text-sm sm:text-base text-emerald-400">
                          {item.price}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.unit}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={getWaLink("Multilateral Athletic Development")}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-2"
            >
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-white" />
                <span>DAFTAR MULTILATERAL DEVELOPMENT</span>
              </button>
            </a>
          </div>
        </div>

        {/* Included Values Inset */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 block">
            Nilai Inklusif Dalam Setiap Sesi:
          </span>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-slate-300">
            {includedValues.map((val) => (
              <div key={val} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
