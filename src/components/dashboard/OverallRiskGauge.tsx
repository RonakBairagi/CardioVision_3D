import React from 'react';
import { OverallCadPrediction } from '../../types/cardio';
import { Persona } from '../common/Header';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getProbabilityColor } from '../../constants/vesselMapping';

interface OverallRiskGaugeProps {
  prediction: OverallCadPrediction;
  persona: Persona;
}

export const OverallRiskGauge: React.FC<OverallRiskGaugeProps> = ({ prediction, persona }) => {
  const pct = Math.round(prediction.probability * 100);
  const colorInfo = getProbabilityColor(prediction.probability);
  const [ciLow, ciHigh] = prediction.confidence_interval_95.map((v) => Math.round(v * 100));

  return (
    <div className="overall-risk-card bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Ensemble Consensus Model
          </span>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
            <Activity size={16} className="text-cyan-400" />
            <span>Overall CAD Probability (≥50% Stenosis)</span>
          </h3>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full border"
          style={{
            backgroundColor: `${colorInfo.hex}15`,
            borderColor: colorInfo.hex,
            color: colorInfo.hex
          }}
        >
          {prediction.risk_classification}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Semi-gauge percentage display */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-800 min-w-[120px]">
          <span className="text-3xl font-extrabold font-mono tracking-tight" style={{ color: colorInfo.hex }}>
            {pct}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            Decision Cutoff: {Math.round(prediction.threshold_used * 100)}%
          </span>
        </div>

        {/* Narrative & clinical bounds */}
        <div className="flex-1 space-y-1.5 text-xs text-slate-300">
          <p>
            {persona === 'clinical' ? (
              <>
                Estimated composite risk of obstructive lesion in ≥1 epicardial vessel. Platt-calibrated probability with 95% confidence bounds.
              </>
            ) : (
              <>
                Estimated likelihood of significant arterial narrowing based on your reported vitals, cholesterol, and cardiac tests.
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
            <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              95% CI: [{ciLow}% - {ciHigh}%]
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck size={12} />
              <span>Quarantined Inputs</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
