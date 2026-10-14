import React from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

interface SafetyProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyProtocolModal: React.FC<SafetyProtocolModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Clinical Safety & Investigational Protocol</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 flex gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              <strong>Investigational Decision Support Only:</strong> This software is an engineering and educational prototype built for cardiovascular risk exploration. It is not an FDA-cleared or CE-marked medical device.
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">Key Clinical Boundaries</h4>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li>
                <strong>No Fabrication of Plaque Geometry:</strong> Arterial colors indicate statistical probabilities of ≥ 50% stenosis derived from non-invasive biomarkers. The 3D model does not depict actual anatomical lumen obstructions.
              </li>
              <li>
                <strong>Target Leakage Isolation:</strong> Coronary catheterization outcomes (`Cath`, `LAD`, `LCX`, `RCA`) are rigorously quarantined from the input feature space.
              </li>
              <li>
                <strong>Physician Oversight Required:</strong> Treatment or diagnostic catheterization decisions must be guided by certified cardiologists and standard guidelines (AHA/ACC/ESC).
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
