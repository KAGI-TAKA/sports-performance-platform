"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { useHelp } from "../context";
import { cn } from "@/lib/utils";

interface HelpTriggerButtonProps {
  className?: string;
}

export function HelpTriggerButton({ className }: HelpTriggerButtonProps) {
  const { toggleHelp, isOpen } = useHelp();

  return (
    <button
      type="button"
      onClick={toggleHelp}
      aria-label="Bantuan Dokumentasi Halaman"
      aria-expanded={isOpen}
      title="Bantuan Halaman (Panduan & Cara Penggunaan)"
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all select-none focus:outline-none focus:ring-1 focus:ring-accent",
        isOpen
          ? "border-accent bg-accent/15 text-accent shadow-2xs"
          : "border-border bg-surface-2/70 text-muted hover:border-accent/40 hover:bg-surface-2 hover:text-foreground",
        className
      )}
    >
      <HelpCircle className="h-4 w-4 shrink-0 transition-transform active:scale-95" />
      <span className="sr-only">Bantuan</span>
    </button>
  );
}
