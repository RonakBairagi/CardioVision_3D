import React from 'react';
import { Archetype } from '../../types/cardio';
import { DEMO_ARCHETYPES } from '../../constants/demoData';
import { Modal } from '../common/Modal';
import { Zap, Play, CheckCircle2, ArrowRight } from 'lucide-react';

interface ArchetypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArchetype: (archetype: Archetype) => void;
}

export const ArchetypesModal: React.FC<ArchetypesModalProps> = ({
  isOpen,
  onClose,
  onSelectArchetype
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Judge Quick Tour: 60-Second Evaluator Archetypes"
      subtitle="One-click preconfigured patient phenotypes derived from the Z-Alizadeh Sani benchmark"
      maxWidth="760px"
    >
      <div className="archetypes-modal-content">
        <p className="archetype-intro-text">
          Select any of the 3 clinical archetypes below to instantly populate all 54 biomarkers, execute the calibrated ensemble inference, and watch the 3D cardiac vascular shaders transform in real time.
        </p>

        <div className="archetypes-cards-list">
          {DEMO_ARCHETYPES.map((arch) => (
            <div
              key={arch.id}
              className={`archetype-card ${arch.badge_color}`}
              onClick={() => {
                onSelectArchetype(arch);
                onClose();
              }}
            >
              <div className="card-top">
                <div className="title-wrap">
                  <h4 className="arch-name">{arch.title}</h4>
                  <span className={`arch-badge ${arch.badge_color}`}>{arch.badge}</span>
                </div>
                <button className="arch-select-btn">
                  <span>Load Profile</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <p className="arch-summary">{arch.summary}</p>

              <div className="arch-details-row">
                <div className="arch-visual-box">
                  <span className="box-title">3D Visual Impact:</span>
                  <span className="box-desc">{arch.expected_visual}</span>
                </div>

                <div className="arch-risk-box">
                  <span className="box-title">Target Probabilities:</span>
                  <div className="risk-tags-row">
                    {Object.entries(arch.expected_risk).map(([key, val]) => (
                      <span key={key} className="risk-tag font-mono">
                        {key}: <strong>{val}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
