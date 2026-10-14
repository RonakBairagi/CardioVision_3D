import React, { useState, useEffect } from 'react';
import { PatientInput, CounterfactualSimulationResult } from '../../types/cardio';
import { apiClient } from '../../services/apiClient';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  HeartPulse,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface CounterfactualExplorerProps {
  baselinePatient: PatientInput;
  onApplySimulatedTo3D: (simulated: PatientInput) => void;
}

export const CounterfactualExplorer: React.FC<CounterfactualExplorerProps> = ({
  baselinePatient,
  onApplySimulatedTo3D
}) => {
  const [systolicBp, setSystolicBp] = useState<number>(baselinePatient.history_vitals.systolic_bp);
  const [isSmoker, setIsSmoker] = useState<boolean>(baselinePatient.history_vitals.current_smoker);
  const [cholesterol, setCholesterol] = useState<number>(baselinePatient.laboratory.cholesterol);
  const [ldl, setLdl] = useState<number>(baselinePatient.laboratory.ldl);
  const [bmi, setBmi] = useState<number>(baselinePatient.demographics.bmi);

  const [simulation, setSimulation] = useState<CounterfactualSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Run simulation whenever parameters change or on button click
  const runSimulation = async (
    targetBp = systolicBp,
    targetSmoker = isSmoker,
    targetChol = cholesterol,
    targetLdl = ldl,
    targetBmi = bmi
  ) => {
    setIsSimulating(true);
    setIsApplied(false);
    try {
      const res = await apiClient.counterfactual(baselinePatient, {
        systolic_bp: targetBp,
        current_smoker: targetSmoker,
        cholesterol: targetChol,
        ldl: targetLdl,
        bmi: targetBmi
      });
      setSimulation(res);
    } catch (err) {
      console.error('Counterfactual simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run initial simulation on mount so the right comparison panel is never blank
  useEffect(() => {
    runSimulation();
  }, [baselinePatient]);

  // Reset to original patient baseline values
  const handleReset = () => {
    const origBp = baselinePatient.history_vitals.systolic_bp;
    const origSmoker = baselinePatient.history_vitals.current_smoker;
    const origChol = baselinePatient.laboratory.cholesterol;
    const origLdl = baselinePatient.laboratory.ldl;
    const origBmi = baselinePatient.demographics.bmi;

    setSystolicBp(origBp);
    setIsSmoker(origSmoker);
    setCholesterol(origChol);
    setLdl(origLdl);
    setBmi(origBmi);
    setIsApplied(false);
    runSimulation(origBp, origSmoker, origChol, origLdl, origBmi);
  };

  // 1-Click Goal Presets
  const applyPresetOptimal = () => {
    const newBp = 118;
    const newSmoker = false;
    const newChol = 165;
    const newLdl = 75;
    const newBmi = 23.5;

    setSystolicBp(newBp);
    setIsSmoker(newSmoker);
    setCholesterol(newChol);
    setLdl(newLdl);
    setBmi(newBmi);
    runSimulation(newBp, newSmoker, newChol, newLdl, newBmi);
  };

  const applyPresetStatin = () => {
    const newChol = Math.max(140, Math.round(cholesterol * 0.7));
    const newLdl = Math.max(65, Math.round(ldl * 0.6));

    setCholesterol(newChol);
    setLdl(newLdl);
    runSimulation(systolicBp, isSmoker, newChol, newLdl, bmi);
  };

  const handleApplyTo3D = () => {
    const updated: PatientInput = {
      ...baselinePatient,
      demographics: {
        ...baselinePatient.demographics,
        bmi
      },
      history_vitals: {
        ...baselinePatient.history_vitals,
        systolic_bp: systolicBp,
        current_smoker: isSmoker
      },
      laboratory: {
        ...baselinePatient.laboratory,
        cholesterol,
        ldl
      }
    };
    setIsApplied(true);
    onApplySimulatedTo3D(updated);
  };

  return (
    <div className="counterfactual-explorer-container">
      {/* Top Header Card */}
      <div className="card cf-header-card">
        <div className="cf-title-group">
          <div className="cf-icon-wrap">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="card-headline">"What-If" Counterfactual Intervention Explorer</h3>
            <p className="card-subtext">
              Simulate clinical modifications (smoking cessation, intensive blood pressure control, lipid-lowering therapy) to observe projected multi-vessel risk deltas.
            </p>
          </div>
        </div>

        <div className="cf-header-actions">
          <button
            type="button"
            className="cf-preset-target-btn"
            onClick={applyPresetOptimal}
            title="Apply comprehensive guideline-directed lifestyle & pharmacological optimization"
          >
            <Sparkles size={13} />
            <span>Optimal Guidelines Preset</span>
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleReset}
            title="Reset parameters to patient's recorded baseline"
          >
            <RotateCcw size={13} />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Controls (Left) vs Real-Time Impact (Right) */}
      <div className="cf-main-grid">
        {/* Left Column: Interactive Clinical Modifiers */}
        <div className="card">
          <div className="cf-section-header-row">
            <h4 className="panel-title">Modifiable Cardiovascular Risk Drivers</h4>
            <div>
              <button
                type="button"
                className="cf-statin-badge-btn"
                onClick={applyPresetStatin}
              >
                + High-Intensity Statin (-40% LDL)
              </button>
            </div>
          </div>

          {/* Systolic BP Slider */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span>Systolic Blood Pressure</span>
              <strong className="font-mono text-cyan-400">{systolicBp} mmHg</strong>
            </div>
            <input
              type="range"
              min={90}
              max={200}
              step={1}
              value={systolicBp}
              onChange={(e) => setSystolicBp(Number(e.target.value))}
              className="range-slider"
            />
            <div className="slider-scale-hints">
              <span>90 (Optimal)</span>
              <span>120 (Normal)</span>
              <span>140 (Stage 1 HTN)</span>
              <span>200 (Severe)</span>
            </div>
          </div>

          {/* Smoking Toggle */}
          <div className="toggle-group-row">
            <div>
              <span className="cf-toggle-title">Tobacco Smoking Status</span>
              <span className="cf-toggle-desc">Cardiovascular endothelial &amp; thrombogenic risk factor</span>
            </div>
            <div className="toggle-buttons">
              <button
                type="button"
                className={`toggle-btn ${!isSmoker ? 'active-green' : ''}`}
                onClick={() => setIsSmoker(false)}
              >
                Non-Smoker / Cessation
              </button>
              <button
                type="button"
                className={`toggle-btn ${isSmoker ? 'active-red' : ''}`}
                onClick={() => setIsSmoker(true)}
              >
                Active Smoker
              </button>
            </div>
          </div>

          {/* Total Cholesterol */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span>Total Serum Cholesterol</span>
              <strong className="font-mono text-cyan-400">{cholesterol} mg/dL</strong>
            </div>
            <input
              type="range"
              min={120}
              max={340}
              step={2}
              value={cholesterol}
              onChange={(e) => setCholesterol(Number(e.target.value))}
              className="range-slider"
            />
            <div className="slider-scale-hints">
              <span>120 (Low)</span>
              <span>200 (Desirable limit)</span>
              <span>240 (High)</span>
              <span>340 (Severe)</span>
            </div>
          </div>

          {/* LDL Cholesterol */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span>LDL Cholesterol (Atherogenic Lipoprotein)</span>
              <strong className="font-mono text-cyan-400">{ldl} mg/dL</strong>
            </div>
            <input
              type="range"
              min={40}
              max={240}
              step={2}
              value={ldl}
              onChange={(e) => setLdl(Number(e.target.value))}
              className="range-slider"
            />
            <div className="slider-scale-hints">
              <span>40 (Very strict target)</span>
              <span>70 (High risk target)</span>
              <span>100 (Optimal)</span>
              <span>240 (Extreme)</span>
            </div>
          </div>

          {/* Body Mass Index */}
          <div className="slider-group">
            <div className="slider-label-row">
              <span>Body Mass Index (BMI)</span>
              <strong className="font-mono text-cyan-400">{bmi.toFixed(1)} kg/m²</strong>
            </div>
            <input
              type="range"
              min={18.0}
              max={42.0}
              step={0.2}
              value={bmi}
              onChange={(e) => setBmi(Number(e.target.value))}
              className="range-slider"
            />
            <div className="slider-scale-hints">
              <span>18.5 (Normal lower)</span>
              <span>25.0 (Normal upper)</span>
              <span>30.0 (Obese class I)</span>
              <span>42.0 (Morbid)</span>
            </div>
          </div>

          <button
            type="button"
            className="cf-run-btn"
            onClick={() => runSimulation()}
            disabled={isSimulating}
          >
            {isSimulating ? 'Computing Calibrated Re-inference...' : 'Recompute Projected Risk'}
          </button>
        </div>

        {/* Right Column: Projected Risk Impact & Multi-Vessel Breakdown */}
        <div className="card">
          <div className="cf-section-header-row">
            <h4 className="panel-title">Projected Therapeutic Impact</h4>
            <span className="font-mono text-xs text-muted">
              Calibrated Platt/Tree Consensus
            </span>
          </div>

          {isSimulating ? (
            <div className="cf-prompt-box">
              <Activity size={24} className="animate-spin text-cyan-400" />
              <span>Simulating counterfactual vascular hemodynamics...</span>
            </div>
          ) : simulation ? (
            <div className="cf-comparison-box">
              {/* Overall CAD Composite Card */}
              <div className="cf-metric-card">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-main">Overall CAD Stenosis Risk (≥50%)</span>
                  {(() => {
                    const delta = simulation.risk_deltas.overall_cad;
                    const deltaPct = Math.round(delta * 100);
                    const isGood = delta <= 0;
                    return (
                      <span className={`delta-badge ${isGood ? 'good' : 'bad'}`}>
                        {isGood ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                        <span>{deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}</span>
                      </span>
                    );
                  })()}
                </div>

                <div className="metric-comparison-row">
                  <div className="before-col">
                    <span className="text-[10px] text-dim font-medium">Baseline Risk</span>
                    <span className="val font-mono">
                      {Math.round(simulation.baseline_probabilities.overall_cad * 100)}%
                    </span>
                  </div>
                  <ArrowRight size={16} className="text-dim" />
                  <div className="after-col">
                    <span className="text-[10px] text-cyan font-medium">Projected Intervened</span>
                    <span className="val simulated font-mono">
                      {Math.round(simulation.counterfactual_probabilities.overall_cad * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Three Epicardial Vessels Subgrid */}
              <div>
                <span className="text-xs font-semibold text-muted block mb-2">
                  Territory-Specific Vascular Response:
                </span>
                <div className="cf-vessels-subgrid">
                  {(['LAD', 'LCX', 'RCA'] as const).map((vKey) => {
                    const baseProb = simulation.baseline_probabilities[vKey];
                    const simProb = simulation.counterfactual_probabilities[vKey];
                    const delta = simulation.risk_deltas[vKey];
                    const deltaPct = Math.round(delta * 100);
                    const isGood = delta <= 0;

                    return (
                      <div key={vKey} className="cf-vessel-card">
                        <span className="vessel-tag">{vKey} Artery</span>
                        <div className="vessel-values-row font-mono">
                          <span className="text-slate-400">{Math.round(baseProb * 100)}%</span>
                          <span>→</span>
                          <strong className="text-cyan-400">{Math.round(simProb * 100)}%</strong>
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${isGood ? 'v-delta green' : 'v-delta red'}`}>
                          {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle & Clinical Narrative Summary */}
              <div className="cf-summary-text-box">
                <HeartPulse size={16} className="shrink-0 text-cyan-400 mt-0.5" />
                <p className="leading-relaxed">
                  {simulation.lifestyle_impact_summary}
                </p>
              </div>

              {/* Apply to 3D Heart Button */}
              <button
                type="button"
                className={`apply-3d-btn ${isApplied ? 'applied' : ''}`}
                onClick={handleApplyTo3D}
                title="Project the simulated counterfactual probability changes onto the 3D heart model and dashboard"
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Projected onto 3D Heart! Switch to Interactive Tab</span>
                  </>
                ) : (
                  <>
                    <Activity size={14} />
                    <span>Project Intervened Profile onto 3D Heart</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="cf-prompt-box">
              <Sliders size={24} className="text-slate-500" />
              <span>Adjust parameters on the left to compute projected risk impact.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
