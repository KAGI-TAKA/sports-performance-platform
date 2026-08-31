import { Play, Sparkles, Video, Camera } from "lucide-react";

export function TrainingShowcaseSection() {
  const showcases = [
    {
      title: "Speed Ladder & Footwork Drills",
      category: "Kelincahan & Reaksi",
      desc: "Latihan pola langkah cepat dan stabilitas pergelangan kaki untuk transisi bertahan ke menyerang.",
    },
    {
      title: "Sprint Acceleration & Resistance Run",
      category: "Kecepatan Eksplosif",
      desc: "Latihan akselerasi 10–30 meter dengan penekanan pada sudut dorong badan (*drive phase*).",
    },
    {
      title: "Plyometric Box Jump & Landing Technique",
      category: "Daya Ledak & Vertikal",
      desc: "Penguatan otot kuadrisep dan teknik absorpsi pendaratan untuk meminimalisir beban lutut.",
    },
    {
      title: "Core Stability & Balance Conditioning",
      category: "Ketahanan Otot Inti",
      desc: "Fondasi postur tubuh yang kokoh agar atlet tidak mudah jatuh saat beradu badan di lapangan.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Dokumentasi Lapangan
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Suasana Sesi Latihan Lapangan Nyata
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Koreksi teknik intensif, peralatan latihan terstandar, dan atmosfer pembinaan disiplin namun bersahabat.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {showcases.map((item, idx) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
            >
              {/* Media Thumbnail Frame */}
              <div className="relative aspect-video bg-gradient-to-tr from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-center text-slate-500 group">
                <div className="h-10 w-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-md">
                  <Camera className="h-4 w-4" />
                </div>
                <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-[10px] text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-900/40">
                  {item.category}
                </span>
              </div>

              {/* Caption */}
              <div className="p-4 pt-1 space-y-1.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-white">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
