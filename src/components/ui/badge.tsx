import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium gap-1",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-foreground",
        accent: "border-accent/30 bg-accent-soft text-accent",
        healthy: "border-healthy/30 bg-healthy/10 text-healthy",
        monitor: "border-monitor/30 bg-monitor/10 text-monitor",
        critical: "border-critical/30 bg-critical/10 text-critical",
        muted: "border-border bg-transparent text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export function statusBadgeVariant(status: "healthy" | "monitor" | "critical") {
  return status;
}
