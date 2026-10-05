import { FLEET, getAircraft as _getAircraft, getAllComponents } from "./mock/aircraft";
import { SPARES } from "./mock/spares";
import { TECHNICIANS, FACILITIES } from "./mock/resources";
import { RECOMMENDATIONS } from "./mock/recommendations";
import { FEEDBACK, falseAlarmRate, avgRulError } from "./mock/feedback";
import { AVAILABILITY_FORECAST, DECISION_OPTIONS, currentAvailabilityPct } from "./mock/availability";
import type { Aircraft, Recommendation } from "./types";

// Simulated network latency to mimic a real REST backend.
function delay<T>(data: T, min = 300, max = 600): Promise<T> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function fetchFleet(): Promise<Aircraft[]> {
  return delay(FLEET);
}

export async function fetchAircraft(tail: string): Promise<Aircraft | undefined> {
  return delay(_getAircraft(tail));
}

export async function fetchFleetKpis() {
  const availability = currentAvailabilityPct();
  const atRisk = FLEET.filter((a) => a.status !== "healthy").length;
  const openRecs = RECOMMENDATIONS.filter((r) => r.state === "pending").length;
  const stockOutRisk = SPARES.filter((p) => p.stock <= p.minStock).length;
  return delay({ availability, atRisk, openRecs, stockOutRisk });
}

export async function fetchAvailabilityForecast() {
  return delay(AVAILABILITY_FORECAST);
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  return delay(RECOMMENDATIONS);
}

export async function fetchSpares() {
  return delay(SPARES);
}

export async function fetchResources() {
  return delay({ technicians: TECHNICIANS, facilities: FACILITIES });
}

export async function fetchDecisionOptions() {
  return delay(DECISION_OPTIONS);
}

export async function fetchFeedback() {
  return delay({ entries: FEEDBACK, falseAlarmRate: falseAlarmRate(), avgRulError: avgRulError() });
}

export async function fetchAllComponents() {
  return delay(getAllComponents());
}
