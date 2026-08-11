"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke konsol saat development; ganti dengan error tracking
    // (mis. Sentry) saat production.
    console.error("[App Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--danger-bg))]">
          <AlertTriangle className="h-8 w-8 text-[hsl(var(--danger))]" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">
            Terjadi Kesalahan
          </h1>
          <p className="text-sm text-[hsl(var(--text-muted))]">
            Halaman ini tidak dapat dimuat karena terjadi error yang tidak terduga.
          </p>
        </div>

        {/* Error detail (dev only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="rounded-lg border border-[hsl(var(--danger)/0.3)] bg-[hsl(var(--danger-bg))] px-4 py-3 text-left">
            <p className="text-xs font-mono text-[hsl(var(--danger))] break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-1 text-[10px] text-[hsl(var(--text-muted))]">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            id="error-retry-btn"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-1))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--surface-2))]"
          >
            Kembali ke Dashboard
          </a>
        </div>

        {/* Hint */}
        <p className="text-xs text-[hsl(var(--text-muted))]">
          Jika masalah berlanjut, hubungi administrator sistem.
        </p>
      </div>
    </div>
  );
}
