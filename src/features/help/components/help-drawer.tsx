"use client";

import React, { useEffect, useRef } from "react";
import { useHelp } from "../context";
import {
  X,
  BookOpen,
  Lightbulb,
  Info,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HelpDrawer() {
  const { isOpen, closeHelp, currentArticle, role } = useHelp();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeHelp();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeHelp]);

  if (!isOpen) return null;

  // Filter role note specific to current user role if available
  const userRoleNote = currentArticle.roleNotes?.find(
    (rn) => rn.role.toLowerCase() === (role || "").toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={closeHelp}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-drawer-title"
        className="relative z-50 flex h-full w-full sm:w-[460px] max-w-[95vw] flex-col border-l border-border bg-surface-1 shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-surface-2/60 px-5 py-3.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="flex items-center gap-1.5 font-medium text-secondary">
              <BookOpen className="h-3.5 w-3.5 text-accent" />
              Bantuan
            </span>
            <ChevronRight className="h-3 w-3 text-muted/60" />
            <span className="truncate max-w-[180px] sm:max-w-[240px] font-semibold text-foreground">
              {currentArticle.title}
            </span>
          </div>

          <button
            type="button"
            onClick={closeHelp}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-3 hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Tutup Bantuan"
            title="Tutup (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 select-text text-sm">
          {/* Article Header & Badge */}
          <div className="space-y-2 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {currentArticle.badge && (
                <Badge variant="accent" className="font-mono text-[10px] py-0.5">
                  {currentArticle.badge}
                </Badge>
              )}
            </div>
            <h2
              id="help-drawer-title"
              className="font-display text-lg font-bold text-foreground tracking-tight leading-snug"
            >
              {currentArticle.title}
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              {currentArticle.subtitle}
            </p>
          </div>

          {/* Quick Description Box */}
          <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-3.5 text-xs text-secondary leading-relaxed">
            {currentArticle.description}
          </div>

          {/* Role-Specific Note Banner (if applicable) */}
          {userRoleNote && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Catatan Hak Akses ({userRoleNote.role.toUpperCase()})
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {userRoleNote.note}
              </p>
            </div>
          )}

          {/* Structured Sections */}
          {currentArticle.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                {section.title}
              </h3>

              {section.description && (
                <p className="text-xs text-muted leading-relaxed">
                  {section.description}
                </p>
              )}

              {/* Numbered Steps */}
              {section.steps && section.steps.length > 0 && (
                <div className="space-y-2.5">
                  {section.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2.5 text-xs">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-2xs mt-0.5">
                        {sIdx + 1}
                      </span>
                      <p className="text-secondary leading-relaxed pt-0.5 flex-1">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Bullet Points */}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2 text-xs">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 text-secondary leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Callout box inside section */}
              {section.callout && (
                <div
                  className={`rounded-xl border p-3 text-xs leading-relaxed flex items-start gap-2.5 ${
                    section.callout.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : section.callout.type === "tip"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : "border-border bg-surface-2 text-muted"
                  }`}
                >
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {section.callout.title && (
                      <span className="font-semibold text-foreground block">
                        {section.callout.title}
                      </span>
                    )}
                    <span className="text-secondary">{section.callout.message}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Tips Section */}
          {currentArticle.tips && currentArticle.tips.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                Tips &amp; Pintasan
              </div>
              <ul className="space-y-1.5 text-xs text-muted">
                {currentArticle.tips.map((tip, tIdx) => (
                  <li key={tIdx} className="leading-relaxed">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border/80 bg-surface-2/40 px-5 py-3 flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted">
            Tekan <kbd className="font-mono bg-surface-3 px-1 py-0.5 rounded border border-border text-[9px]">Esc</kbd> untuk menutup
          </span>
          <Button
            variant="outline"
            size="xs"
            onClick={closeHelp}
            className="text-xs font-semibold"
          >
            Tutup Bantuan
          </Button>
        </div>
      </div>
    </div>
  );
}
