"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Recommendation } from "@/lib/types";

const PRIORITY_VARIANT: Record<Recommendation["priority"], "critical" | "monitor" | "default" | "muted"> = {
  critical: "critical",
  high: "monitor",
  medium: "default",
  low: "muted",
};

export function PriorityList({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="divide-y divide-border">
      {recommendations.slice(0, 8).map((rec) => (
        <Link
          key={rec.id}
          href={`/aircraft/${rec.tail}`}
          className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-surface-2/50 rounded-md px-2 -mx-2 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Badge variant={PRIORITY_VARIANT[rec.priority]} className="shrink-0 capitalize">
              {rec.priority}
            </Badge>
            <div className="min-w-0">
              <div className="font-tabular text-xs font-medium">{rec.tail}</div>
              <div className="text-xs text-muted truncate">{rec.componentName} · {rec.action}</div>
            </div>
          </div>
          <span className="text-[11px] text-muted font-tabular shrink-0">
            {Math.round(rec.confidence * 100)}% conf.
          </span>
        </Link>
      ))}
    </div>
  );
}
