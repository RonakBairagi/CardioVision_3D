import React, { useState, useEffect, useCallback } from 'react';
import {
  PatientInput,
  PredictionResponse,
  ShapResponse,
  VesselId,
  Archetype
} from './types/cardio';
import { DEMO_ARCHETYPES } from './constants/demoData';
import { apiClient } from './services/apiClient';
import { Header, NavTab, Persona } from './components/common/Header';
import { SafetyBanner } from './components/common/SafetyBanner';
import { ResultsPanel } from './components/dashboard/ResultsPanel';
import { PatientForm } from './components/input/PatientForm';
import { CounterfactualExplorer } from './components/dashboard/CounterfactualExplorer';
import { ModelVerificationHub } from './components/verification/ModelVerificationHub';
import { PrintableReport } from './components/dashboard/PrintableReport';
import { VesselDetailDrawer } from './components/dashboard/VesselDetailDrawer';
import { ArchetypesModal } from './components/dashboard/ArchetypesModal';
import { SafetyProtocolModal } from './components/dashboard/SafetyProtocolModal';
import { InferenceTelemetryModal } from './components/dashboard/InferenceTelemetryModal';

export const App: React.FC = () => {
  // Navigation & Persona & Theme State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [persona, setPersona] = useState<Persona>('clinical');
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('cardiovision_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('cardiovision_theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Patient Intake & Inference State
  // Default initialized to Archetype B (Anterior Ischemia LAD Dominant) for striking visual demonstration
  const [currentPatient, setCurrentPatient] = useState<PatientInput>(
    JSON.parse(JSON.stringify(DEMO_ARCHETYPES[1].payload))
  );
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoadingInference, setIsLoadingInference] = useState<boolean>(false);

  // Vessel Selection & SHAP State
  const [selectedVessel, setSelectedVessel] = useState<VesselId | null>('LAD');
  const [selectedTargetShap, setSelectedTargetShap] = useState<VesselId | 'CAD'>('LAD');
  const [shapData, setShapData] = useState<ShapResponse | null>(null);
  const [isLoadingShap, setIsLoadingShap] = useState<boolean>(false);

  // Modals
  const [isArchetypesModalOpen, setIsArchetypesModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState<boolean>(false);
  const [isVesselDrawerOpen, setIsVesselDrawerOpen] = useState<boolean>(false);

  // Execute Multi-Vessel Inference
  const executeInference = useCallback(async (patientToTest?: PatientInput) => {
    const p = patientToTest || currentPatient;
    setIsLoadingInference(true);
    setIsTelemetryModalOpen(true);

    try {
      const predResult = await apiClient.predict(p);
      setPrediction(predResult);
      setIsBackendOffline(apiClient.getIsOffline());

      // Fetch SHAP attributions for the current selected target
      fetchShapExplanation(p, selectedTargetShap);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setIsLoadingInference(false);
    }
  }, [currentPatient, selectedTargetShap]);

  // Fetch TreeSHAP explanation for a given arterial target
  const fetchShapExplanation = useCallback(async (p: PatientInput, target: VesselId | 'CAD') => {
    setIsLoadingShap(true);
    try {
      const shapResult = await apiClient.explain(p, target);
      setShapData(shapResult);
      setIsBackendOffline(apiClient.getIsOffline());
    } catch (err) {
      console.error('SHAP error:', err);
    } finally {
      setIsLoadingShap(false);
    }
  }, []);

  // Initial load execution on startup
  useEffect(() => {
    executeInference(currentPatient);
  }, []);

  // Handle vessel click in 3D canvas or dashboard card
  const handleSelectVessel = (vessel: VesselId) => {
    setSelectedVessel(vessel);
    setSelectedTargetShap(vessel);
    fetchShapExplanation(currentPatient, vessel);
    setIsVesselDrawerOpen(true);
  };

  // Change target in SHAP widget
  const handleSelectTargetShap = (target: VesselId | 'CAD') => {
    setSelectedTargetShap(target);
    fetchShapExplanation(currentPatient, target);
  };

  // 1-Click Load from Judge Archetypes Modal
  const handleSelectArchetype = (arch: Archetype) => {
    const updated = JSON.parse(JSON.stringify(arch.payload));
    setCurrentPatient(updated);
    executeInference(updated);
    setActiveTab('dashboard');
  };

  // Apply simulated counterfactual to 3D Heart
  const handleApplySimulatedTo3D = (simPatient: PatientInput) => {
    setCurrentPatient(simPatient);
    executeInference(simPatient);
    setActiveTab('dashboard');
  };

  return (
    <div className="app-root" data-theme={theme}>
      {/* Persistent Safety Banner */}
      <SafetyBanner onLearnMore={() => setIsSafetyModalOpen(true)} />

      {/* Primary Application Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        persona={persona}
        onTogglePersona={setPersona}
        onOpenArchetypesModal={() => setIsArchetypesModalOpen(true)}
        isBackendOffline={isBackendOffline}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Viewport Routing */}
      <main className="main-viewport">
        {/* TAB 1: 3D Interactive Dashboard */}
        {activeTab === 'dashboard' && prediction && (
          <ResultsPanel
            prediction={prediction}
            selectedVessel={selectedVessel}
            onSelectVessel={handleSelectVessel}
            shapData={shapData}
            isLoadingShap={isLoadingShap}
            selectedTargetShap={selectedTargetShap}
            onSelectTargetShap={handleSelectTargetShap}
            persona={persona}
            onNavigateToTab={(t) => setActiveTab(t)}
            onShowSafetyModal={() => setIsSafetyModalOpen(true)}
            theme={theme}
          />
        )}

        {/* TAB 2: Patient Clinical Intake Form */}
        {activeTab === 'input' && (
          <PatientForm
            currentPatient={currentPatient}
            onChangePatient={setCurrentPatient}
            onSubmit={() => {
              executeInference(currentPatient);
              setActiveTab('dashboard');
            }}
            isLoading={isLoadingInference}
          />
        )}

        {/* TAB 3: "What-If" Counterfactual Explorer */}
        {activeTab === 'counterfactual' && (
          <CounterfactualExplorer
            baselinePatient={currentPatient}
            onApplySimulatedTo3D={handleApplySimulatedTo3D}
          />
        )}

        {/* TAB 4: Model Verification & Benchmarks Hub */}
        {activeTab === 'verification' && <ModelVerificationHub />}

        {/* TAB 5: Printable Summary Report */}
        {activeTab === 'report' && (
          <PrintableReport
            patient={currentPatient}
            prediction={prediction}
            shapLAD={shapData}
          />
        )}
      </main>

      {/* Telemetry Modal during Inference */}
      <InferenceTelemetryModal
        isOpen={isTelemetryModalOpen}
        onFinish={() => setIsTelemetryModalOpen(false)}
      />

      {/* Vessel Territory Deep-Dive Modal */}
      {selectedVessel && prediction && (
        <VesselDetailDrawer
          vesselId={isVesselDrawerOpen ? selectedVessel : null}
          onClose={() => setIsVesselDrawerOpen(false)}
          vesselRisk={prediction.predictions.vessels[selectedVessel]}
          shapData={shapData}
          isLoadingShap={isLoadingShap}
          onSelectTargetShap={handleSelectTargetShap}
        />
      )}

      {/* Judge Quick Tour Modal */}
      <ArchetypesModal
        isOpen={isArchetypesModalOpen}
        onClose={() => setIsArchetypesModalOpen(false)}
        onSelectArchetype={handleSelectArchetype}
      />

      {/* Clinical Safety Protocol Modal */}
      <SafetyProtocolModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />
    </div>
  );
};

export default App;
