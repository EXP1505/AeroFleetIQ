"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AircraftSystem, Component } from "@/lib/types";

const STATUS_VARIANT = { healthy: "healthy", monitor: "monitor", critical: "critical" } as const;

export function ComponentTree({
  systems,
  selectedId,
  onSelect,
}: {
  systems: AircraftSystem[];
  selectedId: string | null;
  onSelect: (c: Component) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {systems.map((system) => (
        <div key={system.id}>
          <div className="text-xs font-medium text-muted uppercase tracking-wide mb-1.5">{system.name}</div>
          <div className="flex flex-col gap-1">
            {system.components.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors border",
                  selectedId === c.id
                    ? "border-accent/40 bg-accent-soft"
                    : "border-transparent hover:bg-surface-2"
                )}
              >
                <span className="truncate">{c.name}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="font-tabular text-xs text-muted">{c.healthScore}</span>
                  <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
