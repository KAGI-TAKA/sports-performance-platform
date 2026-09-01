import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-foreground border border-border",
        accent: "bg-accent-bg text-accent border border-accent/25",
        signature: "bg-signature-bg text-signature border border-signature/25",
        amber: "bg-accent-bg text-accent border border-accent/25",
        indigo: "bg-indigo-bg text-indigo border border-indigo/25",
        success: "bg-success-bg text-success border border-success/25",
        warning: "bg-warning-bg text-warning border border-warning/25",
        danger: "bg-danger-bg text-danger border border-danger/25",
        info: "bg-info-bg text-info border border-info/25",
        outline: "border border-border text-secondary bg-transparent",

        // Specialized Semantic Badges
        pb: "bg-accent-bg text-accent border border-accent/30 font-display font-extrabold tracking-normal normal-case",
        improving: "bg-success-bg text-success border border-success/30 font-semibold normal-case",
        stable: "bg-surface-2 text-secondary border border-border font-semibold normal-case",
        "program-youth": "bg-accent-bg text-accent border border-accent/25 font-bold tracking-tight normal-case",
        "program-multilateral": "bg-indigo-bg text-indigo border border-indigo/25 font-bold tracking-tight normal-case",
      },
      size: {
        default: "px-2.5 py-0.5 text-[11px]",
        sm: "px-2 py-0.2 text-[10px]",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
