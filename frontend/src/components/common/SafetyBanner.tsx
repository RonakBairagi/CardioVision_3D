import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface SafetyBannerProps {
  onLearnMore?: () => void;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ onLearnMore }) => {
  return (
    <div className="persistent-safety-banner" role="alert">
      <div className="safety-content">
        <div className="safety-tag">
          <AlertTriangle size={14} className="safety-icon" />
          <span>INVESTIGATIONAL CLINICAL PROTOTYPE ONLY</span>
        </div>
        <p className="safety-message">
          CardioVision 3D outputs statistical probability estimates for clinical decision-support and educational spatial comprehension.
          It does <strong>not</strong> produce diagnostic catheterization findings or fabricate patient-specific plaque geometry.
        </p>
      </div>
      {onLearnMore && (
        <button className="safety-learn-btn" onClick={onLearnMore}>
          <ShieldCheck size={13} />
          <span>Clinical Protocol</span>
        </button>
      )}
    </div>
  );
};
