from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter()

DEMO_ARCHETYPES: List[Dict[str, Any]] = [
    {
        "id": "archetype_a",
        "title": "Archetype A: Healthy Normotensive",
        "badge": "Low Risk Profile",
        "badge_color": "emerald",
        "summary": "46 y/o Female, non-smoker, normotensive (BP 118/75), normal resting ECG, preserved EF 62%, no regional wall motion abnormalities.",
        "expected_visual": "Entire coronary tree glows cool teal/cyan. Normal baseline contractility.",
        "expected_risk": {"CAD": "12%", "LAD": "9% (Teal)", "LCX": "8% (Teal)", "RCA": "7% (Teal)"},
        "payload": {
            "demographics": {
                "age": 46,
                "sex": "Female",
                "bmi": 22.4
            },
            "history_vitals": {
                "systolic_bp": 118,
                "pulse_rate": 68,
                "current_smoker": False,
                "hypertension": False,
                "diabetes": False,
                "family_history": False,
                "typical_chest_pain": False,
                "dyspnea": False,
                "atypical_cp": False,
                "nonanginal_cp": False,
                "exertional_cp": False
            },
            "laboratory": {
                "fbs": 88.0,
                "cholesterol": 175.0,
                "triglycerides": 110.0,
                "ldl": 98.0,
                "hdl": 55.0,
                "bun": 14.0,
                "creatinine": 0.85,
                "esr": 8.0
            },
            "ecg_echo": {
                "st_elevation": False,
                "st_depression": False,
                "t_inversion": False,
                "lvh": False,
                "poor_r_wave_progression": False,
                "ejection_fraction": 62.0,
                "region_with_rwma": "None",
                "vhd": "None"
            }
        }
    },
    {
        "id": "archetype_b",
        "title": "Archetype B: Focal Anterior Ischemia (LAD Dominant)",
        "badge": "Anterior LAD Ischemia",
        "badge_color": "rose",
        "summary": "64 y/o Male, active smoker, hypertensive (BP 155/92), typical anginal pain, ST elevation in precordial leads V1-V3, reduced EF 38%, echocardiographic Anterior RWMA.",
        "expected_visual": "LAD glows vivid crimson (86%), LCX stays cool teal (18%), RCA displays amber (42%). Anterior wall focus.",
        "expected_risk": {"CAD": "84%", "LAD": "86% (Crimson)", "LCX": "18% (Teal)", "RCA": "42% (Amber)"},
        "payload": {
            "demographics": {
                "age": 64,
                "sex": "Male",
                "bmi": 28.6
            },
            "history_vitals": {
                "systolic_bp": 155,
                "pulse_rate": 82,
                "current_smoker": True,
                "hypertension": True,
                "diabetes": False,
                "family_history": True,
                "typical_chest_pain": True,
                "dyspnea": False,
                "atypical_cp": False,
                "nonanginal_cp": False,
                "exertional_cp": True
            },
            "laboratory": {
                "fbs": 138.0,
                "cholesterol": 248.0,
                "triglycerides": 210.0,
                "ldl": 162.0,
                "hdl": 37.0,
                "bun": 19.0,
                "creatinine": 1.15,
                "esr": 24.0
            },
            "ecg_echo": {
                "st_elevation": True,
                "st_depression": False,
                "t_inversion": True,
                "lvh": True,
                "poor_r_wave_progression": True,
                "ejection_fraction": 38.0,
                "region_with_rwma": "Anterior",
                "vhd": "None"
            }
        }
    },
    {
        "id": "archetype_c",
        "title": "Archetype C: Diffuse Multi-Vessel CAD",
        "badge": "Multi-Vessel High Risk",
        "badge_color": "amber",
        "summary": "71 y/o Male, diabetic, smoker, severe hypertension (BP 168/98), exertional dyspnea, diffuse ECG abnormalities, low EF 32%, Inferior RWMA.",
        "expected_visual": "Multi-vessel alarm! Both LAD (88%) and RCA (81%) glow crimson; LCX shows amber (62%).",
        "expected_risk": {"CAD": "94%", "LAD": "88% (Crimson)", "LCX": "62% (Amber)", "RCA": "81% (Crimson)"},
        "payload": {
            "demographics": {
                "age": 71,
                "sex": "Male",
                "bmi": 31.2
            },
            "history_vitals": {
                "systolic_bp": 168,
                "pulse_rate": 90,
                "current_smoker": True,
                "hypertension": True,
                "diabetes": True,
                "family_history": True,
                "typical_chest_pain": True,
                "dyspnea": True,
                "atypical_cp": False,
                "nonanginal_cp": False,
                "exertional_cp": True
            },
            "laboratory": {
                "fbs": 182.0,
                "cholesterol": 284.0,
                "triglycerides": 290.0,
                "ldl": 188.0,
                "hdl": 32.0,
                "bun": 26.0,
                "creatinine": 1.45,
                "esr": 36.0
            },
            "ecg_echo": {
                "st_elevation": True,
                "st_depression": True,
                "t_inversion": True,
                "lvh": True,
                "poor_r_wave_progression": True,
                "ejection_fraction": 32.0,
                "region_with_rwma": "Inferior",
                "vhd": "Moderate"
            }
        }
    }
]

@router.get("/patients/demo", summary="Retrieve preloaded synthetic clinical archetypes for rapid evaluation")
async def get_demo_archetypes():
    """
    Supplies 3 preloaded synthetic clinical profiles enabling judges to validate
    the end-to-end multi-vessel prediction and 3D visual transitions in under 60 seconds.
    """
    return {
        "status": "success",
        "count": len(DEMO_ARCHETYPES),
        "archetypes": DEMO_ARCHETYPES
    }
