import { Rng, GLOBAL_SEED } from "./seed";
import type {
  Aircraft,
  AircraftSystem,
  Component,
  HealthStatus,
  MaintenanceEvent,
  PlatformClass,
  RulPoint,
  SensorChannel,
  SensorPoint,
  ContributingFeature,
} from "../types";

const PLATFORMS: { platform: PlatformClass; squadrons: string[] }[] = [
  { platform: "Strike Fighter", squadrons: ["7 Squadron", "17 Squadron", "51 Squadron"] },
  { platform: "Heavy Transport", squadrons: ["44 Squadron", "81 Squadron"] },
  { platform: "Rotary Wing", squadrons: ["104 Squadron", "112 Squadron"] },
];

const SYSTEM_TEMPLATES: Record<string, string[]> = {
  "Propulsion": ["Gearbox Bearing", "Turbine Blade Stage 2", "Fuel Injector Array", "Oil Pump"],
  "Avionics": ["Radar Processor", "Navigation Computer", "Mission Display Unit"],
  "Hydraulics": ["Primary Actuator", "Hydraulic Pump", "Reservoir Seal"],
  "Landing Gear": ["Main Brake Assembly", "Shock Strut", "Wheel Bearing Set"],
  "Flight Controls": ["Servo Actuator", "Control Rod Linkage"],
  "Fuel System": ["Fuel Transfer Pump", "Fuel Shutoff Valve"],
};

function statusFromHealth(health: number): HealthStatus {
  if (health < 45) return "critical";
  if (health < 70) return "monitor";
  return "healthy";
}

function genSensorChannel(
  rng: Rng,
  key: SensorChannel["key"],
  label: string,
  unit: string,
  baseline: number,
  noiseAmp: number,
  normalRange: [number, number],
  degrading: boolean,
  cycles: number
): SensorChannel {
  const series: SensorPoint[] = [];
  for (let t = 0; t < cycles; t++) {
    const progress = t / cycles;
    const drift = degrading ? Math.pow(progress, 2.2) * noiseAmp * 4.5 : 0;
    const noise = rng.gaussian(0, noiseAmp * 0.35);
    const value = baseline + drift + noise;
    const anomaly = degrading && progress > 0.62 && value > normalRange[1];
    series.push({ t, value: Math.round(value * 100) / 100, anomaly });
  }
  return { key, label, unit, series, normalRange };
}

function genRulHistory(rng: Rng, currentRul: number, uncertainty: number, cycles: number): RulPoint[] {
  const points: RulPoint[] = [];
  const steps = 14;
  for (let i = 0; i < steps; i++) {
    const cycle = Math.round((cycles / steps) * i);
    const progress = i / (steps - 1); // 0 = earliest reading, 1 = now
    const rul = Math.max(currentRul, Math.round(currentRul * (1 + (1 - progress) * 1.8) + rng.gaussian(0, currentRul * 0.04)));
    const spread = Math.max(3, Math.round(uncertainty * (0.35 + (1 - progress) * 0.75)));
    points.push({
      cycle,
      rul,
      lower: Math.max(0, rul - spread),
      upper: rul + spread,
    });
  }
  points[points.length - 1] = {
    cycle: points[points.length - 1].cycle,
    rul: currentRul,
    lower: Math.max(0, currentRul - uncertainty),
    upper: currentRul + uncertainty,
  };
  return points;
}

function genMaintenanceHistory(rng: Rng, componentId: string, componentName: string): MaintenanceEvent[] {
  const count = rng.int(1, 3);
  const events: MaintenanceEvent[] = [];
  const types: MaintenanceEvent["type"][] = ["Inspection", "Scheduled Check", "Repair"];
  for (let i = 0; i < count; i++) {
    const daysAgo = rng.int(30, 420);
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const type = rng.pick(types);
    events.push({
      id: `${componentId}-evt-${i}`,
      date,
      type,
      componentId,
      description: `${type} performed on ${componentName.toLowerCase()}`,
      outcome: type === "Inspection" ? rng.pick(["No defects found", "Minor wear noted, within limits", "Cleared for continued service"]) : undefined,
    });
  }
  return events.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

const FEATURE_POOL = [
  "Vibration RMS (high-freq band)",
  "EGT margin trend",
  "Oil pressure variance",
  "Temperature delta vs. baseline",
  "Cycle count since overhaul",
  "Vibration spectral kurtosis",
  "Pressure ripple frequency",
  "Thermal gradient rate",
];

function genContributingFeatures(rng: Rng, degrading: boolean): ContributingFeature[] {
  const n = 4;
  const pool = [...FEATURE_POOL];
  const chosen: ContributingFeature[] = [];
  for (let i = 0; i < n; i++) {
    const idx = rng.int(0, pool.length - 1);
    const feature = pool.splice(idx, 1)[0];
    const base = degrading ? rng.range(40, 95) : rng.range(5, 45);
    chosen.push({ feature, contribution: Math.round(base) });
  }
  return chosen.sort((a, b) => b.contribution - a.contribution);
}

function buildComponent(
  rng: Rng,
  systemId: string,
  name: string,
  index: number,
  tail: string,
  forceDegrading: boolean,
  cycles: number
): Component {
  const id = `${tail}-${systemId}-${index}`;
  const degrading = forceDegrading;
  const health = degrading ? (tail === "AF-107" ? rng.range(28, 38) : rng.range(40, 58)) : rng.range(74, 99);
  const status = statusFromHealth(health);
  const failureRisk = degrading ? rng.range(0.35, 0.82) : rng.range(0.02, 0.3);

  const rulCycles = tail === "AF-107" && forceDegrading ? 38 : degrading ? rng.int(45, 140) : rng.int(180, 900);
  const uncertainty = tail === "AF-107" && forceDegrading ? 9 : degrading ? Math.round(rulCycles * rng.range(0.2, 0.35)) : Math.round(rulCycles * rng.range(0.15, 0.3));

  const sensors: SensorChannel[] = [];
  if (name.includes("Bearing") || name.includes("Pump") || name.includes("Actuator")) {
    sensors.push(genSensorChannel(rng, "vibration", "Vibration", "mm/s RMS", 2.1, 1.1, [0, 4.5], degrading, cycles));
  }
  if (name.includes("Turbine") || name.includes("Injector")) {
    sensors.push(genSensorChannel(rng, "egt", "Exhaust Gas Temp", "°C margin", 420, 18, [380, 470], degrading, cycles));
  }
  if (name.includes("Pump") || name.includes("Hydraulic")) {
    sensors.push(genSensorChannel(rng, "oilPressure", "Oil Pressure", "psi", 62, 4, [50, 75], degrading, cycles));
  }
  sensors.push(genSensorChannel(rng, "temperature", "Case Temperature", "°C", 68, 5, [55, 85], degrading, cycles));

  const criticality = name.includes("Bearing") || name.includes("Turbine") || name.includes("Actuator") ? "high" : rng.pick(["medium", "low"] as const);

  const reasonDegrading = `Vibration signature trending above baseline for ${Math.round(cycles * 0.3)} consecutive cycles, correlated with rising case temperature. Pattern consistent with early-stage bearing wear.`;
  const reasonStable = `All monitored channels within normal operating envelope. No sustained drift detected across recent cycles.`;

  return {
    id,
    name,
    systemId,
    healthScore: Math.round(health),
    status,
    failureRisk: Math.round(failureRisk * 100) / 100,
    degradationTrend: degrading ? "rising" : rng.bool(0.1) ? "falling" : "stable",
    rul: { cycles: rulCycles, lower: Math.max(1, rulCycles - uncertainty), upper: rulCycles + uncertainty },
    criticality,
    partId: `PN-${systemId.slice(0, 3).toUpperCase()}-${1000 + index}`,
    sensors,
    rulHistory: genRulHistory(rng, rulCycles, uncertainty, cycles),
    contributingFeatures: genContributingFeatures(rng, degrading),
    reason: degrading ? reasonDegrading : reasonStable,
    maintenanceHistory: genMaintenanceHistory(rng, id, name),
  };
}

function systemNameForComponent(componentName: string): string | undefined {
  return Object.entries(SYSTEM_TEMPLATES).find(([, names]) => names.includes(componentName))?.[0];
}

function buildSystems(rng: Rng, tail: string, forceDegradedComponent: string | null, cycles: number): AircraftSystem[] {
  const systemNames = Object.keys(SYSTEM_TEMPLATES);
  let chosen = rng.pick([systemNames.slice(0, 4), systemNames.slice(1, 5), [systemNames[0], ...systemNames.slice(2, 5)]]);

  const requiredSystem = forceDegradedComponent ? systemNameForComponent(forceDegradedComponent) : undefined;
  if (requiredSystem && !chosen.includes(requiredSystem)) {
    chosen = [requiredSystem, ...chosen.slice(1)];
  }

  return chosen.map((sysName) => {
    const systemId = sysName.toLowerCase().replace(/\s+/g, "-");
    const componentNames = SYSTEM_TEMPLATES[sysName];
    const components = componentNames.map((cname, i) =>
      buildComponent(rng, systemId, cname, i, tail, forceDegradedComponent === cname, cycles)
    );
    return { id: systemId, name: sysName, components };
  });
}

function aircraftHealthFromSystems(systems: AircraftSystem[]): number {
  const all = systems.flatMap((s) => s.components);
  const avg = all.reduce((sum, c) => sum + c.healthScore, 0) / all.length;
  return Math.round(avg);
}

function aircraftStatusFromSystems(systems: AircraftSystem[]): HealthStatus {
  const all = systems.flatMap((s) => s.components);
  if (all.some((c) => c.status === "critical")) return "critical";
  if (all.some((c) => c.status === "monitor")) return "monitor";
  return "healthy";
}

export function generateFleet(): Aircraft[] {
  const fleet: Aircraft[] = [];
  const degradedTails = ["AF-107", "AF-112", "AF-119", "AF-123"];
  const degradedComponent: Record<string, string> = {
    "AF-107": "Gearbox Bearing",
    "AF-112": "Turbine Blade Stage 2",
    "AF-119": "Main Brake Assembly",
    "AF-123": "Hydraulic Pump",
  };

  for (let i = 0; i < 24; i++) {
    const num = 101 + i;
    const tail = `AF-${num}`;
    const rng = new Rng(GLOBAL_SEED + num * 97);
    const platformGroup = PLATFORMS[i % PLATFORMS.length];
    const squadron = rng.pick(platformGroup.squadrons);
    const totalCycles = rng.int(1200, 8600);
    const cyclesForSensors = 120;

    const isHero = tail === "AF-107";
    const forceDegraded = degradedTails.includes(tail) ? degradedComponent[tail] : null;

    const systems = buildSystems(rng, tail, forceDegraded, cyclesForSensors);
    const health = aircraftHealthFromSystems(systems);
    const status = aircraftStatusFromSystems(systems);

    const daysOut = isHero ? 12 : rng.int(3, 45);
    const windowStart = new Date(Date.now() + daysOut * 86400000);
    const windowEnd = new Date(windowStart.getTime() + 2 * 86400000);

    fleet.push({
      tail,
      platform: platformGroup.platform,
      squadron,
      totalCycles,
      healthScore: health,
      status,
      availability: status === "critical" ? "grounded" : status === "monitor" && rng.bool(0.25) ? "scheduled-maintenance" : "available",
      systems,
      nextMaintenanceWindow: {
        start: windowStart.toISOString(),
        end: windowEnd.toISOString(),
        daysOut,
      },
    });
  }
  return fleet;
}

export const FLEET: Aircraft[] = generateFleet();

export function getAircraft(tail: string): Aircraft | undefined {
  return FLEET.find((a) => a.tail === tail);
}

export function getAllComponents(): { aircraft: Aircraft; component: Component; system: AircraftSystem }[] {
  return FLEET.flatMap((aircraft) =>
    aircraft.systems.flatMap((system) => system.components.map((component) => ({ aircraft, component, system })))
  );
}
