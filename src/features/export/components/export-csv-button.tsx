"use client";

import { Download } from "lucide-react";

interface ExportCSVButtonProps {
  endpoint: string;
  label?: string;
  className?: string;
}

export function ExportCSVButton({
  endpoint,
  label = "Export CSV",
  className = "",
}: ExportCSVButtonProps) {
  return (
    <a
      href={endpoint}
      download
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-3 transition ${className}`}
      title="Unduh data berformat CSV / Excel"
    >
      <Download className="h-3.5 w-3.5 text-accent" />
      {label}
    </a>
  );
}
