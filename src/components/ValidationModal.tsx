/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  X,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { TestCaseResult, runSystemValidationSuite } from '../modules/systemValidation';
import { useTheme } from '../context/ThemeContext';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [suiteResult, setSuiteResult] = useState<{
    allPassed: boolean;
    results: TestCaseResult[];
    timestamp: string;
  }>(() => runSystemValidationSuite());
  const [isRunning, setIsRunning] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runSystemValidationSuite();
      setSuiteResult(res);
      setIsRunning(false);
    }, 300);
  };

  const passCount = suiteResult.results.filter((r) => r.passed).length;
  const totalCount = suiteResult.results.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#10243A] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#152a45] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#35D07F]/15 text-emerald-600 dark:text-[#35D07F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>10-Point Engineering Verification Suite</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    suiteResult.allPassed
                      ? 'text-emerald-700 dark:text-[#35D07F] bg-emerald-50 dark:bg-[#35D07F]/15 border-emerald-200 dark:border-[#35D07F]/30'
                      : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/30'
                  }`}
                >
                  {passCount}/{totalCount} Passed
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated regression testing covering Section 14 physical constraints and algorithms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#071426] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Test List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {suiteResult.results.map((test) => (
            <div
              key={test.id}
              className={`p-3.5 rounded-xl border text-xs transition-colors shadow-xs ${
                test.passed
                  ? 'bg-slate-50/70 dark:bg-[#071426]/70 border-slate-200 dark:border-[#152a45] hover:border-slate-300 dark:hover:border-[#1e3a5f]'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#35D07F] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Case {test.id}: {test.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-[#10243A] px-1.5 py-0.5 rounded">
                        {test.category}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{test.message}</p>

                    {test.metrics && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-slate-200 dark:border-[#152a45] text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {Object.entries(test.metrics).map(([key, val]) => (
                          <span key={key}>
                            {key}: <strong className="text-slate-800 dark:text-slate-200">{val}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                    test.passed
                      ? 'text-emerald-700 dark:text-[#35D07F] bg-emerald-100 dark:bg-[#35D07F]/10'
                      : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/40'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#152a45] flex items-center justify-between bg-slate-50 dark:bg-[#071426]/60">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Last run: {new Date(suiteResult.timestamp).toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRerun}
              disabled={isRunning}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#071426] bg-emerald-600 hover:bg-emerald-700 dark:bg-[#35D07F] dark:hover:bg-[#2cb96c] rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isRunning ? (
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-[#071426] border-t-transparent rounded-full animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>{isRunning ? 'Validating...' : 'Re-run All Tests'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#10243A] hover:bg-slate-100 dark:hover:bg-[#16304e] border border-slate-200 dark:border-[#1e3a5f] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
