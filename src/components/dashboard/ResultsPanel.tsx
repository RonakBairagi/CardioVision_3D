import React from 'react';
import { VesselId, PredictionResponse, ShapResponse } from '../../types/cardio';
import { Persona } from '../common/Header';
import { HeartCanvas } from '../3d/HeartCanvas';
import { OverallRiskGauge } from './OverallRiskGauge';
import { VesselRiskCards } from './VesselRiskCards';
import { ShapWaterfall } from './ShapWaterfall';
import { Sliders, FileText, ArrowRight } from 'lucide-react';

interface ResultsPanelProps {
  prediction: PredictionResponse;
  selectedVessel: VesselId | null;
  onSelectVessel: (vessel: VesselId) => void;
  onOpenDrawer?: (vessel: VesselId) => void;
  shapData: ShapResponse | null;
  isLoadingShap: boolean;
  selectedTargetShap: VesselId | 'CAD';
  onSelectTargetShap: (target: VesselId | 'CAD') => void;
  persona: Persona;
  onNavigateToTab: (tab: 'counterfactual' | 'report') => void;
  onShowSafetyModal: () => void;
  theme?: 'dark' | 'light';
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  onOpenDrawer,
  shapData,
  isLoadingShap,
  selectedTargetShap,
  onSelectTargetShap,
  persona,
  onNavigateToTab,
  onShowSafetyModal,
  theme = 'dark'
}) => {
  const p = prediction.predictions;
  const probabilities = {
    LAD: p.vessels.LAD.probability,
    LCX: p.vessels.LCX.probability,
    RCA: p.vessels.RCA.probability
  };

  return (
    <div className="results-panel-container">
      {/* 60% Left Viewport: 3D Anatomical Heart Canvas */}
      <div className="viewport-left-canvas">
        <HeartCanvas
          probabilities={probabilities}
          selectedVessel={selectedVessel}
          onSelectVessel={onSelectVessel}
          onOpenDrawer={onOpenDrawer}
          onShowSafetyModal={onShowSafetyModal}
          theme={theme}
          overallCadProbability={p.overall_cad.probability}
          overallCadRiskClassification={p.overall_cad.risk_classification}
          vesselsData={p.vessels}
        />
      </div>

      {/* 40% Right Viewport: Clinical Analytics & SHAP Dashboard */}
      <div className="viewport-right-dashboard">
        <div className="dashboard-scrollable-content">
          {/* Section 1: Overall CAD Gauge */}
          <OverallRiskGauge
            prediction={p.overall_cad}
            persona={persona}
          />

          {/* Section 2: Vessel Risk Grid */}
          <VesselRiskCards
            vessels={p.vessels}
            selectedVessel={selectedVessel}
            onSelectVessel={onSelectVessel}
            onOpenDrawer={onOpenDrawer}
            persona={persona}
          />

          {/* Section 3: TreeSHAP Attribution Waterfall */}
          <ShapWaterfall
            shapData={shapData}
            isLoading={isLoadingShap}
            selectedTarget={selectedTargetShap}
            onSelectTarget={onSelectTargetShap}
          />

          {/* Action Row */}
          <div className="dashboard-footer-actions">
            <button
              className="quick-action-btn"
              onClick={() => onNavigateToTab('counterfactual')}
            >
              <Sliders size={15} />
              <span>Simulate "What-If" Scenarios</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="quick-action-btn secondary"
              onClick={() => onNavigateToTab('report')}
            >
              <FileText size={15} />
              <span>Export Summary Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
