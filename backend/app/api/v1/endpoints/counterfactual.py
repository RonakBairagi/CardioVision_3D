from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.schemas.patient import PatientInputSchema
from app.services.inference_service import inference_service

router = APIRouter()

class CounterfactualModifications(BaseModel):
    systolic_bp: Optional[int] = Field(None, ge=60, le=240)
    current_smoker: Optional[bool] = None
    cholesterol: Optional[float] = Field(None, ge=100.0, le=500.0)
    ldl: Optional[float] = Field(None, ge=30.0, le=350.0)
    hdl: Optional[float] = Field(None, ge=15.0, le=120.0)
    bmi: Optional[float] = Field(None, ge=15.0, le=60.0)

class CounterfactualRequest(BaseModel):
    baseline_patient: PatientInputSchema
    modifications: CounterfactualModifications

@router.post("/counterfactual", summary="Simulate lifestyle/intervention risk changes ('What-If' Explorer)")
async def simulate_counterfactual_risk(req: CounterfactualRequest):
    """
    Computes delta risk changes when modifiable clinical factors
    (e.g., blood pressure, smoking, lipid panel) are adjusted.
    """
    # 1. Baseline prediction
    baseline_result = inference_service.run_inference(req.baseline_patient)

    # 2. Clone patient and apply modifications
    patient_dict = req.baseline_patient.model_dump()
    mods = req.modifications.model_dump(exclude_none=True)

    if "systolic_bp" in mods:
        patient_dict["history_vitals"]["systolic_bp"] = mods["systolic_bp"]
    if "current_smoker" in mods:
        patient_dict["history_vitals"]["current_smoker"] = mods["current_smoker"]
    if "cholesterol" in mods:
        patient_dict["laboratory"]["cholesterol"] = mods["cholesterol"]
    if "ldl" in mods:
        patient_dict["laboratory"]["ldl"] = mods["ldl"]
    if "hdl" in mods:
        patient_dict["laboratory"]["hdl"] = mods["hdl"]
    if "bmi" in mods:
        patient_dict["demographics"]["bmi"] = mods["bmi"]

    modified_patient = PatientInputSchema(**patient_dict)
    simulated_result = inference_service.run_inference(modified_patient)

    # Compute deltas
    base_cad = baseline_result["predictions"]["overall_cad"]["probability"]
    sim_cad = simulated_result["predictions"]["overall_cad"]["probability"]

    base_lad = baseline_result["predictions"]["vessels"]["LAD"]["probability"]
    sim_lad = simulated_result["predictions"]["vessels"]["LAD"]["probability"]

    base_lcx = baseline_result["predictions"]["vessels"]["LCX"]["probability"]
    sim_lcx = simulated_result["predictions"]["vessels"]["LCX"]["probability"]

    base_rca = baseline_result["predictions"]["vessels"]["RCA"]["probability"]
    sim_rca = simulated_result["predictions"]["vessels"]["RCA"]["probability"]

    return {
        "status": "success",
        "baseline_probabilities": {
            "CAD": base_cad,
            "LAD": base_lad,
            "LCX": base_lcx,
            "RCA": base_rca
        },
        "counterfactual_probabilities": {
            "CAD": sim_cad,
            "LAD": sim_lad,
            "LCX": sim_lcx,
            "RCA": sim_rca
        },
        "risk_deltas": {
            "CAD": round(sim_cad - base_cad, 4),
            "LAD": round(sim_lad - base_lad, 4),
            "LCX": round(sim_lcx - base_lcx, 4),
            "RCA": round(sim_rca - base_rca, 4)
        },
        "lifestyle_impact_summary": (
            f"Optimizing clinical parameters produced an estimated relative risk change of "
            f"{((sim_cad - base_cad) / base_cad * 100):.1f}% for overall CAD and "
            f"{((sim_lad - base_lad) / base_lad * 100):.1f}% in the LAD artery territory."
        ),
        "simulated_predictions": simulated_result["predictions"]
    }
