import { SectionHeader } from "@/components/ui/section-header";
import {
  Zap,
  RotateCw,
  Dumbbell,
  Scale,
  Footprints,
  Activity,
  Maximize2,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export function DevelopmentAreasSection() {
  const assessmentAreas = [
    {
      name: "MOVEMENT QUALITY",
      desc: "Kemampuan melakukan fundamental movement dengan kontrol, postur stabil, dan koordinasi gerak yang baik.",
      icon: Activity,
    },
    {
      name: "SPEED & ACCELERATION",
      desc: "Kemampuan menghasilkan dan mempertahankan kecepatan langkah awal serta sprint sesuai kebutuhan atlet.",
      icon: Zap,
    },
    {
      name: "STRENGTH",
      desc: "Kemampuan menghasilkan dan mengontrol gaya dalam berbagai pola gerak fungsional maupun beban tubuh.",
      icon: Dumbbell,
    },
    {
      name: "POWER",
      desc: "Kemampuan menghasilkan gaya secara cepat dan eksplosif dalam aksi vertikal maupun horizontal.",
      icon: Sparkles,
    },
    {
      name: "CHANGE OF DIRECTION",
      desc: "Kemampuan melakukan braking (pengereman), changing direction (alih arah), dan re-acceleration efektif.",
      icon: RotateCw,
    },
    {
      name: "BALANCE & CONTROL",
      desc: "Kemampuan mengontrol dan menstabilkan tubuh pada posisi statis maupun saat bergerak dinamis.",
      icon: Scale,
    },
    {
      name: "CONDITIONING",
      desc: "Kapasitas fisik untuk mempertahankan kualitas kerja dan intensitas gerak sesuai kebutuhan olahraga.",
      icon: Footprints,
    },
    {
      name: "MOBILITY",
      desc: "Kemampuan menghasilkan dan mengontrol gerakan dengan range of motion (ROM) sendi yang dibutuhkan.",
      icon: Maximize2,
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-b border-border/40 bg-surface-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <SectionHeader
          kicker="Physical &amp; Movement Assessment"
          title="WHAT WE ASSESS"
          description="Assessment Based on Athlete's Needs. Tidak semua atlet membutuhkan assessment yang sama. Jenis dan prioritas assessment disesuaikan dengan usia, pengalaman olahraga, kebutuhan fisik, tujuan latihan, dan konteks olahraga atlet."
        />

        {/* 8 Areas Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {assessmentAreas.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="p-5 rounded-2xl border border-border bg-surface-1 hover:border-blue-500/40 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-foreground leading-snug">
                    {item.name}
                  </h4>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Movement & Capacity + Sample Report */}
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Movement & Physical Capacity Card */}
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl border border-border bg-surface-1 space-y-4 shadow-2xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Prinsip Latihan
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">
                Movement &amp; Physical Capacity Development
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Latihan dirancang untuk mengembangkan kualitas gerak, kemampuan mengontrol tubuh, kapasitas fisik, serta kemampuan menerima dan menghasilkan gaya sesuai kebutuhan atlet.
            </p>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                Area Perhatian Utama:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-secondary">
                {[
                  "Landing mechanics",
                  "Deceleration control",
                  "Single-leg stability",
                  "Dynamic balance",
                  "Trunk & core control",
                  "Functional strength",
                  "Mobility & flexibility",
                  "Change of direction",
                ].map((pt) => (
                  <div key={pt} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Athlete Report (Contextual Decision-Making Tool) */}
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl border border-blue-500/30 bg-surface-2/40 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  SAMPLE ATHLETE REPORT
                </span>
                <h4 className="font-display text-sm font-bold text-foreground mt-1.5">
                  Contoh Laporan Pengambilan Keputusan Program
                </h4>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-surface-1 border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                  01. Assessment Result
                </span>
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>Landing Mechanics &amp; Single-Leg Control</span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                    Needs Development
                  </span>
                </div>
              </div>

              <div className="flex justify-center text-muted">
                <ArrowRight className="h-3.5 w-3.5 rotate-90" />
              </div>

              <div className="p-3 rounded-xl bg-surface-1 border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  02. Training Priority
                </span>
                <p className="text-foreground font-medium">
                  Single-leg control, knee alignment, and deceleration mechanics.
                </p>
              </div>

              <div className="flex justify-center text-muted">
                <ArrowRight className="h-3.5 w-3.5 rotate-90" />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  03. Training Direction
                </span>
                <p className="text-foreground font-medium">
                  Progressive landing drills, step-down braking, and multi-directional stability work.
                </p>
              </div>
            </div>

            <p className="text-[10px] text-muted italic pt-1 text-center">
              Illustrative example — actual assessment and reporting may vary based on athlete needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
