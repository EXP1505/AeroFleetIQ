"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { fetchFleet } from "@/lib/api";
import { getPartByNumber } from "@/lib/mock/spares";
import type { Aircraft, Component } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface GraphNode {
  id: string;
  col: number;
  label: string;
  sublabel: string;
  kind: "sensor" | "aircraft" | "component" | "event" | "part" | "outcome";
  detail: React.ReactNode;
}

const COL_LABELS = ["Sensor", "Aircraft", "Component", "Maintenance Event", "Spare Part", "Outcome"];
const KIND_COLOR: Record<GraphNode["kind"], string> = {
  sensor: "#22d3ee",
  aircraft: "#60a5fa",
  component: "#fbbf24",
  event: "#a78bfa",
  part: "#34d399",
  outcome: "#f87171",
};

function buildGraph(aircraft: Aircraft): GraphNode[] {
  const flagged =
    aircraft.systems.flatMap((s) => s.components).find((c) => c.status !== "healthy") ||
    aircraft.systems[0]?.components[0];
  if (!flagged) return [];
  const sensor = flagged.sensors[0];
  const event = flagged.maintenanceHistory[0];
  const part = getPartByNumber(flagged.partId);

  const nodes: GraphNode[] = [
    {
      id: "sensor",
      col: 0,
      label: sensor?.label ?? "Sensor Channel",
      sublabel: `${flagged.name} telemetry`,
      kind: "sensor",
      detail: (
        <div className="text-sm text-muted">
          Streams {sensor?.unit} readings across {sensor?.series.length ?? 0} recent cycles. Normal range{" "}
          {sensor ? `${sensor.normalRange[0]}–${sensor.normalRange[1]}` : "n/a"}.
        </div>
      ),
    },
    {
      id: "aircraft",
      col: 1,
      label: aircraft.tail,
      sublabel: aircraft.platform,
      kind: "aircraft",
      detail: (
        <div className="text-sm text-muted">
          {aircraft.squadron} · health {aircraft.healthScore}/100 · {aircraft.totalCycles.toLocaleString()} total cycles.
        </div>
      ),
    },
    {
      id: "component",
      col: 2,
      label: flagged.name,
      sublabel: `Health ${flagged.healthScore}`,
      kind: "component",
      detail: (
        <div className="text-sm text-muted space-y-1">
          <div>Status: {flagged.status}</div>
          <div>RUL: {flagged.rul.cycles} cycles (±{flagged.rul.upper - flagged.rul.cycles})</div>
          <div>{flagged.reason}</div>
        </div>
      ),
    },
    {
      id: "event",
      col: 3,
      label: event?.type ?? "No scheduled event",
      sublabel: event ? formatDate(event.date) : "—",
      kind: "event",
      detail: <div className="text-sm text-muted">{event?.description ?? "No recent maintenance event on record."}</div>,
    },
    {
      id: "part",
      col: 4,
      label: part?.name ?? flagged.name,
      sublabel: part?.partNumber ?? flagged.partId,
      kind: "part",
      detail: (
        <div className="text-sm text-muted space-y-1">
          <div>Stock: {part?.stock ?? "—"} · Lead time: {part?.leadTimeDays ?? "—"}d</div>
          <div>Location: {part?.location ?? "—"}</div>
        </div>
      ),
    },
    {
      id: "outcome",
      col: 5,
      label: flagged.status === "critical" ? "Awaiting Replacement" : "Monitoring",
      sublabel: flagged.degradationTrend,
      kind: "outcome",
      detail: (
        <div className="text-sm text-muted">
          Predicted outcome feeds into closed-loop learning once the maintenance action is carried out and findings are logged.
        </div>
      ),
    },
  ];
  return nodes;
}

export default function DigitalThreadPage() {
  const [fleet, setFleet] = React.useState<Aircraft[]>([]);
  const [tail, setTail] = React.useState("AF-107");
  const [selectedNode, setSelectedNode] = React.useState<GraphNode | null>(null);

  React.useEffect(() => {
    fetchFleet().then(setFleet);
  }, []);

  const aircraft = fleet.find((a) => a.tail === tail);
  const nodes = aircraft ? buildGraph(aircraft) : [];

  const colWidth = 170;
  const nodeY = 80;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold">Digital Thread</h1>
          <p className="text-sm text-muted">Trace data lineage from sensor through to maintenance outcome</p>
        </div>
        <Select value={tail} onValueChange={setTail}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fleet.map((a) => (
              <SelectItem key={a.tail} value={a.tail}>{a.tail}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tail} Thread</CardTitle>
          <CardDescription>Click a node to inspect its details</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto scrollbar-thin">
          <svg width={colWidth * 6} height={200} className="min-w-[1000px]">
            {nodes.slice(0, -1).map((n, i) => (
              <line
                key={`edge-${i}`}
                x1={n.col * colWidth + 90}
                y1={nodeY}
                x2={(n.col + 1) * colWidth + 10}
                y2={nodeY}
                stroke="#212a38"
                strokeWidth={2}
              />
            ))}
            {COL_LABELS.map((label, i) => (
              <text key={label} x={i * colWidth + 50} y={24} textAnchor="middle" fill="#7d8aa0" fontSize={11}>
                {label}
              </text>
            ))}
            {nodes.map((n) => (
              <g
                key={n.id}
                transform={`translate(${n.col * colWidth + 10}, ${nodeY - 32})`}
                className="cursor-pointer"
                onClick={() => setSelectedNode(n)}
              >
                <rect width={140} height={64} rx={10} fill="#151b27" stroke={KIND_COLOR[n.kind]} strokeWidth={1.5} />
                <circle cx={16} cy={16} r={4} fill={KIND_COLOR[n.kind]} />
                <text x={28} y={20} fill="#e5ebf5" fontSize={12} fontWeight={500}>
                  {n.label.length > 16 ? n.label.slice(0, 15) + "…" : n.label}
                </text>
                <text x={14} y={42} fill="#7d8aa0" fontSize={10.5}>
                  {n.sublabel.length > 20 ? n.sublabel.slice(0, 19) + "…" : n.sublabel}
                </text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <SheetContent>
          {selectedNode && (
            <>
              <SheetHeader>
                <Badge variant="accent" className="w-fit capitalize mb-1">{selectedNode.kind}</Badge>
                <SheetTitle>{selectedNode.label}</SheetTitle>
                <SheetDescription>{selectedNode.sublabel}</SheetDescription>
              </SheetHeader>
              {selectedNode.detail}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
