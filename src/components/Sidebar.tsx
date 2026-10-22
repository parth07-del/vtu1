/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  CalendarClock,
  Atom,
  GitCompare,
  FileSpreadsheet,
  Info,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type PageId =
  | 'overview'
  | 'monitoring'
  | 'scheduler'
  | 'quantum'
  | 'comparison'
  | 'sustainability'
  | 'about';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenValidationModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  mobileOpen,
  onCloseMobile,
  onOpenValidationModal,
}) => {
  const { isDark } = useTheme();

  const navItems: { id: PageId; label: string; icon: React.ElementType; sub: string }[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, sub: 'Microgrid Intelligence' },
    { id: 'monitoring', label: 'Energy Monitoring', icon: Sliders, sub: 'Simulation & Inputs' },
    { id: 'scheduler', label: 'Smart Scheduler', icon: CalendarClock, sub: 'Battery & Load Dispatch' },
    { id: 'quantum', label: 'Quantum Lab', icon: Atom, sub: 'QAOA State-Vector Engine' },
    { id: 'comparison', label: 'Classical vs QAOA', icon: GitCompare, sub: 'Fair Benchmarking' },
    { id: 'sustainability', label: 'Sustainability Report', icon: FileSpreadsheet, sub: 'Audit & CSV Export' },
    { id: 'about', label: 'About GreenQ', icon: Info, sub: 'Project Documentation' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#071426] border-r border-slate-200 dark:border-[#152a45] flex flex-col transition-all duration-200 ease-in-out shadow-xs dark:shadow-none lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#152a45] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-[#071426] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-[#35D07F]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">GreenQ</span>
                <span className="text-[10px] font-mono font-semibold text-sky-600 dark:text-[#35C9E7] bg-sky-50 dark:bg-[#35C9E7]/10 px-1.5 py-0.5 rounded border border-sky-200 dark:border-[#35C9E7]/20">
                  QAOA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Hybrid Quantum Scheduler</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#10243A] lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all ${
                  active
                    ? 'bg-emerald-50 dark:bg-[#10243A] text-emerald-950 dark:text-white border border-emerald-200/80 dark:border-[#1e3a5f] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#0c1f36]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white dark:bg-[#35D07F]/20 dark:text-[#35D07F]'
                      : 'bg-slate-100 dark:bg-[#0b1b30] text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-medium leading-tight truncate ${
                      active ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.sub}</div>
                </div>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#35D07F] shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Validation Runner & Project Badge */}
        <div className="p-4 border-t border-slate-200 dark:border-[#152a45] space-y-2.5 bg-slate-50/70 dark:bg-[#091a30]/50">
          <button
            onClick={onOpenValidationModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#10243A] hover:bg-slate-50 dark:hover:bg-[#152e4a] border border-slate-200 dark:border-[#1e3a5f] text-xs text-slate-700 dark:text-slate-200 transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#35D07F] group-hover:scale-110 transition-transform" />
              <span className="font-medium">10-Point Test Suite</span>
            </div>
            <span className="text-[10px] font-mono text-sky-700 dark:text-[#35C9E7] bg-sky-50 dark:bg-[#35C9E7]/10 px-1.5 py-0.5 rounded border border-sky-200 dark:border-[#35C9E7]/20">
              Run
            </span>
          </button>

          <div className="px-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
            <span>Theme: Climate Tech</span>
            <span className="text-emerald-600 dark:text-[#35D07F] font-semibold">v1.0 Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
