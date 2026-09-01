import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-2",
        className
      )}
      {...props}
    />
  );
}

// Backward compatibility helper
export function Sk({ className = "" }: { className?: string }) {
  return <Skeleton className={className} />;
}

export function SkCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
      {children}
    </div>
  );
}

export function SkeletonMetricCard() {
  return (
    <SkCard>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-3 w-36" />
    </SkCard>
  );
}
