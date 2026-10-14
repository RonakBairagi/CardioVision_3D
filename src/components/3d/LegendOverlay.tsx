import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

interface LegendOverlayProps {
  onInfoClick?: () => void;
}

export const LegendOverlay: React.FC<LegendOverlayProps> = ({ onInfoClick }) => {
  return (
    <div className="legend-overlay" role="region" aria-label="Visual Encoding Legend">
      <div className="legend-header">
        <div className="legend-title-wrap">
          <span className="legend-title">Vessel Stenosis Probability Map</span>
          <span className="legend-subtitle">Visual Encoding &amp; Risk Calibration</span>
        </div>
        {onInfoClick && (
          <button
            type="button"
            className="legend-info-btn"
            title="Clinical Safety Protocol & Model Limitations"
            onClick={onInfoClick}
            aria-label="View clinical safety notice"
          >
            <Info size={14} />
          </button>
        )}
      </div>

      {/* Perceptual Gradient Bar */}
      <div className="gradient-bar-container">
        <div className="gradient-bar" aria-hidden="true" />
        <div className="gradient-labels">
          <div className="gradient-stop">
            <span className="dot teal" />
            <div className="stop-text">
              <span className="pct">0% - 30%</span>
              <span className="tier">Low Risk Tier</span>
            </div>
          </div>
          <div className="gradient-stop">
            <span className="dot amber" />
            <div className="stop-text">
              <span className="pct">31% - 65%</span>
              <span className="tier">Moderate Tier</span>
            </div>
          </div>
          <div className="gradient-stop">
            <span className="dot crimson" />
            <div className="stop-text">
              <span className="pct">66% - 100%</span>
              <span className="tier">High Risk Tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Encoding Explanation */}
      <div className="legend-encoding-guide">
        <div className="encoding-item">
          <span className="encoding-bullet glow-bullet" />
          <span><strong>Vessel Pulse &amp; Halo:</strong> Indicates currently selected coronary artery for focused inspection.</span>
        </div>
        <div className="encoding-item">
          <span className="encoding-bullet color-bullet" />
          <span><strong>Color Coding:</strong> Represents statistical probability of luminal reduction ≥ 50%.</span>
        </div>
      </div>

      {/* Clinical Disclaimer */}
      <div className="legend-disclaimer">
        <ShieldAlert size={12} className="warning-icon" />
        <span>
          <strong>Clinical Decision Support Only:</strong> This visualization displays model-estimated probabilities based on 54 clinical biomarkers. It does <em>not</em> represent confirmed anatomical plaque, measured intravascular obstruction, or catheterization imagery.
        </span>
      </div>
    </div>
  );
};
