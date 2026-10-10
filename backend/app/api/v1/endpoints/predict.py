from fastapi import APIRouter, HTTPException
from app.schemas.patient import PatientInputSchema
from app.schemas.prediction import PredictionResponseSchema
from app.services.inference_service import inference_service

router = APIRouter()

@router.post("/predict", response_model=PredictionResponseSchema, summary="Execute multi-vessel CAD inference")
async def predict_cardiovascular_risk(patient: PatientInputSchema):
    """
    Receives 54 non-invasive clinical biomarkers and computes:
    1. Overall CAD probability (stenosis >= 50% in >=1 vessel)
    2. LAD stenosis probability & 95% Wilson confidence interval
    3. LCX stenosis probability & 95% Wilson confidence interval
    4. RCA stenosis probability & 95% Wilson confidence interval
    Strict target leakage quarantine is programmatically guaranteed.
    """
    try:
        result = inference_service.run_inference(patient)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failure: {str(e)}")
