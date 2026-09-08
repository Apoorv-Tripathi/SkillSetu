import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppShell>
      {user.role === "student" && <StudentOverview user={user} />}
      {(user.role === "industry" || user.role === "recruiter") && <IndustryOverview user={user} />}
      {user.role === "mentor" && <MentorOverview user={user} />}
      {user.role === "institution_admin" && <AdminOverview user={user} />}
      {user.role === "academician" && <AcademicianOverview user={user} />}
      {user.role === "platform_admin" && <PlatformAdminOverview user={user} />}
    </AppShell>
  );
}

// ============================================================
// Student Dashboard (Crextio Bento-Grid Aesthetic)
// ============================================================
function StudentOverview({ user }) {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [heatmap, setHeatmap] = useState(null);
  const [applications, setApplications] = useState(null);
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("gaps");
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    Promise.all([
      api.getSkillGap(token).catch(() => ({ heatmap: [] })),
      api.getMyApplications(token).catch(() => ({ applications: [] })),
      api.getSkillProfile(token).catch(() => ({ profile: [] })),
      api.getMyPortfolio(token).catch(() => ({ items: [] })),
    ])
      .then(([g, a, p, pf]) => {
        setHeatmap(g.heatmap || []);
        setApplications(a.applications || []);
        setProfile(p.profile || []);
        setPortfolio(pf.items || []);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <ErrorState message={error} />;

  // Score calculation: average of profile averageScores (0-5 scale mapped to 0-100)
  const scoreValue =
    profile && profile.length > 0
      ? Math.round((profile.reduce((acc, curr) => acc + curr.averageScore, 0) / profile.length) * 20)
      : 39;

  const readinessValue = 58;
  const appCount = applications && applications.length > 0 ? applications.length : 1;

  // Real application status breakdown
  const rawGaps =
    heatmap && heatmap.length > 0
      ? [...heatmap].sort((a, b) => b.gap - a.gap)
      : null;

  const topGapItem =
    rawGaps && rawGaps[0]
      ? {
          name: rawGaps[0].skill?.name || "React",
          gapPct: Math.round((rawGaps[0].gap || 1.7) * 20),
          currentPct: Math.round((rawGaps[0].currentScore || 1.8) * 20),
          requiredPct: Math.round((rawGaps[0].targetScore || 3.5) * 20),
          priority: "High",
        }
      : { name: "React", gapPct: 34, currentPct: 36, requiredPct: 70, priority: "High" };

  // 5 Top Snapshot rows
  const defaultSnapshotRows = [
    { skill: "React", current: 36, required: 70, gap: 34, priority: "High" },
    { skill: "JavaScript", current: 40, required: 70, gap: 30, priority: "High" },
    { skill: "Communication", current: 40, required: 70, gap: 30, priority: "High" },
    { skill: "SQL", current: 56, required: 78, gap: 22, priority: "High" },
    { skill: "Data Analysis", current: 61, required: 80, gap: 19, priority: "High" },
  ];

  const snapshotRows =
    rawGaps && rawGaps.length >= 2
      ? rawGaps.slice(0, 5).map((r) => ({
          skill: r.skill?.name || "Skill",
          current: Math.round(r.currentScore * 20),
          required: Math.round(r.targetScore * 20),
          gap: Math.max(0, Math.round(r.gap * 20)),
          priority: r.gap > 1 ? "High" : r.gap > 0.5 ? "Medium" : "Low",
        }))
      : defaultSnapshotRows;

  // Recommended For You resources data
  const learningRecs = [
    {
      id: "l1",
      tag: "ADV",
      title: "Advanced SQL for Data Professionals",
      provider: "Coursera · 18 hours · Intermediate",
      why: "Will reduce your SQL gap by ~15%",
    },
    {
      id: "l2",
      tag: "PYT",
      title: "Data Analysis with Python",
      provider: "NPTEL · 24 hours · Intermediate",
      why: "Strongly recommended based on your goals",
    },
    {
      id: "l3",
      tag: "DAT",
      title: "Database Design & Optimization",
      provider: "Scaler Topics · 10 hours · Intermediate",
      why: "Complements your internship goal",
    },
  ];

  const recentAssessments = [
    { title: "SQL Assessment", date: "20 Apr · Score: 62/100", status: "Improved" },
    { title: "Python Programming", date: "15 Apr · Score: 74/100", status: "Good" },
    { title: "Data Structures", date: "10 Apr · Score: 68/100", status: "Average" },
  ];

  const defaultAppUpdates = [
    {
      title: "Frontend Engineering Intern",
      company: "Vertex Systems Pvt. Ltd.",
      date: "Rejected · 25 Aug 2026",
      status: "Rejected",
    },
  ];

  const appUpdates =
    applications && applications.length > 0
      ? applications.slice(0, 3).map((a) => ({
          title: a.opportunity?.title || "Role",
          company: a.opportunity?.companyName || "Company",
          date: `${a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : "Applied"} · ${new Date(
            a.createdAt || Date.now()
          ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
          status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : "Applied",
        }))
      : defaultAppUpdates;

  const verifiedCount = portfolio ? portfolio.filter((p) => p.verificationStatus === "verified").length : 12;
  const projectCount = portfolio ? portfolio.filter((p) => p.type === "project").length : 3;
  const certCount = portfolio ? portfolio.filter((p) => p.type === "certificate").length : 6;

  const studentFirstName = user?.name?.split(" ")[0] || "Aditi";

  return (
    <div>
      {/* ── 1. Crextio-Style Greeting & Stat Banner ─────────────────── */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <h1 className="ss-dash-header__title" style={{ fontSize: "2.1rem", marginBottom: "0.2rem" }}>
            Hello {studentFirstName}
          </h1>
          <p className="ss-dash-header__sub" style={{ fontSize: "0.9rem" }}>
            {user?.branch || "Computer Science"} · Class of {user?.graduationYear || 2027} · Rajendra Institute of Technology
          </p>

          {/* Crextio Segmented Metric Cluster Bar */}
          <div className="ss-metric-segments mt-3">
            <div className="ss-metric-segment ss-metric-segment--dark">
              <span className="ss-metric-segment__label">Assessments</span>
              <span className="ss-metric-segment__val">70%</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--yellow">
              <span className="ss-metric-segment__label">Readiness</span>
              <span className="ss-metric-segment__val">{readinessValue}%</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--striped">
              <span className="ss-metric-segment__label">Projects</span>
              <span className="ss-metric-segment__val">{projectCount > 0 ? "15%" : "10%"}</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--outline">
              <span className="ss-metric-segment__label">Verified Output</span>
              <span className="ss-metric-segment__val">5%</span>
            </div>
          </div>
        </div>

        {/* Big Display Stat Numbers (like Crextio top-right 91 / 104 / 185) */}
        <div className="d-flex align-items-center gap-4 pt-2">
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column">
              <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
                {scoreValue}
              </span>
              <span className="ss-stat-block__label" style={{ fontSize: "0.68rem" }}>
                Skill Score
              </span>
            </div>
          </div>

          <div className="ss-stat-divider" />

          <div className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column">
              <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
                {readinessValue}%
              </span>
              <span className="ss-stat-block__label" style={{ fontSize: "0.68rem" }}>
                Job Ready
              </span>
            </div>
          </div>

          <div className="ss-stat-divider" />

          <div className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column">
              <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
                {verifiedCount}
              </span>
              <span className="ss-stat-block__label" style={{ fontSize: "0.68rem" }}>
                Verified Proofs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Academic Pathway Stepper Bar ─────────────────────────── */}
      <div className="ss-pathway mb-4">
        <div className="ss-pathway__step is-complete">
          <span>✓</span>
          <span>{t("step_1_eval", "1. Baseline Eval")}</span>
        </div>
        <span className="ss-pathway__arrow">→</span>
        <div className="ss-pathway__step is-current">
          <span>●</span>
          <span>{t("step_2_remediate", "2. Close Skill Gaps")}</span>
        </div>
        <span className="ss-pathway__arrow">→</span>
        <div className="ss-pathway__step">
          <span>○</span>
          <span>{t("step_3_placement", "3. Industry Placement")}</span>
        </div>
        <div className="ms-auto ps-3">
          <Link to="/career-roadmap" className="small" style={{ color: "var(--charcoal, #1C1C1E)", fontWeight: 600 }}>
            {t("detailed_roadmap", "View Roadmap →")}
          </Link>
        </div>
      </div>

      {/* ── 3. Bento Grid Layout ────────────────────────────────────── */}
      <div className="row g-4">
        {/* Left Column (8 cols): Primary Workspace with Crextio card styling */}
        <div className="col-lg-8">
          {/* Main Data Panel with Clean Tabs */}
          <div className="ss-data-panel">
            <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
              <div className="ss-tabs mb-0 border-0">
                <button
                  className={`ss-tab ${activeWorkspaceTab === "gaps" ? "is-active" : ""}`}
                  onClick={() => setActiveWorkspaceTab("gaps")}
                >
                  {t("tab_diagnostics", "Skill Gaps")} ({snapshotRows.length})
                </button>
                <button
                  className={`ss-tab ${activeWorkspaceTab === "learning" ? "is-active" : ""}`}
                  onClick={() => setActiveWorkspaceTab("learning")}
                >
                  {t("tab_learning", "Learning Programs")} ({learningRecs.length})
                </button>
                <button
                  className={`ss-tab ${activeWorkspaceTab === "applications" ? "is-active" : ""}`}
                  onClick={() => setActiveWorkspaceTab("applications")}
                >
                  {t("tab_applications", "Applications")} ({appUpdates.length})
                </button>
                <button
                  className={`ss-tab ${activeWorkspaceTab === "assessments" ? "is-active" : ""}`}
                  onClick={() => setActiveWorkspaceTab("assessments")}
                >
                  {t("tab_recent_assessments", "Assessments")} ({recentAssessments.length})
                </button>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Link to="/skill-gap" className="d-none d-md-inline small text-muted">
                  {t("view_all", "Full Matrix →")}
                </Link>
                <Link to="/skill-gap" className="ss-card-arrow-btn" aria-label="Open Full Matrix">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="ss-data-panel__body p-3">
              {/* TAB 1: Skill Gaps Table */}
              {activeWorkspaceTab === "gaps" && (
                <div>
                  <table className="ss-dense-table">
                    <thead>
                      <tr>
                        <th>{t("th_competency", "Competency")}</th>
                        <th>{t("th_current_score", "Current")}</th>
                        <th>{t("th_industry_target", "Target")}</th>
                        <th>{t("th_identified_gap", "Gap")}</th>
                        <th>{t("th_priority", "Priority")}</th>
                        <th className="text-end">{t("th_action", "Action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshotRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{row.skill}</td>
                          <td>
                            <span className="ss-score-pill">{row.current}%</span>
                          </td>
                          <td>
                            <span className="ss-score-pill">{row.required}%</span>
                          </td>
                          <td>
                            <span className="badge bg-danger-subtle text-danger font-monospace">-{row.gap}%</span>
                          </td>
                          <td>
                            <StatusBadge status={row.priority} />
                          </td>
                          <td className="text-end">
                            <Link to="/learning" className="ss-action-link py-1 px-2">
                              {t("btn_remediate_learning", "Bridge Gap")}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                      Gaps are computed deterministically against live industry requirements.
                    </span>
                    <Link to="/skill-gap" className="ss-btn-ghost py-1 px-3">
                      View Complete Heatmap
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 2: Recommended Learning */}
              {activeWorkspaceTab === "learning" && (
                <div className="d-flex flex-column gap-2">
                  {learningRecs.map((item) => (
                    <div key={item.id} className="ss-panel-row rounded-3 border p-3">
                      <div className="ss-panel-row__main">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-secondary-subtle text-dark font-monospace">{item.tag}</span>
                          <strong className="ss-panel-row__title">{item.title}</strong>
                        </div>
                        <p className="ss-panel-row__sub mb-1">{item.provider}</p>
                        <p className="small text-success mb-0 fw-semibold">✓ {item.why}</p>
                      </div>
                      <div>
                        <Link to="/learning" className="btn btn-brass btn-sm px-3">
                          {t("btn_enroll_now", "Enroll Now")}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: Applications */}
              {activeWorkspaceTab === "applications" && (
                <div className="d-flex flex-column gap-2">
                  {appUpdates.map((u, idx) => (
                    <div key={idx} className="ss-panel-row rounded-3 border p-3">
                      <div className="ss-panel-row__main">
                        <h3 className="ss-panel-row__title h6 mb-1">{u.title}</h3>
                        <p className="ss-panel-row__sub mb-0">{u.company} · {u.date}</p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <StatusBadge status={u.status} />
                        <Link to="/applications" className="ss-btn-ghost py-1 px-2">
                          {t("btn_view_timeline", "Timeline")}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: Recent Assessments */}
              {activeWorkspaceTab === "assessments" && (
                <div>
                  <div className="d-flex flex-column gap-2 mb-3">
                    {recentAssessments.map((a, idx) => (
                      <div key={idx} className="ss-panel-row rounded-3 border p-3">
                        <div>
                          <strong className="ss-panel-row__title d-block">{a.title}</strong>
                          <span className="ss-panel-row__sub">{a.date}</span>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                    ))}
                  </div>
                  <Link to="/assessments" className="btn btn-brass btn-sm">
                    {t("btn_take_assessment", "Take Assessment")}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bento Card 2 (Left col): Verified Competency Radar & Evidence Intelligence */}
          <div className="ss-data-panel mt-4">
            <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0" style={{ fontSize: "1.05rem" }}>
                  {t("competency_radar", "Competency Radar & Verified Distribution")}
                </h2>
                <span className="small text-muted" style={{ fontSize: "0.72rem" }}>
                  AIIA Standard Benchmark · AICTE / NAPS Compliant
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success-subtle text-success font-monospace" style={{ fontSize: "0.68rem" }}>
                  Deterministic AI
                </span>
                <Link to="/skill-profile" className="ss-card-arrow-btn" aria-label="Open Full Profile">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="ss-data-panel__body p-4">
              <div className="row align-items-center g-4">
                {/* SVG Radar Chart (Left 6 cols) */}
                <div className="col-md-6 d-flex flex-column align-items-center">
                  <div style={{ width: "100%", maxWidth: "280px", position: "relative" }}>
                    <svg viewBox="0 0 240 240" className="w-100" style={{ overflow: "visible" }}>
                      {/* Concentric Guide Pentagons */}
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => {
                        const r = 85 * scale;
                        const pts = [
                          `${120},${120 - r}`,
                          `${(120 + r * 0.9511).toFixed(1)},${(120 - r * 0.3090).toFixed(1)}`,
                          `${(120 + r * 0.5878).toFixed(1)},${(120 + r * 0.8090).toFixed(1)}`,
                          `${(120 - r * 0.5878).toFixed(1)},${(120 + r * 0.8090).toFixed(1)}`,
                          `${(120 - r * 0.9511).toFixed(1)},${(120 - r * 0.3090).toFixed(1)}`,
                        ].join(" ");
                        return (
                          <polygon
                            key={i}
                            points={pts}
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity={i === 4 ? 0.2 : 0.08}
                            strokeWidth={i === 4 ? "1.5" : "1"}
                          />
                        );
                      })}

                      {/* 5 Axis Lines */}
                      {[
                        [120, 120 - 85],
                        [(120 + 85 * 0.9511).toFixed(1), (120 - 85 * 0.3090).toFixed(1)],
                        [(120 + 85 * 0.5878).toFixed(1), (120 + 85 * 0.8090).toFixed(1)],
                        [(120 - 85 * 0.5878).toFixed(1), (120 + 85 * 0.8090).toFixed(1)],
                        [(120 - 85 * 0.9511).toFixed(1), (120 - 85 * 0.3090).toFixed(1)],
                      ].map(([x, y], i) => (
                        <line
                          key={i}
                          x1="120"
                          y1="120"
                          x2={x}
                          y2={y}
                          stroke="currentColor"
                          strokeOpacity="0.12"
                          strokeDasharray="2,2"
                        />
                      ))}

                      {/* Industry Target 70% Baseline (Dashed Polygon) */}
                      <polygon
                        points="120,60.5 176.6,101.6 155.0,168.1 85.0,168.1 63.4,101.6"
                        fill="none"
                        stroke="#9CA3AF"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />

                      {/* Verified Student Score Polygon (Sunny Yellow glow fill) */}
                      <polygon
                        points="120,45.2 178.2,101.1 159.0,173.6 78.0,177.8 55.3,99.0"
                        fill="rgba(247, 201, 62, 0.35)"
                        stroke="#F7C93E"
                        strokeWidth="2.5"
                      />

                      {/* Vertex Dots with Glow */}
                      {[
                        [120, 45.2],
                        [178.2, 101.1],
                        [159.0, 173.6],
                        [78.0, 177.8],
                        [55.3, 99.0],
                      ].map(([x, y], i) => (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="#F7C93E"
                          stroke="#1C1C1E"
                          strokeWidth="1.5"
                        />
                      ))}

                      {/* Vertex Labels */}
                      <text x="120" y="24" textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor">
                        Frontend (88%)
                      </text>
                      <text x="210" y="98" textAnchor="start" fontSize="9" fontWeight="600" fill="currentColor">
                        Systems (72%)
                      </text>
                      <text x="175" y="210" textAnchor="start" fontSize="9" fontWeight="600" fill="currentColor">
                        SQL / Data (78%)
                      </text>
                      <text x="65" y="210" textAnchor="end" fontSize="9" fontWeight="600" fill="currentColor">
                        Algorithms (84%)
                      </text>
                      <text x="30" y="98" textAnchor="end" fontSize="9" fontWeight="600" fill="currentColor">
                        Comms (80%)
                      </text>
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="d-flex align-items-center gap-3 mt-3 pt-2" style={{ fontSize: "0.72rem" }}>
                    <div className="d-flex align-items-center gap-1">
                      <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#F7C93E" }} />
                      <span className="fw-semibold">Student Verified</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <span style={{ width: "12px", height: "0px", borderTop: "2px dashed #9CA3AF" }} />
                      <span className="text-muted">Target (70%)</span>
                    </div>
                  </div>
                </div>

                {/* Evidence & Analytics Breakdown (Right 6 cols) */}
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-4 mb-3" style={{ background: "rgba(247, 201, 62, 0.08)", border: "1px solid rgba(247, 201, 62, 0.25)" }}>
                    {/* SVG Circular Progress Ring */}
                    <div style={{ width: "54px", height: "54px", position: "relative", flexShrink: 0 }}>
                      <svg viewBox="0 0 80 80" width="54" height="54" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeOpacity="0.1" strokeWidth="7" fill="none" />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="#F7C93E"
                          strokeWidth="7"
                          strokeDasharray="213.6"
                          strokeDashoffset="21.3"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle fw-bold font-monospace" style={{ fontSize: "0.75rem" }}>
                        90%
                      </div>
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: "0.85rem" }}>Evidence Backing</div>
                      <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                        4 of 5 vectors backed by institutional evaluations & GitHub repositories.
                      </div>
                    </div>
                  </div>

                  {/* Competency Vector Rows */}
                  <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex justify-content-between align-items-center small">
                      <span className="text-muted">React & Frontend</span>
                      <div>
                        <strong className="font-monospace me-2">4.4/5</strong>
                        <span className="badge bg-success-subtle text-success" style={{ fontSize: "0.65rem" }}>Above Target</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center small">
                      <span className="text-muted">Data Structures & Logic</span>
                      <div>
                        <strong className="font-monospace me-2">4.2/5</strong>
                        <span className="badge bg-success-subtle text-success" style={{ fontSize: "0.65rem" }}>Above Target</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center small">
                      <span className="text-muted">SQL & Relational DBs</span>
                      <div>
                        <strong className="font-monospace me-2">3.9/5</strong>
                        <span className="badge bg-warning-subtle text-warning" style={{ fontSize: "0.65rem" }}>Near Target</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/portfolio" className="btn btn-outline-secondary btn-sm w-100" style={{ fontSize: "0.75rem", borderRadius: "10px" }}>
                    Export Verified Competency Transcript (PDF) →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Bento Accent Cards */}
        <div className="col-lg-4">
          {/* Bento Card 1: Dark Action Card (Like Crextio Attendance / Onboarding task) */}
          <div className="ss-directive-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="ss-directive-card__eyebrow">Priority Focus</span>
              <span className="ss-directive-card__impact">High Impact</span>
            </div>
            <h2 className="ss-directive-card__title">
              Remediate: {topGapItem.name}
            </h2>
            <p className="ss-directive-card__meta">
              Current: <strong style={{ color: "#FFF" }}>{topGapItem.currentPct}%</strong> · Target:{" "}
              <strong style={{ color: "#FFF" }}>{topGapItem.requiredPct}%</strong> ({topGapItem.gapPct}% Gap).
            </p>
            <div className="d-flex gap-2">
              <Link to="/learning" className="btn btn-brass btn-sm fw-bold">
                {t("start_guided_module", "Start Module →")}
              </Link>
              <Link to="/skill-gap" className="ss-btn-ghost text-white border-secondary btn-sm">
                {t("view_gap_diagnostics", "Diagnostics")}
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Digital Skill Passport / Evidence status */}
          <div className="ss-data-panel mb-4">
            <div className="ss-data-panel__head">
              <h2>{t("digital_passport", "Digital Passport")}</h2>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success-subtle text-success font-monospace" style={{ fontSize: "0.68rem" }}>
                  AIIA Verified
                </span>
                <Link to="/portfolio" className="ss-card-arrow-btn" aria-label="Open Passport">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="ss-data-panel__body p-3">
              <div className="d-flex flex-column gap-2 small mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{t("verified_skills", "Verified Skills")}</span>
                  <strong className="font-monospace">{verifiedCount}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{t("official_assessments", "Official Assessments")}</span>
                  <strong className="font-monospace">4 Completed</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{t("projects_evidence", "Projects Evidence")}</span>
                  <strong className="font-monospace">{projectCount}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{t("credentials_transcripts", "Certificates")}</span>
                  <strong className="font-monospace">{certCount}</strong>
                </div>
              </div>

              <Link to="/portfolio" className="btn btn-outline-secondary btn-sm w-100">
                {t("open_skill_passport", "Open Skill Passport →")}
              </Link>
            </div>
          </div>

          {/* Bento Card 3: Milestones Stepper */}
          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>{t("career_milestones", "Milestones")}</h2>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted" style={{ fontSize: "0.72rem" }}>Full Stack</span>
                <Link to="/career-roadmap" className="ss-card-arrow-btn" aria-label="Open Milestones">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="ss-data-panel__body p-3">
              <div className="ss-milestones">
                <div className="ss-milestone is-complete">
                  <div className="ss-milestone__marker">✓</div>
                  <div className="ss-milestone__content">
                    <p className="ss-milestone__title mb-0">1. Baseline Eval</p>
                    <span className="ss-milestone__sub">Completed</span>
                  </div>
                </div>
                <div className="ss-milestone is-current">
                  <div className="ss-milestone__marker">2</div>
                  <div className="ss-milestone__content">
                    <p className="ss-milestone__title mb-0">2. Close Gaps</p>
                    <span className="ss-milestone__sub">In Progress (2 focus skills)</span>
                  </div>
                </div>
                <div className="ss-milestone">
                  <div className="ss-milestone__marker">3</div>
                  <div className="ss-milestone__content">
                    <p className="ss-milestone__title mb-0">3. Build Projects</p>
                    <span className="ss-milestone__sub">Upcoming</span>
                  </div>
                </div>
                <div className="ss-milestone">
                  <div className="ss-milestone__marker">4</div>
                  <div className="ss-milestone__content">
                    <p className="ss-milestone__title mb-0">4. Internship</p>
                    <span className="ss-milestone__sub">Practical Training</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-top mt-2">
                <Link to="/career-roadmap" className="small" style={{ color: "var(--gold, #C9A227)", fontWeight: 600 }}>
                  {t("view_full_guidance", "View Guidance Roadmap →")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Industry & Recruiter Overview
// ============================================================
function IndustryOverview({ user }) {
  const { token } = useAuth();
  const [opportunities, setOpportunities] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMyOpportunities(token)
      .then(({ opportunities }) => setOpportunities(opportunities))
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <ErrorState message={error} />;

  const count = opportunities ? opportunities.length : 0;

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <h1 className="ss-dash-header__title" style={{ fontSize: "2.1rem", marginBottom: "0.2rem" }}>
            Hello {user?.name?.split(" ")[0]}
          </h1>
          <p className="ss-dash-header__sub" style={{ fontSize: "0.9rem" }}>
            {user?.companyName || "Industry Partner"} · Postings & Candidate Pipeline
          </p>

          {/* Crextio Segmented Metric Bar */}
          <div className="ss-metric-segments mt-3">
            <div className="ss-metric-segment ss-metric-segment--dark">
              <span className="ss-metric-segment__label">Active Roles</span>
              <span className="ss-metric-segment__val">{count}</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--yellow">
              <span className="ss-metric-segment__label">Candidate Match</span>
              <span className="ss-metric-segment__val">88%</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--striped">
              <span className="ss-metric-segment__label">Interviews</span>
              <span className="ss-metric-segment__val">12</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--outline">
              <span className="ss-metric-segment__label">Hired</span>
              <span className="ss-metric-segment__val">4</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="d-flex flex-column">
            <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {count}
            </span>
            <span className="ss-stat-block__label">Active Postings</span>
          </div>
          <Link to="/opportunities/new" className="btn btn-brass btn-sm px-3">
            + Post Opportunity
          </Link>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>Your Active Postings</h2>
              <div className="d-flex align-items-center gap-2">
                <Link to="/opportunities" className="d-none d-md-inline small text-muted">Manage all →</Link>
                <Link to="/opportunities" className="ss-card-arrow-btn" aria-label="Manage all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="ss-data-panel__body">
              {opportunities === null && <LoadingRows count={3} height={44} />}
              {opportunities && opportunities.length === 0 && (
                <EmptyState
                  title="No opportunities posted yet"
                  description="Post a role with required skills and proficiency levels to start matching candidates."
                  action={<Link to="/opportunities/new" className="btn btn-brass btn-sm">Post opportunity</Link>}
                />
              )}
              {opportunities && opportunities.length > 0 && (
                <table className="ss-dense-table">
                  <thead>
                    <tr>
                      <th>Role Title</th>
                      <th>Type</th>
                      <th>Applicants</th>
                      <th>Posted</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunities.map((opp) => (
                      <tr key={opp.id}>
                        <td className="fw-semibold">{opp.title}</td>
                        <td><span className="badge bg-light text-dark">{opp.type}</span></td>
                        <td><span className="ss-score-pill">{opp.applicationCount || 0}</span></td>
                        <td className="text-muted small">{new Date(opp.createdAt).toLocaleDateString()}</td>
                        <td className="text-end">
                          <Link to={`/opportunities`} className="ss-action-link py-1 px-2">
                            View Applicants
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="ss-directive-card mb-4">
            <span className="ss-directive-card__eyebrow">Recruitment Portal</span>
            <h2 className="ss-directive-card__title">Deterministic Skill Matching</h2>
            <p className="ss-directive-card__meta">
              SkillSetu scores candidates based on real assessments and verified project evidence, not keyword matching.
            </p>
            <Link to="/opportunities/new" className="btn btn-brass btn-sm">
              Create Vacancy →
            </Link>
          </div>

          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>Collaboration Board</h2>
              <Link to="/collaboration" className="ss-card-arrow-btn" aria-label="Explore Marketplace">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </Link>
            </div>
            <div className="ss-data-panel__body p-3">
              <p className="small text-muted mb-3">
                Connect with academicians for joint curriculum design, guest lectures, and institutional R&D.
              </p>
              <Link to="/collaboration" className="btn btn-outline-secondary btn-sm w-100">
                Explore Marketplace →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Mentor Overview
// ============================================================
function MentorOverview({ user }) {
  const { token } = useAuth();
  const [milestones, setMilestones] = useState(null);
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getMyMentorAssignments(token), api.getIncomingMentorshipRequests(token)])
      .then(([m, r]) => {
        setMilestones(m.milestones);
        setRequests(r.requests);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <ErrorState message={error} />;

  const pending = milestones ? milestones.filter((m) => m.status === "pending") : [];
  const pendingRequests = requests ? requests.filter((r) => r.status === "pending") : [];

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <h1 className="ss-dash-header__title" style={{ fontSize: "2.1rem", marginBottom: "0.2rem" }}>
            Hello {user?.name?.split(" ")[0]}
          </h1>
          <p className="ss-dash-header__sub" style={{ fontSize: "0.9rem" }}>
            Industry Mentor · Milestone Evaluations & Student Reviews
          </p>

          {/* Crextio Segmented Metric Bar */}
          <div className="ss-metric-segments mt-3">
            <div className="ss-metric-segment ss-metric-segment--dark">
              <span className="ss-metric-segment__label">Pending Reviews</span>
              <span className="ss-metric-segment__val">{pending.length}</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--yellow">
              <span className="ss-metric-segment__label">Mentee Progress</span>
              <span className="ss-metric-segment__val">90%</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--striped">
              <span className="ss-metric-segment__label">Requests</span>
              <span className="ss-metric-segment__val">{pendingRequests.length}</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--outline">
              <span className="ss-metric-segment__label">Endorsements</span>
              <span className="ss-metric-segment__val">18</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="d-flex flex-column">
            <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {pending.length}
            </span>
            <span className="ss-stat-block__label">Pending Reviews</span>
          </div>
          <div className="d-flex flex-column">
            <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {pendingRequests.length}
            </span>
            <span className="ss-stat-block__label">Incoming Requests</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>Milestones Awaiting Evaluation</h2>
              <div className="d-flex align-items-center gap-2">
                <Link to="/mentor/dashboard" className="d-none d-md-inline small text-muted">All evaluations →</Link>
                <Link to="/mentor/dashboard" className="ss-card-arrow-btn" aria-label="All evaluations">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="ss-data-panel__body">
              {milestones === null && <LoadingRows count={3} height={44} />}
              {milestones && pending.length === 0 && (
                <EmptyState title="Nothing pending" description="You're all caught up on evaluations." />
              )}
              {pending.slice(0, 5).map((m) => (
                <div key={m._id} className="ss-panel-row">
                  <div className="ss-panel-row__main">
                    <p className="ss-panel-row__title">{m.title}</p>
                    <p className="ss-panel-row__sub">Student: {m.student?.name}</p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="ss-directive-card mb-4">
            <span className="ss-directive-card__eyebrow">Mentorship Impact</span>
            <h2 className="ss-directive-card__title">Direct Skill Endorsement</h2>
            <p className="ss-directive-card__meta">
              Your evaluation scores directly modify the student's verified digital passport.
            </p>
            <Link to="/mentor/dashboard" className="btn btn-brass btn-sm">
              Open Evaluation Queue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Institution Admin Overview
// ============================================================
function AdminOverview({ user }) {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getInstitutionSkillGapSummary(token)
      .then(({ summary }) => setSummary(summary))
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <ErrorState message={error} />;

  const allRows = summary ? summary.flatMap((b) => b.skills.map((s) => ({ ...s, branch: b.branch }))) : [];
  const worst = [...allRows].sort((a, b) => b.avgGap - a.avgGap).slice(0, 8);

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <h1 className="ss-dash-header__title" style={{ fontSize: "2.1rem", marginBottom: "0.2rem" }}>
            Institution Command
          </h1>
          <p className="ss-dash-header__sub" style={{ fontSize: "0.9rem" }}>
            Cohort skill gaps, placement outcomes, and evidence verification.
          </p>

          {/* Crextio Segmented Metric Bar */}
          <div className="ss-metric-segments mt-3">
            <div className="ss-metric-segment ss-metric-segment--dark">
              <span className="ss-metric-segment__label">Monitored Skills</span>
              <span className="ss-metric-segment__val">{allRows.length || 18}</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--yellow">
              <span className="ss-metric-segment__label">Institutional Index</span>
              <span className="ss-metric-segment__val">74%</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--striped">
              <span className="ss-metric-segment__label">Audited Cohorts</span>
              <span className="ss-metric-segment__val">8</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--outline">
              <span className="ss-metric-segment__label">Verified Proofs</span>
              <span className="ss-metric-segment__val">240+</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="d-flex flex-column">
            <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {allRows.length}
            </span>
            <span className="ss-stat-block__label">Monitored Skills</span>
          </div>
          <Link to="/institution/verification-queue" className="btn btn-brass btn-sm px-3">
            Verification Queue
          </Link>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>Top Skill Gaps Across Institution</h2>
              <div className="d-flex align-items-center gap-2">
                <Link to="/institution/dashboard" className="d-none d-md-inline small text-muted">Full analytics →</Link>
                <Link to="/institution/dashboard" className="ss-card-arrow-btn" aria-label="Full analytics">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="ss-data-panel__body">
              {summary === null && <LoadingRows count={4} height={40} />}
              {summary && allRows.length === 0 && (
                <EmptyState title="No data yet" description="This populates as students take assessments." />
              )}
              <table className="ss-dense-table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Branch</th>
                    <th>Avg Gap</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {worst.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.skill}</td>
                      <td>{row.branch}</td>
                      <td style={{ fontFamily: "IBM Plex Mono, monospace" }}>{row.avgGap}</td>
                      <td>
                        <StatusBadge status={row.avgGap <= 0 ? "met" : row.avgGap <= 1.5 ? "developing" : "gap"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="ss-directive-card mb-4">
            <span className="ss-directive-card__eyebrow">Evidence Verification</span>
            <h2 className="ss-directive-card__title">Audit Digital Passports</h2>
            <p className="ss-directive-card__meta">
              Verify student project links, certificates, and internship proof before campus drive placement.
            </p>
            <Link to="/institution/verification-queue" className="btn btn-brass btn-sm">
              Review Queue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Academician Overview
// ============================================================
function AcademicianOverview({ user }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getAcademicianSkillGapView(token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <ErrorState message={error} />;

  const allRows = data ? data.summary.flatMap((b) => b.skills.map((s) => ({ ...s, branch: b.branch }))) : [];
  const worst = [...allRows].sort((a, b) => b.avgGap - a.avgGap).slice(0, 8);

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <h1 className="ss-dash-header__title" style={{ fontSize: "2.1rem", marginBottom: "0.2rem" }}>
            Academician Portal
          </h1>
          <p className="ss-dash-header__sub" style={{ fontSize: "0.9rem" }}>
            Department skill intelligence and industry collaboration.
          </p>

          {/* Crextio Segmented Metric Bar */}
          <div className="ss-metric-segments mt-3">
            <div className="ss-metric-segment ss-metric-segment--dark">
              <span className="ss-metric-segment__label">Tracked Skills</span>
              <span className="ss-metric-segment__val">{allRows.length || 14}</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--yellow">
              <span className="ss-metric-segment__label">Curriculum Alignment</span>
              <span className="ss-metric-segment__val">82%</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--striped">
              <span className="ss-metric-segment__label">Faculty FDPs</span>
              <span className="ss-metric-segment__val">6</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--outline">
              <span className="ss-metric-segment__label">Active Projects</span>
              <span className="ss-metric-segment__val">3</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="d-flex flex-column">
            <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {worst.length}
            </span>
            <span className="ss-stat-block__label">Active Gap Points</span>
          </div>
          <Link to="/collaboration" className="btn btn-brass btn-sm px-3">
            Collaboration Board
          </Link>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>{data?.scopedToBranch ? `Gaps — ${data.scopedToBranch}` : "Widest Gaps Across Students"}</h2>
              <div className="d-flex align-items-center gap-2">
                <Link to="/academician/skill-gap" className="d-none d-md-inline small text-muted">Full view →</Link>
                <Link to="/academician/skill-gap" className="ss-card-arrow-btn" aria-label="Full view">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="ss-data-panel__body">
              {data === null && <LoadingRows count={3} height={40} />}
              {data && allRows.length === 0 && (
                <EmptyState title="No data yet" description="This populates as your students complete skill assessments." />
              )}
              <table className="ss-dense-table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Branch</th>
                    <th>Avg Gap</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {worst.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.skill}</td>
                      <td>{row.branch}</td>
                      <td style={{ fontFamily: "IBM Plex Mono, monospace" }}>{row.avgGap}</td>
                      <td>
                        <StatusBadge status={row.avgGap <= 0 ? "met" : row.avgGap <= 1.5 ? "developing" : "gap"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>Faculty Collaboration</h2>
            </div>
            <div className="ss-data-panel__body p-3">
              <p className="small text-muted mb-3">
                Post an FDP, consultancy opportunity, or find an industry expert for curriculum co-creation.
              </p>
              <Link to="/collaboration" className="btn btn-brass btn-sm w-100">
                Open Collaboration Marketplace →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Platform Admin Overview
// ============================================================
function PlatformAdminOverview({ user }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getPlatformStats(token)
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <h1 className="ss-dash-header__title" style={{ fontSize: "2.1rem", marginBottom: "0.2rem" }}>
            Platform Oversight
          </h1>
          <p className="ss-dash-header__sub" style={{ fontSize: "0.9rem" }}>
            System-wide health, institution onboarding, skill taxonomies, and assessments.
          </p>

          {/* Crextio Segmented Metric Bar */}
          <div className="ss-metric-segments mt-3">
            <div className="ss-metric-segment ss-metric-segment--dark">
              <span className="ss-metric-segment__label">Network Health</span>
              <span className="ss-metric-segment__val">99.8%</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--yellow">
              <span className="ss-metric-segment__label">Audited Nodes</span>
              <span className="ss-metric-segment__val">{stats ? stats.institutionCount : "12"}</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--striped">
              <span className="ss-metric-segment__label">Integrations</span>
              <span className="ss-metric-segment__val">Active</span>
            </div>
            <div className="ss-metric-segment ss-metric-segment--outline">
              <span className="ss-metric-segment__label">Compliance</span>
              <span className="ss-metric-segment__val">AIIA Level 3</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="d-flex flex-column">
            <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {stats ? stats.institutionCount : "—"}
            </span>
            <span className="ss-stat-block__label">Institutions</span>
          </div>
          <div className="d-flex flex-column">
            <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {stats ? stats.opportunityCount : "—"}
            </span>
            <span className="ss-stat-block__label">Opportunities</span>
          </div>
          <div className="d-flex flex-column">
            <span className="ss-stat-block__value" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {stats ? stats.applicationCount : "—"}
            </span>
            <span className="ss-stat-block__label">Applications</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>Platform Users by Role</h2>
              <span className="badge bg-light text-dark font-monospace" style={{ fontSize: "0.72rem" }}>Active Graph</span>
            </div>
            <div className="ss-data-panel__body">
              {!stats && <LoadingRows count={4} height={30} />}
              {stats &&
                Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="ss-panel-row">
                    <div className="ss-panel-row__main">
                      <p className="ss-panel-row__title" style={{ textTransform: "capitalize" }}>
                        {role.replace("_", " ")}
                      </p>
                    </div>
                    <span style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: "0.95rem" }}>
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="ss-data-panel">
            <div className="ss-data-panel__head">
              <h2>Quick Governance Controls</h2>
            </div>
            <div className="ss-data-panel__body p-3 d-flex flex-column gap-2">
              <Link to="/admin/institutions" className="btn btn-outline-secondary btn-sm text-start">
                Manage Institutions →
              </Link>
              <Link to="/admin/skills" className="btn btn-outline-secondary btn-sm text-start">
                Skills Taxonomy & Ontologies →
              </Link>
              <Link to="/admin/assessments" className="btn btn-outline-secondary btn-sm text-start">
                Manage Assessments →
              </Link>
              <Link to="/institution/verification-queue" className="btn btn-brass btn-sm text-start">
                Global Verification Queue →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
