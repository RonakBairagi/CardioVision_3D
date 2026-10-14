import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

interface InferenceTelemetryModalProps {
  isOpen: boolean;
  onFinish: () => void;
}

export const InferenceTelemetryModal: React.FC<InferenceTelemetryModalProps> = ({
  isOpen,
  onFinish
}) => {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }

    const timer1 = setTimeout(() => setStep(1), 300);
    const timer2 = setTimeout(() => setStep(2), 650);
    const timer3 = setTimeout(() => {
      setStep(3);
      setTimeout(() => {
        onFinish();
      }, 350);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, onFinish]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Cpu size={24} className="animate-pulse" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Multi-Vessel Inference Pipeline</h3>
          <p className="text-xs text-slate-400 mt-1">Executing calibrated Platt/Tree ensemble</p>
        </div>

        <div className="space-y-2 text-left bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {step >= 1 ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : (
              <span className="w-3 h-3 rounded-full border border-slate-600 animate-spin" />
            )}
            <span className={step >= 1 ? 'text-slate-200' : 'text-slate-500'}>
              Target-leakage quarantine validated
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step >= 2 ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : (
              <span className="w-3 h-3 rounded-full border border-slate-600 animate-spin" />
            )}
            <span className={step >= 2 ? 'text-slate-200' : 'text-slate-500'}>
              Calibrated CAD & LAD/LCX/RCA vectors
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step >= 3 ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : (
              <span className="w-3 h-3 rounded-full border border-slate-600 animate-spin" />
            )}
            <span className={step >= 3 ? 'text-slate-200' : 'text-slate-500'}>
              TreeSHAP local feature attribution
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
