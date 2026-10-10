from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health", summary="Service liveness and readiness probe")
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.MODEL_VERSION,
        "quarantine_guard": "ACTIVE",
        "models_loaded": ["overall_cad", "lad_stenosis", "lcx_stenosis", "rca_stenosis"],
        "explainability_engine": "TreeSHAP"
    }
