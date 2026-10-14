export interface VesselMetadata {
  id: 'LAD' | 'LCX' | 'RCA';
  meshNodeName: string;
  displayName: string;
  anatomicalDescription: string;
  clinicalSignificance: string;
  cameraFocusPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export const VESSEL_REGISTRY: Record<'LAD' | 'LCX' | 'RCA', VesselMetadata> = {
  LAD: {
    id: 'LAD',
    meshNodeName: 'Node_LAD',
    displayName: 'Left Anterior Descending Artery',
    anatomicalDescription: 'Supplies anterior left ventricle and interventricular septum.',
    clinicalSignificance: 'Supplies 45-55% of left ventricular myocardium. Stenosis carries high risk of extensive anterior infarction.',
    cameraFocusPosition: [0.2, 0.4, 2.2],
    cameraTarget: [0.0, 0.1, 0.2]
  },
  LCX: {
    id: 'LCX',
    meshNodeName: 'Node_LCX',
    displayName: 'Left Circumflex Artery',
    anatomicalDescription: 'Supplies posterolateral left ventricular wall.',
    clinicalSignificance: 'Perfuses posterolateral left ventricle and anterolateral papillary muscle.',
    cameraFocusPosition: [-2.1, 0.5, 0.8],
    cameraTarget: [-0.2, 0.0, 0.0]
  },
  RCA: {
    id: 'RCA',
    meshNodeName: 'Node_RCA',
    displayName: 'Right Coronary Artery',
    anatomicalDescription: 'Supplies right ventricle and inferior left ventricular wall.',
    clinicalSignificance: 'Perfuses right ventricle, inferior wall, and SA/AV nodal pacing tissue in right-dominant hearts.',
    cameraFocusPosition: [2.0, -0.3, 0.9],
    cameraTarget: [0.1, -0.1, 0.0]
  }
};

export function getProbabilityColor(probability: number): { hex: string; label: string } {
  if (probability <= 0.30) {
    return { hex: '#0ea5e9', label: 'Low Risk' };
  } else if (probability <= 0.65) {
    return { hex: '#f59e0b', label: 'Moderate Risk' };
  } else {
    return { hex: '#ef4444', label: 'High Risk' };
  }
}
