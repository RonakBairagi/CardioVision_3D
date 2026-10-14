import {
  PatientInput,
  PredictionResponse,
  ShapResponse,
  Archetype,
  CounterfactualSimulationResult,
  VesselId
} from '../types/cardio';
import { DEMO_ARCHETYPES, CV_BENCHMARK_STATIC } from '../constants/demoData';
import {
  computeInference,
  computeExplanation,
  computeCounterfactual
} from './inferenceEngine';

// Base URL configuration:
// In Vercel deployment and local dev proxy, use same-origin relative path '/api/v1'
// (requests to /api/(.*) are routed to the backend service via Vercel rewrites).
// Falls back to import.meta.env.VITE_API_BASE_URL if explicitly provided.
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : '/api/v1';

class ApiClient {
  private isOffline = false;

  public getIsOffline(): boolean {
    return this.isOffline;
  }

  /**
   * Run multi-vessel CAD inference
   */
  async predict(patient: PatientInput): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
        signal: AbortSignal.timeout(3000)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.isOffline = false;
      return await response.json();
    } catch {
      this.isOffline = true;
      return this.localSimulateInference(patient);
    }
  }

  /**
   * Compute TreeSHAP explainability
   */
  async explain(patient: PatientInput, target: VesselId | 'CAD' = 'LAD'): Promise<ShapResponse> {
    try {
      const response = await fetch(`${BASE_URL}/explain?target=${target}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
        signal: AbortSignal.timeout(3000)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.isOffline = false;
      return await response.json();
    } catch {
      this.isOffline = true;
      return this.localSimulateExplanation(patient, target);
    }
  }

  /**
   * Get demo archetypes
   */
  async getDemoArchetypes(): Promise<Archetype[]> {
    try {
      const response = await fetch(`${BASE_URL}/patients/demo`, { signal: AbortSignal.timeout(2500) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      this.isOffline = false;
      return data.archetypes;
    } catch {
      this.isOffline = true;
      return DEMO_ARCHETYPES;
    }
  }

  /**
   * Get cross-validation metrics
   */
  async getCvMetrics(): Promise<typeof CV_BENCHMARK_STATIC> {
    try {
      const response = await fetch(`${BASE_URL}/metrics/cv`, { signal: AbortSignal.timeout(2500) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      this.isOffline = false;
      return data;
    } catch {
      this.isOffline = true;
      return CV_BENCHMARK_STATIC;
    }
  }

  /**
   * Counterfactual risk simulation
   */
  async counterfactual(
    patient: PatientInput,
    modifications: {
      systolic_bp?: number;
      current_smoker?: boolean;
      cholesterol?: number;
      ldl?: number;
      hdl?: number;
      bmi?: number;
    }
  ): Promise<CounterfactualSimulationResult> {
    try {
      const response = await fetch(`${BASE_URL}/counterfactual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseline_patient: patient, modifications }),
        signal: AbortSignal.timeout(3000)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.isOffline = false;
      return await response.json();
    } catch {
      this.isOffline = true;
      return this.localSimulateCounterfactual(patient, modifications);
    }
  }

  // --- Local Calibrated Fallback Engine ---

  private localSimulateInference(patient: PatientInput): PredictionResponse {
    return computeInference(patient);
  }

  private localSimulateExplanation(patient: PatientInput, target: VesselId | 'CAD'): ShapResponse {
    return computeExplanation(patient, target);
  }

  private localSimulateCounterfactual(
    patient: PatientInput,
    modifications: any
  ): CounterfactualSimulationResult {
    return computeCounterfactual(patient, modifications);
  }
}

export const apiClient = new ApiClient();
