"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Menu, X, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-2xs py-3"
          : "bg-background border-b border-border/40 py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-1.5 rounded-full bg-accent transition-transform group-hover:scale-y-110" />
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-foreground leading-none">
              COACH ZULFI
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted leading-tight mt-0.5">
              Athletic Performance
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-secondary">
          <a
            href="#philosophy"
            className="hover:text-foreground transition-colors"
          >
            Pendekatan
          </a>
          <a
            href="#process"
            className="hover:text-foreground transition-colors"
          >
            Alur Latihan
          </a>
          <a
            href="#programs"
            className="hover:text-foreground transition-colors"
          >
            Program
          </a>
          <a
            href="#coach"
            className="hover:text-foreground transition-colors"
          >
            Profil Pelatih
          </a>
          <a
            href="#pricing"
            className="hover:text-foreground transition-colors"
          >
            Biaya Sesi
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-secondary hover:text-foreground px-3 py-1.5 transition-colors"
          >
            Masuk Portal
          </Link>
          <a
            href={APP_CONFIG.whatsappInquiryTemplate()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="amber" size="sm" className="gap-1.5 shadow-2xs">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Hubungi Coach</span>
            </Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-secondary hover:text-foreground hover:bg-surface-2 md:hidden"
          aria-label="Buka menu navigasi"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface-1 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-secondary">
            <a
              href="#philosophy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface-2 hover:text-foreground"
            >
              Pendekatan Pembinaan
            </a>
            <a
              href="#process"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface-2 hover:text-foreground"
            >
              Alur Latihan (Assess → Reassess)
            </a>
            <a
              href="#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface-2 hover:text-foreground"
            >
              Jalur Program
            </a>
            <a
              href="#coach"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface-2 hover:text-foreground"
            >
              Profil &amp; Sertifikasi Pelatih
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface-2 hover:text-foreground"
            >
              Biaya &amp; Paket Latihan
            </a>
          </nav>
          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            <a
              href={APP_CONFIG.whatsappInquiryTemplate()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="amber" size="default" className="w-full justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Hubungi Coach Zulfi</span>
              </Button>
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="outline" size="default" className="w-full justify-center gap-2">
                <span>Masuk ke Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
