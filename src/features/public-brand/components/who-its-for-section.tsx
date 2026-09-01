import { SectionHeader } from "@/components/ui/section-header";
import { CheckCircle2, UserCheck, Sparkles } from "lucide-react";

export function WhoItsForSection() {
  const youthCriteria = [
    "Sudah aktif berlatih di cabang olahraga (misal: Sepak Bola, Basket, Bulutangkis)",
    "Membutuhkan peningkatan kecepatan lari, kelincahan gerak, atau daya ledak lompatan",
    "Mempersiapkan fisik untuk menghadapi kompetisi atau seleksi tim",
    "Membutuhkan koreksi mekanika landing dan pencegahan cedera olahraga",
  ];

  const multilateralCriteria = [
    "Sedang membangun fondasi gerak dasar dan belum terspesialisasi pada satu cabang",
    "Memerlukan penguatan koordinasi mata-kaki-tangan dan keseimbangan tubuh",
    "Ingin membangun kecakapan gerak (*physical literacy*) yang kaya dan bervariasi",
    "Membutuhkan ruang latihan fisik yang mendidik, aman, dan memupuk rasa percaya diri",
  ];

  return (
    <section className="py-14 sm:py-20 border-b border-border/40 bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Panduan Pemilihan"
          title="Mana Jalur yang Tepat untuk Anak Anda?"
          description="Gunakan panduan singkat ini untuk melihat keselarasan antara tujuan perkembangan anak dan kurikulum pelatihan yang kami sediakan."
        />

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="p-6 sm:p-7 rounded-2xl border border-border bg-surface-2/40 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                Anak Anda Cocok untuk Youth Athlete Performance:
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-secondary">
              {youthCriteria.map((c) => (
                <li key={c} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-6 sm:p-7 rounded-2xl border border-border bg-surface-2/40 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo" />
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                Anak Anda Cocok untuk Multilateral Development:
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-secondary">
              {multilateralCriteria.map((c) => (
                <li key={c} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo shrink-0 mt-0.5" />
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
