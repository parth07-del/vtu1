/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Zap,
  Sun,
  BatteryCharging,
  TrendingDown,
  DollarSign,
  CloudFog,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Info,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { SchedulePlan, TimeSlotConfig } from '../types/energy';
import { useTheme } from '../context/ThemeContext';

interface OverviewDashboardProps {
  activePlan: SchedulePlan;
  baselinePlan: SchedulePlan;
  slots: TimeSlotConfig[];
  onRunOptimization: () => void;
  onResetScenario: () => void;
  isOptimizing: boolean;
  selectedScheduleType: 'baseline' | 'classical' | 'qaoa';
  onSelectScheduleType: (type: 'baseline' | 'classical' | 'qaoa') => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  activePlan,
  baselinePlan,
  slots,
  onRunOptimization,
  onResetScenario,
  isOptimizing,
  selectedScheduleType,
  onSelectScheduleType,
}) => {
  const { isDark } = useTheme();

  // Financial savings against baseline
  const costSavings = baselinePlan.totalCost - activePlan.totalCost;
  const costSavingsPct =
    baselinePlan.totalCost > 0
      ? ((costSavings / baselinePlan.totalCost) * 100).toFixed(1)
      : '0.0';

  // Curtailment reduction against baseline
  const wasteSaved = baselinePlan.totalSolarCurtailed - activePlan.totalSolarCurtailed;

  // Chart data 1: Solar Gen vs Energy Demand
  const demandVsSolarData = activePlan.slots.map((s) => ({
    name: s.slotName,
    time: s.timeRange,
    'Solar Generation': s.solarGen,
    'Total Demand': s.totalDemand,
    'Direct Solar': s.solarDirect,
  }));

  // Chart data 2: Battery State of Charge Progression
  const socData = activePlan.slots.map((s) => ({
    name: s.slotName,
    'End SoC': s.socEnd,
    'Charge In': s.batteryCharge,
    'Discharge Out': s.batteryDischarge,
  }));

  // Chart data 3: Tariffs and Carbon Intensity
  const tariffData = slots.map((s) => ({
    name: s.name,
    'Grid Tariff (₹/kWh)': s.gridPrice,
    rawCarbon: s.carbonIntensity,
  }));

  // Chart data 4: Energy flow breakdown per slot
  const flowData = activePlan.slots.map((s) => ({
    name: s.slotName,
    'Direct Solar': s.solarDirect,
    'Stored to Battery': s.solarToBattery,
    'Grid Import': s.gridImport,
    'Curtailed Solar': s.solarCurtailed,
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
      {/* Simulation Notice Banner */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[#35C9E7]/10 text-sky-600 dark:text-[#35C9E7] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Simulated Campus Microgrid Environment</span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-[#35D07F] bg-emerald-50 dark:bg-[#35D07F]/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-[#35D07F]/20 font-semibold">
                100% Calculated Model
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              All metrics, costs, and carbon flows are computed dynamically from the active 4-slot
              dispatch model. No hardcoded or static values.
            </p>
          </div>
        </div>

        {/* Schedule Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#071426] rounded-lg border border-slate-200 dark:border-[#1e3a5f] shrink-0 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => onSelectScheduleType('baseline')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              selectedScheduleType === 'baseline'
                ? 'bg-white dark:bg-[#10243A] text-slate-900 dark:text-slate-200 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Baseline
          </button>
          <button
            onClick={() => onSelectScheduleType('classical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              selectedScheduleType === 'classical'
                ? 'bg-emerald-600 text-white dark:bg-[#35D07F]/20 dark:text-[#35D07F] font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Classical Optimal
          </button>
          <button
            onClick={() => onSelectScheduleType('qaoa')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              selectedScheduleType === 'qaoa'
                ? 'bg-sky-600 text-white dark:bg-[#35C9E7]/20 dark:text-[#35C9E7] font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            QAOA Quantum
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Demand */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Demand</span>
            <Zap className="w-4 h-4 text-sky-600 dark:text-[#35C9E7]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {activePlan.totalDemand.toFixed(1)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">kWh</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">4 daily time slots</div>
          </div>
        </div>

        {/* Renewable Generated */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Solar Generated</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {activePlan.totalSolarGen.toFixed(1)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">kWh</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-[#35D07F] flex items-center gap-1 mt-0.5 font-mono font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>Clean Inflow</span>
            </div>
          </div>
        </div>

        {/* Renewable Utilized */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Solar Utilized</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-[#35D07F]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-[#35D07F] tabular-nums tracking-tight">
              {activePlan.renewableUtilizationPct.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {(activePlan.totalSolarDirect + activePlan.totalSolarStored).toFixed(1)} /{' '}
              {activePlan.totalSolarGen.toFixed(1)} kWh
            </div>
          </div>
        </div>

        {/* Wasted / Curtailed */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Solar Wasted</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                activePlan.totalSolarCurtailed > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'
              }`}
            />
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
                activePlan.totalSolarCurtailed > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {activePlan.totalSolarCurtailed.toFixed(1)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">kWh</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {wasteSaved > 0 ? `Saved ${wasteSaved.toFixed(1)} kWh vs base` : 'Curtailed'}
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Electricity Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-[#35C9E7]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              ₹{activePlan.totalCost.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-[#35D07F] font-mono mt-0.5 font-medium">
              {costSavings > 0 ? `Saved ₹${costSavings.toFixed(1)} (${costSavingsPct}%)` : 'Tariff bill'}
            </div>
          </div>
        </div>

        {/* CO2 Emissions */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>CO₂ Emissions</span>
            <CloudFog className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {activePlan.totalCO2.toFixed(1)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">kg</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Import: {activePlan.totalGridImport.toFixed(1)} kWh
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Strategy Banner */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#35D07F]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recommended Dispatch Strategy</h3>
          </div>
          <span className="text-xs font-mono text-sky-700 dark:text-[#35C9E7] bg-sky-50 dark:bg-[#35C9E7]/10 px-2 py-0.5 rounded border border-sky-200 dark:border-[#35C9E7]/20 font-semibold">
            Vector: [{activePlan.binaryVector.join(', ')}]
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {activePlan.slots.map((s, idx) => (
            <div
              key={s.slotId}
              className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 text-xs space-y-1.5 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-semibold">
                <span>
                  {idx + 1}. {s.slotName}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{s.timeRange}</span>
              </div>
              <div className="text-slate-700 dark:text-slate-200 text-[11px] leading-relaxed">
                {s.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Solar Gen vs Energy Demand */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Solar Generation vs. Total Demand</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comparing microgrid demand against on-site solar (kWh)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandVsSolarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="Solar Generation"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F59E0B' }}
                />
                <Line
                  type="monotone"
                  dataKey="Total Demand"
                  stroke={isDark ? '#35C9E7' : '#0284C7'}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: isDark ? '#35C9E7' : '#0284C7' }}
                />
                <Line
                  type="monotone"
                  dataKey="Direct Solar"
                  stroke={isDark ? '#35D07F' : '#16A34A'}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Battery State of Charge (SoC) */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Battery State of Charge Progression</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Energy stored in battery across the daily cycle (kWh)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={socData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="socGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? '#35D07F' : '#16A34A'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isDark ? '#35D07F' : '#16A34A'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="End SoC"
                  stroke={isDark ? '#35D07F' : '#16A34A'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#socGradient)"
                />
                <Line
                  type="stepAfter"
                  dataKey="Charge In"
                  stroke={isDark ? '#35C9E7' : '#0284C7'}
                  strokeWidth={1.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="stepAfter"
                  dataKey="Discharge Out"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Electricity Tariffs by Time Slot */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Grid Electricity Tariff by Time Slot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Time-of-Use pricing (₹/kWh) informing battery dispatch</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tariffData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [`₹${val}/kWh`, name]}
                  contentStyle={tooltipStyle}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Grid Tariff (₹/kWh)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Energy Sourcing & Curtailment Flow */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Energy Sourcing & Curtailed Flow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown of direct solar, storage, grid import, and waste (kWh)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Direct Solar" stackId="a" fill={isDark ? '#35D07F' : '#16A34A'} />
                <Bar dataKey="Stored to Battery" stackId="a" fill={isDark ? '#35C9E7' : '#0284C7'} />
                <Bar dataKey="Grid Import" stackId="a" fill={isDark ? '#64748B' : '#94A3B8'} />
                <Bar dataKey="Curtailed Solar" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
