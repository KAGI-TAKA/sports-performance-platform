import { SectionHeader } from "@/components/ui/section-header";
import { Award, ShieldCheck, User, CheckCircle2 } from "lucide-react";

export function CoachProfileSection() {
  const credentials = [
    {
      level: "01",
      title: "National Level 2 Strength & Conditioning Coach",
      issuer: "Lembaga Akreditasi Nasional Keolahragaan (LANKOR) – ICCA",
      tag: "S&C ADVANCED",
    },
    {
      level: "02",
      title: "National Level 1 Strength & Conditioning Coach",
      issuer: "Lembaga Akreditasi Nasional Keolahragaan (LANKOR) – ICCA",
      tag: "S&C FOUNDATION",
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
          kicker="Kredensial &amp; Profil"
          title="Mengenal Coach Zulfi"
          description="Pelatih fisik spesialis Strength & Conditioning dan pengembangan atlet muda dengan lisensi kepelatihan nasional resmi."
        />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Coach Bio Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="p-6 rounded-2xl border border-border bg-surface-1 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-accent-bg text-accent border border-accent/20 flex items-center justify-center font-display font-extrabold text-lg">
                  CZ
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Coach Zulfi
                  </h3>
                  <p className="text-xs font-semibold text-accent">
                    Strength &amp; Conditioning &amp; Football Coach
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                Coach Zulfi berfokus pada pembinaan fisik atletik usia muda (*Youth Athletic Development*) dan persiapan fisik spesifik olahraga (*Sports Conditioning*). Pendekatan kepelatihannya menitikberatkan pada penguasaan mekanika gerak yang benar, pencegahan cedera dini, serta progresi beban yang adaptif sesuai kapasitas biologis atlet.
              </p>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground block">
                  Prinsip Kerja di Lapangan:
                </span>
                <div className="grid sm:grid-cols-2 gap-2 text-xs text-secondary">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span>Koreksi teknik gerak detail</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span>Beban bertahap &amp; aman</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span>Evaluasi data objektif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span>Komunikasi terbuka ke ortu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Licenses & Certifications Column */}
          <div className="lg:col-span-6 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
              Lisensi &amp; Sertifikasi Resmi:
            </span>

            {credentials.map((c) => (
              <div
                key={c.title}
                className="p-4 sm:p-5 rounded-xl border border-border bg-surface-1 shadow-2xs space-y-1.5 transition-colors hover:border-border-strong"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    {c.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    <span>Terverifikasi</span>
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug">
                  {c.title}
                </h4>
                <p className="text-xs text-muted">
                  Penerbit: {c.issuer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
