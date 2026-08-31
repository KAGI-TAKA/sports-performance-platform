import Link from "next/link";
import { Zap, MessageCircle, User, ArrowUpRight } from "lucide-react";
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

export function PublicNavbar() {
  return (
    <>
      {/* ── TOP ANNOUNCEMENT BAR ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-2 text-center text-xs font-medium text-indigo-200 border-b border-indigo-900/40">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="font-semibold text-white">
            ⚡ Official Coaching &amp; Physical Conditioning by <strong>Coach Zulfi</strong>
          </span>
          <span className="text-indigo-400">·</span>
          <a
            href={APP_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline text-indigo-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <InstagramIcon className="h-3 w-3" />
            <span>{APP_CONFIG.instagram}</span>
          </a>
        </div>
      </div>

      {/* ── MAIN NAVBAR ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform shrink-0">
              <Zap className="h-5 w-5 fill-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm sm:text-base tracking-wider text-white uppercase block leading-tight">
                {APP_CONFIG.shortName}
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wide block leading-none">
                Athletic Performance Specialist
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#about" className="hover:text-indigo-400 transition-colors">
              Tentang Coach
            </a>
            <a href="#programs" className="hover:text-indigo-400 transition-colors">
              Paket Program
            </a>
            <a href="#methodology" className="hover:text-indigo-400 transition-colors">
              Metodologi
            </a>
            <a href="#components" className="hover:text-indigo-400 transition-colors">
              7 Pilar Tes
            </a>
            <a href="#testimonials" className="hover:text-indigo-400 transition-colors">
              Testimoni
            </a>
            <a href="#faq" className="hover:text-indigo-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={APP_CONFIG.whatsappInquiryTemplate()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 px-3.5 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Konsultasi WA</span>
            </a>

            <Link
              href="/login"
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 sm:px-4 py-2 rounded-lg shadow-md shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40 flex items-center gap-1.5"
            >
              <User className="h-3.5 w-3.5" />
              <span>Portal Klien</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
