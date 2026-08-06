import Link from "next/link";

const componentColors = [
  "#7F77DD",
  "#378ADD",
  "#FF6B35",
  "#1D9E75",
  "#D4537E",
  "#D85A30",
  "#639922",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 28 28">
            <polygon
              points="14,2 24,8.5 24,19.5 14,26 4,19.5 4,8.5"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="1.6"
            />
            <polygon
              points="14,8 19,11 19,17 14,20 9,17 9,11"
              fill="hsl(var(--accent))"
              opacity="0.85"
            />
          </svg>
          <span className="font-display text-base font-semibold text-foreground">
            Kinetiq
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-secondary hover:text-foreground"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Daftar gratis
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-16 text-center">
        <h1 className="font-display text-4xl font-semibold leading-tight text-foreground">
          Measure. Analyze. Improve.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-secondary">
          Ganti spreadsheet Excel pelatih basket & akademi olahraga dengan
          platform assessment fisik atlet yang menghitung, membandingkan ke
          benchmark, dan memberi insight otomatis — dalam hitungan menit, bukan
          jam.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Mulai gratis
          </Link>
          <Link
            href="/login"
            className="rounded-sm border border-border-strong px-5 py-2.5 text-sm font-medium text-secondary hover:text-foreground"
          >
            Sudah punya akun
          </Link>
        </div>

        <div className="mt-16 flex items-center justify-center gap-1.5">
          {componentColors.map((c) => (
            <div
              key={c}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          7 komponen fisik, satu radar chart, satu insight otomatis.
        </p>
      </main>
    </div>
  );
}
