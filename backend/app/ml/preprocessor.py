"""
Data Preprocessing & Feature Engineering Pipeline
Handles median/mode imputation, one-hot encoding, and standard scaling.
"""
from typing import Dict, Any, Tuple
from app.schemas.patient import PatientInputSchema
from app.ml.leakage_guard import TargetLeakageGuard

# Baseline reference statistics from Z-Alizadeh Sani cohort (N=303)
POPULATION_MEANS = {
    "age": 58.9,
    "bmi": 27.8,
    "systolic_bp": 132.5,
    "pulse_rate": 74.2,
    "fbs": 119.1,
    "cholesterol": 224.3,
    "triglycerides": 182.1,
    "ldl": 141.2,
    "hdl": 40.8,
    "bun": 18.5,
    "creatinine": 1.05,
    "esr": 19.4,
    "ejection_fraction": 47.3
}

POPULATION_STDS = {
    "age": 10.2,
    "bmi": 4.1,
    "systolic_bp": 18.6,
    "pulse_rate": 11.4,
    "fbs": 44.8,
    "cholesterol": 49.3,
    "triglycerides": 88.5,
    "ldl": 38.6,
    "hdl": 10.4,
    "bun": 6.8,
    "creatinine": 0.32,
    "esr": 15.2,
    "ejection_fraction": 8.9
}

class ClinicalPreprocessor:
    def __init__(self):
        self.leakage_guard = TargetLeakageGuard()

    def process(self, patient: PatientInputSchema) -> Tuple[Dict[str, float], Dict[str, Any]]:
        """
        Transforms raw patient intake into normalized feature vector
        while programmatically guaranteeing zero target leakage.
        """
        raw_dict: Dict[str, Any] = {
            "age": patient.demographics.age,
            "sex": patient.demographics.sex,
            "bmi": patient.demographics.bmi,
            "systolic_bp": patient.history_vitals.systolic_bp,
            "pulse_rate": patient.history_vitals.pulse_rate,
            "current_smoker": 1.0 if patient.history_vitals.current_smoker else 0.0,
            "hypertension": 1.0 if patient.history_vitals.hypertension else 0.0,
            "diabetes": 1.0 if patient.history_vitals.diabetes else 0.0,
            "family_history": 1.0 if patient.history_vitals.family_history else 0.0,
            "typical_chest_pain": 1.0 if patient.history_vitals.typical_chest_pain else 0.0,
            "dyspnea": 1.0 if patient.history_vitals.dyspnea else 0.0,
            "atypical_cp": 1.0 if patient.history_vitals.atypical_cp else 0.0,
            "nonanginal_cp": 1.0 if patient.history_vitals.nonanginal_cp else 0.0,
            "exertional_cp": 1.0 if patient.history_vitals.exertional_cp else 0.0,
            "fbs": patient.laboratory.fbs,
            "cholesterol": patient.laboratory.cholesterol,
            "triglycerides": patient.laboratory.triglycerides,
            "ldl": patient.laboratory.ldl,
            "hdl": patient.laboratory.hdl,
            "bun": patient.laboratory.bun,
            "creatinine": patient.laboratory.creatinine,
            "esr": patient.laboratory.esr or 15.0,
            "st_elevation": 1.0 if patient.ecg_echo.st_elevation else 0.0,
            "st_depression": 1.0 if patient.ecg_echo.st_depression else 0.0,
            "t_inversion": 1.0 if patient.ecg_echo.t_inversion else 0.0,
            "lvh": 1.0 if patient.ecg_echo.lvh else 0.0,
            "poor_r_wave_progression": 1.0 if patient.ecg_echo.poor_r_wave_progression else 0.0,
            "ejection_fraction": patient.ecg_echo.ejection_fraction,
            "region_with_rwma": patient.ecg_echo.region_with_rwma,
            "vhd": patient.ecg_echo.vhd or "None",
            # Potential target columns passed inadvertently
            "lad": patient.lad,
            "lcx": patient.lcx,
            "rca": patient.rca,
            "cath": patient.cath,
            "cad": patient.cad,
        }

        # Step 1: Programmatic Target Leakage Quarantine
        guarded_dict = self.leakage_guard.filter_features(raw_dict)
        self.leakage_guard.verify_no_leakage(list(guarded_dict.keys()))

        # Step 2: One-hot encoding & standard scaling
        features: Dict[str, float] = {}

        # Continuous standardized features
        for key, mean in POPULATION_MEANS.items():
            val = float(guarded_dict.get(key, mean))
            std = POPULATION_STDS.get(key, 1.0)
            features[f"{key}_z"] = (val - mean) / std
            features[key] = val

        # Binary indicators
        binary_keys = [
            "current_smoker", "hypertension", "diabetes", "family_history",
            "typical_chest_pain", "dyspnea", "atypical_cp", "nonanginal_cp",
            "exertional_cp", "st_elevation", "st_depression", "t_inversion",
            "lvh", "poor_r_wave_progression"
        ]
        for b_key in binary_keys:
            features[b_key] = float(guarded_dict.get(b_key, 0.0))

        # Categorical: Sex
        features["sex_Male"] = 1.0 if guarded_dict.get("sex") == "Male" else 0.0
        features["sex_Female"] = 1.0 if guarded_dict.get("sex") == "Female" else 0.0

        # Categorical: Region with RWMA (Critical coronary indicator)
        rwma = guarded_dict.get("region_with_rwma", "None")
        for region in ["None", "Anterior", "Inferior", "Lateral", "Apical", "Septal"]:
            features[f"rwma_{region.lower()}"] = 1.0 if rwma == region else 0.0

        # Categorical: VHD
        vhd = guarded_dict.get("vhd", "None")
        for level in ["None", "Mild", "Moderate", "Severe"]:
            features[f"vhd_{level.lower()}"] = 1.0 if vhd == level else 0.0

        return features, guarded_dict
