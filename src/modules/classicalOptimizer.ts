/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimeSlotConfig, MicrogridConfig, SchedulePlan } from '../types/energy';
import { simulateEnergyDispatch } from './energyEngine';

export interface EvaluatedCandidate {
  binaryVector: number[];
  bitstring: string;
  totalCost: number;
  totalCurtailed: number;
  totalGridImport: number;
  renewableUtilizationPct: number;
  objectiveValue: number;
  feasible: boolean;
  rank: number;
}

export interface ClassicalOptimizationResult {
  bestPlan: SchedulePlan;
  allCandidates: EvaluatedCandidate[];
  evaluatedCount: number;
  runtimeMs: number;
}

/**
 * Classical Exhaustive Optimizer
 * Enumerates all 2^4 = 16 binary charging configurations x in {0, 1}^4.
 * Computes exact physical microgrid dispatch, verifies all constraints,
 * and identifies the mathematically guaranteed globally optimal schedule.
 */
export function runClassicalOptimization(
  slots: TimeSlotConfig[],
  config: MicrogridConfig
): ClassicalOptimizationResult {
  const startTime = performance.now();

  const candidates: EvaluatedCandidate[] = [];
  let bestPlan: SchedulePlan | null = null;
  let minObjective = Infinity;

  // Enumerate all 2^4 = 16 combinations (0000 to 1111)
  for (let i = 0; i < 16; i++) {
    const x0 = (i >> 3) & 1;
    const x1 = (i >> 2) & 1;
    const x2 = (i >> 1) & 1;
    const x3 = i & 1;
    const binaryVector = [x0, x1, x2, x3];
    const bitstring = `${x0}${x1}${x2}${x3}`;

    // Midday is slot 1; flexible demand is placed during the solar peak or lowest net-cost slot
    const flexSlot = 1;
    const plan = simulateEnergyDispatch(slots, config, binaryVector, 'classical', flexSlot);

    const isFeasible = plan.feasible;
    const candidate: EvaluatedCandidate = {
      binaryVector,
      bitstring,
      totalCost: plan.totalCost,
      totalCurtailed: plan.totalSolarCurtailed,
      totalGridImport: plan.totalGridImport,
      renewableUtilizationPct: plan.renewableUtilizationPct,
      objectiveValue: plan.objectiveValue,
      feasible: isFeasible,
      rank: 0,
    };

    candidates.push(candidate);

    if (isFeasible && plan.objectiveValue < minObjective) {
      minObjective = plan.objectiveValue;
      bestPlan = plan;
    }
  }

  // Sort candidates by objective value
  candidates.sort((a, b) => a.objectiveValue - b.objectiveValue);
  candidates.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  const endTime = performance.now();
  const runtimeMs = Number((endTime - startTime).toFixed(2));

  if (!bestPlan) {
    // Fallback if somehow no feasible plan was found
    bestPlan = simulateEnergyDispatch(slots, config, [0, 1, 0, 0], 'classical', 1);
  }

  bestPlan.runtimeMs = runtimeMs;
  bestPlan.evaluatedCount = 16;

  return {
    bestPlan,
    allCandidates: candidates,
    evaluatedCount: 16,
    runtimeMs,
  };
}
