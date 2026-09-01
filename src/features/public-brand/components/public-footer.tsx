import Link from "next/link";
import { MessageCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="bg-[#071326] text-neutral-300 text-xs border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-18 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-display font-black text-xs">
                CZ
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-base text-white tracking-tight">
                  COACH ZULFI
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-blue-400">
                  Athletic Performance
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Strength &amp; Conditioning • Youth Athletic Development. Pembinaan fisik atlet muda dan anak berbasis observasi kualitas gerak dan data sport science.
            </p>
            <div className="pt-1 text-xs text-neutral-400 italic font-mono">
              &ldquo;Every Athlete Has Different Needs. Every Development Has Its Own Process.&rdquo;
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono font-bold text-xs uppercase tracking-widest text-white block">
              Navigasi
            </span>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li>
                <a href="#philosophy" className="hover:text-white transition-colors">
                  Filosofi
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-white transition-colors">
                  Proses
                </a>
              </li>
              <li>
                <a href="#programs" className="hover:text-white transition-colors">
                  Program
                </a>
              </li>
              <li>
                <a href="#coach" className="hover:text-white transition-colors">
                  Pelatih
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Biaya &amp; Sesi
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Direct Contact */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-mono font-bold text-xs uppercase tracking-widest text-white block">
              Akses &amp; Konsultasi
            </span>
            <div className="space-y-2 text-xs">
              <p className="text-neutral-400 leading-relaxed">
                Untuk klien aktif (Atlet &amp; Orang Tua), silakan akses portal pemantauan perkembangan digital Anda:
              </p>
              <div className="pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-bold text-blue-400 hover:text-blue-300 transition text-xs"
                >
                  <span>Masuk ke Client Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-neutral-200 hover:text-white transition"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp Coach Zulfi</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
          <div>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>Structured Youth Athletic Development</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
