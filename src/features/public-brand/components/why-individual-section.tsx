import { SectionHeader } from "@/components/ui/section-header";
import { UserCheck, Layers, Award, Activity, Compass, GitMerge, CheckCircle2, ShieldCheck } from "lucide-react";

export function WhyIndividualSection() {
  const pillars = [
    {
      num: "01",
      title: "INDIVIDUALIZED",
      desc: "Tidak semua atlet membutuhkan program yang sama. Rencana latihan disusun berdasarkan titik mulai dan kebutuhan spesifik masing-masing anak.",
      icon: UserCheck,
    },
    {
      num: "02",
      title: "DEVELOPMENTALLY APPROPRIATE",
      desc: "Program disesuaikan dengan tahap perkembangan biologis, usia latihan, dan kesiapan motorik sang anak.",
      icon: Compass,
    },
    {
      num: "03",
      title: "PROGRESSIVE",
      desc: "Latihan dikembangkan secara bertahap, dari penguasaan pola gerak fundamental menuju tuntutan fisik yang lebih kompleks.",
      icon: Layers,
    },
    {
      num: "04",
      title: "MOVEMENT FIRST",
      desc: "Kualitas gerak dan mekanika tubuh yang benar menjadi prioritas mutlak sebelum mengejar intensitas, beban berat, atau performa instan.",
      icon: Award,
    },
    {
      num: "05",
      title: "SPORT-RELEVANT",
      desc: "Untuk atlet cabor, latihan dirancang selaras dengan tuntutan fisik spesifik olahraga (agility, acceleration, landing control).",
      icon: Activity,
    },
    {
      num: "06",
      title: "MONITORED",
      desc: "Perkembangan fisik dan respons adaptasi atlet dipantau secara berkala sehingga program selalu relevan dan terukur.",
      icon: GitMerge,
    },
  ];

  return (
    <section id="philosophy" className="py-14 sm:py-20 border-b border-border/40 bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Filosofi Pembinaan"
          title="WHY THIS APPROACH?"
          description="Every Athlete Has Different Needs. Every Development Has Its Own Process."
        />

        {/* Core Philosophy Statement Card */}
        <div className="rounded-2xl border border-border bg-surface-2/60 p-6 sm:p-7 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Prinsip Dasar: Quality over Quantity
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-secondary leading-relaxed">
            <p>
              Tidak semua anak berkembang dengan cara yang sama. Usia kronologis yang sama tidak selalu berarti memiliki kemampuan gerak, pengalaman olahraga, kapasitas fisik, dan kebutuhan latihan yang sama.
            </p>
            <p>
              Karena itu, program latihan tidak seharusnya dibuat dengan pendekatan <em>&ldquo;one program fits all&rdquo;</em>. Kami menggunakan observasi dan assessment sebagai dasar untuk memahami kondisi awal atlet, menentukan prioritas pengembangan, kemudian menyusun latihan yang sesuai dengan kebutuhan dan tahap perkembangannya.
            </p>
            <p className="font-bold text-foreground pt-1">
              &ldquo;The goal is not simply to train harder. The goal is to develop better.&rdquo;
            </p>
          </div>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-surface-2/40 p-5 space-y-3 transition-colors hover:border-blue-500/40 hover:bg-surface-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-display font-extrabold text-xs text-muted">
                    {p.num}
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm text-foreground leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
