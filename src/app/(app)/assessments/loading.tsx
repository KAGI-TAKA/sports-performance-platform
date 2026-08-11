// Skeleton loading state — mostra-se enquanto o Server Component busca dados
import { Sk, SkCard } from "@/components/ui/skeleton";

export default function AssessmentsLoading() {
  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="space-y-1.5">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-80" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Sk key={i} className="h-9 w-28" />
        ))}
      </div>

      <SkCard>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-[hsl(var(--border-color))] last:border-0">
              <div className="flex items-center gap-3">
                <Sk className="h-8 w-8 rounded-full" />
                <Sk className="h-4 w-32" />
              </div>
              <Sk className="h-4 w-24" />
              <Sk className="h-6 w-10" />
              <Sk className="h-4 w-16" />
              <Sk className="h-7 w-14" />
            </div>
          ))}
        </div>
      </SkCard>
    </div>
  );
}
