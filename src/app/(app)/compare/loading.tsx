// Skeleton loading state — mostra-se enquanto o Server Component busca dados
import { Sk, SkCard } from "@/components/ui/skeleton";

export default function CompareLoading() {
  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="space-y-1.5">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SkCard>
          <Sk className="h-32 w-full" />
        </SkCard>
        <SkCard>
          <Sk className="h-32 w-full" />
        </SkCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SkCard>
          <Sk className="h-64 w-full" />
        </SkCard>
        <SkCard>
          <Sk className="h-64 w-full" />
        </SkCard>
      </div>

      <SkCard>
        <Sk className="h-48 w-full" />
      </SkCard>
    </div>
  );
}
