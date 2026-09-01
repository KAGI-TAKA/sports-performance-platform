import {
  Activity,
  Zap,
  Gauge,
  RotateCcw,
  ArrowUpDown,
  Flame,
  Scale,
  HeartPulse,
} from "lucide-react";

export function DevelopmentAreasSection() {
  const assessmentAreas = [
    {
      num: "01",
      name: "Movement Quality & Mobility",
      desc: "Menilai rentang gerak aktif, mobilitas sendi utama, dan stabilitas postur dasar.",
      icon: Activity,
    },
    {
      num: "02",
      name: "Sprint & Acceleration Mechanics",
      desc: "Menganalisis teknik akselerasi awal 10 meter dan efisiensi mekanika lari cepat.",
      icon: Zap,
    },
    {
      num: "03",
      name: "Speed & Maximum Velocity",
      desc: "Mengukur kapasitas kecepatan maksimal dan konsistensi langkah saat berlari.",
      icon: Gauge,
    },
    {
      num: "04",
      name: "Change of Direction & Deceleration",
      desc: "Menilai kemampuan atlet melakukan pengereman aman dan perubahan arah dinamis.",
      icon: RotateCcw,
    },
    {
      num: "05",
      name: "Jump & Landing Mechanics",
      desc: "Memeriksa mekanika lepas landas dan stabilitas kontrol lutut serta pergelangan saat landing.",
      icon: ArrowUpDown,
    },
    {
      num: "06",
      name: "Lower & Upper Body Strength",
      desc: "Mengukur kekuatan relatif tubuh terhadap berat badan untuk menopang beban olahraga.",
      icon: Flame,
    },
    {
      num: "07",
      name: "Coordination & Dynamic Balance",
      desc: "Menguji sinkronisasi gerak anggota tubuh dan keseimbangan saat bergerak cepat.",
      icon: Scale,
    },
    {
      num: "08",
      name: "Conditioning & Energy Systems",
      desc: "Memetakan kapasitas daya tahan dan kecepatan pemulihan fisik setelah intensitas tinggi.",
      icon: HeartPulse,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#0A101D] text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Parameter Observasi &amp; Evaluasi
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            WHAT WE ASSESS
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Assessment dirancang untuk memetakan kapasitas fisik dan kualitas gerak atlet secara menyeluruh agar intervensi latihan tepat sasaran.
          </p>
        </div>

        {/* 8 Areas: Clean Grid Layout */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {assessmentAreas.map((area) => {
            const Icon = area.icon;
            return (
              <div
                key={area.num}
                className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:border-blue-500/60 hover:bg-slate-850 transition-all duration-300 space-y-3 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="font-mono font-bold text-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                    {area.num}
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center border border-blue-800/60 group-hover:border-blue-500 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-blue-200 transition-colors">
                    {area.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {area.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Decision-Making Context Block */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 block">
              Bagaimana Data Assessment Digunakan?
            </span>
            <h3 className="font-display font-bold text-base sm:text-lg text-white">
              Dari Data Lapangan Menjadi Keputusan Latihan Nyata
            </h3>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
            Hasil assessment bukan sekadar angka atau skor. Coach Zulfi menggunakannya untuk menentukan titik awal latihan yang aman, mengidentifikasi ketidakseimbangan gerak yang perlu dikoreksi, dan menyusun dosis beban latihan yang tepat sesuai kapasitas atlet.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-sm">
            <div className="space-y-1">
              <strong className="text-white block font-display">
                1. Identifikasi Awal
              </strong>
              <span className="text-slate-300 text-xs sm:text-sm leading-relaxed block">
                Menemukan keunggulan atlet dan aspek gerak yang perlu diperkuat terlebih dahulu.
              </span>
            </div>
            <div className="space-y-1">
              <strong className="text-white block font-display">
                2. Individualisasi Program
              </strong>
              <span className="text-slate-300 text-xs sm:text-sm leading-relaxed block">
                Menyesuaikan variasi latihan, volume, dan intensitas dengan kapasitas aktual atlet.
              </span>
            </div>
            <div className="space-y-1">
              <strong className="text-white block font-display">
                3. Evaluasi Berkala
              </strong>
              <span className="text-slate-300 text-xs sm:text-sm leading-relaxed block">
                Mengukur adaptasi fisik secara periodik untuk memastikan latihan terus memberikan hasil.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
