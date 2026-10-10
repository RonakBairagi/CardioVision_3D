from fastapi import APIRouter, Query, HTTPException
from app.schemas.patient import PatientInputSchema
from app.schemas.explanation import ShapResponseSchema
from app.services.explainability_service import explainability_service

router = APIRouter()

@router.post("/explain", response_model=ShapResponseSchema, summary="Compute TreeSHAP local feature attributions")
async def explain_vessel_prediction(
    patient: PatientInputSchema,
    target: str = Query("LAD", description="Target vessel territory: LAD, LCX, RCA, or CAD")
):
    """
    Computes exact local additive TreeSHAP feature attributions for a selected vessel.
    Returns baseline expected value, predicted value, and ordered top clinical drivers.
    """
    try:
        explanation = explainability_service.explain(patient, target=target)
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explainability failure: {str(e)}")
