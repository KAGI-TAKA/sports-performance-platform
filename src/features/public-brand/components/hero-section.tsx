import Image from "next/image";
import { MessageCircle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative pt-10 sm:pt-16 pb-14 sm:pb-20 bg-[#0A101D] text-white border-b border-slate-800 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Editorial Grid */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headline & Narrative */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-950/80 border border-blue-800/60 px-4 py-1.5 text-xs font-semibold text-blue-300 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Strength &amp; Conditioning • Youth Athletic Development</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                BUILD THE ATHLETE <br />
                BEFORE CHASING <br />
                <span className="text-blue-400">PERFORMANCE.</span>
              </h1>
              <p className="font-display text-lg sm:text-xl font-semibold text-slate-200 leading-snug">
                &ldquo;Every Athlete Has Different Needs. Every Development Has Its Own Process.&rdquo;
              </p>
            </div>

            {/* Supporting Explanation */}
            <div className="space-y-3 text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              <p>
                Program pengembangan kemampuan fisik untuk anak dan atlet muda yang disusun berdasarkan kebutuhan individu, kualitas gerak, tahap perkembangan, dan tujuan jangka panjang bersama <strong className="text-white font-bold">Coach Zulfi</strong>.
              </p>
              <p className="text-sm text-slate-400 leading-normal">
                Structured athletic development for children and young athletes — built around individual needs, movement quality, physical development, and long-term progression.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span>START YOUR ATHLETE&apos;S DEVELOPMENT</span>
                </button>
              </a>

              <a href="#programs" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-200 transition duration-200"
                >
                  <span>EXPLORE OUR PROGRAMS</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              </a>
            </div>

            {/* Dual Pathway Concept Pill */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2.5 flex-wrap text-xs">
              <span className="font-medium text-slate-400">
                Jalur Pembinaan:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-1 font-semibold text-emerald-300 text-xs shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Multilateral (MFD)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 px-3.5 py-1 font-semibold text-blue-300 text-xs shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Youth Performance (YAP)
              </span>
            </div>
          </div>

          {/* Right Column: Authentic Coaching Photography with Proper Framing */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[380px] sm:h-[460px] lg:h-[500px] w-full group">
              <Image
                src="/images/landing/coach-field-real.jpg"
                alt="Coach Zulfi Field Coaching"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Clean Editorial Value Strip */}
        <div className="pt-8 border-t border-slate-800 grid sm:grid-cols-3 gap-6 sm:gap-8 text-left">
          <div className="space-y-1.5 sm:border-r sm:border-slate-800 sm:pr-6">
            <span className="text-xs font-mono font-bold text-blue-400 tracking-wider block">
              01 • INDIVIDUALIZED
            </span>
            <h3 className="font-display font-bold text-base text-white">
              Sesuai Tahap Biologis
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Program dirancang berdasarkan usia biologis, kesiapan gerak, dan titik mulai spesifik tiap atlet.
            </p>
          </div>

          <div className="space-y-1.5 sm:border-r sm:border-slate-800 sm:pr-6">
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider block">
              02 • MOVEMENT FIRST
            </span>
            <h3 className="font-display font-bold text-base text-white">
              Kualitas Gerak Fondasi
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Mekanika pendaratan, kontrol tubuh, dan postur dinamis menjadi prioritas sebelum intensitas beban.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-blue-400 tracking-wider block">
              03 • SUSTAINABLE
            </span>
            <h3 className="font-display font-bold text-base text-white">
              Progresi Jangka Panjang
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pengembangan kapasitas fisik berkelanjutan yang aman dan terukur tanpa memaksakan hasil instan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
