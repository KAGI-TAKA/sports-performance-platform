import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** Halaman saat ini (1-based) */
  page: number;
  /** Total jumlah halaman */
  totalPages: number;
  /** URL path (mis. "/athletes" atau "/reports") */
  path: string;
  /**
   * Search params lain yang perlu dipertahankan di pagination links.
   * Mis. { q: "john", position: "PG" }
   */
  baseParams?: Record<string, string | undefined>;
}

function buildUrl(
  path: string,
  page: number,
  baseParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  if (baseParams) {
    for (const [k, v] of Object.entries(baseParams)) {
      if (v !== undefined && v !== "") params.set(k, v);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function Pagination({ page, totalPages, path, baseParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Hasilkan nomor halaman yang ditampilkan (selalu tampilkan 5 angka max)
  const range: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) range.push(i);
  } else {
    range.push(1);
    if (page > 3) range.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      range.push(i);
    }
    if (page < totalPages - 2) range.push("…");
    range.push(totalPages);
  }

  const btnBase =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md text-xs font-medium transition select-none";
  const btnInactive =
    "border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-1))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-2))]";
  const btnActive =
    "bg-[hsl(var(--accent))] text-white border border-transparent";
  const btnDisabled =
    "border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))] cursor-not-allowed pointer-events-none opacity-50";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 pt-4"
    >
      {/* Previous */}
      {page > 1 ? (
        <Link
          href={buildUrl(path, page - 1, baseParams)}
          className={`${btnBase} ${btnInactive} px-2`}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled} px-2`} aria-disabled>
          <ChevronLeft className="h-3.5 w-3.5" />
        </span>
      )}

      {/* Number pills */}
      {range.map((n, i) =>
        n === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-[hsl(var(--text-muted))]">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={buildUrl(path, n, baseParams)}
            className={`${btnBase} px-2.5 ${n === page ? btnActive : btnInactive}`}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </Link>
        )
      )}

      {/* Next */}
      {page < totalPages ? (
        <Link
          href={buildUrl(path, page + 1, baseParams)}
          className={`${btnBase} ${btnInactive} px-2`}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled} px-2`} aria-disabled>
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      )}
    </nav>
  );
}
