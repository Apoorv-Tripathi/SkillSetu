import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SkillBar from "../components/ui/SkillBar.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import LanguageSelector from "../components/ui/LanguageSelector.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";

const HERO_PREVIEW = [
  { name: "React", current: 4, target: 3.5, status: "met" },
  { name: "System Design", current: 2, target: 3.5, status: "gap" },
  { name: "SQL", current: 3, target: 3, status: "met" },
  { name: "Communication", current: 2.5, target: 3.5, status: "developing" },
];

const PROBLEMS = [
  {
    key: "1",
    title: "Fragmented systems",
    copy: "TPO cells run placement drives off spreadsheets, AICTE and NCS handle their own slices, and Internshala/Unstop handle listings — none of them talk to each other or to the institution's own records.",
  },
  {
    key: "2",
    title: "Self-declared skills",
    copy: "A resume claiming \"proficient in React\" carries no more weight than a checkbox. Recruiters still have to re-verify everything from scratch in every interview loop.",
  },
  {
    key: "3",
    title: "No feedback loop",
    copy: "When graduates consistently fall short on a skill, that signal rarely makes it back to the HOD or the curriculum committee in a form they can act on.",
  },
  {
    key: "4",
    title: "Opaque matching",
    copy: "Existing portals surface a list of jobs. None of them tell a student why they were or weren't a fit — so there's nothing concrete to improve.",
  },
];

const FLOW = [
  ["01", "landing_step_1_title", "landing_step_1_copy", "Assess", "Structured, skill-mapped assessments — not self-reporting."],
  ["02", "landing_step_2_title", "landing_step_2_copy", "Gap", "A per-skill proficiency score against what target roles require."],
  ["03", "landing_step_3_title", "landing_step_3_copy", "Learn", "Targeted resources and faculty-led sessions closing the specific gap."],
  ["04", "landing_step_4_title", "landing_step_4_copy", "Match", "Opportunities ranked by fit, with the reasoning shown alongside."],
  ["05", "landing_step_5_title", "landing_step_5_copy", "Apply", "Apply with a verified profile instead of a static resume."],
  ["06", "landing_step_6_title", "landing_step_6_copy", "Evaluate", "Mentors submit real evaluations that update the profile live."],
  ["07", "landing_step_7_title", "landing_step_7_copy", "Placed", "Results feed back into the skill graph and the curriculum loop."],
];

const ROLES = [
  {
    id: "for-students",
    key: "students",
    name: "Students",
    copy: "A verified skill profile, a clear gap-to-target-role view, and matches that explain themselves instead of a ranked list of guesses.",
  },
  {
    id: "for-academicians",
    key: "academicians",
    name: "Academicians",
    copy: "Visibility into where their students actually stand, plus a marketplace for FDPs, consultancy, and live industry projects.",
  },
  {
    id: "for-industry",
    key: "industry",
    name: "Industry",
    copy: "Post roles against real proficiency requirements and get candidates pre-filtered by verified skill, not keyword match.",
  },
  {
    id: "for-institutions",
    key: "institutions",
    name: "Institutions",
    copy: "Branch- and cohort-level dashboards that turn placement outcomes into concrete curriculum input.",
  },
];

export default function Landing() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="ss-landing-wrapper">
      {/* Header / Nav */}
      <nav className={`ss-navbar navbar navbar-expand-lg py-3${scrolled ? " is-scrolled" : ""}`}>
        <div className="container">
          <a className="ss-brand-pill me-3" href="#top">
            <span className="ss-brand-pill__dot" />
            <span>{t("brand_title", "SkillSetu")}</span>
          </a>
          <div className="d-none d-lg-flex align-items-center gap-4">
            <a className="nav-link" href="#problem">{t("landing_nav_problem", "Problem")}</a>
            <a className="nav-link" href="#solution">{t("landing_nav_solution", "Solution")}</a>
            <a className="nav-link" href="#how-it-works">{t("landing_nav_how_it_works", "How It Works")}</a>
            <a className="nav-link" href="#for-students">{t("landing_nav_students", "Students")}</a>
            <a className="nav-link" href="#for-institutions">{t("landing_nav_institutions", "Institutions")}</a>
            <a className="nav-link" href="#for-industry">{t("landing_nav_industry", "Industry")}</a>
          </div>
          <div className="d-flex align-items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Link to="/login" className="btn btn-outline-secondary btn-sm">{t("landing_login", "Log in")}</Link>
            <Link to="/register" className="btn btn-brass btn-sm">{t("landing_get_started", "Get Started")}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="top" className="ss-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="ss-eyebrow">{t("landing_eyebrow")}</span>
              <h1 className="display-5 mt-3 mb-3">
                {t("landing_title")}
              </h1>
              <p className="lead text-secondary mb-4">
                {t("landing_subtitle")}
              </p>
              <div className="d-flex gap-3">
                <Link to="/register" className="btn btn-brass btn-lg px-4">{t("landing_get_started")}</Link>
                <a href="#how-it-works" className="btn btn-outline-secondary btn-lg px-4">{t("landing_see_how")}</a>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="ss-panel">
                <div className="ss-panel__head">
                  <span className="ss-eyebrow">{t("landing_snapshot_title", "Skill-gap snapshot")}</span>
                  <span className="small text-secondary">{t("landing_snapshot_live", "Live preview")}</span>
                </div>
                <div className="ss-panel__body">
                  {HERO_PREVIEW.map((row) => (
                    <SkillBar key={row.name} {...row} />
                  ))}
                  <p className="small text-secondary mt-3 mb-0">
                    {t("landing_snapshot_copy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* The Problem */}
      <section id="problem" className="ss-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <div className="ss-accent-rule" />
              <h2 className="h3">{t("landing_problem_headline")}</h2>
            </div>
            <div className="col-lg-7">
              <div className="d-flex flex-column">
                {PROBLEMS.map((p, i) => (
                  <div
                    key={p.title}
                    className="py-3 border-top"
                    style={{ borderColor: "var(--border-color, #E2E8F0)" }}
                  >
                    <h3 className="h6 mb-1">{t(`landing_problem_${p.key}_title`, p.title)}</h3>
                    <p className="text-secondary small mb-0">{t(`landing_problem_${p.key}_copy`, p.copy)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="ss-section ss-section--muted">
        <div className="container">
          <div className="ss-accent-rule" />
          <h2 className="h3 mb-5">{t("landing_how_it_works_title")}</h2>
          <div className="ss-flow">
            {FLOW.map(([num, titleKey, copyKey, fallbackTitle, fallbackCopy]) => (
              <div className="ss-flow__step" key={num}>
                <div className="ss-flow__num">{num}</div>
                <h3 className="h6">{t(titleKey, fallbackTitle)}</h3>
                <p className="small text-secondary mb-0">{t(copyKey, fallbackCopy)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="solution" className="ss-section">
        <div className="container">
          <div className="ss-accent-rule" />
          <h2 className="h3 mb-2">{t("landing_comparison_title")}</h2>
          <p className="text-secondary mb-4">
            {t("landing_comparison_subtitle")}
          </p>
          <div className="table-responsive">
            <table className="table ss-table-compare mb-0">
              <thead>
                <tr>
                  <th>{t("landing_col_capability")}</th>
                  <th>{t("landing_col_skillsetu")}</th>
                  <th>{t("landing_col_aicte")}</th>
                  <th>{t("landing_col_ncs")}</th>
                  <th>{t("landing_col_internshala")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("landing_row_1")}</td>
                  <td><span className="badge bg-success">{t("landing_yes")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                </tr>
                <tr>
                  <td>{t("landing_row_2")}</td>
                  <td><span className="badge bg-success">{t("landing_yes")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="badge bg-warning text-dark">{t("landing_partial")}</span></td>
                </tr>
                <tr>
                  <td>{t("landing_row_3")}</td>
                  <td><span className="badge bg-success">{t("landing_yes")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                </tr>
                <tr>
                  <td>{t("landing_row_4")}</td>
                  <td><span className="badge bg-success">{t("landing_yes")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                </tr>
                <tr>
                  <td>{t("landing_row_5")}</td>
                  <td><span className="badge bg-success">{t("landing_yes")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                  <td><span className="text-muted">{t("landing_no")}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Role value blocks */}
      <section className="ss-section ss-section--muted">
        <div className="container">
          <div className="ss-accent-rule" />
          <h2 className="h3 mb-5">{t("landing_roles_title")}</h2>
          <div className="row">
            <div className="col-lg-10">
              {ROLES.map((role) => (
                <div
                  key={role.id}
                  id={role.id}
                  className="row py-4 align-items-baseline border-top"
                  style={{ borderColor: "var(--border-color, #E2E8F0)" }}
                >
                  <div className="col-md-3">
                    <h3 className="h5 mb-0">{t(`landing_role_${role.key}`, role.name)}</h3>
                  </div>
                  <div className="col-md-9">
                    <p className="text-secondary small mb-0">{t(`landing_role_${role.key}_copy`, role.copy)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="ss-section">
        <div className="container">
          <div className="row g-5 align-items-start">
            <div className="col-lg-5">
              <div className="ss-accent-rule" />
              <h2 className="h3">{t("landing_trust_title")}</h2>
            </div>
            <div className="col-lg-7">
              <p className="text-secondary">
                {t("landing_trust_copy")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIH Problem Statement */}
      <section className="ss-section ss-section--muted">
        <div className="container">
          <div className="ss-accent-rule" />
          <h2 className="h3">{t("landing_sih_title")}</h2>
          <p className="text-secondary mb-0">
            {t("landing_sih_copy")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="ss-footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h3 className="h5 text-white">{t("brand_title", "SkillSetu")}</h3>
              <p className="small text-muted mb-0">
                {t("landing_footer_desc")}
              </p>
            </div>
            <div className="col-md-4">
              <h4 className="h6 text-white">{t("landing_footer_product", "Product")}</h4>
              <ul className="list-unstyled small mb-0 d-flex flex-column gap-1">
                <li><a href="#problem" className="text-decoration-none text-muted">{t("landing_nav_problem")}</a></li>
                <li><a href="#how-it-works" className="text-decoration-none text-muted">{t("landing_nav_how_it_works")}</a></li>
                <li><a href="#solution" className="text-decoration-none text-muted">{t("landing_nav_solution")}</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h4 className="h6 text-white">{t("landing_get_started", "Get started")}</h4>
              <div className="d-flex gap-2 mt-2">
                <Link to="/register" className="btn btn-brass btn-sm">{t("landing_get_started")}</Link>
                <Link to="/login" className="btn btn-outline-light btn-sm">{t("landing_login")}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
