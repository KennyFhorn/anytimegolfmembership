import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-surface-raised text-foreground border border-border",
      brand: "bg-brand/15 text-brand",
      gold: "bg-gold/15 text-gold",
      success: "bg-emerald-500/15 text-emerald-400",
      warning: "bg-amber-500/15 text-amber-400",
      destructive: "bg-red-500/15 text-red-400",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
