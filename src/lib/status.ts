import type { HealthStatus, RecommendationPriority } from "./types";

export const STATUS_LABEL: Record<HealthStatus, string> = {
  healthy: "Healthy",
  monitor: "Monitor",
  critical: "Critical",
};

export const STATUS_COLOR: Record<HealthStatus, string> = {
  healthy: "var(--healthy)",
  monitor: "var(--monitor)",
  critical: "var(--critical)",
};

export const PRIORITY_LABEL: Record<RecommendationPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function badgeVariantForStatus(status: HealthStatus) {
  return status;
}
