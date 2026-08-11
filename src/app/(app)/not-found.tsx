import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--surface-2))]">
          <SearchX className="h-8 w-8 text-[hsl(var(--text-muted))]" />
        </div>

        <div className="space-y-2">
          <p className="font-mono text-5xl font-bold text-[hsl(var(--accent))]">404</p>
          <h1 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-[hsl(var(--text-muted))]">
            Halaman yang kamu cari tidak ada atau sudah dipindahkan.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
