import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import LanguageSelector from "../components/ui/LanguageSelector.jsx";

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
    setActiveDemoRole(demo.role);
    setForm({ email: demo.email, password: demo.password });
    if (instantSubmit) {
      executeLogin({ email: demo.email, password: demo.password });
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

      {/* Right — login form */}
      <div className="ss-login-main">
        {/* Top controls */}
        <div className="d-flex justify-content-between align-items-center w-100 mb-4" style={{ maxWidth: 480 }}>
          <Link to="/" className="text-decoration-none small" style={{ color: "var(--muted, #9B9488)" }}>
            ← {t("brand_title", "SkillSetu")}
          </Link>
          <div className="d-flex align-items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        <div className="ss-login-card">
          <div className="ss-login-meta">
            <span className="ss-login-meta__label">{t("auth_welcome_back", "Welcome back")}</span>
            <span className="ss-login-meta__proto">Demo Prototype</span>
          </div>

          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem", color: "inherit" }}>
            {t("auth_login_title", "Sign in to SkillSetu")}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--muted, #9B9488)", marginBottom: "1.5rem" }}>
            {t("auth_login_subtitle", "Access your skill profile, matches, and role dashboard.")}
          </p>

          {error && <div className="alert alert-danger py-2 mb-3" style={{ borderRadius: 12, fontSize: "0.84rem" }}>{error}</div>}

          {/* Manual Form Inputs - Front & Center */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="ss-form-label">{t("auth_email_label", "Email")}</label>
              <input
                type="email"
                className="ss-form-input"
                placeholder="name@example.com"
                required
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setActiveDemoRole(null);
                }}
              />
            </div>
            <div className="mb-4">
              <label className="ss-form-label">{t("auth_password_label", "Password")}</label>
              <input
                type="password"
                className="ss-form-input"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setActiveDemoRole(null);
                }}
              />
            </div>
            <button type="submit" className="btn btn-brass w-100" disabled={submitting}>
              {submitting ? t("auth_logging_in", "Signing in…") : t("auth_btn_login", "Log in")}
            </button>
          </form>

          {/* Elegant Divider */}
          <div className="d-flex align-items-center gap-2 my-4">
            <div className="flex-grow-1" style={{ height: 1, background: "var(--warm-border, #E8E2D8)" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--muted, #9B9488)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⚡ {t("quick_demo_login", "1-Click Demo Accounts")}
            </span>
            <div className="flex-grow-1" style={{ height: 1, background: "var(--warm-border, #E8E2D8)" }} />
          </div>

          {/* Small compact role pill buttons */}
          <div className="ss-demo-pill-group">
            {DEMO_ROLES.map((demo) => {
              const isActive = activeDemoRole === demo.role;
              return (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleDemoSelect(demo, true)}
                  disabled={submitting}
                  className={`ss-demo-pill ${isActive ? "is-active" : ""}`}
                  title={`${demo.name} (${demo.role}) · Click to autofill & log in`}
                >
                  <span className="ss-demo-pill__emoji">{demo.icon}</span>
                  <span className="ss-demo-pill__label">{t(demo.shortTitle || demo.title, demo.shortTitle || demo.title)}</span>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--muted, #9B9488)", textAlign: "center", marginTop: "0.65rem", marginBottom: 0 }}>
            {t("demo_pill_hint", "Click any role pill to autofill credentials & sign in directly.")}
          </p>

          <p style={{ fontSize: "0.82rem", color: "var(--muted, #9B9488)", marginTop: "1.5rem", textAlign: "center", marginBottom: 0 }}>
            {t("auth_no_account", "Need to test a new account?")}{" "}
            <Link to="/register" style={{ fontWeight: 700, color: "var(--gold, #C9A227)" }}>
              {t("auth_register_link", "Register New User")}
            </Link>
          </p>
        </div>

        <div style={{ fontSize: "0.78rem", color: "var(--muted, #9B9488)", marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 480 }}>
          <span>© {new Date().getFullYear()} {t("brand_title", "SkillSetu")}</span>
          <span className="ss-login-meta__proto">{t("landing_sih_title", "SIH 2026")}</span>
        </div>
      </div>
    </div>
  );
}
