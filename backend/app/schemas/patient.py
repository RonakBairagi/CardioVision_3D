from pydantic import BaseModel, Field
from typing import Optional, Literal

class Demographics(BaseModel):
    age: int = Field(..., ge=18, le=110, description="Age in years (18-110)")
    sex: Literal["Male", "Female"] = Field(..., description="Biological sex")
    bmi: float = Field(..., ge=12.0, le=65.0, description="Body Mass Index (kg/m^2)")

class HistoryVitals(BaseModel):
    systolic_bp: int = Field(..., ge=60, le=260, description="Systolic Blood Pressure (mmHg)")
    pulse_rate: int = Field(..., ge=35, le=220, description="Heart / Pulse Rate (bpm)")
    current_smoker: bool = Field(False, description="Patient actively smokes tobacco")
    hypertension: bool = Field(False, description="History of diagnosed hypertension")
    diabetes: bool = Field(False, description="History of diagnosed diabetes mellitus")
    family_history: bool = Field(False, description="Family history of coronary artery disease")
    typical_chest_pain: bool = Field(False, description="Exhibits classic substernal exertional anginal pain")
    dyspnea: bool = Field(False, description="Exhibits shortness of breath upon exertion or rest")
    atypical_cp: Optional[bool] = Field(False, description="Atypical chest discomfort")
    nonanginal_cp: Optional[bool] = Field(False, description="Non-cardiac chest discomfort")
    exertional_cp: Optional[bool] = Field(False, description="Chest discomfort clearly exacerbated by exertion")

class Laboratory(BaseModel):
    fbs: float = Field(..., ge=40.0, le=500.0, description="Fasting Blood Sugar (mg/dL)")
    cholesterol: float = Field(..., ge=70.0, le=600.0, description="Total Serum Cholesterol (mg/dL)")
    triglycerides: float = Field(..., ge=30.0, le=1000.0, description="Serum Triglycerides (mg/dL)")
    ldl: float = Field(..., ge=20.0, le=400.0, description="Low-Density Lipoprotein (mg/dL)")
    hdl: float = Field(..., ge=10.0, le=150.0, description="High-Density Lipoprotein (mg/dL)")
    bun: float = Field(..., ge=3.0, le=120.0, description="Blood Urea Nitrogen (mg/dL)")
    creatinine: float = Field(..., ge=0.3, le=15.0, description="Serum Creatinine (mg/dL)")
    esr: Optional[float] = Field(15.0, ge=1.0, le=150.0, description="Erythrocyte Sedimentation Rate (mm/hr)")

class EcgEcho(BaseModel):
    st_elevation: bool = Field(False, description="ST-segment elevation on resting 12-lead ECG")
    st_depression: bool = Field(False, description="ST-segment depression on resting 12-lead ECG")
    t_inversion: bool = Field(False, description="T-wave inversion on resting 12-lead ECG")
    lvh: bool = Field(False, description="Left Ventricular Hypertrophy evidence")
    poor_r_wave_progression: bool = Field(False, description="Poor R-Wave progression in precordial leads (PRWP)")
    ejection_fraction: float = Field(..., ge=10.0, le=85.0, description="Left Ventricular Ejection Fraction (%)")
    region_with_rwma: Literal["None", "Anterior", "Inferior", "Lateral", "Apical", "Septal"] = Field(
        "None", description="Echocardiographic regional wall motion abnormality territory"
    )
    vhd: Optional[Literal["None", "Mild", "Moderate", "Severe"]] = Field("None", description="Valvular heart disease severity")

class PatientInputSchema(BaseModel):
    demographics: Demographics
    history_vitals: HistoryVitals
    laboratory: Laboratory
    ecg_echo: EcgEcho
    notes: Optional[str] = Field(None, description="Optional clinical notes")

    # Safety: Target columns that must NEVER be allowed as inputs
    lad: Optional[int] = Field(None, description="Target column - forbidden in feature matrix")
    lcx: Optional[int] = Field(None, description="Target column - forbidden in feature matrix")
    rca: Optional[int] = Field(None, description="Target column - forbidden in feature matrix")
    cath: Optional[int] = Field(None, description="Target column - forbidden in feature matrix")
    cad: Optional[int] = Field(None, description="Target column - forbidden in feature matrix")
