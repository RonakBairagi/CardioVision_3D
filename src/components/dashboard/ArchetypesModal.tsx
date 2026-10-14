import React from 'react';
import { Archetype } from '../../types/cardio';
import { DEMO_ARCHETYPES } from '../../constants/demoData';
import { Sparkles, X, Check, ArrowRight, ShieldCheck } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Preloaded Clinical Evaluation Archetypes</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Select a standardized benchmark profile from the UCI Z-Alizadeh Sani cohort for instant 1-click evaluation of 3D spatial mapping and TreeSHAP attribution.
        </p>

        <div className="space-y-3">
          {DEMO_ARCHETYPES.map((arch) => (
            <div
              key={arch.id}
              onClick={() => {
                onSelectArchetype(arch);
                onClose();
              }}
              className="p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      arch.badge_color === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : arch.badge_color === 'rose'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {arch.badge}
                  </span>
                  <strong className="text-xs text-white group-hover:text-cyan-400 transition">
                    {arch.title}
                  </strong>
                </div>
                <p className="text-xs text-slate-300">{arch.summary}</p>
                <p className="text-[11px] text-slate-400 italic">{arch.expected_visual}</p>
              </div>

              <button
                type="button"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-white text-xs font-semibold transition"
              >
                <span>Load Profile</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Target leakage quarantine strictly enforced on all presets.</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 rounded hover:bg-slate-800 text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
