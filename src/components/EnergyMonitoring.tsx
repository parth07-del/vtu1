/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sliders,
  Battery,
  Zap,
  Sun,
  DollarSign,
  CloudFog,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  TimeSlotConfig,
  MicrogridConfig,
  PresetScenario,
  ScenarioPresetId,
} from '../types/energy';
import { PRESET_SCENARIOS, validateMicrogridInputs } from '../modules/energyEngine';
import { useTheme } from '../context/ThemeContext';

interface EnergyMonitoringProps {
  slots: TimeSlotConfig[];
  config: MicrogridConfig;
  activePresetId: ScenarioPresetId | 'custom';
  onUpdateScenario: (newSlots: TimeSlotConfig[], newConfig: MicrogridConfig, presetId: ScenarioPresetId | 'custom') => void;
  onResetDefaults: () => void;
}

export const EnergyMonitoring: React.FC<EnergyMonitoringProps> = ({
  slots,
  config,
  activePresetId,
  onUpdateScenario,
  onResetDefaults,
}) => {
  const { isDark } = useTheme();

  // Local edit states for seamless interactive typing before applying
  const [localSlots, setLocalSlots] = useState<TimeSlotConfig[]>(slots);
  const [localConfig, setLocalConfig] = useState<MicrogridConfig>(config);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<boolean>(false);

  // Synchronize when external props change
  React.useEffect(() => {
    setLocalSlots(slots);
    setLocalConfig(config);
    setValidationError(null);
  }, [slots, config]);

  const handleSlotChange = (slotIndex: number, field: keyof TimeSlotConfig, val: number) => {
    const updated = localSlots.map((s, idx) => (idx === slotIndex ? { ...s, [field]: val } : s));
    setLocalSlots(updated);
    setValidationError(validateMicrogridInputs(updated, localConfig));
  };

  const handleConfigChange = (field: keyof MicrogridConfig, val: any) => {
    const updated = { ...localConfig, [field]: val };
    setLocalConfig(updated);
    setValidationError(validateMicrogridInputs(localSlots, updated));
  };

  const handleSelectPreset = (preset: PresetScenario) => {
    const updatedConfig = { ...localConfig, ...preset.microgrid };
    setLocalSlots(preset.slots);
    setLocalConfig(updatedConfig);
    setValidationError(null);
    onUpdateScenario(preset.slots, updatedConfig, preset.id);
    triggerSuccess();
  };

  const handleApply = () => {
    const err = validateMicrogridInputs(localSlots, localConfig);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    onUpdateScenario(localSlots, localConfig, 'custom');
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setApplySuccess(true);
    setTimeout(() => setApplySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenarios Header Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Select Scenario Archetype</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Load representative meteorological and demand patterns for microgrid testing
            </p>
          </div>
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#10243A] hover:bg-slate-50 dark:hover:bg-[#16304e] border border-slate-200 dark:border-[#1e3a5f] rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Reset All to Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? 'bg-emerald-50/50 dark:bg-[#10243A] border-emerald-500 dark:border-[#35D07F] ring-1 ring-emerald-500/50 dark:ring-[#35D07F]/40'
                    : 'bg-white dark:bg-[#10243A]/70 hover:bg-slate-50 dark:hover:bg-[#10243A] border-slate-200 dark:border-[#1e3a5f]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{preset.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-[#35D07F] bg-emerald-100/70 dark:bg-[#35D07F]/15 px-2 py-0.5 rounded border border-emerald-300 dark:border-[#35D07F]/30 font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-sky-600 dark:text-[#35C9E7] mt-1">{preset.tagline}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{preset.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#152a45] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>
                    Midday Solar:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {preset.slots.find((s) => s.name === 'Midday')?.solarGen.toFixed(0)} kWh
                    </strong>
                  </span>
                  <span>
                    Capacity: {preset.microgrid.batteryCapacity || config.batteryCapacity} kWh
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Feedback Banner */}
      {validationError && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/50 rounded-xl p-3.5 text-xs text-red-700 dark:text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 4-Slot Dispatch Profile Matrix */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Time-Slot Microgrid Profile</span>
              <span className="text-[11px] font-mono text-sky-700 dark:text-[#35C9E7] bg-sky-50 dark:bg-[#35C9E7]/10 px-2 py-0.5 rounded border border-sky-200 dark:border-transparent font-semibold">
                4 Daily Epochs
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Directly edit generation, base demand, grid price tariffs, and emission intensities
            </p>
          </div>
          <button
            onClick={handleApply}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs ${
              applySuccess
                ? 'bg-emerald-600 text-white dark:bg-[#35D07F] dark:text-[#071426]'
                : 'bg-sky-600 hover:bg-sky-700 dark:bg-[#35C9E7] dark:hover:bg-[#2cb2cd] text-white dark:text-[#071426]'
            }`}
          >
            {applySuccess ? <Check className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
            <span>{applySuccess ? 'Applied Successfully!' : 'Apply Scenario & Recompute'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Slot & Time Range</th>
                <th className="py-2.5 px-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Solar Gen (kWh)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-[#35C9E7]" />
                    <span>Base Demand (kWh)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-[#35D07F]" />
                    <span>Grid Price (₹/kWh)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CloudFog className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>CO₂ Intensity (kg/kWh)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#152a45]">
              {localSlots.map((slot, idx) => {
                const net = slot.solarGen - slot.baseDemand;
                return (
                  <tr key={slot.id} className="hover:bg-slate-50 dark:hover:bg-[#0c1e33] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{slot.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{slot.timeRange}</div>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={slot.solarGen}
                        onChange={(e) =>
                          handleSlotChange(idx, 'solarGen', Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        className="w-24 px-2.5 py-1.5 bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-sky-500 dark:focus:border-[#35C9E7] focus:outline-hidden"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={slot.baseDemand}
                        onChange={(e) =>
                          handleSlotChange(idx, 'baseDemand', Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        className="w-24 px-2.5 py-1.5 bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-sky-500 dark:focus:border-[#35C9E7] focus:outline-hidden"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={slot.gridPrice}
                        onChange={(e) =>
                          handleSlotChange(idx, 'gridPrice', Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        className="w-24 px-2.5 py-1.5 bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-sky-500 dark:focus:border-[#35C9E7] focus:outline-hidden"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.05"
                        value={slot.carbonIntensity}
                        onChange={(e) =>
                          handleSlotChange(idx, 'carbonIntensity', Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        className="w-24 px-2.5 py-1.5 bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-sky-500 dark:focus:border-[#35C9E7] focus:outline-hidden"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium">
                      {net >= 0 ? (
                        <span className="text-emerald-600 dark:text-[#35D07F]">+{net.toFixed(1)} kWh surplus</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">{net.toFixed(1)} kWh deficit</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Battery Storage & Microgrid Configuration */}
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <Battery className="w-5 h-5 text-emerald-600 dark:text-[#35D07F]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Battery Storage & Microgrid Constraints</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Physical parameters governing state-of-charge limits and efficiency losses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Battery Capacity */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Battery Capacity (B_max)</span>
              <span className="font-mono text-sky-600 dark:text-[#35C9E7]">kWh</span>
            </label>
            <input
              type="number"
              min="5"
              max="100"
              step="1"
              value={localConfig.batteryCapacity}
              onChange={(e) =>
                handleConfigChange('batteryCapacity', Math.max(1, parseFloat(e.target.value) || 1))
              }
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#10243A] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-emerald-600 dark:focus:border-[#35D07F] focus:outline-hidden"
            />
          </div>

          {/* Initial Charge */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Initial SoC (B_0)</span>
              <span className="font-mono text-sky-600 dark:text-[#35C9E7]">kWh</span>
            </label>
            <input
              type="number"
              min="0"
              max={localConfig.batteryCapacity}
              step="0.5"
              value={localConfig.initialCharge}
              onChange={(e) =>
                handleConfigChange('initialCharge', Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#10243A] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-emerald-600 dark:focus:border-[#35D07F] focus:outline-hidden"
            />
          </div>

          {/* Max Charge Power */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Max Charge Rate</span>
              <span className="font-mono text-sky-600 dark:text-[#35C9E7]">kWh / slot</span>
            </label>
            <input
              type="number"
              min="1"
              max="30"
              step="1"
              value={localConfig.maxChargeRate}
              onChange={(e) =>
                handleConfigChange('maxChargeRate', Math.max(1, parseFloat(e.target.value) || 1))
              }
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#10243A] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-emerald-600 dark:focus:border-[#35D07F] focus:outline-hidden"
            />
          </div>

          {/* Max Discharge Power */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Max Discharge Rate</span>
              <span className="font-mono text-sky-600 dark:text-[#35C9E7]">kWh / slot</span>
            </label>
            <input
              type="number"
              min="1"
              max="30"
              step="1"
              value={localConfig.maxDischargeRate}
              onChange={(e) =>
                handleConfigChange('maxDischargeRate', Math.max(1, parseFloat(e.target.value) || 1))
              }
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#10243A] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-emerald-600 dark:focus:border-[#35D07F] focus:outline-hidden"
            />
          </div>

          {/* Round-trip efficiencies */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Charge Efficiency (η_ch)</span>
              <span className="font-mono text-emerald-600 dark:text-[#35D07F] font-bold">
                {(localConfig.chargeEfficiency * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              min="0.70"
              max="1.0"
              step="0.01"
              value={localConfig.chargeEfficiency}
              onChange={(e) => handleConfigChange('chargeEfficiency', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 dark:accent-[#35D07F]"
            />
          </div>

          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Discharge Efficiency (η_dis)</span>
              <span className="font-mono text-emerald-600 dark:text-[#35D07F] font-bold">
                {(localConfig.dischargeEfficiency * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              min="0.70"
              max="1.0"
              step="0.01"
              value={localConfig.dischargeEfficiency}
              onChange={(e) => handleConfigChange('dischargeEfficiency', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 dark:accent-[#35D07F]"
            />
          </div>

          {/* Flexible demand */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Flexible Shiftable Load</span>
              <span className="font-mono text-sky-600 dark:text-[#35C9E7]">kWh</span>
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={localConfig.flexibleDemand}
              onChange={(e) =>
                handleConfigChange('flexibleDemand', Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#10243A] border border-slate-300 dark:border-[#1e3a5f] rounded text-slate-900 dark:text-white font-mono tabular-nums focus:border-sky-500 dark:focus:border-[#35C9E7] focus:outline-hidden"
            />
          </div>

          {/* Export toggle */}
          <div className="bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#152a45] rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Grid Export Surplus</span>
              <input
                type="checkbox"
                checked={localConfig.allowExport}
                onChange={(e) => handleConfigChange('allowExport', e.target.checked)}
                className="w-4 h-4 accent-emerald-600 dark:accent-[#35D07F] rounded cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {localConfig.allowExport
                ? `Export permitted at ₹${localConfig.exportPrice}/kWh tariff.`
                : 'Surplus solar is strictly curtailed (zero export).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
