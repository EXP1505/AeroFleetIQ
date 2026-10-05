"use client";

import * as React from "react";
import { RECOMMENDATIONS } from "@/lib/mock/recommendations";
import type { AuditLogEntry, Recommendation, RecommendationState } from "@/lib/types";
import { toast } from "sonner";

interface RecommendationsContextValue {
  recommendations: Recommendation[];
  auditLog: AuditLogEntry[];
  updateState: (id: string, state: RecommendationState, note?: string) => void;
}

const RecommendationsContext = React.createContext<RecommendationsContextValue | null>(null);

export function RecommendationsProvider({ children }: { children: React.ReactNode }) {
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>(RECOMMENDATIONS);
  const [auditLog, setAuditLog] = React.useState<AuditLogEntry[]>([]);

  const updateState = React.useCallback(
    (id: string, state: RecommendationState, note?: string) => {
      const rec = recommendations.find((r) => r.id === id);
      if (!rec) return;
      const action = state === "approved" ? "approved" : state === "deferred" ? "deferred" : "overridden";

      setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, state } : r)));
      setAuditLog((log) => [
        {
          id: `audit-${Date.now()}-${id}`,
          timestamp: new Date().toISOString(),
          recommendationId: id,
          tail: rec.tail,
          action,
          actor: "Fleet Planner",
          note,
        },
        ...log,
      ]);
      toast(`${rec.tail} · ${rec.componentName} ${action}`, {
        description: note || `Recommendation ${action} by Fleet Planner`,
      });
    },
    [recommendations]
  );

  return (
    <RecommendationsContext.Provider value={{ recommendations, auditLog, updateState }}>
      {children}
    </RecommendationsContext.Provider>
  );
}

export function useRecommendations() {
  const ctx = React.useContext(RecommendationsContext);
  if (!ctx) throw new Error("useRecommendations must be used within RecommendationsProvider");
  return ctx;
}
