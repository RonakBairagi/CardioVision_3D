"""
Target Leakage Quarantine Guard
Prevents ground-truth clinical targets (LAD, LCX, RCA, Cath, CAD) from entering the feature matrix.
"""
from typing import Dict, Any, List
from app.core.logging import logger

LEAKAGE_TARGETS: List[str] = [
    "LAD", "LCX", "RCA", "Cath", "CAD",
    "lad", "lcx", "rca", "cath", "cad",
    "target", "ground_truth", "stenosis_gt"
]

class TargetLeakageGuard:
    """
    Guarantees that ground truth target columns and catheterization labels
    can never enter the feature matrix during training, validation, or inference.
    """
    def __init__(self, target_to_predict: str = "CAD"):
        self.target_to_predict = target_to_predict
        self.forbidden_columns = set(c.lower() for c in LEAKAGE_TARGETS)

    def filter_features(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        purged = {}
        dropped = []
        for k, v in feature_dict.items():
            if k.lower() in self.forbidden_columns:
                dropped.append(k)
            else:
                purged[k] = v

        if dropped:
            logger.warning(f"TargetLeakageGuard: Quarantined & dropped target columns: {dropped}")
        return purged

    def verify_no_leakage(self, feature_keys: List[str]) -> bool:
        """
        Returns True if zero leakage targets exist in feature_keys; raises ValueError otherwise.
        """
        violations = [k for k in feature_keys if k.lower() in self.forbidden_columns]
        if violations:
            raise ValueError(
                f"FATAL TARGET LEAKAGE DETECTED! Forbidden labels present in feature space: {violations}"
            )
        return True
