import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import LanguageSelector from "../components/ui/LanguageSelector.jsx";

const ROLES = [
  { value: "student", labelKey: "role_student", defaultLabel: "Student" },
  { value: "academician", labelKey: "role_academician", defaultLabel: "Academician / Technician" },
  { value: "institution_admin", labelKey: "role_institution_admin", defaultLabel: "Institution (Admin / TPO)" },
  { value: "industry", labelKey: "role_industry", defaultLabel: "Industry / Employer" },
];

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
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await api.register(form);
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ss-login-wrapper">
      {/* Left aside — visible on desktop */}
      <div className="ss-login-aside">
        <Link to="/" className="text-decoration-none" style={{ color: "inherit" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.3rem", marginBottom: "2.5rem" }}>
            {t("brand_title", "SkillSetu")}
          </h2>
        </Link>
        <div>
          <div className="ss-accent-rule" />
          <p className="ss-login-aside__quote">
            {t("landing_trust_copy", "Every score traces back to an assessment, project, or evaluation — never a self-reported claim.")}
          </p>
        </div>
        <p className="ss-login-aside__footer">
          {t("landing_sih_title", "SIH 2026 — Problem Statement 26044")}
        </p>
      </div>

      {/* Right form container */}
      <div className="ss-login-main">
        {/* Top Controls */}
        <div className="d-flex justify-content-between align-items-center w-100 mb-4" style={{ maxWidth: 520 }}>
          <Link to="/" className="text-decoration-none small" style={{ color: "var(--muted, #9B9488)" }}>
            ← {t("brand_title", "SkillSetu")}
          </Link>
          <div className="d-flex align-items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        <div className="ss-register-card" style={{ maxWidth: 520 }}>
          <div className="ss-login-meta">
            <span className="ss-eyebrow mb-0">{t("nav_register", "Join SkillSetu")}</span>
            <span className="ss-login-meta__proto">SIH 2026</span>
          </div>

          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            {t("auth_register_title", "Create an account")}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--muted, #9B9488)", marginBottom: "1.5rem" }}>
            {t("auth_register_subtitle", "Student, Academician, Industry, Recruiter, Institution Admin, and Mentor roles are supported.")}
          </p>

          {error && <div className="alert alert-danger py-2" style={{ borderRadius: 12 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="ss-form-label">{t("auth_role_label", "I am a")}</label>
              <select className="form-select" value={form.role} onChange={(e) => update("role", e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t(r.labelKey, r.defaultLabel)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="ss-form-label">{t("auth_full_name", "Full Name")}</label>
              <input className="ss-form-input" required value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="ss-form-label">{t("auth_email", "Email")}</label>
              <input type="email" className="ss-form-input" required value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="ss-form-label">{t("auth_password", "Password")}</label>
              <input
                type="password"
                className="ss-form-input"
                minLength={8}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>

            {(form.role === "student" || form.role === "academician") && (
              <div className="mb-3">
                <label className="ss-form-label">{t("auth_institution_name", "Institution Name")}</label>
                <input
                  className="ss-form-input"
                  placeholder="e.g. Rajendra Institute of Technology"
                  value={form.institutionName}
                  onChange={(e) => update("institutionName", e.target.value)}
                />
              </div>
            )}

            {form.role === "academician" && (
              <div className="mb-3">
                <label className="ss-form-label">{t("auth_department", "Department / Branch")}</label>
                <input
                  className="ss-form-input"
                  required
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                />
              </div>
            )}

            {form.role === "institution_admin" && (
              <div className="mb-3">
                <label className="ss-form-label">{t("auth_institution_name", "Institution Name")}</label>
                <input
                  className="ss-form-input"
                  required
                  placeholder="e.g. All India Institute of Ayurveda (AIIA)"
                  value={form.institutionName}
                  onChange={(e) => update("institutionName", e.target.value)}
                />
              </div>
            )}

            {form.role === "industry" && (
              <div className="mb-3">
                <label className="ss-form-label">{t("auth_company_name", "Company Name")}</label>
                <input className="ss-form-input" required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
              </div>
            )}

            <button type="submit" className="btn btn-brass w-100 mt-3" disabled={submitting}>
              {submitting ? t("auth_creating", "Creating account…") : t("auth_btn_register", "Create Account")}
            </button>
          </form>

          <p style={{ fontSize: "0.82rem", color: "var(--muted, #9B9488)", marginTop: "1.25rem", textAlign: "center" }}>
            {t("auth_has_account", "Already have an account?")}{" "}
            <Link to="/login" style={{ fontWeight: 700, color: "var(--gold, #C9A227)" }}>
              {t("auth_btn_login", "Log in")}
            </Link>
          </p>
        </div>

        <div style={{ fontSize: "0.78rem", color: "var(--muted, #9B9488)", marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 520 }}>
          <span>{t("footer_rights", "© 2026 SkillSetu. Built for India.")}</span>
          <span className="ss-login-meta__proto">{t("landing_sih_title", "SIH 2026")}</span>
        </div>
      </div>
    </div>
  );
}
