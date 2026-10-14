import React from 'react';
import { VesselId } from '../../types/cardio';
import { getProbabilityColor } from '../../constants/vesselMapping';

interface SvgHeartFallbackProps {
  probabilities: Record<VesselId, number>;
  selectedVessel: VesselId | null;
  onSelectVessel: (vessel: VesselId) => void;
}

export const SvgHeartFallback: React.FC<SvgHeartFallbackProps> = ({
  probabilities,
  selectedVessel,
  onSelectVessel
}) => {
  const ladColor = getProbabilityColor(probabilities.LAD ?? 0.1).hex;
  const lcxColor = getProbabilityColor(probabilities.LCX ?? 0.1).hex;
  const rcaColor = getProbabilityColor(probabilities.RCA ?? 0.1).hex;

  return (
    <div className="svg-heart-fallback-container flex flex-col items-center justify-center p-4 w-full h-full min-h-[300px]">
      <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cardiac Silhouette Background */}
          <path
            d="M 150 70 C 130 30 70 30 50 80 C 30 140 100 210 150 260 C 200 210 270 140 250 80 C 230 30 170 30 150 70 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="3"
            opacity="0.85"
          />

          {/* Aorta / Root */}
          <path
            d="M 135 68 C 135 40 165 40 165 68"
            fill="none"
            stroke="#475569"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* RCA (Right Coronary Artery) - Yellow/Amber/Red track */}
          <path
            d="M 135 85 C 100 95 80 135 85 180 C 90 205 110 225 130 240"
            fill="none"
            stroke={rcaColor}
            strokeWidth={selectedVessel === 'RCA' ? '7' : '5'}
            strokeLinecap="round"
            className="cursor-pointer transition-all hover:stroke-white"
            onClick={() => onSelectVessel('RCA')}
          />
          <text
            x="70"
            y="140"
            fill={rcaColor}
            fontSize="11"
            fontWeight="bold"
            className="cursor-pointer select-none"
            onClick={() => onSelectVessel('RCA')}
          >
            RCA ({Math.round((probabilities.RCA ?? 0) * 100)}%)
          </text>

          {/* LAD (Left Anterior Descending) - Central groove track */}
          <path
            d="M 155 85 C 152 120 150 165 150 250"
            fill="none"
            stroke={ladColor}
            strokeWidth={selectedVessel === 'LAD' ? '7' : '5'}
            strokeLinecap="round"
            className="cursor-pointer transition-all hover:stroke-white"
            onClick={() => onSelectVessel('LAD')}
          />
          <text
            x="160"
            y="170"
            fill={ladColor}
            fontSize="11"
            fontWeight="bold"
            className="cursor-pointer select-none"
            onClick={() => onSelectVessel('LAD')}
          >
            LAD ({Math.round((probabilities.LAD ?? 0) * 100)}%)
          </text>

          {/* LCX (Left Circumflex) - Lateral curve track */}
          <path
            d="M 165 85 C 200 95 225 125 220 160 C 215 185 200 205 180 220"
            fill="none"
            stroke={lcxColor}
            strokeWidth={selectedVessel === 'LCX' ? '7' : '5'}
            strokeLinecap="round"
            className="cursor-pointer transition-all hover:stroke-white"
            onClick={() => onSelectVessel('LCX')}
          />
          <text
            x="225"
            y="135"
            fill={lcxColor}
            fontSize="11"
            fontWeight="bold"
            className="cursor-pointer select-none"
            onClick={() => onSelectVessel('LCX')}
          >
            LCX ({Math.round((probabilities.LCX ?? 0) * 100)}%)
          </text>
        </svg>
      </div>
      <div className="text-[11px] text-slate-400 mt-2 text-center">
        Click any arterial territory above (LAD, LCX, RCA) to inspect local risk drivers.
      </div>
    </div>
  );
};
