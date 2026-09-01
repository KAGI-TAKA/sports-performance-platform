import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Compass, ArrowRight, MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function ProgramPathwaysSection() {
  return (
    <section id="programs" className="py-14 sm:py-20 border-b border-border/40 bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Target &amp; Jalur Pembinaan"
          title="WHO WE HELP"
          description="Different stages of development require different approaches. Kami membagi program ke dalam dua kelompok utama agar setiap anak berlatih sesuai fase kesiapan dan tujuan perkembangannya."
        />

        {/* Dual Pathways Grid */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Pathway A: Multilateral Athletic Development */}
          <div className="rounded-2xl border border-emerald-500/30 bg-surface-2/40 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                  BUILD THE FOUNDATION
                </span>
                <div className="h-9 w-9 rounded-xl bg-surface-1 border border-border flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Compass className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  MULTILATERAL ATHLETIC DEVELOPMENT
                </h3>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                  Program untuk anak yang masih membangun fundamental movement dan physical literacy, terutama pada tahap awal perkembangan.
                </p>
              </div>

              {/* Focus Badge */}
              <div className="p-2.5 rounded-xl bg-surface-1 border border-border text-xs flex items-center gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">
                  Fokus:
                </span>
                <span className="font-semibold text-foreground">
                  Move → Explore → Learn → Develop
                </span>
              </div>

              {/* Who is this for? */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                  Cocok untuk anak yang:
                </span>
                <ul className="space-y-1.5 text-xs text-secondary">
                  {[
                    "Belum memiliki spesialisasi cabang olahraga tertentu",
                    "Masih mengembangkan basic movement skills dan kontrol tubuh",
                    "Membutuhkan peningkatan koordinasi gerak dan keseimbangan",
                    "Ingin mengenal berbagai variasi aktivitas olahraga secara positif",
                    "Membutuhkan fondasi gerak sebelum masuk ke tahap sport-specific training",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Developed Capacities */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                  Kemampuan yang Dikembangkan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Running",
                    "Jumping",
                    "Landing",
                    "Throwing",
                    "Catching",
                    "Balance",
                    "Coordination",
                    "Agility",
                    "Body Control",
                    "Basic Strength",
                  ].map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Multilateral Athletic Development")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-white" />
                  <span>EXPLORE MFD</span>
                </button>
              </a>
              <a
                href="#pricing"
                className="text-xs font-semibold text-secondary hover:text-foreground text-center py-2 px-3 transition"
              >
                Lihat Biaya Sesi →
              </a>
            </div>
          </div>

          {/* Pathway B: Youth Athlete Performance */}
          <div className="rounded-2xl border border-blue-600/30 bg-surface-2/40 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded">
                  DEVELOP PHYSICAL QUALITIES FOR SPORT
                </span>
                <div className="h-9 w-9 rounded-xl bg-surface-1 border border-border flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Zap className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  YOUTH ATHLETE PERFORMANCE
                </h3>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                  Program untuk anak dan remaja yang sudah memiliki basic atau spesialisasi olahraga tertentu dan ingin meningkatkan physical performance.
                </p>
              </div>

              {/* Focus Badge */}
              <div className="p-2.5 rounded-xl bg-surface-1 border border-border text-xs flex items-center gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400 uppercase text-[10px]">
                  Fokus:
                </span>
                <span className="font-semibold text-foreground">
                  Prepare → Develop → Perform
                </span>
              </div>

              {/* Who is this for? */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                  Cocok untuk atlet yang:
                </span>
                <ul className="space-y-1.5 text-xs text-secondary">
                  {[
                    "Sudah aktif berlatih dalam cabang olahraga tertentu (Sepak Bola, Basket, dll.)",
                    "Ingin meningkatkan physical performance penunjang cabor",
                    "Membutuhkan physical preparation dan penguatan kapasitas fisik",
                    "Ingin mengasah speed, power, strength, agility, atau conditioning",
                    "Mempersiapkan turnamen kompetitif, seleksi tim, atau fase bertanding",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Developed Capacities */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                  Kemampuan yang Dikembangkan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Acceleration",
                    "Sprint Mechanics",
                    "Speed",
                    "Strength",
                    "Power",
                    "Change of Direction",
                    "Deceleration",
                    "Jump & Landing",
                    "Conditioning",
                    "Sport-Specific Preparation",
                  ].map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Youth Athlete Performance")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-white" />
                  <span>EXPLORE ATHLETE PERFORMANCE</span>
                </button>
              </a>
              <a
                href="#pricing"
                className="text-xs font-semibold text-secondary hover:text-foreground text-center py-2 px-3 transition"
              >
                Lihat Biaya Sesi →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
