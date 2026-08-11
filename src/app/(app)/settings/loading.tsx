// Skeleton loading state — mostra-se enquanto o Server Component busca dados
import { Sk, SkCard } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div className="space-y-1.5">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-80" />
      </div>

      <SkCard>
        <div className="space-y-4">
          <Sk className="h-6 w-36" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Sk className="h-3 w-20" />
              <Sk className="h-9 w-full" />
            </div>
            <div className="space-y-1.5">
              <Sk className="h-3 w-20" />
              <Sk className="h-9 w-full" />
            </div>
          </div>
        </div>
      </SkCard>

      <SkCard>
        <div className="space-y-4">
          <Sk className="h-6 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Sk key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </SkCard>
    </div>
  );
}
