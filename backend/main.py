import sys
import asyncio

# Silence benign WinError 10054 on Windows proactor event loop during client disconnection
if sys.platform == "win32":
    try:
        from asyncio.proactor_events import _ProactorBasePipeTransport
        _orig_call_connection_lost = _ProactorBasePipeTransport._call_connection_lost
        def _silent_call_connection_lost(self, exc=None):
            try:
                _orig_call_connection_lost(self, exc)
            except (ConnectionResetError, OSError):
                pass
        _ProactorBasePipeTransport._call_connection_lost = _silent_call_connection_lost
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.MODEL_VERSION,
    description=(
        "CardioVision 3D API: Multi-Vessel Coronary Artery Disease Risk Prediction & "
        "Explainable Anatomical Visualization Platform. Developed for Track A Hackathon 2026."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", summary="Root health & metadata gateway")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.MODEL_VERSION,
        "status": "operational",
        "documentation": "/docs",
        "endpoints": {
            "predict": f"{settings.API_V1_STR}/predict",
            "explain": f"{settings.API_V1_STR}/explain",
            "demo_archetypes": f"{settings.API_V1_STR}/patients/demo",
            "cv_metrics": f"{settings.API_V1_STR}/metrics/cv",
            "counterfactual": f"{settings.API_V1_STR}/counterfactual",
            "health": f"{settings.API_V1_STR}/health"
        },
        "safety_disclaimer": settings.DISCLAIMER_TEXT
    }

@app.on_event("startup")
async def startup_event():
    logger.info(f"*** Starting {settings.PROJECT_NAME} (Version: {settings.MODEL_VERSION}) ***")
    logger.info("Target Leakage Quarantine Guard: ACTIVE [LAD, LCX, RCA, Cath strictly purged]")
    logger.info("Multi-Target Models: CAD, LAD, LCX, RCA calibrated pipelines loaded.")
    logger.info("Clinical Decision Support Prototype Ready.")

if __name__ == "__main__":
    import os
    import uvicorn

    ssl_key = os.path.join(os.path.dirname(__file__), "ssl", "key.pem")
    ssl_cert = os.path.join(os.path.dirname(__file__), "ssl", "cert.pem")

    kwargs = {
        "app": "main:app",
        "host": "0.0.0.0",
        "port": 8000,
        "reload": True
    }

    if os.path.exists(ssl_key) and os.path.exists(ssl_cert):
        logger.info(f"Enabling HTTPS with certificates: {ssl_cert}, {ssl_key}")
        kwargs["ssl_keyfile"] = ssl_key
        kwargs["ssl_certfile"] = ssl_cert

    uvicorn.run(**kwargs)
