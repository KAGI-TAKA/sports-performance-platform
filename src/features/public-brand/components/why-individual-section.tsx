import { SectionHeader } from "@/components/ui/section-header";
import { UserCheck, Layers, Award, Activity, Compass, GitMerge } from "lucide-react";

export function WhyIndividualSection() {
  const factors = [
    {
      icon: UserCheck,
      title: "Usia Kronologis vs Usia Latihan",
      desc: "Dua anak usia 12 tahun bisa memiliki riwayat latihan yang berbeda 3 tahun. Volume dan intensitas beban harus disesuaikan dengan kesiapan biologisnya.",
    },
    {
      icon: Compass,
      title: "Kemampuan Gerak Dasar (Movement Literacy)",
      desc: "Sebelum membebani fisik dengan latihan berat, atlet harus menguasai mekanika lari, lompat, mendarat, dan stabilisasi tubuh dengan benar.",
    },
    {
      icon: Activity,
      title: "Latar Belakang Olahraga",
      desc: "Kebutuhan fisik atlet sepak bola berbeda dengan basket atau bulutangkis. Pembinaan fisik harus mendukung performa spesifik cabangnya.",
    },
    {
      icon: Layers,
      title: "Kebutuhan & Titik Mulai Personal",
      desc: "Ada atlet yang butuh penguatan akselerasi awal, ada yang butuh mobilitas sendi atau stabilitas lutut pasca cedera.",
    },
  ];

  return (
    <section id="philosophy" className="py-14 sm:py-20 border-b border-border/40 bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Filosofi Pembinaan"
          title="Mengapa Pendekatan Pembinaan Harus Individual?"
          description="Tidak ada satu program latihan seragam yang cocok untuk semua anak. Kami membangun atlet berdasarkan titik mulai dan kebutuhan perkembangannya masing-masing."
        />

        {/* Quality over Quantity Philosophy Statement */}
        <div className="rounded-xl border border-border bg-surface-2/40 p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
              Prinsip Utama: Quality over Quantity
            </span>
          </div>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            Pendekatan latihan Coach Zulfi menggunakan prinsip <strong>&ldquo;Quality over Quantity&rdquo;</strong>, dengan menekankan <em>fundamental movement</em>, <em>physical literacy</em>, <em>strength</em>, <em>speed</em>, <em>agility</em>, <em>coordination</em>, <em>balance</em>, <em>power</em>, serta kemampuan melakukan gerakan secara efektif dan aman.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {factors.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-surface-2/40 p-5 space-y-3 transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-accent-bg text-accent flex items-center justify-center border border-accent/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-xs text-muted">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm text-foreground leading-snug">
                  {f.title}
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Highlight Banner */}
        <div className="rounded-xl border border-accent/20 bg-accent-bg/40 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
              Kesimpulan Filosofi
            </span>
            <p className="font-display font-bold text-sm sm:text-base text-foreground leading-snug">
              &ldquo;Dua atlet dengan usia yang sama tidak boleh diberikan program latihan yang sama persis jika profil fisik dan kemampuan geraknya berbeda.&rdquo;
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-accent">
            <GitMerge className="h-4 w-4" />
            <span>Pendekatan Berbasis Kebutuhan</span>
          </div>
        </div>
      </div>
    </section>
  );
}
