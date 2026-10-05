import { Rng, GLOBAL_SEED } from "./seed";
import { getAllComponents } from "./aircraft";
import type { Part } from "../types";

const LOCATIONS: Part["location"][] = ["Base Store", "Regional Depot", "OEM Depot"];

function uniqueByPartNumber<T extends { partNumber: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!seen.has(item.partNumber)) {
      seen.add(item.partNumber);
      out.push(item);
    }
  }
  return out;
}

export function generateSpares(): Part[] {
  const rng = new Rng(GLOBAL_SEED + 777);
  const components = getAllComponents();

  const parts: Part[] = components.map(({ component }) => {
    const isHeroPart = component.name === "Gearbox Bearing";
    const lowStock = isHeroPart || rng.bool(0.18);
    const stock = lowStock ? rng.int(0, 1) : rng.int(2, 14);
    const location = isHeroPart ? "OEM Depot" : rng.pick(LOCATIONS);
    const leadTime = isHeroPart ? 21 : location === "Base Store" ? rng.int(1, 4) : location === "Regional Depot" ? rng.int(5, 12) : rng.int(14, 30);

    return {
      id: `part-${component.partId}`,
      name: component.name,
      partNumber: component.partId,
      stock,
      minStock: component.criticality === "high" ? 3 : 2,
      leadTimeDays: leadTime,
      location,
      repairStatus: stock === 0 ? rng.pick(["in-repair", "awaiting-overhaul", "depleted"] as const) : "available",
      unitCost: rng.int(1200, 85000),
    };
  });

  return uniqueByPartNumber(parts);
}

export const SPARES: Part[] = generateSpares();

export function getPartByNumber(partNumber: string): Part | undefined {
  return SPARES.find((p) => p.partNumber === partNumber);
}
