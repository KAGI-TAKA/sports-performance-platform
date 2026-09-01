import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="bg-surface-1 text-secondary text-xs border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-1.5 rounded-full bg-accent" />
              <span className="font-display font-bold text-base text-foreground tracking-tight">
                COACH ZULFI
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              Strength &amp; Conditioning • Football Coach. Pembinaan fisik atlet muda dan spesialisasi performa olahraga berbasis data sport science.
            </p>
            <div className="pt-2 text-[11px] text-muted italic">
              &ldquo;Every Athlete Has Different Needs. Every Development Has Its Own Process.&rdquo;
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-2.5">
            <span className="font-display font-bold text-xs uppercase tracking-wider text-foreground block">
              Navigasi Halaman
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#philosophy" className="hover:text-foreground transition-colors">
                  Pendekatan Pembinaan
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-foreground transition-colors">
                  Alur Latihan (6 Tahap)
                </a>
              </li>
              <li>
                <a href="#programs" className="hover:text-foreground transition-colors">
                  Jalur Program Atletik
                </a>
              </li>
              <li>
                <a href="#coach" className="hover:text-foreground transition-colors">
                  Profil &amp; Lisensi Pelatih
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Biaya Sesi &amp; Paket
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Direct Contact */}
          <div className="md:col-span-4 space-y-3">
            <span className="font-display font-bold text-xs uppercase tracking-wider text-foreground block">
              Akses &amp; Kontak
            </span>
            <div className="space-y-2 text-xs">
              <p className="text-muted leading-relaxed">
                Untuk klien aktif (Atlet &amp; Orang Tua), silakan akses portal pemantauan perkembangan digital Anda:
              </p>
              <div className="pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline text-xs"
                >
                  <span>Masuk ke Client Portal →</span>
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5 text-accent" />
                <span>Konsultasi WhatsApp Coach Zulfi</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted">
          <div>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span>Structured Youth Athletic Development</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
