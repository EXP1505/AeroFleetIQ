import { Rng, GLOBAL_SEED } from "./seed";
import { getAllComponents } from "./aircraft";
import type { FeedbackEntry } from "../types";

const PREDICTED_FINDINGS = [
  "Early-stage bearing wear expected",
  "Seal degradation likely",
  "Elevated thermal stress on blade coating",
  "Minor pressure fluctuation, monitor only",
];

const ACTUAL_FINDINGS_CONFIRMED = [
  "Bearing showed surface pitting consistent with prediction",
  "Seal wear confirmed, replaced during inspection",
  "Coating micro-cracking found as predicted",
];

const ACTUAL_FINDINGS_PARTIAL = [
  "Wear present but less advanced than modeled",
  "Component within limits, minor contributing factor confirmed",
];

const ACTUAL_FINDINGS_FALSE_ALARM = [
  "No defect found on teardown inspection",
  "Component tested serviceable, no action taken",
];

export function generateFeedback(): FeedbackEntry[] {
  const rng = new Rng(GLOBAL_SEED + 909);
  const allComponents = getAllComponents();
  const flagged = allComponents.filter(({ component }) => component.status !== "healthy");
  // Closed-loop learning draws on resolved historical predictions too, not just
  // components that are currently flagged — otherwise the log would be too thin.
  const historicalSample = allComponents
    .filter(({ component }) => component.status === "healthy")
    .filter((_, i) => i % 11 === 0)
    .slice(0, 14);
  const sample = [...flagged, ...historicalSample];

  return sample.map(({ aircraft, component }, i) => {
    const roll = rng.next();
    const match: FeedbackEntry["match"] = roll < 0.62 ? "confirmed" : roll < 0.85 ? "partial" : "false-alarm";
    const actualFinding =
      match === "confirmed"
        ? rng.pick(ACTUAL_FINDINGS_CONFIRMED)
        : match === "partial"
        ? rng.pick(ACTUAL_FINDINGS_PARTIAL)
        : rng.pick(ACTUAL_FINDINGS_FALSE_ALARM);

    const predictedDaysAgo = rng.int(20, 90);
    const actualDaysAgo = predictedDaysAgo - rng.int(3, 15);
    const rulErrorCycles = match === "confirmed" ? rng.int(1, 8) : match === "partial" ? rng.int(8, 22) : rng.int(15, 40);

    return {
      id: `fb-${aircraft.tail}-${component.id}-${i}`,
      tail: aircraft.tail,
      componentId: component.id,
      componentName: component.name,
      predictedDate: new Date(Date.now() - predictedDaysAgo * 86400000).toISOString(),
      predictedFinding: rng.pick(PREDICTED_FINDINGS),
      actualDate: new Date(Date.now() - Math.max(0, actualDaysAgo) * 86400000).toISOString(),
      actualFinding,
      match,
      rulErrorCycles,
    };
  });
}

export const FEEDBACK: FeedbackEntry[] = generateFeedback();

export function falseAlarmRate(): number {
  const falseAlarms = FEEDBACK.filter((f) => f.match === "false-alarm").length;
  return Math.round((falseAlarms / FEEDBACK.length) * 1000) / 10;
}

export function avgRulError(): number {
  const total = FEEDBACK.reduce((sum, f) => sum + f.rulErrorCycles, 0);
  return Math.round((total / FEEDBACK.length) * 10) / 10;
}
