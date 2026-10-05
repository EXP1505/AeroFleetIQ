"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Clock3, Undo2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useRecommendations } from "@/context/recommendations-context";
import { formatDate } from "@/lib/utils";
import type { RecommendationPriority, RecommendationState } from "@/lib/types";

const PRIORITY_VARIANT: Record<RecommendationPriority, "critical" | "monitor" | "default" | "muted"> = {
  critical: "critical",
  high: "monitor",
  medium: "default",
  low: "muted",
};

const STATE_VARIANT: Record<RecommendationState, "healthy" | "muted" | "default"> = {
  approved: "healthy",
  deferred: "muted",
  overridden: "default",
  pending: "muted",
};

export default function RecommendationsPage() {
  const { recommendations, auditLog, updateState } = useRecommendations();

  React.useEffect(() => {
    function onDemoAction(e: Event) {
      const detail = (e as CustomEvent).detail as { action: string };
      if (detail.action === "approve") {
        const target = recommendations.find((r) => r.tail === "AF-107" && r.action === "Replace" && r.state === "pending");
        if (target) updateState(target.id, "approved", "Approved via guided demo walkthrough");
      }
    }
    window.addEventListener("demo:action", onDemoAction);
    return () => window.removeEventListener("demo:action", onDemoAction);
  }, [recommendations, updateState]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Maintenance Recommendations</h1>
        <p className="text-sm text-muted">Human-in-the-loop review — approve, defer, or override each recommendation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>{recommendations.filter((r) => r.state === "pending").length} pending of {recommendations.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aircraft</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-tabular">
                    <Link href={`/aircraft/${rec.tail}`} className="hover:text-accent">{rec.tail}</Link>
                  </TableCell>
                  <TableCell>{rec.componentName}</TableCell>
                  <TableCell>{rec.action}</TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_VARIANT[rec.priority]} className="capitalize">{rec.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted font-tabular whitespace-nowrap">
                    {formatDate(rec.window.start)} – {formatDate(rec.window.end)}
                  </TableCell>
                  <TableCell className="text-xs text-muted max-w-[180px] truncate">{rec.resources.join(", ")}</TableCell>
                  <TableCell className="font-tabular">{Math.round(rec.confidence * 100)}%</TableCell>
                  <TableCell>
                    <Badge variant={STATE_VARIANT[rec.state]} className="capitalize">{rec.state}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5" id={rec.tail === "AF-107" && rec.action === "Replace" ? "demo-approve-AF-107" : undefined}>
                      <Button
                        size="icon"
                        variant="success"
                        disabled={rec.state !== "pending"}
                        onClick={() => updateState(rec.id, "approved")}
                        aria-label="Approve"
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        disabled={rec.state !== "pending"}
                        onClick={() => updateState(rec.id, "deferred", "Deferred pending next review cycle")}
                        aria-label="Defer"
                      >
                        <Clock3 className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        disabled={rec.state !== "pending"}
                        onClick={() => updateState(rec.id, "overridden", "Overridden by Fleet Planner judgment")}
                        aria-label="Override"
                      >
                        <Undo2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card id="demo-audit-log">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>In-memory record of every human decision this session</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-sm text-muted">No decisions recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted font-tabular whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="font-tabular">{entry.tail}</TableCell>
                    <TableCell className="capitalize">{entry.action}</TableCell>
                    <TableCell>{entry.actor}</TableCell>
                    <TableCell className="text-xs text-muted">{entry.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
