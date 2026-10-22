/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimeSlotConfig {
  id: number;
  name: string;
  timeRange: string;
  solarGen: number;       // kWh
  baseDemand: number;     // kWh
  gridPrice: number;      // ₹/kWh
  carbonIntensity: number; // kg CO₂/kWh
}

export interface MicrogridConfig {
  batteryCapacity: number;       // kWh (B_max)
  initialCharge: number;         // kWh (B_0)
  maxChargeRate: number;         // kWh per slot (P_ch_max)
  maxDischargeRate: number;      // kWh per slot (P_dis_max)
  chargeEfficiency: number;      // 0.0 - 1.0 (eta_ch)
  dischargeEfficiency: number;   // 0.0 - 1.0 (eta_dis)
  flexibleDemand: number;        // kWh to be scheduled
  flexibleDemandSlot: number;    // Slot index where flexible demand is placed (0-3)
  allowExport: boolean;          // If false, surplus is curtailed
  exportPrice: number;           // ₹/kWh if export allowed (usually lower than grid price)
  curtailmentPenaltyWeight: number; // Weight in objective (₹ equivalent penalty per kWh curtailed)
  batteryDegradationWeight: number; // ₹ per kWh cycled
}

export interface SlotDispatchResult {
  slotId: number;
  slotName: string;
  timeRange: string;
  solarGen: number;
  baseDemand: number;
  flexDemand: number;
  totalDemand: number;
  solarDirect: number;
  solarToBattery: number;
  solarCurtailed: number;
  solarExported: number;
  batteryCharge: number;
  batteryDischarge: number;
  batteryChargeFromGrid: number;
  batteryChargeFromSolar: number;
  gridImport: number;
  socStart: number;
  socEnd: number;
  electricityCost: number;       // ₹
  co2Emissions: number;          // kg CO₂
  recommendation: string;
}

export interface SchedulePlan {
  type: 'baseline' | 'classical' | 'qaoa';
  name: string;
  binaryVector: number[];         // [x0, x1, x2, x3]
  slots: SlotDispatchResult[];
  totalDemand: number;
  totalSolarGen: number;
  totalSolarDirect: number;
  totalSolarStored: number;
  totalSolarCurtailed: number;
  totalSolarExported: number;
  renewableUtilizationPct: number;
  totalGridImport: number;
  totalCost: number;             // ₹
  totalCO2: number;              // kg
  feasible: boolean;
  infeasibilityReasons: string[];
  runtimeMs: number;
  evaluatedCount: number;
  objectiveValue: number;
}

export interface Complex {
  re: number;
  im: number;
}

export interface QAOASimulationResult {
  qubits: number;
  p: number;
  gamma: number;
  beta: number;
  optimalGamma: number;
  optimalBeta: number;
  hamiltonianLinear: number[];   // h_i for Z_i
  hamiltonianCoupling: number[][]; // J_ij for Z_i Z_j
  offset: number;
  probabilities: {
    bitstring: string;
    binary: number[];
    probability: number;
    cost: number;
    feasible: boolean;
  }[];
  samples: {
    bitstring: string;
    count: number;
    frequency: number;
  }[];
  bestMeasuredBitstring: string;
  bestFeasibleBitstring: string;
  bestFeasibleCost: number;
  expectedCost: number;
  runtimeMs: number;
  seed: number;
  shots: number;
  optimizationLandscape: { gamma: number; beta: number; expectedCost: number }[];
}

export type ScenarioPresetId = 'sunny' | 'cloudy' | 'high_demand';

export interface PresetScenario {
  id: ScenarioPresetId;
  name: string;
  tagline: string;
  description: string;
  slots: TimeSlotConfig[];
  microgrid: Partial<MicrogridConfig>;
}
