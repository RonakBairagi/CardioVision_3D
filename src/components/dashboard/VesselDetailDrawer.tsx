import React from 'react';
import { VesselId, VesselRisk, ShapResponse } from '../../types/cardio';
import { VESSEL_REGISTRY, getProbabilityColor } from '../../constants/vesselMapping';
import { X, Activity, Info, BarChart2, ShieldCheck, HeartPulse } from 'lucide-react';

interface VesselDetailDrawerProps {
  vesselId: VesselId | null;
  onClose: () => void;
  vesselRisk?: VesselRisk;
  shapData: ShapResponse | null;
  isLoadingShap: boolean;
  onSelectTargetShap: (target: VesselId | 'CAD') => void;
}

export const VesselDetailDrawer: React.FC<VesselDetailDrawerProps> = ({
  vesselId,
  onClose,
  vesselRisk,
  shapData,
  isLoadingShap
}) => {
  if (!vesselId || !vesselRisk) return null;

  const meta = VESSEL_REGISTRY[vesselId];
  const colorInfo = getProbabilityColor(vesselRisk.probability);
  const pct = Math.round(vesselRisk.probability * 100);
  const [ciLow, ciHigh] = vesselRisk.confidence_interval_95.map((v) => Math.round(v * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorInfo.hex }} />
              <div>
                <h3 className="text-base font-bold text-white">{meta.displayName}</h3>
                <span className="text-xs text-slate-400 font-mono">Arterial Territory: {vesselId}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Predicted Stenosis Probability</span>
              <span className="text-2xl font-bold font-mono" style={{ color: colorInfo.hex }}>
                {pct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: colorInfo.hex }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Risk Tier: <strong style={{ color: colorInfo.hex }}>{vesselRisk.risk_classification}</strong></span>
              <span className="font-mono">95% CI: [{ciLow}% - {ciHigh}%]</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse size={14} className="text-cyan-400" />
              <span>Anatomical Territory</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800">
              {meta.anatomicalDescription}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} className="text-cyan-400" />
              <span>TreeSHAP Local Drivers ({vesselId})</span>
            </h4>

            {isLoadingShap ? (
              <div className="text-xs text-slate-400 py-4 text-center animate-pulse">
                Calculating Shapley values...
              </div>
            ) : shapData && shapData.target === vesselId ? (
              <div className="space-y-2">
                {shapData.top_attributions.slice(0, 5).map((attr, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-800/40 p-2.5 rounded border border-slate-800">
                    <div>
                      <span className="font-medium text-slate-200 block">{attr.display_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{attr.patient_value}</span>
                    </div>
                    <span
                      className={`font-mono text-xs font-semibold ${
                        attr.effect === 'Increases Risk' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {attr.shap_value > 0 ? `+${attr.shap_value.toFixed(2)}` : attr.shap_value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No SHAP attributions loaded for this vessel.</p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>Calibrated Platt/Tree ensemble inference quarantined from catheterization targets.</span>
        </div>
      </div>
    </div>
  );
};
