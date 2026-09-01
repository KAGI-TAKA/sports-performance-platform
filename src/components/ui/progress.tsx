import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "accent" | "signature" | "amber" | "indigo" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantBg = {
  accent: "bg-accent",
  signature: "bg-signature",
  amber: "bg-accent",
  indigo: "bg-indigo",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const sizeHeight = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "accent", size = "md", ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-surface-2",
          sizeHeight[size],
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 transition-all duration-300 rounded-full", variantBg[variant])}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
