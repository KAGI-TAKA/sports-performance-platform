import Link from "next/link";
import {
  Activity,
  ChevronRight,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Award,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-20 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 shadow-xs backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Youth Athletic Physical &amp; Conditioning Specialist</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Bina Potensi Fisik Atletik Anak Anda Secara{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                Terukur &amp; Teruji.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Bersama <strong>Coach Zulfi</strong>, setiap sesi pelatihan fisik dirancang berbasis data pengujian ilmiah (*sport science*), program latihan terarah, dan pemantauan perkembangan transparan langsung kepada orang tua.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 border border-emerald-500/40"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Konsultasi Program via WhatsApp</span>
              </a>

              <a
                href="#programs"
                className="w-full sm:w-auto text-sm font-semibold text-slate-200 border border-slate-700 hover:border-slate-500 hover:bg-slate-900 px-5 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Lihat Pilihan Program</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="font-display font-extrabold text-xl text-white">7 Komponen</div>
                <div className="text-xs text-slate-400">Pengujian Fisik Resmi</div>
              </div>
              <div>
                <div className="font-display font-extrabold text-xl text-indigo-400">PDF &amp; Radar</div>
                <div className="text-xs text-slate-400">Laporan Transparan</div>
              </div>
              <div>
                <div className="font-display font-extrabold text-xl text-amber-400">Multi-Sport</div>
                <div className="text-xs text-slate-400">Semua Cabang Olahraga</div>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/90 p-5 sm:p-6 shadow-2xl shadow-indigo-950/50 backdrop-blur-md space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Evaluasi Performa Terkini</div>
                    <div className="text-[10px] text-slate-400">Official Physical Assessment Report</div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-400 font-mono">
                  Grade A (88.5%)
                </span>
              </div>

              {/* Progress Bars Preview */}
              <div className="space-y-3 text-xs">
                {[
                  { label: "Kecepatan (Sprint 30m)", val: 92, color: "bg-indigo-500" },
                  { label: "Power & Vertikal (Vertical Jump)", val: 88, color: "bg-emerald-500" },
                  { label: "Kelincahan (Pro Agility 5-10-5)", val: 85, color: "bg-violet-500" },
                  { label: "Daya Tahan Kardio (Yo-Yo Test)", val: 80, color: "bg-amber-500" },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300">{stat.label}</span>
                      <span className="font-mono font-bold text-white">{stat.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color} rounded-full`}
                        style={{ width: `${stat.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Coach Feedback Note */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-3 text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  Catatan Evaluasi Coach Zulfi:
                </div>
                <p className="text-slate-300 italic text-[11px] leading-relaxed">
                  &quot;Akselerasi sprint dan kestabilan kaki meningkat pesat. Fokus fase berikutnya adalah penguatan core &amp; daya tahan anaerobik.&quot;
                </p>
              </div>

              {/* Client Access Notice */}
              <div className="pt-1 text-center">
                <span className="text-[11px] text-slate-400">
                  Setiap klien mendapatkan laporan PDF berkop &amp; akses portal pemantauan personal.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
