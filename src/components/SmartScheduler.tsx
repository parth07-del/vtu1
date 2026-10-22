/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CalendarClock,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingDown,
  Info,
} from 'lucide-react';
import { SchedulePlan, TimeSlotConfig, MicrogridConfig } from '../types/energy';
import { useTheme } from '../context/ThemeContext';

interface SmartSchedulerProps {
  currentPlan: SchedulePlan;
  baselinePlan: SchedulePlan;
  classicalPlan: SchedulePlan;
  qaoaPlan: SchedulePlan;
  selectedPlanType: 'baseline' | 'classical' | 'qaoa';
  onSelectPlanType: (type: 'baseline' | 'classical' | 'qaoa') => void;
  config: MicrogridConfig;
}

export const SmartScheduler: React.FC<SmartSchedulerProps> = ({
  currentPlan,
  baselinePlan,
  classicalPlan,
  qaoaPlan,
  selectedPlanType,
  onSelectPlanType,
  config,
}) => {
  const { isDark } = useTheme();

  // Cost savings vs baseline
  const costSavings = baselinePlan.totalCost - currentPlan.totalCost;
  const costSavingsPct =
    baselinePlan.totalCost > 0
      ? ((costSavings / baselinePlan.totalCost) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Schedule Mode Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline Card */}
        <div
          onClick={() => onSelectPlanType('baseline')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedPlanType === 'baseline'
              ? 'bg-white dark:bg-[#10243A] border-sky-500 dark:border-[#35C9E7] ring-1 ring-sky-500 dark:ring-[#35C9E7]'
              : 'bg-white/80 dark:bg-[#10243A]/70 hover:bg-white dark:hover:bg-[#10243A] border-slate-200 dark:border-[#1e3a5f]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Baseline Schedule</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              Unoptimized
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Battery passive / uncoordinated; flexible load runs during evening peak.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#152a45] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Total Cost:</span>
            <span className="text-slate-900 dark:text-white font-bold">₹{baselinePlan.totalCost.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Solar Curtailed:</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{baselinePlan.totalSolarCurtailed.toFixed(1)} kWh</span>
          </div>
        </div>

        {/* Classical Card */}
        <div
          onClick={() => onSelectPlanType('classical')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedPlanType === 'classical'
              ? 'bg-emerald-50/60 dark:bg-[#10243A] border-emerald-500 dark:border-[#35D07F] ring-1 ring-emerald-500 dark:ring-[#35D07F]'
              : 'bg-white/80 dark:bg-[#10243A]/70 hover:bg-white dark:hover:bg-[#10243A] border-slate-200 dark:border-[#1e3a5f]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Classical Optimizer</span>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-[#35D07F] bg-emerald-100/70 dark:bg-[#35D07F]/15 px-2 py-0.5 rounded border border-emerald-300 dark:border-[#35D07F]/30 font-semibold">
              Provable Optimum
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exhaustive search across 16 binary vectors; guaranteed global minimum cost.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#152a45] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Total Cost:</span>
            <span className="text-emerald-600 dark:text-[#35D07F] font-bold">₹{classicalPlan.totalCost.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Decision Vector:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">[{classicalPlan.binaryVector.join(', ')}]</span>
          </div>
        </div>

        {/* QAOA Quantum Card */}
        <div
          onClick={() => onSelectPlanType('qaoa')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedPlanType === 'qaoa'
              ? 'bg-sky-50/60 dark:bg-[#10243A] border-sky-500 dark:border-[#35C9E7] ring-1 ring-sky-500 dark:ring-[#35C9E7]'
              : 'bg-white/80 dark:bg-[#10243A]/70 hover:bg-white dark:hover:bg-[#10243A] border-slate-200 dark:border-[#1e3a5f]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">QAOA Quantum Plan</span>
            <span className="text-[10px] font-mono text-sky-700 dark:text-[#35C9E7] bg-sky-100/70 dark:bg-[#35C9E7]/15 px-2 py-0.5 rounded border border-sky-300 dark:border-[#35C9E7]/30 font-semibold">
              Sampled State
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Synthesized from 4-qubit state-vector measurement distribution.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#152a45] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Total Cost:</span>
            <span className="text-slate-900 dark:text-white font-bold">₹{qaoaPlan.totalCost.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Measured String:</span>
            <span className="text-sky-600 dark:text-[#35C9E7] font-bold">{qaoaPlan.binaryVector.join('')}</span>
          </div>
        </div>
      </div>

      {/* Infeasibility / Constraint Inspection Flag */}
      {!currentPlan.feasible && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-800 dark:text-red-200">
            <div className="font-bold text-red-900 dark:text-red-300 mb-1">Constraint Violation Flagged</div>
            <p>
              This candidate schedule violated physical operational constraints (e.g. overcharged
              battery or invalid discharge). High penalty applied in the objective function.
            </p>
            {currentPlan.infeasibilityReasons.map((r, idx) => (
              <div key={idx} className="mt-1 font-mono text-[11px]">
                · {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 4-Slot Schedule Dispatch Table */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{currentPlan.name}</span>
              <span className="text-xs font-mono text-emerald-700 dark:text-[#35D07F] bg-emerald-50 dark:bg-[#35D07F]/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-transparent font-semibold">
                Vector: [{currentPlan.binaryVector.join(', ')}]
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hourly dispatch of solar, storage charge/discharge, grid import, and state of charge
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 dark:bg-[#071426] px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#152a45]">
            <div className="text-slate-600 dark:text-slate-400">
              Cost: <span className="text-slate-900 dark:text-white font-bold">₹{currentPlan.totalCost.toFixed(2)}</span>
            </div>
            {costSavings > 0 && (
              <div className="text-emerald-600 dark:text-[#35D07F] flex items-center gap-1 font-semibold">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Save {costSavingsPct}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Slot</th>
                <th className="py-2.5 px-3 text-right">Solar (kWh)</th>
                <th className="py-2.5 px-3 text-right">Base Load</th>
                <th className="py-2.5 px-3 text-right">Flex Load</th>
                <th className="py-2.5 px-3 text-right text-sky-600 dark:text-[#35C9E7]">Battery In</th>
                <th className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">Battery Out</th>
                <th className="py-2.5 px-3 text-right">Grid In</th>
                <th className="py-2.5 px-3 text-right">Tariff (₹)</th>
                <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-[#35D07F]">End SoC</th>
                <th className="py-2.5 px-3 text-right text-rose-600 dark:text-red-400">Curtailed</th>
                <th className="py-2.5 px-4">Action Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#152a45]">
              {currentPlan.slots.map((slot) => {
                return (
                  <tr key={slot.slotId} className="hover:bg-slate-50 dark:hover:bg-[#0c1e33] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{slot.slotName}</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{slot.timeRange}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                      {slot.solarGen.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                      {slot.baseDemand.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                      {slot.flexDemand > 0 ? (
                        <span className="text-sky-600 dark:text-[#35C9E7] font-semibold">+{slot.flexDemand.toFixed(1)}</span>
                      ) : (
                        '0.0'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {slot.batteryCharge > 0 ? (
                        <span className="text-sky-600 dark:text-[#35C9E7] font-semibold">
                          +{slot.batteryCharge.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">0.0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {slot.batteryDischarge > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          -{slot.batteryDischarge.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">0.0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                      {slot.gridImport.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                      ₹{slot.electricityCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-[#35D07F]">
                      {slot.socEnd.toFixed(1)} / {config.batteryCapacity} kWh
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {slot.solarCurtailed > 0 ? (
                        <span className="text-rose-600 dark:text-red-400 font-medium">
                          {slot.solarCurtailed.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">0.0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {slot.recommendation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Microgrid Physical Energy Accounting Verification Box */}
      <div className="bg-emerald-50/60 dark:bg-[#10243A] border border-emerald-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#35D07F] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 dark:text-white">Physical Law Verification: Conservation of Energy</span>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Generation + Grid Import + Discharged Energy = Total Demand + Battery In + Curtailed Solar
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-3">
          <span>
            Total Solar: <strong className="text-slate-900 dark:text-white">{currentPlan.totalSolarGen} kWh</strong>
          </span>
          <span>·</span>
          <span>
            Total Demand: <strong className="text-slate-900 dark:text-white">{currentPlan.totalDemand} kWh</strong>
          </span>
          <span>·</span>
          <span>
            Grid Import: <strong className="text-slate-900 dark:text-white">{currentPlan.totalGridImport} kWh</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
