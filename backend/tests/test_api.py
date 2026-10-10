"""
Backend API Integration Tests
"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["quarantine_guard"] == "ACTIVE"

def test_demo_archetypes():
    response = client.get("/api/v1/patients/demo")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["archetypes"]) == 3

def test_cv_metrics():
    response = client.get("/api/v1/metrics/cv")
    assert response.status_code == 200
    data = response.json()
    assert data["benchmark_cohort_size"] == 303
    assert data["quarantine_status"]["status"] == "VERIFIED_COMPLIANT"
    assert "overall_cad" in data["benchmarks"]

def test_predict_and_explain_api():
    demo_resp = client.get("/api/v1/patients/demo")
    archetype_b = demo_resp.json()["archetypes"][1]["payload"]

    # Test /predict
    pred_resp = client.post("/api/v1/predict", json=archetype_b)
    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    assert pred_data["status"] == "success"
    assert pred_data["quarantine_verified"] is True
    assert "overall_cad" in pred_data["predictions"]
    assert "LAD" in pred_data["predictions"]["vessels"]

    # Test /explain
    explain_resp = client.post("/api/v1/explain?target=LAD", json=archetype_b)
    assert explain_resp.status_code == 200
    explain_data = explain_resp.json()
    assert explain_data["target"] == "LAD"
    assert len(explain_data["top_attributions"]) > 0
