"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Menu, X, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#0A101D]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg py-3"
          : "bg-[#0A101D]/75 backdrop-blur-md border-b border-slate-800/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-display font-black text-sm tracking-tighter shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
            CZ
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-sm sm:text-base tracking-tight text-white leading-none">
              COACH ZULFI
            </span>
            <span className="text-[9.5px] font-mono font-bold tracking-widest uppercase text-blue-400 leading-tight mt-0.5">
              Athletic Performance
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300 tracking-wide">
          <a
            href="#philosophy"
            className="hover:text-white transition-colors"
          >
            Filosofi
          </a>
          <a
            href="#process"
            className="hover:text-white transition-colors"
          >
            Proses
          </a>
          <a
            href="#programs"
            className="hover:text-white transition-colors"
          >
            Program
          </a>
          <a
            href="#coach"
            className="hover:text-white transition-colors"
          >
            Pelatih
          </a>
          <a
            href="#pricing"
            className="hover:text-white transition-colors"
          >
            Biaya &amp; Sesi
          </a>
          <a
            href="#contact"
            className="hover:text-white transition-colors"
          >
            Kontak
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-800/60 transition"
          >
            Portal Login
          </Link>
          <a
            href={APP_CONFIG.whatsappInquiryTemplate()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5 text-white" />
              <span>Konsultasi WA</span>
            </button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden transition"
          aria-label="Buka menu navigasi"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#0A101D]/98 backdrop-blur-2xl px-6 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200 text-slate-200">
          <nav className="flex flex-col space-y-2 text-sm font-semibold">
            <a
              href="#philosophy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white"
            >
              Filosofi
            </a>
            <a
              href="#process"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white"
            >
              Proses
            </a>
            <a
              href="#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white"
            >
              Program
            </a>
            <a
              href="#coach"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white"
            >
              Pelatih
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white"
            >
              Biaya &amp; Sesi
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white"
            >
              Kontak
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-800 transition"
            >
              Portal Login
            </Link>
            <a
              href={APP_CONFIG.whatsappInquiryTemplate()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-md transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Konsultasi WA</span>
              </button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
