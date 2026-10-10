import React, { useState } from 'react';
import { VesselId } from '../../types/cardio';
import { VESSEL_REGISTRY, getProbabilityColor } from '../../constants/vesselMapping';

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
  const [hoveredVessel, setHoveredVessel] = useState<VesselId | null>(null);

  const ladColor = getProbabilityColor(probabilities.LAD);
  const lcxColor = getProbabilityColor(probabilities.LCX);
  const rcaColor = getProbabilityColor(probabilities.RCA);

  return (
    <div className="svg-heart-container">
      <div className="svg-fallback-badge">
        <span>2D Interactive Anatomical Diagram</span>
      </div>

      <svg viewBox="0 0 500 500" className="svg-heart-canvas">
        <defs>
          <radialGradient id="myoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#0f172a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Myocardium Silhouette */}
        <path
          d="M 250 140 C 210 80, 100 90, 110 210 C 115 280, 180 370, 250 440 C 320 370, 385 280, 390 210 C 400 90, 290 80, 250 140 Z"
          fill="url(#myoGlow)"
          stroke="#334155"
          strokeWidth="3"
        />

        {/* Left Ventricle & Septum Indication */}
        <path
          d="M 250 170 C 230 260, 220 350, 250 435"
          fill="none"
          stroke="#1e293b"
          strokeWidth="4"
          strokeDasharray="6,6"
        />

        {/* Aorta Root & Arch */}
        <path
          d="M 230 140 Q 210 50, 260 40 Q 300 35, 305 130"
          fill="none"
          stroke="#475569"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path
          d="M 245 42 L 245 20 M 270 38 L 270 18 M 290 45 L 290 22"
          stroke="#64748b"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Pulmonary Trunk */}
        <path
          d="M 270 135 Q 240 100, 180 110"
          fill="none"
          stroke="#334155"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* ================= CORONARY VESSELS ================= */}

        {/* RCA (Right Coronary Artery) */}
        <g
          className={`vessel-svg-group ${selectedVessel === 'RCA' ? 'selected' : ''}`}
          onClick={() => onSelectVessel('RCA')}
          onMouseEnter={() => setHoveredVessel('RCA')}
          onMouseLeave={() => setHoveredVessel(null)}
          style={{ cursor: 'pointer' }}
        >
          {/* Main RCA Trunk */}
          <path
            d="M 225 145 C 190 155, 140 190, 150 250 C 158 300, 175 350, 210 395"
            fill="none"
            stroke={rcaColor.hex}
            strokeWidth={selectedVessel === 'RCA' ? '10' : '7'}
            filter={selectedVessel === 'RCA' ? 'url(#glowEffect)' : undefined}
          />
          {/* RCA Acute Marginal Branches */}
          <path
            d="M 148 245 Q 125 260, 120 285 M 165 315 Q 150 335, 145 355 M 190 370 Q 185 390, 195 405"
            fill="none"
            stroke={rcaColor.hex}
            strokeWidth="3.5"
            opacity="0.85"
          />
          {/* RCA Interactive Hotspot */}
          <circle cx="150" cy="250" r="14" fill={rcaColor.hex} opacity="0.3" />
        </g>

        {/* LAD (Left Anterior Descending) */}
        <g
          className={`vessel-svg-group ${selectedVessel === 'LAD' ? 'selected' : ''}`}
          onClick={() => onSelectVessel('LAD')}
          onMouseEnter={() => setHoveredVessel('LAD')}
          onMouseLeave={() => setHoveredVessel(null)}
          style={{ cursor: 'pointer' }}
        >
          {/* Main LAD Trunk descending anterior interventricular sulcus */}
          <path
            d="M 268 150 C 265 190, 255 260, 252 330 C 250 380, 248 410, 250 435"
            fill="none"
            stroke={ladColor.hex}
            strokeWidth={selectedVessel === 'LAD' ? '11' : '8'}
            filter={selectedVessel === 'LAD' ? 'url(#glowEffect)' : undefined}
          />
          {/* LAD Diagonal Branches (D1, D2) */}
          <path
            d="M 263 210 Q 295 240, 310 270 M 256 275 Q 285 305, 295 340 M 252 345 Q 275 375, 280 400"
            fill="none"
            stroke={ladColor.hex}
            strokeWidth="4"
            opacity="0.85"
          />
          {/* LAD Septal Perforators */}
          <path
            d="M 260 235 Q 240 250, 235 265 M 254 295 Q 235 310, 230 325"
            fill="none"
            stroke={ladColor.hex}
            strokeWidth="3"
            opacity="0.7"
          />
          {/* LAD Interactive Hotspot */}
          <circle cx="260" cy="240" r="14" fill={ladColor.hex} opacity="0.3" />
        </g>

        {/* LCX (Left Circumflex Artery) */}
        <g
          className={`vessel-svg-group ${selectedVessel === 'LCX' ? 'selected' : ''}`}
          onClick={() => onSelectVessel('LCX')}
          onMouseEnter={() => setHoveredVessel('LCX')}
          onMouseLeave={() => setHoveredVessel(null)}
          style={{ cursor: 'pointer' }}
        >
          {/* Main LCX Trunk curving along AV groove */}
          <path
            d="M 275 148 C 310 155, 360 185, 365 240 C 370 280, 355 320, 335 360"
            fill="none"
            stroke={lcxColor.hex}
            strokeWidth={selectedVessel === 'LCX' ? '10' : '7'}
            filter={selectedVessel === 'LCX' ? 'url(#glowEffect)' : undefined}
          />
          {/* Obtuse Marginal Branches (OM1, OM2) */}
          <path
            d="M 345 200 Q 375 220, 385 245 M 365 245 Q 380 275, 375 305 M 350 300 Q 360 330, 350 355"
            fill="none"
            stroke={lcxColor.hex}
            strokeWidth="3.5"
            opacity="0.85"
          />
          {/* LCX Interactive Hotspot */}
          <circle cx="360" cy="235" r="14" fill={lcxColor.hex} opacity="0.3" />
        </g>

        {/* Vessel Badges on Diagram */}
        <g transform="translate(195, 235)">
          <rect x="-45" y="-12" width="90" height="24" rx="12" fill="#090d16" stroke={ladColor.hex} strokeWidth="2" />
          <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            LAD: {Math.round(probabilities.LAD * 100)}%
          </text>
        </g>

        <g transform="translate(370, 230)">
          <rect x="-45" y="-12" width="90" height="24" rx="12" fill="#090d16" stroke={lcxColor.hex} strokeWidth="2" />
          <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            LCX: {Math.round(probabilities.LCX * 100)}%
          </text>
        </g>

        <g transform="translate(130, 245)">
          <rect x="-45" y="-12" width="90" height="24" rx="12" fill="#090d16" stroke={rcaColor.hex} strokeWidth="2" />
          <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            RCA: {Math.round(probabilities.RCA * 100)}%
          </text>
        </g>

        {/* Cardiac Apex Marker */}
        <circle cx="250" cy="440" r="4" fill="#475569" />
      </svg>

      {/* Floating Hover/Click Callout */}
      {hoveredVessel && (
        <div className="svg-vessel-tooltip">
          <strong>{VESSEL_REGISTRY[hoveredVessel].displayName}</strong>
          <span className="tooltip-prob">
            Predicted Risk: {Math.round(probabilities[hoveredVessel] * 100)}% ({getProbabilityColor(probabilities[hoveredVessel]).label})
          </span>
          <span className="tooltip-hint">Click to inspect vascular territory and SHAP breakdown</span>
        </div>
      )}
    </div>
  );
};
