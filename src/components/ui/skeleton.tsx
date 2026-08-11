// Komponen skeleton reusable untuk loading state.
// Gunakan dengan className untuk menentukan ukuran.
// Contoh: <Sk className="h-4 w-32" /> atau <Sk className="h-8 w-full" />

export function Sk({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[hsl(var(--surface-2))] ${className}`}
    />
  );
}

export function SkCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-1))] p-5">
      {children}
    </div>
  );
}
