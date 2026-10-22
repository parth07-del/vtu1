/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, Play, RotateCcw, Sun, Moon } from 'lucide-react';
import { ScenarioPresetId } from '../types/energy';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentTitle: string;
  activeScenarioId: ScenarioPresetId | 'custom';
  onSelectScenario: (id: ScenarioPresetId) => void;
  onRunOptimization: () => void;
  onResetScenario: () => void;
  onOpenMobile: () => void;
  isOptimizing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTitle,
  activeScenarioId,
  onSelectScenario,
  onRunOptimization,
  onResetScenario,
  onOpenMobile,
  isOptimizing,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#071426]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#152a45] px-4 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#10243A] lg:hidden transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 truncate">
            <span className="truncate">{currentTitle}</span>
            <span className="hidden sm:inline-block text-xs font-normal text-slate-500 dark:text-slate-400 shrink-0">
              · Simulated Microgrid
            </span>
          </h1>
        </div>
      </div>

      {/* Right Actions: Preset Switcher + Theme Toggle + Run + Reset */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Preset Selector */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-[#10243A] p-0.5 rounded-lg border border-slate-200 dark:border-[#1e3a5f]">
          <button
            onClick={() => onSelectScenario('sunny')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeScenarioId === 'sunny'
                ? 'bg-emerald-500 text-white dark:bg-[#35D07F]/20 dark:text-[#35D07F] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Sunny Day
          </button>
          <button
            onClick={() => onSelectScenario('cloudy')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeScenarioId === 'cloudy'
                ? 'bg-sky-500 text-white dark:bg-[#35C9E7]/20 dark:text-[#35C9E7] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Cloudy Day
          </button>
          <button
            onClick={() => onSelectScenario('high_demand')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeScenarioId === 'high_demand'
                ? 'bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-400 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            High Demand
          </button>
        </div>

        {/* Theme Toggle Button (Bright / Dark Mode) */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-[#10243A] dark:hover:bg-[#16304e] border border-slate-200 dark:border-[#1e3a5f] rounded-lg transition-colors cursor-pointer"
          aria-label={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span className="hidden sm:inline text-xs font-semibold">Bright</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />
              <span className="hidden sm:inline text-xs font-semibold">Dark</span>
            </>
          )}
        </button>

        {/* Reset Scenario Button */}
        <button
          onClick={onResetScenario}
          title="Reset to scenario defaults"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#10243A] dark:hover:bg-[#16304e] border border-slate-200 dark:border-[#1e3a5f] rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Run Optimization Button */}
        <button
          onClick={onRunOptimization}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white dark:text-[#071426] bg-emerald-600 hover:bg-emerald-700 dark:bg-[#35D07F] dark:hover:bg-[#2eb96f] disabled:opacity-50 rounded-lg shadow-sm shadow-emerald-600/20 dark:shadow-[#35D07F]/20 transition-all cursor-pointer whitespace-nowrap"
        >
          {isOptimizing ? (
            <div className="w-4 h-4 border-2 border-white dark:border-[#071426] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isOptimizing ? 'Optimizing...' : 'Run Optimization'}</span>
        </button>
      </div>
    </header>
  );
};
