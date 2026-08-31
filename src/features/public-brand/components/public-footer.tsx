import Link from "next/link";
import { Zap } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Col */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Zap className="h-4 w-4 fill-white" />
              </div>
              <span className="font-display font-extrabold text-sm text-white tracking-wider uppercase">
                {APP_CONFIG.shortName}
              </span>
            </div>
            <p className="text-[11.5px] text-slate-400 max-w-sm leading-relaxed">
              Pelayanan pembinaan performa fisik &amp; kondisioning atletik berbasis *sport science* untuk atlet muda dan kompetitif.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
            <a href="#about" className="hover:text-white transition">
              Tentang Coach
            </a>
            <a href="#programs" className="hover:text-white transition">
              Paket Program
            </a>
            <a href="#methodology" className="hover:text-white transition">
              Metodologi
            </a>
            <a href="#testimonials" className="hover:text-white transition">
              Testimoni
            </a>
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition">
              Portal Klien
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href={APP_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-pink-400 hover:border-pink-500/40 transition"
              aria-label="Instagram Coach Zulfi"
            >
              <InstagramIcon className="h-4 w-4" />
              <span className="text-xs font-semibold">{APP_CONFIG.instagram}</span>
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
