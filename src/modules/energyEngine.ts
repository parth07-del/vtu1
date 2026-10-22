/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TimeSlotConfig,
  MicrogridConfig,
  SlotDispatchResult,
  SchedulePlan,
  PresetScenario,
} from '../types/energy';

export const DEFAULT_TIME_SLOTS: TimeSlotConfig[] = [
  {
    id: 0,
    name: 'Morning',
    timeRange: '06:00 – 09:00',
    solarGen: 8.0,
    baseDemand: 12.0,
    gridPrice: 6.5,
    carbonIntensity: 0.72,
  },
  {
    id: 1,
    name: 'Midday',
    timeRange: '11:00 – 14:00',
    solarGen: 30.0,
    baseDemand: 16.0,
    gridPrice: 4.5,
    carbonIntensity: 0.55,
  },
  {
    id: 2,
    name: 'Evening',
    timeRange: '17:00 – 20:00',
    solarGen: 4.0,
    baseDemand: 24.0,
    gridPrice: 12.0,
    carbonIntensity: 0.88,
  },
  {
    id: 3,
    name: 'Night',
    timeRange: '21:00 – 00:00',
    solarGen: 0.0,
    baseDemand: 10.0,
    gridPrice: 5.0,
    carbonIntensity: 0.78,
  },
];

export const DEFAULT_MICROGRID: MicrogridConfig = {
  batteryCapacity: 25.0,          // 25 kWh max storage
  initialCharge: 5.0,             // 5 kWh initially charged
  maxChargeRate: 10.0,            // 10 kWh maximum charge per 3-hr slot
  maxDischargeRate: 10.0,         // 10 kWh maximum discharge per slot
  chargeEfficiency: 0.92,         // 92% charging efficiency
  dischargeEfficiency: 0.92,      // 92% discharging efficiency
  flexibleDemand: 5.0,            // 5 kWh flexible shiftable demand (e.g. EV, water pump, lab load)
  flexibleDemandSlot: 1,          // Default shifted to midday (solar surplus) in optimal schedule
  allowExport: false,             // Default: surplus is curtailed unless grid export enabled
  exportPrice: 3.0,               // ₹3/kWh export feed-in tariff if enabled
  curtailmentPenaltyWeight: 2.0,  // ₹2 per kWh curtailed penalty in objective
  batteryDegradationWeight: 0.3,  // ₹0.30 per kWh throughput
};

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'sunny',
    name: 'Sunny Day',
    tagline: 'High Midday Solar Generation',
    description:
      'Clear skies produce a substantial midday solar surplus (34 kWh). The primary challenge is preventing renewable curtailment by absorbing surplus into the battery storage for evening peak shaving.',
    slots: [
      { id: 0, name: 'Morning', timeRange: '06:00 – 09:00', solarGen: 9.0, baseDemand: 12.0, gridPrice: 6.5, carbonIntensity: 0.70 },
      { id: 1, name: 'Midday', timeRange: '11:00 – 14:00', solarGen: 34.0, baseDemand: 16.0, gridPrice: 4.0, carbonIntensity: 0.50 },
      { id: 2, name: 'Evening', timeRange: '17:00 – 20:00', solarGen: 3.0, baseDemand: 22.0, gridPrice: 11.5, carbonIntensity: 0.85 },
      { id: 3, name: 'Night', timeRange: '21:00 – 00:00', solarGen: 0.0, baseDemand: 10.0, gridPrice: 5.0, carbonIntensity: 0.75 },
    ],
    microgrid: {
      batteryCapacity: 25.0,
      initialCharge: 5.0,
      flexibleDemand: 5.0,
    },
  },
  {
    id: 'cloudy',
    name: 'Cloudy Day',
    tagline: 'Low & Variable Solar Generation',
    description:
      'Dense cloud cover significantly curbs solar generation across all slots (peaking at only 9 kWh midday). The scheduler must conserve battery reserves and avoid grid-charging at high tariffs.',
    slots: [
      { id: 0, name: 'Morning', timeRange: '06:00 – 09:00', solarGen: 3.0, baseDemand: 13.0, gridPrice: 6.5, carbonIntensity: 0.75 },
      { id: 1, name: 'Midday', timeRange: '11:00 – 14:00', solarGen: 9.0, baseDemand: 15.0, gridPrice: 5.0, carbonIntensity: 0.65 },
      { id: 2, name: 'Evening', timeRange: '17:00 – 20:00', solarGen: 1.0, baseDemand: 20.0, gridPrice: 12.0, carbonIntensity: 0.88 },
      { id: 3, name: 'Night', timeRange: '21:00 – 00:00', solarGen: 0.0, baseDemand: 10.0, gridPrice: 5.0, carbonIntensity: 0.78 },
    ],
    microgrid: {
      batteryCapacity: 25.0,
      initialCharge: 7.0,
      flexibleDemand: 4.0,
    },
  },
  {
    id: 'high_demand',
    name: 'High Demand Day',
    tagline: 'Expensive Evening Peak Load',
    description:
      'Campus activities create heavy evening demand (30 kWh) combined with peak surge pricing (₹14.0/kWh). Battery pre-charging during low-tariff slots and maximum evening discharge yield massive savings.',
    slots: [
      { id: 0, name: 'Morning', timeRange: '06:00 – 09:00', solarGen: 7.0, baseDemand: 15.0, gridPrice: 7.0, carbonIntensity: 0.74 },
      { id: 1, name: 'Midday', timeRange: '11:00 – 14:00', solarGen: 26.0, baseDemand: 19.0, gridPrice: 4.5, carbonIntensity: 0.52 },
      { id: 2, name: 'Evening', timeRange: '17:00 – 20:00', solarGen: 2.0, baseDemand: 30.0, gridPrice: 14.0, carbonIntensity: 0.92 },
      { id: 3, name: 'Night', timeRange: '21:00 – 00:00', solarGen: 0.0, baseDemand: 14.0, gridPrice: 6.0, carbonIntensity: 0.80 },
    ],
    microgrid: {
      batteryCapacity: 25.0,
      initialCharge: 6.0,
      flexibleDemand: 6.0,
    },
  },
];

/**
 * Validates microgrid and time slot inputs.
 * Returns an error message if invalid, or null if valid.
 */
export function validateMicrogridInputs(
  slots: TimeSlotConfig[],
  config: MicrogridConfig
): string | null {
  if (config.batteryCapacity <= 0) {
    return 'Battery capacity must be greater than zero.';
  }
  if (config.initialCharge < 0 || config.initialCharge > config.batteryCapacity) {
    return `Initial battery charge (${config.initialCharge} kWh) cannot exceed capacity (${config.batteryCapacity} kWh) or be negative.`;
  }
  if (config.chargeEfficiency <= 0 || config.chargeEfficiency > 1) {
    return 'Charging efficiency must be between 0.01 and 1.0.';
  }
  if (config.dischargeEfficiency <= 0 || config.dischargeEfficiency > 1) {
    return 'Discharge efficiency must be between 0.01 and 1.0.';
  }
  if (config.maxChargeRate <= 0 || config.maxDischargeRate <= 0) {
    return 'Charge and discharge power limits must be greater than zero.';
  }
  if (config.flexibleDemand < 0) {
    return 'Flexible demand cannot be negative.';
  }

  for (const slot of slots) {
    if (slot.solarGen < 0) return `Slot "${slot.name}": Solar generation cannot be negative.`;
    if (slot.baseDemand < 0) return `Slot "${slot.name}": Base demand cannot be negative.`;
    if (slot.gridPrice < 0) return `Slot "${slot.name}": Grid price cannot be negative.`;
    if (slot.carbonIntensity < 0) return `Slot "${slot.name}": Carbon intensity cannot be negative.`;
  }

  return null;
}

/**
 * Simulates microgrid energy dispatch for a given binary charging vector [x0, x1, x2, x3].
 * x_t = 1 means the scheduler designates slot t for battery charging.
 * x_t = 0 means battery is not charged in slot t, and may discharge to shave demand if economic.
 */
export function simulateEnergyDispatch(
  slots: TimeSlotConfig[],
  config: MicrogridConfig,
  binaryVector: number[], // [x0, x1, x2, x3]
  planType: 'baseline' | 'classical' | 'qaoa',
  flexSlotOverride?: number
): SchedulePlan {
  const flexSlot = flexSlotOverride !== undefined ? flexSlotOverride : config.flexibleDemandSlot;
  let currentSoC = config.initialCharge;
  const dispatchSlots: SlotDispatchResult[] = [];
  const infeasibilityReasons: string[] = [];

  let totalDemand = 0;
  let totalSolarGen = 0;
  let totalSolarDirect = 0;
  let totalSolarStored = 0;
  let totalSolarCurtailed = 0;
  let totalSolarExported = 0;
  let totalGridImport = 0;
  let totalCost = 0;
  let totalCO2 = 0;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const isChargingDecision = binaryVector[i] === 1;
    const socStart = currentSoC;

    // Flexible demand allocated to this slot
    const slotFlexDemand = i === flexSlot ? config.flexibleDemand : 0;
    const slotTotalDemand = slot.baseDemand + slotFlexDemand;
    totalDemand += slotTotalDemand;
    totalSolarGen += slot.solarGen;

    // 1. Direct solar self-consumption (no battery loss)
    const solarDirect = Math.min(slot.solarGen, slotTotalDemand);
    totalSolarDirect += solarDirect;

    const remainingSolar = Math.max(0, slot.solarGen - solarDirect);
    const remainingDemand = Math.max(0, slotTotalDemand - solarDirect);

    let batteryCharge = 0;
    let batteryDischarge = 0;
    let solarToBattery = 0;
    let batteryChargeFromGrid = 0;
    let solarCurtailed = 0;
    let solarExported = 0;
    let gridImport = 0;
    let recommendation = '';

    if (isChargingDecision) {
      // CHARGING MODE
      // Available room in the battery (accounting for charging efficiency)
      const roomInBattery = Math.max(0, (config.batteryCapacity - currentSoC) / config.chargeEfficiency);
      const desiredCharge = Math.min(config.maxChargeRate, roomInBattery);

      if (remainingSolar > 0) {
        // Charge from surplus solar first
        solarToBattery = Math.min(desiredCharge, remainingSolar);
        batteryCharge += solarToBattery;
        totalSolarStored += solarToBattery;

        const leftoverSurplus = remainingSolar - solarToBattery;
        if (config.allowExport) {
          solarExported = leftoverSurplus;
          totalSolarExported += solarExported;
        } else {
          solarCurtailed = leftoverSurplus;
          totalSolarCurtailed += solarCurtailed;
        }
      }

      // If surplus solar did not fill desired charge and grid price is very low or forced
      const remainingChargeNeeded = desiredCharge - solarToBattery;
      // In baseline or when grid is cheaper than evening price
      if (remainingChargeNeeded > 0 && (slot.gridPrice <= 5.0 || planType === 'baseline')) {
        batteryChargeFromGrid = remainingChargeNeeded;
        batteryCharge += batteryChargeFromGrid;
      }

      // Update battery SoC
      const addedEnergy = batteryCharge * config.chargeEfficiency;
      currentSoC = Math.min(config.batteryCapacity, currentSoC + addedEnergy);

      // Remaining demand must be met by grid import + any grid charge
      gridImport = remainingDemand + batteryChargeFromGrid;

      if (solarToBattery > 0 && solarCurtailed > 0) {
        recommendation = `Charged ${solarToBattery.toFixed(1)} kWh from solar surplus; ${solarCurtailed.toFixed(1)} kWh curtailed as battery hit capacity limit.`;
      } else if (solarToBattery > 0) {
        recommendation = `Absorbed ${solarToBattery.toFixed(1)} kWh of clean solar into storage; zero solar waste.`;
      } else if (batteryChargeFromGrid > 0) {
        recommendation = `Off-peak grid charge of ${batteryChargeFromGrid.toFixed(1)} kWh at ₹${slot.gridPrice}/kWh to buffer upcoming expensive peak.`;
      } else {
        recommendation = `Battery full (${currentSoC.toFixed(1)} kWh); remaining solar surplus was curtailed.`;
      }
    } else {
      // DISCHARGING / IDLE MODE
      // Any surplus solar is either exported or curtailed
      if (remainingSolar > 0) {
        if (config.allowExport) {
          solarExported = remainingSolar;
          totalSolarExported += solarExported;
        } else {
          solarCurtailed = remainingSolar;
          totalSolarCurtailed += solarCurtailed;
        }
      }

      // If there is deficit demand and battery has charge, discharge!
      if (remainingDemand > 0 && currentSoC > 0 && (slot.gridPrice >= 6.0 || planType !== 'baseline')) {
        // Battery can deliver up to its max discharge rate and remaining charge
        const maxDelivery = Math.min(config.maxDischargeRate * config.dischargeEfficiency, currentSoC * config.dischargeEfficiency);
        const energySuppliedToDemand = Math.min(remainingDemand, maxDelivery);
        const rawDischarge = energySuppliedToDemand / config.dischargeEfficiency;

        batteryDischarge = rawDischarge;
        currentSoC = Math.max(0, currentSoC - rawDischarge);
        gridImport = Math.max(0, remainingDemand - energySuppliedToDemand);

        recommendation = `Discharged ${energySuppliedToDemand.toFixed(1)} kWh from battery to offset expensive peak grid electricity (tariff: ₹${slot.gridPrice}/kWh).`;
      } else {
        // No discharge; grid supplies remaining demand
        gridImport = remainingDemand;
        if (remainingSolar > 0) {
          recommendation = `Solar surplus (${remainingSolar.toFixed(1)} kWh) ${config.allowExport ? 'exported to grid' : 'curtailed due to non-export mode'}. Battery retained.`;
        } else if (gridImport > 0) {
          recommendation = `Supplying net demand of ${gridImport.toFixed(1)} kWh directly from grid at ₹${slot.gridPrice}/kWh.`;
        } else {
          recommendation = `Demand fully satisfied by on-site solar generation; grid import zero.`;
        }
      }
    }

    // Financial accounting
    const costForSlot = gridImport * slot.gridPrice - solarExported * config.exportPrice;
    totalCost += costForSlot;

    // Operational CO2 emissions
    const co2ForSlot = gridImport * slot.carbonIntensity;
    totalCO2 += co2ForSlot;
    totalGridImport += gridImport;

    dispatchSlots.push({
      slotId: slot.id,
      slotName: slot.name,
      timeRange: slot.timeRange,
      solarGen: slot.solarGen,
      baseDemand: slot.baseDemand,
      flexDemand: slotFlexDemand,
      totalDemand: slotTotalDemand,
      solarDirect: Number(solarDirect.toFixed(2)),
      solarToBattery: Number(solarToBattery.toFixed(2)),
      solarCurtailed: Number(solarCurtailed.toFixed(2)),
      solarExported: Number(solarExported.toFixed(2)),
      batteryCharge: Number(batteryCharge.toFixed(2)),
      batteryDischarge: Number(batteryDischarge.toFixed(2)),
      batteryChargeFromGrid: Number(batteryChargeFromGrid.toFixed(2)),
      batteryChargeFromSolar: Number(solarToBattery.toFixed(2)),
      gridImport: Number(gridImport.toFixed(2)),
      socStart: Number(socStart.toFixed(2)),
      socEnd: Number(currentSoC.toFixed(2)),
      electricityCost: Number(costForSlot.toFixed(2)),
      co2Emissions: Number(co2ForSlot.toFixed(2)),
      recommendation,
    });
  }

  // Renewable utilization percentage
  // Avoid division by zero if totalSolarGen is 0
  const renewableUtilizationPct =
    totalSolarGen > 0
      ? Math.min(100, Math.max(0, ((totalSolarDirect + totalSolarStored) / totalSolarGen) * 100))
      : 0;

  // Objective Value = Cost + Curtailment Penalty + Battery Degradation
  const objectiveValue =
    totalCost +
    totalSolarCurtailed * config.curtailmentPenaltyWeight +
    (totalSolarStored + totalGridImport * 0.05) * config.batteryDegradationWeight;

  const feasible = infeasibilityReasons.length === 0;

  return {
    type: planType,
    name:
      planType === 'baseline'
        ? 'Baseline Schedule (Unoptimized)'
        : planType === 'classical'
        ? 'Classical Optimization (Exhaustive Ground Truth)'
        : 'QAOA Quantum Schedule',
    binaryVector,
    slots: dispatchSlots,
    totalDemand: Number(totalDemand.toFixed(2)),
    totalSolarGen: Number(totalSolarGen.toFixed(2)),
    totalSolarDirect: Number(totalSolarDirect.toFixed(2)),
    totalSolarStored: Number(totalSolarStored.toFixed(2)),
    totalSolarCurtailed: Number(totalSolarCurtailed.toFixed(2)),
    totalSolarExported: Number(totalSolarExported.toFixed(2)),
    renewableUtilizationPct: Number(renewableUtilizationPct.toFixed(1)),
    totalGridImport: Number(totalGridImport.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    totalCO2: Number(totalCO2.toFixed(2)),
    feasible,
    infeasibilityReasons,
    runtimeMs: 0,
    evaluatedCount: 1,
    objectiveValue: Number(objectiveValue.toFixed(2)),
  };
}

/**
 * Builds the unoptimized baseline schedule.
 * In baseline operation:
 * - No active battery scheduling (vector [0, 0, 0, 0]).
 * - Flexible demand runs in the evening slot (slot 2) coincident with campus peak hours.
 * - Battery remains largely dormant or unoptimized, surplus solar is curtailed.
 */
export function buildBaselineSchedule(
  slots: TimeSlotConfig[],
  config: MicrogridConfig
): SchedulePlan {
  const startTime = performance.now();
  // In baseline, flexible load is unscheduled, happening during evening peak (slot 2)
  const baselineFlexSlot = 2;
  const plan = simulateEnergyDispatch(slots, config, [0, 0, 0, 0], 'baseline', baselineFlexSlot);
  plan.runtimeMs = Number((performance.now() - startTime).toFixed(2));
  plan.name = 'Baseline Operation (Unoptimized)';
  return plan;
}
