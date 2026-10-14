import React, { useState, useMemo } from 'react';
import { PatientInput, Demographics, HistoryVitals, Laboratory, EcgEcho } from '../../types/cardio';
import { DEMO_ARCHETYPES } from '../../constants/demoData';
import {
  Play,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { validatePatientInput, FieldValidation } from '../../utils/clinicalValidation';

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

  // Compute smart clinical validation
  const validation = useMemo(() => {
    return validatePatientInput(currentPatient);
  }, [currentPatient]);

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

  // Safe number parser that does not silently fabricate values
  const parseNumberInput = (val: string): number => {
    if (val.trim() === '') return NaN;
    const num = Number(val);
    return isNaN(num) ? NaN : num;
  };

  // Render inline field validation error or warning
  const renderFieldFeedback = (key: string, defaultHint: string) => {
    const field: FieldValidation | undefined = validation.fields[key];
    if (!field) return <span className="field-hint">{defaultHint}</span>;

    if (field.status === 'error') {
      return (
        <div className="field-validation-msg error" role="alert">
          <AlertCircle size={13} className="val-icon" />
          <span>{field.message}</span>
        </div>
      );
    }

    if (field.status === 'warning') {
      return (
        <div className="field-validation-msg warning" role="status">
          <AlertTriangle size={13} className="val-icon" />
          <span>{field.message}</span>
        </div>
      );
    }

    return (
      <span className="field-hint valid">
        <CheckCircle2 size={11} className="valid-hint-icon" />
        {defaultHint}
      </span>
    );
  };

  const getFieldClass = (key: string): string => {
    const field: FieldValidation | undefined = validation.fields[key];
    if (!field) return '';
    if (field.status === 'error') return 'input-error';
    if (field.status === 'warning') return 'input-warning';
    return 'input-valid';
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
              type="button"
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
            type="button"
          >
            <span>1. Demographics</span>
            {validation.tabIssues.demo.errors > 0 ? (
              <span className="tab-badge error" title={`${validation.tabIssues.demo.errors} error(s)`}>
                {validation.tabIssues.demo.errors}
              </span>
            ) : validation.tabIssues.demo.warnings > 0 ? (
              <span className="tab-badge warning" title={`${validation.tabIssues.demo.warnings} warning(s)`}>
                {validation.tabIssues.demo.warnings}
              </span>
            ) : null}
          </button>

          <button
            className={`form-nav-btn ${activeSubTab === 'vitals' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('vitals')}
            type="button"
          >
            <span>2. Vitals &amp; Medical History</span>
            {validation.tabIssues.vitals.errors > 0 ? (
              <span className="tab-badge error" title={`${validation.tabIssues.vitals.errors} error(s)`}>
                {validation.tabIssues.vitals.errors}
              </span>
            ) : validation.tabIssues.vitals.warnings > 0 ? (
              <span className="tab-badge warning" title={`${validation.tabIssues.vitals.warnings} warning(s)`}>
                {validation.tabIssues.vitals.warnings}
              </span>
            ) : null}
          </button>

          <button
            className={`form-nav-btn ${activeSubTab === 'labs' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('labs')}
            type="button"
          >
            <span>3. Laboratory Assays</span>
            {validation.tabIssues.labs.errors > 0 ? (
              <span className="tab-badge error" title={`${validation.tabIssues.labs.errors} error(s)`}>
                {validation.tabIssues.labs.errors}
              </span>
            ) : validation.tabIssues.labs.warnings > 0 ? (
              <span className="tab-badge warning" title={`${validation.tabIssues.labs.warnings} warning(s)`}>
                {validation.tabIssues.labs.warnings}
              </span>
            ) : null}
          </button>

          <button
            className={`form-nav-btn ${activeSubTab === 'ecg' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('ecg')}
            type="button"
          >
            <span>4. ECG &amp; Echocardiography</span>
            {validation.tabIssues.ecg.errors > 0 ? (
              <span className="tab-badge error" title={`${validation.tabIssues.ecg.errors} error(s)`}>
                {validation.tabIssues.ecg.errors}
              </span>
            ) : validation.tabIssues.ecg.warnings > 0 ? (
              <span className="tab-badge warning" title={`${validation.tabIssues.ecg.warnings} warning(s)`}>
                {validation.tabIssues.ecg.warnings}
              </span>
            ) : null}
          </button>
        </div>

        <div className="form-tab-content">
          {/* TAB 1: DEMOGRAPHICS */}
          {activeSubTab === 'demo' && (
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="input-age">
                  Age (years) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-age"
                  type="number"
                  min={18}
                  max={120}
                  className={getFieldClass('age')}
                  value={isNaN(currentPatient.demographics.age) ? '' : currentPatient.demographics.age}
                  onChange={(e) => updateDemographics({ age: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 58"
                />
                {renderFieldFeedback('age', 'Valid clinical cohort range: 18 - 120 yrs')}
              </div>

              <div className="form-field">
                <label>
                  Biological Sex <span className="req-marker">*</span>
                </label>
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
                {renderFieldFeedback('sex', 'Required for gender-specific risk scaling')}
              </div>

              <div className="form-field">
                <label htmlFor="input-bmi">
                  Body Mass Index (BMI, kg/m²) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-bmi"
                  type="number"
                  step="0.1"
                  min={10}
                  max={80}
                  className={getFieldClass('bmi')}
                  value={isNaN(currentPatient.demographics.bmi) ? '' : currentPatient.demographics.bmi}
                  onChange={(e) => updateDemographics({ bmi: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 26.4"
                />
                {renderFieldFeedback('bmi', 'Normal range: 18.5 - 24.9 kg/m²')}
              </div>
            </div>
          )}

          {/* TAB 2: VITALS & HISTORY */}
          {activeSubTab === 'vitals' && (
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="input-sbp">
                  Systolic Blood Pressure (mmHg) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-sbp"
                  type="number"
                  min={60}
                  max={260}
                  className={getFieldClass('systolic_bp')}
                  value={isNaN(currentPatient.history_vitals.systolic_bp) ? '' : currentPatient.history_vitals.systolic_bp}
                  onChange={(e) => updateVitals({ systolic_bp: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 132"
                />
                {renderFieldFeedback('systolic_bp', 'Optimal: < 120 mmHg; Stage 1 HTN: ≥ 130 mmHg')}
              </div>

              <div className="form-field">
                <label htmlFor="input-pulse">
                  Resting Pulse / Heart Rate (bpm) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-pulse"
                  type="number"
                  min={30}
                  max={220}
                  className={getFieldClass('pulse_rate')}
                  value={isNaN(currentPatient.history_vitals.pulse_rate) ? '' : currentPatient.history_vitals.pulse_rate}
                  onChange={(e) => updateVitals({ pulse_rate: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 74"
                />
                {renderFieldFeedback('pulse_rate', 'Normal resting: 60 - 100 bpm')}
              </div>

              <div className="form-field full-width">
                <label className="field-group-title">Clinical Risk Factors &amp; Symptoms</label>
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
                <label htmlFor="input-fbs">
                  Fasting Blood Sugar (FBS, mg/dL) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-fbs"
                  type="number"
                  min={40}
                  max={600}
                  className={getFieldClass('fbs')}
                  value={isNaN(currentPatient.laboratory.fbs) ? '' : currentPatient.laboratory.fbs}
                  onChange={(e) => updateLabs({ fbs: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 95"
                />
                {renderFieldFeedback('fbs', 'Normal: 70 - 99 mg/dL; Diabetic threshold: ≥ 126 mg/dL')}
              </div>

              <div className="form-field">
                <label htmlFor="input-chol">
                  Total Serum Cholesterol (mg/dL) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-chol"
                  type="number"
                  min={70}
                  max={600}
                  className={getFieldClass('cholesterol')}
                  value={isNaN(currentPatient.laboratory.cholesterol) ? '' : currentPatient.laboratory.cholesterol}
                  onChange={(e) => updateLabs({ cholesterol: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 210"
                />
                {renderFieldFeedback('cholesterol', 'Desirable: < 200 mg/dL; High: ≥ 240 mg/dL')}
              </div>

              <div className="form-field">
                <label htmlFor="input-ldl">
                  Low-Density Lipoprotein (LDL, mg/dL) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-ldl"
                  type="number"
                  min={20}
                  max={400}
                  className={getFieldClass('ldl')}
                  value={isNaN(currentPatient.laboratory.ldl) ? '' : currentPatient.laboratory.ldl}
                  onChange={(e) => updateLabs({ ldl: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 115"
                />
                {renderFieldFeedback('ldl', 'Optimal: < 100 mg/dL; Must not exceed Total Cholesterol')}
              </div>

              <div className="form-field">
                <label htmlFor="input-hdl">
                  High-Density Lipoprotein (HDL, mg/dL) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-hdl"
                  type="number"
                  min={10}
                  max={140}
                  className={getFieldClass('hdl')}
                  value={isNaN(currentPatient.laboratory.hdl) ? '' : currentPatient.laboratory.hdl}
                  onChange={(e) => updateLabs({ hdl: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 48"
                />
                {renderFieldFeedback('hdl', 'Protective: ≥ 50 mg/dL; Major risk factor: < 40 mg/dL')}
              </div>

              <div className="form-field">
                <label htmlFor="input-tg">
                  Triglycerides (mg/dL) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-tg"
                  type="number"
                  min={30}
                  max={1200}
                  className={getFieldClass('triglycerides')}
                  value={isNaN(currentPatient.laboratory.triglycerides) ? '' : currentPatient.laboratory.triglycerides}
                  onChange={(e) => updateLabs({ triglycerides: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 155"
                />
                {renderFieldFeedback('triglycerides', 'Normal: < 150 mg/dL; High: 200 - 499 mg/dL')}
              </div>

              <div className="form-field">
                <label htmlFor="input-bun">
                  Blood Urea Nitrogen (BUN, mg/dL) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-bun"
                  type="number"
                  min={2}
                  max={150}
                  className={getFieldClass('bun')}
                  value={isNaN(currentPatient.laboratory.bun) ? '' : currentPatient.laboratory.bun}
                  onChange={(e) => updateLabs({ bun: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 16"
                />
                {renderFieldFeedback('bun', 'Normal reference: 7 - 20 mg/dL')}
              </div>

              <div className="form-field">
                <label htmlFor="input-cr">
                  Serum Creatinine (mg/dL) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-cr"
                  type="number"
                  step="0.05"
                  min={0.2}
                  max={12.0}
                  className={getFieldClass('creatinine')}
                  value={isNaN(currentPatient.laboratory.creatinine) ? '' : currentPatient.laboratory.creatinine}
                  onChange={(e) => updateLabs({ creatinine: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 0.95"
                />
                {renderFieldFeedback('creatinine', 'Normal reference: 0.7 - 1.3 mg/dL')}
              </div>
            </div>
          )}

          {/* TAB 4: ECG & ECHO */}
          {activeSubTab === 'ecg' && (
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="input-lvef">
                  Left Ventricular Ejection Fraction (LVEF, %) <span className="req-marker">*</span>
                </label>
                <input
                  id="input-lvef"
                  type="number"
                  min={10}
                  max={85}
                  className={getFieldClass('ejection_fraction')}
                  value={isNaN(currentPatient.ecg_echo.ejection_fraction) ? '' : currentPatient.ecg_echo.ejection_fraction}
                  onChange={(e) => updateEcgEcho({ ejection_fraction: parseNumberInput(e.target.value) })}
                  placeholder="e.g. 55"
                />
                {renderFieldFeedback('ejection_fraction', 'Normal preserved LVEF: ≥ 55%')}
              </div>

              <div className="form-field">
                <label htmlFor="input-rwma">
                  Echocardiographic RWMA Territory <span className="req-marker">*</span>
                </label>
                <select
                  id="input-rwma"
                  value={currentPatient.ecg_echo.region_with_rwma}
                  onChange={(e) => updateEcgEcho({ region_with_rwma: e.target.value as any })}
                  className={`form-select ${getFieldClass('region_with_rwma')}`}
                >
                  <option value="None">None (Normal Global Wall Motion)</option>
                  <option value="Anterior">Anterior (LAD territory)</option>
                  <option value="Inferior">Inferior (RCA territory)</option>
                  <option value="Lateral">Lateral (LCX territory)</option>
                  <option value="Septal">Septal (LAD/RCA territory)</option>
                  <option value="Apical">Apical (LAD territory)</option>
                </select>
                {renderFieldFeedback('region_with_rwma', 'Direct physiological correlate for arterial perfusion bed')}
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

        {/* Validation Status Summary Banner */}
        {!validation.isValid && (
          <div className="form-validation-summary-banner error" role="alert">
            <AlertCircle size={18} className="banner-icon" />
            <div className="banner-text">
              <strong>Prediction Blocked: {validation.errorCount} required clinical input(s) are missing or invalid.</strong>
              <span>
                Please correct the flagged inputs in the highlighted tabs before executing the multi-vessel model.
              </span>
              <div className="banner-jump-buttons">
                {validation.tabIssues.demo.errors > 0 && (
                  <button
                    type="button"
                    className="banner-jump-btn error"
                    onClick={() => setActiveSubTab('demo')}
                  >
                    Demographics ({validation.tabIssues.demo.errors})
                  </button>
                )}
                {validation.tabIssues.vitals.errors > 0 && (
                  <button
                    type="button"
                    className="banner-jump-btn error"
                    onClick={() => setActiveSubTab('vitals')}
                  >
                    Vitals &amp; History ({validation.tabIssues.vitals.errors})
                  </button>
                )}
                {validation.tabIssues.labs.errors > 0 && (
                  <button
                    type="button"
                    className="banner-jump-btn error"
                    onClick={() => setActiveSubTab('labs')}
                  >
                    Laboratory Assays ({validation.tabIssues.labs.errors})
                  </button>
                )}
                {validation.tabIssues.ecg.errors > 0 && (
                  <button
                    type="button"
                    className="banner-jump-btn error"
                    onClick={() => setActiveSubTab('ecg')}
                  >
                    ECG &amp; Echo ({validation.tabIssues.ecg.errors})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {validation.isValid && validation.warningCount > 0 && (
          <div className="form-validation-summary-banner warning" role="status">
            <AlertTriangle size={18} className="banner-icon" />
            <div className="banner-text">
              <strong>Clinical Review Notice: {validation.warningCount} unusual physiological value(s) detected.</strong>
              <span>
                These values are outside typical clinical reference bands but remain biologically plausible. Model execution is allowed.
              </span>
              <div className="banner-jump-buttons">
                {validation.tabIssues.demo.warnings > 0 && (
                  <button
                    type="button"
                    className="banner-jump-btn warning"
                    onClick={() => setActiveSubTab('demo')}
                  >
                    Demographics ({validation.tabIssues.demo.warnings})
                  </button>
                )}
                {validation.tabIssues.vitals.warnings > 0 && (
                  <button
                    type="button"
                    className="banner-jump-btn warning"
                    onClick={() => setActiveSubTab('vitals')}
                  >
                    Vitals &amp; History ({validation.tabIssues.vitals.warnings})
                  </button>
                )}
                {validation.tabIssues.labs.warnings > 0 && (
                  <button
                    type="button"
                    className="banner-jump-btn warning"
                    onClick={() => setActiveSubTab('labs')}
                  >
                    Laboratory Assays ({validation.tabIssues.labs.warnings})
                  </button>
                )}
                {validation.tabIssues.ecg.warnings > 0 && (
                  <button
                    type="button"
                    className="banner-jump-btn warning"
                    onClick={() => setActiveSubTab('ecg')}
                  >
                    ECG &amp; Echo ({validation.tabIssues.ecg.warnings})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
            className={`primary-cta-btn ${!validation.isValid ? 'btn-disabled' : ''}`}
            onClick={onSubmit}
            disabled={isLoading || !validation.isValid}
            title={!validation.isValid ? 'Correct validation errors before running prediction' : 'Execute calibrated CAD and multi-vessel inference'}
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
