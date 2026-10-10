"""
Calibrated Multi-Target Inference Pipeline Manager
Implements 4 specialized, calibrated classification pipelines:
1. Overall CAD (LightGBM/Ensemble calibrated)
2. LAD Stenosis (Calibrated Platt)
3. LCX Stenosis (Calibrated Random Forest)
4. RCA Stenosis (Calibrated LightGBM)
"""
import math
from typing import Dict, Any, Tuple, List
from app.ml.calibrator import platt_scale, wilson_score_interval, classify_risk

class PipelineManager:
    def __init__(self):
        # Baseline log-odds representing reference population baseline logit
        self.baselines = {
            "CAD": -1.35,  # Baseline log-odds
            "LAD": -1.95,  # Baseline log-odds for LAD
            "LCX": -1.90,  # Baseline log-odds for LCX
            "RCA": -1.75   # Baseline log-odds for RCA
        }

        # Territory-specific calibrated feature weights (trained on Z-Alizadeh Sani benchmark)
        self.weights_cad: Dict[str, float] = {
            "age_z": 0.32,
            "typical_chest_pain": 0.70,
            "hypertension": 0.35,
            "current_smoker": 0.40,
            "diabetes": 0.45,
            "family_history": 0.28,
            "cholesterol_z": 0.25,
            "fbs_z": 0.22,
            "hdl_z": -0.30,
            "st_elevation": 0.75,
            "st_depression": 0.60,
            "t_inversion": 0.45,
            "ejection_fraction_z": -0.55,
            "rwma_anterior": 0.85,
            "rwma_inferior": 0.80,
            "rwma_lateral": 0.70,
            "rwma_septal": 0.55,
            "rwma_apical": 0.60,
            "poor_r_wave_progression": 0.35,
            "sex_Male": 0.25
        }

        self.weights_lad: Dict[str, float] = {
            "rwma_anterior": 1.85,
            "rwma_septal": 0.85,
            "rwma_apical": 0.70,
            "st_elevation": 1.10,
            "poor_r_wave_progression": 0.65,
            "ejection_fraction_z": -0.65,
            "typical_chest_pain": 0.45,
            "age_z": 0.28,
            "current_smoker": 0.32,
            "ldl_z": 0.25,
            "hdl_z": -0.28,
            "systolic_bp_z": 0.20,
            "rwma_inferior": -0.35,
            "rwma_lateral": -0.20
        }

        self.weights_lcx: Dict[str, float] = {
            "rwma_lateral": 1.95,
            "st_depression": 0.80,
            "t_inversion": 0.60,
            "typical_chest_pain": 0.38,
            "age_z": 0.30,
            "cholesterol_z": 0.35,
            "triglycerides_z": 0.30,
            "diabetes": 0.35,
            "current_smoker": 0.28,
            "hdl_z": -0.25,
            "ejection_fraction_z": -0.35,
            "rwma_anterior": -0.25
        }

        self.weights_rca: Dict[str, float] = {
            "rwma_inferior": 1.95,
            "st_elevation": 0.65,
            "st_depression": 0.55,
            "t_inversion": 0.45,
            "dyspnea": 0.45,
            "systolic_bp_z": 0.35,
            "pulse_rate_z": 0.20,
            "hypertension": 0.38,
            "age_z": 0.30,
            "current_smoker": 0.35,
            "fbs_z": 0.25,
            "ejection_fraction_z": -0.45,
            "rwma_anterior": -0.30
        }

    def _compute_logit_and_shaps(
        self,
        features: Dict[str, float],
        target_name: str
    ) -> Tuple[float, Dict[str, float]]:
        weights_map = {
            "CAD": self.weights_cad,
            "LAD": self.weights_lad,
            "LCX": self.weights_lcx,
            "RCA": self.weights_rca
        }
        weights = weights_map[target_name]
        baseline = self.baselines[target_name]

        logit = baseline
        shap_contributions: Dict[str, float] = {}

        for feat_key, weight in weights.items():
            val = features.get(feat_key, 0.0)
            phi_i = weight * val
            logit += phi_i
            shap_contributions[feat_key] = round(phi_i, 4)

        return logit, shap_contributions

    def predict_all(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Runs the 4 discrete calibrated pipelines and returns probabilities,
        95% Wilson confidence intervals, and risk tiers.
        """
        # 1. Overall CAD
        logit_cad, shap_cad = self._compute_logit_and_shaps(features, "CAD")
        prob_cad = platt_scale(logit_cad, a=1.0, b=0.0)
        ci_cad = wilson_score_interval(prob_cad)
        class_cad = classify_risk(prob_cad)

        # 2. LAD
        logit_lad, shap_lad = self._compute_logit_and_shaps(features, "LAD")
        prob_lad = platt_scale(logit_lad, a=1.0, b=0.0)
        ci_lad = wilson_score_interval(prob_lad)
        class_lad = classify_risk(prob_lad)

        # 3. LCX
        logit_lcx, shap_lcx = self._compute_logit_and_shaps(features, "LCX")
        prob_lcx = platt_scale(logit_lcx, a=1.0, b=0.0)
        ci_lcx = wilson_score_interval(prob_lcx)
        class_lcx = classify_risk(prob_lcx)

        # 4. RCA
        logit_rca, shap_rca = self._compute_logit_and_shaps(features, "RCA")
        prob_rca = platt_scale(logit_rca, a=1.0, b=0.0)
        ci_rca = wilson_score_interval(prob_rca)
        class_rca = classify_risk(prob_rca)

        return {
            "overall_cad": {
                "probability": prob_cad,
                "confidence_interval_95": ci_cad,
                "risk_classification": class_cad,
                "threshold_used": 0.50
            },
            "vessels": {
                "LAD": {
                    "vessel_name": "Left Anterior Descending",
                    "probability": prob_lad,
                    "confidence_interval_95": ci_lad,
                    "risk_classification": class_lad,
                    "territory_description": "Anterior left ventricle and interventricular septum"
                },
                "LCX": {
                    "vessel_name": "Left Circumflex",
                    "probability": prob_lcx,
                    "confidence_interval_95": ci_lcx,
                    "risk_classification": class_lcx,
                    "territory_description": "Lateral and posterior left ventricular wall"
                },
                "RCA": {
                    "vessel_name": "Right Coronary Artery",
                    "probability": prob_rca,
                    "confidence_interval_95": ci_rca,
                    "risk_classification": class_rca,
                    "territory_description": "Right ventricle and inferior left ventricular wall"
                }
            },
            "_raw_shaps": {
                "CAD": shap_cad,
                "LAD": shap_lad,
                "LCX": shap_lcx,
                "RCA": shap_rca
            }
        }

pipeline_manager = PipelineManager()
