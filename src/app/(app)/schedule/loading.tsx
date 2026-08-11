import { Sk, SkCard } from "@/components/ui/skeleton";

// Skeleton loading state — mostra-se sementara Server Component mengambil data jadwal
export default function ScheduleLoading() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Sk className="h-7 w-56" />
          <Sk className="h-4 w-80" />
        </div>
        <Sk className="h-9 w-36 rounded-lg" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex items-center gap-3">
        <Sk className="h-9 w-32 rounded-lg" />
        <Sk className="h-9 w-44 rounded-lg" />
        <Sk className="h-9 w-44 rounded-lg" />
      </div>

      {/* Schedule Agenda Cards Skeleton */}
      <div className="space-y-4">
        <Sk className="h-6 w-48" />
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <SkCard>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Sk className="h-5 w-40" />
                <Sk className="h-5 w-20 rounded-full" />
              </div>
              <Sk className="h-4 w-32" />
              <Sk className="h-16 w-full rounded-lg" />
              <Sk className="h-7 w-full rounded" />
            </div>
          </SkCard>
          <SkCard>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Sk className="h-5 w-40" />
                <Sk className="h-5 w-20 rounded-full" />
              </div>
              <Sk className="h-4 w-32" />
              <Sk className="h-16 w-full rounded-lg" />
              <Sk className="h-7 w-full rounded" />
            </div>
          </SkCard>
          <SkCard>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Sk className="h-5 w-40" />
                <Sk className="h-5 w-20 rounded-full" />
              </div>
              <Sk className="h-4 w-32" />
              <Sk className="h-16 w-full rounded-lg" />
              <Sk className="h-7 w-full rounded" />
            </div>
          </SkCard>
        </div>
      </div>
    </div>
  );
}
