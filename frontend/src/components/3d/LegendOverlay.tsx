import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

interface LegendOverlayProps {
  onInfoClick?: () => void;
}

export const LegendOverlay: React.FC<LegendOverlayProps> = ({ onInfoClick }) => {
  return (
    <div className="legend-overlay">
      <div className="legend-header">
        <span className="legend-title">Vessel Stenosis Probability Map</span>
        <button
          className="legend-info-btn"
          title="Clinical Safety Notice"
          onClick={onInfoClick}
        >
          <Info size={14} />
        </button>
      </div>

      <div className="gradient-bar-container">
        <div className="gradient-bar" />
        <div className="gradient-labels">
          <div className="gradient-stop">
            <span className="dot teal" />
            <span className="pct">0% - 30%</span>
            <span className="tier">Low Risk</span>
          </div>
          <div className="gradient-stop">
            <span className="dot amber" />
            <span className="pct">31% - 65%</span>
            <span className="tier">Moderate</span>
          </div>
          <div className="gradient-stop">
            <span className="dot crimson" />
            <span className="pct">66% - 100%</span>
            <span className="tier">High Risk</span>
          </div>
        </div>
      </div>

      <div className="legend-disclaimer">
        <ShieldAlert size={12} className="warning-icon" />
        <span>
          <strong>Decision Support Only:</strong> Color represents statistical likelihood of &ge;50% stenosis. It does not fabricate patient plaque geometry.
        </span>
      </div>
    </div>
  );
};
