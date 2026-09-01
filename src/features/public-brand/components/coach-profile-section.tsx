import { SectionHeader } from "@/components/ui/section-header";
import { Award, ShieldCheck, CheckCircle2, Sparkles, Quote } from "lucide-react";

export function CoachProfileSection() {
  const credentials = [
    {
      level: "01",
      title: "National Level 2 Strength & Conditioning Coach",
      issuer: "LANKOR – ICCA (Indonesia Conditioning Coaches Association)",
      tag: "LEVEL 2 — ADVANCED",
    },
    {
      level: "02",
      title: "National Level 1 Strength & Conditioning Coach",
      issuer: "LANKOR – ICCA (Indonesia Conditioning Coaches Association)",
      tag: "LEVEL 1 — FOUNDATION",
    },
    {
      level: "03",
      title: "PSSI National D Football Coaching License",
      issuer: "Persatuan Sepakbola Seluruh Indonesia (PSSI)",
      tag: "FOOTBALL COACHING",
    },
  ];

  return (
    <section id="coach" className="py-14 sm:py-20 border-b border-border/40 bg-surface-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          kicker="Kredensial &amp; Profil Pelatih"
          title="Coach Zulfi"
          description="Youth Athletic Development &amp; Strength &amp; Conditioning Coach dengan lisensi kepelatihan nasional terverifikasi."
        />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Coach Bio & Philosophy Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 sm:p-7 rounded-2xl border border-border bg-surface-1 space-y-5 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 flex items-center justify-center font-display font-extrabold text-xl">
                  CZ
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Coach Zulfi
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Strength &amp; Conditioning &amp; Football Coach
                  </p>
                </div>
              </div>

              {/* Personal Statement */}
              <div className="relative pl-4 border-l-2 border-blue-600/40 italic text-secondary text-xs sm:text-sm leading-relaxed space-y-2.5">
                <p>
                  &ldquo;Saya percaya bahwa pengembangan atlet bukan hanya tentang membuat anak menjadi lebih kuat, lebih cepat, atau lebih eksplosif.
                </p>
                <p>
                  Sebelum mengejar performa, atlet perlu memiliki fondasi gerak dan kapasitas fisik yang sesuai dengan tahap perkembangannya.
                </p>
                <p>
                  Karena setiap atlet memiliki kebutuhan yang berbeda, saya menggunakan assessment, observasi, dan proses coaching untuk menentukan prioritas latihan yang sesuai.
                </p>
                <p className="not-italic font-bold text-foreground pt-1">
                  The goal is not simply to train harder. The goal is to develop better.&rdquo;
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-border/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                  Fokus Pengembangan di Lapangan:
                </span>
                <div className="grid sm:grid-cols-2 gap-2 text-xs text-secondary">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Fundamental Movement Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Progresi Beban Bertahap &amp; Aman</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Movement &amp; Landing Mechanics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Transparansi Perkembangan ke Ortu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Licenses & Certifications Column */}
          <div className="lg:col-span-5 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
              Certifications &amp; Coaching Licenses:
            </span>

            {credentials.map((c) => (
              <div
                key={c.title}
                className="p-4 sm:p-5 rounded-xl border border-border bg-surface-1 shadow-2xs space-y-1.5 transition-colors hover:border-blue-500/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {c.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Terverifikasi</span>
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug">
                  {c.title}
                </h4>
                <p className="text-xs text-muted">
                  {c.issuer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
