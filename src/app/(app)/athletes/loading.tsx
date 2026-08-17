// Skeleton loading state — mostra-se enquanto o Server Component busca dados
import { Sk } from "@/components/ui/skeleton";

export default function AthletesLoading() {
  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div className="space-y-1.5">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-80" />
      </div>

      <Sk className="h-9 w-full rounded-xl" />

      <div className="space-y-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Sk key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
