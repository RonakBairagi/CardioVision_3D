from pydantic import BaseModel, Field
from typing import Dict, List, Literal

class OverallCadPrediction(BaseModel):
    probability: float = Field(..., ge=0.0, le=1.0, description="Calibrated probability of overall CAD (>=50% stenosis)")
    confidence_interval_95: List[float] = Field(..., min_length=2, max_length=2, description="95% Wilson score confidence interval [lower, upper]")
    risk_classification: Literal["Low Risk", "Moderate Risk", "High Risk"] = Field(..., description="Categorical risk tier")
    threshold_used: float = Field(0.50, description="Decision boundary threshold")

class VesselRisk(BaseModel):
    vessel_name: str = Field(..., description="Canonical full anatomical artery name")
    probability: float = Field(..., ge=0.0, le=1.0, description="Calibrated stenosis probability (0.0 - 1.0)")
    confidence_interval_95: List[float] = Field(..., min_length=2, max_length=2, description="95% Wilson confidence interval [lower, upper]")
    risk_classification: Literal["Low Risk", "Moderate Risk", "High Risk"] = Field(..., description="Clinical risk category")
    territory_description: str = Field(..., description="Myocardial territory perfused by this vessel")

class PredictionResponseSchema(BaseModel):
    status: str = Field("success", description="Response status")
    model_version: str = Field("v1.2.0-calibrated", description="Model training & calibration artifact release")
    timestamp: str = Field(..., description="ISO 8601 evaluation timestamp")
    predictions: Dict[str, object] = Field(
        ...,
        description="Dictionary containing 'overall_cad' and 'vessels' (LAD, LCX, RCA)"
    )
    quarantine_verified: bool = Field(True, description="Strict target-leakage quarantine verification flag")
    disclaimer: str = Field(..., description="Mandatory non-diagnostic clinical safety disclaimer")
