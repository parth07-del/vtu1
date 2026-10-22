/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Zap,
  Atom,
  GraduationCap,
  Code2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const AboutGreenQ: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Project Header Banner */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-[#35D07F] font-bold mb-1">
          <GraduationCap className="w-4 h-4" />
          <span>College Engineering Capstone · Climate Change & Sustainability</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          GreenQ — Hybrid Quantum Renewable Energy Scheduler
        </h1>
        <p className="text-base font-semibold text-sky-600 dark:text-[#35C9E7] mt-1">
          “Optimize Energy. Reduce Waste. Build a Greener Future.”
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed max-w-3xl">
          An engineering prototype demonstrating the integration of classical combinatorial search
          and the Quantum Approximate Optimization Algorithm (Farhi et al., 2014) to schedule battery
          energy storage and flexible electricity demand in a renewable microgrid.
        </p>
      </div>

      {/* Problem Statement & Objectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Statement */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Problem Statement</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Renewable energy generation (such as rooftop solar PV) and electricity demand vary
            asynchronously throughout the day. At midday, excess solar often exceeds local load,
            causing clean renewable power to be curtailed (wasted) due to grid export limits.
            Conversely, during evening hours, solar drops to zero just as campus demand and utility
            tariffs peak. Uncoordinated battery operation leads to sub-optimal storage utilization,
            excessive electricity expenditure, and high grid carbon emissions.
          </p>
        </div>

        {/* Project Objectives */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#35D07F]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Project Objectives</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-[#35D07F] font-bold">1.</span>
              <span>
                <strong>Cost Reduction:</strong> Minimize total microgrid electricity expenditure by
                shifting demand and discharging stored energy during peak tariff periods.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-[#35D07F] font-bold">2.</span>
              <span>
                <strong>Renewable Utilization:</strong> Reduce solar curtailment by storing midday surplus
                into electrochemical batteries.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-[#35D07F] font-bold">3.</span>
              <span>
                <strong>Quantum Algorithm Exploration:</strong> Formulate the binary scheduling task as
                a QUBO/Ising Hamiltonian and evaluate QAOA state-vector simulation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-[#35D07F] font-bold">4.</span>
              <span>
                <strong>Fair Benchmarking:</strong> Objectively compare QAOA approximation ratios against
                a provable classical global minimum without exaggerating quantum capabilities.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Target Application & Mathematical Architecture */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Target Application & Model Architecture</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          The prototype models a residential microgrid or small college engineering campus equipped with
          a solar PV array, stationary lithium-ion battery storage, shiftable flexible loads (EV charging,
          water pumps), and a grid interconnection under Time-of-Use (ToU) tariffs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-sans font-semibold">1. Decision Variables</span>
            <p className="text-slate-800 dark:text-slate-200 text-[11px]">
              x_t ∈ {'{0, 1}'} for t ∈ {'{0, 1, 2, 3}'} designating battery charging vs. discharge/idle
              per 3-hour slot.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-sans font-semibold">2. Physical Balance</span>
            <p className="text-slate-800 dark:text-slate-200 text-[11px]">
              S_t + G_t + dis_t = D_t + ch_t + W_t with non-negative state-of-charge tracking: 0 ≤ SoC ≤
              B_max.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-sans font-semibold">3. QAOA Circuit</span>
            <p className="text-slate-800 dark:text-slate-200 text-[11px]">
              |ψ(γ, β)⟩ = e^{`-iβH_B`} e^{`-iγH_C`} H^⊗4 |0000⟩ evolved on 16-element complex state vector.
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Limitations & Future Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transparent Limitations */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Assumptions & Limitations</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">·</span>
              <span>
                <strong>Simulated Data:</strong> Operates on simulated time-slot profiles without real-time
                hardware telemetry or live utility APIs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">·</span>
              <span>
                <strong>Coarse Discretization:</strong> Divides the day into 4 representative 3-hour
                decision epochs rather than 15-minute rolling horizons.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">·</span>
              <span>
                <strong>Classical State-Vector Execution:</strong> QAOA is simulated on classical CPU
                hardware; for N = 4, classical enumeration is faster and exact.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">·</span>
              <span>
                <strong>No Quantum Advantage Claim:</strong> Current NISQ devices and classical
                simulations do not yield speedup at this toy problem scale.
              </span>
            </li>
          </ul>
        </div>

        {/* Future Scope */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-[#35D07F]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Future Scope & Extensions</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-[#35D07F] font-bold">·</span>
              <span>
                <strong>IoT Inverter Telemetry:</strong> Connect to Modbus/MQTT endpoints for live solar
                generation and bidirectional smart inverter commands.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-[#35D07F] font-bold">·</span>
              <span>
                <strong>Predictive Machine Learning:</strong> Integrate LSTM / Transformer models for
                weather forecasting and stochastic demand predictions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-[#35D07F] font-bold">·</span>
              <span>
                <strong>Hardware Quantum Deployment:</strong> Execute quantum circuits on actual
                superconducting hardware (via IBM Quantum / Qiskit or AWS Braket).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-[#35D07F] font-bold">·</span>
              <span>
                <strong>Multi-Microgrid Peer-to-Peer Trading:</strong> Scale up to 50+ coupled microgrid
                nodes where combinatorial complexity truly justifies quantum acceleration.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
