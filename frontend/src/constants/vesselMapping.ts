import { VesselId } from '../types/cardio';

export interface VesselMetadata {
  id: VesselId;
  meshNodeName: string;
  displayName: string;
  anatomicalDescription: string;
  clinicalSignificance: string;
  cameraFocusPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export const VESSEL_REGISTRY: Record<VesselId, VesselMetadata> = {
  LAD: {
    id: 'LAD',
    meshNodeName: 'Node_LAD',
    displayName: 'Left Anterior Descending Artery',
    anatomicalDescription: 'Traverses the anterior interventricular sulcus towards the apex.',
    clinicalSignificance: 'Supplies ~50% of left ventricular myocardium, anterior wall, and interventricular septum ("Widow-maker" vascular territory).',
    cameraFocusPosition: [0.2, 0.4, 2.7],
    cameraTarget: [0.0, 0.1, 0.2]
  },
  LCX: {
    id: 'LCX',
    meshNodeName: 'Node_LCX',
    displayName: 'Left Circumflex Artery',
    anatomicalDescription: 'Branches off left main, curving along the left atrioventricular groove.',
    clinicalSignificance: 'Perfuses posterolateral left ventricular free wall and obtuse cardiac margin.',
    cameraFocusPosition: [-2.5, 0.5, 1.2],
    cameraTarget: [-0.3, 0.0, 0.0]
  },
  RCA: {
    id: 'RCA',
    meshNodeName: 'Node_RCA',
    displayName: 'Right Coronary Artery',
    anatomicalDescription: 'Travels down right atrioventricular groove towards the crux of the heart.',
    clinicalSignificance: 'Supplies right ventricle, inferior/diaphragmatic LV wall, SA node (60%), and AV node (90% right-dominant).',
    cameraFocusPosition: [2.5, -0.3, 1.2],
    cameraTarget: [0.2, -0.1, 0.0]
  }
};

/**
 * Maps calibrated probability P in [0, 1] to continuous RGB color
 * 0.0 - 0.30: Cool Cyan/Teal (#0ea5e9 -> #14b8a6)
 * 0.30 - 0.65: Amber/Gold (#f59e0b)
 * 0.65 - 1.00: Vivid Crimson (#ef4444)
 */
export function getProbabilityColor(p: number): { hex: string; rgb: [number, number, number]; label: string } {
  const clamped = Math.max(0.0, Math.min(1.0, p));
  
  if (clamped <= 0.30) {
    // Interpolate from deep cyan to teal
    const t = clamped / 0.30;
    const r = Math.round(14 + (20 - 14) * t);
    const g = Math.round(165 + (184 - 165) * t);
    const b = Math.round(233 + (166 - 233) * t);
    return {
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      rgb: [r / 255, g / 255, b / 255],
      label: 'Low Stenosis Risk'
    };
  } else if (clamped <= 0.65) {
    // Interpolate from teal to warm amber
    const t = (clamped - 0.30) / 0.35;
    const r = Math.round(20 + (245 - 20) * t);
    const g = Math.round(184 + (158 - 184) * t);
    const b = Math.round(166 + (11 - 166) * t);
    return {
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      rgb: [r / 255, g / 255, b / 255],
      label: 'Moderate / Equivocal'
    };
  } else {
    // Interpolate from amber to vivid crimson
    const t = (clamped - 0.65) / 0.35;
    const r = Math.round(245 + (239 - 245) * t);
    const g = Math.round(158 + (68 - 158) * t);
    const b = Math.round(11 + (68 - 11) * t);
    return {
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      rgb: [r / 255, g / 255, b / 255],
      label: 'High Stenosis Risk'
    };
  }
}
