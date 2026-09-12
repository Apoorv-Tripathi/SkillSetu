import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";

const ROLES = [
  { value: "student", label: "Student", icon: "🎓", desc: "Diagnostic assessments, verified skill profile, career roadmap" },
  { value: "academician", label: "Academician / Faculty", icon: "🔬", desc: "Curriculum alignment, syllabi telemetry & skill-gap analytics" },
  { value: "institution_admin", label: "Institution Admin (Dean / TPO)", icon: "🏛️", desc: "Placement readiness, accreditation insights & cohort telemetry" },
  { value: "industry", label: "Industry Partner / Employer", icon: "💼", desc: "Post verified openings & discover evaluated candidates" },
  { value: "recruiter", label: "Recruiter / Talent Acquisition", icon: "🎯", desc: "Targeted candidate shortlisting & assessment review" },
  { value: "mentor", label: "Industry Mentor / Expert", icon: "🧭", desc: "Live project evaluations & industry mentorship" },
  { value: "platform_admin", label: "Platform Administrator", icon: "⚙️", desc: "Global taxonomy governance & framework verification" },
];

function getPasswordStrength(password) {
  if (!password) return { score: 0, text: "", class: "", labelClass: "" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, text: "Weak", class: "is-weak", labelClass: "weak" };
  if (score === 2) return { score: 2, text: "Fair", class: "is-fair", labelClass: "fair" };
  if (score === 3) return { score: 3, text: "Good", class: "is-good", labelClass: "good" };
  return { score: 4, text: "Strong", class: "is-strong", labelClass: "strong" };
}

export default function Register() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    institutionName: "",
    companyName: "",
    bio: "",
    department: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pwStrength = getPasswordStrength(form.password);
  const activeRoleMeta = ROLES.find((r) => r.value === form.role) || ROLES[0];

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!agreedTerms) {
      setError("Please agree to the platform Terms of Service to create an account.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      };

      if (["student", "academician", "institution_admin"].includes(form.role) && form.institutionName?.trim()) {
        payload.institutionName = form.institutionName.trim();
      }
      if (["industry", "recruiter"].includes(form.role) && form.companyName?.trim()) {
        payload.companyName = form.companyName.trim();
      }
      if (form.role === "academician" && form.department?.trim()) {
        payload.department = form.department.trim();
      }
      if (form.role === "mentor" && form.bio?.trim()) {
        payload.bio = form.bio.trim();
      }

      const { token, user } = await api.register(payload);
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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

          {/* Clean Register Card */}
          <div className="ss-auth-card">
            <div className="ss-auth-card-top">
              <span className="ss-auth-tag-label">JOIN SKILLSETU</span>
              <span className="ss-auth-tag-pill">SIH 2026</span>
            </div>

            <h1 className="ss-auth-title">{t("auth_register_title", "Create an account")}</h1>
            <p className="ss-auth-subtitle">
              Choose your institutional or industry role to access tailored telemetry and verification tools.
            </p>

            {error && (
              <div className="alert alert-danger py-2 mb-3 text-start small" style={{ borderRadius: 10 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="text-start">
              {/* Role Selector */}
              <div className="ss-input-wrapper">
                <label htmlFor="reg-role">
                  <span>I am registering as</span>
                  <span className="label-hint">{activeRoleMeta.icon} {activeRoleMeta.label}</span>
                </label>
                <div className="ss-input-group">
                  <span className="ss-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <select
                    id="reg-role"
                    className="form-select"
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.icon} {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Full Name */}
              <div className="ss-input-wrapper">
                <label htmlFor="reg-name">{t("auth_full_name", "Full Name")}</label>
                <div className="ss-input-group">
                  <span className="ss-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="5"/>
                      <path d="M20 21a8 8 0 0 0-16 0"/>
                    </svg>
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    className="form-control"
                    placeholder="e.g. Aditi Sharma"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="ss-input-wrapper">
                <label htmlFor="reg-email">{t("auth_email", "Email Address")}</label>
                <div className="ss-input-group">
                  <span className="ss-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    className="form-control"
                    placeholder="name@example.com"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
              </div>

              {/* Password with Show/Hide and Strength Meter */}
              <div className="ss-input-wrapper">
                <label htmlFor="reg-password">
                  <span>{t("auth_password", "Password")}</span>
                  <span className="label-hint">Min 8 characters</span>
                </label>
                <div className="ss-input-group">
                  <span className="ss-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="form-control"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
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

              {/* Password Strength Meter */}
              {form.password && (
                <div className="ss-pw-meter">
                  <div className="ss-pw-meter__bars">
                    <div className={`ss-pw-meter__bar ${pwStrength.score >= 1 ? pwStrength.class : ""}`} />
                    <div className={`ss-pw-meter__bar ${pwStrength.score >= 2 ? pwStrength.class : ""}`} />
                    <div className={`ss-pw-meter__bar ${pwStrength.score >= 3 ? pwStrength.class : ""}`} />
                    <div className={`ss-pw-meter__bar ${pwStrength.score >= 4 ? pwStrength.class : ""}`} />
                  </div>
                  <div className="ss-pw-meter__label">
                    <span>Password strength</span>
                    <span className={`strength-text ${pwStrength.labelClass}`}>{pwStrength.text}</span>
                  </div>
                </div>
              )}

              {/* Dynamic Contextual Fields */}
              {["student", "academician", "institution_admin"].includes(form.role) && (
                <div className="ss-input-wrapper">
                  <label htmlFor="reg-inst">{t("auth_institution_name", "Institution Name")}</label>
                  <div className="ss-input-group">
                    <span className="ss-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </span>
                    <input
                      id="reg-inst"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rajendra Institute of Technology"
                      value={form.institutionName}
                      onChange={(e) => update("institutionName", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {["industry", "recruiter"].includes(form.role) && (
                <div className="ss-input-wrapper">
                  <label htmlFor="reg-comp">{t("auth_company_name", "Company Name")}</label>
                  <div className="ss-input-group">
                    <span className="ss-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    </span>
                    <input
                      id="reg-comp"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Vertex Systems Inc."
                      required
                      value={form.companyName}
                      onChange={(e) => update("companyName", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {form.role === "academician" && (
                <div className="ss-input-wrapper">
                  <label htmlFor="reg-dept">{t("auth_department", "Academic Department")}</label>
                  <div className="ss-input-group">
                    <span className="ss-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                        <path d="M6 6h10"/>
                        <path d="M6 10h10"/>
                      </svg>
                    </span>
                    <input
                      id="reg-dept"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Computer Science & Engineering"
                      value={form.department}
                      onChange={(e) => update("department", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {form.role === "mentor" && (
                <div className="ss-input-wrapper">
                  <label htmlFor="reg-bio">{t("auth_mentor_bio", "Area of Expertise / Bio")}</label>
                  <div className="ss-input-group">
                    <span className="ss-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" x2="12" y1="8" y2="12"/>
                        <line x1="12" x2="12.01" y1="16" y2="16"/>
                      </svg>
                    </span>
                    <input
                      id="reg-bio"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Senior Cloud Architect with 10+ yrs industry experience"
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Data Sovereignty Agreement */}
              <div className="mb-3" style={{ fontSize: "0.8rem" }}>
                <label className="d-flex align-items-start gap-2 mb-0" style={{ cursor: "pointer", color: "#64748b", fontWeight: 450 }}>
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    style={{ accentColor: "#667eea", marginTop: "0.2rem" }}
                  />
                  <span>
                    I agree to SkillSetu Terms of Service & Privacy Protocol under NEP 2020 student data sovereignty standards.
                  </span>
                </label>
              </div>

              <button type="submit" className="ss-btn-primary" disabled={submitting}>
                {submitting ? (
                  <span>Creating account…</span>
                ) : (
                  <>
                    <span>{t("auth_btn_register", "Create Account")}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Link to Login */}
            <p style={{ fontSize: "0.84rem", color: "#64748b", textAlign: "center", marginTop: "1.35rem", marginBottom: 0 }}>
              {t("auth_have_account", "Already have an account?")}{" "}
              <Link to="/login" style={{ fontWeight: 700, color: "#4f46e5", textDecoration: "none" }}>
                {t("auth_login_link", "Log in")}
              </Link>
            </p>
          </div>

          {/* Bottom Bar below Card */}
          <div className="ss-auth-footer-bar">
            <span>© {new Date().getFullYear()} SkillSetu. Built for India.</span>
            <span className="sih-badge">SIH 2026 · Problem Statement 26044</span>
          </div>
        </div>
      </div>
    </div>
  );
}
