export type VesselId = 'LAD' | 'LCX' | 'RCA';

export interface Demographics {
  age: number;
  sex: 'Male' | 'Female';
  bmi: number;
}

export interface HistoryVitals {
  systolic_bp: number;
  pulse_rate: number;
  current_smoker: boolean;
  hypertension: boolean;
  diabetes: boolean;
  family_history: boolean;
  typical_chest_pain: boolean;
  dyspnea: boolean;
  atypical_cp?: boolean;
  nonanginal_cp?: boolean;
  exertional_cp?: boolean;
}

export interface Laboratory {
  fbs: number;
  cholesterol: number;
  triglycerides: number;
  ldl: number;
  hdl: number;
  bun: number;
  creatinine: number;
  esr?: number;
}

export interface EcgEcho {
  st_elevation: boolean;
  st_depression: boolean;
  t_inversion: boolean;
  lvh: boolean;
  poor_r_wave_progression: boolean;
  ejection_fraction: number;
  region_with_rwma: 'None' | 'Anterior' | 'Inferior' | 'Lateral' | 'Apical' | 'Septal';
  vhd?: 'None' | 'Mild' | 'Moderate' | 'Severe';
}

export interface PatientInput {
  demographics: Demographics;
  history_vitals: HistoryVitals;
  laboratory: Laboratory;
  ecg_echo: EcgEcho;
  notes?: string;
}

export interface OverallCadPrediction {
  probability: number;
  confidence_interval_95: [number, number];
  risk_classification: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  threshold_used: number;
}

export interface VesselRisk {
  vessel_name: string;
  probability: number;
  confidence_interval_95: [number, number];
  risk_classification: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  territory_description: string;
}

export interface PredictionResponse {
  status: string;
  model_version: string;
  timestamp: string;
  predictions: {
    overall_cad: OverallCadPrediction;
    vessels: Record<VesselId, VesselRisk>;
  };
  quarantine_verified: boolean;
  disclaimer: string;
}

export interface AttributionItem {
  feature_key: string;
  display_name: string;
  patient_value: string;
  shap_value: number;
  effect: 'Increases Risk' | 'Decreases Risk';
}

export interface ShapResponse {
  target: VesselId | 'CAD';
  base_value: number;
  predicted_value: number;
  top_attributions: AttributionItem[];
  interpretation_note: string;
}

export interface Archetype {
  id: string;
  title: string;
  badge: string;
  badge_color: 'emerald' | 'rose' | 'amber';
  summary: string;
  expected_visual: string;
  expected_risk: Record<string, string>;
  payload: PatientInput;
}

export interface CounterfactualSimulationResult {
  status: string;
  baseline_probabilities: Record<string, number>;
  counterfactual_probabilities: Record<string, number>;
  risk_deltas: Record<string, number>;
  lifestyle_impact_summary: string;
  simulated_predictions: {
    overall_cad: OverallCadPrediction;
    vessels: Record<VesselId, VesselRisk>;
  };
}
