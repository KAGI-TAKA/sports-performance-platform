import { CheckCircle2, MessageCircle } from "lucide-react";
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
      type: "Group Session",
      price: "Rp260.000",
      unit: "/ session",
      capacity: "Group",
      notes: "Cocok untuk latihan kelompok atlet yang ingin membangun chemistry dan kapasitas fisik kompetitif",
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
      capacity: "Group",
      notes: "Sesi latihan kelompok terstruktur untuk membangun literasi fisik, kelincahan, reaksi, dan kerja sama tim",
    },
  ];

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

              {/* Rate List */}
              <div className="space-y-3.5">
                {youthPricing.map((item) => (
                  <div
                    key={item.type}
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
              href={APP_CONFIG.whatsappInquiryTemplate("Pendaftaran Youth Athlete Performance")}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-2"
            >
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-white" />
                <span>DAFTAR YOUTH ATHLETE PERFORMANCE</span>
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
                    key={item.type}
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
              href={APP_CONFIG.whatsappInquiryTemplate("Pendaftaran Multilateral Athletic Development")}
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
