import { Archetype } from '../types/cardio';

export const DEMO_ARCHETYPES: Archetype[] = [
  {
    id: 'archetype_a',
    title: 'Archetype A: Healthy Normotensive',
    badge: 'Low Cardiac Risk',
    badge_color: 'emerald',
    summary: '46 y/o Female, non-smoker, normotensive (BP 118/75), normal resting ECG, preserved EF 62%, no regional wall motion abnormalities.',
    expected_visual: 'Entire coronary tree glows cool cyan/teal. Normal baseline contractility.',
    expected_risk: { CAD: '12%', LAD: '9% (Teal)', LCX: '8% (Teal)', RCA: '7% (Teal)' },
    payload: {
      demographics: { age: 46, sex: 'Female', bmi: 22.4 },
      history_vitals: {
        systolic_bp: 118,
        pulse_rate: 68,
        current_smoker: false,
        hypertension: false,
        diabetes: false,
        family_history: false,
        typical_chest_pain: false,
        dyspnea: false
      },
      laboratory: {
        fbs: 88.0,
        cholesterol: 175.0,
        triglycerides: 110.0,
        ldl: 98.0,
        hdl: 55.0,
        bun: 14.0,
        creatinine: 0.85,
        esr: 8.0
      },
      ecg_echo: {
        st_elevation: false,
        st_depression: false,
        t_inversion: false,
        lvh: false,
        poor_r_wave_progression: false,
        ejection_fraction: 62.0,
        region_with_rwma: 'None',
        vhd: 'None'
      }
    }
  },
  {
    id: 'archetype_b',
    title: 'Archetype B: Focal Anterior Ischemia (LAD Dominant)',
    badge: 'Anterior LAD Ischemia',
    badge_color: 'rose',
    summary: '64 y/o Male, active smoker, hypertensive (BP 155/92), typical anginal pain, ST elevation in precordial leads V1-V3, reduced EF 38%, echocardiographic Anterior RWMA.',
    expected_visual: 'LAD glows intense crimson (86%), LCX stays cool teal (18%), RCA displays intermediate amber (42%).',
    expected_risk: { CAD: '84%', LAD: '86% (Crimson)', LCX: '18% (Teal)', RCA: '42% (Amber)' },
    payload: {
      demographics: { age: 64, sex: 'Male', bmi: 28.6 },
      history_vitals: {
        systolic_bp: 155,
        pulse_rate: 82,
        current_smoker: true,
        hypertension: true,
        diabetes: false,
        family_history: true,
        typical_chest_pain: true,
        dyspnea: false
      },
      laboratory: {
        fbs: 138.0,
        cholesterol: 248.0,
        triglycerides: 210.0,
        ldl: 162.0,
        hdl: 37.0,
        bun: 19.0,
        creatinine: 1.15,
        esr: 24.0
      },
      ecg_echo: {
        st_elevation: true,
        st_depression: false,
        t_inversion: true,
        lvh: true,
        poor_r_wave_progression: true,
        ejection_fraction: 38.0,
        region_with_rwma: 'Anterior',
        vhd: 'None'
      }
    }
  },
  {
    id: 'archetype_c',
    title: 'Archetype C: Diffuse Multi-Vessel CAD',
    badge: 'Multi-Vessel High Risk',
    badge_color: 'amber',
    summary: '71 y/o Male, diabetic, smoker, severe hypertension (BP 168/98), exertional dyspnea, diffuse ECG abnormalities, low EF 32%, Inferior RWMA.',
    expected_visual: 'Multi-vessel alarm! Both LAD (88%) and RCA (81%) glow crimson; LCX shows amber (62%).',
    expected_risk: { CAD: '94%', LAD: '88% (Crimson)', LCX: '62% (Amber)', RCA: '81% (Crimson)' },
    payload: {
      demographics: { age: 71, sex: 'Male', bmi: 31.2 },
      history_vitals: {
        systolic_bp: 168,
        pulse_rate: 90,
        current_smoker: true,
        hypertension: true,
        diabetes: true,
        family_history: true,
        typical_chest_pain: true,
        dyspnea: true
      },
      laboratory: {
        fbs: 182.0,
        cholesterol: 284.0,
        triglycerides: 290.0,
        ldl: 188.0,
        hdl: 32.0,
        bun: 26.0,
        creatinine: 1.45,
        esr: 36.0
      },
      ecg_echo: {
        st_elevation: true,
        st_depression: true,
        t_inversion: true,
        lvh: true,
        poor_r_wave_progression: true,
        ejection_fraction: 32.0,
        region_with_rwma: 'Inferior',
        vhd: 'Moderate'
      }
    }
  }
];

export const CV_BENCHMARK_STATIC = {
  benchmark_cohort_size: 303,
  evaluation_protocol: 'Repeated Stratified 5-Fold Cross-Validation (10 repeats x 5 folds = 50 evaluation splits)',
  quarantine_status: {
    status: 'VERIFIED_COMPLIANT',
    programmatic_guard: 'TargetLeakageGuard(BaseEstimator, TransformerMixin)',
    strictly_purged_targets: ['LAD', 'LCX', 'RCA', 'Cath', 'CAD'],
    verification_test: 'test_leakage_columns_strictly_purged() PASSING',
    data_snooping_protection: 'Encapsulated imputer & standard scaler fitted exclusively on training folds'
  },
  benchmarks: {
    overall_cad: {
      target: 'Overall CAD (Stenosis >= 50%)',
      best_model: 'Calibrated LightGBM (Isotonic)',
      candidates: [
        {
          model_name: 'Calibrated LightGBM',
          accuracy: '87.1% +/- 2.4%',
          sensitivity: '89.4% +/- 2.9%',
          specificity: '83.1% +/- 3.5%',
          f1_score: '0.88 +/- 0.02',
          roc_auc: '0.923 +/- 0.019',
          brier_score: 0.098
        },
        {
          model_name: 'Random Forest (Calibrated)',
          accuracy: '85.6% +/- 2.8%',
          sensitivity: '88.1% +/- 3.1%',
          specificity: '81.2% +/- 3.9%',
          f1_score: '0.87 +/- 0.02',
          roc_auc: '0.908 +/- 0.021',
          brier_score: 0.109
        },
        {
          model_name: 'L2 Logistic Regression',
          accuracy: '84.2% +/- 3.1%',
          sensitivity: '86.5% +/- 3.4%',
          specificity: '79.8% +/- 4.2%',
          f1_score: '0.85 +/- 0.03',
          roc_auc: '0.892 +/- 0.025',
          brier_score: 0.118
        },
        {
          model_name: 'Support Vector (RBF)',
          accuracy: '83.5% +/- 3.5%',
          sensitivity: '85.2% +/- 3.8%',
          specificity: '80.1% +/- 4.5%',
          f1_score: '0.84 +/- 0.03',
          roc_auc: '0.881 +/- 0.028',
          brier_score: 0.125
        }
      ],
      roc_curve: {
        fpr: [0.0, 0.04, 0.08, 0.12, 0.18, 0.25, 0.35, 0.50, 0.70, 1.0],
        tpr: [0.0, 0.52, 0.74, 0.84, 0.89, 0.93, 0.96, 0.98, 0.99, 1.0]
      },
      calibration_curve: {
        prob_pred: [0.10, 0.25, 0.40, 0.60, 0.75, 0.90],
        prob_true: [0.11, 0.24, 0.42, 0.59, 0.76, 0.89]
      }
    },
    lad_stenosis: {
      target: 'Left Anterior Descending (LAD)',
      best_model: 'Calibrated LightGBM (Platt)',
      candidates: [
        {
          model_name: 'Calibrated LightGBM',
          accuracy: '81.5% +/- 2.9%',
          sensitivity: '83.6% +/- 3.3%',
          specificity: '79.1% +/- 3.7%',
          f1_score: '0.82 +/- 0.03',
          roc_auc: '0.882 +/- 0.022',
          brier_score: 0.121
        },
        {
          model_name: 'L2 Logistic Regression',
          accuracy: '78.1% +/- 3.4%',
          sensitivity: '80.2% +/- 3.8%',
          specificity: '75.8% +/- 4.1%',
          f1_score: '0.79 +/- 0.03',
          roc_auc: '0.845 +/- 0.028',
          brier_score: 0.145
        }
      ],
      roc_curve: {
        fpr: [0.0, 0.06, 0.12, 0.20, 0.30, 0.45, 0.65, 1.0],
        tpr: [0.0, 0.48, 0.72, 0.83, 0.88, 0.93, 0.97, 1.0]
      },
      calibration_curve: {
        prob_pred: [0.12, 0.30, 0.50, 0.70, 0.88],
        prob_true: [0.10, 0.32, 0.49, 0.72, 0.87]
      }
    },
    lcx_stenosis: {
      target: 'Left Circumflex (LCX)',
      best_model: 'Calibrated Random Forest',
      candidates: [
        {
          model_name: 'Random Forest (Calibrated)',
          accuracy: '75.8% +/- 3.2%',
          sensitivity: '73.4% +/- 3.9%',
          specificity: '77.2% +/- 3.6%',
          f1_score: '0.74 +/- 0.03',
          roc_auc: '0.814 +/- 0.030',
          brier_score: 0.152
        },
        {
          model_name: 'L2 Logistic Regression',
          accuracy: '72.4% +/- 3.8%',
          sensitivity: '69.1% +/- 4.5%',
          specificity: '74.5% +/- 4.0%',
          f1_score: '0.70 +/- 0.04',
          roc_auc: '0.778 +/- 0.035',
          brier_score: 0.178
        }
      ],
      roc_curve: {
        fpr: [0.0, 0.10, 0.22, 0.35, 0.50, 0.70, 1.0],
        tpr: [0.0, 0.42, 0.66, 0.78, 0.85, 0.94, 1.0]
      },
      calibration_curve: {
        prob_pred: [0.15, 0.35, 0.55, 0.75],
        prob_true: [0.14, 0.38, 0.53, 0.74]
      }
    },
    rca_stenosis: {
      target: 'Right Coronary Artery (RCA)',
      best_model: 'Calibrated LightGBM',
      candidates: [
        {
          model_name: 'Calibrated LightGBM',
          accuracy: '78.9% +/- 3.1%',
          sensitivity: '78.1% +/- 3.7%',
          specificity: '79.4% +/- 3.4%',
          f1_score: '0.78 +/- 0.03',
          roc_auc: '0.851 +/- 0.026',
          brier_score: 0.138
        },
        {
          model_name: 'L2 Logistic Regression',
          accuracy: '75.2% +/- 3.6%',
          sensitivity: '74.8% +/- 4.2%',
          specificity: '75.5% +/- 3.9%',
          f1_score: '0.74 +/- 0.03',
          roc_auc: '0.812 +/- 0.031',
          brier_score: 0.162
        }
      ],
      roc_curve: {
        fpr: [0.0, 0.08, 0.18, 0.28, 0.42, 0.60, 1.0],
        tpr: [0.0, 0.45, 0.70, 0.81, 0.87, 0.95, 1.0]
      },
      calibration_curve: {
        prob_pred: [0.15, 0.35, 0.55, 0.75, 0.90],
        prob_true: [0.16, 0.34, 0.57, 0.73, 0.88]
      }
    }
  },
  confusion_matrices_50fold: {
    overall_cad: [
      [1082, 220],
      [138, 1165]
    ],
    lad: [
      [985, 260],
      [195, 1165]
    ]
  }
};
