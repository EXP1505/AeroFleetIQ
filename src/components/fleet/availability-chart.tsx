"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { AvailabilityPoint } from "@/lib/types";

export function AvailabilityChart({ data }: { data: AvailabilityPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="availabilityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#212a38" vertical={false} />
        <XAxis
          dataKey="day"
          tickFormatter={(d) => `D+${d}`}
          stroke="#7d8aa0"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[70, 100]}
          stroke="#7d8aa0"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <ReferenceLine x={0} stroke="#7d8aa0" strokeDasharray="3 3" />
        <Tooltip
          contentStyle={{ background: "#151b27", border: "1px solid #212a38", borderRadius: 8, fontSize: 12 }}
          labelFormatter={(d) => `Day +${d}`}
          formatter={(value) => [`${value}%`, "Availability"]}
        />
        <Area
          type="monotone"
          dataKey="availability"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#availabilityFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
