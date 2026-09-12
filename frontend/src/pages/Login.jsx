import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";

const DEMO_ROLES = [
  {
    role: "student",
    title: "Student",
    shortTitle: "Student",
    name: "Aditi Sharma",
    desc: "Computer Science (2027) · Skill Profile & Heatmap",
    email: "student@demo.skillsetu.local",
    password: "Demo@1234",
    icon: "🎓",
    badge: "Student",
  },
  {
    role: "academician",
    title: "Academician / Technician",
    shortTitle: "Academician",
    name: "Dr. Anil Kapoor",
    desc: "Faculty & Curriculum Alignment · CSE Dept",
    email: "academician@demo.skillsetu.local",
    password: "Demo@1234",
    icon: "🔬",
    badge: "Faculty",
  },
  {
    role: "institution",
    title: "Institution",
    shortTitle: "Institution",
    name: "Dr. Meena Kulkarni",
    desc: "TPO & Registrar · Skill-Gap Analytics",
    email: "admin@demo.skillsetu.local",
    password: "Demo@1234",
    icon: "🏛️",
    badge: "Institution",
  },
  {
    role: "industry",
    title: "Industry",
    shortTitle: "Industry",
    name: "Rakesh Verma",
    desc: "Vertex Systems · Postings & Evaluations",
    email: "industry@demo.skillsetu.local",
    password: "Demo@1234",
    icon: "💼",
    badge: "Employer",
  },
  {
    role: "platform_admin",
    title: "Platform Admin",
    shortTitle: "Admin",
    name: "Platform Administrator",
    desc: "Taxonomy, Governance & Global Verification",
    email: "platformadmin@demo.skillsetu.local",
    password: "Demo@1234",
    icon: "⚙️",
    badge: "Admin",
  },
];

export default function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState(null);

  async function executeLogin(credentials) {
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await api.login(credentials);
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await executeLogin(form);
  }

  function handleDemoSelect(demo, instantSubmit = true) {
    setActiveDemoRole(demo);
    setForm({ email: demo.email, password: demo.password });
    if (instantSubmit) {
      executeLogin({ email: demo.email, password: demo.password });
    }
  }

  return (
    <div className="ss-auth-page">
      <div className="ss-auth-split">
        {/* Left Column: Evidence-Based Manifesto & Platform Trust */}
        <div className="ss-auth-manifesto">
          <div className="ss-auth-manifesto__brand-wrap">
            <div className="ss-auth-manifesto__logo-badge">🎓</div>
            <div>
              <h2 className="ss-auth-manifesto__brand">SkillSetu</h2>
              <div className="ss-auth-manifesto__brand-sub">Skill Intelligence Platform</div>
            </div>
          </div>

          <div className="ss-auth-manifesto__quote">
            <p className="ss-auth-manifesto__text">
              Every score on SkillSetu traces back to a specific assessment, project, or evaluation — never a self-reported claim. Every match comes with the reasoning attached, not a black-box rank. Institutional and industry integrations are opt-in, and student data is shared only with the explicit consent that record requires.
            </p>
          </div>

          {/* Architectural Pillars */}
          <div className="ss-auth-manifesto__pillars">
            <div className="ss-auth-manifesto__pillar-item">
              <span className="pillar-icon">🛡️</span>
              <div className="pillar-content">
                <strong>Verifiable Skill Records</strong>
                <span>Cryptographically secured competency badges & evaluation trails.</span>
              </div>
            </div>
            <div className="ss-auth-manifesto__pillar-item">
              <span className="pillar-icon">📊</span>
              <div className="pillar-content">
                <strong>Curriculum Telemetry</strong>
                <span>Live placement signals & market demand feedback loop for syllabi.</span>
              </div>
            </div>
            <div className="ss-auth-manifesto__pillar-item">
              <span className="pillar-icon">⚖️</span>
              <div className="pillar-content">
                <strong>Transparent Matching</strong>
                <span>Explainable match fit breakdowns with zero black-box bias.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Form & Actions */}
        <div className="ss-auth-column">
          {/* Top Utility Nav */}
          <div className="ss-auth-nav">
            <Link to="/" className="ss-auth-back-link">
              <span>←</span>
              <span>Back to SkillSetu</span>
            </Link>
            <div className="ss-auth-status-indicator">
              <span className="status-dot" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Clean Auth Card */}
          <div className="ss-auth-card">
            <div className="ss-auth-card-top">
              <span className="ss-auth-tag-label">WELCOME BACK</span>
              <span className="ss-auth-tag-pill">Demo Prototype</span>
            </div>

            <h1 className="ss-auth-title">{t("auth_login_title", "Log in")}</h1>
            <p className="ss-auth-subtitle">
              {t("auth_login_subtitle", "Access your skill profile, matches, and dashboard.")}
            </p>

            {error && (
              <div className="alert alert-danger py-2 mb-3 text-start small" style={{ borderRadius: 10 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="text-start">
              {/* Email Input */}
              <div className="ss-input-wrapper">
                <label htmlFor="login-email">{t("auth_email_label", "Email Address")}</label>
                <div className="ss-input-group">
                  <span className="ss-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className="form-control"
                    placeholder="name@example.com"
                    required
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setActiveDemoRole(null);
                    }}
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="ss-input-wrapper">
                <label htmlFor="login-password">{t("auth_password_label", "Password")}</label>
                <div className="ss-input-group">
                  <span className="ss-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="form-control"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      setActiveDemoRole(null);
                    }}
                  />
                  <button
                    type="button"
                    className="ss-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" x2="22" y1="2" y2="22"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Help */}
              <div className="d-flex align-items-center justify-content-between mb-3" style={{ fontSize: "0.8rem" }}>
                <label className="d-flex align-items-center gap-2 mb-0" style={{ cursor: "pointer", color: "#64748b", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: "#667eea", borderRadius: 4 }}
                  />
                  <span>Remember this device</span>
                </label>
                <span
                  style={{ color: "#6366f1", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => alert("For prototype access, use any 1-Click Demo Account below or demo credentials.")}
                >
                  Need help?
                </span>
              </div>

              <button type="submit" className="ss-btn-primary" disabled={submitting}>
                {submitting ? (
                  <span>Signing in…</span>
                ) : (
                  <>
                    <span>{t("auth_btn_login", "Log in")}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Demo Accounts */}
            <div className="ss-demo-divider">
              <span className="line" />
              <span className="text">⚡ 1-Click Demo Accounts</span>
              <span className="line" />
            </div>

            <div className="ss-demo-pills">
              {DEMO_ROLES.map((demo) => {
                const isActive = activeDemoRole?.role === demo.role;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleDemoSelect(demo, true)}
                    disabled={submitting}
                    className={`ss-demo-pill ${isActive ? "is-active" : ""}`}
                    title={`${demo.name} (${demo.role})`}
                  >
                    <span>{demo.icon}</span>
                    <span>{demo.shortTitle || demo.title}</span>
                  </button>
                );
              })}
            </div>

            {activeDemoRole && (
              <div className="ss-demo-selected-banner">
                <span>Selected: <span className="selected-name">{activeDemoRole.name}</span> ({activeDemoRole.shortTitle})</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>Ready</span>
              </div>
            )}

            <p style={{ fontSize: "0.72rem", color: "#94a3b8", textAlign: "center", margin: "0.4rem 0 0" }}>
              {t("demo_pill_hint", "Click any role pill to autofill credentials & sign in directly.")}
            </p>

            {/* Link to Register */}
            <p style={{ fontSize: "0.84rem", color: "#64748b", textAlign: "center", marginTop: "1.35rem", marginBottom: 0 }}>
              {t("auth_no_account", "Don't have an account?")}{" "}
              <Link to="/register" style={{ fontWeight: 700, color: "#4f46e5", textDecoration: "none" }}>
                {t("auth_register_link", "Create an account")}
              </Link>
            </p>
          </div>

          {/* Bottom Bar below Card */}
          <div className="ss-auth-footer-bar">
            <span>© {new Date().getFullYear()} SkillSetu</span>
            <span className="sih-badge">SIH 2026 · Problem Statement 26044</span>
          </div>
        </div>
      </div>
    </div>
  );
}
