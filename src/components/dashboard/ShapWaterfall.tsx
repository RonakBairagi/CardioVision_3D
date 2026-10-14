import React from 'react';
import { ShapResponse, VesselId } from '../../types/cardio';
import { BarChart2 } from 'lucide-react';

interface ShapWaterfallProps {
  shapData: ShapResponse | null;
  isLoading: boolean;
  selectedTarget: VesselId | 'CAD';
  onSelectTarget: (target: VesselId | 'CAD') => void;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  shapData,
  isLoading,
  selectedTarget,
  onSelectTarget
}) => {
  const targets: (VesselId | 'CAD')[] = ['CAD', 'LAD', 'LCX', 'RCA'];

  return (
    <div className="shap-waterfall-card bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Explainable AI (XAI)
          </span>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
            <BarChart2 size={16} className="text-cyan-400" />
            <span>TreeSHAP Feature Attribution</span>
          </h3>
        </div>

        {/* Target selector pills */}
        <div className="flex gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          {targets.map((t) => (
            <button
              key={t}
              onClick={() => onSelectTarget(t)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                selectedTarget === t
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          Computing TreeSHAP Shapley attributions for target {selectedTarget}...
        </div>
      ) : shapData ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 font-mono">
            <span>Base Value E[f(x)]: {(shapData.base_value * 100).toFixed(1)}%</span>
            <span>Target Output f(x): {(shapData.predicted_value * 100).toFixed(1)}%</span>
          </div>

          <div className="space-y-2.5">
            {shapData.top_attributions.map((item, idx) => {
              const isPositive = item.shap_value > 0;
              const absVal = Math.abs(item.shap_value);
              const barWidth = Math.min(100, Math.round(absVal * 300));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200">{item.display_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({item.patient_value})</span>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isPositive ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isPositive ? `+${item.shap_value.toFixed(3)}` : item.shap_value.toFixed(3)}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {shapData.interpretation_note && (
            <div className="text-[11px] text-slate-400 bg-slate-800/30 p-2.5 rounded-lg border border-slate-800 italic">
              {shapData.interpretation_note}
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">
          No feature attributions available for this profile.
        </div>
      )}
    </div>
  );
};
