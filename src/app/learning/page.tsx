"use client";

import * as React from "react";
import { ArrowRight, Wrench, Activity, Brain, RefreshCw, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/fleet/kpi-card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchFeedback } from "@/lib/api";
import type { FeedbackEntry } from "@/lib/types";

const MATCH_VARIANT = { confirmed: "healthy", partial: "monitor", "false-alarm": "critical" } as const;

const PIPELINE = [
  { label: "Prediction", icon: Brain },
  { label: "Maintenance", icon: Wrench },
  { label: "Actual Finding", icon: Activity },
  { label: "Model Feedback", icon: Database },
  { label: "Recalibration", icon: RefreshCw },
];

export default function LearningPage() {
  const [entries, setEntries] = React.useState<FeedbackEntry[]>([]);
  const [falseAlarmRate, setFalseAlarmRate] = React.useState(0);
  const [avgRulError, setAvgRulError] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchFeedback().then((data) => {
      setEntries(data.entries);
      setFalseAlarmRate(data.falseAlarmRate);
      setAvgRulError(data.avgRulError);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-sm text-muted">Loading feedback log…</div>;

  const matchCounts = ["confirmed", "partial", "false-alarm"].map((m) => ({
    name: m,
    count: entries.filter((e) => e.match === m).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Closed-Loop Learning</h1>
        <p className="text-sm text-muted">Prediction vs. actual finding feedback, recalibrating the model over time</p>
      </div>

      <Card>
        <CardContent className="p-5 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max">
            {PIPELINE.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <React.Fragment key={stage.label}>
                  <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-surface-2 px-4 py-3 min-w-[130px]">
                    <Icon className="size-4 text-accent" />
                    <span className="text-xs font-medium text-center">{stage.label}</span>
                  </div>
                  {i < PIPELINE.length - 1 && <ArrowRight className="size-4 text-muted shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard label="Avg. RUL Error" value={avgRulError} suffix="cycles" icon={Activity} tone="default" />
        <KpiCard label="False Alarm Rate" value={falseAlarmRate} suffix="%" icon={RefreshCw} tone="monitor" />
        <KpiCard label="Feedback Entries" value={entries.length} icon={Database} tone="healthy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Model Drift / False Alarm Monitor</CardTitle>
            <CardDescription>Match outcome distribution across logged predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={matchCounts} margin={{ left: 0 }}>
                <CartesianGrid stroke="#212a38" vertical={false} />
                <XAxis dataKey="name" stroke="#7d8aa0" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#7d8aa0" fontSize={11} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#151b27", border: "1px solid #212a38", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
                  {matchCounts.map((m, i) => (
                    <Cell key={i} fill={m.name === "confirmed" ? "#34d399" : m.name === "partial" ? "#fbbf24" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prediction vs. Actual Finding</CardTitle>
            <CardDescription>Logged outcomes feeding model recalibration</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Predicted</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>RUL Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-tabular">{e.tail}</TableCell>
                    <TableCell className="text-xs">{e.componentName}</TableCell>
                    <TableCell className="text-xs text-muted max-w-[160px] truncate">{e.predictedFinding}</TableCell>
                    <TableCell className="text-xs text-muted max-w-[160px] truncate">{e.actualFinding}</TableCell>
                    <TableCell>
                      <Badge variant={MATCH_VARIANT[e.match]} className="capitalize">{e.match.replace("-", " ")}</Badge>
                    </TableCell>
                    <TableCell className="font-tabular text-xs">{e.rulErrorCycles}c</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
