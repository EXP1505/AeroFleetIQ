"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import type { SensorChannel } from "@/lib/types";

export function SensorChart({ channel }: { channel: SensorChannel }) {
  const anomalyStart = channel.series.findIndex((p) => p.anomaly);
  const anomalyEnd = (() => {
    let last = -1;
    channel.series.forEach((p, i) => {
      if (p.anomaly) last = i;
    });
    return last;
  })();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground">{channel.label}</span>
        <span className="text-[11px] text-muted font-tabular">{channel.unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={channel.series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#212a38" vertical={false} />
          <XAxis dataKey="t" stroke="#7d8aa0" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#7d8aa0" fontSize={10} tickLine={false} axisLine={false} width={40} domain={["auto", "auto"]} />
          {anomalyStart >= 0 && (
            <ReferenceArea
              x1={channel.series[anomalyStart].t}
              x2={channel.series[anomalyEnd].t}
              strokeOpacity={0}
              fill="#f87171"
              fillOpacity={0.12}
            />
          )}
          <Tooltip
            contentStyle={{ background: "#151b27", border: "1px solid #212a38", borderRadius: 8, fontSize: 12 }}
            labelFormatter={(t) => `Cycle ${t}`}
          />
          <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={1.75} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
