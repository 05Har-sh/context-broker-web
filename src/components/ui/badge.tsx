import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 text-xs font-normal transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-container text-on-tertiary-fixed",
        critical: "bg-[#ffe2dd] text-[#c02e35]",
        high: "bg-[#fadec9] text-[#cb5d2a]",
        medium: "bg-[#fdecc8] text-[#d9730d]",
        low: "bg-[#dbeddb] text-[#448361]",
        success: "bg-green-600 text-white",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
        error: "bg-error text-on-error",
        resolved: "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
        muted: "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500",
        secondary: "bg-secondary/10 text-secondary",
        outline: "border border-outline-variant/20 text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
