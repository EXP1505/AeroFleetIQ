"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Clock, Gauge } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComponentTree } from "@/components/aircraft/component-tree";
import { SensorChart } from "@/components/aircraft/sensor-chart";
import { RulChart } from "@/components/aircraft/rul-chart";
import { ExplainabilityPanel } from "@/components/aircraft/explainability-panel";
import { fetchAircraft } from "@/lib/api";
import type { Aircraft, Component } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT = { healthy: "healthy", monitor: "monitor", critical: "critical" } as const;

export default function AircraftDetailPage() {
  const params = useParams<{ tail: string }>();
  const tail = params.tail;
  const [aircraft, setAircraft] = React.useState<Aircraft | null | undefined>(undefined);
  const [selected, setSelected] = React.useState<Component | null>(null);

  React.useEffect(() => {
    fetchAircraft(tail).then((a) => {
      setAircraft(a ?? null);
      if (a) {
        const flagged = a.systems.flatMap((s) => s.components).find((c) => c.status !== "healthy");
        setSelected(flagged ?? a.systems[0]?.components[0] ?? null);
      }
    });
  }, [tail]);

  if (aircraft === undefined) {
    return <div className="text-sm text-muted">Loading aircraft record…</div>;
  }
  if (aircraft === null) {
    return <div className="text-sm text-muted">Aircraft {tail} not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold font-tabular flex items-center gap-2">
            {aircraft.tail}
            <Badge variant={STATUS_VARIANT[aircraft.status]}>{aircraft.status}</Badge>
          </h1>
          <p className="text-sm text-muted">{aircraft.platform} · {aircraft.squadron} · {aircraft.totalCycles.toLocaleString()} total cycles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted">Aircraft Health Score</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-semibold font-tabular">{aircraft.healthScore}</span>
              <span className="text-sm text-muted">/ 100</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start gap-2">
            <Clock className="size-4 text-accent mt-0.5" />
            <div>
              <div className="text-xs text-muted">Next Maintenance Window</div>
              <div className="text-sm font-tabular mt-1">
                {formatDate(aircraft.nextMaintenanceWindow.start)} ({aircraft.nextMaintenanceWindow.daysOut} days out)
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start gap-2">
            <Gauge className="size-4 text-accent mt-0.5" />
            <div>
              <div className="text-xs text-muted">Availability Status</div>
              <div className="text-sm capitalize mt-1">{aircraft.availability.replace("-", " ")}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start gap-2">
            <AlertTriangle className="size-4 text-monitor mt-0.5" />
            <div>
              <div className="text-xs text-muted">Flagged Components</div>
              <div className="text-sm font-tabular mt-1">
                {aircraft.systems.flatMap((s) => s.components).filter((c) => c.status !== "healthy").length} of{" "}
                {aircraft.systems.flatMap((s) => s.components).length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1" id="demo-component-tree">
          <CardHeader>
            <CardTitle>Component Tree</CardTitle>
            <CardDescription>Select a component to inspect</CardDescription>
          </CardHeader>
          <CardContent>
            <ComponentTree systems={aircraft.systems} selectedId={selected?.id ?? null} onSelect={setSelected} />
          </CardContent>
        </Card>

        <div className="lg:col-span-3 flex flex-col gap-4">
          {selected && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selected.name} — Sensor Telemetry</CardTitle>
                  <CardDescription>
                    Health {selected.healthScore}/100 · Failure risk {Math.round(selected.failureRisk * 100)}% · Criticality {selected.criticality}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selected.sensors.map((ch) => (
                    <SensorChart key={ch.key} channel={ch} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Remaining Useful Life</CardTitle>
                  <CardDescription>
                    {selected.rul.cycles} cycles (±{selected.rul.upper - selected.rul.cycles}) · degradation signal {selected.degradationTrend}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RulChart history={selected.rulHistory} />
                </CardContent>
              </Card>

              <ExplainabilityPanel component={selected} />

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance History</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {selected.maintenanceHistory.map((evt) => (
                    <div key={evt.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-1.5">
                      <div>
                        <span className="font-medium">{evt.type}</span>
                        <span className="text-muted"> — {evt.description}</span>
                      </div>
                      <span className="text-xs text-muted font-tabular shrink-0 ml-3">{formatDate(evt.date)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
