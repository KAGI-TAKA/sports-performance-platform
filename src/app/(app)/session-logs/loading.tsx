import { Sk, SkCard } from "@/components/ui/skeleton";

// Skeleton loading state — mostra-se sementara Server Component mengambil data catatan sesi harian
export default function SessionLogsLoading() {
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

      {/* Grid of Session Log Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <SkCard>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Sk className="h-5 w-32 font-bold" />
              <Sk className="h-4 w-20" />
            </div>
            <Sk className="h-16 w-full rounded-lg" />
            <Sk className="h-12 w-full rounded-lg" />
            <div className="pt-2 border-t border-border">
              <Sk className="h-3 w-28" />
            </div>
          </div>
        </SkCard>
        <SkCard>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Sk className="h-5 w-32 font-bold" />
              <Sk className="h-4 w-20" />
            </div>
            <Sk className="h-16 w-full rounded-lg" />
            <Sk className="h-12 w-full rounded-lg" />
            <div className="pt-2 border-t border-border">
              <Sk className="h-3 w-28" />
            </div>
          </div>
        </SkCard>
        <SkCard>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Sk className="h-5 w-32 font-bold" />
              <Sk className="h-4 w-20" />
            </div>
            <Sk className="h-16 w-full rounded-lg" />
            <Sk className="h-12 w-full rounded-lg" />
            <div className="pt-2 border-t border-border">
              <Sk className="h-3 w-28" />
            </div>
          </div>
        </SkCard>
      </div>
    </div>
  );
}
