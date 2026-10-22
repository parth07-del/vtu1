/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Leaf,
  Sun,
  Battery,
  CloudFog,
  TrendingUp,
  DollarSign,
  Info,
} from 'lucide-react';
import { SchedulePlan, TimeSlotConfig } from '../types/energy';
import { useTheme } from '../context/ThemeContext';

interface SustainabilityReportProps {
  activePlan: SchedulePlan;
  baselinePlan: SchedulePlan;
  slots: TimeSlotConfig[];
}

export const SustainabilityReport: React.FC<SustainabilityReportProps> = ({
  activePlan,
  baselinePlan,
  slots,
}) => {
  const { isDark } = useTheme();

  // Financial savings
  const costSavings = baselinePlan.totalCost - activePlan.totalCost;
  const costSavingsPct =
    baselinePlan.totalCost > 0
      ? ((costSavings / baselinePlan.totalCost) * 100).toFixed(1)
      : '0.0';

  // Carbon savings
  const co2Savings = baselinePlan.totalCO2 - activePlan.totalCO2;
  const co2SavingsPct =
    baselinePlan.totalCO2 > 0
      ? ((co2Savings / baselinePlan.totalCO2) * 100).toFixed(1)
      : '0.0';

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = [
      'Time Slot',
      'Time Range',
      'Solar Gen (kWh)',
      'Base Demand (kWh)',
      'Flex Demand (kWh)',
      'Total Demand (kWh)',
      'Direct Solar (kWh)',
      'Solar Stored (kWh)',
      'Solar Curtailed (kWh)',
      'Battery Discharge (kWh)',
      'Grid Import (kWh)',
      'Grid Tariff (Rs/kWh)',
      'CO2 Intensity (kg/kWh)',
      'Electricity Cost (Rs)',
      'CO2 Emissions (kg)',
      'End SoC (kWh)',
    ];

    const rows = activePlan.slots.map((s, idx) => {
      const slotCfg = slots[idx];
      return [
        `"${s.slotName}"`,
        `"${s.timeRange}"`,
        s.solarGen.toFixed(2),
        s.baseDemand.toFixed(2),
        s.flexDemand.toFixed(2),
        s.totalDemand.toFixed(2),
        s.solarDirect.toFixed(2),
        s.solarToBattery.toFixed(2),
        s.solarCurtailed.toFixed(2),
        s.batteryDischarge.toFixed(2),
        s.gridImport.toFixed(2),
        slotCfg?.gridPrice?.toFixed(2) || '0.00',
        slotCfg?.carbonIntensity?.toFixed(2) || '0.00',
        s.electricityCost.toFixed(2),
        s.co2Emissions.toFixed(2),
        s.socEnd.toFixed(2),
      ].join(',');
    });

    // Summary totals row
    const totalsRow = [
      '"TOTAL / SUMMARY"',
      '""',
      activePlan.totalSolarGen.toFixed(2),
      '""',
      '""',
      activePlan.totalDemand.toFixed(2),
      activePlan.totalSolarDirect.toFixed(2),
      activePlan.totalSolarStored.toFixed(2),
      activePlan.totalSolarCurtailed.toFixed(2),
      '""',
      activePlan.totalGridImport.toFixed(2),
      '""',
      '""',
      activePlan.totalCost.toFixed(2),
      activePlan.totalCO2.toFixed(2),
      '""',
    ].join(',');

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent([headers.join(','), ...rows, totalsRow].join('\n'));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute(
      'download',
      `GreenQ_Sustainability_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar: Export & Print */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs no-print transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-[#35D07F]/15 text-emerald-600 dark:text-[#35D07F] flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Sustainability & Carbon Impact Audit</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rigorous ecological accounting and greenhouse gas mitigation report
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-[#071426] dark:hover:bg-[#152a45] border border-slate-200 dark:border-[#1e3a5f] rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-600 dark:text-[#35C9E7]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#071426] bg-emerald-600 hover:bg-emerald-700 dark:bg-[#35D07F] dark:hover:bg-[#2cb96c] rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-600/20 dark:shadow-[#35D07F]/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Sustainability Audit Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Solar Generated */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Renewable Generated</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
            {activePlan.totalSolarGen.toFixed(1)} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">100% on-site solar PV</div>
        </div>

        {/* Utilization Rate */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Renewable Utilization</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-[#35D07F]" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-[#35D07F] mt-2 tabular-nums">
            {activePlan.renewableUtilizationPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {(activePlan.totalSolarDirect + activePlan.totalSolarStored).toFixed(1)} kWh productive use
          </div>
        </div>

        {/* Avoided Emissions */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Operational CO₂</span>
            <CloudFog className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
            {activePlan.totalCO2.toFixed(1)} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-[#35D07F] font-mono mt-1 font-semibold">
            {co2Savings > 0 ? `Reduced by ${co2Savings.toFixed(1)} kg (${co2SavingsPct}%)` : 'Tariff estimate'}
          </div>
        </div>

        {/* Financial Expenditure */}
        <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Electricity Bill</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-[#35C9E7]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
            ₹{activePlan.totalCost.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-[#35D07F] font-mono mt-1 font-semibold">
            {costSavings > 0 ? `Saved ₹${costSavings.toFixed(2)} (${costSavingsPct}%)` : 'Base tariff bill'}
          </div>
        </div>
      </div>

      {/* Energy Partition & Double-Counting Safeguard Audit */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Solar Energy Partitioning (Strict Non-Duplication)</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Every kilowatt-hour of generated solar energy is categorized into exactly one destination:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3.5 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">1. Directly Consumed</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-[#35D07F] tabular-nums">
              {activePlan.totalSolarDirect.toFixed(1)} kWh
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Immediately offsets daytime microgrid load with zero storage round-trip loss.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3.5 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">2. Stored in Battery</span>
            <div className="text-xl font-bold font-mono text-sky-600 dark:text-[#35C9E7] tabular-nums">
              {activePlan.totalSolarStored.toFixed(1)} kWh
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Buffered into battery electrochemical storage for evening peak discharge.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3.5 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">3. Curtailed / Wasted</span>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {activePlan.totalSolarCurtailed.toFixed(1)} kWh
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Lost due to battery capacity or inverter power limits when export is disabled.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#152a45] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Formula: S_direct + S_stored + S_curtailed = S_total</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            {activePlan.totalSolarDirect.toFixed(1)} + {activePlan.totalSolarStored.toFixed(1)} +{' '}
            {activePlan.totalSolarCurtailed.toFixed(1)} ={' '}
            {(activePlan.totalSolarDirect + activePlan.totalSolarStored + activePlan.totalSolarCurtailed).toFixed(1)} kWh
          </span>
        </div>
      </div>

      {/* Mathematical Formulas Documentation */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Academic Mathematical Accounting Formulas</h3>

        <div className="space-y-3 text-xs font-mono text-slate-700 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3">
            <div className="text-sky-600 dark:text-[#35C9E7] font-bold mb-1">Renewable Energy Utilization Percentage:</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold">
              Utilization (%) = [(S_direct + S_stored) / S_generated] × 100
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1">
              Directly measures the fraction of clean renewable generation put to productive use rather
              than curtailed. Guarded against division-by-zero when solar generation is 0.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3">
            <div className="text-emerald-600 dark:text-[#35D07F] font-bold mb-1">Estimated Operational Greenhouse Gas Emissions:</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold">
              CO₂ Emissions (kg) = ∑ (Grid_Import_t × Carbon_Intensity_t)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1">
              Calculated individually per time-slot using simulated grid carbon intensity factors (ranging from
              0.50 to 0.92 kg CO₂/kWh across peak and off-peak hours).
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3">
            <div className="text-amber-600 dark:text-amber-400 font-bold mb-1">Financial Percentage Cost Savings:</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold">
              Savings (%) = [(Baseline_Cost - Optimized_Cost) / Baseline_Cost] × 100
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1">
              Safely handles zero baseline cost, yielding 0% rather than an IEEE NaN / infinity condition.
            </p>
          </div>
        </div>
      </div>

      {/* Faculty Assessment & Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#091a30] border border-slate-200 dark:border-[#152a45] text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 dark:text-[#35C9E7] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Academic Disclaimer:</strong> Grid carbon intensity values and solar insolation figures are
          derived from regional simulation models. Operational emissions reflect marginal grid displacement
          and do not include lifecycle embodied emissions of battery cells or solar modules.
        </p>
      </div>
    </div>
  );
};
