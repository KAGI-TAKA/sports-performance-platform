import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required = false,
  helperText,
  error,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-danger animate-in fade-in-50 duration-100">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-muted leading-tight">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
