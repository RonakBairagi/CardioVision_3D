import React, { useState } from 'react';
import { PatientInput, CounterfactualSimulationResult } from '../../types/cardio';
import { apiClient } from '../../services/apiClient';
import { Sliders, Sparkles, TrendingDown, ArrowRight, HeartHandshake, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CounterfactualExplorerProps {
  baselinePatient: PatientInput;
  onApplySimulatedTo3D: (simulatedPatient: PatientInput) => void;
}

export const CounterfactualExplorer: React.FC<CounterfactualExplorerProps> = ({
  baselinePatient,
  onApplySimulatedTo3D
}) => {
  const [systolicBp, setSystolicBp] = useState<number>(baselinePatient.history_vitals.systolic_bp);
  const [isSmoker, setIsSmoker] = useState<boolean>(baselinePatient.history_vitals.current_smoker);
  const [cholesterol, setCholesterol] = useState<number>(baselinePatient.laboratory.cholesterol);
  const [ldl, setLdl] = useState<number>(baselinePatient.laboratory.ldl);
  const [hdl, setHdl] = useState<number>(baselinePatient.laboratory.hdl);
  const [bmi, setBmi] = useState<number>(baselinePatient.demographics.bmi);

  const [simResult, setSimResult] = useState<CounterfactualSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [hasApplied, setHasApplied] = useState<boolean>(false);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await apiClient.counterfactual(baselinePatient, {
        systolic_bp: systolicBp,
        current_smoker: isSmoker,
        cholesterol: cholesterol,
        ldl: ldl,
        hdl: hdl,
        bmi: bmi
      });
      setSimResult(res);

      // Trigger celebratory confetti if significant risk reduction achieved
      if (res.risk_deltas.CAD < -0.15) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyTo3D = () => {
    const updated: PatientInput = JSON.parse(JSON.stringify(baselinePatient));
    updated.history_vitals.systolic_bp = systolicBp;
    updated.history_vitals.current_smoker = isSmoker;
    updated.laboratory.cholesterol = cholesterol;
    updated.laboratory.ldl = ldl;
    updated.laboratory.hdl = hdl;
    updated.demographics.bmi = bmi;

    onApplySimulatedTo3D(updated);
    setHasApplied(true);
    setTimeout(() => setHasApplied(false), 3000);
  };

  const handleSetOptimalTargets = () => {
    setSystolicBp(118);
    setIsSmoker(false);
    setCholesterol(170);
    setLdl(75);
    setHdl(55);
    setBmi(22.5);
  };

  return (
    <div className="counterfactual-explorer-container">
      <div className="cf-header-card">
        <div className="cf-title-group">
          <div className="cf-icon-wrap">
            <Sliders size={22} className="cf-icon" />
          </div>
          <div>
            <h3 className="cf-headline">Interactive "What-If" Risk Factor Simulator</h3>
            <p className="cf-subtext">
              Adjust modifiable risk indicators (hypertension, smoking, lipid panel) to simulate personalized risk reduction pathways.
            </p>
          </div>
        </div>

        <button className="cf-preset-target-btn" onClick={handleSetOptimalTargets}>
          <Sparkles size={14} />
          <span>Apply Optimal Clinical Targets</span>
        </button>
      </div>

      <div className="cf-main-grid">
        {/* Sliders Control Panel */}
        <div className="cf-controls-panel">
          <h4 className="panel-title">Modifiable Risk Factors</h4>

          {/* Systolic BP Slider */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Systolic Blood Pressure (mmHg)</span>
              <span className="slider-value font-mono">{systolicBp} mmHg</span>
            </div>
            <input
              type="range"
              min={90}
              max={200}
              step={1}
              value={systolicBp}
              onChange={(e) => setSystolicBp(parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="slider-scale-hints">
              <span>90 (Optimal)</span>
              <span>120 (Normal)</span>
              <span>140 (Stage 1 HTN)</span>
              <span>180+ (Crisis)</span>
            </div>
          </div>

          {/* Smoking Toggle */}
          <div className="toggle-group-row">
            <span className="slider-title">Active Tobacco Smoker</span>
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${!isSmoker ? 'active-green' : ''}`}
                onClick={() => setIsSmoker(false)}
              >
                No (Cessation)
              </button>
              <button
                className={`toggle-btn ${isSmoker ? 'active-red' : ''}`}
                onClick={() => setIsSmoker(true)}
              >
                Yes (Smoker)
              </button>
            </div>
          </div>

          {/* Cholesterol Slider */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Total Serum Cholesterol (mg/dL)</span>
              <span className="slider-value font-mono">{cholesterol} mg/dL</span>
            </div>
            <input
              type="range"
              min={120}
              max={350}
              step={5}
              value={cholesterol}
              onChange={(e) => setCholesterol(parseInt(e.target.value))}
              className="range-slider"
            />
          </div>

          {/* LDL-C Slider */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">LDL Cholesterol (mg/dL)</span>
              <span className="slider-value font-mono">{ldl} mg/dL</span>
            </div>
            <input
              type="range"
              min={40}
              max={250}
              step={5}
              value={ldl}
              onChange={(e) => setLdl(parseInt(e.target.value))}
              className="range-slider"
            />
          </div>

          {/* HDL-C Slider */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">HDL Cholesterol (Protective, mg/dL)</span>
              <span className="slider-value font-mono">{hdl} mg/dL</span>
            </div>
            <input
              type="range"
              min={20}
              max={90}
              step={2}
              value={hdl}
              onChange={(e) => setHdl(parseInt(e.target.value))}
              className="range-slider"
            />
          </div>

          {/* BMI Slider */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Body Mass Index (BMI, kg/m²)</span>
              <span className="slider-value font-mono">{bmi.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={18.5}
              max={45.0}
              step={0.5}
              value={bmi}
              onChange={(e) => setBmi(parseFloat(e.target.value))}
              className="range-slider"
            />
          </div>

          <button
            className="cf-run-btn"
            onClick={handleRunSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? 'Recalculating Ensemble Risk...' : 'Simulate Intervention Impact'}
          </button>
        </div>

        {/* Simulation Results Comparison Panel */}
        <div className="cf-results-panel">
          <h4 className="panel-title">Predicted Risk Trajectory</h4>

          {!simResult ? (
            <div className="cf-prompt-box">
              <Sparkles size={28} className="cf-prompt-icon" />
              <p>Adjust the sliders and click <strong>Simulate Intervention Impact</strong> to calculate delta risk reductions.</p>
            </div>
          ) : (
            <div className="cf-comparison-box">
              {/* Overall CAD Comparison */}
              <div className="cf-metric-card highlight">
                <span className="metric-eyebrow">Overall CAD Likelihood</span>
                <div className="metric-comparison-row">
                  <div className="before-col">
                    <span className="label">Baseline:</span>
                    <strong className="val font-mono">{Math.round(simResult.baseline_probabilities.CAD * 100)}%</strong>
                  </div>
                  <div className="arrow-col">
                    <ArrowRight size={18} />
                  </div>
                  <div className="after-col">
                    <span className="label">Intervention:</span>
                    <strong className="val simulated font-mono">
                      {Math.round(simResult.counterfactual_probabilities.CAD * 100)}%
                    </strong>
                  </div>
                  <div className="delta-col">
                    <span className={`delta-badge ${simResult.risk_deltas.CAD <= 0 ? 'good' : 'bad'}`}>
                      <TrendingDown size={14} />
                      {Math.round(simResult.risk_deltas.CAD * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Vessel Specific Reductions */}
              <div className="cf-vessels-subgrid">
                {(['LAD', 'LCX', 'RCA'] as const).map((vId) => {
                  const baseP = Math.round(simResult.baseline_probabilities[vId] * 100);
                  const simP = Math.round(simResult.counterfactual_probabilities[vId] * 100);
                  const delta = Math.round(simResult.risk_deltas[vId] * 100);

                  return (
                    <div key={vId} className="cf-vessel-card">
                      <span className="vessel-tag">{vId}</span>
                      <div className="vessel-values-row">
                        <span className="v-base font-mono">{baseP}%</span>
                        <span className="v-arr">&rarr;</span>
                        <strong className="v-sim font-mono">{simP}%</strong>
                      </div>
                      <span className={`v-delta ${delta <= 0 ? 'green' : 'red'}`}>
                        {delta > 0 ? `+${delta}%` : `${delta}%`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Plain-English Clinical Summary */}
              <div className="cf-summary-text-box">
                <HeartHandshake size={18} className="summary-icon" />
                <p>{simResult.lifestyle_impact_summary}</p>
              </div>

              {/* Apply to 3D Viewer Button */}
              <button
                className={`apply-3d-btn ${hasApplied ? 'applied' : ''}`}
                onClick={handleApplyTo3D}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Applied to 3D Model!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Project Simulated Risk Onto 3D Heart</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
