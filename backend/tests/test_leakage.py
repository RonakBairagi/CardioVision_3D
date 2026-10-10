"""
Target Leakage Quarantine Unit Tests
Mandatory safety verification for Track A Hackathon.
Asserts that LAD, LCX, RCA, Cath, and CAD are never permitted into feature processing.
"""
import pytest
from app.ml.leakage_guard import TargetLeakageGuard

def test_leakage_columns_strictly_purged():
    """
    FR-04 / SAF Requirement:
    Asserts that if a raw dataframe/dictionary contains ground truth targets
    (LAD, LCX, RCA, Cath, CAD), they are unconditionally purged.
    """
    raw_input = {
        "age": 55,
        "systolic_bp": 140,
        "LAD": 1,
        "LCX": 0,
        "RCA": 1,
        "Cath": "CAD",
        "CAD": 1,
        "lad": 1,
        "ejection_fraction": 45.0
    }
    guard = TargetLeakageGuard(target_to_predict="CAD")
    cleaned = guard.filter_features(raw_input)

    forbidden = ["LAD", "LCX", "RCA", "Cath", "CAD", "lad", "lcx", "rca", "cath", "cad"]
    for col in forbidden:
        assert col not in cleaned, f"Target leakage violation! Column '{col}' leaked into feature dictionary."

    assert "age" in cleaned
    assert "systolic_bp" in cleaned
    assert "ejection_fraction" in cleaned

def test_leakage_verification_raises_on_contamination():
    guard = TargetLeakageGuard()
    with pytest.raises(ValueError) as excinfo:
        guard.verify_no_leakage(["age", "bmi", "LAD", "systolic_bp"])
    assert "FATAL TARGET LEAKAGE DETECTED" in str(excinfo.value)
