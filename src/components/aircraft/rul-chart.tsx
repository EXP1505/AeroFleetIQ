"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RulPoint } from "@/lib/types";

export function RulChart({ history }: { history: RulPoint[] }) {
  const data = history.map((p) => ({ ...p, band: p.upper - p.lower }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="#212a38" vertical={false} />
        <XAxis dataKey="cycle" stroke="#7d8aa0" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#7d8aa0" fontSize={11} tickLine={false} axisLine={false} width={44} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#151b27", border: "1px solid #212a38", borderRadius: 8, fontSize: 12 }}
          labelFormatter={(c) => `Cycle ${c}`}
        />
        <Area dataKey="lower" stackId="band" stroke="none" fill="transparent" isAnimationActive={false} />
        <Area
          dataKey="band"
          stackId="band"
          stroke="none"
          fill="#fbbf24"
          fillOpacity={0.15}
          name="Uncertainty band"
          isAnimationActive={false}
        />
        <Line type="monotone" dataKey="rul" stroke="#fbbf24" strokeWidth={2} dot={false} name="RUL (cycles)" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
