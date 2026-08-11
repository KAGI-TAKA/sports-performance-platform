// Skeleton loading state — mostra-se enquanto o Server Component busca dados
import { Sk, SkCard } from "@/components/ui/skeleton";

export default function BenchmarksLoading() {
  return (
    <div className="p-6 space-y-4 max-w-[1200px]">
      <div className="space-y-1.5">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-80" />
      </div>

      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Sk key={i} className="h-6 w-28" />
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkCard key={i}>
            <div className="space-y-4">
              <Sk className="h-8 w-40" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Sk key={j} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </SkCard>
        ))}
      </div>
    </div>
  );
}
