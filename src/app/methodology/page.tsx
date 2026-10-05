import { ArrowRight, Database, Cpu, FlaskConical, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const KPIS = [
  { name: "RUL Error", definition: "Mean absolute difference (cycles) between predicted and actual remaining useful life at time of finding." },
  { name: "False Alarm Rate", definition: "Share of flagged predictions where teardown/inspection found no defect." },
  { name: "Stock-Out Rate", definition: "Share of critical parts with on-hand stock at or below minimum stock threshold." },
  { name: "Unplanned Downtime", definition: "Aircraft-days grounded outside a scheduled maintenance window." },
];

const PIPELINE = [
  { label: "Collect", icon: Database, desc: "Sensor telemetry, maintenance logs, spares & technician data" },
  { label: "Preprocess", icon: FlaskConical, desc: "Cleaning, feature extraction, windowing per component" },
  { label: "Model", icon: Cpu, desc: "RUL estimation, anomaly detection, failure risk scoring" },
  { label: "Prescribe", icon: Lightbulb, desc: "Inspect / Monitor / Replace recommendations with confidence" },
];

const STACK = [
  "Next.js (App Router) + TypeScript",
  "Tailwind CSS + shadcn/ui",
  "Recharts for time-series & explainability visuals",
  "Framer Motion for interaction and demo choreography",
  "FastAPI (planned backend) serving model inference",
  "NASA C-MAPSS / PCoE datasets for initial model training",
];

export default function MethodologyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">KPI & Methodology</h1>
        <p className="text-sm text-muted">How availability is modeled and which metrics the system tracks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Availability Formula</CardTitle>
          <CardDescription>Standard reliability engineering definitions used throughout the dashboards</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-tabular text-sm">
          <div className="rounded-md border border-border bg-surface-2 p-3">
            <div className="text-xs text-muted mb-1">Availability</div>
            MTBF / (MTBF + MTTR) × 100
          </div>
          <div className="rounded-md border border-border bg-surface-2 p-3">
            <div className="text-xs text-muted mb-1">MTBF</div>
            Mean Time Between Failures
          </div>
          <div className="rounded-md border border-border bg-surface-2 p-3">
            <div className="text-xs text-muted mb-1">MTTR</div>
            Mean Time To Repair
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracked KPIs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {KPIS.map((kpi) => (
            <div key={kpi.name} className="rounded-md border border-border bg-surface-2 p-3">
              <div className="text-sm font-medium mb-1">{kpi.name}</div>
              <div className="text-xs text-muted leading-relaxed">{kpi.definition}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Architecture</CardTitle>
          <CardDescription>Collect → Preprocess → Model → Prescribe</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max">
            {PIPELINE.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className="flex flex-col gap-1.5 rounded-md border border-border bg-surface-2 px-4 py-3 min-w-[160px]">
                    <Icon className="size-4 text-accent" />
                    <span className="text-sm font-medium">{stage.label}</span>
                    <span className="text-[11px] text-muted leading-snug">{stage.desc}</span>
                  </div>
                  {i < PIPELINE.length - 1 && <ArrowRight className="size-4 text-muted shrink-0" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted list-disc list-inside">
            {STACK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
