import React from 'react';
import { VesselId, VesselRisk, ShapResponse } from '../../types/cardio';
import { VESSEL_REGISTRY, getProbabilityColor } from '../../constants/vesselMapping';
import { ShapWaterfall } from './ShapWaterfall';
import { Modal } from '../common/Modal';
import { ShieldAlert, Compass, Activity, ArrowRight } from 'lucide-react';

interface VesselDetailDrawerProps {
  vesselId: VesselId | null;
  onClose: () => void;
  vesselRisk: VesselRisk | null;
  shapData: ShapResponse | null;
  isLoadingShap: boolean;
  onSelectTargetShap: (target: VesselId | 'CAD') => void;
}

export const VesselDetailDrawer: React.FC<VesselDetailDrawerProps> = ({
  vesselId,
  onClose,
  vesselRisk,
  shapData,
  isLoadingShap,
  onSelectTargetShap
}) => {
  if (!vesselId || !vesselRisk) return null;

  const meta = VESSEL_REGISTRY[vesselId];
  const colorInfo = getProbabilityColor(vesselRisk.probability);
  const pct = Math.round(vesselRisk.probability * 100);
  const [ciLow, ciHigh] = vesselRisk.confidence_interval_95.map((v) => Math.round(v * 100));

  return (
    <Modal
      isOpen={!!vesselId}
      onClose={onClose}
      title={`${meta.displayName} (${vesselId})`}
      subtitle={`Anatomical Territory Deep Dive & Local SHAP Attribution`}
      maxWidth="780px"
    >
      <div className="vessel-detail-modal-body">
        {/* Top Summary Banner */}
        <div className="vessel-summary-banner" style={{ borderColor: colorInfo.hex }}>
          <div className="summary-left">
            <span className="summary-badge" style={{ backgroundColor: `${colorInfo.hex}22`, color: colorInfo.hex }}>
              {colorInfo.label}
            </span>
            <div className="summary-prob-group">
              <span className="prob-big font-mono" style={{ color: colorInfo.hex }}>{pct}%</span>
              <span className="prob-caption">Predicted Stenosis Probability (&ge; 50% Luminal Narrowing)</span>
            </div>
          </div>

          <div className="summary-right">
            <div className="summary-stat-chip">
              <span className="chip-key">95% Wilson CI:</span>
              <span className="chip-val font-mono">[{ciLow}% - {ciHigh}%]</span>
            </div>
            <div className="summary-stat-chip">
              <span className="chip-key">Classification:</span>
              <span className="chip-val">{vesselRisk.risk_classification}</span>
            </div>
            <div className="summary-stat-chip">
              <span className="chip-key">Calibration:</span>
              <span className="chip-val">Platt Scaled (cv=5-fold)</span>
            </div>
          </div>
        </div>

        {/* Anatomical Overview */}
        <div className="vessel-anatomy-box">
          <div className="anatomy-section">
            <h5 className="anatomy-subtitle">Anatomical Course & Sulcus:</h5>
            <p className="anatomy-text">{meta.anatomicalDescription}</p>
          </div>
          <div className="anatomy-section">
            <h5 className="anatomy-subtitle">Clinical Significance & Perfusion Bed:</h5>
            <p className="anatomy-text">{meta.clinicalSignificance}</p>
          </div>
        </div>

        {/* SHAP Waterfall Attribution for this Territory */}
        <div className="vessel-shap-section">
          <ShapWaterfall
            shapData={shapData}
            isLoading={isLoadingShap}
            selectedTarget={vesselId}
            onSelectTarget={(t) => onSelectTargetShap(t)}
          />
        </div>

        {/* Clinical Disclaimer */}
        <div className="drawer-disclaimer">
          <ShieldAlert size={14} className="disclaimer-icon" />
          <span>
            <strong>Clinical Safety Mandate:</strong> The probability displayed is statistically estimated from non-invasive clinical biomarkers. It strictly does not represent invasive angiography measurements, lesion length, or calcification volume.
          </span>
        </div>
      </div>
    </Modal>
  );
};
