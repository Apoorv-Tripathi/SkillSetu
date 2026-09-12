import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import { LineTrendChart, RadarSpiderChart, DonutRiskChart } from "../components/ui/ModernCharts.jsx";
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
// Student Dashboard (SIH Finalist Benchmark Architecture)
// ============================================================
function StudentOverview({ user }) {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [heatmap, setHeatmap] = useState(null);
  const [applications, setApplications] = useState(null);
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Score calculation: average of profile averageScores
  const scoreValue =
    profile && profile.length > 0
      ? Math.round((profile.reduce((acc, curr) => acc + curr.averageScore, 0) / profile.length) * 20)
      : 89;

  const cgpaDisplay = (scoreValue / 10).toFixed(2);
  const appCount = applications && applications.length > 0 ? applications.length : 3;
  const verifiedCount = profile ? (profile.filter((p) => p.isVerified || (p.averageScore || 0) >= 3.0).length || 6) : 6;
  const projectCount = portfolio ? (portfolio.filter((item) => item.type === "project").length || 3) : 3;
  const certCount = portfolio ? (portfolio.filter((item) => item.type === "certificate").length || 2) : 2;

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

  // Snapshot rows
  const defaultSnapshotRows = [
    { skill: "React.js", current: 36, required: 70, gap: 34, priority: "High" },
    { skill: "JavaScript (ES6+)", current: 40, required: 70, gap: 30, priority: "High" },
    { skill: "System Design", current: 40, required: 70, gap: 30, priority: "High" },
    { skill: "SQL & Relational DBs", current: 56, required: 78, gap: 22, priority: "Medium" },
    { skill: "Data Structures", current: 61, required: 80, gap: 19, priority: "Low" },
  ];

  const snapshotRows =
    rawGaps && rawGaps.length > 0
      ? [...rawGaps]
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 5)
          .map((r) => ({
            skill: r.skill?.name || "Skill",
            current: Math.round(r.currentScore * 20),
            required: Math.round(r.targetScore * 20),
            gap: Math.max(0, Math.round(r.gap * 20)),
            priority: r.gap <= 0 ? "Target Met" : r.gap > 1 ? "High" : r.gap > 0.5 ? "Medium" : "Low",
          }))
      : defaultSnapshotRows;

  // Recommended learning resources
  const learningRecs = [
    {
      id: "l1",
      tag: "ADV",
      title: "Advanced React & State Management Patterns",
      provider: "Coursera",
      duration: "18 Hours",
      skill: "React & Component Architecture",
      why: "Will reduce your React gap by ~25%",
    },
    {
      id: "l2",
      tag: "SYS",
      title: "Scalable Systems & Distributed Architectures",
      provider: "NPTEL",
      duration: "24 Hours",
      skill: "System Design & Microservices",
      why: "Prepares for tech lead interview standards",
    },
    {
      id: "l3",
      tag: "SQL",
      title: "Query Optimization & PostgreSQL Tuning",
      provider: "Scaler Topics",
      duration: "10 Hours",
      skill: "SQL & Query Performance",
      why: "Strongly recommended for full-stack profiles",
    },
  ];

  const defaultAppUpdates = [
    {
      title: "Frontend Engineering Intern",
      company: "Vertex Systems Pvt. Ltd.",
      date: "Applied · 28 Aug 2026",
      status: "Applied",
    },
    {
      title: "Junior Cloud Associate",
      company: "Infosys Campus Connect",
      date: "Shortlisted · 1 Sep 2026",
      status: "Shortlisted",
    },
    {
      title: "Full Stack Developer Trainee",
      company: "Cognizant Technology Solutions",
      date: "Under Review · 4 Sep 2026",
      status: "Pending",
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

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  // Academic trend data for SVG Line Chart
  const academicProgressData = [
    { label: "Sem 1", value: 8.2 },
    { label: "Sem 2", value: 8.4 },
    { label: "Sem 3", value: 8.5 },
    { label: "Sem 4", value: 8.7 },
    { label: "Sem 5", value: 8.9 },
  ];

  // 5-Axis Performance metrics for Radar Chart
  const radarAxes = ["Academics", "Attendance", "Assignments", "Projects", "Extra-curricular"];
  const radarValues = [89, 96, 75, 84, 68];

  return (
    <div>
      {/* ── 1. Royal Indigo-Purple Hero Banner (Direct match to Screenshot 11.46.05) ── */}
      <div className="ss-hero-banner">
        <div className="ss-hero-banner__content">
          <div className="ss-hero-banner__profile">
            <div className="ss-hero-banner__avatar">
              {userInitials}
            </div>
            <div>
              <h1 className="ss-hero-banner__title">
                Welcome, {user?.name || "Student"}!
              </h1>
              <div className="ss-hero-banner__subtitle">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>{user?.email || "student@demo.skillsetu.local"}</span>
              </div>
              <div className="ss-hero-banner__chips">
                <span className="ss-hero-banner__chip">
                  # APAAR-2025-322D0285
                </span>
                <span className="ss-hero-banner__chip">
                  📖 {user?.branch || "B.Tech CSE"}
                </span>
                <span className="ss-hero-banner__chip">
                  📅 Semester {user?.semester || 5}
                </span>
                <span className="ss-hero-banner__chip ss-hero-banner__chip--verified">
                  🛡 Aadhaar Verified
                </span>
              </div>
            </div>
          </div>

          <div className="ss-hero-banner__actions">
            <Link to="/skill-gap" className="ss-banner-btn ss-banner-btn--white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Skill Matrix</span>
            </Link>
            <Link to="/portfolio" className="ss-banner-btn ss-banner-btn--outline-blue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Digital Passport</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. 4-Card Solid Full-Color Metric Row (Screenshot 11.46.05) ── */}
      <div className="ss-kpi-grid">
        <MetricCard
          variant="blue"
          label="Current CGPA"
          value={cgpaDisplay}
          progress={89}
          meta="Top 5% in department"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="green"
          label="Attendance"
          value="96%"
          progress={96}
          meta="Verified by biometrics"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="amber"
          label="Skill Gaps / Remediations"
          value={`${snapshotRows.length} Skills`}
          progress={45}
          meta="Action required"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          }
        />

        <MetricCard
          variant="cyan"
          label="Current Semester"
          value={`${user?.semester || 5}`}
          meta="Pre-final Year (2026-2027)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          }
        />
      </div>

      {/* ── 3. Horizontal Tabbed Navigation ── */}
      <div className="ss-tab-bar">
        <button
          className={`ss-tab-bar__item ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Overview</span>
        </button>

        <button
          className={`ss-tab-bar__item ${activeTab === "journey" ? "is-active" : ""}`}
          onClick={() => setActiveTab("journey")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>My Journey & Skill Matrix</span>
        </button>

        <button
          className={`ss-tab-bar__item ${activeTab === "learning" ? "is-active" : ""}`}
          onClick={() => setActiveTab("learning")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>Learning Modules ({learningRecs.length})</span>
        </button>

        <button
          className={`ss-tab-bar__item ${activeTab === "applications" ? "is-active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <span>Applications ({appUpdates.length})</span>
        </button>
      </div>

      {/* ── 4. Main Tab Views ── */}
      {activeTab === "overview" && (
        <div className="row g-4">
          {/* Left Column (68% width on desktop) */}
          <div className="col-lg-8">
            {/* Academic Progress Trend Chart */}
            <div className="ss-chart-card mb-4">
              <div className="ss-chart-card__header">
                <div>
                  <h3 className="ss-chart-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    Academic Progress
                  </h3>
                  <p className="ss-chart-card__subtitle">Semester-wise CGPA trajectory and semester verification</p>
                </div>
                <span className="badge bg-primary-subtle text-primary fw-bold font-monospace px-3 py-2 rounded-pill">
                  Current: {cgpaDisplay} CGPA
                </span>
              </div>
              <div className="ss-chart-card__body">
                <LineTrendChart
                  data={academicProgressData}
                  height={220}
                  minVal={0}
                  maxVal={10}
                  strokeColor="#2563eb"
                  unit="CGPA"
                  yTicks={[0, 2, 4, 6, 8, 10]}
                />
              </div>
            </div>

            {/* Performance Metrics Radar Spider Chart */}
            <div className="ss-chart-card mb-4">
              <div className="ss-chart-card__header">
                <div>
                  <h3 className="ss-chart-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Performance Metrics
                  </h3>
                  <p className="ss-chart-card__subtitle">Multi-dimensional evaluation across academic and co-curricular dimensions</p>
                </div>
                <div className="small text-muted d-flex align-items-center gap-2">
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4f46e5", display: "inline-block" }} />
                  <span>Student Evaluation Score</span>
                </div>
              </div>
              <div className="ss-chart-card__body">
                <RadarSpiderChart
                  axes={radarAxes}
                  values={radarValues}
                  size={280}
                  strokeColor="#4f46e5"
                  fillColor="rgba(99, 102, 241, 0.22)"
                />
              </div>
            </div>

            {/* Critical Skill Gaps Table */}
            <div className="ss-chart-card">
              <div className="ss-chart-card__header">
                <div>
                  <h3 className="ss-chart-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Identified Skill Gaps
                  </h3>
                  <p className="ss-chart-card__subtitle">Deterministic benchmark comparisons against hiring requirements</p>
                </div>
                <Link to="/skill-gap" className="btn btn-outline-primary btn-sm rounded-3 px-3">
                  Full Matrix →
                </Link>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "#64748b" }}>
                      <th>Skill / Competency</th>
                      <th>Current</th>
                      <th>Target</th>
                      <th>Gap</th>
                      <th>Priority</th>
                      <th className="text-end">Remediation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshotRows.map((row, idx) => (
                      <tr key={idx} style={{ fontSize: "0.88rem" }}>
                        <td className="fw-bold text-dark">{row.skill}</td>
                        <td>
                          <span className="badge bg-light text-dark border fw-semibold">{row.current}%</span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border fw-semibold">{row.required}%</span>
                        </td>
                        <td>
                          {row.gap <= 0 ? (
                            <span className="badge bg-success-subtle text-success fw-bold">Met (0%)</span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger fw-bold">-{row.gap}%</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={row.priority} />
                        </td>
                        <td className="text-end">
                          <Link to="/learning" className="btn btn-sm btn-outline-secondary rounded-3 px-3 py-1">
                            Bridge Gap
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (32% width on desktop) */}
          <div className="col-lg-4">
            {/* Mini Stat 1: Profile Complete */}
            <div className="card border p-3 rounded-4 mb-3 shadow-sm bg-white">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                </div>
                <div>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "0.95rem" }}>Profile 85%</h4>
                  <span className="text-muted small">Profile Verification Complete</span>
                </div>
              </div>
            </div>

            {/* Mini Stat 2: Academic Progress */}
            <div className="card border p-3 rounded-4 mb-4 shadow-sm bg-white">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "0.95rem" }}>Academic Stage</h4>
                  <span className="text-muted small">Semester 5 (Pre-final Year)</span>
                </div>
              </div>
            </div>

            {/* Profile Details Card (Matching Screenshot 11.46.05) */}
            <div className="card border rounded-4 p-3 mb-4 shadow-sm bg-white">
              <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: "0.95rem" }}>
                Profile Details
              </h4>
              <div className="d-flex flex-column gap-2" style={{ fontSize: "0.85rem" }}>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Enrollment Number</span>
                  <span className="fw-semibold font-monospace">ENR-2023-8821</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Batch</span>
                  <span className="fw-semibold font-monospace">2023 - 2027</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Enrollment Date</span>
                  <span className="fw-semibold">12/08/2023</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Status</span>
                  <span className="badge rounded-pill bg-success text-white px-2 py-1">
                    ✔ Active
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Institution</span>
                  <span className="fw-semibold text-truncate ms-2" style={{ maxWidth: 160 }}>
                    {user?.institutionName || "Rajendra Tech"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Required Banner Card (Screenshot 11.46.05) */}
            <div
              className="rounded-4 p-3 mb-4 shadow-sm"
              style={{
                background: "#fef9c3",
                border: "1px solid #fef08a",
                color: "#854d0e",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <strong style={{ fontSize: "0.9rem" }}>Action Required!</strong>
              </div>
              <p className="small mb-3" style={{ opacity: 0.9 }}>
                Complete pending assessments in React & System Design to unlock your verified candidate badge.
              </p>
              <Link to="/assessments" className="btn btn-warning btn-sm w-100 fw-bold rounded-3 text-dark shadow-sm">
                Take Assessment Now →
              </Link>
            </div>

            {/* Recent Applications Quick Card */}
            <div className="card border rounded-4 p-3 mb-4 shadow-sm bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h4 className="fw-bold mb-0" style={{ fontSize: "0.95rem" }}>Recent Applications</h4>
                <Link to="/my-applications" className="small text-primary text-decoration-none">View all</Link>
              </div>

              <div className="d-flex flex-column gap-2">
                {appUpdates.map((app, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-start pb-2 border-bottom">
                    <div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{app.title}</div>
                      <div className="text-muted small">{app.company}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{app.date}</div>
                    </div>
                    <span className={`badge ${app.status === "Shortlisted" ? "bg-success text-white" : "bg-light text-dark"} border`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bento Card 2: Skill Evidence & Passport */}
            <div className="ss-data-panel mb-4">
              <div className="ss-data-panel__head">
                <h2>{t("verified_evidence", "Verified Credentials")}</h2>
                <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: "0.75rem" }}>APAAR</span>
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
      )}

      {/* ── Journey Tab ── */}
      {activeTab === "journey" && (
        <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>Learning Journey & Milestones</h3>
              <p className="text-muted small mb-0">Track your sequential progression toward target industry readiness</p>
            </div>
            <Link to="/career-roadmap" className="btn btn-primary btn-sm rounded-3 px-3">
              Full Career Roadmap →
            </Link>
          </div>
          <div className="row g-4">
            <div className="col-md-7">
              <div className="ss-milestones">
                <div className="ss-milestone is-complete">
                  <div className="ss-milestone__marker">✓</div>
                  <div className="ss-milestone__content">
                    <p className="ss-milestone__title mb-0">1. Baseline Skills Evaluation</p>
                    <span className="ss-milestone__sub">Completed · Grade: 8.9</span>
                  </div>
                </div>
                <div className="ss-milestone is-current">
                  <div className="ss-milestone__marker">2</div>
                  <div className="ss-milestone__content">
                    <p className="ss-milestone__title mb-0">2. Close High-Priority Skill Gaps</p>
                    <span className="ss-milestone__sub">In Progress (React Architecture, System Design)</span>
                  </div>
                </div>
                <div className="ss-milestone">
                  <div className="ss-milestone__marker">3</div>
                  <div className="ss-milestone__content">
                    <p className="ss-milestone__title mb-0">3. Build Capstone Projects</p>
                    <span className="ss-milestone__sub">Upcoming · 2 projects queued</span>
                  </div>
                </div>
                <div className="ss-milestone">
                  <div className="ss-milestone__marker">4</div>
                  <div className="ss-milestone__content">
                    <p className="ss-milestone__title mb-0">4. Industry Internship Placement</p>
                    <span className="ss-milestone__sub">Target: Summer 2027</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="p-3 bg-light rounded-4 border">
                <h5 className="fw-bold mb-2" style={{ fontSize: "0.95rem" }}>Core Competency Status</h5>
                <p className="text-muted small mb-3">Overall readiness score: <strong>82%</strong></p>
                <div className="d-flex flex-column gap-2 small">
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Data Structures & Algorithms</span>
                      <span className="fw-bold text-success">92%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-bar bg-success" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Full Stack Web Development</span>
                      <span className="fw-bold text-primary">85%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-bar bg-primary" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>System Design</span>
                      <span className="fw-bold text-warning">64%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-bar bg-warning" style={{ width: "64%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Learning Modules Tab ── */}
      {activeTab === "learning" && (
        <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>Recommended Learning Modules</h3>
              <p className="text-muted small mb-0">Curated by AI to address high-priority skill gaps</p>
            </div>
            <Link to="/learning" className="btn btn-outline-primary btn-sm rounded-3 px-3">
              Explore All Courses →
            </Link>
          </div>
          <div className="row g-3">
            {learningRecs.map((rec, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="card h-100 border rounded-4 p-3 shadow-sm hover-shadow">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary fw-semibold">{rec.provider}</span>
                    <span className="badge bg-light text-muted border">{rec.duration}</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "1rem" }}>{rec.title}</h5>
                  <p className="text-muted small mb-3 flex-grow-1">Target skill: {rec.skill}</p>
                  <Link to="/learning" className="btn btn-sm btn-primary w-100 rounded-3">
                    Start Learning →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Applications Tab ── */}
      {activeTab === "applications" && (
        <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>Job & Internship Applications</h3>
              <p className="text-muted small mb-0">Real-time status tracking for applied opportunities</p>
            </div>
            <Link to="/opportunities/browse" className="btn btn-primary btn-sm rounded-3 px-3">
              Find New Opportunities →
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                  <th>Opportunity</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Last Update</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {appUpdates.map((app, idx) => (
                  <tr key={idx} style={{ fontSize: "0.9rem" }}>
                    <td className="fw-bold text-dark">{app.title}</td>
                    <td>{app.company}</td>
                    <td>
                      <StatusBadge status={app.status?.toLowerCase()} />
                    </td>
                    <td className="text-muted small">{app.date}</td>
                    <td className="text-end">
                      <Link to="/applications" className="btn btn-sm btn-outline-secondary rounded-3 px-3">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "IP";

  return (
    <div>
      {/* ── 1. Unified Hero Banner ── */}
      <div className="ss-hero-banner">
        <div className="ss-hero-banner__content">
          <div className="ss-hero-banner__profile">
            <div className="ss-hero-banner__avatar">
              {userInitials}
            </div>
            <div>
              <h1 className="ss-hero-banner__title">
                Welcome, {user?.name || "Partner"}!
              </h1>
              <div className="ss-hero-banner__subtitle">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>{user?.email || "industry@demo.skillsetu.local"}</span>
              </div>
              <div className="ss-hero-banner__chips">
                <span className="ss-hero-banner__chip">
                  🏢 {user?.companyName || "Industry Partner"}
                </span>
                <span className="ss-hero-banner__chip">
                  💼 {count} Active {count === 1 ? "Role" : "Roles"}
                </span>
                <span className="ss-hero-banner__chip">
                  🎯 AI Match Engine Active
                </span>
                <span className="ss-hero-banner__chip ss-hero-banner__chip--verified">
                  🛡️ Verified Corporate Partner
                </span>
              </div>
            </div>
          </div>

          <div className="ss-hero-banner__actions">
            <Link to="/opportunities/new" className="ss-banner-btn ss-banner-btn--white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Post Opportunity</span>
            </Link>
            <Link to="/opportunities" className="ss-banner-btn ss-banner-btn--outline-blue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span>Manage Roles</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Standard 4-Card Metric Grid ── */}
      <div className="ss-kpi-grid">
        <MetricCard
          variant="blue"
          label="Active Roles"
          value={`${count} Postings`}
          progress={Math.min(count * 20, 100)}
          meta="Live openings on campus"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          }
        />

        <MetricCard
          variant="green"
          label="Candidate Match Rate"
          value="88%"
          progress={88}
          meta="Verified skill competency match"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="purple"
          label="Interviews Scheduled"
          value="12 Candidates"
          progress={65}
          meta="Across active vacancies"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="cyan"
          label="Candidates Hired"
          value="4 Hires"
          progress={40}
          meta="Current recruitment cycle"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          }
        />
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.15rem" }}>Your Active Postings</h3>
                <p className="text-muted small mb-0">Open roles and verified applicant counts</p>
              </div>
              <Link to="/opportunities" className="btn btn-outline-primary btn-sm rounded-3 px-3">
                Manage all →
              </Link>
            </div>
            <div>
              {opportunities === null && <LoadingRows count={3} height={44} />}
              {opportunities && opportunities.length === 0 && (
                <EmptyState
                  title="No opportunities posted yet"
                  description="Post a role with required skills and proficiency levels to start matching candidates."
                  action={<Link to="/opportunities/new" className="btn btn-primary btn-sm rounded-3 px-3.5 fw-semibold shadow-sm">Post opportunity</Link>}
                />
              )}
              {opportunities && opportunities.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                        <th>Role Title</th>
                        <th>Type</th>
                        <th>Applicants</th>
                        <th>Posted</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opportunities.map((opp) => (
                        <tr key={opp.id} style={{ fontSize: "0.88rem" }}>
                          <td className="fw-bold text-dark">{opp.title}</td>
                          <td><span className="badge bg-light text-dark border">{opp.type}</span></td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-3 font-monospace px-2.5 py-1">
                              {opp.applicationCount || 0}
                            </span>
                          </td>
                          <td className="text-muted small">{new Date(opp.createdAt).toLocaleDateString()}</td>
                          <td className="text-end">
                            <Link to="/opportunities" className="btn btn-sm btn-outline-primary rounded-3 px-3 py-1">
                              View Applicants
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            <Link to="/opportunities/new" className="btn btn-primary btn-sm rounded-3 px-3.5 fw-semibold shadow-sm">
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
              <Link to="/collaboration" className="btn btn-outline-secondary btn-sm w-100 rounded-3">
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
            <Link to="/mentor/dashboard" className="btn btn-primary btn-sm rounded-3 px-3.5 fw-semibold shadow-sm">
              Open Evaluation Queue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Institution Admin Overview (SIH Reference Benchmark)
// ============================================================
function AdminOverview({ user }) {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [adminTab, setAdminTab] = useState("overview");

  useEffect(() => {
    api
      .getInstitutionSkillGapSummary(token)
      .then(({ summary }) => setSummary(summary))
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <ErrorState message={error} />;

  const allRows = summary ? summary.flatMap((b) => b.skills.map((s) => ({ ...s, branch: b.branch }))) : [];
  const worst = [...allRows].sort((a, b) => b.avgGap - a.avgGap).slice(0, 8);
  const institutionName = user?.institutionName || "Rajendra Technical Institute";

  // Academic trend data across semesters (Screenshot 11.45.10)
  const academicTrends = [
    { label: "Sem 1", value: 78.4 },
    { label: "Sem 2", value: 81.2 },
    { label: "Sem 3", value: 83.5 },
    { label: "Sem 4", value: 86.8 },
    { label: "Sem 5", value: 89.2 },
    { label: "Sem 6", value: 92.4 },
  ];

  // Risk Distribution data (Screenshot 11.45.10 & 11.45.24)
  const riskSegments = [
    { label: "Safe / Low Risk", value: 74, color: "#10b981" },
    { label: "Moderate Risk", value: 18, color: "#f59e0b" },
    { label: "High Risk", value: 8, color: "#ef4444" },
  ];

  // At-Risk Students list (Screenshot 11.45.24 & 11.45.30)
  const atRiskStudents = [
    {
      name: "Rahul Verma",
      rollNo: "CS-2023-042",
      dept: "Computer Science",
      riskLevel: "High Risk",
      attendance: "64%",
      cgpa: 5.8,
      keyConcern: "Multiple Backlogs in Data Structures",
      action: "Assign Peer Mentor",
    },
    {
      name: "Sneha Mukherjee",
      rollNo: "EC-2023-089",
      dept: "Electronics & Comm.",
      riskLevel: "High Risk",
      attendance: "58%",
      cgpa: 6.1,
      keyConcern: "Low Attendance & Assessment Deficit",
      action: "Schedule Counseling",
    },
    {
      name: "Amitabh Patel",
      rollNo: "IT-2023-112",
      dept: "Information Tech.",
      riskLevel: "Moderate Risk",
      attendance: "72%",
      cgpa: 6.9,
      keyConcern: "System Design Skill Gap (-35%)",
      action: "Bridge Course",
    },
    {
      name: "Divya Nambiar",
      rollNo: "ME-2023-034",
      dept: "Mechanical Eng.",
      riskLevel: "Moderate Risk",
      attendance: "76%",
      cgpa: 7.0,
      keyConcern: "CAD Project Milestone Delayed",
      action: "Lab Extra Session",
    },
  ];

  return (
    <div>
      {/* ── 1. Hero Banner ── */}
      <div className="ss-hero-banner">
        <div className="ss-hero-banner__content">
          <div className="ss-hero-banner__profile">
            <div className="ss-hero-banner__avatar" style={{ background: "rgba(255,255,255,0.22)" }}>
              🏛️
            </div>
            <div>
              <h1 className="ss-hero-banner__title">
                Institutional Analytics & Command
              </h1>
              <div className="ss-hero-banner__subtitle">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{institutionName} · Central Campus Command</span>
              </div>
              <div className="ss-hero-banner__chips">
                <span className="ss-hero-banner__chip">
                  🛡️ NAAC Grade: A++
                </span>
                <span className="ss-hero-banner__chip">
                  📊 NIRF Tier-1 Mapped
                </span>
                <span className="ss-hero-banner__chip">
                  ⚡ NEP 2020 Compliant
                </span>
                <span className="ss-hero-banner__chip ss-hero-banner__chip--verified">
                  🟢 Real-time AI Stream
                </span>
              </div>
            </div>
          </div>

          <div className="ss-hero-banner__actions">
            <button className="ss-banner-btn ss-banner-btn--white" onClick={() => window.location.reload()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>Refresh Data</span>
            </button>
            <Link to="/institution/dashboard" className="ss-banner-btn ss-banner-btn--outline-blue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span>Analytics Suite</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. 4 Solid KPI Metric Cards (Screenshot 11.45.10) ── */}
      <div className="ss-kpi-grid">
        <MetricCard
          variant="blue"
          label="Total Students Enrolled"
          value="1,420"
          progress={95}
          meta="Across 6 engineering branches"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          }
        />

        <MetricCard
          variant="green"
          label="Overall Pass Rate"
          value="94.2%"
          progress={94}
          meta="+3.8% improvement vs last term"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="amber"
          label="Average Attendance"
          value="88.6%"
          progress={89}
          meta="Biometric verified campus-wide"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="cyan"
          label="Placement Readiness"
          value="82.4%"
          progress={82}
          meta="Meeting target industry bar"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          }
        />
      </div>

      {/* ── 3. Tab Bar (Screenshot 11.45.10 & 11.45.24) ── */}
      <div className="ss-tab-bar">
        <button
          className={`ss-tab-bar__item ${adminTab === "overview" ? "is-active" : ""}`}
          onClick={() => setAdminTab("overview")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Overview</span>
        </button>

        <button
          className={`ss-tab-bar__item ${adminTab === "predictive" ? "is-active" : ""}`}
          onClick={() => setAdminTab("predictive")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Predictive Analytics ({atRiskStudents.length} At-Risk)</span>
        </button>

        <button
          className={`ss-tab-bar__item ${adminTab === "compliance" ? "is-active" : ""}`}
          onClick={() => setAdminTab("compliance")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>Compliance & Audit</span>
        </button>

        <button
          className={`ss-tab-bar__item ${adminTab === "trends" ? "is-active" : ""}`}
          onClick={() => setAdminTab("trends")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          <span>Industry Trends</span>
        </button>
      </div>

      {/* ── 4. Tab Views ── */}
      {adminTab === "overview" && (
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Academic Performance Trend Chart */}
            <div className="ss-chart-card mb-4">
              <div className="ss-chart-card__header">
                <div>
                  <h3 className="ss-chart-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    Academic Performance Trajectory
                  </h3>
                  <p className="ss-chart-card__subtitle">Historical student pass percentage over consecutive semesters</p>
                </div>
                <span className="badge bg-success-subtle text-success fw-bold font-monospace px-3 py-1.5 rounded-pill">
                  ↑ 92.4% Latest Term
                </span>
              </div>
              <div className="ss-chart-card__body">
                <LineTrendChart
                  data={academicTrends}
                  height={220}
                  minVal={60}
                  maxVal={100}
                  strokeColor="#2563eb"
                  unit="%"
                  yTicks={[60, 70, 80, 90, 100]}
                />
              </div>
            </div>

            {/* Top Skill Gaps Across Institution */}
            <div className="ss-chart-card">
              <div className="ss-chart-card__header">
                <div>
                  <h3 className="ss-chart-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Institutional Skill Deficits
                  </h3>
                  <p className="ss-chart-card__subtitle">Departmental competencies requiring immediate curriculum intervention</p>
                </div>
                <Link to="/institution/dashboard" className="btn btn-outline-primary btn-sm rounded-3 px-3">
                  Full Analytics →
                </Link>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                      <th>Competency / Skill</th>
                      <th>Branch</th>
                      <th>Avg Deficit Gap</th>
                      <th>Severity</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worst.map((row, idx) => (
                      <tr key={idx} style={{ fontSize: "0.88rem" }}>
                        <td className="fw-bold text-dark">{row.skill}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{row.branch}</span>
                        </td>
                        <td className="font-monospace text-danger fw-semibold">
                          -{row.avgGap} pts
                        </td>
                        <td>
                          <StatusBadge status={row.avgGap <= 0 ? "met" : row.avgGap <= 1.5 ? "developing" : "gap"} />
                        </td>
                        <td className="text-end">
                          <Link to="/institution/dashboard" className="btn btn-sm btn-outline-secondary rounded-3 px-3 py-1">
                            Remediate
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Prediction Distribution Donut Chart (Screenshot 11.45.10 & 11.45.24) */}
            <div className="ss-chart-card mb-4">
              <div className="ss-chart-card__header">
                <div>
                  <h3 className="ss-chart-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 2a10 10 0 0 1 10 10"></path>
                    </svg>
                    Prediction Distribution
                  </h3>
                  <p className="ss-chart-card__subtitle">AI Dropout & At-Risk Categorization</p>
                </div>
              </div>
              <div className="ss-chart-card__body d-flex justify-content-center">
                <DonutRiskChart segments={riskSegments} size={220} />
              </div>
            </div>

            {/* Quick Action Queue Card */}
            <div className="card border rounded-4 p-3 shadow-sm bg-white mb-4">
              <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: "0.95rem" }}>
                Governance Directives
              </h4>
              <div className="d-flex flex-column gap-2.5">
                <Link
                  to="/institution/verification-queue"
                  className="d-flex align-items-center justify-content-between p-2.5 rounded-3 text-decoration-none border hover-shadow"
                  style={{ background: "#f8fafc" }}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <span style={{ fontSize: "1.2rem" }}>🛡️</span>
                    <div>
                      <div className="fw-bold text-dark small">Audit Verification Queue</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>14 unverified credentials pending</div>
                    </div>
                  </div>
                  <span className="badge bg-primary rounded-pill">14</span>
                </Link>

                <Link
                  to="/collaboration"
                  className="d-flex align-items-center justify-content-between p-2.5 rounded-3 text-decoration-none border hover-shadow"
                  style={{ background: "#f8fafc" }}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <span style={{ fontSize: "1.2rem" }}>🤝</span>
                    <div>
                      <div className="fw-bold text-dark small">Industry Collaboration</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>6 active co-curriculum proposals</div>
                    </div>
                  </div>
                  <span className="badge bg-success rounded-pill">6</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Predictive Analytics Tab (Screenshot 11.45.24 & 11.45.30) ── */}
      {adminTab === "predictive" && (
        <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
                Early Warning & At-Risk Student Interventions
              </h3>
              <p className="text-muted small mb-0">
                Machine learning model flagging students with low attendance, academic backlogs, or engagement deficits.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger-subtle text-danger fw-bold px-3 py-1.5 rounded-pill font-monospace">
                Critical Threshold: &lt; 65%
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Risk Score</th>
                  <th>Attendance</th>
                  <th>CGPA</th>
                  <th>Primary Key Concern</th>
                  <th className="text-end">Intervention</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.map((st, idx) => (
                  <tr key={idx} style={{ fontSize: "0.9rem" }}>
                    <td>
                      <div className="fw-bold text-dark">{st.name}</div>
                      <div className="text-muted small font-monospace">{st.rollNo}</div>
                    </td>
                    <td>{st.dept}</td>
                    <td>
                      <span className={`badge ${st.riskLevel === "High Risk" ? "bg-danger" : "bg-warning text-dark"} rounded-pill px-2.5 py-1`}>
                        {st.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`font-monospace fw-bold ${parseInt(st.attendance) < 65 ? "text-danger" : "text-dark"}`}>
                        {st.attendance}
                      </span>
                    </td>
                    <td className="font-monospace fw-bold">{st.cgpa}</td>
                    <td className="text-muted small">{st.keyConcern}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary rounded-3 px-3">
                        {st.action} →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Compliance Tab ── */}
      {adminTab === "compliance" && (
        <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
          <h3 className="fw-bold mb-3" style={{ fontSize: "1.2rem" }}>
            Regulatory & Accreditation Readiness
          </h3>
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <div className="p-3 border rounded-4 bg-light">
                <div className="small text-muted mb-1">ABC Integration</div>
                <div className="h4 fw-bold text-success font-monospace mb-2">100%</div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar bg-success" style={{ width: "100%" }}></div>
                </div>
                <div className="small text-muted mt-2">All students mapped to APAAR</div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="p-3 border rounded-4 bg-light">
                <div className="small text-muted mb-1">NEP 2020 Multi-Entry/Exit</div>
                <div className="h4 fw-bold text-primary font-monospace mb-2">94%</div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar bg-primary" style={{ width: "94%" }}></div>
                </div>
                <div className="small text-muted mt-2">Modular credits recorded</div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="p-3 border rounded-4 bg-light">
                <div className="small text-muted mb-1">Skill Assessment Quota</div>
                <div className="h4 fw-bold text-warning font-monospace mb-2">86%</div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar bg-warning" style={{ width: "86%" }}></div>
                </div>
                <div className="small text-muted mt-2">Target: 90% by year end</div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="p-3 border rounded-4 bg-light">
                <div className="small text-muted mb-1">Faculty-Student Ratio</div>
                <div className="h4 fw-bold text-dark font-monospace mb-2">1:15</div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar bg-info" style={{ width: "92%" }}></div>
                </div>
                <div className="small text-muted mt-2">AICTE Benchmark Compliant</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Trends Tab ── */}
      {adminTab === "trends" && (
        <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
          <h3 className="fw-bold mb-3" style={{ fontSize: "1.2rem" }}>
            Hiring Market Demand Alignment
          </h3>
          <p className="text-muted small mb-4">
            Comparison of top corporate job requirements against current syllabus coverage.
          </p>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                  <th>Skill Cluster</th>
                  <th>Market Hiring Demand</th>
                  <th>Curriculum Match</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-bold text-dark">Cloud Computing & Kubernetes</td>
                  <td>Very High (84 postings)</td>
                  <td>
                    <div className="progress" style={{ height: 8, width: 140 }}>
                      <div className="progress-bar bg-warning" style={{ width: "55%" }}></div>
                    </div>
                  </td>
                  <td><span className="badge bg-warning-subtle text-warning">Curriculum Gap (-45%)</span></td>
                </tr>
                <tr>
                  <td className="fw-bold text-dark">Full Stack React & Node.js</td>
                  <td>High (112 postings)</td>
                  <td>
                    <div className="progress" style={{ height: 8, width: 140 }}>
                      <div className="progress-bar bg-success" style={{ width: "88%" }}></div>
                    </div>
                  </td>
                  <td><span className="badge bg-success-subtle text-success">Well Aligned</span></td>
                </tr>
                <tr>
                  <td className="fw-bold text-dark">Generative AI & LLM Systems</td>
                  <td>Surging (92 postings)</td>
                  <td>
                    <div className="progress" style={{ height: 8, width: 140 }}>
                      <div className="progress-bar bg-danger" style={{ width: "35%" }}></div>
                    </div>
                  </td>
                  <td><span className="badge bg-danger-subtle text-danger">Immediate Elective Needed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Academician Overview (Faculty Portal Benchmark)
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
  const branchName = data?.scopedToBranch || user?.branch || "Computer Science & Engineering";

  const assignedCourses = [
    {
      code: "CS-301",
      title: "Data Structures & Algorithms",
      enrolled: 64,
      avgAttendance: "94%",
      avgScore: 84,
      pendingGrading: 3,
      semester: "Sem 3",
    },
    {
      code: "CS-402",
      title: "Full Stack Web Architecture",
      enrolled: 58,
      avgAttendance: "91%",
      avgScore: 79,
      pendingGrading: 5,
      semester: "Sem 5",
    },
    {
      code: "CS-503",
      title: "Machine Learning & Neural Networks",
      enrolled: 42,
      avgAttendance: "88%",
      avgScore: 86,
      pendingGrading: 0,
      semester: "Sem 7",
    },
  ];

  const todaySchedule = [
    { time: "09:30 AM - 10:30 AM", course: "CS-301 DSA", room: "Hall B-204", type: "Lecture" },
    { time: "11:00 AM - 01:00 PM", course: "CS-402 Web Lab", room: "Lab 3 (Advanced Computing)", type: "Practical" },
    { time: "02:30 PM - 03:30 PM", course: "CS-503 ML Seminar", room: "Audi-1", type: "Tutorial" },
  ];

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "DR";

  return (
    <div>
      {/* ── 1. Hero Banner ── */}
      <div className="ss-hero-banner">
        <div className="ss-hero-banner__content">
          <div className="ss-hero-banner__profile">
            <div className="ss-hero-banner__avatar">
              {userInitials}
            </div>
            <div>
              <h1 className="ss-hero-banner__title">
                Welcome back, {user?.name || "Professor"}!
              </h1>
              <div className="ss-hero-banner__subtitle">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>{user?.email || "faculty@demo.skillsetu.local"}</span>
              </div>
              <div className="ss-hero-banner__chips">
                <span className="ss-hero-banner__chip">
                  🎓 Faculty ID: FAC-2024-884
                </span>
                <span className="ss-hero-banner__chip">
                  🏛️ {branchName}
                </span>
                <span className="ss-hero-banner__chip">
                  📚 3 Active Courses
                </span>
                <span className="ss-hero-banner__chip ss-hero-banner__chip--verified">
                  👥 164 Enrolled Students
                </span>
              </div>
            </div>
          </div>

          <div className="ss-hero-banner__actions">
            <Link to="/collaboration" className="ss-banner-btn ss-banner-btn--white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span>+ Create Assignment</span>
            </Link>
            <Link to="/academician/dashboard" className="ss-banner-btn ss-banner-btn--outline-blue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Faculty Matrix</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. 4 Solid KPI Metric Cards (Screenshot 11.47.53) ── */}
      <div className="ss-kpi-grid">
        <MetricCard
          variant="blue"
          label="Assigned Courses"
          value="3 Courses"
          progress={100}
          meta="164 active students enrolled"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          }
        />

        <MetricCard
          variant="green"
          label="Department Attendance"
          value="91.2%"
          progress={91}
          meta="+2.4% vs departmental average"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="amber"
          label="Pending Grading"
          value="8 Submissions"
          progress={60}
          meta="Milestone reviews awaiting score"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="purple"
          label="Curriculum Alignment"
          value="86%"
          progress={86}
          meta="Mapped to NEP 2020 Guidelines"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          }
        />
      </div>

      {/* ── 3. 2-Column Responsive Layout ── */}
      <div className="row g-4">
        {/* Left Column: Assigned Courses & Skill Gaps */}
        <div className="col-lg-8">
          <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.15rem" }}>Assigned Courses & Cohorts</h3>
                <p className="text-muted small mb-0">Active curriculum sections under your mentorship</p>
              </div>
              <span className="badge bg-primary-subtle text-primary font-monospace">Fall 2026</span>
            </div>

            <div className="d-flex flex-column gap-3">
              {assignedCourses.map((c, idx) => (
                <div key={idx} className="p-3 border rounded-4 bg-light d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-primary text-white font-monospace">{c.code}</span>
                      <span className="badge bg-light text-dark border">{c.semester}</span>
                    </div>
                    <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "1rem" }}>{c.title}</h5>
                    <div className="d-flex gap-3 text-muted small">
                      <span>👥 {c.enrolled} Students</span>
                      <span>📊 {c.avgAttendance} Attendance</span>
                      <span>🎯 {c.avgScore}% Avg Grade</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {c.pendingGrading > 0 && (
                      <span className="badge bg-warning-subtle text-warning border font-monospace">
                        {c.pendingGrading} to grade
                      </span>
                    )}
                    <button className="btn btn-outline-primary btn-sm rounded-3 px-3">
                      Manage Course →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Skill Gap Intel */}
          <div className="ss-chart-card">
            <div className="ss-chart-card__header">
              <div>
                <h3 className="ss-chart-card__title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  Department Student Skill Gaps
                </h3>
                <p className="ss-chart-card__subtitle">Student assessments compared against target curriculum standards</p>
              </div>
              <Link to="/academician/dashboard" className="btn btn-outline-primary btn-sm rounded-3 px-3">
                Full View →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                    <th>Skill / Subject</th>
                    <th>Branch</th>
                    <th>Average Deficit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {worst.map((row, idx) => (
                    <tr key={idx} style={{ fontSize: "0.88rem" }}>
                      <td className="fw-bold text-dark">{row.skill}</td>
                      <td>{row.branch}</td>
                      <td className="font-monospace text-danger fw-semibold">-{row.avgGap} pts</td>
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

        {/* Right Column: Schedule & Directives */}
        <div className="col-lg-4">
          {/* Today's Teaching Schedule (Screenshot 11.47.53) */}
          <div className="card border rounded-4 p-3 mb-4 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h4 className="fw-bold mb-0" style={{ fontSize: "0.95rem" }}>Today's Teaching Schedule</h4>
              <span className="badge bg-light text-dark border">Today</span>
            </div>
            <div className="d-flex flex-column gap-3">
              {todaySchedule.map((s, idx) => (
                <div key={idx} className="p-2.5 border rounded-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-primary-subtle text-primary font-monospace" style={{ fontSize: "0.72rem" }}>
                      {s.type}
                    </span>
                    <span className="text-muted small font-monospace" style={{ fontSize: "0.75rem" }}>
                      {s.time}
                    </span>
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: "0.88rem" }}>{s.course}</div>
                  <div className="text-muted small" style={{ fontSize: "0.78rem" }}>📍 {s.room}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Collaboration Marketplace Banner */}
          <div className="card border rounded-4 p-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span style={{ fontSize: "1.3rem" }}>🤝</span>
              <h4 className="fw-bold mb-0" style={{ fontSize: "0.95rem" }}>Faculty Collaboration</h4>
            </div>
            <p className="text-muted small mb-3">
              Post an FDP, consultancy opportunity, or find an industry expert for curriculum co-creation.
            </p>
            <Link to="/collaboration" className="btn btn-outline-primary btn-sm w-100 rounded-3 fw-semibold">
              Open Marketplace →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Platform Admin Overview (National Oversight Benchmark)
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
      {/* ── 1. Hero Banner ── */}
      <div className="ss-hero-banner">
        <div className="ss-hero-banner__content">
          <div className="ss-hero-banner__profile">
            <div className="ss-hero-banner__avatar" style={{ background: "rgba(255,255,255,0.22)" }}>
              🌐
            </div>
            <div>
              <h1 className="ss-hero-banner__title">
                National Platform Oversight
              </h1>
              <div className="ss-hero-banner__subtitle">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Central Governance Node · All Systems Operational</span>
              </div>
              <div className="ss-hero-banner__chips">
                <span className="ss-hero-banner__chip">
                  ⚡ Multi-Tenant Architecture
                </span>
                <span className="ss-hero-banner__chip">
                  🛡️ AIIA Level 3 Certified
                </span>
                <span className="ss-hero-banner__chip ss-hero-banner__chip--verified">
                  🟢 99.8% System Health
                </span>
              </div>
            </div>
          </div>

          <div className="ss-hero-banner__actions">
            <Link to="/admin/institutions" className="ss-banner-btn ss-banner-btn--white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Add Institution</span>
            </Link>
            <Link to="/institution/verification-queue" className="ss-banner-btn ss-banner-btn--outline-blue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>Global Audits</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. 4 Solid KPI Metric Cards ── */}
      <div className="ss-kpi-grid">
        <MetricCard
          variant="blue"
          label="Partner Institutions"
          value={stats ? `${stats.institutionCount}` : "12"}
          progress={100}
          meta="Accredited Universities & Colleges"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          }
        />

        <MetricCard
          variant="green"
          label="Active Opportunities"
          value={stats ? `${stats.opportunityCount}` : "38"}
          progress={92}
          meta="Live corporate hiring drives"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          }
        />

        <MetricCard
          variant="amber"
          label="Verified Applications"
          value={stats ? `${stats.applicationCount}` : "165"}
          progress={78}
          meta="AI-matched skill candidate passes"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="purple"
          label="Platform Uptime"
          value="99.8%"
          progress={99}
          meta="Zero critical incident record"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
        />
      </div>

      {/* ── 3. 2-Column Responsive Layout ── */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>Platform Users by Role</h3>
                <p className="text-muted small mb-0">Active authenticated accounts in ecosystem</p>
              </div>
              <span className="badge bg-light text-dark border font-monospace">Real-time</span>
            </div>
            <div className="d-flex flex-column gap-3">
              {!stats && <LoadingRows count={4} height={30} />}
              {stats &&
                Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light border">
                    <div className="fw-semibold text-dark text-capitalize">
                      {role.replace("_", " ")}
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-3 font-monospace px-2.5 py-1" style={{ fontSize: "0.8rem" }}>
                      {count} {count === 1 ? "User" : "Users"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border rounded-4 p-4 shadow-sm bg-white">
            <h3 className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: "1.1rem" }}>
              Quick Governance Controls
            </h3>
            <div className="d-flex flex-column gap-2">
              <Link to="/admin/institutions" className="btn btn-outline-secondary btn-sm text-start rounded-3 py-2 px-3 fw-medium d-flex justify-content-between align-items-center">
                <span>🏛️ Manage Institutions Directory</span>
                <span className="text-muted">→</span>
              </Link>
              <Link to="/admin/skills" className="btn btn-outline-secondary btn-sm text-start rounded-3 py-2 px-3 fw-medium d-flex justify-content-between align-items-center">
                <span>🎯 Skills Taxonomy & Ontologies</span>
                <span className="text-muted">→</span>
              </Link>
              <Link to="/admin/assessments" className="btn btn-outline-secondary btn-sm text-start rounded-3 py-2 px-3 fw-medium d-flex justify-content-between align-items-center">
                <span>📝 Official Assessments Catalog</span>
                <span className="text-muted">→</span>
              </Link>
              <Link to="/institution/verification-queue" className="btn btn-outline-primary btn-sm text-start rounded-3 py-2 px-3 fw-semibold d-flex justify-content-between align-items-center">
                <span>🛡️ Global Verification Queue</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
