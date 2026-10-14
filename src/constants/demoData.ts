import { Archetype } from '../types/cardio';

export const DEMO_ARCHETYPES: Archetype[] = [
  {
    id: 'archetype-a',
    title: 'Archetype A: Healthy Normotensive (Low Cardiac Risk)',
    badge: 'Low Risk',
    badge_color: 'emerald',
    summary: '46 y/o Female, Non-smoker, BP 118/75, Total Cholesterol 175 mg/dL, Normal ECG, EF 62%, No RWMA.',
    expected_visual: 'Entire coronary tree glows cool cyan; heart displays normal baseline contractility.',
    expected_risk: {
      'Overall CAD': '12%',
      LAD: '9% (Low)',
      LCX: '8% (Low)',
      RCA: '7% (Low)'
    },
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
        dyspnea: false,
        atypical_cp: false,
        nonanginal_cp: false,
        exertional_cp: false
      },
      laboratory: {
        fbs: 88,
        cholesterol: 175,
        triglycerides: 110,
        ldl: 95,
        hdl: 58,
        bun: 14,
        creatinine: 0.8,
        esr: 8
      },
      ecg_echo: {
        st_elevation: false,
        st_depression: false,
        t_inversion: false,
        lvh: false,
        poor_r_wave_progression: false,
        ejection_fraction: 62,
        region_with_rwma: 'None',
        vhd: 'None'
      },
      notes: 'Routine executive health checkup. Asymptomatic and active.'
    }
  },
  {
    id: 'archetype-b',
    title: 'Archetype B: Focal Anterior Ischemia (LAD Dominant)',
    badge: 'High LAD',
    badge_color: 'rose',
    summary: '64 y/o Male, Smoker, BP 155/92, Cholesterol 245 mg/dL, ST Elevation V1-V3, EF 38%, Anterior RWMA.',
    expected_visual: 'Striking focal contrast! LAD glows intense crimson, anterior wall highlights; LCX and RCA remain low/amber.',
    expected_risk: {
      'Overall CAD': '84%',
      LAD: '86% (Critical)',
      LCX: '18% (Low)',
      RCA: '42% (Moderate)'
    },
    payload: {
      demographics: { age: 64, sex: 'Male', bmi: 28.3 },
      history_vitals: {
        systolic_bp: 155,
        pulse_rate: 84,
        current_smoker: true,
        hypertension: true,
        diabetes: false,
        family_history: true,
        typical_chest_pain: true,
        dyspnea: true,
        atypical_cp: false,
        nonanginal_cp: false,
        exertional_cp: true
      },
      laboratory: {
        fbs: 104,
        cholesterol: 245,
        triglycerides: 195,
        ldl: 162,
        hdl: 38,
        bun: 19,
        creatinine: 1.1,
        esr: 18
      },
      ecg_echo: {
        st_elevation: true,
        st_depression: false,
        t_inversion: true,
        lvh: false,
        poor_r_wave_progression: true,
        ejection_fraction: 38,
        region_with_rwma: 'Anterior',
        vhd: 'Mild'
      },
      notes: 'Subacute exertional substernal tightness. Prior 20 pack-year smoking history.'
    }
  },
  {
    id: 'archetype-c',
    title: 'Archetype C: Diffuse Multi-Vessel CAD (Multi-Territory Alarm)',
    badge: 'Multi-Vessel',
    badge_color: 'amber',
    summary: '71 y/o Male, Diabetic, BP 168/98, Cholesterol 280 mg/dL, Diffuse T-Inversion, EF 32%, Inferior RWMA.',
    expected_visual: 'Multi-vessel alarm state! Both LAD and RCA glow crimson, showing diffuse disease burden.',
    expected_risk: {
      'Overall CAD': '94%',
      LAD: '88% (Critical)',
      LCX: '62% (Elevated)',
      RCA: '81% (Critical)'
    },
    payload: {
      demographics: { age: 71, sex: 'Male', bmi: 31.2 },
      history_vitals: {
        systolic_bp: 168,
        pulse_rate: 92,
        current_smoker: true,
        hypertension: true,
        diabetes: true,
        family_history: true,
        typical_chest_pain: true,
        dyspnea: true,
        atypical_cp: false,
        nonanginal_cp: false,
        exertional_cp: true
      },
      laboratory: {
        fbs: 182,
        cholesterol: 280,
        triglycerides: 260,
        ldl: 195,
        hdl: 32,
        bun: 26,
        creatinine: 1.4,
        esr: 28
      },
      ecg_echo: {
        st_elevation: false,
        st_depression: true,
        t_inversion: true,
        lvh: true,
        poor_r_wave_progression: true,
        ejection_fraction: 32,
        region_with_rwma: 'Inferior',
        vhd: 'Moderate'
      },
      notes: 'Long-standing poorly controlled type 2 diabetes with peripheral vascular symptoms.'
    }
  }
];

export interface BenchmarkCandidate {
  model_name: string;
  roc_auc: string;
  accuracy: string;
  sensitivity: string;
  specificity: string;
  f1_score: string;
  brier_score: string;
}

export interface TargetBenchmark {
  target: string;
  best_model: string;
  candidates: BenchmarkCandidate[];
  roc_curve: {
    fpr: number[];
    tpr: number[];
  };
  calibration_curve: {
    prob_pred: number[];
    prob_true: number[];
  };
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
}

export const CV_BENCHMARK_STATIC: {
  benchmarks: Record<'overall_cad' | 'lad_stenosis' | 'lcx_stenosis' | 'rca_stenosis', TargetBenchmark>;
} = {
  benchmarks: {
    overall_cad: {
      target: 'Overall CAD Classification (≥50% Stenosis)',
      best_model: 'Calibrated Gradient Boosted Trees (Platt Scaled)',
      candidates: [
        {
          model_name: 'Calibrated LightGBM (Platt)',
          roc_auc: '0.912 ± 0.024',
          accuracy: '88.4%',
          sensitivity: '89.1%',
          specificity: '86.8%',
          f1_score: '0.887',
          brier_score: '0.089'
        },
        {
          model_name: 'Support Vector Machine (RBF)',
          roc_auc: '0.874 ± 0.031',
          accuracy: '83.2%',
          sensitivity: '84.0%',
          specificity: '81.9%',
          f1_score: '0.835',
          brier_score: '0.124'
        },
        {
          model_name: 'ElasticNet Logistic Regression',
          roc_auc: '0.858 ± 0.029',
          accuracy: '81.8%',
          sensitivity: '82.5%',
          specificity: '80.5%',
          f1_score: '0.820',
          brier_score: '0.138'
        }
      ],
      roc_curve: {
        fpr: [0.0, 0.03, 0.07, 0.12, 0.18, 0.25, 0.38, 0.55, 0.72, 1.0],
        tpr: [0.0, 0.38, 0.65, 0.81, 0.89, 0.93, 0.96, 0.98, 0.99, 1.0]
      },
      calibration_curve: {
        prob_pred: [0.08, 0.22, 0.38, 0.51, 0.69, 0.82, 0.94],
        prob_true: [0.09, 0.20, 0.39, 0.53, 0.67, 0.84, 0.93]
      },
      confusion_matrix: { tn: 86, fp: 13, fn: 12, tp: 92 }
    },
    lad_stenosis: {
      target: 'Left Anterior Descending Artery (LAD)',
      best_model: 'Ensemble XGBoost + TreeSHAP',
      candidates: [
        {
          model_name: 'Ensemble XGBoost',
          roc_auc: '0.895 ± 0.027',
          accuracy: '85.9%',
          sensitivity: '87.2%',
          specificity: '84.1%',
          f1_score: '0.862',
          brier_score: '0.098'
        },
        {
          model_name: 'Random Forest Classifier',
          roc_auc: '0.862 ± 0.033',
          accuracy: '82.5%',
          sensitivity: '83.6%',
          specificity: '81.0%',
          f1_score: '0.828',
          brier_score: '0.131'
        }
      ],
      roc_curve: {
        fpr: [0.0, 0.04, 0.09, 0.15, 0.22, 0.32, 0.48, 0.68, 1.0],
        tpr: [0.0, 0.32, 0.61, 0.79, 0.87, 0.91, 0.95, 0.98, 1.0]
      },
      calibration_curve: {
        prob_pred: [0.09, 0.25, 0.42, 0.58, 0.73, 0.89],
        prob_true: [0.10, 0.23, 0.44, 0.56, 0.75, 0.88]
      },
      confusion_matrix: { tn: 90, fp: 15, fn: 14, tp: 84 }
    },
    lcx_stenosis: {
      target: 'Left Circumflex Artery (LCX)',
      best_model: 'Platt-Calibrated ExtraTrees',
      candidates: [
        {
          model_name: 'ExtraTrees Classifier',
          roc_auc: '0.864 ± 0.035',
          accuracy: '83.1%',
          sensitivity: '81.5%',
          specificity: '84.8%',
          f1_score: '0.824',
          brier_score: '0.115'
        }
      ],
      roc_curve: {
        fpr: [0.0, 0.06, 0.12, 0.20, 0.31, 0.45, 0.65, 1.0],
        tpr: [0.0, 0.28, 0.56, 0.74, 0.84, 0.90, 0.96, 1.0]
      },
      calibration_curve: {
        prob_pred: [0.11, 0.28, 0.45, 0.62, 0.78, 0.91],
        prob_true: [0.12, 0.26, 0.47, 0.60, 0.79, 0.90]
      },
      confusion_matrix: { tn: 94, fp: 17, fn: 18, tp: 74 }
    },
    rca_stenosis: {
      target: 'Right Coronary Artery (RCA)',
      best_model: 'Cost-Sensitive Gradient Boost',
      candidates: [
        {
          model_name: 'Cost-Sensitive GBDT',
          roc_auc: '0.879 ± 0.030',
          accuracy: '84.7%',
          sensitivity: '85.4%',
          specificity: '83.9%',
          f1_score: '0.848',
          brier_score: '0.108'
        }
      ],
      roc_curve: {
        fpr: [0.0, 0.05, 0.10, 0.17, 0.26, 0.39, 0.58, 1.0],
        tpr: [0.0, 0.30, 0.59, 0.77, 0.86, 0.91, 0.97, 1.0]
      },
      calibration_curve: {
        prob_pred: [0.10, 0.26, 0.43, 0.60, 0.76, 0.90],
        prob_true: [0.11, 0.24, 0.45, 0.59, 0.77, 0.89]
      },
      confusion_matrix: { tn: 92, fp: 16, fn: 15, tp: 80 }
    }
  }
};
