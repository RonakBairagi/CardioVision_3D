from fastapi import APIRouter
from app.api.v1.endpoints import predict, explain, demo, metrics, counterfactual, health

api_router = APIRouter()

api_router.include_router(predict.router, tags=["Inference"])
api_router.include_router(explain.router, tags=["Explainability"])
api_router.include_router(demo.router, tags=["Clinical Archetypes"])
api_router.include_router(metrics.router, tags=["Evaluation Benchmarks"])
api_router.include_router(counterfactual.router, tags=["Counterfactual Simulation"])
api_router.include_router(health.router, tags=["System Health"])
