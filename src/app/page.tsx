"use client";

import * as React from "react";
import { Activity, AlertTriangle, ClipboardList, PackageX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/fleet/kpi-card";
import { FleetGrid } from "@/components/fleet/fleet-grid";
import { AvailabilityChart } from "@/components/fleet/availability-chart";
import { PriorityList } from "@/components/fleet/priority-list";
import { fetchFleet, fetchFleetKpis, fetchAvailabilityForecast, fetchRecommendations } from "@/lib/api";
import type { Aircraft, AvailabilityPoint, Recommendation } from "@/lib/types";
import { useLiveAlerts } from "@/context/live-alert-context";

export default function FleetOverviewPage() {
  const [fleet, setFleet] = React.useState<Aircraft[]>([]);
  const [kpis, setKpis] = React.useState<{ availability: number; atRisk: number; openRecs: number; stockOutRisk: number } | null>(null);
  const [forecast, setForecast] = React.useState<AvailabilityPoint[]>([]);
  const [recs, setRecs] = React.useState<Recommendation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { alerts } = useLiveAlerts();

  React.useEffect(() => {
    Promise.all([fetchFleet(), fetchFleetKpis(), fetchAvailabilityForecast(), fetchRecommendations()]).then(
      ([fleetData, kpiData, forecastData, recData]) => {
        setFleet(fleetData);
        setKpis(kpiData);
        setForecast(forecastData);
        setRecs(recData);
        setLoading(false);
      }
    );
  }, []);

  // Live alert simulation bumps the "at risk" KPI once the scripted anomaly fires.
  const atRisk = kpis ? kpis.atRisk + (alerts.length > 0 ? 1 : 0) : 0;

  if (loading || !kpis) {
    return <div className="text-sm text-muted">Loading fleet telemetry…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Fleet Overview</h1>
        <p className="text-sm text-muted">24-aircraft synthetic fleet · health, availability and priorities at a glance</p>
      </div>

      <div id="demo-kpi-row" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Fleet Availability" value={kpis.availability} suffix="%" icon={Activity} tone="healthy" />
        <KpiCard label="Aircraft at Risk" value={atRisk} icon={AlertTriangle} tone="monitor" sub={alerts.length > 0 ? "+1 from live alert" : undefined} />
        <KpiCard label="Open Recommendations" value={kpis.openRecs} icon={ClipboardList} tone="default" />
        <KpiCard label="Spare Stock-Out Risk" value={kpis.stockOutRisk} icon={PackageX} tone="critical" sub="parts at or below min stock" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fleet Health Grid</CardTitle>
            <CardDescription>24 aircraft · color-coded by component health status</CardDescription>
          </CardHeader>
          <CardContent>
            <FleetGrid fleet={fleet} />
            <div className="flex items-center gap-4 mt-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-healthy" /> Healthy</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-monitor" /> Monitor</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-critical" /> Critical</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority List</CardTitle>
            <CardDescription>Ranked by urgency across the fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <PriorityList recommendations={recs} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>30-Day Availability Forecast</CardTitle>
          <CardDescription>Projected fleet availability based on scheduled maintenance and current degradation trends</CardDescription>
        </CardHeader>
        <CardContent>
          <AvailabilityChart data={forecast} />
        </CardContent>
      </Card>
    </div>
  );
}
