import React from 'react';
import { ShapResponse, AttributionItem } from '../../types/cardio';
import { ArrowUpRight, ArrowDownRight, Info, HelpCircle } from 'lucide-react';

interface ShapWaterfallProps {
  shapData: ShapResponse | null;
  isLoading: boolean;
  selectedTarget: string;
  onSelectTarget: (target: 'LAD' | 'LCX' | 'RCA' | 'CAD') => void;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  shapData,
  isLoading,
  selectedTarget,
  onSelectTarget
}) => {
  return (
    <div className="shap-waterfall-card">
      <div className="shap-header-row">
        <div>
          <span className="card-eyebrow">Explainable AI (TreeSHAP)</span>
          <h4 className="card-headline">Local Feature Attribution Breakdown</h4>
        </div>

        {/* Target Arterial Selector */}
        <div className="target-toggle-chips">
          {(['LAD', 'LCX', 'RCA', 'CAD'] as const).map((t) => (
            <button
              key={t}
              className={`target-chip ${selectedTarget === t ? 'active' : ''}`}
              onClick={() => onSelectTarget(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="shap-loading-state">
          <span className="spinner" />
          <span>Computing TreeSHAP Shapley values & log-odds...</span>
        </div>
      ) : !shapData ? (
        <div className="shap-empty-state">
          <span>Run inference to inspect local feature attributions.</span>
        </div>
      ) : (
        <div className="shap-content">
          {/* Baseline & Predicted Value Bar */}
          <div className="shap-summary-strip">
            <div className="summary-item">
              <span className="label">Cohort Baseline Expected Risk (E[f(X)]):</span>
              <strong className="val font-mono">{Math.round(shapData.base_value * 100)}%</strong>
            </div>
            <div className="summary-arrow">&rarr;</div>
            <div className="summary-item">
              <span className="label">Patient Predicted Risk:</span>
              <strong className="val highlight font-mono">{Math.round(shapData.predicted_value * 100)}%</strong>
            </div>
          </div>

          {/* Attribution Factor Bars */}
          <div className="shap-attributions-list">
            {shapData.top_attributions.map((attr, idx) => {
              const isPositive = attr.effect === 'Increases Risk';
              const maxAbs = 0.35;
              const barWidth = Math.min(100, Math.round((Math.abs(attr.shap_value) / maxAbs) * 100));

              return (
                <div key={idx} className="attribution-row">
                  <div className="attr-meta">
                    <span className="attr-name">{attr.display_name}</span>
                    <span className="attr-patient-val">Observed: <strong>{attr.patient_value}</strong></span>
                  </div>

                  <div className="attr-bar-cell">
                    <div className="attr-center-line" />
                    <div
                      className={`attr-bar ${isPositive ? 'positive' : 'negative'}`}
                      style={{ width: `${barWidth}%` }}
                    >
                      <span className="attr-val-text font-mono">
                        {isPositive ? `+${attr.shap_value.toFixed(3)}` : attr.shap_value.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  <div className="attr-effect-cell">
                    {isPositive ? (
                      <span className="effect-tag plus">
                        <ArrowUpRight size={12} />
                        <span>Elevates Risk</span>
                      </span>
                    ) : (
                      <span className="effect-tag minus">
                        <ArrowDownRight size={12} />
                        <span>Protective</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mathematical Note */}
          <div className="shap-footer-note">
            <Info size={13} className="info-icon" />
            <span>
              <strong>Additive Local Attribution:</strong> Values represent game-theoretic Shapley contributions to the model's log-odds score (sum of contributions shifts baseline risk to the predicted value). They describe statistical model weighting, not biological causation.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
