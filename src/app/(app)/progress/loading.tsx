// Skeleton loading state — mostra-se enquanto o Server Component busca dados
import { Sk, SkCard } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <div className="space-y-1.5">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-[260px_1fr] gap-4">
        <SkCard>
          <div className="space-y-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Sk key={i} className="h-10 w-full" />
            ))}
          </div>
        </SkCard>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkCard key={i}>
                <div className="space-y-2">
                  <Sk className="h-3 w-20" />
                  <Sk className="h-8 w-24" />
                </div>
              </SkCard>
            ))}
          </div>

          <SkCard>
            <Sk className="h-72 w-full" />
          </SkCard>

          <SkCard>
            <Sk className="h-40 w-full" />
          </SkCard>
        </div>
      </div>
    </div>
  );
}
