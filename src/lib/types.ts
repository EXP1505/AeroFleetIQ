export type HealthStatus = "healthy" | "monitor" | "critical";

export type PlatformClass = "Strike Fighter" | "Heavy Transport" | "Rotary Wing";

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  stock: number;
  minStock: number;
  leadTimeDays: number;
  location: "Base Store" | "Regional Depot" | "OEM Depot";
  repairStatus: "available" | "in-repair" | "awaiting-overhaul" | "depleted";
  unitCost: number;
}

export interface SensorPoint {
  t: number; // cycle index
  value: number;
  anomaly: boolean;
}

export interface SensorChannel {
  key: "vibration" | "egt" | "oilPressure" | "temperature";
  label: string;
  unit: string;
  series: SensorPoint[];
  normalRange: [number, number];
}

export interface RulPoint {
  cycle: number;
  rul: number;
  lower: number;
  upper: number;
}

export interface ContributingFeature {
  feature: string;
  contribution: number; // 0-100 relative weight
}

export interface MaintenanceEvent {
  id: string;
  date: string;
  type: "Inspection" | "Replacement" | "Repair" | "Scheduled Check";
  componentId: string;
  description: string;
  outcome?: string;
}

export interface Component {
  id: string;
  name: string;
  systemId: string;
  healthScore: number; // 0-100
  status: HealthStatus;
  failureRisk: number; // 0-1
  degradationTrend: "stable" | "rising" | "falling";
  rul: {
    cycles: number;
    lower: number;
    upper: number;
  };
  criticality: "low" | "medium" | "high";
  partId: string;
  sensors: SensorChannel[];
  rulHistory: RulPoint[];
  contributingFeatures: ContributingFeature[];
  reason: string;
  maintenanceHistory: MaintenanceEvent[];
}

export interface AircraftSystem {
  id: string;
  name: string;
  components: Component[];
}

export interface Aircraft {
  tail: string;
  platform: PlatformClass;
  squadron: string;
  totalCycles: number;
  healthScore: number;
  status: HealthStatus;
  availability: "available" | "scheduled-maintenance" | "grounded";
  systems: AircraftSystem[];
  nextMaintenanceWindow: {
    start: string;
    end: string;
    daysOut: number;
  };
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  facility: string;
  available: boolean;
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  capacity: number;
  utilization: number;
}

export type RecommendationAction = "Inspect" | "Monitor" | "Replace";
export type RecommendationPriority = "low" | "medium" | "high" | "critical";
export type RecommendationState = "pending" | "approved" | "deferred" | "overridden";

export interface Recommendation {
  id: string;
  tail: string;
  componentId: string;
  componentName: string;
  action: RecommendationAction;
  priority: RecommendationPriority;
  window: { start: string; end: string };
  resources: string[];
  confidence: number; // 0-1
  state: RecommendationState;
  rationale: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  recommendationId: string;
  tail: string;
  action: "approved" | "deferred" | "overridden";
  actor: string;
  note?: string;
}

export interface FeedbackEntry {
  id: string;
  tail: string;
  componentId: string;
  componentName: string;
  predictedDate: string;
  predictedFinding: string;
  actualDate: string;
  actualFinding: string;
  match: "confirmed" | "partial" | "false-alarm";
  rulErrorCycles: number;
}

export interface AvailabilityPoint {
  day: number;
  date: string;
  availability: number;
  projected?: boolean;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  availabilityImpact: AvailabilityPoint[];
  riskDelta: number;
  resourceUse: string;
  cost: "low" | "medium" | "high";
}
