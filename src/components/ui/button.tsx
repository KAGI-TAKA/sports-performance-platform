import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-semibold whitespace-nowrap transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/95 shadow-2xs",
        primary:
          "bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/95 shadow-2xs",
        amber:
          "bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/95 shadow-2xs font-bold tracking-tight",
        signature:
          "bg-signature text-accent-foreground hover:bg-signature/90 active:bg-signature/95 shadow-2xs font-bold tracking-tight",
        secondary:
          "bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-border-strong active:bg-surface-3",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-2 hover:border-border-strong active:bg-surface-3",
        ghost:
          "bg-transparent text-foreground hover:bg-surface-2 active:bg-surface-3",
        destructive:
          "bg-danger-bg text-danger border border-danger/30 hover:bg-danger hover:text-white active:bg-danger/90",
        link:
          "text-accent underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        default: "h-9 gap-2 px-3.5 text-xs sm:text-sm",
        xs: "h-6 gap-1 rounded-sm px-2 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 rounded-lg px-5 text-sm font-bold [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9 rounded-lg",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-lg [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <Loader2 className="animate-spin mr-1.5" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
