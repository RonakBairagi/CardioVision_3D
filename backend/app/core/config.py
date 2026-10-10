from typing import List

class Settings:
    PROJECT_NAME: str = "CardioVision 3D (CVS-3D)"
    API_V1_STR: str = "/api/v1"
    MODEL_VERSION: str = "v1.2.0-calibrated"
    CORS_ORIGINS: List[str] = ["*"]
    BENCHMARK_DATASET: str = "UCI Z-Alizadeh Sani (303 records, 54 raw features)"
    DISCLAIMER_TEXT: str = (
        "INVESTIGATIONAL PROTOTYPE ONLY: Model-estimated statistical probabilities for educational "
        "and clinical decision support. Not a CE-Marked / FDA-Cleared medical device. Not a diagnostic catheterization result."
    )

settings = Settings()
