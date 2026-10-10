from pydantic import BaseModel, Field
from typing import List, Literal

class AttributionItem(BaseModel):
    feature_key: str = Field(..., description="Internal normalized feature code")
    display_name: str = Field(..., description="Standardized clinical terminology")
    patient_value: str = Field(..., description="Observed patient measurement formatted with units")
    shap_value: float = Field(..., description="Shapley log-odds contribution (phi_i)")
    effect: Literal["Increases Risk", "Decreases Risk"] = Field(..., description="Directional impact on predicted probability")

class ShapResponseSchema(BaseModel):
    target: str = Field(..., description="Target vessel territory (LAD, LCX, RCA, CAD)")
    base_value: float = Field(..., description="Baseline expected value E[f(X)] from training cohort")
    predicted_value: float = Field(..., description="Calibrated predicted probability for patient")
    top_attributions: List[AttributionItem] = Field(..., description="Ordered list of top contributing features")
    interpretation_note: str = Field(..., description="Clinical disclaimer on feature attribution vs causation")
