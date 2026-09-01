import { UserCheck, Layers, Award, Activity, Compass, GitMerge, Quote } from "lucide-react";

export function WhyIndividualSection() {
  const pillars = [
    {
      num: "01",
      title: "Individualized",
      desc: "Tidak semua atlet membutuhkan program yang sama. Rencana latihan disusun berdasarkan titik mulai dan kebutuhan spesifik masing-masing anak.",
      icon: UserCheck,
    },
    {
      num: "02",
      title: "Developmentally Appropriate",
      desc: "Program disesuaikan dengan tahap perkembangan biologis, usia latihan, dan kesiapan motorik sang anak.",
      icon: Compass,
    },
    {
      num: "03",
      title: "Progressive",
      desc: "Latihan dikembangkan secara bertahap, dari penguasaan pola gerak fundamental menuju tuntutan fisik yang lebih kompleks.",
      icon: Layers,
    },
    {
      num: "04",
      title: "Movement First",
      desc: "Kualitas gerak dan mekanika tubuh yang benar menjadi prioritas mutlak sebelum mengejar intensitas, beban berat, atau performa instan.",
      icon: Award,
    },
    {
      num: "05",
      title: "Sport-Relevant",
      desc: "Untuk atlet cabor, latihan dirancang selaras dengan tuntutan fisik spesifik olahraga (agility, acceleration, landing control).",
      icon: Activity,
    },
    {
      num: "06",
      title: "Monitored",
      desc: "Perkembangan fisik dan respons adaptasi atlet dipantau secara berkala sehingga program selalu relevan dan terukur.",
      icon: GitMerge,
    },
  ];

  return (
    <section id="philosophy" className="py-16 sm:py-24 bg-[#0A101D] text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Filosofi Pembinaan
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            WHY THIS APPROACH?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Every Athlete Has Different Needs. Every Development Has Its Own Process.
          </p>
        </div>

        {/* Narrative & Quote */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 border-y border-slate-800">
          <div className="lg:col-span-7 space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            <p>
              Tidak semua anak berkembang dengan cara yang sama. Usia kronologis yang sama tidak selalu berarti memiliki kemampuan gerak, pengalaman olahraga, kapasitas fisik, dan kebutuhan latihan yang sama.
            </p>
            <p>
              Karena itu, program latihan tidak seharusnya dibuat dengan pendekatan <em>&ldquo;one program fits all&rdquo;</em>. Kami menggunakan observasi dan assessment sebagai dasar untuk memahami kondisi awal atlet, menentukan prioritas pengembangan, kemudian menyusun latihan yang sesuai dengan kebutuhan dan tahap perkembangannya.
            </p>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 border-l-4 border-l-blue-500 shadow-lg">
            <Quote className="h-5 w-5 text-blue-400" />
            <p className="font-display font-bold text-base sm:text-lg text-white leading-snug">
              &ldquo;The goal is not simply to train harder. The goal is to develop better.&rdquo;
            </p>
            <span className="text-xs font-mono text-slate-400 block">
              — Coach Zulfi
            </span>
          </div>
        </div>

        {/* 6 Pillars: Editorial Row Layout with Hover Transitions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="group space-y-3 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/60 hover:bg-slate-800/60 shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-mono font-bold text-2xl text-blue-400 group-hover:text-blue-300 transition-colors">
                    {p.num}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-blue-950/60 text-blue-400 flex items-center justify-center border border-blue-800/50 group-hover:border-blue-500 transition-colors">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-base text-white group-hover:text-blue-200 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
