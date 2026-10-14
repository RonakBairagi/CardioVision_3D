import React, { useRef, useState } from 'react';
import { PatientInput, PredictionResponse, ShapResponse, DoctorProfile } from '../../types/cardio';
import { SvgHeartFallback } from '../3d/SvgHeartFallback';
import { Printer, Download, ShieldCheck, HeartPulse, UserCheck, CheckCircle2, ExternalLink, X } from 'lucide-react';

interface PrintableReportProps {
  patient: PatientInput;
  prediction: PredictionResponse | null;
  shapLAD: ShapResponse | null;
  doctorProfile?: DoctorProfile | null;
  onEditDoctorProfile?: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  patient,
  prediction,
  shapLAD,
  doctorProfile,
  onEditDoctorProfile
}) => {
  const documentSheetRef = useRef<HTMLDivElement>(null);
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Generate standalone printable HTML
  const generateStandaloneHtml = (): string => {
    if (!documentSheetRef.current) return '';
    const content = documentSheetRef.current.innerHTML;
    const dateStr = new Date().toISOString().split('T')[0];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CardioVision 3D - Patient Clinical Summary Report (${dateStr})</title>
  <style>
    @page { size: A4 portrait; margin: 1.2cm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
    .report-document-sheet { max-width: 820px; margin: 0 auto; background: #ffffff; }
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; }
    .doc-brand .doc-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
    .doc-brand .doc-subtitle { font-size: 11.5px; color: #475569; }
    .doc-meta { text-align: right; font-size: 10px; color: #334155; line-height: 1.45; }
    .doc-physician-banner { background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0284c7; padding: 10px 14px; margin: 12px 0 16px; border-radius: 4px; }
    .physician-primary-info { display: flex; flex-direction: column; gap: 4px; }
    .physician-name-row { font-size: 13.5px; color: #0f172a; }
    .physician-label { font-weight: 700; margin-right: 6px; }
    .physician-name { font-weight: 700; color: #0284c7; }
    .physician-quals { font-weight: 600; color: #334155; }
    .physician-meta-row { font-size: 10.5px; color: #475569; display: flex; gap: 14px; flex-wrap: wrap; margin-top: 2px; }
    .doc-divider { border: 0; border-top: 1px solid #cbd5e1; margin: 12px 0; }
    .doc-section { margin-bottom: 16px; }
    .doc-section-title { font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: #1e293b; margin: 0 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; letter-spacing: 0.02em; }
    .profile-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; background: #f8fafc; padding: 10px 14px; border-radius: 4px; border: 1px solid #f1f5f9; }
    .profile-item { display: flex; justify-content: space-between; font-size: 10.5px; }
    .profile-item .key { color: #64748b; font-weight: 500; }
    .profile-item .val { color: #0f172a; font-weight: 600; }
    .doc-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin: 8px 0; }
    .doc-table th { background: #f1f5f9; padding: 6px 8px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 700; color: #1e293b; }
    .doc-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    .doc-table tr.cad-row { background: #f8fafc; font-weight: 600; }
    .tier-pill { padding: 2px 6px; border-radius: 3px; font-size: 9.5px; font-weight: 700; background: #e2e8f0; color: #0f172a; }
    .doc-split-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
    .doc-split-col { display: flex; flex-direction: column; }
    .doc-svg-wrapper { height: 180px; background: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .doc-shap-list { display: flex; flex-direction: column; gap: 2px; }
    .doc-shap-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; }
    .doc-shap-item strong { color: #1e293b; }
    .doc-shap-item .sub { font-size: 9px; color: #64748b; }
    .doc-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; }
    .doc-disclaimer { font-size: 9.5px; color: #64748b; line-height: 1.4; margin-bottom: 18px; }
    .doc-signature-line { display: flex; justify-content: space-between; margin-top: 24px; }
    .sig-box { width: 240px; font-size: 10px; color: #475569; }
    .sig-line { border-bottom: 1px solid #0f172a; height: 26px; margin-bottom: 4px; }
    .sig-name { font-weight: 700; color: #0f172a; }
    .sig-sub { font-size: 9px; color: #64748b; }
    .no-print { display: none !important; }
    @media print {
      body { padding: 0; }
      .report-document-sheet { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div class="report-document-sheet">
    ${content}
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 250);
    });
  </script>
</body>
</html>`;
  };

  // Open standalone print window using clean blob URL link
  const openPrintWindow = () => {
    const html = generateStandaloneHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // Robust Print Handler: Triggers native print, opens print tab, and provides modal helper
  const handlePrint = () => {
    setPrintStatus('Initiating print dialog...');
    
    // 1. Try native window.print() directly
    try {
      window.print();
    } catch (err) {
      console.warn('Native window.print() suppressed:', err);
    }

    // 2. Open print window via blob URL to pop native print dialog
    try {
      openPrintWindow();
    } catch (err) {
      console.warn('Print window open suppressed:', err);
    }

    // 3. Open Assistant Modal so the user has full control regardless of sandbox restrictions
    setIsPrintModalOpen(true);
    setPrintStatus('Print dialog initiated! Choose "Save as PDF" to export.');
    setTimeout(() => setPrintStatus(null), 5000);
  };

  // Open standalone print report in new tab (auto-triggers print dialog immediately)
  const handleOpenPrintTab = () => {
    openPrintWindow();
    setPrintStatus('Opened print tab with auto-printing!');
    setTimeout(() => setPrintStatus(null), 4000);
  };

  // Instant HTML/PDF-ready report download
  const handleDownloadReport = () => {
    const standaloneHtml = generateStandaloneHtml();
    const patientAge = patient.demographics.age;
    const patientSex = patient.demographics.sex;
    const dateStr = new Date().toISOString().split('T')[0];

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CardioVision3D_Report_${patientAge}${patientSex}_${dateStr}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPrintStatus('Downloaded printable report (.html / PDF-ready)!');
    setTimeout(() => setPrintStatus(null), 4000);
  };

  if (!prediction) {
    return (
      <div className="report-empty-container">
        <HeartPulse size={36} />
        <p>Run a clinical assessment first to generate the clinical decision-support report.</p>
      </div>
    );
  }

  const p = prediction.predictions;
  const vesselProbs = {
    LAD: p.vessels.LAD.probability,
    LCX: p.vessels.LCX.probability,
    RCA: p.vessels.RCA.probability
  };

  // Compile all medical qualifications
  const qualificationsList = [...(doctorProfile?.qualifications || [])];
  if (doctorProfile?.otherQualification) {
    qualificationsList.push(doctorProfile.otherQualification);
  }
  const allQualificationsStr = qualificationsList.join(', ');

  const reportDateFormatted = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const reportTimeFormatted = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="printable-report-container">
      {/* Action Bar (hidden during print) */}
      <div className="report-actions-bar no-print">
        <div className="report-actions-left">
          <button className="print-btn" onClick={handlePrint} title="Trigger browser print or Save as PDF">
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>

          <button
            className="secondary-btn"
            onClick={handleOpenPrintTab}
            title="Open report in separate browser tab to print or save as PDF"
          >
            <ExternalLink size={15} />
            <span>Open in Tab to Print</span>
          </button>

          <button
            className="download-report-btn"
            onClick={handleDownloadReport}
            title="Download full standalone report (open and press Ctrl+P to save as PDF)"
          >
            <Download size={16} />
            <span>Download Report (.HTML / PDF-Ready)</span>
          </button>

          {onEditDoctorProfile && (
            <button
              className="secondary-btn edit-dr-action-btn"
              onClick={onEditDoctorProfile}
              title="Change Doctor Name, Medical Registration Number, or Hospital"
            >
              <UserCheck size={14} />
              <span>Update Doctor Details</span>
            </button>
          )}
        </div>

        {printStatus && (
          <div className="print-status-toast">
            <CheckCircle2 size={14} className="toast-icon" />
            <span>{printStatus}</span>
          </div>
        )}
      </div>

      {/* Actual Printable Document Sheet */}
      <div className="report-document-sheet" ref={documentSheetRef}>
        {/* Document Header */}
        <div className="doc-header">
          <div className="doc-brand">
            <h2 className="doc-title">CardioVision 3D (CVS-3D)</h2>
            <span className="doc-subtitle">Clinical Decision Support &amp; Explainable Coronary Risk Summary</span>
          </div>
          <div className="doc-meta">
            <div>
              <strong>Report Date:</strong> {reportDateFormatted} ({reportTimeFormatted})
            </div>
            <div>
              <strong>Protocol:</strong> Track A Hackathon AI Ensemble
            </div>
            <div>
              <strong>Model Version:</strong> {prediction.model_version}
            </div>
          </div>
        </div>

        {/* Doctor & Hospital Attestation Header Section */}
        {doctorProfile && (
          <div className="doc-physician-banner">
            <div className="physician-primary-info">
              <div className="physician-name-row">
                <span className="physician-label">Attending Doctor:</span>
                <span className="physician-name">{doctorProfile.fullName}</span>
                {allQualificationsStr && (
                  <span className="physician-quals">, {allQualificationsStr}</span>
                )}
              </div>
              <div className="physician-meta-row">
                <span className="meta-item">
                  <strong>Medical Registration Number:</strong> {doctorProfile.medicalRegNumber}
                </span>
                <span className="meta-separator">&bull;</span>
                <span className="meta-item">
                  <strong>Hospital / Institution:</strong> {doctorProfile.hospitalName}
                </span>
              </div>
            </div>
          </div>
        )}

        <hr className="doc-divider" />

        {/* Patient Intake Summary */}
        <div className="doc-section">
          <h4 className="doc-section-title">1. Patient Clinical Profile</h4>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="key">Age / Sex:</span>
              <span className="val">
                {patient.demographics.age} yrs / {patient.demographics.sex}
              </span>
            </div>
            <div className="profile-item">
              <span className="key">BMI:</span>
              <span className="val">{patient.demographics.bmi} kg/m²</span>
            </div>
            <div className="profile-item">
              <span className="key">Blood Pressure:</span>
              <span className="val">{patient.history_vitals.systolic_bp} mmHg (Systolic)</span>
            </div>
            <div className="profile-item">
              <span className="key">Smoking Status:</span>
              <span className="val">
                {patient.history_vitals.current_smoker ? 'Active Smoker' : 'Non-Smoker'}
              </span>
            </div>
            <div className="profile-item">
              <span className="key">Total Cholesterol:</span>
              <span className="val">
                {patient.laboratory.cholesterol} mg/dL (LDL: {patient.laboratory.ldl}, HDL:{' '}
                {patient.laboratory.hdl})
              </span>
            </div>
            <div className="profile-item">
              <span className="key">Ejection Fraction (LVEF):</span>
              <span className="val">{patient.ecg_echo.ejection_fraction}%</span>
            </div>
            <div className="profile-item">
              <span className="key">Echo RWMA:</span>
              <span className="val">{patient.ecg_echo.region_with_rwma} Territory</span>
            </div>
            <div className="profile-item">
              <span className="key">Resting ECG:</span>
              <span className="val">
                {patient.ecg_echo.st_elevation ? 'ST Elevation (+) ' : ''}
                {patient.ecg_echo.t_inversion ? 'T-Inversion (+) ' : ''}
                {patient.ecg_echo.poor_r_wave_progression ? 'PRWP (+) ' : ''}
                {!patient.ecg_echo.st_elevation &&
                  !patient.ecg_echo.t_inversion &&
                  !patient.ecg_echo.poor_r_wave_progression &&
                  'Normal / Non-specific'}
              </span>
            </div>
          </div>
        </div>

        {/* Ensemble Multi-Vessel Risk Assessment */}
        <div className="doc-section">
          <h4 className="doc-section-title">
            2. Calibrated Multi-Vessel Stenosis Likelihood (≥ 50% Luminal Reduction)
          </h4>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Arterial Vessel Bed</th>
                <th>Perfusion Territory</th>
                <th>Calibrated Probability</th>
                <th>95% Wilson CI</th>
                <th>Clinical Risk Tier</th>
              </tr>
            </thead>
            <tbody>
              <tr className="cad-row">
                <td>
                  <strong>Overall CAD Status</strong>
                </td>
                <td>Global Coronary Vasculature</td>
                <td className="font-mono">
                  <strong>{Math.round(p.overall_cad.probability * 100)}%</strong>
                </td>
                <td className="font-mono">
                  [{Math.round(p.overall_cad.confidence_interval_95[0] * 100)}% -{' '}
                  {Math.round(p.overall_cad.confidence_interval_95[1] * 100)}%]
                </td>
                <td>
                  <span className="tier-pill">{p.overall_cad.risk_classification}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>LAD (Left Anterior Descending)</strong>
                </td>
                <td>{p.vessels.LAD.territory_description}</td>
                <td className="font-mono">
                  <strong>{Math.round(p.vessels.LAD.probability * 100)}%</strong>
                </td>
                <td className="font-mono">
                  [{Math.round(p.vessels.LAD.confidence_interval_95[0] * 100)}% -{' '}
                  {Math.round(p.vessels.LAD.confidence_interval_95[1] * 100)}%]
                </td>
                <td>
                  <span className="tier-pill">{p.vessels.LAD.risk_classification}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>LCX (Left Circumflex)</strong>
                </td>
                <td>{p.vessels.LCX.territory_description}</td>
                <td className="font-mono">
                  <strong>{Math.round(p.vessels.LCX.probability * 100)}%</strong>
                </td>
                <td className="font-mono">
                  [{Math.round(p.vessels.LCX.confidence_interval_95[0] * 100)}% -{' '}
                  {Math.round(p.vessels.LCX.confidence_interval_95[1] * 100)}%]
                </td>
                <td>
                  <span className="tier-pill">{p.vessels.LCX.risk_classification}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>RCA (Right Coronary Artery)</strong>
                </td>
                <td>{p.vessels.RCA.territory_description}</td>
                <td className="font-mono">
                  <strong>{Math.round(p.vessels.RCA.probability * 100)}%</strong>
                </td>
                <td className="font-mono">
                  [{Math.round(p.vessels.RCA.confidence_interval_95[0] * 100)}% -{' '}
                  {Math.round(p.vessels.RCA.confidence_interval_95[1] * 100)}%]
                </td>
                <td>
                  <span className="tier-pill">{p.vessels.RCA.risk_classification}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Anatomical Schematic & SHAP Drivers Split */}
        <div className="doc-section doc-split-row">
          <div className="doc-split-col">
            <h4 className="doc-section-title">3. Coronary Tree Spatial Mapping</h4>
            <div className="doc-svg-wrapper">
              <SvgHeartFallback
                probabilities={vesselProbs}
                selectedVessel="LAD"
                onSelectVessel={() => {}}
              />
            </div>
          </div>

          <div className="doc-split-col">
            <h4 className="doc-section-title">4. Top TreeSHAP Risk Drivers (LAD Territory)</h4>
            {shapLAD ? (
              <div className="doc-shap-list">
                {shapLAD.top_attributions.slice(0, 5).map((attr, i) => (
                  <div key={i} className="doc-shap-item">
                    <div>
                      <strong>{attr.display_name}</strong>
                      <div className="sub">Patient: {attr.patient_value}</div>
                    </div>
                    <span className="font-mono">
                      {attr.shap_value > 0 ? `+${attr.shap_value.toFixed(3)}` : attr.shap_value.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Attributions available on interactive dashboard.</p>
            )}
          </div>
        </div>

        {/* Legal & Medical Safety Sign-off */}
        <div className="doc-footer">
          <div className="doc-disclaimer">
            <ShieldCheck size={16} />
            <span>
              <strong>INVESTIGATIONAL PROTOTYPE NOTICE:</strong> This document was generated automatically by
              CardioVision 3D for clinical decision-support and educational review only. It is not an FDA-cleared or
              CE-marked diagnostic device and does not replace invasive coronary angiography or licensed physician
              evaluation.
            </span>
          </div>

          <div className="doc-signature-line">
            <div className="sig-box">
              <div className="sig-line" />
              <div className="sig-name">
                {doctorProfile ? `${doctorProfile.fullName}${allQualificationsStr ? ` (${allQualificationsStr})` : ''}` : 'Attending Cardiologist'}
              </div>
              <div className="sig-sub">
                {doctorProfile ? `Medical Reg. No: ${doctorProfile.medicalRegNumber}` : 'Physician Signature'}
              </div>
            </div>
            <div className="sig-box">
              <div className="sig-line" />
              <div className="sig-name">{doctorProfile?.hospitalName || 'Clinical Facility Stamp'}</div>
              <div className="sig-sub">Date: {reportDateFormatted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Print & PDF Dialog Assistant Modal */}
      {isPrintModalOpen && (
        <div className="modal-backdrop no-print" onClick={() => setIsPrintModalOpen(false)}>
          <div className="modal-card print-helper-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Printer size={20} className="modal-title-icon text-cyan-400" />
                <div>
                  <h3 className="modal-title">Print &amp; PDF Export Center</h3>
                  <p className="modal-subtitle">CardioVision 3D Clinical Summary Report</p>
                </div>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsPrintModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body space-y-4">
              <div className="print-modal-info-box">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your clinical report is formatted and ready. Due to browser sandbox security in embedded web previews, choose the fastest export method for your system:
                </p>
              </div>

              <div className="print-options-grid">
                <button
                  type="button"
                  className="print-primary-choice-btn"
                  onClick={() => {
                    openPrintWindow();
                  }}
                >
                  <ExternalLink size={18} />
                  <div>
                    <strong>Open Direct Print Window (New Tab)</strong>
                    <span>Pops your browser's native Print dialog immediately with destination "Save as PDF"</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="print-secondary-choice-btn"
                  onClick={() => {
                    handleDownloadReport();
                  }}
                >
                  <Download size={18} />
                  <div>
                    <strong>Download Report File (.HTML / PDF-Ready)</strong>
                    <span>Saves complete self-contained report to your computer that opens and prints offline</span>
                  </div>
                </button>
              </div>

              <div className="print-shortcut-hint">
                <span>Direct Keyboard Shortcut:</span>
                <code>Ctrl + P</code> (or <code>Cmd + P</code>) anywhere on this Summary Report tab
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsPrintModalOpen(false)}
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
