import Image from "next/image";
import { Award, ShieldCheck, CheckCircle2 } from "lucide-react";

export function CoachProfileSection() {
  const credentials = [
    {
      title: "National Level 2 Strength & Conditioning Coach",
      issuer: "LANKOR – ICCA (Indonesia Conditioning Coaches Association)",
      tag: "Level 2 — Advanced",
    },
    {
      title: "National Level 1 Strength & Conditioning Coach",
      issuer: "LANKOR – ICCA (Indonesia Conditioning Coaches Association)",
      tag: "Level 1 — Foundation",
    },
    {
      title: "PSSI National D Football Coaching License",
      issuer: "Persatuan Sepakbola Seluruh Indonesia (PSSI)",
      tag: "Football Coaching",
    },
  ];

  return (
    <section id="coach" className="py-16 sm:py-24 bg-[#0D1527] text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Profil Kepelatihan &amp; Kredensial
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            MEET THE COACH
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Dipimpin oleh pelatih fisik berlisensi resmi dengan komitmen pada keselamatan gerak, individualisasi program, dan sport science terapan.
          </p>
        </div>

        {/* Coach Split Profile Grid */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Authentic Portrait */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[420px] sm:h-[480px] w-full group">
              <Image
                src="/images/landing/coach-zulfi-real.jpg"
                alt="Coach Zulfi Portrait"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                  Head Performance Coach
                </span>
                <h3 className="font-display font-extrabold text-xl text-white">
                  Coach Zulfi
                </h3>
                <p className="text-xs text-slate-300">
                  Strength &amp; Conditioning • Youth Athletic Development Specialist
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Credentials & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>Verified National Credentials</span>
              </span>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Membangun Fondasi Fisik Atlet Muda dengan Pendekatan Terarah &amp; Aman
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Coach Zulfi mendedikasikan pembinaan fisik terstruktur untuk anak dan atlet muda. Pendekatan kepelatihannya memprioritaskan kualitas mekanika gerak dasar sebelum meningkatkan intensitas dan beban latihan, memastikan perkembangan atlet berlangsung optimal dan berkelanjutan.
              </p>
            </div>

            {/* Focus List */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Fokus Pengembangan di Lapangan:
              </span>
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Fundamental Movement Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Progresi Beban Bertahap &amp; Aman</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Movement &amp; Landing Mechanics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Transparansi Perkembangan ke Ortu</span>
                </div>
              </div>
            </div>

            {/* Licenses & Certifications Stack */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Lisensi Kepelatihan Resmi:
              </span>

              <div className="space-y-2.5">
                {credentials.map((c) => (
                  <div
                    key={c.title}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md flex items-center justify-between gap-4 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-sm sm:text-base text-white">
                          {c.title}
                        </h4>
                        <span className="text-xs font-semibold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                          {c.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {c.issuer}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Terverifikasi</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
