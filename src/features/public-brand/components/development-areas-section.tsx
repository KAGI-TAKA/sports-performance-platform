import { SectionHeader } from "@/components/ui/section-header";
import {
  Zap,
  RotateCw,
  Shield,
  Dumbbell,
  Scale,
  Footprints,
  Activity,
  Maximize2,
  Sparkles,
} from "lucide-react";

export function DevelopmentAreasSection() {
  const areas = [
    {
      name: "Kecepatan & Akselerasi",
      desc: "Mekanika sprint linier, postur dorong langkah awal, dan efisiensi pergantian frekuensi langkah.",
      icon: Zap,
    },
    {
      name: "Kelincahan (Change of Direction)",
      desc: "Deselerasi terkontrol, titik tumpu kaki rendah (center of gravity), dan kecepatan respon gerak.",
      icon: RotateCw,
    },
    {
      name: "Kekuatan Fungsional",
      desc: "Stabilitas otot inti (core), kekuatan tungkai bawah, dan kontrol postur tubuh saat bergerak.",
      icon: Dumbbell,
    },
    {
      name: "Power & Daya Ledak",
      desc: "Pola pliometrik terukur untuk menghasilkan daya ledak lompatan dan akselerasi vertikal-horizontal.",
      icon: Sparkles,
    },
    {
      name: "Mekanika Landing & Stabilitas",
      desc: "Teknik mendarat yang benar untuk meredam impak benturan dan melindungi persendian lutut/engkel.",
      icon: Footprints,
    },
    {
      name: "Koordinasi & Keseimbangan",
      desc: "Keterpaduan gerak mata-kaki-tangan, kontrol ritme, dan stabilitas vestibular tubuh.",
      icon: Scale,
    },
    {
      name: "Efisiensi Pola Gerak",
      desc: "Mengeliminasi gerakan bocor yang membuang energi atlet saat bergerak, baik di sesi latihan maupun pertandingan.",
      icon: Activity,
    },
    {
      name: "Pencegahan Cedera Dini",
      desc: "Penguatan otot penopang sendi, fleksibilitas fungsional, dan penyesuaian beban anti-overuse.",
      icon: Shield,
    },
    {
      name: "Kecakapan Gerak Multilateral",
      desc: "Variasi pola motorik kaya agar anak memiliki fondasi fisik adaptif terhadap berbagai cabang olahraga.",
      icon: Maximize2,
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-b border-border/40 bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Kualitas Atletik"
          title="Peta Pengembangan Fisik yang Kami Bangun"
          description="Bukan sekadar latihan fisik umum, setiap sesi menyasar kualitas biomotorik spesifik yang terbukti mendukung kesiapan gerak, ketahanan, dan performa baik untuk anak yang membangun fondasi maupun yang mengejar performa kompetitif."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {areas.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="p-5 rounded-xl border border-border bg-surface-2/40 hover:bg-surface-2 hover:border-border-strong transition-colors space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-surface-1 border border-border flex items-center justify-center text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-foreground">
                    {item.name}
                  </h4>
                </div>
                <p className="text-xs text-secondary leading-relaxed pl-1">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
