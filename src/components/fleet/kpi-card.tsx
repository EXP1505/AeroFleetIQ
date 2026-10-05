import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "default",
  sub,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  tone?: "default" | "healthy" | "monitor" | "critical";
  sub?: string;
}) {
  const toneClass = {
    default: "text-accent bg-accent-soft",
    healthy: "text-healthy bg-healthy/10",
    monitor: "text-monitor bg-monitor/10",
    critical: "text-critical bg-critical/10",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", toneClass)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted">{label}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold font-tabular">{value}</span>
            {suffix && <span className="text-sm text-muted">{suffix}</span>}
          </div>
          {sub && <div className="text-[11px] text-muted mt-0.5">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
