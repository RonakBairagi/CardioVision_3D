import React from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, AlertTriangle, FileCode2, Scale } from 'lucide-react';

interface SafetyProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyProtocolModal: React.FC<SafetyProtocolModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CardioVision 3D: Clinical Safety & Engineering Governance"
      subtitle="Architectural Boundaries, Target Leakage Isolation & Non-Fabrication Standards"
      maxWidth="720px"
    >
      <div className="safety-modal-body">
        <div className="safety-pillar">
          <div className="pillar-header">
            <Scale size={20} className="pillar-icon" />
            <h4>1. RWMA vs. Anatomical Plaque Geometry (Core Hackathon Mandate)</h4>
          </div>
          <p>
            Echocardiographic finding <code>Region with RWMA</code> describes regional myocardial motion abnormalities (hypokinesia, akinesia, dyskinesia) secondary to ischemia.
            <strong> It does not provide anatomical coordinates, lesion length, or plaque cross-sectional area.</strong>
          </p>
          <div className="pillar-highlight">
            CardioVision 3D strictly visualizes <em>calibrated model-predicted stenosis probability</em> projected along reference vascular meshes. It categorically <strong>never fabricates patient-specific plaque geometry or simulated luminal obstruction meshes</strong>.
          </div>
        </div>

        <div className="safety-pillar">
          <div className="pillar-header">
            <FileCode2 size={20} className="pillar-icon" />
            <h4>2. Strict Programmatic Target-Leakage Quarantine</h4>
          </div>
          <p>
            In the Z-Alizadeh Sani benchmark, <code>LAD</code>, <code>LCX</code>, <code>RCA</code>, and <code>Cath</code> represent gold-standard catheterization diagnoses. Including them in feature sets produces artificial 100% accuracy (data leakage).
          </p>
          <p>
            Our pipeline hardcodes <code>TargetLeakageGuard(BaseEstimator, TransformerMixin)</code>, which programmatically purges all diagnostic labels prior to training, cross-validation, and real-time inference.
          </p>
        </div>

        <div className="safety-pillar">
          <div className="pillar-header">
            <ShieldCheck size={20} className="pillar-icon" />
            <h4>3. Small-Dataset Validation Rigor ($N=303$)</h4>
          </div>
          <p>
            To prevent overfitting and misleading single-split metrics on small cohorts ($N=303$), models are evaluated via <strong>Repeated Stratified 5-Fold Cross-Validation (10 repeats = 50 distinct folds)</strong> with Platt/Isotonic probability calibration and 95% Wilson confidence bounds.
          </p>
        </div>
      </div>
    </Modal>
  );
};
