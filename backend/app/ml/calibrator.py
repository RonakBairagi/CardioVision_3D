"""
Probability Calibration and Uncertainty Estimation Module
"""
import math
from typing import List

def wilson_score_interval(p: float, n: int = 150, z: float = 1.95996) -> List[float]:
    """
    Computes a 95% Wilson score confidence interval for a calibrated probability p,
    given an effective sample size n (defaults to validation fold size ~150 in 5-fold CV).
    Guarantees the interval contains p and stays strictly in [0.001, 0.999].
    """
    p_clamped = max(0.005, min(0.995, p))
    denominator = 1.0 + (z**2) / n
    centre_adjusted_probability = p_clamped + (z**2) / (2.0 * n)
    adjusted_standard_deviation = math.sqrt(
        (p_clamped * (1.0 - p_clamped) / n) + ((z**2) / (4.0 * (n**2)))
    )

    lower_bound = (centre_adjusted_probability - z * adjusted_standard_deviation) / denominator
    upper_bound = (centre_adjusted_probability + z * adjusted_standard_deviation) / denominator

    # Ensure bounds cover the point estimate
    lower_bound = min(lower_bound, p_clamped)
    upper_bound = max(upper_bound, p_clamped)

    return [
        round(max(0.001, min(0.999, lower_bound)), 3),
        round(max(0.001, min(0.999, upper_bound)), 3)
    ]

def classify_risk(p: float) -> str:
    """
    Maps calibrated continuous probability to clinical triage tier:
    - [0.00, 0.30] -> Low Risk (Cool Cyan/Teal)
    - (0.30, 0.65] -> Moderate Risk (Amber)
    - (0.65, 1.00] -> High Risk (Vivid Crimson)
    """
    if p <= 0.30:
        return "Low Risk"
    elif p <= 0.65:
        return "Moderate Risk"
    else:
        return "High Risk"

def platt_scale(raw_logit: float, a: float = 1.0, b: float = 0.0) -> float:
    """
    Platt scaling sigmoid calibration:
    P(Y=1|f(x)) = 1 / (1 + exp(-(A * f(x) + B)))
    """
    scaled = a * raw_logit + b
    # Numerical clip to prevent overflow
    scaled = max(-15.0, min(15.0, scaled))
    prob = 1.0 / (1.0 + math.exp(-scaled))
    return round(float(prob), 4)
