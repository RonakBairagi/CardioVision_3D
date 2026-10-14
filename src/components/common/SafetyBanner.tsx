import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface SafetyBannerProps {
  onLearnMore?: () => void;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ onLearnMore }) => {
  return (
    <div className="safety-banner persistent-safety-banner" role="banner">
      <div className="safety-banner-content">
        <div className="safety-banner-left">
          <div className="safety-badge">
            <ShieldAlert size={13} className="safety-icon" />
            <span>INVESTIGATIONAL CLINICAL DECISION SUPPORT</span>
          </div>
          <p className="safety-text">
            CardioVision 3D is an educational and investigational risk stratification prototype. It does not replace invasive coronary angiography or clinical judgment. Colors represent statistical stenosis probabilities, not reconstructed physical plaque geometry.
          </p>
        </div>
        {onLearnMore && (
          <button
            className="safety-learn-btn"
            onClick={onLearnMore}
            type="button"
            title="Open Investigational Safety & Validation Protocol"
          >
            <Info size={12} />
            <span>Safety Protocol</span>
          </button>
        )}
      </div>
    </div>
  );
};
