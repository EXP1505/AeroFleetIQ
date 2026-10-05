"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Gauge, Package, Users, CalendarClock, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AvailabilityChart } from "@/components/fleet/availability-chart";
import { fetchDecisionOptions, fetchAvailabilityForecast } from "@/lib/api";
import type { AvailabilityPoint, DecisionOption } from "@/lib/types";

const CONSTRAINTS = [
  { icon: ListChecks, label: "Aircraft Priority", value: "AF-107 — Critical, high-criticality propulsion component" },
  { icon: Gauge, label: "RUL", value: "38 cycles (±9) on gearbox bearing" },
  { icon: Package, label: "Spare Availability", value: "OEM Depot only · 21-day lead time" },
  { icon: Users, label: "Repair Capacity", value: "1 propulsion technician team available" },
  { icon: CalendarClock, label: "Maintenance Window", value: "Opens in 12 days, 2-day duration" },
];

const COST_VARIANT = { low: "healthy", medium: "monitor", high: "critical" } as const;

export default function DecisionEnginePage() {
  const [options, setOptions] = React.useState<DecisionOption[]>([]);
  const [baseForecast, setBaseForecast] = React.useState<AvailabilityPoint[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([fetchDecisionOptions(), fetchAvailabilityForecast()]).then(([opts, forecast]) => {
      setOptions(opts);
      setBaseForecast(forecast);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    function onDemoAction(e: Event) {
      const detail = (e as CustomEvent).detail as { action: string };
      if (detail.action === "select-option") {
        setSelectedId("expedite-spare");
      }
    }
    window.addEventListener("demo:action", onDemoAction);
    return () => window.removeEventListener("demo:action", onDemoAction);
  }, []);

  if (loading) return <div className="text-sm text-muted">Loading decision options…</div>;

  const selected = options.find((o) => o.id === selectedId) ?? null;
  const chartData = selected ? selected.availabilityImpact : baseForecast;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Fleet Decision Engine</h1>
        <p className="text-sm text-muted">What-if comparison for AF-107&apos;s degrading gearbox bearing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Constraints Used</CardTitle>
          <CardDescription>Inputs the decision engine weighs for this scenario</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CONSTRAINTS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="flex flex-col gap-1.5 rounded-md border border-border bg-surface-2 p-3">
                <Icon className="size-4 text-accent" />
                <span className="text-xs font-medium">{c.label}</span>
                <span className="text-[11px] text-muted leading-snug">{c.value}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div id="demo-decision-options" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const active = selectedId === option.id;
          return (
            <button
              key={option.id}
              id={`demo-option-${option.id}`}
              onClick={() => setSelectedId(active ? null : option.id)}
              className={cn(
                "text-left rounded-lg border p-4 transition-colors flex flex-col gap-2.5",
                active ? "border-accent bg-accent-soft" : "border-border bg-surface hover:bg-surface-2"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{option.label}</span>
                <Badge variant={COST_VARIANT[option.cost]} className="capitalize">{option.cost} cost</Badge>
              </div>
              <p className="text-xs text-muted leading-relaxed">{option.description}</p>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted">Risk delta</span>
                <span className={cn("font-tabular font-medium", option.riskDelta < 0 ? "text-healthy" : "text-critical")}>
                  {option.riskDelta > 0 ? "+" : ""}{Math.round(option.riskDelta * 100)}%
                </span>
              </div>
              <div className="text-[11px] text-muted">{option.resourceUse}</div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projected Fleet Availability</CardTitle>
          <CardDescription>
            {selected ? `Scenario: ${selected.label}` : "Baseline forecast — select an option above to compare"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div key={selectedId ?? "baseline"} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <AvailabilityChart data={chartData} />
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
