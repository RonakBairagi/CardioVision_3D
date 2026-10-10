import React from 'react';
import { OverallCadPrediction } from '../../types/cardio';
import { Persona } from '../common/Header';
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

interface OverallRiskGaugeProps {
  prediction: OverallCadPrediction;
  persona: Persona;
}

export const OverallRiskGauge: React.FC<OverallRiskGaugeProps> = ({ prediction, persona }) => {
  const pct = Math.round(prediction.probability * 100);
  const [ciLower, ciUpper] = prediction.confidence_interval_95.map((v) => Math.round(v * 100));

  const strokeDashoffset = 283 - (283 * pct) / 100;

  const colorClass =
    pct <= 30 ? 'risk-teal' : pct <= 65 ? 'risk-amber' : 'risk-crimson';

  const badgeColor =
    prediction.risk_classification === 'Low Risk'
      ? 'badge-emerald'
      : prediction.risk_classification === 'Moderate Risk'
      ? 'badge-amber'
      : 'badge-rose';

  return (
    <div className="overall-risk-card">
      <div className="card-header-row">
        <div>
          <span className="card-eyebrow">Ensemble Prediction</span>
          <h3 className="card-headline">Overall Coronary Artery Disease (CAD)</h3>
        </div>
        <span className={`risk-status-badge ${badgeColor}`}>
          {prediction.risk_classification}
        </span>
      </div>

      <div className="gauge-content-row">
        {/* SVG Circular Progress Gauge */}
        <div className="gauge-svg-wrapper">
          <svg viewBox="0 0 100 100" className="gauge-circle-svg">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="gauge-bg-ring"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`gauge-fill-ring ${colorClass}`}
              style={{ strokeDashoffset }}
            />
          </svg>
          <div className="gauge-center-text">
            <span className="gauge-percentage">{pct}%</span>
            <span className="gauge-sublabel">CAD Likelihood</span>
          </div>
        </div>

        {/* Narrative & Statistical Metadata */}
        <div className="gauge-stats-column">
          {persona === 'clinical' ? (
            <>
              <div className="stat-metric-row">
                <span className="stat-label">Calibrated Probability:</span>
                <strong className="stat-value font-mono">{(prediction.probability).toFixed(3)}</strong>
              </div>
              <div className="stat-metric-row">
                <span className="stat-label">95% Wilson CI:</span>
                <span className="stat-value font-mono">[{ciLower}% - {ciUpper}%]</span>
              </div>
              <div className="stat-metric-row">
                <span className="stat-label">Diagnostic Stenosis Cutoff:</span>
                <span className="stat-value font-mono">&ge; 50% Luminal Diameter</span>
              </div>
              <div className="stat-metric-row">
                <span className="stat-label">Classification Boundary:</span>
                <span className="stat-value font-mono">Threshold P = {prediction.threshold_used.toFixed(2)}</span>
              </div>
            </>
          ) : (
            /* Patient Friendly Persona View */
            <div className="patient-narrative-box">
              {pct <= 30 ? (
                <div className="patient-status low">
                  <CheckCircle size={16} />
                  <span>Your clinical indicators show a <strong>favorable low likelihood</strong> of significant coronary blockages. Keep maintaining heart-healthy lifestyle habits.</span>
                </div>
              ) : pct <= 65 ? (
                <div className="patient-status moderate">
                  <AlertCircle size={16} />
                  <span>The system identified <strong>moderate risk signals</strong>. Your physician may recommend non-invasive stress testing or lifestyle optimization.</span>
                </div>
              ) : (
                <div className="patient-status high">
                  <AlertCircle size={16} />
                  <span>The model highlights an <strong>elevated probability</strong> of coronary artery narrowing based on your ECG and blood test markers. Please discuss these findings promptly with your cardiologist.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
