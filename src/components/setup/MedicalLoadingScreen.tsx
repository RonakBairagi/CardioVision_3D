import React, { useState, useEffect } from 'react';
import { HeartPulse, CheckCircle2, ShieldCheck } from 'lucide-react';

interface MedicalLoadingScreenProps {
  onComplete: () => void;
}

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export const MedicalLoadingScreen: React.FC<MedicalLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(10);
  const [steps, setSteps] = useState<Step[]>([
    { id: 'env', label: 'Initializing clinical decision-support environment', status: 'in_progress' },
    { id: 'weights', label: 'Loading calibrated multi-target inference weights (CAD, LAD, LCX, RCA)', status: 'pending' },
    { id: 'leakage', label: 'Enforcing target leakage quarantine & privacy guards', status: 'pending' },
    { id: 'render', label: 'Compiling 3D spatial coronary vascular shaders', status: 'pending' }
  ]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(30);
      setSteps((prev) => [
        { ...prev[0], status: 'completed' },
        { ...prev[1], status: 'in_progress' },
        prev[2],
        prev[3]
      ]);
    }, 450);

    const timer2 = setTimeout(() => {
      setProgress(60);
      setSteps((prev) => [
        prev[0],
        { ...prev[1], status: 'completed' },
        { ...prev[2], status: 'in_progress' },
        prev[3]
      ]);
    }, 950);

    const timer3 = setTimeout(() => {
      setProgress(85);
      setSteps((prev) => [
        prev[0],
        prev[1],
        { ...prev[2], status: 'completed' },
        { ...prev[3], status: 'in_progress' }
      ]);
    }, 1450);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
    }, 1900);

    const timer5 = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div className="medical-loading-screen" role="status" aria-live="polite">
      {/* Background medical ambient glow */}
      <div className="loading-ambient-glow" />

      <div className="loading-card">
        {/* Brand Icon with Heartbeat Pulse */}
        <div className="loading-brand-header">
          <div className="loading-logo-box">
            <HeartPulse size={36} className="loading-heart-icon" />
            <div className="loading-pulse-ring" />
          </div>
          <div className="loading-brand-title">
            <h2>
              CardioVision <span className="title-cyan">3D</span>
            </h2>
            <span className="loading-badge">CVS-3D Clinical Decision Support</span>
          </div>
        </div>

        <p className="loading-subtitle">
          Multi-Vessel CAD Risk Stratification &amp; Spatial Coronary Visualization
        </p>

        {/* ECG Line Animation Graphic */}
        <div className="loading-ecg-container" aria-hidden="true">
          <svg viewBox="0 0 500 40" className="loading-ecg-svg" preserveAspectRatio="none">
            <path
              d="M0,20 L120,20 L135,10 L145,30 L155,5 L165,35 L175,20 L300,20 L315,10 L325,30 L335,5 L345,35 L355,20 L500,20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="loading-ecg-path"
            />
          </svg>
        </div>

        {/* Progress bar */}
        <div className="loading-progress-bar-wrap">
          <div className="loading-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="loading-progress-meta">
          <span>System Initialization &bull; Clinical Calibration</span>
          <span className="font-mono">{progress}%</span>
        </div>

        {/* Stepper Checklist */}
        <div className="loading-checklist">
          {steps.map((step) => (
            <div key={step.id} className={`loading-step-item ${step.status}`}>
              <div className="step-icon-wrap">
                {step.status === 'completed' ? (
                  <CheckCircle2 size={15} className="step-check" />
                ) : step.status === 'in_progress' ? (
                  <span className="step-spinner" />
                ) : (
                  <span className="step-bullet" />
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Clinical Disclaimer footer */}
        <div className="loading-footer">
          <ShieldCheck size={14} className="shield-icon" />
          <span>Calibrated clinical AI prototype &bull; Non-invasive CAD risk estimation</span>
        </div>
      </div>
    </div>
  );
};
