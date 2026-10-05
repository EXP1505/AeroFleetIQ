import { Rng, GLOBAL_SEED } from "./seed";
import type { Technician, Facility } from "../types";

const SPECIALTIES = ["Propulsion", "Avionics", "Hydraulics", "Airframe", "NDT Inspection", "Electrical"];
const FACILITIES_LIST = [
  { name: "Base Maintenance Hangar 1", location: "Ambala AFS" },
  { name: "Base Maintenance Hangar 2", location: "Jodhpur AFS" },
  { name: "Depot-Level Overhaul Facility", location: "Nashik ARDC" },
  { name: "Line Maintenance Bay", location: "Pune AFS" },
];

export function generateFacilities(): Facility[] {
  const rng = new Rng(GLOBAL_SEED + 303);
  return FACILITIES_LIST.map((f, i) => ({
    id: `fac-${i}`,
    name: f.name,
    location: f.location,
    capacity: rng.int(4, 10),
    utilization: Math.round(rng.range(0.4, 0.95) * 100) / 100,
  }));
}

export function generateTechnicians(): Technician[] {
  const rng = new Rng(GLOBAL_SEED + 404);
  const names = [
    "Flt Lt A. Rao", "Sqn Ldr B. Mehta", "Flt Lt C. Iyer", "WO D. Singh", "Sgt E. Kumar",
    "Flt Lt F. Nair", "Sqn Ldr G. Sharma", "WO H. Patel", "Sgt I. Verma", "Flt Lt J. Reddy",
    "WO K. Joshi", "Sgt L. Gupta",
  ];
  const facilities = generateFacilities();
  return names.map((name, i) => ({
    id: `tech-${i}`,
    name,
    specialty: rng.pick(SPECIALTIES),
    facility: rng.pick(facilities).name,
    available: rng.bool(0.7),
  }));
}

export const FACILITIES: Facility[] = generateFacilities();
export const TECHNICIANS: Technician[] = generateTechnicians();
