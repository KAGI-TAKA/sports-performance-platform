import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center" | "between";
  withDivider?: boolean;
}

export function SectionHeader({
  kicker,
  title,
  description,
  action,
  align = "between",
  withDivider = false,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        align === "between" && "sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        {kicker && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              {kicker}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-accent hidden sm:block shrink-0" />
          <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed pl-0 sm:pl-4">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-3 sm:mt-0 flex items-center gap-2 shrink-0">{action}</div>}
      {withDivider && (
        <div className="w-full athletic-divider-h mt-4 col-span-full" />
      )}
    </div>
  );
}

export function AthleticDivider({ className }: { className?: string }) {
  return <div className={cn("w-full athletic-divider-h my-6", className)} />;
}
