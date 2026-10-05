import { Rng, GLOBAL_SEED } from "./seed";
import { FLEET } from "./aircraft";
import type { AvailabilityPoint, DecisionOption } from "../types";

export function currentAvailabilityPct(): number {
  const available = FLEET.filter((a) => a.availability === "available").length;
  return Math.round((available / FLEET.length) * 1000) / 10;
}

export function generateAvailabilityForecast(days = 30): AvailabilityPoint[] {
  const rng = new Rng(GLOBAL_SEED + 606);
  const base = Math.max(70, Math.min(98, currentAvailabilityPct()));
  const points: AvailabilityPoint[] = [];
  let value = base;
  for (let d = 0; d <= days; d++) {
    const date = new Date(Date.now() + d * 86400000).toISOString();
    if (d > 0) {
      const drift = rng.gaussian(0, 1.1);
      value = Math.max(70, Math.min(98, value + drift * 0.6 - 0.05));
    }
    points.push({ day: d, date, availability: Math.round(value * 10) / 10, projected: d > 0 });
  }
  return points;
}

export const AVAILABILITY_FORECAST: AvailabilityPoint[] = generateAvailabilityForecast();

function offsetForecast(forecast: AvailabilityPoint[], deltaFn: (d: number) => number): AvailabilityPoint[] {
  return forecast.map((p) => ({ ...p, availability: Math.round((p.availability + deltaFn(p.day)) * 10) / 10 }));
}

export function generateDecisionOptions(): DecisionOption[] {
  const base = AVAILABILITY_FORECAST;
  return [
    {
      id: "replace-next-window",
      label: "Replace at Next Window",
      description:
        "Hold AF-107 in service and replace the gearbox bearing during the scheduled window in 12 days. Spare arrives from OEM depot (21-day lead time) after the window opens, risking a short delay.",
      availabilityImpact: offsetForecast(base, (d) => (d > 12 ? -1.8 : 0)),
      riskDelta: 0.18,
      resourceUse: "1 technician team, OEM depot spare (delayed 9 days past window)",
      cost: "medium",
    },
    {
      id: "expedite-spare",
      label: "Expedite Spare + Replace Early",
      description:
        "Air-freight the gearbox bearing from the OEM depot and pull AF-107 into an unscheduled maintenance slot in 5 days, ahead of the degradation curve crossing the risk threshold.",
      availabilityImpact: offsetForecast(base, (d) => (d >= 5 && d <= 7 ? -3.2 : d > 7 ? -0.3 : 0)),
      riskDelta: -0.42,
      resourceUse: "1 technician team, expedited freight, unscheduled hangar slot",
      cost: "high",
    },
    {
      id: "defer-monitor",
      label: "Defer + Monitor",
      description:
        "Keep AF-107 flying with increased sensor monitoring frequency, deferring replacement until the spare naturally arrives. Risk of RUL exhaustion before the window if degradation accelerates.",
      availabilityImpact: offsetForecast(base, (d) => (d > 25 ? -2.4 : 0)),
      riskDelta: 0.35,
      resourceUse: "No technician allocation yet, continuous telemetry monitoring",
      cost: "low",
    },
  ];
}

export const DECISION_OPTIONS: DecisionOption[] = generateDecisionOptions();
