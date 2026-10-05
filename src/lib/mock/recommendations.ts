import { Rng, GLOBAL_SEED } from "./seed";
import { getAllComponents } from "./aircraft";
import { TECHNICIANS } from "./resources";
import type { Recommendation, RecommendationAction, RecommendationPriority } from "../types";

function actionForStatus(status: string, rng: Rng): RecommendationAction {
  if (status === "critical") return "Replace";
  if (status === "monitor") return rng.bool(0.6) ? "Inspect" : "Monitor";
  return "Monitor";
}

function priorityFor(failureRisk: number, criticality: string): RecommendationPriority {
  if (failureRisk > 0.65 && criticality === "high") return "critical";
  if (failureRisk > 0.5) return "high";
  if (failureRisk > 0.3) return "medium";
  return "low";
}

export function generateRecommendations(): Recommendation[] {
  const rng = new Rng(GLOBAL_SEED + 505);
  const components = getAllComponents().filter(({ component }) => component.status !== "healthy");

  return components.map(({ aircraft, component }, i) => {
    const action = actionForStatus(component.status, rng);
    const priority = priorityFor(component.failureRisk, component.criticality);
    const windowStart = new Date(Date.now() + rng.int(1, aircraft.nextMaintenanceWindow.daysOut) * 86400000);
    const windowEnd = new Date(windowStart.getTime() + rng.int(1, 3) * 86400000);
    const specialty = component.systemId.includes("propulsion")
      ? "Propulsion"
      : component.systemId.includes("hydraulics")
      ? "Hydraulics"
      : component.systemId.includes("avionics")
      ? "Avionics"
      : component.systemId.includes("landing-gear")
      ? "Airframe"
      : "Electrical";
    const techs = TECHNICIANS.filter((t) => t.specialty === specialty).slice(0, 2);
    const resources = [
      ...(techs.length ? techs.map((t) => t.name) : [rng.pick(TECHNICIANS).name]),
      `Part ${component.partId}`,
    ];

    const confidence = Math.max(0.55, Math.min(0.97, 1 - (component.rul.upper - component.rul.lower) / (component.rul.cycles * 2 + 1)));

    return {
      id: `rec-${aircraft.tail}-${component.id}-${i}`,
      tail: aircraft.tail,
      componentId: component.id,
      componentName: component.name,
      action,
      priority,
      window: { start: windowStart.toISOString(), end: windowEnd.toISOString() },
      resources,
      confidence: Math.round(confidence * 100) / 100,
      state: "pending" as const,
      rationale: component.reason,
    };
  }).sort((a, b) => {
    const order: Record<RecommendationPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}

export const RECOMMENDATIONS: Recommendation[] = generateRecommendations();
