import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { CheckCircle2, ShieldCheck, Activity, Cpu, Sparkles } from 'lucide-react';

interface InferenceTelemetryModalProps {
  isOpen: boolean;
  onFinish: () => void;
}

const TELEMETRY_STEPS = [
  { label: 'Validating 54 non-invasive clinical biomarkers with Pydantic v2...', duration: 50 },
  { label: 'Executing TargetLeakageGuard: Quarantining LAD, LCX, RCA, Cath...', duration: 50 },
  { label: 'Executing 4 Calibrated LightGBM/Ensemble Pipelines...', duration: 60 },
  { label: 'Calculating Local TreeSHAP Additive Attributions...', duration: 60 },
  { label: 'Binding dynamic probability uniforms to WebGL anatomical shaders...', duration: 40 }
];

export const InferenceTelemetryModal: React.FC<InferenceTelemetryModalProps> = ({ isOpen, onFinish }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIdx(0);
      return;
    }

    let timeoutId: any;
    let step = 0;

    const runNext = () => {
      if (step < TELEMETRY_STEPS.length - 1) {
        step++;
        setCurrentStepIdx(step);
        timeoutId = setTimeout(runNext, TELEMETRY_STEPS[step].duration);
      } else {
        timeoutId = setTimeout(() => {
          onFinish();
        }, 80);
      }
    };

    timeoutId = setTimeout(runNext, TELEMETRY_STEPS[0].duration);

    return () => clearTimeout(timeoutId);
  }, [isOpen, onFinish]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Live Inference &amp; Telemetry Pipeline"
      subtitle="Hardware-Accelerated Multi-Target CAD Inference"
      maxWidth="580px"
    >
      <div className="telemetry-body">
        <div className="telemetry-radar-wrap">
          <div className="telemetry-radar-ring outer" />
          <div className="telemetry-radar-ring mid" />
          <div className="telemetry-radar-ring inner" />
          <Activity size={32} className="radar-heart-pulse" />
        </div>

        <div className="telemetry-steps-list">
          {TELEMETRY_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={idx}
                className={`telemetry-step-row ${isDone ? 'done' : isCurrent ? 'current' : 'pending'}`}
              >
                <div className="step-icon">
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : isCurrent ? (
                    <span className="step-spinner" />
                  ) : (
                    <span className="step-dot" />
                  )}
                </div>
                <span className="step-label font-mono">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
