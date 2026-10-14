import React from 'react';
import { VesselId, VesselRisk } from '../../types/cardio';
import { Persona } from '../common/Header';
import { VESSEL_REGISTRY, getProbabilityColor } from '../../constants/vesselMapping';
import { Eye, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface VesselRiskCardsProps {
  vessels: Record<VesselId, VesselRisk>;
  selectedVessel: VesselId | null;
  onSelectVessel: (vessel: VesselId) => void;
  onOpenDrawer?: (vessel: VesselId) => void;
  persona: Persona;
}

export const VesselRiskCards: React.FC<VesselRiskCardsProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
  onOpenDrawer,
  persona
}) => {
  const vesselKeys: VesselId[] = ['LAD', 'LCX', 'RCA'];

  return (
    <div className="vessel-risk-grid">
      <div className="vessel-grid-header">
        <div>
          <span className="card-eyebrow">Territory Breakdown</span>
          <h4 className="card-headline">Epicardial Coronary Arteries</h4>
        </div>
        <span className="vessel-hint-badge">Click card to glide 3D camera</span>
      </div>

      <div className="vessel-cards-list">
        {vesselKeys.map((vId) => {
          const vData = vessels[vId];
          const meta = VESSEL_REGISTRY[vId];
          const pct = Math.round(vData.probability * 100);
          const colorInfo = getProbabilityColor(vData.probability);
          const isSelected = selectedVessel === vId;
          const [ciLow, ciHigh] = vData.confidence_interval_95.map((v) => Math.round(v * 100));

          return (
            <div
              key={vId}
              className={`vessel-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectVessel(vId)}
              style={{
                borderColor: isSelected ? colorInfo.hex : undefined,
                boxShadow: isSelected ? `0 0 16px ${colorInfo.hex}33` : undefined
              }}
            >
              <div className="vessel-card-top">
                <div className="vessel-identity">
                  <span
                    className="vessel-dot"
                    style={{ backgroundColor: colorInfo.hex }}
                  />
                  <div className="vessel-name-wrap">
                    <strong className="vessel-id-text">{vId}</strong>
                    <span className="vessel-full-name">{meta.displayName}</span>
                  </div>
                </div>

                <div className="vessel-probability-badge" style={{ color: colorInfo.hex }}>
                  <span className="pct-num font-mono">{pct}%</span>
                  <span className="pct-sub">{colorInfo.label}</span>
                </div>
              </div>

              {/* Probability Progress Bar */}
              <div className="vessel-bar-track">
                <div
                  className="vessel-bar-fill"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: colorInfo.hex
                  }}
                />
              </div>

              {/* Territory & Statistical Details */}
              <div className="vessel-card-body">
                <p className="vessel-territory-text">
                  <strong>Perfuses:</strong> {vData.territory_description}
                </p>

                {persona === 'clinical' && (
                  <div className="vessel-clinical-stats">
                    <span className="ci-badge font-mono">95% CI: [{ciLow}% - {ciHigh}%]</span>
                    <span className="model-tag font-mono">Calibrated Platt/Tree</span>
                  </div>
                )}
              </div>

              {/* Action Trigger */}
              <div className="vessel-card-action">
                <button
                  className="inspect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenDrawer) {
                      onOpenDrawer(vId);
                    } else {
                      onSelectVessel(vId);
                    }
                  }}
                  style={{ color: colorInfo.hex }}
                >
                  <Eye size={13} />
                  <span>Inspect Anatomy & SHAP</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
