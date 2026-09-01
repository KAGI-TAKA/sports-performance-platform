import Link from "next/link";
import { MessageSquareText, FileSpreadsheet, CalendarCheck, ArrowRight, ShieldCheck } from "lucide-react";

export function ClientPortalShowcaseSection() {
  const transparencyPillars = [
    {
      num: "01",
      title: "Parent Communication & Notes",
      desc: "Setelah sesi latihan, pelatih dapat mendokumentasikan observasi gerak, respons fisik anak, dan arahan latihan di rumah yang dapat dipantau langsung oleh orang tua.",
      icon: MessageSquareText,
    },
    {
      num: "02",
      title: "Digital Progress Records",
      desc: "Setiap data observasi dan perkembangan fisik dicatat secara terstruktur, memberikan gambaran riwayat perkembangan jangka panjang tanpa kehilangan data historis.",
      icon: FileSpreadsheet,
    },
    {
      num: "03",
      title: "Session Attendance Transparency",
      desc: "Rekam kehadiran, konsistensi sesi, dan keteraturan latihan anak tercatat rapi, mendukung pembentukan disiplin dan kebiasaan positif dalam berolahraga.",
      icon: CalendarCheck,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#0D1527] text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Transparansi &amp; Komunikasi
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            PROGRESS YOU CAN UNDERSTAND
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Data bukan untuk membingungkan orang tua dengan istilah rumit. Kami mengubah observasi teknis menjadi informasi yang jelas, relevan, dan mudah dipahami.
          </p>
        </div>

        {/* 3 Pillars: Clean Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {transparencyPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className="group p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:border-blue-500/60 hover:bg-slate-850 transition-all duration-300 space-y-4 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-mono font-bold text-xl text-blue-400 group-hover:text-blue-300 transition-colors">
                    {p.num}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center border border-blue-800/60 group-hover:border-blue-500 transition-colors">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-blue-200 transition-colors">
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

        {/* Portal Access Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span>Dedicated Client &amp; Parent Portal</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              Akses Catatan Perkembangan Anak Kapan Saja
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Orang tua yang telah terdaftar dapat mengakses jadwal sesi latihan, presensi, dan catatan evaluasi fisik anak secara privat melalui platform digital kami.
            </p>
          </div>

          <Link href="/login" className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition cursor-pointer"
            >
              <span>MASUK KE CLIENT PORTAL</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
