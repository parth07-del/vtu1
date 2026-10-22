/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { EnergyMonitoring } from './components/EnergyMonitoring';
import { SmartScheduler } from './components/SmartScheduler';
import { QuantumLab } from './components/QuantumLab';
import { ClassicalVsQAOA } from './components/ClassicalVsQAOA';
import { SustainabilityReport } from './components/SustainabilityReport';
import { AboutGreenQ } from './components/AboutGreenQ';
import { ValidationModal } from './components/ValidationModal';

import {
  DEFAULT_MICROGRID,
  DEFAULT_TIME_SLOTS,
  PRESET_SCENARIOS,
  buildBaselineSchedule,
  simulateEnergyDispatch,
} from './modules/energyEngine';
import { runClassicalOptimization } from './modules/classicalOptimizer';
import { runQAOASimulation } from './modules/qaoaSimulator';
import {
  TimeSlotConfig,
  MicrogridConfig,
  ScenarioPresetId,
  SchedulePlan,
  QAOASimulationResult,
} from './types/energy';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [validationModalOpen, setValidationModalOpen] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSimulatingQAOA, setIsSimulatingQAOA] = useState<boolean>(false);

  // Scenario and Microgrid parameters
  const defaultPreset = PRESET_SCENARIOS[0]; // Sunny Day
  const [activePresetId, setActivePresetId] = useState<ScenarioPresetId | 'custom'>('sunny');
  const [slots, setSlots] = useState<TimeSlotConfig[]>(defaultPreset.slots);
  const [config, setConfig] = useState<MicrogridConfig>({
    ...DEFAULT_MICROGRID,
    ...defaultPreset.microgrid,
  });

  // Selected schedule view ('baseline' | 'classical' | 'qaoa')
  const [selectedScheduleType, setSelectedScheduleType] = useState<'baseline' | 'classical' | 'qaoa'>('classical');

  // Baseline schedule
  const baselinePlan = useMemo(() => {
    return buildBaselineSchedule(slots, config);
  }, [slots, config]);

  // Classical optimization
  const classicalResult = useMemo(() => {
    return runClassicalOptimization(slots, config);
  }, [slots, config]);

  const classicalPlan = classicalResult.bestPlan;

  // QAOA Simulation state
  const [qaoaResult, setQaoaResult] = useState<QAOASimulationResult>(() => {
    return runQAOASimulation(defaultPreset.slots, {
      ...DEFAULT_MICROGRID,
      ...defaultPreset.microgrid,
    });
  });

  // Update QAOA when scenario changes
  React.useEffect(() => {
    const res = runQAOASimulation(slots, config);
    setQaoaResult(res);
  }, [slots, config]);

  // Derived QAOA schedule plan from best feasible bitstring
  const qaoaPlan = useMemo<SchedulePlan>(() => {
    const bitstring = qaoaResult.bestFeasibleBitstring || '0100';
    const vec = [
      parseInt(bitstring[0], 10),
      parseInt(bitstring[1], 10),
      parseInt(bitstring[2], 10),
      parseInt(bitstring[3], 10),
    ];
    const plan = simulateEnergyDispatch(slots, config, vec, 'qaoa', 1);
    plan.runtimeMs = qaoaResult.runtimeMs;
    return plan;
  }, [slots, config, qaoaResult]);

  // Currently active schedule displayed
  const activePlan = useMemo(() => {
    if (selectedScheduleType === 'baseline') return baselinePlan;
    if (selectedScheduleType === 'qaoa') return qaoaPlan;
    return classicalPlan;
  }, [selectedScheduleType, baselinePlan, classicalPlan, qaoaPlan]);

  // Scenario Switching
  const handleSelectScenario = useCallback((id: ScenarioPresetId) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === id);
    if (!preset) return;
    setActivePresetId(id);
    setSlots(preset.slots);
    setConfig((prev) => ({ ...prev, ...preset.microgrid }));
  }, []);

  const handleUpdateCustomScenario = useCallback(
    (newSlots: TimeSlotConfig[], newConfig: MicrogridConfig, presetId: ScenarioPresetId | 'custom') => {
      setSlots(newSlots);
      setConfig(newConfig);
      setActivePresetId(presetId);
    },
    []
  );

  const handleResetScenario = useCallback(() => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === 'sunny')!;
    setActivePresetId('sunny');
    setSlots(preset.slots);
    setConfig({ ...DEFAULT_MICROGRID, ...preset.microgrid });
  }, []);

  // Run Optimization Trigger
  const handleRunOptimization = useCallback(() => {
    setIsOptimizing(true);
    setTimeout(() => {
      // Re-run QAOA with fresh variational parameter search
      const res = runQAOASimulation(slots, config, { autoOptimize: true });
      setQaoaResult(res);
      setSelectedScheduleType('classical');
      setIsOptimizing(false);
    }, 400);
  }, [slots, config]);

  // Run QAOA with custom params
  const handleRunQAOA = useCallback(
    (params?: {
      gamma?: number;
      beta?: number;
      p?: number;
      shots?: number;
      seed?: number;
      autoOptimize?: boolean;
    }) => {
      setIsSimulatingQAOA(true);
      setTimeout(() => {
        const res = runQAOASimulation(slots, config, params);
        setQaoaResult(res);
        setIsSimulatingQAOA(false);
      }, 300);
    },
    [slots, config]
  );

  // Page title mapping
  const pageTitles: Record<PageId, string> = {
    overview: 'Renewable Energy Intelligence',
    monitoring: 'Energy Monitoring & Microgrid Simulation',
    scheduler: 'Smart Battery & Load Scheduler',
    quantum: 'QAOA Quantum Optimization Lab',
    comparison: 'Classical vs QAOA Benchmarking',
    sustainability: 'Sustainability & Decarbonization Audit',
    about: 'About GreenQ Project Documentation',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#071426] text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onOpenValidationModal={() => setValidationModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 bg-slate-50/70 dark:bg-[#071426] transition-colors">
        <Header
          currentTitle={pageTitles[currentPage]}
          activeScenarioId={activePresetId}
          onSelectScenario={handleSelectScenario}
          onRunOptimization={handleRunOptimization}
          onResetScenario={handleResetScenario}
          onOpenMobile={() => setMobileNavOpen(true)}
          isOptimizing={isOptimizing}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'overview' && (
            <OverviewDashboard
              activePlan={activePlan}
              baselinePlan={baselinePlan}
              slots={slots}
              onRunOptimization={handleRunOptimization}
              onResetScenario={handleResetScenario}
              isOptimizing={isOptimizing}
              selectedScheduleType={selectedScheduleType}
              onSelectScheduleType={setSelectedScheduleType}
            />
          )}

          {currentPage === 'monitoring' && (
            <EnergyMonitoring
              slots={slots}
              config={config}
              activePresetId={activePresetId}
              onUpdateScenario={handleUpdateCustomScenario}
              onResetDefaults={handleResetScenario}
            />
          )}

          {currentPage === 'scheduler' && (
            <SmartScheduler
              currentPlan={activePlan}
              baselinePlan={baselinePlan}
              classicalPlan={classicalPlan}
              qaoaPlan={qaoaPlan}
              selectedPlanType={selectedScheduleType}
              onSelectPlanType={setSelectedScheduleType}
              config={config}
            />
          )}

          {currentPage === 'quantum' && (
            <QuantumLab
              qaoaResult={qaoaResult}
              onRunQAOA={handleRunQAOA}
              isSimulating={isSimulatingQAOA}
              slots={slots}
              config={config}
            />
          )}

          {currentPage === 'comparison' && (
            <ClassicalVsQAOA
              baselinePlan={baselinePlan}
              classicalPlan={classicalPlan}
              qaoaPlan={qaoaPlan}
              qaoaResult={qaoaResult}
            />
          )}

          {currentPage === 'sustainability' && (
            <SustainabilityReport
              activePlan={activePlan}
              baselinePlan={baselinePlan}
              slots={slots}
            />
          )}

          {currentPage === 'about' && <AboutGreenQ />}
        </main>
      </div>

      {/* Automated 10-Point Test Suite Modal */}
      <ValidationModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
      />
    </div>
  );
}
