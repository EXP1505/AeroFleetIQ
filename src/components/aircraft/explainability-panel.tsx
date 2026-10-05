"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Component } from "@/lib/types";

export function ExplainabilityPanel({ component }: { component: Component }) {
  const data = component.contributingFeatures.map((f) => ({ ...f, name: f.feature }));

  return (
    <Card id="demo-explainability">
      <CardHeader>
        <CardTitle>Why flagged</CardTitle>
        <CardDescription>Top contributing features for {component.name}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={190}
              stroke="#7d8aa0"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.contribution > 60 ? "#f87171" : entry.contribution > 35 ? "#fbbf24" : "#22d3ee"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="rounded-md border border-border bg-surface-2 p-3 text-sm text-foreground leading-relaxed">
          {component.reason}
        </div>
      </CardContent>
    </Card>
  );
}
