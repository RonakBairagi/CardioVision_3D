import React, { useState } from 'react';
import { PatientInput, Demographics, HistoryVitals, Laboratory, EcgEcho } from '../../types/cardio';
import { DEMO_ARCHETYPES } from '../../constants/demoData';
import { Play, Sparkles, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PatientFormProps {
  currentPatient: PatientInput;
  onChangePatient: (patient: PatientInput) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  currentPatient,
  onChangePatient,
  onSubmit,
  isLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'demo' | 'vitals' | 'labs' | 'ecg'>('demo');

  const updateDemographics = (fields: Partial<Demographics>) => {
    onChangePatient({
      ...currentPatient,
      demographics: { ...currentPatient.demographics, ...fields }
    });
  };

  const updateVitals = (fields: Partial<HistoryVitals>) => {
    onChangePatient({
      ...currentPatient,
      history_vitals: { ...currentPatient.history_vitals, ...fields }
    });
  };

  const updateLabs = (fields: Partial<Laboratory>) => {
    onChangePatient({
      ...currentPatient,
      laboratory: { ...currentPatient.laboratory, ...fields }
    });
  };

  const updateEcgEcho = (fields: Partial<EcgEcho>) => {
    onChangePatient({
      ...currentPatient,
      ecg_echo: { ...currentPatient.ecg_echo, ...fields }
    });
  };

  const handleSelectPreset = (presetId: string) => {
    const arch = DEMO_ARCHETYPES.find((a) => a.id === presetId);
    if (arch) {
      onChangePatient(JSON.parse(JSON.stringify(arch.payload)));
    }
  };

  return (
    <div className="patient-form-container">
      {/* Top 1-Click Archetype Preset Bar */}
      <div className="preset-bar-card">
        <div className="preset-bar-header">
          <div className="preset-title-wrap">
            <Sparkles size={16} className="sparkle-gold" />
            <span>Preloaded Demonstration Archetypes (Z-Alizadeh Sani Benchmark Cohort)</span>
          </div>
          <span className="preset-hint">1-Click loading for rapid evaluator testing</span>
        </div>
        <div className="preset-chips-row">
          {DEMO_ARCHETYPES.map((arch) => (
            <button
              key={arch.id}
              className={`preset-chip ${arch.badge_color}`}
              onClick={() => handleSelectPreset(arch.id)}
            >
              <span className="chip-badge">{arch.badge}</span>
              <span className="chip-label">{arch.title.split(':')[1] || arch.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Intake Card with Tabs */}
      <div className="form-card">
        <div className="form-nav-tabs">
          <button
            className={`form-nav-btn ${activeSubTab === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('demo')}
          >
            1. Demographics
          </button>
          <button
            className={`form-nav-btn ${activeSubTab === 'vitals' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('vitals')}
          >
            2. Vitals & Medical History
          </button>
          <button
            className={`form-nav-btn ${activeSubTab === 'labs' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('labs')}
          >
            3. Laboratory Assays
          </button>
          <button
            className={`form-nav-btn ${activeSubTab === 'ecg' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('ecg')}
          >
            4. ECG & Echocardiography
          </button>
        </div>

        <div className="form-tab-content">
          {/* TAB 1: DEMOGRAPHICS */}
          {activeSubTab === 'demo' && (
            <div className="form-grid">
              <div className="form-field">
                <label>Age (years)</label>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={currentPatient.demographics.age}
                  onChange={(e) => updateDemographics({ age: parseInt(e.target.value) || 50 })}
                />
                <span className="field-hint">Valid range: 18 - 100 yrs</span>
              </div>

              <div className="form-field">
                <label>Biological Sex</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="sex"
                      checked={currentPatient.demographics.sex === 'Male'}
                      onChange={() => updateDemographics({ sex: 'Male' })}
                    />
                    <span>Male</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="sex"
                      checked={currentPatient.demographics.sex === 'Female'}
                      onChange={() => updateDemographics({ sex: 'Female' })}
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label>Body Mass Index (BMI, kg/m²)</label>
                <input
                  type="number"
                  step="0.1"
                  min={15}
                  max={55}
                  value={currentPatient.demographics.bmi}
                  onChange={(e) => updateDemographics({ bmi: parseFloat(e.target.value) || 25 })}
                />
                <span className="field-hint">Normal: 18.5 - 24.9</span>
              </div>
            </div>
          )}

          {/* TAB 2: VITALS & HISTORY */}
          {activeSubTab === 'vitals' && (
            <div className="form-grid">
              <div className="form-field">
                <label>Systolic Blood Pressure (mmHg)</label>
                <input
                  type="number"
                  min={70}
                  max={240}
                  value={currentPatient.history_vitals.systolic_bp}
                  onChange={(e) => updateVitals({ systolic_bp: parseInt(e.target.value) || 120 })}
                />
                <span className="field-hint">Optimal: &lt; 120 mmHg</span>
              </div>

              <div className="form-field">
                <label>Resting Pulse / Heart Rate (bpm)</label>
                <input
                  type="number"
                  min={40}
                  max={180}
                  value={currentPatient.history_vitals.pulse_rate}
                  onChange={(e) => updateVitals({ pulse_rate: parseInt(e.target.value) || 72 })}
                />
                <span className="field-hint">Normal: 60 - 100 bpm</span>
              </div>

              <div className="form-field full-width">
                <label className="field-group-title">Clinical Risk Factors & History</label>
                <div className="checkbox-grid">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.history_vitals.current_smoker}
                      onChange={(e) => updateVitals({ current_smoker: e.target.checked })}
                    />
                    <span>Active Tobacco Smoker</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.history_vitals.hypertension}
                      onChange={(e) => updateVitals({ hypertension: e.target.checked })}
                    />
                    <span>Hypertension History</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.history_vitals.diabetes}
                      onChange={(e) => updateVitals({ diabetes: e.target.checked })}
                    />
                    <span>Diabetes Mellitus</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.history_vitals.family_history}
                      onChange={(e) => updateVitals({ family_history: e.target.checked })}
                    />
                    <span>Family History of Premature CAD</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.history_vitals.typical_chest_pain}
                      onChange={(e) => updateVitals({ typical_chest_pain: e.target.checked })}
                    />
                    <span>Typical Anginal Chest Pain</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.history_vitals.dyspnea}
                      onChange={(e) => updateVitals({ dyspnea: e.target.checked })}
                    />
                    <span>Exertional Dyspnea</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LABORATORY ASSAYS */}
          {activeSubTab === 'labs' && (
            <div className="form-grid">
              <div className="form-field">
                <label>Fasting Blood Sugar (FBS, mg/dL)</label>
                <input
                  type="number"
                  min={50}
                  max={450}
                  value={currentPatient.laboratory.fbs}
                  onChange={(e) => updateLabs({ fbs: parseFloat(e.target.value) || 90 })}
                />
                <span className="field-hint">Normal: 70 - 99 mg/dL</span>
              </div>

              <div className="form-field">
                <label>Total Serum Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  min={100}
                  max={500}
                  value={currentPatient.laboratory.cholesterol}
                  onChange={(e) => updateLabs({ cholesterol: parseFloat(e.target.value) || 190 })}
                />
                <span className="field-hint">Desirable: &lt; 200 mg/dL</span>
              </div>

              <div className="form-field">
                <label>Low-Density Lipoprotein (LDL, mg/dL)</label>
                <input
                  type="number"
                  min={30}
                  max={350}
                  value={currentPatient.laboratory.ldl}
                  onChange={(e) => updateLabs({ ldl: parseFloat(e.target.value) || 100 })}
                />
                <span className="field-hint">Optimal: &lt; 100 mg/dL</span>
              </div>

              <div className="form-field">
                <label>High-Density Lipoprotein (HDL, mg/dL)</label>
                <input
                  type="number"
                  min={15}
                  max={120}
                  value={currentPatient.laboratory.hdl}
                  onChange={(e) => updateLabs({ hdl: parseFloat(e.target.value) || 50 })}
                />
                <span className="field-hint">Protective: &ge; 50 mg/dL</span>
              </div>

              <div className="form-field">
                <label>Triglycerides (mg/dL)</label>
                <input
                  type="number"
                  min={40}
                  max={800}
                  value={currentPatient.laboratory.triglycerides}
                  onChange={(e) => updateLabs({ triglycerides: parseFloat(e.target.value) || 150 })}
                />
                <span className="field-hint">Normal: &lt; 150 mg/dL</span>
              </div>

              <div className="form-field">
                <label>Blood Urea Nitrogen (BUN, mg/dL)</label>
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={currentPatient.laboratory.bun}
                  onChange={(e) => updateLabs({ bun: parseFloat(e.target.value) || 15 })}
                />
                <span className="field-hint">Normal: 7 - 20 mg/dL</span>
              </div>

              <div className="form-field">
                <label>Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.05"
                  min={0.4}
                  max={8.0}
                  value={currentPatient.laboratory.creatinine}
                  onChange={(e) => updateLabs({ creatinine: parseFloat(e.target.value) || 1.0 })}
                />
                <span className="field-hint">Normal: 0.7 - 1.3 mg/dL</span>
              </div>
            </div>
          )}

          {/* TAB 4: ECG & ECHO */}
          {activeSubTab === 'ecg' && (
            <div className="form-grid">
              <div className="form-field">
                <label>Left Ventricular Ejection Fraction (LVEF, %)</label>
                <input
                  type="number"
                  min={15}
                  max={80}
                  value={currentPatient.ecg_echo.ejection_fraction}
                  onChange={(e) => updateEcgEcho({ ejection_fraction: parseFloat(e.target.value) || 55 })}
                />
                <span className="field-hint">Normal: &ge; 55%</span>
              </div>

              <div className="form-field">
                <label>Echocardiographic RWMA Territory</label>
                <select
                  value={currentPatient.ecg_echo.region_with_rwma}
                  onChange={(e) => updateEcgEcho({ region_with_rwma: e.target.value as any })}
                  className="form-select"
                >
                  <option value="None">None (Normal Wall Motion)</option>
                  <option value="Anterior">Anterior (LAD territory)</option>
                  <option value="Inferior">Inferior (RCA territory)</option>
                  <option value="Lateral">Lateral (LCX territory)</option>
                  <option value="Septal">Septal (LAD/RCA territory)</option>
                  <option value="Apical">Apical (LAD territory)</option>
                </select>
                <span className="field-hint">Correlates with arterial perfusion beds</span>
              </div>

              <div className="form-field full-width">
                <label className="field-group-title">12-Lead Resting Electrocardiography (ECG)</label>
                <div className="checkbox-grid">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.ecg_echo.st_elevation}
                      onChange={(e) => updateEcgEcho({ st_elevation: e.target.checked })}
                    />
                    <span>ST-Segment Elevation</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.ecg_echo.st_depression}
                      onChange={(e) => updateEcgEcho({ st_depression: e.target.checked })}
                    />
                    <span>ST-Segment Depression</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.ecg_echo.t_inversion}
                      onChange={(e) => updateEcgEcho({ t_inversion: e.target.checked })}
                    />
                    <span>T-Wave Inversion</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.ecg_echo.poor_r_wave_progression}
                      onChange={(e) => updateEcgEcho({ poor_r_wave_progression: e.target.checked })}
                    />
                    <span>Poor R-Wave Progression (PRWP)</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentPatient.ecg_echo.lvh}
                      onChange={(e) => updateEcgEcho({ lvh: e.target.checked })}
                    />
                    <span>Left Ventricular Hypertrophy (LVH)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leakage Quarantine Guarantee Notice */}
        <div className="form-safety-notice">
          <ShieldAlert size={14} className="safety-icon" />
          <span>
            <strong>Programmatic Target-Leakage Quarantine:</strong> Diagnostic catheterization ground-truth fields (<code>LAD</code>, <code>LCX</code>, <code>RCA</code>, <code>Cath</code>) are strictly quarantined from the input feature matrix.
          </span>
        </div>

        {/* CTA Bar */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => handleSelectPreset('archetype_a')}
          >
            <RotateCcw size={14} />
            <span>Reset to Baseline (Healthy)</span>
          </button>

          <button
            type="button"
            className="primary-cta-btn"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Running Calibrated Ensembles...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Execute Multi-Vessel Risk Model</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
