"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, FileText } from "lucide-react";

export function ProgressComparisonToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isCompareMode = searchParams.get("compare") === "true";

  function handleToggle(compare: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (compare) {
      params.set("compare", "true");
    } else {
      params.delete("compare");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center rounded-lg bg-surface-2 p-1 border border-border text-xs">
      <button
        onClick={() => handleToggle(false)}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition ${
          !isCompareMode
            ? "bg-surface-1 text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <FileText className="h-3.5 w-3.5" />
        Snapshot Laporan
      </button>
      <button
        onClick={() => handleToggle(true)}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition ${
          isCompareMode
            ? "bg-accent text-white shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <TrendingUp className="h-3.5 w-3.5" />
        Perbandingan Progress
      </button>
    </div>
  );
}
