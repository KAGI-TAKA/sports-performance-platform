import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-1/60 p-8 text-center animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-muted mb-3 border border-border/50">
        <Icon className="h-5 w-5 text-secondary" />
      </div>
      <h4 className="font-display text-sm font-bold text-foreground tracking-tight">
        {title}
      </h4>
      {description && (
        <p className="mt-1 text-xs text-muted max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
