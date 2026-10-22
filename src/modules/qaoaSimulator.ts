/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Complex,
  MicrogridConfig,
  QAOASimulationResult,
  TimeSlotConfig,
} from '../types/energy';
import { simulateEnergyDispatch } from './energyEngine';

/** Complex arithmetic helpers */
export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function cMult(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function cExp(theta: number): Complex {
  return { re: Math.cos(theta), im: Math.sin(theta) };
}

/** Linear congruential generator for reproducible pseudo-random sampling */
export function createRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function next(): number {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface QUBOModel {
  linearCosts: number[];         // c_i
  quadraticMatrix: number[][];   // Q_ij
  isingOffset: number;
  isingLinear: number[];         // h_i
  isingCoupling: number[][];     // J_ij
  costsTable: number[];          // 16 cost values for bitstrings 0000 to 1111
  normalizedCosts: number[];     // Shifted/scaled for numerical stability
}

/**
 * Derives QUBO & Ising Hamiltonian directly from scenario energy parameters.
 * Binary variables:
 * x0 = morning charging
 * x1 = midday charging
 * x2 = evening charging
 * x3 = night charging
 */
export function buildQUBOFromScenario(
  slots: TimeSlotConfig[],
  config: MicrogridConfig
): QUBOModel {
  const linearCosts = [0, 0, 0, 0];
  const quadraticMatrix = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  // 1. Slot-specific linear costs derived from tariff & surplus
  for (let i = 0; i < 4; i++) {
    const slot = slots[i];
    const surplus = Math.max(0, slot.solarGen - slot.baseDemand);
    if (surplus > 4.0) {
      // Large surplus: strong incentive to charge (negative cost)
      linearCosts[i] -= surplus * config.curtailmentPenaltyWeight * 1.5;
    } else {
      // Little or no surplus: charging requires grid import at tariff
      linearCosts[i] += slot.gridPrice * 3.0;
    }

    // Heavy penalty for charging during evening peak (slot 2)
    if (i === 2) {
      linearCosts[i] += 25.0;
    }
  }

  // 2. Quadratic coupling: overfill penalty if multiple slots charge simultaneously
  // Battery capacity typically allows 1 or 2 slots of charging.
  // Penalty for over-charging: lambda * (x0 + x1 + x2 + x3 - 2)^2
  const penaltyWeight = 12.0;
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      quadraticMatrix[i][j] += penaltyWeight * 1.8;
    }
  }

  // Compute exact cost for all 16 bitstrings using both QUBO and microgrid simulation
  const costsTable: number[] = new Array(16);
  for (let k = 0; k < 16; k++) {
    const x0 = (k >> 3) & 1;
    const x1 = (k >> 2) & 1;
    const x2 = (k >> 1) & 1;
    const x3 = k & 1;
    const vec = [x0, x1, x2, x3];

    // Energy simulation objective
    const plan = simulateEnergyDispatch(slots, config, vec, 'classical', 1);
    costsTable[k] = plan.objectiveValue;
  }

  // Convert cost table to Ising Hamiltonian coefficients via Walsh-Hadamard transform
  // C(x) = offset + sum_i h_i Z_i + sum_{i<j} J_ij Z_i Z_j
  // where Z_i in {-1, +1}, with |0> -> +1 and |1> -> -1 (x_i = (1 - z_i) / 2)
  let isingOffset = 0;
  for (let k = 0; k < 16; k++) {
    isingOffset += costsTable[k];
  }
  isingOffset /= 16;

  const isingLinear = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    let sum = 0;
    for (let k = 0; k < 16; k++) {
      const bit_i = (k >> (3 - i)) & 1;
      const z_i = bit_i === 0 ? 1 : -1;
      sum += z_i * costsTable[k];
    }
    isingLinear[i] = Number((sum / 16).toFixed(3));
  }

  const isingCoupling: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 16; k++) {
        const bit_i = (k >> (3 - i)) & 1;
        const bit_j = (k >> (3 - j)) & 1;
        const z_i = bit_i === 0 ? 1 : -1;
        const z_j = bit_j === 0 ? 1 : -1;
        sum += z_i * z_j * costsTable[k];
      }
      isingCoupling[i][j] = Number((sum / 16).toFixed(3));
    }
  }

  // Normalize costs to [0, 10] range for stable quantum phase angles
  const minC = Math.min(...costsTable);
  const maxC = Math.max(...costsTable);
  const span = maxC - minC > 0 ? maxC - minC : 1;
  const normalizedCosts = costsTable.map((c) => ((c - minC) / span) * 10);

  return {
    linearCosts,
    quadraticMatrix,
    isingOffset: Number(isingOffset.toFixed(2)),
    isingLinear,
    isingCoupling,
    costsTable,
    normalizedCosts,
  };
}

/**
 * Simulates the QAOA quantum state vector for 4 qubits:
 * 1. Hadamard initialization: |+>^{\otimes 4}
 * 2. Alternating layers (depth p):
 *    - Cost unitary: U(C, gamma) = exp(-i * gamma * H_C)
 *    - Mixer unitary: U(B, beta) = exp(-i * beta * \sum X_i)
 * Returns the 16 complex amplitudes.
 */
export function simulateQAOAStateVector(
  costs: number[],
  gamma: number,
  beta: number,
  p: number = 1
): Complex[] {
  // 1. Initial uniform superposition |+>^{\otimes 4}
  const amp0 = 1.0 / Math.sqrt(16);
  let state: Complex[] = new Array(16).fill(null).map(() => ({ re: amp0, im: 0 }));

  // Repeat for depth p
  for (let layer = 0; layer < p; layer++) {
    // 2. Cost Unitary: |k> -> exp(-i * gamma * C(k)) |k>
    for (let k = 0; k < 16; k++) {
      const angle = -gamma * costs[k];
      const phase = cExp(angle);
      state[k] = cMult(state[k], phase);
    }

    // 3. Mixer Unitary: exp(-i * beta * X_j) applied across each qubit j in {0, 1, 2, 3}
    // Single-qubit matrix:
    // [ cos(beta)    -i*sin(beta) ]
    // [ -i*sin(beta)  cos(beta)   ]
    const cosB = Math.cos(beta);
    const sinB = Math.sin(beta);

    for (let qubit = 0; qubit < 4; qubit++) {
      const bitMask = 1 << (3 - qubit);
      const newState: Complex[] = [...state];

      for (let k = 0; k < 16; k++) {
        if ((k & bitMask) === 0) {
          // k has 0 at this bit, k1 has 1 at this bit
          const k0 = k;
          const k1 = k | bitMask;

          const s0 = state[k0];
          const s1 = state[k1];

          // newState[k0] = cos(beta)*s0 - i*sin(beta)*s1
          newState[k0] = {
            re: cosB * s0.re + sinB * s1.im,
            im: cosB * s0.im - sinB * s1.re,
          };

          // newState[k1] = -i*sin(beta)*s0 + cos(beta)*s1
          newState[k1] = {
            re: sinB * s0.im + cosB * s1.re,
            im: -sinB * s0.re + cosB * s1.im,
          };
        }
      }
      state = newState;
    }
  }

  return state;
}

/**
 * Calculates measurement probability distribution P(x) = |psi(x)|^2
 */
export function calculateProbabilities(state: Complex[]): number[] {
  return state.map((c) => c.re * c.re + c.im * c.im);
}

/**
 * Calculates expected cost <H_C> = \sum P(k) * C(k)
 */
export function calculateExpectation(probabilities: number[], costs: number[]): number {
  return probabilities.reduce((acc, p, i) => acc + p * costs[i], 0);
}

/**
 * Runs parameter optimization (classical variational loop) to find
 * the optimal (gamma, beta) that minimizes expected cost.
 */
export function optimizeParameters(
  costs: number[],
  p: number = 1
): {
  optimalGamma: number;
  optimalBeta: number;
  minExpectedCost: number;
  landscape: { gamma: number; beta: number; expectedCost: number }[];
} {
  let bestGamma = 0.8;
  let bestBeta = 0.5;
  let minCost = Infinity;
  const landscape: { gamma: number; beta: number; expectedCost: number }[] = [];

  // Discrete grid sweep over gamma in [0.1, 2.0], beta in [0.1, 1.5]
  const gammaSteps = 12;
  const betaSteps = 12;

  for (let gIdx = 0; gIdx < gammaSteps; gIdx++) {
    const g = 0.1 + (gIdx / (gammaSteps - 1)) * 1.9;
    for (let bIdx = 0; bIdx < betaSteps; bIdx++) {
      const b = 0.1 + (bIdx / (betaSteps - 1)) * 1.4;

      const state = simulateQAOAStateVector(costs, g, b, p);
      const probs = calculateProbabilities(state);
      const expected = calculateExpectation(probs, costs);

      landscape.push({
        gamma: Number(g.toFixed(2)),
        beta: Number(b.toFixed(2)),
        expectedCost: Number(expected.toFixed(2)),
      });

      if (expected < minCost) {
        minCost = expected;
        bestGamma = g;
        bestBeta = b;
      }
    }
  }

  return {
    optimalGamma: Number(bestGamma.toFixed(2)),
    optimalBeta: Number(bestBeta.toFixed(2)),
    minExpectedCost: Number(minCost.toFixed(2)),
    landscape,
  };
}

/**
 * Simulates finite measurement sampling (shots) from probability distribution.
 */
export function sampleMeasurements(
  probabilities: number[],
  shots: number = 1024,
  seed: number = 42
): { bitstring: string; count: number; frequency: number }[] {
  const rng = createRNG(seed);
  const counts = new Array(16).fill(0);

  // Compute CDF
  const cdf: number[] = [];
  let cum = 0;
  for (let i = 0; i < 16; i++) {
    cum += probabilities[i];
    cdf.push(cum);
  }

  for (let s = 0; s < shots; s++) {
    const r = rng();
    let selected = 15;
    for (let i = 0; i < 16; i++) {
      if (r <= cdf[i]) {
        selected = i;
        break;
      }
    }
    counts[selected]++;
  }

  const results = counts.map((count, idx) => {
    const bitstring = idx.toString(2).padStart(4, '0');
    return {
      bitstring,
      count,
      frequency: Number((count / shots).toFixed(4)),
    };
  });

  // Sort by count descending
  return results.sort((a, b) => b.count - a.count);
}

/**
 * Master QAOA Simulation Execution
 */
export function runQAOASimulation(
  slots: TimeSlotConfig[],
  config: MicrogridConfig,
  params?: {
    gamma?: number;
    beta?: number;
    p?: number;
    shots?: number;
    seed?: number;
    autoOptimize?: boolean;
  }
): QAOASimulationResult {
  const startTime = performance.now();

  const qubo = buildQUBOFromScenario(slots, config);
  const p = params?.p ?? 1;
  const shots = params?.shots ?? 1024;
  const seed = params?.seed ?? 42;

  // Run classical optimization loop for gamma and beta
  const opt = optimizeParameters(qubo.normalizedCosts, p);
  const gamma = params?.autoOptimize === false && params?.gamma !== undefined ? params.gamma : opt.optimalGamma;
  const beta = params?.autoOptimize === false && params?.beta !== undefined ? params.beta : opt.optimalBeta;

  // State-vector simulation with chosen parameters
  const stateVector = simulateQAOAStateVector(qubo.normalizedCosts, gamma, beta, p);
  const rawProbabilities = calculateProbabilities(stateVector);

  // Compile detailed probability and cost table
  const probabilities = rawProbabilities.map((prob, idx) => {
    const bitstring = idx.toString(2).padStart(4, '0');
    const x0 = (idx >> 3) & 1;
    const x1 = (idx >> 2) & 1;
    const x2 = (idx >> 1) & 1;
    const x3 = idx & 1;
    const binary = [x0, x1, x2, x3];
    const cost = qubo.costsTable[idx];

    // Check feasibility in microgrid
    const plan = simulateEnergyDispatch(slots, config, binary, 'qaoa', 1);

    return {
      bitstring,
      binary,
      probability: Number(prob.toFixed(4)),
      cost: Number(cost.toFixed(2)),
      feasible: plan.feasible,
    };
  });

  // Measurement sampling
  const samples = sampleMeasurements(rawProbabilities, shots, seed);
  const bestMeasuredBitstring = samples[0]?.bitstring || '0100';

  // Find best feasible bitstring among sampled
  let bestFeasibleBitstring = bestMeasuredBitstring;
  let bestFeasibleCost = Infinity;

  for (const sample of samples) {
    const idx = parseInt(sample.bitstring, 2);
    const probItem = probabilities[idx];
    if (probItem.feasible && probItem.cost < bestFeasibleCost) {
      bestFeasibleCost = probItem.cost;
      bestFeasibleBitstring = sample.bitstring;
    }
  }

  const expectedCost = calculateExpectation(rawProbabilities, qubo.costsTable);
  const endTime = performance.now();

  return {
    qubits: 4,
    p,
    gamma,
    beta,
    optimalGamma: opt.optimalGamma,
    optimalBeta: opt.optimalBeta,
    hamiltonianLinear: qubo.isingLinear,
    hamiltonianCoupling: qubo.isingCoupling,
    offset: qubo.isingOffset,
    probabilities,
    samples,
    bestMeasuredBitstring,
    bestFeasibleBitstring,
    bestFeasibleCost: Number(bestFeasibleCost.toFixed(2)),
    expectedCost: Number(expectedCost.toFixed(2)),
    runtimeMs: Number((endTime - startTime).toFixed(2)),
    seed,
    shots,
    optimizationLandscape: opt.landscape,
  };
}
