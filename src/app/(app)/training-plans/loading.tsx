import { Sk, SkCard } from "@/components/ui/skeleton";

// Skeleton loading state — mostra-se sementara Server Component mengambil data program latihan
export default function TrainingPlansLoading() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Sk className="h-7 w-64" />
          <Sk className="h-4 w-96" />
        </div>
        <Sk className="h-9 w-40 rounded-lg" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sk className="h-8 w-28 rounded-lg" />
        <Sk className="h-8 w-44 rounded-lg" />
        <Sk className="h-8 w-32 rounded-lg" />
      </div>

      {/* Grid of Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <SkCard>
          <div className="space-y-3">
            <Sk className="h-5 w-32 rounded-full" />
            <Sk className="h-6 w-48" />
            <Sk className="h-10 w-full rounded" />
            <div className="flex justify-between pt-3 border-t border-border">
              <Sk className="h-4 w-24" />
              <Sk className="h-4 w-24" />
            </div>
          </div>
        </SkCard>
        <SkCard>
          <div className="space-y-3">
            <Sk className="h-5 w-32 rounded-full" />
            <Sk className="h-6 w-48" />
            <Sk className="h-10 w-full rounded" />
            <div className="flex justify-between pt-3 border-t border-border">
              <Sk className="h-4 w-24" />
              <Sk className="h-4 w-24" />
            </div>
          </div>
        </SkCard>
        <SkCard>
          <div className="space-y-3">
            <Sk className="h-5 w-32 rounded-full" />
            <Sk className="h-6 w-48" />
            <Sk className="h-10 w-full rounded" />
            <div className="flex justify-between pt-3 border-t border-border">
              <Sk className="h-4 w-24" />
              <Sk className="h-4 w-24" />
            </div>
          </div>
        </SkCard>
      </div>
    </div>
  );
}
