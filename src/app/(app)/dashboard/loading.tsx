// Skeleton loading state — mostra-se enquanto o Server Component busca dados
import { Sk, SkCard } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div className="space-y-1.5">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkCard key={i}>
            <div className="space-y-2">
              <Sk className="h-3 w-20" />
              <Sk className="h-9 w-24" />
              <Sk className="h-3 w-32" />
            </div>
          </SkCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkCard>
          <div className="space-y-4">
            <Sk className="h-5 w-36" />
            <Sk className="h-64 w-full" />
          </div>
        </SkCard>
        <SkCard>
          <div className="space-y-4">
            <Sk className="h-5 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Sk key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>
        </SkCard>
      </div>
    </div>
  );
}
