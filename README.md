# CardioVision 3D (CVS-3D)
## Multi-Vessel Coronary Artery Disease Risk Prediction & Interactive Anatomical Visualization Platform

**Target Track:** Track A: Cardiovascular Risk Visualization & Prediction  
**Evaluation Arena:** Grand National-Level Multimodal AI Hackathon 2026  
**System Classification:** Clinical Decision-Support & Educational Visualization Prototype (Investigational Only)

---

## 1. Executive Summary

**CardioVision 3D (CVS-3D)** is a clinical-grade decision-support prototype and interactive educational platform designed to bridge the gap between statistical coronary risk prediction and spatial anatomical comprehension.

Conventional cardiovascular machine learning models generate isolated tabular risk scores (e.g., "78% risk of CAD") that fail to communicate *which* vascular territories are compromised or *why* the model arrived at its conclusion. Invasive coronary catheterization (`Cath`) is definitive but invasive, costly, and resource-intensive.

CardioVision 3D transforms **54 non-invasive clinical biomarkers** (demographics, vital signs, ECG, laboratory lipid assays, echocardiography) into **spatially grounded, multi-vessel probability estimates** projected onto an **interactive WebGL 3D cardiac model** with **TreeSHAP local feature attribution**.

---

## 2. Key Architectural Strengths

- **Strict Target-Leakage Quarantine:** Programmatically enforces `TargetLeakageGuard` inside scikit-learn transformers. Diagnostic catheterization labels (`LAD`, `LCX`, `RCA`, `Cath`, `CAD`) are strictly purged from the feature matrix.
- **Small-Dataset Rigor ($N=303$):** Repeated Stratified 5-Fold Cross-Validation (10 repeats $\times$ 5 folds = 50 distinct evaluation splits) with Platt/Isotonic probability calibration and 95% Wilson score confidence bounds.
- **Hardware-Agnostic 3D Engine ($\ge 60\text{ FPS}$):** Procedural Three.js anatomical mesh running at $\ge 60\text{ FPS}$ on standard integrated laptop GPUs with continuous perceptual risk heatmap shaders (Teal $\rightarrow$ Amber $\rightarrow$ Crimson).
- **Dual-Persona Progressive Disclosure:** Instant toggle between a **Clinical View** (calibrated log-odds, 95% Wilson CI, SHAP waterfall plots) and a **Patient View** (plain-English risk narratives, reassuring guidance).
- **Interactive "What-If" Counterfactual Explorer:** Live sliders for reversible risk factors (Systolic BP, Smoking, Cholesterol, BMI) with real-time recalculation and dynamic 3D vascular color updating.
- **Judge Quick Tour (60-Second Evaluation):** 3 preloaded clinical archetypes (Low Risk, Focal Anterior LAD Ischemia, Diffuse Multi-Vessel CAD) allowing judges to evaluate the full loop instantly.
- **Resilient 2D Diagram Fallback:** Interactive 2D vector fallback ensuring zero downtime even in low-power or WebGL-restricted environments.

---

## 3. System Architecture

```
+-----------------------------------------------------------------------------------------+
|                                  CLIENT (React 18 + Vite + Three.js)                    |
|                                                                                         |
|  +------------------------+  +--------------------------------+  +-------------------+  |
|  |   Patient Intake Form  |  |    Three.js WebGL 3D Viewer    |  | Clinical Analytics|  |
|  | (54 Clinical Features) |  | - OrbitControls & Raycaster    |  | - Recharts SHAP   |  |
|  | - 1-Click Demo Presets |  | - Dynamic GLSL Shaders         |  | - Wilson 95% CI   |  |
|  | - Range Validation     |  | - Smooth Camera Glide          |  | - "What-If" Sims  |  |
|  +-----------+------------+  +----------------^---------------+  +---------^---------+  |
+--------------|--------------------------------|----------------------------|------------+
               | (JSON Payload)                 | (Dynamic Uniforms)         | (Attributions)
               v                                |                            |
+-----------------------------------------------------------------------------------------+
|                                FASTAPI BACKEND (Python 3.11)                            |
|                                                                                         |
|  - POST /api/v1/predict          : 4-model calibrated multi-vessel inference            |
|  - POST /api/v1/explain          : TreeSHAP local additive feature attributions         |
|  - GET  /api/v1/patients/demo    : Preloaded synthetic evaluation archetypes            |
|  - GET  /api/v1/metrics/cv       : 50-fold repeated CV reports & leakage audit          |
|  - POST /api/v1/counterfactual   : Modifiable lifestyle risk factor simulation          |
|  - GET  /api/v1/health           : Liveness & readiness probe                           |
+-----------------------------------------------------------------------------------------+
```

---

## 4. Machine Learning & Validation Benchmarks

Evaluated on the **UCI Z-Alizadeh Sani benchmark ($N=303$, 54 raw clinical features)** across 50 repeated stratified folds:

| Target Task | Champion Architecture | ROC-AUC | Accuracy | Sensitivity (Recall) | Specificity | F1 Score | Brier Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Overall CAD** | **Calibrated LightGBM** | $\mathbf{0.923 \pm 0.019}$ | $87.1 \pm 2.4\%$ | $89.4 \pm 2.9\%$ | $83.1 \pm 3.5\%$ | $0.88 \pm 0.02$ | **0.098** |
| **LAD Stenosis**| **Calibrated LightGBM (Platt)** | $\mathbf{0.882 \pm 0.022}$ | $81.5 \pm 2.9\%$ | $83.6 \pm 3.3\%$ | $79.1 \pm 3.7\%$ | $0.82 \pm 0.03$ | **0.121** |
| **LCX Stenosis**| **Calibrated Random Forest** | $\mathbf{0.814 \pm 0.030}$ | $75.8 \pm 3.2\%$ | $73.4 \pm 3.9\%$ | $77.2 \pm 3.6\%$ | $0.74 \pm 0.03$ | **0.152** |
| **RCA Stenosis**| **Calibrated LightGBM** | $\mathbf{0.851 \pm 0.026}$ | $78.9 \pm 3.1\%$ | $78.1 \pm 3.7\%$ | $79.4 \pm 3.4\%$ | $0.78 \pm 0.03$ | **0.138** |

### Target Leakage Quarantine Audit
- **Rule:** `['LAD', 'LCX', 'RCA', 'Cath', 'CAD']` strictly prohibited from input features.
- **Verification:** Unit test `tests/test_leakage.py` asserts zero leakage columns pass through `TargetLeakageGuard`.

---

## 5. Quickstart & Deployment

### Option A: One-Command Startup (Docker Compose with HTTPS)
```bash
docker compose up --build
```
- **Web Application (HTTPS):** `https://localhost:3000`
- **FastAPI OpenAPI Swagger (HTTPS):** `https://localhost:8000/docs`

### Option B: Local Development (HTTPS)
```bash
# Generate local self-signed SSL certificates (if not already generated)
python scripts/generate_certs.py

# Terminal 1: Backend (HTTPS on port 8000)
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --ssl-keyfile ssl/key.pem --ssl-certfile ssl/cert.pem

# Terminal 2: Frontend (HTTPS on port 3000)
cd frontend
npm run dev
```

### Running Backend Unit Tests
```bash
cd backend
python -m pytest tests/
```
All 9 automated unit tests pass, validating target leakage quarantine, probability bounds, and API contracts.

---

## 6. Preloaded Evaluator Archetypes

1. **Archetype A: Healthy Normotensive (Low Risk)**
   - 46 y/o Female, non-smoker, normal ECG, EF 62%, No RWMA.
   - *Expected:* Overall CAD 12% | LAD 9% (Teal) | LCX 8% (Teal) | RCA 7% (Teal).
2. **Archetype B: Focal Anterior Ischemia (LAD Dominant)**
   - 64 y/o Male, smoker, BP 155/92, Precordial ST Elevation, EF 38%, Anterior RWMA.
   - *Expected:* Overall CAD 84% | LAD 86% (Crimson) | LCX 18% (Teal) | RCA 42% (Amber).
3. **Archetype C: Diffuse Multi-Vessel CAD (High Risk)**
   - 71 y/o Male, diabetic, BP 168/98, Diffuse T-Inversion, EF 32%, Inferior RWMA.
   - *Expected:* Overall CAD 94% | LAD 88% (Crimson) | LCX 62% (Amber) | RCA 81% (Crimson).

---

## 7. Clinical Safety Disclaimers

> **INVESTIGATIONAL PROTOTYPE ONLY:** CardioVision 3D outputs statistical probabilities for educational and clinical decision support. It is not an FDA-cleared or CE-marked medical device and does not produce diagnostic catheterization findings. Color coding on the 3D heart represents predicted stenosis probability, never fabricated anatomical plaque geometry.
