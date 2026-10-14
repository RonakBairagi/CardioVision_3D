import { PatientInput } from '../types/cardio';

export type ValidationSeverity = 'error' | 'warning' | 'valid';

export interface FieldValidation {
  status: ValidationSeverity;
  message?: string;
  hint?: string;
  expectedRange?: string;
  unit?: string;
}

export interface PatientFormValidation {
  isValid: boolean; // true if 0 errors (warnings allowed)
  errorCount: number;
  warningCount: number;
  fields: Record<string, FieldValidation>;
  tabIssues: {
    demo: { errors: number; warnings: number };
    vitals: { errors: number; warnings: number };
    labs: { errors: number; warnings: number };
    ecg: { errors: number; warnings: number };
  };
}

/**
 * Validates patient clinical intake fields according to Z-Alizadeh Sani benchmark
 * feature distributions, physiological limits, and clinical plausibility.
 */
export function validatePatientInput(patient: PatientInput): PatientFormValidation {
  const fields: Record<string, FieldValidation> = {};
  const tabIssues = {
    demo: { errors: 0, warnings: 0 },
    vitals: { errors: 0, warnings: 0 },
    labs: { errors: 0, warnings: 0 },
    ecg: { errors: 0, warnings: 0 }
  };

  const registerField = (
    key: string,
    tab: 'demo' | 'vitals' | 'labs' | 'ecg',
    validation: FieldValidation
  ) => {
    fields[key] = validation;
    if (validation.status === 'error') {
      tabIssues[tab].errors++;
    } else if (validation.status === 'warning') {
      tabIssues[tab].warnings++;
    }
  };

  // ==================== TAB 1: DEMOGRAPHICS ====================
  // Age
  const age = patient.demographics.age;
  if (age === null || age === undefined || isNaN(age) || typeof age !== 'number') {
    registerField('age', 'demo', {
      status: 'error',
      message: 'Age is required. Enter patient age in years (18 - 120).',
      expectedRange: '18 - 120 years',
      unit: 'years'
    });
  } else if (age < 18 || age > 120) {
    registerField('age', 'demo', {
      status: 'error',
      message: `Physiologically impossible age (${age} yrs). Must be between 18 and 120 years.`,
      expectedRange: '18 - 120 years',
      unit: 'years'
    });
  } else if (age < 25) {
    registerField('age', 'demo', {
      status: 'warning',
      message: `Atypical CAD evaluation age (${age} yrs). Ischemic CAD is rare in patients under 25; verify chart.`,
      expectedRange: 'Standard CAD cohort: 30 - 85 years',
      unit: 'years'
    });
  } else if (age > 90) {
    registerField('age', 'demo', {
      status: 'warning',
      message: `Patient is > 90 years old (${age} yrs). Extreme geriatric risk calibration applies; verify date of birth.`,
      expectedRange: 'Standard CAD cohort: 30 - 85 years',
      unit: 'years'
    });
  } else {
    registerField('age', 'demo', { status: 'valid', unit: 'years' });
  }

  // Sex
  const sex = patient.demographics.sex;
  if (!sex || (sex !== 'Male' && sex !== 'Female')) {
    registerField('sex', 'demo', {
      status: 'error',
      message: 'Biological sex is required for risk equation calibration.'
    });
  } else {
    registerField('sex', 'demo', { status: 'valid' });
  }

  // BMI
  const bmi = patient.demographics.bmi;
  if (bmi === null || bmi === undefined || isNaN(bmi) || typeof bmi !== 'number') {
    registerField('bmi', 'demo', {
      status: 'error',
      message: 'Body Mass Index (BMI) is required. Enter value in kg/m².',
      expectedRange: '10.0 - 80.0 kg/m²',
      unit: 'kg/m²'
    });
  } else if (bmi < 10 || bmi > 80) {
    registerField('bmi', 'demo', {
      status: 'error',
      message: `Physiologically impossible BMI (${bmi} kg/m²). Must be between 10.0 and 80.0.`,
      expectedRange: '10.0 - 80.0 kg/m²',
      unit: 'kg/m²'
    });
  } else if (bmi < 16) {
    registerField('bmi', 'demo', {
      status: 'warning',
      message: `Severe underweight warning (${bmi} kg/m² < 16.0). Check weight and height inputs.`,
      expectedRange: 'Normal: 18.5 - 24.9 kg/m²',
      unit: 'kg/m²'
    });
  } else if (bmi > 45) {
    registerField('bmi', 'demo', {
      status: 'warning',
      message: `Class III severe obesity (${bmi} kg/m² > 45.0). Verify patient height and weight.`,
      expectedRange: 'Normal: 18.5 - 24.9 kg/m²',
      unit: 'kg/m²'
    });
  } else {
    registerField('bmi', 'demo', { status: 'valid', unit: 'kg/m²' });
  }

  // ==================== TAB 2: VITALS & MEDICAL HISTORY ====================
  // Systolic BP
  const bp = patient.history_vitals.systolic_bp;
  if (bp === null || bp === undefined || isNaN(bp) || typeof bp !== 'number') {
    registerField('systolic_bp', 'vitals', {
      status: 'error',
      message: 'Systolic blood pressure is required. Enter value in mmHg.',
      expectedRange: '60 - 260 mmHg',
      unit: 'mmHg'
    });
  } else if (bp < 60 || bp > 260) {
    registerField('systolic_bp', 'vitals', {
      status: 'error',
      message: `Physiologically incompatible systolic BP (${bp} mmHg). Must be between 60 and 260 mmHg.`,
      expectedRange: '60 - 260 mmHg',
      unit: 'mmHg'
    });
  } else if (bp < 85) {
    registerField('systolic_bp', 'vitals', {
      status: 'warning',
      message: `Hypotension alert (${bp} mmHg < 85). Verify hemodynamic stability or shock status.`,
      expectedRange: 'Optimal: < 120 mmHg',
      unit: 'mmHg'
    });
  } else if (bp > 180) {
    registerField('systolic_bp', 'vitals', {
      status: 'warning',
      message: `Stage 3 hypertensive urgency alert (${bp} mmHg > 180). Verify manual cuff measurement.`,
      expectedRange: 'Optimal: < 120 mmHg',
      unit: 'mmHg'
    });
  } else {
    registerField('systolic_bp', 'vitals', { status: 'valid', unit: 'mmHg' });
  }

  // Pulse Rate
  const pulse = patient.history_vitals.pulse_rate;
  if (pulse === null || pulse === undefined || isNaN(pulse) || typeof pulse !== 'number') {
    registerField('pulse_rate', 'vitals', {
      status: 'error',
      message: 'Resting pulse rate is required. Enter value in bpm.',
      expectedRange: '30 - 220 bpm',
      unit: 'bpm'
    });
  } else if (pulse < 30 || pulse > 220) {
    registerField('pulse_rate', 'vitals', {
      status: 'error',
      message: `Impossible resting heart rate (${pulse} bpm). Must be between 30 and 220 bpm.`,
      expectedRange: '30 - 220 bpm',
      unit: 'bpm'
    });
  } else if (pulse < 50) {
    registerField('pulse_rate', 'vitals', {
      status: 'warning',
      message: `Marked bradycardia (${pulse} bpm < 50). Verify high-performance athlete status or AV conduction delay.`,
      expectedRange: 'Normal: 60 - 100 bpm',
      unit: 'bpm'
    });
  } else if (pulse > 120) {
    registerField('pulse_rate', 'vitals', {
      status: 'warning',
      message: `Marked resting tachycardia (${pulse} bpm > 120). Rule out acute arrhythmia, pain, or fever.`,
      expectedRange: 'Normal: 60 - 100 bpm',
      unit: 'bpm'
    });
  } else {
    registerField('pulse_rate', 'vitals', { status: 'valid', unit: 'bpm' });
  }

  // ==================== TAB 3: LABORATORY ASSAYS ====================
  // Fasting Blood Sugar (FBS)
  const fbs = patient.laboratory.fbs;
  if (fbs === null || fbs === undefined || isNaN(fbs) || typeof fbs !== 'number') {
    registerField('fbs', 'labs', {
      status: 'error',
      message: 'Fasting blood sugar (FBS) is required. Enter value in mg/dL.',
      expectedRange: '40 - 600 mg/dL',
      unit: 'mg/dL'
    });
  } else if (fbs < 40 || fbs > 600) {
    registerField('fbs', 'labs', {
      status: 'error',
      message: `Impossible FBS assay (${fbs} mg/dL). Must be between 40 and 600 mg/dL.`,
      expectedRange: '40 - 600 mg/dL',
      unit: 'mg/dL'
    });
  } else if (fbs < 65) {
    registerField('fbs', 'labs', {
      status: 'warning',
      message: `Hypoglycemia alert (${fbs} mg/dL < 65). Verify patient fasting protocol.`,
      expectedRange: 'Normal: 70 - 99 mg/dL',
      unit: 'mg/dL'
    });
  } else if (fbs > 250) {
    registerField('fbs', 'labs', {
      status: 'warning',
      message: `Marked hyperglycemia (${fbs} mg/dL > 250). Verify glycemic control / diabetes status.`,
      expectedRange: 'Normal: 70 - 99 mg/dL',
      unit: 'mg/dL'
    });
  } else {
    registerField('fbs', 'labs', { status: 'valid', unit: 'mg/dL' });
  }

  // Total Cholesterol
  const chol = patient.laboratory.cholesterol;
  if (chol === null || chol === undefined || isNaN(chol) || typeof chol !== 'number') {
    registerField('cholesterol', 'labs', {
      status: 'error',
      message: 'Total cholesterol is required. Enter value in mg/dL.',
      expectedRange: '70 - 600 mg/dL',
      unit: 'mg/dL'
    });
  } else if (chol < 70 || chol > 600) {
    registerField('cholesterol', 'labs', {
      status: 'error',
      message: `Impossible total cholesterol (${chol} mg/dL). Must be between 70 and 600 mg/dL.`,
      expectedRange: '70 - 600 mg/dL',
      unit: 'mg/dL'
    });
  } else if (chol < 110) {
    registerField('cholesterol', 'labs', {
      status: 'warning',
      message: `Atypically low total cholesterol (${chol} mg/dL < 110). Rule out hypolipidemic states or malabsorption.`,
      expectedRange: 'Desirable: < 200 mg/dL',
      unit: 'mg/dL'
    });
  } else if (chol > 320) {
    registerField('cholesterol', 'labs', {
      status: 'warning',
      message: `Severe hypercholesterolemia (${chol} mg/dL > 320). Consider familial hypercholesterolemia.`,
      expectedRange: 'Desirable: < 200 mg/dL',
      unit: 'mg/dL'
    });
  } else {
    registerField('cholesterol', 'labs', { status: 'valid', unit: 'mg/dL' });
  }

  // Low-Density Lipoprotein (LDL)
  const ldl = patient.laboratory.ldl;
  if (ldl === null || ldl === undefined || isNaN(ldl) || typeof ldl !== 'number') {
    registerField('ldl', 'labs', {
      status: 'error',
      message: 'LDL cholesterol is required. Enter value in mg/dL.',
      expectedRange: '20 - 400 mg/dL',
      unit: 'mg/dL'
    });
  } else if (ldl < 20 || ldl > 400) {
    registerField('ldl', 'labs', {
      status: 'error',
      message: `Impossible LDL value (${ldl} mg/dL). Must be between 20 and 400 mg/dL.`,
      expectedRange: '20 - 400 mg/dL',
      unit: 'mg/dL'
    });
  } else if (typeof chol === 'number' && !isNaN(chol) && ldl > chol) {
    registerField('ldl', 'labs', {
      status: 'error',
      message: `Physiological contradiction: LDL (${ldl} mg/dL) cannot exceed Total Cholesterol (${chol} mg/dL).`,
      expectedRange: `< Total Cholesterol (${chol} mg/dL)`,
      unit: 'mg/dL'
    });
  } else if (ldl > 220) {
    registerField('ldl', 'labs', {
      status: 'warning',
      message: `Markedly elevated atherogenic LDL (${ldl} mg/dL > 220). Significant CAD risk accelerator.`,
      expectedRange: 'Optimal: < 100 mg/dL',
      unit: 'mg/dL'
    });
  } else {
    registerField('ldl', 'labs', { status: 'valid', unit: 'mg/dL' });
  }

  // High-Density Lipoprotein (HDL)
  const hdl = patient.laboratory.hdl;
  if (hdl === null || hdl === undefined || isNaN(hdl) || typeof hdl !== 'number') {
    registerField('hdl', 'labs', {
      status: 'error',
      message: 'HDL cholesterol is required. Enter value in mg/dL.',
      expectedRange: '10 - 140 mg/dL',
      unit: 'mg/dL'
    });
  } else if (hdl < 10 || hdl > 140) {
    registerField('hdl', 'labs', {
      status: 'error',
      message: `Impossible HDL value (${hdl} mg/dL). Must be between 10 and 140 mg/dL.`,
      expectedRange: '10 - 140 mg/dL',
      unit: 'mg/dL'
    });
  } else if (hdl < 25) {
    registerField('hdl', 'labs', {
      status: 'warning',
      message: `Critically low protective HDL (${hdl} mg/dL < 25). Heightened atherogenic predisposition.`,
      expectedRange: 'Protective: ≥ 50 mg/dL',
      unit: 'mg/dL'
    });
  } else if (hdl > 90) {
    registerField('hdl', 'labs', {
      status: 'warning',
      message: `Atypically elevated HDL (${hdl} mg/dL > 90). Verify laboratory report.`,
      expectedRange: 'Normal: 40 - 80 mg/dL',
      unit: 'mg/dL'
    });
  } else {
    registerField('hdl', 'labs', { status: 'valid', unit: 'mg/dL' });
  }

  // Triglycerides
  const tg = patient.laboratory.triglycerides;
  if (tg === null || tg === undefined || isNaN(tg) || typeof tg !== 'number') {
    registerField('triglycerides', 'labs', {
      status: 'error',
      message: 'Triglycerides assay is required. Enter value in mg/dL.',
      expectedRange: '30 - 1200 mg/dL',
      unit: 'mg/dL'
    });
  } else if (tg < 30 || tg > 1200) {
    registerField('triglycerides', 'labs', {
      status: 'error',
      message: `Impossible triglycerides level (${tg} mg/dL). Must be between 30 and 1200 mg/dL.`,
      expectedRange: '30 - 1200 mg/dL',
      unit: 'mg/dL'
    });
  } else if (tg > 400) {
    registerField('triglycerides', 'labs', {
      status: 'warning',
      message: `Severe hypertriglyceridemia (${tg} mg/dL > 400). Risk of pancreatitis & metabolic CAD acceleration.`,
      expectedRange: 'Normal: < 150 mg/dL',
      unit: 'mg/dL'
    });
  } else {
    registerField('triglycerides', 'labs', { status: 'valid', unit: 'mg/dL' });
  }

  // Blood Urea Nitrogen (BUN)
  const bun = patient.laboratory.bun;
  if (bun === null || bun === undefined || isNaN(bun) || typeof bun !== 'number') {
    registerField('bun', 'labs', {
      status: 'error',
      message: 'Blood Urea Nitrogen (BUN) is required. Enter value in mg/dL.',
      expectedRange: '2 - 150 mg/dL',
      unit: 'mg/dL'
    });
  } else if (bun < 2 || bun > 150) {
    registerField('bun', 'labs', {
      status: 'error',
      message: `Impossible BUN assay (${bun} mg/dL). Must be between 2 and 150 mg/dL.`,
      expectedRange: '2 - 150 mg/dL',
      unit: 'mg/dL'
    });
  } else if (bun > 45) {
    registerField('bun', 'labs', {
      status: 'warning',
      message: `Significantly elevated BUN (${bun} mg/dL > 45). Possible prerenal azotemia or dehydration.`,
      expectedRange: 'Normal: 7 - 20 mg/dL',
      unit: 'mg/dL'
    });
  } else {
    registerField('bun', 'labs', { status: 'valid', unit: 'mg/dL' });
  }

  // Serum Creatinine
  const cr = patient.laboratory.creatinine;
  if (cr === null || cr === undefined || isNaN(cr) || typeof cr !== 'number') {
    registerField('creatinine', 'labs', {
      status: 'error',
      message: 'Serum creatinine is required. Enter value in mg/dL.',
      expectedRange: '0.2 - 12.0 mg/dL',
      unit: 'mg/dL'
    });
  } else if (cr < 0.2 || cr > 12.0) {
    registerField('creatinine', 'labs', {
      status: 'error',
      message: `Impossible serum creatinine (${cr} mg/dL). Must be between 0.2 and 12.0 mg/dL.`,
      expectedRange: '0.2 - 12.0 mg/dL',
      unit: 'mg/dL'
    });
  } else if (cr > 2.5) {
    registerField('creatinine', 'labs', {
      status: 'warning',
      message: `Marked renal insufficiency (${cr} mg/dL > 2.5). Affects cardiorenal risk and contrast catheterization safety.`,
      expectedRange: 'Normal: 0.7 - 1.3 mg/dL',
      unit: 'mg/dL'
    });
  } else {
    registerField('creatinine', 'labs', { status: 'valid', unit: 'mg/dL' });
  }

  // ==================== TAB 4: ECG & ECHOCARDIOGRAPHY ====================
  // Ejection Fraction (LVEF)
  const ef = patient.ecg_echo.ejection_fraction;
  if (ef === null || ef === undefined || isNaN(ef) || typeof ef !== 'number') {
    registerField('ejection_fraction', 'ecg', {
      status: 'error',
      message: 'Left Ventricular Ejection Fraction (LVEF) is required (%).',
      expectedRange: '10% - 85%',
      unit: '%'
    });
  } else if (ef < 10 || ef > 85) {
    registerField('ejection_fraction', 'ecg', {
      status: 'error',
      message: `Impossible LVEF (${ef}%). Must be between 10% and 85%.`,
      expectedRange: '10% - 85%',
      unit: '%'
    });
  } else if (ef < 30) {
    registerField('ejection_fraction', 'ecg', {
      status: 'warning',
      message: `Severe systolic heart failure warning (LVEF ${ef}% < 30%). Markedly elevated cardiovascular mortality.`,
      expectedRange: 'Normal preserved: ≥ 55%',
      unit: '%'
    });
  } else if (ef > 75) {
    registerField('ejection_fraction', 'ecg', {
      status: 'warning',
      message: `Hyperdynamic left ventricular contractility (LVEF ${ef}% > 75%). Rule out high-output states.`,
      expectedRange: 'Normal preserved: 55% - 70%',
      unit: '%'
    });
  } else {
    registerField('ejection_fraction', 'ecg', { status: 'valid', unit: '%' });
  }

  // Region with RWMA
  const rwma = patient.ecg_echo.region_with_rwma;
  const validRwma = ['None', 'Anterior', 'Inferior', 'Lateral', 'Septal', 'Apical'];
  if (!rwma || !validRwma.includes(rwma)) {
    registerField('region_with_rwma', 'ecg', {
      status: 'error',
      message: 'Echocardiographic wall motion abnormality territory must be selected.'
    });
  } else {
    registerField('region_with_rwma', 'ecg', { status: 'valid' });
  }

  const totalErrors =
    tabIssues.demo.errors + tabIssues.vitals.errors + tabIssues.labs.errors + tabIssues.ecg.errors;
  const totalWarnings =
    tabIssues.demo.warnings + tabIssues.vitals.warnings + tabIssues.labs.warnings + tabIssues.ecg.warnings;

  return {
    isValid: totalErrors === 0,
    errorCount: totalErrors,
    warningCount: totalWarnings,
    fields,
    tabIssues
  };
}
