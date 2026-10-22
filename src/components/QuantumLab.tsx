/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Atom,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  QAOASimulationResult,
  TimeSlotConfig,
  MicrogridConfig,
} from '../types/energy';
import { useTheme } from '../context/ThemeContext';

interface QuantumLabProps {
  qaoaResult: QAOASimulationResult;
  onRunQAOA: (params?: {
    gamma?: number;
    beta?: number;
    p?: number;
    shots?: number;
    seed?: number;
    autoOptimize?: boolean;
  }) => void;
  isSimulating: boolean;
  slots: TimeSlotConfig[];
  config: MicrogridConfig;
}

export const QuantumLab: React.FC<QuantumLabProps> = ({
  qaoaResult,
  onRunQAOA,
  isSimulating,
  slots,
  config,
}) => {
  const { isDark } = useTheme();
  const [depthP, setDepthP] = useState<number>(qaoaResult.p);
  const [gamma, setGamma] = useState<number>(qaoaResult.gamma);
  const [beta, setBeta] = useState<number>(qaoaResult.beta);
  const [shots, setShots] = useState<number>(qaoaResult.shots);
  const [seed, setSeed] = useState<number>(qaoaResult.seed);
  const [autoOptimize, setAutoOptimize] = useState<boolean>(true);

  const handleRun = () => {
    onRunQAOA({
      p: depthP,
      gamma,
      beta,
      shots,
      seed,
      autoOptimize,
    });
  };

  const handleApplyOptimal = () => {
    setGamma(qaoaResult.optimalGamma);
    setBeta(qaoaResult.optimalBeta);
    setAutoOptimize(true);
    onRunQAOA({
      p: depthP,
      gamma: qaoaResult.optimalGamma,
      beta: qaoaResult.optimalBeta,
      shots,
      seed,
      autoOptimize: true,
    });
  };

  // Chart data: 16 bitstrings with probabilities
  const chartData = qaoaResult.probabilities.map((item) => ({
    bitstring: item.bitstring,
    probability: item.probability * 100, // percentage
    cost: item.cost,
    feasible: item.feasible,
    isBest: item.bitstring === qaoaResult.bestFeasibleBitstring,
  }));

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
      {/* Educational & Academic Honesty Header */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-[#35C9E7]/15 text-sky-600 dark:text-[#35C9E7] flex items-center justify-center shrink-0">
            <Atom className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>QAOA State-Vector Simulator</span>
              <span className="text-[10px] font-mono text-sky-700 dark:text-[#35C9E7] bg-sky-50 dark:bg-[#35C9E7]/10 px-2 py-0.5 rounded border border-sky-200 dark:border-[#35C9E7]/20 font-semibold">
                4 Qubits · 2⁴ = 16 Amplitudes
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Solves the combinatorial binary battery dispatch problem via the Quantum Approximate
              Optimization Algorithm (Farhi et al., 2014). Running on an exact unitary matrix
              state-vector simulator in TypeScript without synthetic noise.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-[#071426] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#152a45] shrink-0">
          <span>Runtime: </span>
          <strong className="text-emerald-600 dark:text-[#35D07F]">{qaoaResult.runtimeMs} ms</strong>
        </div>
      </div>

      {/* Control Panel: Parameters, Depth, Shots */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600 dark:text-[#35C9E7]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Algorithm & Circuit Hyperparameters</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyOptimal}
              className="px-3 py-1.5 text-xs font-medium text-sky-700 dark:text-[#35C9E7] bg-sky-50 hover:bg-sky-100 dark:bg-[#35C9E7]/10 dark:hover:bg-[#35C9E7]/20 border border-sky-200 dark:border-[#35C9E7]/30 rounded-lg transition-colors cursor-pointer font-semibold"
            >
              Use Optimal (γ*, β*)
            </button>
            <button
              onClick={handleRun}
              disabled={isSimulating}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white dark:text-[#071426] bg-emerald-600 hover:bg-emerald-700 dark:bg-[#35D07F] dark:hover:bg-[#2cb96c] disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {isSimulating ? (
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-[#071426] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isSimulating ? 'Evolving...' : 'Run QAOA Simulation'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Depth p */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Circuit Depth (p)</span>
              <span className="font-mono text-sky-600 dark:text-[#35C9E7]">layers</span>
            </label>
            <select
              value={depthP}
              onChange={(e) => setDepthP(parseInt(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#10243A] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden"
            >
              <option value={1}>p = 1 (Standard 1-Layer)</option>
              <option value={2}>p = 2 (2-Layer Experiment)</option>
            </select>
          </div>

          {/* Gamma */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Phase Angle (γ)</span>
              <span className="font-mono text-sky-600 dark:text-[#35C9E7] font-bold">{gamma.toFixed(2)} rad</span>
            </label>
            <input
              type="range"
              min="0.05"
              max="2.5"
              step="0.05"
              value={gamma}
              onChange={(e) => {
                setGamma(parseFloat(e.target.value));
                setAutoOptimize(false);
              }}
              className="w-full accent-sky-600 dark:accent-[#35C9E7]"
            />
          </div>

          {/* Beta */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Mixer Angle (β)</span>
              <span className="font-mono text-emerald-600 dark:text-[#35D07F] font-bold">{beta.toFixed(2)} rad</span>
            </label>
            <input
              type="range"
              min="0.05"
              max="1.5"
              step="0.05"
              value={beta}
              onChange={(e) => {
                setBeta(parseFloat(e.target.value));
                setAutoOptimize(false);
              }}
              className="w-full accent-emerald-600 dark:accent-[#35D07F]"
            />
          </div>

          {/* Shots */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Measurement Shots</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{shots}</span>
            </label>
            <select
              value={shots}
              onChange={(e) => setShots(parseInt(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#10243A] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden"
            >
              <option value={256}>256 Shots</option>
              <option value={512}>512 Shots</option>
              <option value={1024}>1024 Shots (Default)</option>
              <option value={2048}>2048 Shots</option>
            </select>
          </div>

          {/* Random Seed */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>RNG Seed (Sampling)</span>
              <span className="font-mono text-sky-600 dark:text-[#35C9E7]">LCG</span>
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 1)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#10243A] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Quantum Circuit Architecture & Mathematical Representation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circuit Diagram Box */}
        <div className="lg:col-span-2 bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-[#35D07F]" />
              <span>QAOA Quantum Circuit Diagram (p = {depthP})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              |ψ(γ, β)⟩ = U(B, β) U(C, γ) H^⊗4 |0000⟩
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-4 font-mono text-xs space-y-3 overflow-x-auto">
            {['q₀ (Morning)', 'q₁ (Midday)', 'q₂ (Evening)', 'q₃ (Night)'].map((qubitLabel, qIdx) => (
              <div key={qIdx} className="flex items-center gap-2 whitespace-nowrap min-w-[500px]">
                <span className="w-24 text-[11px] text-slate-600 dark:text-slate-400 shrink-0 font-sans font-medium">{qubitLabel}</span>
                <span className="text-slate-400">|0⟩ ──</span>
                {/* Hadamard */}
                <span className="px-2 py-0.5 bg-sky-100 dark:bg-[#152a45] text-sky-800 dark:text-[#35C9E7] border border-sky-300 dark:border-[#35C9E7]/40 rounded text-[11px] font-bold">
                  H
                </span>
                <span className="text-slate-400">───────</span>
                {/* Phase Separator U(C, gamma) */}
                <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 rounded text-[11px] font-medium">
                  e^{`-iγC(x)`}
                </span>
                <span className="text-slate-400">───────</span>
                {/* Mixer U(B, beta) */}
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-[#35D07F] border border-emerald-300 dark:border-[#35D07F]/40 rounded text-[11px] font-medium">
                  Rx(2β)
                </span>
                {depthP === 2 && (
                  <>
                    <span className="text-slate-400">─────</span>
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 rounded text-[10px]">
                      e^{`-iγ₂C`}
                    </span>
                    <span className="text-slate-400">─────</span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-[#35D07F] border border-emerald-300 dark:border-[#35D07F]/40 rounded text-[10px]">
                      Rx(2β₂)
                    </span>
                  </>
                )}
                <span className="text-slate-400">───────</span>
                {/* Measurement Gate */}
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-[#10243A] text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 rounded text-[11px] flex items-center gap-1 font-semibold">
                  <span>M</span>
                  <span className="text-[9px]">∡</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-bold">─── 𝕩{qIdx}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Optimal angles: γ* = <strong className="text-slate-900 dark:text-white">{qaoaResult.optimalGamma}</strong>,
              β* = <strong className="text-slate-900 dark:text-white">{qaoaResult.optimalBeta}</strong>
            </span>
            <span>
              Expected Cost ⟨H_C⟩: <strong className="text-emerald-600 dark:text-[#35D07F]">{qaoaResult.expectedCost.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Hamiltonian Decomposition Card */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Ising Cost Hamiltonian</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Mapped from energy dispatch tariff & surplus parameters
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded p-2 text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Offset C₀: </span>
                <strong className="text-sky-600 dark:text-[#35C9E7]">{qaoaResult.offset}</strong>
              </div>

              <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded p-2 text-slate-700 dark:text-slate-300">
                <div className="text-slate-500 dark:text-slate-400 mb-1">Single-Spin Fields (h_i Z_i):</div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {qaoaResult.hamiltonianLinear.map((h, i) => (
                    <span key={i}>
                      h{i}: <strong className="text-emerald-600 dark:text-[#35D07F]">{h > 0 ? `+${h}` : h}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded p-2 text-slate-700 dark:text-slate-300">
                <div className="text-slate-500 dark:text-slate-400 mb-1">Spin-Spin Couplings (J_ij Z_i Z_j):</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Penalty couplings enforce battery overfill constraints between multiple charging slots.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#152a45] text-[11px] text-slate-500 dark:text-slate-400">
            <span>Mapping: x_i = (1 - Z_i) / 2 where Z_i ∈ {'{-1, +1}'}</span>
          </div>
        </div>
      </div>

      {/* Probability Distribution Bar Chart across 16 Basis States */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Measurement Probability Distribution: |ψ(γ, β)|²</span>
              <span className="text-xs font-mono text-emerald-700 dark:text-[#35D07F] bg-emerald-50 dark:bg-[#35D07F]/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-transparent font-semibold">
                16 Computational Basis States
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Higher probability amplitude indicates constructively interfering ground-state candidates
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-[#35D07F]" />
              <span>Optimal State</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-sky-600 dark:bg-[#35C9E7]" />
              <span>Feasible States</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="bitstring" stroke={axisStroke} fontSize={10} tickLine={false} />
              <YAxis stroke={axisStroke} fontSize={10} tickLine={false} unit="%" />
              <Tooltip
                formatter={(val, name, item) => [
                  `${Number(val).toFixed(2)}% (Cost: ₹${item.payload.cost})`,
                  'Probability',
                ]}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isBest
                        ? (isDark ? '#35D07F' : '#16A34A')
                        : entry.feasible
                        ? (isDark ? '#35C9E7' : '#0284C7')
                        : (isDark ? '#475569' : '#94A3B8')
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Sampled Bitstrings & Feasibility Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sampled Measurement Statistics */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Top Sampled Bitstrings ({qaoaResult.shots} Shots)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Simulated pseudo-random measurements using seed #{qaoaResult.seed}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-2 px-3">Bitstring</th>
                  <th className="py-2 px-3 text-right">Count</th>
                  <th className="py-2 px-3 text-right">Empirical Freq</th>
                  <th className="py-2 px-3 text-right">Cost (₹)</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#152a45]">
                {qaoaResult.samples.slice(0, 5).map((sample) => {
                  const probItem = qaoaResult.probabilities.find((p) => p.bitstring === sample.bitstring);
                  const isTop = sample.bitstring === qaoaResult.bestFeasibleBitstring;
                  return (
                    <tr key={sample.bitstring} className="hover:bg-slate-50 dark:hover:bg-[#0c1e33] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{sample.bitstring}</span>
                        {isTop && (
                          <span className="text-[9px] font-sans text-emerald-700 dark:text-[#35D07F] bg-emerald-100 dark:bg-[#35D07F]/20 px-1 rounded font-bold">
                            BEST
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                        {sample.count}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sky-600 dark:text-[#35C9E7] font-semibold">
                        {(sample.frequency * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                        ₹{probItem?.cost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {probItem?.feasible ? (
                          <span className="text-emerald-600 dark:text-[#35D07F] font-semibold">Feasible</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">Penalized</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected QAOA Schedule Summary */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Best Feasible Measured Solution</h3>
              <span className="text-xs font-mono text-emerald-700 dark:text-[#35D07F] bg-emerald-100 dark:bg-[#35D07F]/15 px-2 py-0.5 rounded border border-emerald-300 dark:border-[#35D07F]/30 font-bold">
                |{qaoaResult.bestFeasibleBitstring}⟩
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Schedule derived from highest probability feasible quantum state:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3">
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Morning (x₀)</div>
                <div className="text-slate-900 dark:text-white font-mono font-bold text-sm mt-0.5">
                  {qaoaResult.bestFeasibleBitstring[0] === '1' ? 'Charge Battery' : 'Discharge / Idle'}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3">
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Midday (x₁)</div>
                <div className="text-slate-900 dark:text-white font-mono font-bold text-sm mt-0.5">
                  {qaoaResult.bestFeasibleBitstring[1] === '1' ? 'Charge Battery' : 'Discharge / Idle'}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3">
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Evening (x₂)</div>
                <div className="text-slate-900 dark:text-white font-mono font-bold text-sm mt-0.5">
                  {qaoaResult.bestFeasibleBitstring[2] === '1' ? 'Charge Battery' : 'Discharge / Idle'}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3">
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Night (x₃)</div>
                <div className="text-slate-900 dark:text-white font-mono font-bold text-sm mt-0.5">
                  {qaoaResult.bestFeasibleBitstring[3] === '1' ? 'Charge Battery' : 'Discharge / Idle'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#152a45] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Objective Cost:</span>
            <span className="text-emerald-600 dark:text-[#35D07F] font-bold text-sm">₹{qaoaResult.bestFeasibleCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
