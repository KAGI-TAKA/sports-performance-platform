import { SectionHeader } from "@/components/ui/section-header";
import { CheckCircle2, Zap, Compass } from "lucide-react";

export function WhoItsForSection() {
  const youthCriteria = [
    "Sudah aktif berlatih dalam cabang olahraga tertentu (Sepak Bola, Basket, Bulutangkis, dll.)",
    "Ingin meningkatkan physical performance penunjang cabang olahraganya",
    "Membutuhkan physical preparation dan penguatan kapasitas fisik terarah",
    "Ingin mengasah speed, power, strength, agility, atau conditioning",
    "Mempersiapkan turnamen kompetitif, seleksi tim, atau fase bertanding",
  ];

  const multilateralCriteria = [
    "Belum memiliki spesialisasi cabang olahraga tertentu",
    "Masih mengembangkan basic movement skills dan kontrol tubuh",
    "Membutuhkan peningkatan koordinasi gerak, kelincahan, dan keseimbangan",
    "Ingin mengenal berbagai variasi aktivitas olahraga secara positif & menyenangkan",
    "Membutuhkan fondasi gerak yang kuat sebelum masuk ke tahap sport-specific training",
  ];

  return (
    <section className="py-14 sm:py-20 border-b border-border/40 bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Panduan Penentuan Jalur"
          title="Mana Jalur yang Tepat untuk Anak Anda?"
          description="Gunakan panduan singkat ini untuk melihat keselarasan antara tahap perkembangan anak dan kurikulum pelatihan yang kami sediakan bersama Coach Zulfi."
        />

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Youth Athlete Performance */}
          <div className="p-6 sm:p-7 rounded-2xl border border-blue-500/30 bg-surface-2/40 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                Cocok untuk Youth Athlete Performance:
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-secondary">
              {youthCriteria.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Multilateral Athletic Development */}
          <div className="p-6 sm:p-7 rounded-2xl border border-emerald-500/30 bg-surface-2/40 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Compass className="h-4 w-4" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                Cocok untuk Multilateral Development:
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-secondary">
              {multilateralCriteria.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
