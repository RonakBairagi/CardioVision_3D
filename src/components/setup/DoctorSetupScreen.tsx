import React, { useState } from 'react';
import {
  UserCheck,
  Building2,
  FileBadge,
  Award,
  ArrowRight,
  AlertCircle,
  Plus,
  X,
  Stethoscope,
  Info,
  Check
} from 'lucide-react';
import { DoctorProfile } from '../../types/cardio';

const STANDARD_QUALIFICATIONS = [
  'MBBS',
  'MD',
  'MS',
  'DNB',
  'DM',
  'MCh',
  'FRCS',
  'MRCP',
  'FRCPath',
  'FRCR'
];

interface DoctorSetupScreenProps {
  initialProfile?: DoctorProfile | null;
  onSave: (profile: DoctorProfile) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const DoctorSetupScreen: React.FC<DoctorSetupScreenProps> = ({
  initialProfile,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [fullName, setFullName] = useState<string>(initialProfile?.fullName || '');
  const [medicalRegNumber, setMedicalRegNumber] = useState<string>(
    initialProfile?.medicalRegNumber || ''
  );
  const [hospitalName, setHospitalName] = useState<string>(initialProfile?.hospitalName || '');
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>(
    initialProfile?.qualifications || []
  );
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(
    Boolean(initialProfile?.otherQualification)
  );
  const [otherQualification, setOtherQualification] = useState<string>(
    initialProfile?.otherQualification || ''
  );

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showErrorBanner, setShowErrorBanner] = useState<boolean>(false);

  // Toggle standard qualification
  const toggleQualification = (qual: string) => {
    setTouched(prev => ({ ...prev, qualifications: true }));
    setSelectedQualifications(prev => {
      if (prev.includes(qual)) {
        return prev.filter(q => q !== qual);
      } else {
        return [...prev, qual];
      }
    });
  };

  const toggleOtherOption = () => {
    setIsOtherSelected(prev => {
      const next = !prev;
      if (!next) {
        setOtherQualification('');
      }
      return next;
    });
    setTouched(prev => ({ ...prev, qualifications: true }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = (): boolean => {
    const errors: string[] = [];

    if (!fullName.trim()) {
      errors.push("Doctor's Full Name is required.");
    } else if (fullName.trim().length < 3) {
      errors.push("Doctor's Full Name must be at least 3 characters.");
    }

    if (!medicalRegNumber.trim()) {
      errors.push("Medical Registration Number is required.");
    }

    if (!hospitalName.trim()) {
      errors.push("Hospital or Medical Institution Name is required.");
    }

    const hasStandardQual = selectedQualifications.length > 0;
    const hasOtherQual = isOtherSelected && otherQualification.trim().length > 0;

    if (!hasStandardQual && !hasOtherQual) {
      errors.push("Please select or specify at least one Medical Qualification / Degree.");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      medicalRegNumber: true,
      hospitalName: true,
      qualifications: true
    });

    if (validate()) {
      setShowErrorBanner(false);
      const profile: DoctorProfile = {
        fullName: fullName.trim(),
        medicalRegNumber: medicalRegNumber.trim(),
        hospitalName: hospitalName.trim(),
        qualifications: selectedQualifications,
        otherQualification: isOtherSelected && otherQualification.trim() ? otherQualification.trim() : undefined,
        updatedAt: new Date().toISOString()
      };
      onSave(profile);
    } else {
      setShowErrorBanner(true);
    }
  };

  return (
    <div className="doctor-setup-container">
      <div className="doctor-setup-card">
        {/* Header */}
        <div className="setup-card-header">
          <div className="setup-badge-icon">
            <Stethoscope size={24} />
          </div>
          <div className="setup-header-text">
            <h2>{isEditing ? 'Update Practitioner Credentials' : 'Doctor & Hospital Setup'}</h2>
            <p>
              Please enter your medical credentials and institutional affiliation. These details
              will be authenticated in patient clinical decision-support summaries and printed reports.
            </p>
          </div>
        </div>

        {/* Validation Errors Banner */}
        {showErrorBanner && validationErrors.length > 0 && (
          <div className="setup-error-banner" role="alert">
            <AlertCircle size={18} className="error-icon" />
            <div className="error-content">
              <strong>Please complete all required fields before continuing:</strong>
              <ul>
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="setup-form" noValidate>
          {/* Field A: Doctor's Full Name */}
          <div className="setup-field-group">
            <label htmlFor="doctor-full-name" className="setup-label">
              <span className="label-text">
                Doctor's Full Name <span className="req-star">*</span>
              </span>
              <span className="label-hint">Include title (e.g. Dr., Prof.)</span>
            </label>
            <div className="input-with-icon">
              <UserCheck size={16} className="field-icon" />
              <input
                id="doctor-full-name"
                type="text"
                className={`setup-input ${
                  touched.fullName && !fullName.trim() ? 'input-error' : ''
                }`}
                placeholder="e.g. Dr. Arthur Vance, MD"
                value={fullName}
                onChange={e => {
                  setFullName(e.target.value);
                  if (showErrorBanner) validate();
                }}
                onBlur={() => handleBlur('fullName')}
                required
              />
            </div>
            {touched.fullName && !fullName.trim() && (
              <span className="field-error-msg">Doctor's full name is required.</span>
            )}
          </div>

          {/* Field B: Medical Registration Number */}
          <div className="setup-field-group">
            <label htmlFor="medical-reg-number" className="setup-label">
              <span className="label-text">
                Medical Registration Number <span className="req-star">*</span>
              </span>
              <span className="label-hint">Official Council / State Licensing ID</span>
            </label>
            <div className="input-with-icon">
              <FileBadge size={16} className="field-icon" />
              <input
                id="medical-reg-number"
                type="text"
                className={`setup-input ${
                  touched.medicalRegNumber && !medicalRegNumber.trim() ? 'input-error' : ''
                }`}
                placeholder="e.g. MCI-2018-84729 or DMC/R/5182"
                value={medicalRegNumber}
                onChange={e => {
                  setMedicalRegNumber(e.target.value);
                  if (showErrorBanner) validate();
                }}
                onBlur={() => handleBlur('medicalRegNumber')}
                required
              />
            </div>
            <div className="field-disclaimer-note">
              <Info size={12} />
              <span>
                Enter your official government-recognized registration number. This ID will appear
                verbatim on clinical reports. No live credential verification is claimed.
              </span>
            </div>
            {touched.medicalRegNumber && !medicalRegNumber.trim() && (
              <span className="field-error-msg">Medical registration number is required.</span>
            )}
          </div>

          {/* Field C: Hospital Name */}
          <div className="setup-field-group">
            <label htmlFor="hospital-name" className="setup-label">
              <span className="label-text">
                Hospital / Medical Institution Name <span className="req-star">*</span>
              </span>
              <span className="label-hint">Current practice or clinical center</span>
            </label>
            <div className="input-with-icon">
              <Building2 size={16} className="field-icon" />
              <input
                id="hospital-name"
                type="text"
                className={`setup-input ${
                  touched.hospitalName && !hospitalName.trim() ? 'input-error' : ''
                }`}
                placeholder="e.g. Metropolitan Heart & Vascular Institute"
                value={hospitalName}
                onChange={e => {
                  setHospitalName(e.target.value);
                  if (showErrorBanner) validate();
                }}
                onBlur={() => handleBlur('hospitalName')}
                required
              />
            </div>
            {touched.hospitalName && !hospitalName.trim() && (
              <span className="field-error-msg">Hospital or institution name is required.</span>
            )}
          </div>

          {/* Field D: Medical Qualifications / Degrees */}
          <div className="setup-field-group">
            <label className="setup-label">
              <span className="label-text">
                Medical Qualifications / Degrees <span className="req-star">*</span>
              </span>
              <span className="label-hint">Select one or more recognized medical qualifications</span>
            </label>

            <div className="qualifications-selector-box">
              <div className="qual-chips-grid">
                {STANDARD_QUALIFICATIONS.map(qual => {
                  const isSelected = selectedQualifications.includes(qual);
                  return (
                    <button
                      key={qual}
                      type="button"
                      className={`qual-chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleQualification(qual)}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? <Check size={13} className="chip-check" /> : <Plus size={13} className="chip-plus" />}
                      <span>{qual}</span>
                    </button>
                  );
                })}

                {/* Other / Add qualification option */}
                <button
                  type="button"
                  className={`qual-chip-btn other-chip ${isOtherSelected ? 'selected' : ''}`}
                  onClick={toggleOtherOption}
                  aria-pressed={isOtherSelected}
                >
                  {isOtherSelected ? <Check size={13} className="chip-check" /> : <Plus size={13} className="chip-plus" />}
                  <span>Other / Add qualification</span>
                </button>
              </div>

              {/* Selected qualifications summary badge row */}
              {selectedQualifications.length > 0 && (
                <div className="selected-quals-preview">
                  <span className="preview-label">Selected:</span>
                  <div className="preview-badges-list">
                    {selectedQualifications.map(q => (
                      <span key={q} className="selected-qual-badge">
                        {q}
                        <button
                          type="button"
                          className="remove-badge-btn"
                          onClick={() => toggleQualification(q)}
                          aria-label={`Remove qualification ${q}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Text input for Other qualification */}
              {isOtherSelected && (
                <div className="other-qual-input-wrap">
                  <label htmlFor="other-qualification" className="sub-label">
                    Specify Additional Qualification(s):
                  </label>
                  <div className="input-with-icon">
                    <Award size={15} className="field-icon" />
                    <input
                      id="other-qualification"
                      type="text"
                      className="setup-input"
                      placeholder="e.g. FACC, FSCAI, PhD (Cardiology)"
                      value={otherQualification}
                      onChange={e => {
                        setOtherQualification(e.target.value);
                        if (showErrorBanner) validate();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {touched.qualifications &&
              selectedQualifications.length === 0 &&
              (!isOtherSelected || !otherQualification.trim()) && (
                <span className="field-error-msg">
                  Please select at least one medical qualification.
                </span>
              )}
          </div>

          {/* Form Actions */}
          <div className="setup-actions-bar">
            {isEditing && onCancel && (
              <button type="button" className="setup-cancel-btn" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="setup-submit-btn">
              <span>{isEditing ? 'Save Changes' : 'Continue to Dashboard'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
