// Skeleton loading state — mostra-se enquanto o Server Component busca dados
import { Sk, SkCard } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="space-y-1.5">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-80" />
      </div>

      <Sk className="h-9 w-full rounded-xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkCard key={i}>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Sk className="h-5 w-40" />
                <Sk className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Sk className="h-6 w-12" />
                <Sk className="h-8 w-24" />
              </div>
            </div>
          </SkCard>
        ))}
      </div>
    </div>
  );
}
