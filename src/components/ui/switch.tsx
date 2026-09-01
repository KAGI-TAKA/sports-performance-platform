import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, checked, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex items-center justify-between gap-3">
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label
                htmlFor={inputId}
                className="text-xs font-semibold text-foreground select-none cursor-pointer leading-none block"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-[11px] text-muted leading-tight">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={checked}
            className={cn(
              "peer h-5 w-9 shrink-0 appearance-none rounded-full border border-border bg-surface-3 transition-colors cursor-pointer",
              "checked:border-accent checked:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          />
          <span
            className={cn(
              "pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-transform",
              "peer-checked:translate-x-4"
            )}
          />
        </div>
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
