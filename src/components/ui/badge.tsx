import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 select-none",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-foreground border border-border",
        accent: "bg-accent-bg text-accent border border-accent/20",
        signature: "bg-signature-bg text-signature border border-signature/20",
        success: "bg-success-bg text-success border border-success/20",
        warning: "bg-warning-bg text-warning border border-warning/20",
        danger: "bg-danger-bg text-danger border border-danger/20",
        outline: "border border-border text-secondary bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
