import React from 'react';
import {
  HeartPulse,
  Activity,
  Zap,
  BarChart3,
  Sliders,
  FileText,
  User,
  Stethoscope,
  Sun,
  Moon
} from 'lucide-react';

export type NavTab = 'dashboard' | 'input' | 'counterfactual' | 'verification' | 'report';
export type Persona = 'clinical' | 'patient';
export type ThemeMode = 'dark' | 'light';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  persona: Persona;
  onTogglePersona: (persona: Persona) => void;
  onOpenArchetypesModal: () => void;
  isBackendOffline: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  persona,
  onTogglePersona,
  onOpenArchetypesModal,
  isBackendOffline,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="cv-header">
      <div className="header-left">
        <div className="logo-group" onClick={() => onSelectTab('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-pulse">
            <HeartPulse size={24} className="heart-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span className="title-bold">CardioVision</span>
              <span className="title-3d">3D</span>
              <span className="hackathon-badge">Track A</span>
            </div>
            <span className="brand-tagline">Multi-Vessel CAD Risk & Explainable Spatial Visualization</span>
          </div>
        </div>

        {/* Offline indicator if backend is in fallback mode */}
        {isBackendOffline && (
          <div className="offline-pill" title="FastAPI server offline; running resilient client-side inference engine">
            <span className="offline-dot" />
            <span>Standalone Demo Engine</span>
          </div>
        )}
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="header-nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
        >
          <Activity size={14} />
          <span>Interactive 3D Heart</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => onSelectTab('input')}
        >
          <HeartPulse size={14} />
          <span>Clinical Intake (54 Feat)</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'counterfactual' ? 'active' : ''}`}
          onClick={() => onSelectTab('counterfactual')}
        >
          <Sliders size={14} />
          <span>"What-If" Explorer</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'verification' ? 'active' : ''}`}
          onClick={() => onSelectTab('verification')}
        >
          <BarChart3 size={14} />
          <span>Model Benchmark Hub</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => onSelectTab('report')}
        >
          <FileText size={14} />
          <span>Summary Report</span>
        </button>
      </nav>

      {/* Header Right Actions */}
      <div className="header-right">
        {/* Judge 1-Click Tour Trigger */}
        <button
          className="judge-tour-btn"
          onClick={onOpenArchetypesModal}
          title="Rapid 60-Second Hackathon Judge Archetypes"
        >
          <Zap size={13} className="spark-icon" />
          <span>Judge Quick Tour</span>
        </button>

        {/* Dual-Persona Switch */}
        <div className="persona-toggle-container">
          <button
            className={`persona-btn ${persona === 'clinical' ? 'active' : ''}`}
            onClick={() => onTogglePersona('clinical')}
            title="Clinician View: SHAP Log-Odds, 95% Wilson Confidence Intervals, Territory Markers"
          >
            <Stethoscope size={13} />
            <span>Clinical</span>
          </button>
          <button
            className={`persona-btn ${persona === 'patient' ? 'active' : ''}`}
            onClick={() => onTogglePersona('patient')}
            title="Patient-Friendly View: Plain English Narratives, Simplified Gauges, Reassurance"
          >
            <User size={13} />
            <span>Patient</span>
          </button>
        </div>

        {/* Theme Switcher (Dark vs Light) */}
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Clinical Daylight Theme' : 'Switch to Cath Lab Dark Theme'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={14} className="theme-icon sun" />
              <span className="theme-label">Light</span>
            </>
          ) : (
            <>
              <Moon size={14} className="theme-icon moon" />
              <span className="theme-label">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
