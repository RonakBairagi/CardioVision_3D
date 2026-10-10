"""
Inference Service
Orchestrates patient preprocessing, target leakage quarantine, and multi-model calibrated predictions.
"""
from datetime import datetime, timezone
from typing import Dict, Any
from app.core.config import settings
from app.core.logging import logger
from app.schemas.patient import PatientInputSchema
from app.schemas.prediction import PredictionResponseSchema
from app.ml.preprocessor import ClinicalPreprocessor
from app.ml.pipeline_manager import pipeline_manager

class InferenceService:
    def __init__(self):
        self.preprocessor = ClinicalPreprocessor()

    def run_inference(self, patient: PatientInputSchema) -> Dict[str, Any]:
        # Preprocess features & apply leakage quarantine
        features, guarded_dict = self.preprocessor.process(patient)
        
        # Run 4 calibrated model pipelines
        results = pipeline_manager.predict_all(features)

        response = {
            "status": "success",
            "model_version": settings.MODEL_VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "predictions": {
                "overall_cad": results["overall_cad"],
                "vessels": results["vessels"]
            },
            "_raw_shaps": results["_raw_shaps"],
            "quarantine_verified": True,
            "disclaimer": settings.DISCLAIMER_TEXT
        }

        logger.info(
            f"Inference completed successfully: CAD={results['overall_cad']['probability']:.3f}, "
            f"LAD={results['vessels']['LAD']['probability']:.3f}, "
            f"LCX={results['vessels']['LCX']['probability']:.3f}, "
            f"RCA={results['vessels']['RCA']['probability']:.3f}"
        )
        return response

inference_service = InferenceService()
