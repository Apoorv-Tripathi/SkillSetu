import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../context/LanguageContext.jsx";

// ── Ecosystem Role Data (Specialized Architecture) ──────────────
const ECOSYSTEM_ROLES = [
  {
    id: "students",
    role: "Students",
    badge: "Verifiable Credential",
    badgeType: "student",
    title: "Digital Skill Passport & Verified Career Pathways",
    desc: "Move beyond keyword resumes. Build a tamper-proof competency profile verified through server-side diagnostics, capstone evaluations, and transparent employer match breakdowns.",
    highlights: [
      "Cryptographically verified Skill Passport linked to APAAR ID",
      "Explainable weighted match scoring for campus opportunities",
      "Algorithmic remediation roadmaps to close targeted skill gaps",
    ],
    ctaText: "Build Your Skill Passport",
    ctaLink: "/register",
    kpi: "94% Match Fit",
  },
  {
    id: "academicians",
    role: "Academicians",
    badge: "Curriculum Telemetry",
    badgeType: "academician",
    title: "Real-Time Cohort Telemetry & Curriculum Feedback",
    desc: "Empower faculty and department heads with live competency heatmaps. Identify where cohorts lag behind industry standards and receive data-backed course modernization insights.",
    highlights: [
      "Branch and semester-level competency heatmaps across domains",
      "Direct employer screening signals feeding course revision cycles",
      "Mentor evaluation workflows for real-world capstone reviews",
    ],
    ctaText: "Explore Faculty Telemetry",
    ctaLink: "/register",
    kpi: "Real-Time Gap Radar",
  },
  {
    id: "institutions",
    role: "Institutions",
    badge: "Accreditation Ready",
    badgeType: "institution",
    title: "Placement Intelligence & Multi-Framework Accreditation",
    desc: "Unified governance for campus placements and compliance. Track branch readiness, predict placement outcomes, and generate one-click audit data for NAAC, NBA, and NIRF.",
    highlights: [
      "Centralized campus hiring pipeline with branch-level readiness metrics",
      "One-click audit export for NAAC Criterion 1 & 2 and NIRF outcomes",
      "Full compliance with NEP 2020 credit banks and NCrF levels",
    ],
    ctaText: "Onboard Your Institution",
    ctaLink: "/register",
    kpi: "NAAC / NIRF Exports",
  },
  {
    id: "industry",
    role: "Industry Partners",
    badge: "Threshold Hiring",
    badgeType: "industry",
    title: "Pre-Assessed Talent Pipelines & Rubric Hiring",
    desc: "Eliminate candidate keyword spam and resume hallucination. Filter incoming talent by verified diagnostic thresholds and sponsor capstone projects with direct faculty review.",
    highlights: [
      "Filter applicant pools by verified proficiency scores (1.0 to 5.0)",
      "Structured rubric evaluations replace subjective resume screening",
      "Post live capstone challenges to discover pre-screened talent early",
    ],
    ctaText: "Post Opportunities",
    ctaLink: "/register",
    kpi: "Zero Resume Spam",
  },
];

// ── 4-Stage Connected Workflow ──────────────────────────────────
const WORKFLOW_STEPS = [
  {
    step: "01",
    phase: "Assess",
    title: "Diagnostic Evaluation",
    desc: "Students take multi-dimensional assessments spanning theoretical foundation and practical application. Answer keys are scored server-side.",
    output: "Baseline Proficiency Vector (0.0 - 5.0)",
  },
  {
    step: "02",
    phase: "Benchmark",
    title: "Telemetry Benchmarking",
    desc: "Automated engine maps verified scores against live industry demand and target job requirements to identify exact delta gaps.",
    output: "Explainable Skill Gap Matrix",
  },
  {
    step: "03",
    phase: "Remediate",
    title: "Targeted Interventions",
    desc: "AI study plans, faculty clinics, and recommended peer projects guide students to close identified deficits before campus placement drives.",
    output: "Closed Skill Deficits",
  },
  {
    step: "04",
    phase: "Place & Modernize",
    title: "Explainable Match & Feedback",
    desc: "Candidates connect with verified employers based on demonstrated ability, while hiring signals flow back into academic syllabi.",
    output: "Closed-Loop Curriculum Telemetry",
  },
];

// ── Verification Architecture Pillars ───────────────────────────
const VERIFICATION_PILLARS = [
  {
    title: "Server-Side Scored Diagnostics",
    desc: "Unlike client-side quizzes where answers can be inspected, SkillSetu evaluates all assessments server-side against rigorous multi-tier question banks, ensuring uncompromised integrity.",
    tag: "Integrity",
  },
  {
    title: "Dual-Evidence Triangulation",
    desc: "Competency scores are not single-point guesses. They combine automated diagnostic assessments with faculty-reviewed milestones and industry mentor capstone evaluations.",
    tag: "Explainability",
  },
  {
    title: "Cryptographic Skill Passport",
    desc: "Every verified achievement produces a tamper-evident audit record compatible with the National Academic Depository, APAAR, and DigiLocker for lifelong student portability.",
    tag: "Portability",
  },
];

// ── National Frameworks ─────────────────────────────────────────
const FRAMEWORKS = [
  {
    code: "NEP 2020",
    title: "National Education Policy",
    detail: "Promotes multidisciplinary credit flexibility, holistic skill benchmarking, and industry integration across higher education.",
  },
  {
    code: "NCrF",
    title: "National Credit Framework",
    detail: "Seamlessly maps verified technical and applied competencies into standardized national credit levels (Levels 4.5 through 7.0).",
  },
  {
    code: "ABC",
    title: "Academic Bank of Credits",
    detail: "Prepares verified student competency records for institutional transfer, credit recognition, and multi-entry/multi-exit pathways.",
  },
  {
    code: "APAAR",
    title: "Automated Permanent Academic ID",
    detail: "Integrates with One Nation One Student ID and DigiLocker for instant, verifiable credential verification by enterprise employers.",
  },
];

export default function Landing() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState("students");

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentRole = ECOSYSTEM_ROLES.find((r) => r.id === activeRoleTab) || ECOSYSTEM_ROLES[0];

  return (
    <div className="ss-landing-wrapper">
      {/* ── 1. Sticky Navigation Bar ────────────────────────────── */}
      <header className={`ss-landing-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="container">
          <Link to="/" className="ss-landing-brand">
            <div className="ss-landing-brand__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="ss-landing-brand__text">
              <span className="ss-landing-brand__title">{t("brand_title", "SkillSetu")}</span>
              <span className="ss-landing-brand__sub">{t("brand_subtitle", "Skill Intelligence Platform")}</span>
            </div>
          </Link>

          <nav className="ss-landing-nav-links">
            <a href="#shift">The Shift</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#ecosystem">Ecosystem</a>
            <a href="#verification">Verification</a>
            <a href="#frameworks">Frameworks</a>
          </nav>

          <div className="ss-landing-nav-actions">
            <Link to="/login" className="ss-btn-nav-login">
              {t("landing_login", "Sign In")}
            </Link>
            <Link to="/register" className="ss-btn-nav-cta">
              <span>{t("landing_get_started", "Get Started")}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <button
              type="button"
              className="ss-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className={`ss-mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}>
          <div className="ss-mobile-links">
            <a href="#shift" onClick={() => setMobileMenuOpen(false)}>The Shift</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#ecosystem" onClick={() => setMobileMenuOpen(false)}>Ecosystem</a>
            <a href="#verification" onClick={() => setMobileMenuOpen(false)}>Verification</a>
            <a href="#frameworks" onClick={() => setMobileMenuOpen(false)}>Frameworks</a>
          </div>
          <div className="ss-mobile-actions">
            <Link to="/login" className="ss-btn-nav-login text-center w-100" onClick={() => setMobileMenuOpen(false)}>
              {t("landing_login", "Sign In")}
            </Link>
            <Link to="/register" className="ss-btn-nav-cta justify-content-center w-100" onClick={() => setMobileMenuOpen(false)}>
              {t("landing_get_started", "Get Started")}
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. Confident Asymmetric Split Hero ──────────────────── */}
      <section className="ss-hero-section">
        <div className="container">
          <div className="ss-hero-grid">
            {/* Left Hero Column: Value Proposition */}
            <div className="ss-hero-content">
              <div className="ss-hero-pill">
                <span className="badge-sih">SIH 2026</span>
                <span className="pill-text">Problem Statement 26044 · Academia-Industry Bridge</span>
              </div>

              <h1 className="ss-hero-title">
                The verified skill intelligence layer connecting academia, students, and industry.
              </h1>

              <p className="ss-hero-subtitle">
                SkillSetu replaces self-declared resumes and static academic syllabi with diagnostic skill assessments, verifiable digital portfolios, and real-time curriculum telemetry.
              </p>

              <div className="ss-hero-cta-group">
                <Link to="/register" className="ss-btn-hero-primary">
                  <span>Get Started Free</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link to="/login" className="ss-btn-hero-secondary">
                  <span>Sign In to Portal</span>
                </Link>
              </div>

              <div className="ss-hero-trust-row">
                <div className="trust-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>NEP 2020 & NCrF Aligned</span>
                </div>
                <div className="trust-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>APAAR & DigiLocker Ready</span>
                </div>
                <div className="trust-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>100% Explainable Matching</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Authentic Live SkillSetu Telemetry Card */}
            <div className="ss-hero-preview-col">
              <div className="ss-telemetry-card">
                {/* Preview Header */}
                <div className="ss-telemetry-header">
                  <div className="student-badge">
                    <div className="avatar-disc">AS</div>
                    <div className="student-info">
                      <div className="student-name">
                        <span>Aditi Sharma</span>
                        <span className="verified-check" title="Verified Skill Passport">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </span>
                      </div>
                      <div className="student-sub">B.Tech Computer Science · Batch 2027</div>
                    </div>
                  </div>
                  <div className="apaar-tag">
                    <span className="apaar-label">APAAR ID</span>
                    <span className="apaar-id">9482-****-2027</span>
                  </div>
                </div>

                {/* KPI Metric Strip */}
                <div className="ss-telemetry-metrics">
                  <div className="metric-box">
                    <span className="metric-num text-emerald">89%</span>
                    <span className="metric-label">Verified Score</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-num text-indigo">94%</span>
                    <span className="metric-label">Full-Stack Fit</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-num text-amber">2</span>
                    <span className="metric-label">Remediations</span>
                  </div>
                </div>

                {/* Live Competency Telemetry Bars */}
                <div className="ss-telemetry-bars">
                  <div className="bars-title">
                    <span>Verified Skill Benchmarks</span>
                    <span className="benchmark-legend">
                      <span className="legend-line"></span> Industry Threshold
                    </span>
                  </div>

                  <div className="telemetry-bar-row">
                    <div className="bar-labels">
                      <span className="skill-name">Data Structures & Algorithmic Analysis</span>
                      <span className="skill-score"><strong>4.6</strong> / 5.0</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill fill-emerald" style={{ width: "92%" }}></div>
                      <div className="bar-target" style={{ left: "80%" }} title="Industry Threshold: 4.0"></div>
                    </div>
                  </div>

                  <div className="telemetry-bar-row">
                    <div className="bar-labels">
                      <span className="skill-name">Cloud & Distributed Systems (AWS/Docker)</span>
                      <span className="skill-score"><strong>4.2</strong> / 5.0</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill fill-emerald" style={{ width: "84%" }}></div>
                      <div className="bar-target" style={{ left: "76%" }} title="Industry Threshold: 3.8"></div>
                    </div>
                  </div>

                  <div className="telemetry-bar-row">
                    <div className="bar-labels">
                      <span className="skill-name">System Design & Database Architecture</span>
                      <span className="skill-score text-amber"><strong>3.4</strong> / 5.0 · <span className="delta">+0.6 this sprint</span></span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill fill-amber" style={{ width: "68%" }}></div>
                      <div className="bar-target" style={{ left: "80%" }} title="Industry Threshold: 4.0"></div>
                    </div>
                  </div>

                  <div className="telemetry-bar-row">
                    <div className="bar-labels">
                      <span className="skill-name">React & Modern Frontend Architecture</span>
                      <span className="skill-score"><strong>4.8</strong> / 5.0</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill fill-indigo" style={{ width: "96%" }}></div>
                      <div className="bar-target" style={{ left: "84%" }} title="Industry Threshold: 4.2"></div>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Verification Stamp */}
                <div className="ss-telemetry-stamp">
                  <div className="stamp-left">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Audit Ref: <code>#SIH-2026-AR-8941</code></span>
                  </div>
                  <span className="stamp-status">Cryptographically Signed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. The Shift: Traditional vs SkillSetu ──────────────── */}
      <section id="shift" className="ss-shift-section">
        <div className="container">
          <div className="ss-section-header text-center">
            <span className="ss-section-eyebrow">The Core Problem</span>
            <h2 className="ss-section-heading">Closing the Academia-Industry Disconnect</h2>
            <p className="ss-section-sub">
              India produces 1.5M+ engineers annually, yet employers struggle to find day-one productive talent. Here is how SkillSetu fundamentally restructures the hiring and academic alignment model.
            </p>
          </div>

          <div className="ss-shift-grid">
            {/* The Broken Model */}
            <div className="ss-shift-card broken-model">
              <div className="shift-card-header">
                <span className="shift-badge broken">The Legacy Dilemma</span>
                <h3>Keyword Screening & Static Syllabi</h3>
                <p>Self-reported resumes and decoupled academic curricula create friction, mismatch, and hiring bottlenecks.</p>
              </div>

              <ul className="shift-list broken">
                <li>
                  <span className="cross-icon">✕</span>
                  <div>
                    <strong>Unverified Resume Claims:</strong>
                    <span>Keyword stuffing and inflated bullet points force employers to conduct redundant multi-round basic screenings.</span>
                  </div>
                </li>
                <li>
                  <span className="cross-icon">✕</span>
                  <div>
                    <strong>Black-Box ATS Filtering:</strong>
                    <span>Opaque applicant tracking systems discard talented, non-traditional candidates without any actionable feedback.</span>
                  </div>
                </li>
                <li>
                  <span className="cross-icon">✕</span>
                  <div>
                    <strong>Four-Year Lag in Academic Syllabi:</strong>
                    <span>Curricula cannot keep pace with rapid industry shifts because departments lack real-time recruitment telemetry.</span>
                  </div>
                </li>
                <li>
                  <span className="cross-icon">✕</span>
                  <div>
                    <strong>Fragmented Accreditation Audits:</strong>
                    <span>Institutions spend weeks manually compiling placement outcome data for NAAC, NBA, and NIRF reviews.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* The SkillSetu Model */}
            <div className="ss-shift-card skillsetu-model">
              <div className="shift-card-header">
                <span className="shift-badge solved">The SkillSetu Solution</span>
                <h3>Evidence Telemetry & Closed-Loop Feedback</h3>
                <p>A unified data layer that turns assessed student competency into academic intelligence and verified hiring signals.</p>
              </div>

              <ul className="shift-list solved">
                <li>
                  <span className="check-icon">✓</span>
                  <div>
                    <strong>Diagnostic Proof of Competence:</strong>
                    <span>Server-side scored assessments and faculty-evaluated capstones generate an uncheatable Skill Passport.</span>
                  </div>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <div>
                    <strong>100% Explainable Match Rubrics:</strong>
                    <span>Students and recruiters see exact weighted percentage breakdowns across met skills, developing areas, and specific deficits.</span>
                  </div>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <div>
                    <strong>Continuous Curriculum Telemetry:</strong>
                    <span>Employer screening outcomes directly feed back into faculty dashboards, pinpointing exact syllabus modernization needs.</span>
                  </div>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <div>
                    <strong>Instant Multi-Framework Audit Compliance:</strong>
                    <span>Automated NIRF, NAAC Criterion 1 & 2, and NCrF credit mapping exports with zero administrative overhead.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Connected Workflow Timeline ──────────────────────── */}
      <section id="how-it-works" className="ss-workflow-section">
        <div className="container">
          <div className="ss-section-header text-center">
            <span className="ss-section-eyebrow">Structured Architecture</span>
            <h2 className="ss-section-heading">How SkillSetu Works End-to-End</h2>
            <p className="ss-section-sub">
              A rigorous four-stage pipeline that transforms raw academic progress into verifiable industry readiness and curriculum insight.
            </p>
          </div>

          <div className="ss-workflow-timeline">
            {WORKFLOW_STEPS.map((s, idx) => (
              <div key={s.step} className="ss-workflow-step">
                <div className="step-badge-row">
                  <span className="step-num">{s.step}</span>
                  <span className="step-phase">{s.phase}</span>
                </div>
                <h4 className="step-title">{s.title}</h4>
                <p className="step-desc">{s.desc}</p>
                <div className="step-output">
                  <span className="output-tag">Deliverable</span>
                  <span className="output-val">{s.output}</span>
                </div>
                {idx < WORKFLOW_STEPS.length - 1 && <div className="step-connector" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Multi-Stakeholder Ecosystem ─────────────────────── */}
      <section id="ecosystem" className="ss-ecosystem-section">
        <div className="container">
          <div className="ss-section-header text-center">
            <span className="ss-section-eyebrow">Specialized Toolkits</span>
            <h2 className="ss-section-heading">Built for Every Participant in Education</h2>
            <p className="ss-section-sub">
              SkillSetu provides dedicated, tailored operational interfaces for all four primary stakeholders — ensuring everyone works from a single source of truth.
            </p>
          </div>

          {/* Interactive Role Tabs */}
          <div className="ss-role-tab-nav">
            {ECOSYSTEM_ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`ss-role-tab-btn ${activeRoleTab === r.id ? "is-active" : ""}`}
                onClick={() => setActiveRoleTab(r.id)}
              >
                <span className="tab-label">{r.role}</span>
                <span className="tab-meta">{r.kpi}</span>
              </button>
            ))}
          </div>

          {/* Detailed Role Spotlight Card */}
          <div className="ss-role-spotlight">
            <div className="spotlight-left">
              <div className="spotlight-badge-row">
                <span className={`spotlight-role-badge badge--${currentRole.badgeType}`}>
                  {currentRole.role}
                </span>
                <span className="spotlight-pill">{currentRole.badge}</span>
              </div>
              <h3 className="spotlight-title">{currentRole.title}</h3>
              <p className="spotlight-desc">{currentRole.desc}</p>

              <div className="spotlight-highlights">
                {currentRole.highlights.map((h, i) => (
                  <div key={i} className="highlight-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="spotlight-actions">
                <Link to={currentRole.ctaLink} className="ss-btn-spotlight">
                  <span>{currentRole.ctaText}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link to="/login" className="spotlight-link-secondary">
                  Or sign in to your role portal →
                </Link>
              </div>
            </div>

            <div className="spotlight-right">
              {/* Role-Specific Mock Telemetry Widget */}
              {activeRoleTab === "students" && (
                <div className="role-widget">
                  <div className="widget-header">
                    <span className="widget-title">Digital Skill Passport</span>
                    <span className="widget-status">Verified · DigiLocker Linked</span>
                  </div>
                  <div className="widget-metric-row">
                    <div className="w-metric">
                      <div className="w-label">Validated Competencies</div>
                      <div className="w-val">12 Verified</div>
                    </div>
                    <div className="w-metric">
                      <div className="w-label">Active Campus Fit</div>
                      <div className="w-val text-indigo">94% (Full-Stack)</div>
                    </div>
                  </div>
                  <div className="widget-list">
                    <div className="w-list-item">
                      <span>Algorithms & Core CS</span>
                      <span className="tag-met">4.6 / 5.0 Met</span>
                    </div>
                    <div className="w-list-item">
                      <span>Cloud Architecture</span>
                      <span className="tag-met">4.2 / 5.0 Met</span>
                    </div>
                    <div className="w-list-item">
                      <span>Distributed DBs</span>
                      <span className="tag-dev">3.4 / 5.0 In Remediation</span>
                    </div>
                  </div>
                </div>
              )}

              {activeRoleTab === "academicians" && (
                <div className="role-widget">
                  <div className="widget-header">
                    <span className="widget-title">Cohort Competency Telemetry</span>
                    <span className="widget-status">CSE 6th Sem · 184 Students</span>
                  </div>
                  <div className="widget-metric-row">
                    <div className="w-metric">
                      <div className="w-label">Cohort Proficiency</div>
                      <div className="w-val text-emerald">78.4% Average</div>
                    </div>
                    <div className="w-metric">
                      <div className="w-label">Industry Delta</div>
                      <div className="w-val text-amber">-14% (DevOps)</div>
                    </div>
                  </div>
                  <div className="widget-list">
                    <div className="w-list-item">
                      <span>Full-Stack Development</span>
                      <span className="tag-met">88% Placement Ready</span>
                    </div>
                    <div className="w-list-item">
                      <span>Containerization & CI/CD</span>
                      <span className="tag-gap">Recommended Syllabus Update</span>
                    </div>
                    <div className="w-list-item">
                      <span>System Architecture</span>
                      <span className="tag-dev">Elective Recommended</span>
                    </div>
                  </div>
                </div>
              )}

              {activeRoleTab === "institutions" && (
                <div className="role-widget">
                  <div className="widget-header">
                    <span className="widget-title">Institutional Readiness Dashboard</span>
                    <span className="widget-status">NIRF / NAAC Export Ready</span>
                  </div>
                  <div className="widget-metric-row">
                    <div className="w-metric">
                      <div className="w-label">Overall Placement Readiness</div>
                      <div className="w-val text-indigo">84.6%</div>
                    </div>
                    <div className="w-metric">
                      <div className="w-label">Partner Companies</div>
                      <div className="w-val">48 Active</div>
                    </div>
                  </div>
                  <div className="widget-list">
                    <div className="w-list-item">
                      <span>NAAC Criterion 1 (Curriculum)</span>
                      <span className="tag-met">Audit Report Generated</span>
                    </div>
                    <div className="w-list-item">
                      <span>NIRF Graduate Outcomes (GO)</span>
                      <span className="tag-met">Data Pack Ready</span>
                    </div>
                    <div className="w-list-item">
                      <span>NCrF Credit Transfers</span>
                      <span className="tag-met">1,420 Credits Mapped</span>
                    </div>
                  </div>
                </div>
              )}

              {activeRoleTab === "industry" && (
                <div className="role-widget">
                  <div className="widget-header">
                    <span className="widget-title">Threshold Talent Discovery</span>
                    <span className="widget-status">Zero Resume Screening</span>
                  </div>
                  <div className="widget-metric-row">
                    <div className="w-metric">
                      <div className="w-label">Benchmark Threshold</div>
                      <div className="w-val">Score ≥ 4.0 Required</div>
                    </div>
                    <div className="w-metric">
                      <div className="w-label">Qualified Candidates</div>
                      <div className="w-val text-emerald">34 Pre-Screened</div>
                    </div>
                  </div>
                  <div className="widget-list">
                    <div className="w-list-item">
                      <span>Backend Engineer (Go/Node)</span>
                      <span className="tag-met">18 Met Threshold</span>
                    </div>
                    <div className="w-list-item">
                      <span>Full-Stack React Engineer</span>
                      <span className="tag-met">16 Met Threshold</span>
                    </div>
                    <div className="w-list-item">
                      <span>Capstone Challenge Sponsored</span>
                      <span className="tag-dev">6 Student Teams Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Evidence-Based Verification Architecture ────────── */}
      <section id="verification" className="ss-verification-section">
        <div className="container">
          <div className="ss-section-header text-center">
            <span className="ss-section-eyebrow">Trust & Integrity</span>
            <h2 className="ss-section-heading">The Verification Architecture</h2>
            <p className="ss-section-sub">
              How SkillSetu ensures that every credential, score, and skill badge is mathematically sound, uncheatable, and trusted by enterprise employers.
            </p>
          </div>

          <div className="row g-4">
            {VERIFICATION_PILLARS.map((p, idx) => (
              <div key={idx} className="col-md-4">
                <div className="ss-verification-card">
                  <span className="pillar-tag">{p.tag}</span>
                  <h4 className="pillar-title">{p.title}</h4>
                  <p className="pillar-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. National Frameworks Alignment ───────────────────── */}
      <section id="frameworks" className="ss-frameworks-section">
        <div className="container">
          <div className="ss-frameworks-box">
            <div className="ss-section-header text-center mb-4">
              <span className="ss-section-eyebrow">National Education Architecture</span>
              <h2 className="ss-section-heading">Built for India's Educational Future</h2>
              <p className="ss-section-sub">
                Designed ground-up to support the Ministry of Education guidelines, AICTE recommendations, and India's sovereign digital public infrastructure.
              </p>
            </div>

            <div className="frameworks-grid">
              {FRAMEWORKS.map((f) => (
                <div key={f.code} className="framework-card">
                  <div className="framework-code">{f.code}</div>
                  <div className="framework-name">{f.title}</div>
                  <div className="framework-detail">{f.detail}</div>
                </div>
              ))}
            </div>

            <div className="frameworks-footer">
              <span className="compliance-dot"></span>
              <span>Smart India Hackathon 2026 · Problem Statement 26044 Implementation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Simple, Dignified Call-to-Action ────────────────── */}
      <section className="ss-cta-section">
        <div className="container">
          <div className="ss-cta-card">
            <h2 className="cta-heading">Ready to bridge the skills divide?</h2>
            <p className="cta-sub">
              Join students, academic leaders, institutional administrators, and hiring teams on India's verified skill intelligence platform.
            </p>
            <div className="cta-button-row">
              <Link to="/register" className="ss-btn-cta-primary">
                <span>Create an Account</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/login" className="ss-btn-cta-secondary">
                <span>Sign In to Portal</span>
              </Link>
            </div>
            <div className="cta-demo-hint">
              <span className="hint-title">Demo Logins Available:</span>
              <code className="demo-chip">student@demo.skillsetu.local</code>
              <span className="demo-divider">·</span>
              <code className="demo-chip">industry@demo.skillsetu.local</code>
              <span className="demo-divider">·</span>
              <code className="demo-chip">admin@demo.skillsetu.local</code>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Cohesive Platform Footer ───────────────────────── */}
      <footer className="ss-landing-footer">
        <div className="container">
          <div className="footer-top-row">
            <div className="footer-brand-col">
              <div className="ss-landing-brand">
                <div className="ss-landing-brand__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className="ss-landing-brand__text">
                  <span className="ss-landing-brand__title">{t("brand_title", "SkillSetu")}</span>
                  <span className="ss-landing-brand__sub">{t("brand_subtitle", "Skill Intelligence Platform")}</span>
                </div>
              </div>
              <p className="footer-mission">
                The unified evidence layer connecting academia, students, and industry with diagnostic assessments, verified skill passports, and curriculum telemetry.
              </p>
            </div>

            <div className="footer-nav-col">
              <h5 className="footer-col-head">Platform</h5>
              <ul className="footer-link-list">
                <li><Link to="/register">Skill Passport</Link></li>
                <li><Link to="/register">Diagnostic Assessments</Link></li>
                <li><Link to="/register">Curriculum Telemetry</Link></li>
                <li><Link to="/register">Opportunity Matcher</Link></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h5 className="footer-col-head">Ecosystem</h5>
              <ul className="footer-link-list">
                <li><a href="#ecosystem" onClick={() => setActiveRoleTab("students")}>For Students</a></li>
                <li><a href="#ecosystem" onClick={() => setActiveRoleTab("academicians")}>For Academicians</a></li>
                <li><a href="#ecosystem" onClick={() => setActiveRoleTab("institutions")}>For Institutions</a></li>
                <li><a href="#ecosystem" onClick={() => setActiveRoleTab("industry")}>For Industry Partners</a></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h5 className="footer-col-head">Compliance</h5>
              <ul className="footer-link-list">
                <li><a href="#frameworks">NEP 2020 Guidelines</a></li>
                <li><a href="#frameworks">NCrF Credit Mapping</a></li>
                <li><a href="#frameworks">Academic Bank of Credits</a></li>
                <li><a href="#frameworks">APAAR / DigiLocker</a></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h5 className="footer-col-head">Portals</h5>
              <ul className="footer-link-list">
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Create Account</Link></li>
                <li><a href="#shift">The Shift</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-row">
            <div className="footer-copyright">
              © 2026 SkillSetu · Smart India Hackathon 2026 · Problem Statement 26044
            </div>
            <div className="footer-status">
              <span className="status-pip"></span>
              <span>All Telemetry & Verification Services Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

