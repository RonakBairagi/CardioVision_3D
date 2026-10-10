"""
ML Inference, Probability Calibration & Uncertainty Tests
"""
from app.schemas.patient import PatientInputSchema, Demographics, HistoryVitals, Laboratory, EcgEcho
from app.services.inference_service import inference_service
from app.ml.calibrator import wilson_score_interval

def get_test_patient_archetype_b() -> PatientInputSchema:
    return PatientInputSchema(
        demographics=Demographics(age=64, sex="Male", bmi=28.6),
        history_vitals=HistoryVitals(
            systolic_bp=155, pulse_rate=82, current_smoker=True, hypertension=True,
            diabetes=False, family_history=True, typical_chest_pain=True, dyspnea=False
        ),
        laboratory=Laboratory(
            fbs=138.0, cholesterol=248.0, triglycerides=210.0, ldl=162.0, hdl=37.0, bun=19.0, creatinine=1.15
        ),
        ecg_echo=EcgEcho(
            st_elevation=True, st_depression=False, t_inversion=True, lvh=True,
            poor_r_wave_progression=True, ejection_fraction=38.0, region_with_rwma="Anterior"
        )
    )

def test_inference_probability_bounds():
    patient = get_test_patient_archetype_b()
    result = inference_service.run_inference(patient)

    assert result["status"] == "success"
    assert result["quarantine_verified"] is True
    
    # Check overall CAD probability
    cad_prob = result["predictions"]["overall_cad"]["probability"]
    assert 0.0 <= cad_prob <= 1.0
    cad_ci = result["predictions"]["overall_cad"]["confidence_interval_95"]
    assert len(cad_ci) == 2
    assert cad_ci[0] <= cad_prob <= cad_ci[1]

    # Check all three vessel probabilities
    for v_key in ["LAD", "LCX", "RCA"]:
        v_data = result["predictions"]["vessels"][v_key]
        p = v_data["probability"]
        assert 0.0 <= p <= 1.0
        ci = v_data["confidence_interval_95"]
        assert len(ci) == 2
        assert ci[0] <= p <= ci[1]

def test_archetype_b_anterior_ischemia_behavior():
    """
    In Archetype B (Anterior RWMA + Precordial ST Elevation + Low EF 38%),
    LAD probability must be elevated (>0.75) and higher than LCX and RCA.
    """
    patient = get_test_patient_archetype_b()
    result = inference_service.run_inference(patient)
    vessels = result["predictions"]["vessels"]

    assert vessels["LAD"]["probability"] >= 0.75
    assert vessels["LAD"]["probability"] > vessels["LCX"]["probability"]
    assert vessels["LAD"]["risk_classification"] == "High Risk"

def test_wilson_confidence_interval_math():
    ci = wilson_score_interval(0.5, n=100)
    assert 0.40 <= ci[0] <= 0.45
    assert 0.55 <= ci[1] <= 0.60
    assert ci[0] < ci[1]
