from pydantic import BaseModel, Field
from typing import Dict, List, Any

class ModelMetricItem(BaseModel):
    model_name: str
    accuracy: str
    sensitivity: str
    specificity: str
    f1_score: str
    roc_auc: str
    brier_score: float

class TargetBenchmark(BaseModel):
    target: str
    best_model: str
    candidates: List[ModelMetricItem]
    roc_curve: Dict[str, List[float]]  # {"fpr": [...], "tpr": [...]}
    calibration_curve: Dict[str, List[float]]  # {"prob_pred": [...], "prob_true": [...]}

class CvReportResponse(BaseModel):
    benchmark_cohort_size: int = 303
    evaluation_protocol: str = "Repeated Stratified 5-Fold Cross-Validation (10 repeats, 50 distinct folds)"
    quarantine_status: Dict[str, Any]
    benchmarks: Dict[str, TargetBenchmark]
    confusion_matrices_50fold: Dict[str, List[List[int]]]
