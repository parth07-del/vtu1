/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingDown,
  DollarSign,
  Sun,
  Zap,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { SchedulePlan, QAOASimulationResult } from '../types/energy';
import { useTheme } from '../context/ThemeContext';

interface ClassicalVsQAOAProps {
  baselinePlan: SchedulePlan;
  classicalPlan: SchedulePlan;
  qaoaPlan: SchedulePlan;
  qaoaResult: QAOASimulationResult;
}

export const ClassicalVsQAOA: React.FC<ClassicalVsQAOAProps> = ({
  baselinePlan,
  classicalPlan,
  qaoaPlan,
  qaoaResult,
}) => {
  const { isDark } = useTheme();

  // Safe percentage savings helper
  const calcSavings = (base: number, opt: number) => {
    if (base <= 0) return 0;
    return Math.max(0, ((base - opt) / base) * 100);
  };

  const classicalSavings = calcSavings(baselinePlan.totalCost, classicalPlan.totalCost);
  const qaoaSavings = calcSavings(baselinePlan.totalCost, qaoaPlan.totalCost);

  const costGap = qaoaPlan.totalCost - classicalPlan.totalCost;
  const approximationRatio =
    qaoaPlan.totalCost > 0
      ? Number((classicalPlan.totalCost / qaoaPlan.totalCost).toFixed(3))
      : 1.0;

  // Combined Multi-Metric Comparison Chart
  const multiMetricData = [
    {
      name: 'Electricity Cost (₹)',
      Baseline: baselinePlan.totalCost,
      Classical: classicalPlan.totalCost,
      'QAOA Quantum': qaoaPlan.totalCost,
    },
    {
      name: 'Curtailed Solar (kWh)',
      Baseline: baselinePlan.totalSolarCurtailed,
      Classical: classicalPlan.totalSolarCurtailed,
      'QAOA Quantum': qaoaPlan.totalSolarCurtailed,
    },
    {
      name: 'Grid Import (kWh)',
      Baseline: baselinePlan.totalGridImport,
      Classical: classicalPlan.totalGridImport,
      'QAOA Quantum': qaoaPlan.totalGridImport,
    },
  ];

  const tooltipStyle = {
    backgroundColor: isDark ? '#071426' : '#ffffff',
    borderColor: isDark ? '#1e3a5f' : '#e2e8f0',
    borderRadius: '10px',
    fontSize: '12px',
    color: isDark ? '#ffffff' : '#0f172a',
    boxShadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  const axisStroke = isDark ? '#64748B' : '#94A3B8';
  const gridStroke = isDark ? 'rgba(30, 58, 95, 0.4)' : 'rgba(226, 232, 240, 0.8)';

  return (
    <div className="space-y-6">
      {/* Fair Benchmarking Rigor Banner */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex items-start gap-3 shadow-xs transition-colors">
        <Info className="w-5 h-5 text-sky-600 dark:text-[#35C9E7] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <div className="font-bold text-slate-900 dark:text-white mb-0.5">Academic Benchmarking Integrity</div>
          <p className="leading-relaxed">
            Both algorithms solve the identical microgrid constraints and tariff equations.
            For small problems (N = 4 qubits, 16 states), classical exhaustive enumeration is
            instantaneous and guaranteed optimal. QAOA is evaluated here as an algorithmic proof-of-concept
            for combinatorial scaling on future quantum hardware without fabricated speedups.
          </p>
        </div>
      </div>

      {/* Side-by-Side 3-Way KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline Card */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Baseline Reference</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Unoptimized
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-3 tabular-nums">
              ₹{baselinePlan.totalCost.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Original microgrid expenditure</div>

            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Solar Curtailed:</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{baselinePlan.totalSolarCurtailed.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Grid Import:</span>
                <span>{baselinePlan.totalGridImport.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Solar Utilization:</span>
                <span>{baselinePlan.renewableUtilizationPct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Decision Vector:</span>
                <span>[0, 0, 0, 0]</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#152a45] text-xs text-slate-500 dark:text-slate-400 font-mono">
            Status: Passive Operation
          </div>
        </div>

        {/* Classical Optimizer Card */}
        <div className="bg-emerald-50/40 dark:bg-[#10243A] border border-emerald-300 dark:border-[#35D07F]/40 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Classical Optimizer</span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-[#35D07F] bg-emerald-100/70 dark:bg-[#35D07F]/15 px-2 py-0.5 rounded border border-emerald-300 dark:border-[#35D07F]/30 font-bold">
                Global Minimum
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-[#35D07F] mt-3 tabular-nums">
              ₹{classicalPlan.totalCost.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-600 dark:text-[#35D07F] font-mono mt-0.5 font-semibold">
              Saved ₹{(baselinePlan.totalCost - classicalPlan.totalCost).toFixed(2)} ({classicalSavings.toFixed(1)}%)
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Solar Curtailed:</span>
                <span className="text-emerald-600 dark:text-[#35D07F] font-semibold">{classicalPlan.totalSolarCurtailed.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Grid Import:</span>
                <span>{classicalPlan.totalGridImport.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Solar Utilization:</span>
                <span className="text-emerald-600 dark:text-[#35D07F] font-semibold">{classicalPlan.renewableUtilizationPct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Decision Vector:</span>
                <span className="text-slate-900 dark:text-white font-bold">[{classicalPlan.binaryVector.join(', ')}]</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#152a45] text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
            <span>Evaluated: 16 states</span>
            <span className="text-emerald-600 dark:text-[#35D07F] font-semibold">{classicalPlan.runtimeMs} ms</span>
          </div>
        </div>

        {/* QAOA Quantum Optimizer Card */}
        <div className="bg-sky-50/40 dark:bg-[#10243A] border border-sky-300 dark:border-[#35C9E7]/40 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">QAOA Quantum Plan</span>
              <span className="text-[10px] font-mono text-sky-700 dark:text-[#35C9E7] bg-sky-100/70 dark:bg-[#35C9E7]/15 px-2 py-0.5 rounded border border-sky-300 dark:border-[#35C9E7]/30 font-bold">
                p = {qaoaResult.p} Sample
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-sky-600 dark:text-[#35C9E7] mt-3 tabular-nums">
              ₹{qaoaPlan.totalCost.toFixed(2)}
            </div>
            <div className="text-xs text-sky-600 dark:text-[#35C9E7] font-mono mt-0.5 font-semibold">
              Saved ₹{(baselinePlan.totalCost - qaoaPlan.totalCost).toFixed(2)} ({qaoaSavings.toFixed(1)}%)
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Solar Curtailed:</span>
                <span className="text-slate-700 dark:text-slate-200">{qaoaPlan.totalSolarCurtailed.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Grid Import:</span>
                <span>{qaoaPlan.totalGridImport.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Solar Utilization:</span>
                <span>{qaoaPlan.renewableUtilizationPct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Decision Vector:</span>
                <span className="text-slate-900 dark:text-white font-bold">[{qaoaPlan.binaryVector.join(', ')}]</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#152a45] text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
            <span>Approx Ratio: {approximationRatio}</span>
            <span className="text-sky-600 dark:text-[#35C9E7] font-semibold">{qaoaResult.runtimeMs} ms</span>
          </div>
        </div>
      </div>

      {/* Decision Vector Comparison Matrix */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Binary Charging Decisions Matrix (x_t ∈ {'{0, 1}'})</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Direct slot-by-slot comparison of battery charging designations
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-center">x₀ (Morning)</th>
                <th className="py-2.5 px-3 text-center">x₁ (Midday)</th>
                <th className="py-2.5 px-3 text-center">x₂ (Evening)</th>
                <th className="py-2.5 px-3 text-center">x₃ (Night)</th>
                <th className="py-2.5 px-3 text-right">Feasibility</th>
                <th className="py-2.5 px-3 text-right">Objective Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#152a45] font-mono">
              <tr className="hover:bg-slate-50 dark:hover:bg-[#0c1e33] transition-colors">
                <td className="py-3 px-3 font-sans font-semibold text-slate-700 dark:text-slate-300">Baseline</td>
                <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400">0 (Idle)</td>
                <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400">0 (Idle)</td>
                <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400">0 (Idle)</td>
                <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400">0 (Idle)</td>
                <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">Feasible</td>
                <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                  {baselinePlan.objectiveValue.toFixed(2)}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-[#0c1e33] transition-colors">
                <td className="py-3 px-3 font-sans font-semibold text-emerald-700 dark:text-[#35D07F]">Classical Global Optimum</td>
                <td className="py-3 px-3 text-center">
                  <span className={classicalPlan.binaryVector[0] === 1 ? 'text-emerald-600 dark:text-[#35D07F] font-bold' : 'text-slate-400'}>
                    {classicalPlan.binaryVector[0]} {classicalPlan.binaryVector[0] === 1 ? '(Charge)' : '(Idle)'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={classicalPlan.binaryVector[1] === 1 ? 'text-emerald-600 dark:text-[#35D07F] font-bold' : 'text-slate-400'}>
                    {classicalPlan.binaryVector[1]} {classicalPlan.binaryVector[1] === 1 ? '(Charge)' : '(Idle)'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={classicalPlan.binaryVector[2] === 1 ? 'text-emerald-600 dark:text-[#35D07F] font-bold' : 'text-slate-400'}>
                    {classicalPlan.binaryVector[2]} {classicalPlan.binaryVector[2] === 1 ? '(Charge)' : '(Idle)'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={classicalPlan.binaryVector[3] === 1 ? 'text-emerald-600 dark:text-[#35D07F] font-bold' : 'text-slate-400'}>
                    {classicalPlan.binaryVector[3]} {classicalPlan.binaryVector[3] === 1 ? '(Charge)' : '(Idle)'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-emerald-600 dark:text-[#35D07F] font-semibold">100% Feasible</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-[#35D07F]">
                  {classicalPlan.objectiveValue.toFixed(2)}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-[#0c1e33] transition-colors">
                <td className="py-3 px-3 font-sans font-semibold text-sky-700 dark:text-[#35C9E7]">QAOA Measured Bitstring</td>
                <td className="py-3 px-3 text-center">
                  <span className={qaoaPlan.binaryVector[0] === 1 ? 'text-sky-600 dark:text-[#35C9E7] font-bold' : 'text-slate-400'}>
                    {qaoaPlan.binaryVector[0]} {qaoaPlan.binaryVector[0] === 1 ? '(Charge)' : '(Idle)'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={qaoaPlan.binaryVector[1] === 1 ? 'text-sky-600 dark:text-[#35C9E7] font-bold' : 'text-slate-400'}>
                    {qaoaPlan.binaryVector[1]} {qaoaPlan.binaryVector[1] === 1 ? '(Charge)' : '(Idle)'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={qaoaPlan.binaryVector[2] === 1 ? 'text-sky-600 dark:text-[#35C9E7] font-bold' : 'text-slate-400'}>
                    {qaoaPlan.binaryVector[2]} {qaoaPlan.binaryVector[2] === 1 ? '(Charge)' : '(Idle)'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={qaoaPlan.binaryVector[3] === 1 ? 'text-sky-600 dark:text-[#35C9E7] font-bold' : 'text-slate-400'}>
                    {qaoaPlan.binaryVector[3]} {qaoaPlan.binaryVector[3] === 1 ? '(Charge)' : '(Idle)'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-sky-600 dark:text-[#35C9E7] font-semibold">
                  {qaoaPlan.feasible ? 'Feasible' : 'Repaired'}
                </td>
                <td className="py-3 px-3 text-right font-bold text-sky-600 dark:text-[#35C9E7]">
                  {qaoaPlan.objectiveValue.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Metric Comparison Chart */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Comparative Multi-Metric Performance</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Side-by-side comparison across operating cost, solar curtailment, and grid imports
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiMetricData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
              <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Baseline" fill={isDark ? '#64748B' : '#94A3B8'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Classical" fill={isDark ? '#35D07F' : '#16A34A'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="QAOA Quantum" fill={isDark ? '#35C9E7' : '#0284C7'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Automated Analytical Narrative */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Automated Engineering Synthesis & Comparison</h3>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            1. <strong>Cost Reduction:</strong> The classical exhaustive optimizer found the global
            minimum operating cost of <strong>₹{classicalPlan.totalCost.toFixed(2)}</strong>, reducing
            microgrid expenditure by <strong>{classicalSavings.toFixed(1)}%</strong> compared to the
            baseline (₹{baselinePlan.totalCost.toFixed(2)}).
          </p>
          <p>
            2. <strong>QAOA Performance:</strong> The QAOA algorithm with depth p = {qaoaResult.p} sampled
            the bitstring <strong>|{qaoaResult.bestFeasibleBitstring}⟩</strong>, resulting in an operating
            cost of <strong>₹{qaoaPlan.totalCost.toFixed(2)}</strong> with an approximation ratio of{' '}
            <strong>{approximationRatio}</strong>. {costGap === 0
              ? 'QAOA successfully located the identical global optimum ground state!'
              : `QAOA converged within ₹${costGap.toFixed(2)} of the global optimum, demonstrating typical approximate sampling behavior.`}
          </p>
          <p>
            3. <strong>Renewable Waste Mitigation:</strong> Solar curtailment was reduced from{' '}
            <strong>{baselinePlan.totalSolarCurtailed.toFixed(1)} kWh</strong> in baseline down to{' '}
            <strong>{classicalPlan.totalSolarCurtailed.toFixed(1)} kWh</strong> under optimization, directly
            channeling surplus clean solar energy into battery storage.
          </p>
          <p>
            4. <strong>Quantum Advantage Perspective:</strong> For small N = 4 problems (16 states),
            classical enumeration takes under 1 millisecond and is computationally superior. QAOA's
            value lies in research exploration for scaling up to hundreds of coupled microgrid nodes
            where 2ᴺ exceeds classical memory limits.
          </p>
        </div>
      </div>
    </div>
  );
};
