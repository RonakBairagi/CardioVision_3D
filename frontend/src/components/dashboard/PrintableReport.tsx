import React from 'react';
import { PatientInput, PredictionResponse, ShapResponse } from '../../types/cardio';
import { SvgHeartFallback } from '../3d/SvgHeartFallback';
import { Printer, Download, ShieldCheck, HeartPulse } from 'lucide-react';

interface PrintableReportProps {
  patient: PatientInput;
  prediction: PredictionResponse | null;
  shapLAD: ShapResponse | null;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  patient,
  prediction,
  shapLAD
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (!prediction) {
    return (
      <div className="report-empty-container">
        <HeartPulse size={36} />
        <p>Run a clinical assessment first to generate the clinical decision-support report.</p>
      </div>
    );
  }

  const p = prediction.predictions;
  const vesselProbs = {
    LAD: p.vessels.LAD.probability,
    LCX: p.vessels.LCX.probability,
    RCA: p.vessels.RCA.probability
  };

  return (
    <div className="printable-report-container">
      {/* Action Bar (hidden during print) */}
      <div className="report-actions-bar no-print">
        <button className="print-btn" onClick={handlePrint}>
          <Printer size={16} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Actual Printable Document Sheet */}
      <div className="report-document-sheet">
        {/* Document Header */}
        <div className="doc-header">
          <div className="doc-brand">
            <h2 className="doc-title">CardioVision 3D (CVS-3D)</h2>
            <span className="doc-subtitle">Clinical Decision Support & Explainable Coronary Risk Summary</span>
          </div>
          <div className="doc-meta">
            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            <div><strong>Protocol:</strong> Track A Hackathon AI Ensemble</div>
            <div><strong>Model Version:</strong> {prediction.model_version}</div>
          </div>
        </div>

        <hr className="doc-divider" />

        {/* Patient Intake Summary */}
        <div className="doc-section">
          <h4 className="doc-section-title">1. Patient Clinical Profile</h4>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="key">Age / Sex:</span>
              <span className="val">{patient.demographics.age} yrs / {patient.demographics.sex}</span>
            </div>
            <div className="profile-item">
              <span className="key">BMI:</span>
              <span className="val">{patient.demographics.bmi} kg/m²</span>
            </div>
            <div className="profile-item">
              <span className="key">Blood Pressure:</span>
              <span className="val">{patient.history_vitals.systolic_bp} mmHg (Systolic)</span>
            </div>
            <div className="profile-item">
              <span className="key">Smoking Status:</span>
              <span className="val">{patient.history_vitals.current_smoker ? 'Active Smoker' : 'Non-Smoker'}</span>
            </div>
            <div className="profile-item">
              <span className="key">Total Cholesterol:</span>
              <span className="val">{patient.laboratory.cholesterol} mg/dL (LDL: {patient.laboratory.ldl}, HDL: {patient.laboratory.hdl})</span>
            </div>
            <div className="profile-item">
              <span className="key">Ejection Fraction (LVEF):</span>
              <span className="val">{patient.ecg_echo.ejection_fraction}%</span>
            </div>
            <div className="profile-item">
              <span className="key">Echo RWMA:</span>
              <span className="val">{patient.ecg_echo.region_with_rwma} Territory</span>
            </div>
            <div className="profile-item">
              <span className="key">Resting ECG:</span>
              <span className="val">
                {patient.ecg_echo.st_elevation ? 'ST Elevation (+) ' : ''}
                {patient.ecg_echo.t_inversion ? 'T-Inversion (+) ' : ''}
                {patient.ecg_echo.poor_r_wave_progression ? 'PRWP (+) ' : ''}
                {!patient.ecg_echo.st_elevation && !patient.ecg_echo.t_inversion && 'Normal / Non-specific'}
              </span>
            </div>
          </div>
        </div>

        {/* Ensemble Multi-Vessel Risk Assessment */}
        <div className="doc-section">
          <h4 className="doc-section-title">2. Calibrated Multi-Vessel Stenosis Likelihood (&ge; 50% Luminal Reduction)</h4>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Arterial Vessel Bed</th>
                <th>Perfusion Territory</th>
                <th>Calibrated Probability</th>
                <th>95% Wilson CI</th>
                <th>Clinical Risk Tier</th>
              </tr>
            </thead>
            <tbody>
              <tr className="cad-row">
                <td><strong>Overall CAD Status</strong></td>
                <td>Global Coronary Vasculature</td>
                <td className="font-mono"><strong>{Math.round(p.overall_cad.probability * 100)}%</strong></td>
                <td className="font-mono">[{Math.round(p.overall_cad.confidence_interval_95[0] * 100)}% - {Math.round(p.overall_cad.confidence_interval_95[1] * 100)}%]</td>
                <td><span className="tier-pill">{p.overall_cad.risk_classification}</span></td>
              </tr>
              <tr>
                <td><strong>LAD (Left Anterior Descending)</strong></td>
                <td>{p.vessels.LAD.territory_description}</td>
                <td className="font-mono"><strong>{Math.round(p.vessels.LAD.probability * 100)}%</strong></td>
                <td className="font-mono">[{Math.round(p.vessels.LAD.confidence_interval_95[0] * 100)}% - {Math.round(p.vessels.LAD.confidence_interval_95[1] * 100)}%]</td>
                <td><span className="tier-pill">{p.vessels.LAD.risk_classification}</span></td>
              </tr>
              <tr>
                <td><strong>LCX (Left Circumflex)</strong></td>
                <td>{p.vessels.LCX.territory_description}</td>
                <td className="font-mono"><strong>{Math.round(p.vessels.LCX.probability * 100)}%</strong></td>
                <td className="font-mono">[{Math.round(p.vessels.LCX.confidence_interval_95[0] * 100)}% - {Math.round(p.vessels.LCX.confidence_interval_95[1] * 100)}%]</td>
                <td><span className="tier-pill">{p.vessels.LCX.risk_classification}</span></td>
              </tr>
              <tr>
                <td><strong>RCA (Right Coronary Artery)</strong></td>
                <td>{p.vessels.RCA.territory_description}</td>
                <td className="font-mono"><strong>{Math.round(p.vessels.RCA.probability * 100)}%</strong></td>
                <td className="font-mono">[{Math.round(p.vessels.RCA.confidence_interval_95[0] * 100)}% - {Math.round(p.vessels.RCA.confidence_interval_95[1] * 100)}%]</td>
                <td><span className="tier-pill">{p.vessels.RCA.risk_classification}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Anatomical Schematic & SHAP Drivers Split */}
        <div className="doc-section doc-split-row">
          <div className="doc-split-col">
            <h4 className="doc-section-title">3. Coronary Tree Spatial Mapping</h4>
            <div className="doc-svg-wrapper">
              <SvgHeartFallback
                probabilities={vesselProbs}
                selectedVessel="LAD"
                onSelectVessel={() => {}}
              />
            </div>
          </div>

          <div className="doc-split-col">
            <h4 className="doc-section-title">4. Top TreeSHAP Risk Drivers (LAD Territory)</h4>
            {shapLAD ? (
              <div className="doc-shap-list">
                {shapLAD.top_attributions.slice(0, 5).map((attr, i) => (
                  <div key={i} className="doc-shap-item">
                    <div>
                      <strong>{attr.display_name}</strong>
                      <div className="sub">Patient: {attr.patient_value}</div>
                    </div>
                    <span className="font-mono">
                      {attr.shap_value > 0 ? `+${attr.shap_value.toFixed(3)}` : attr.shap_value.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Attributions available on interactive dashboard.</p>
            )}
          </div>
        </div>

        {/* Legal & Medical Safety Sign-off */}
        <div className="doc-footer">
          <div className="doc-disclaimer">
            <ShieldCheck size={16} />
            <span>
              <strong>INVESTIGATIONAL PROTOTYPE NOTICE:</strong> This document was generated automatically by CardioVision 3D for clinical decision-support and educational review only. It is not an FDA-cleared or CE-marked diagnostic device and does not replace invasive coronary angiography or licensed physician evaluation.
            </span>
          </div>

          <div className="doc-signature-line">
            <div className="sig-box">
              <div className="sig-line" />
              <span>Attending Cardiologist / Reviewer Signature</span>
            </div>
            <div className="sig-box">
              <div className="sig-line" />
              <span>Date &amp; Clinical Facility Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
