"""
Model Explainability Service (TreeSHAP)
Translates mathematical feature attributions into clinically grounded explanations.
"""
from typing import Dict, Any, List
from app.schemas.patient import PatientInputSchema
from app.schemas.explanation import ShapResponseSchema, AttributionItem
from app.ml.preprocessor import ClinicalPreprocessor
from app.ml.pipeline_manager import pipeline_manager

CLINICAL_FEATURE_MAPPING: Dict[str, str] = {
    "rwma_anterior": "Echocardiographic Wall Motion Abnormality (Anterior)",
    "rwma_inferior": "Echocardiographic Wall Motion Abnormality (Inferior)",
    "rwma_lateral": "Echocardiographic Wall Motion Abnormality (Lateral)",
    "rwma_septal": "Echocardiographic Wall Motion Abnormality (Septal)",
    "rwma_apical": "Echocardiographic Wall Motion Abnormality (Apical)",
    "st_elevation": "ST-Segment Elevation (12-Lead ECG)",
    "st_depression": "ST-Segment Depression (12-Lead ECG)",
    "t_inversion": "T-Wave Inversion (12-Lead ECG)",
    "poor_r_wave_progression": "Poor R-Wave Progression (PRWP)",
    "ejection_fraction_z": "Left Ventricular Ejection Fraction (LVEF)",
    "typical_chest_pain": "Typical Anginal Chest Pain",
    "dyspnea": "Exertional Dyspnea",
    "systolic_bp_z": "Systolic Blood Pressure (mmHg)",
    "age_z": "Patient Age",
    "current_smoker": "Current Tobacco Smoking Status",
    "diabetes": "History of Diabetes Mellitus",
    "hypertension": "History of Hypertension",
    "family_history": "Family History of CAD",
    "cholesterol_z": "Total Serum Cholesterol (mg/dL)",
    "triglycerides_z": "Serum Triglycerides (mg/dL)",
    "ldl_z": "Low-Density Lipoprotein (LDL-C)",
    "hdl_z": "High-Density Lipoprotein (HDL-C)",
    "fbs_z": "Fasting Blood Sugar (mg/dL)",
    "pulse_rate_z": "Resting Heart / Pulse Rate (bpm)"
}

class ExplainabilityService:
    def __init__(self):
        self.preprocessor = ClinicalPreprocessor()

    def _format_patient_value(self, feature_key: str, patient: PatientInputSchema) -> str:
        if "rwma" in feature_key:
            return f"Present ({patient.ecg_echo.region_with_rwma})"
        elif feature_key == "st_elevation":
            return "Present (Precordial)" if patient.ecg_echo.st_elevation else "Absent"
        elif feature_key == "st_depression":
            return "Present" if patient.ecg_echo.st_depression else "Absent"
        elif feature_key == "t_inversion":
            return "Inverted" if patient.ecg_echo.t_inversion else "Normal"
        elif feature_key == "poor_r_wave_progression":
            return "Observed" if patient.ecg_echo.poor_r_wave_progression else "Normal"
        elif "ejection_fraction" in feature_key:
            return f"{patient.ecg_echo.ejection_fraction:.0f}%"
        elif "systolic_bp" in feature_key:
            return f"{patient.history_vitals.systolic_bp} mmHg"
        elif "cholesterol" in feature_key:
            return f"{patient.laboratory.cholesterol:.0f} mg/dL"
        elif "ldl" in feature_key:
            return f"{patient.laboratory.ldl:.0f} mg/dL"
        elif "hdl" in feature_key:
            return f"{patient.laboratory.hdl:.0f} mg/dL"
        elif "fbs" in feature_key:
            return f"{patient.laboratory.fbs:.0f} mg/dL"
        elif "triglycerides" in feature_key:
            return f"{patient.laboratory.triglycerides:.0f} mg/dL"
        elif "age" in feature_key:
            return f"{patient.demographics.age} yrs"
        elif feature_key == "current_smoker":
            return "Active Smoker" if patient.history_vitals.current_smoker else "Non-Smoker"
        elif feature_key == "typical_chest_pain":
            return "Yes (Substernal)" if patient.history_vitals.typical_chest_pain else "No"
        elif feature_key == "diabetes":
            return "Diagnosed" if patient.history_vitals.diabetes else "No"
        elif feature_key == "hypertension":
            return "Diagnosed" if patient.history_vitals.hypertension else "No"
        elif feature_key == "dyspnea":
            return "Reported" if patient.history_vitals.dyspnea else "No"
        return "Observed"

    def explain(self, patient: PatientInputSchema, target: str = "LAD") -> Dict[str, Any]:
        target = target.upper()
        if target not in ["LAD", "LCX", "RCA", "CAD"]:
            target = "LAD"

        features, _ = self.preprocessor.process(patient)
        predictions = pipeline_manager.predict_all(features)
        
        raw_shaps = predictions["_raw_shaps"].get(target, {})
        base_value = 0.38 if target == "LAD" else (0.28 if target == "LCX" else (0.35 if target == "RCA" else 0.46))

        if target == "CAD":
            pred_prob = predictions["overall_cad"]["probability"]
        else:
            pred_prob = predictions["vessels"][target]["probability"]

        # Sort features by absolute SHAP contribution
        sorted_feats = sorted(raw_shaps.items(), key=lambda item: abs(item[1]), reverse=True)

        top_attributions: List[AttributionItem] = []
        for feat_key, phi in sorted_feats[:8]:
            if abs(phi) < 0.001:
                continue
            display_name = CLINICAL_FEATURE_MAPPING.get(feat_key, feat_key.replace("_", " ").title())
            p_val = self._format_patient_value(feat_key, patient)
            top_attributions.append(AttributionItem(
                feature_key=feat_key,
                display_name=display_name,
                patient_value=p_val,
                shap_value=round(phi, 4),
                effect="Increases Risk" if phi > 0 else "Decreases Risk"
            ))

        return {
            "target": target,
            "base_value": base_value,
            "predicted_value": pred_prob,
            "top_attributions": [item.model_dump() for item in top_attributions],
            "interpretation_note": (
                "SHAP values represent additive contributions to the model's log-odds score. "
                "They quantify statistical feature importance and do not prove direct biological causation."
            )
        }

explainability_service = ExplainabilityService()
