import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function InstitutionDashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ branches: [], graduationYears: [] });
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("placement");
  const [roster, setRoster] = useState(null);
  const [rosterBranch, setRosterBranch] = useState(null);
  const [cohorts, setCohorts] = useState(null);

  // New Analytics States
  const [placementData, setPlacementData] = useState(null);
  const [skillTrends, setSkillTrends] = useState(null);
  const [internshipData, setInternshipData] = useState(null);

  function loadSummary() {
    api
      .getInstitutionSkillGapSummary(token, { branch, graduationYear })
      .then(({ summary }) => setSummary(summary))
      .catch((err) => setError(err.message));
  }

  function loadAnalytics() {
    Promise.all([
      api.getPlacementReadiness(token),
      api.getSkillDemandTrends(token),
      api.getInternshipOutcomes(token),
    ])
      .then(([p, s, i]) => {
        setPlacementData(p);
        setSkillTrends(s.trends);
        setInternshipData(i);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(loadSummary, [token, branch, graduationYear]);
  useEffect(loadAnalytics, [token]);

  useEffect(() => {
    api.getInstitutionFilterOptions(token).then(setFilterOptions).catch(() => {});
  }, [token]);

  function openRoster(branchName) {
    setRosterBranch(branchName);
    setRoster(null);
    api
      .getBranchRoster(branchName, token, { graduationYear })
      .then(({ roster }) => setRoster(roster))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    if (tab === "cohorts" && !cohorts) {
      api
        .getCohortComparison(token)
        .then(({ cohorts }) => setCohorts(cohorts))
        .catch((err) => setError(err.message));
    }
  }, [tab, cohorts, token]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Institutional Oversight & Analytics"
        title="Institution Analytics Dashboard"
        description="Monitor student skill development, cohort placement readiness, internship participation, and industry skill demand trends."
      />

      <div className="ss-tab-bar mb-4">
        <button
          className={`ss-tab-bar__item ${tab === "placement" ? "is-active" : ""}`}
          onClick={() => setTab("placement")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Placement & Industry Intelligence</span>
        </button>
        <button
          className={`ss-tab-bar__item ${tab === "summary" ? "is-active" : ""}`}
          onClick={() => setTab("summary")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
          </svg>
          <span>Branch Skill-Gaps</span>
        </button>
        <button
          className={`ss-tab-bar__item ${tab === "cohorts" ? "is-active" : ""}`}
          onClick={() => setTab("cohorts")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Cohort Comparison</span>
        </button>
      </div>

      {error && <ErrorState message={error} />}

      {/* TAB 1: Placement & Industry Analytics */}
      {tab === "placement" && (
        <div>
          {!placementData && !error && <LoadingRows count={3} height={120} />}

          {placementData && (
            <>
              {/* Top Metric Cards */}
              <div className="ss-kpi-grid mb-4">
                <MetricCard
                  variant="blue"
                  label="Placement Readiness"
                  value={`${placementData.overallReadiness}%`}
                  progress={placementData.overallReadiness}
                  meta={`${placementData.readyCount} of ${placementData.totalStudents} students ready`}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  }
                />

                <MetricCard
                  variant="amber"
                  label="Developing Cohort"
                  value={`${placementData.developingCount}`}
                  progress={55}
                  meta="Within 1.5 of industry targets"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                  }
                />

                <MetricCard
                  variant="green"
                  label="Internship Milestones"
                  value={`${internshipData?.milestones.completionRate || 100}%`}
                  progress={internshipData?.milestones.completionRate || 100}
                  meta={`${internshipData?.milestones.evaluated || 12} evaluated deliverables`}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  }
                />

                <MetricCard
                  variant="cyan"
                  label="Active Applications"
                  value={`${internshipData?.totalApplications || 0}`}
                  progress={75}
                  meta="Across all campus drives"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  }
                />
              </div>

              {/* Middle Row: Branch-Wise Readiness & Industry Demand Trends */}
              <div className="row g-4 mb-4">
                <div className="col-lg-6">
                  <div className="ss-data-panel h-100 overflow-hidden" style={{ borderRadius: "24px" }}>
                    <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
                      <h2 className="h6 fw-bold mb-0 text-primary-emphasis">Branch-Wise Placement Readiness</h2>
                      <span className="badge bg-success-subtle text-success font-monospace small">Live Tracking</span>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light-subtle">
                          <tr className="small text-muted text-uppercase">
                            <th className="ps-4">Branch</th>
                            <th className="text-center">Total</th>
                            <th className="text-center">Ready</th>
                            <th className="text-end pe-4">Readiness Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {placementData.branchWise.map((b) => (
                            <tr key={b.branch}>
                              <td className="ps-4 fw-semibold text-primary-emphasis">{b.branch}</td>
                              <td className="text-center font-monospace">{b.total}</td>
                              <td className="text-center font-monospace text-success fw-bold">
                                {b.ready}
                              </td>
                              <td className="text-end pe-4 font-monospace">
                                <span
                                  className={`badge ${
                                    b.readinessRate >= 60
                                      ? "bg-success-subtle text-success"
                                      : b.readinessRate >= 30
                                      ? "bg-warning-subtle text-warning"
                                      : "bg-danger-subtle text-danger"
                                  }`}
                                >
                                  {b.readinessRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Top Industry Skill Demand Trends */}
                <div className="col-lg-6">
                  <div className="ss-data-panel h-100 p-4" style={{ borderRadius: "24px" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <div>
                        <h2 className="h6 fw-bold mb-0 text-primary-emphasis">Industry Skill Demand Trends</h2>
                        <span className="small text-muted" style={{ fontSize: "0.75rem" }}>Most requested skills in open postings</span>
                      </div>
                      <span className="badge bg-warning-subtle text-dark font-monospace small">Market Signals</span>
                    </div>
                    <div className="d-flex flex-column gap-2.5">
                      {skillTrends?.slice(0, 5).map((t) => (
                        <div key={t.skillId} className="p-3 rounded-3" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
                          <div className="d-flex justify-content-between align-items-center mb-1.5">
                            <div>
                              <strong className="text-primary-emphasis">{t.skillName}</strong>
                              <span className="badge bg-secondary-subtle text-secondary ms-2 small">
                                {t.category}
                              </span>
                            </div>
                            <span className="badge bg-dark text-white font-monospace">
                              {t.demandCount} Openings
                            </span>
                          </div>
                          <div className="d-flex justify-content-between small text-secondary">
                            <span>Req. Proficiency: {t.avgRequired}/5</span>
                            <span>Student Avg: {t.avgStudentScore}/5</span>
                            <span
                              className={
                                t.gap > 0 ? "text-danger fw-semibold" : "text-success fw-semibold"
                              }
                            >
                              Supply Gap: {t.gap > 0 ? `-${t.gap}` : "Met"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Branch Skill-Gaps Summary */}
      {tab === "summary" && (
        <>
          <div className="ss-filter-bar">
            <select
              className="form-select form-select-sm w-auto"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="">All branches</option>
              {filterOptions.branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm w-auto"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
            >
              <option value="">All cohorts</option>
              {filterOptions.graduationYears.map((y) => (
                <option key={y} value={y}>
                  Class of {y}
                </option>
              ))}
            </select>
          </div>

          {!summary && !error && <LoadingRows count={3} height={120} />}
          {summary && summary.length === 0 && (
            <EmptyState
              title="No skill-gap data for this filter"
              description="Try a different branch or cohort."
            />
          )}

          {summary?.map((b) => (
            <div className="ss-data-panel mb-4 overflow-hidden" key={b.branch} style={{ borderRadius: "16px" }}>
              <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-warning-subtle text-dark font-monospace">Branch</span>
                  <h2 className="h6 mb-0 fw-bold text-primary-emphasis">{b.branch}</h2>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm rounded-3 px-3"
                  onClick={() => openRoster(b.branch)}
                >
                  View student roster ↗
                </button>
              </div>
              <div className="table-responsive mb-0">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light-subtle">
                    <tr className="small text-muted text-uppercase">
                      <th className="ps-4">Skill / Competency</th>
                      <th>Category</th>
                      <th className="text-center">Avg. Current</th>
                      <th className="text-center">Avg. Target</th>
                      <th className="text-center">Avg. Gap</th>
                      <th className="pe-4 text-end">Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.skills.map((s) => (
                      <tr key={s.skill}>
                        <td className="ps-4 fw-semibold text-primary-emphasis">{s.skill}</td>
                        <td className="text-secondary small">{s.category}</td>
                        <td className="text-center font-monospace small">{s.avgCurrent.toFixed(1)} / 5.0</td>
                        <td className="text-center font-monospace small">{s.avgTarget.toFixed(1)} / 5.0</td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              s.avgGap <= 0
                                ? "bg-success-subtle text-success"
                                : s.avgGap <= 1.5
                                ? "bg-warning-subtle text-warning"
                                : "bg-danger-subtle text-danger"
                            }`}
                          >
                            {s.avgGap.toFixed(1)}
                          </span>
                        </td>
                        <td className="pe-4 text-end font-monospace small text-secondary">{s.studentCount || s.count || 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {rosterBranch && (
            <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Student roster — {rosterBranch}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setRosterBranch(null)}
                    />
                  </div>
                  <div className="modal-body">
                    {!roster && <LoadingRows count={3} height={40} />}
                    {roster && roster.length === 0 && (
                      <EmptyState title="No students found for this branch" />
                    )}
                    {roster && roster.length > 0 && (
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Cohort</th>
                            <th>Assessments</th>
                            <th>Top skill</th>
                            <th>Biggest gap</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roster.map((s) => (
                            <tr key={s._id}>
                              <td className="fw-semibold">{s.name}</td>
                              <td className="text-secondary">{s.graduationYear || "—"}</td>
                              <td className="text-secondary">{s.assessmentsTaken}</td>
                              <td className="text-secondary">{s.topSkill || "—"}</td>
                              <td>
                                {s.biggestGap ? (
                                  <span className="badge bg-danger-subtle text-danger">
                                    {s.biggestGap}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 3: Cohort comparison */}
      {tab === "cohorts" && (
        <div>
          {!cohorts && !error && <LoadingRows count={2} height={140} />}
          {cohorts && cohorts.length === 0 && <EmptyState title="No cohort data available" />}
          <div className="d-flex flex-column gap-4">
            {cohorts?.map((c) => (
              <div className="ss-data-panel overflow-hidden" key={c.year} style={{ borderRadius: "24px" }}>
                <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning-subtle text-dark font-monospace">Graduation Cohort</span>
                    <h2 className="h6 fw-bold mb-0 text-primary-emphasis">Class of {c.year}</h2>
                  </div>
                  <span className="small text-muted font-monospace">
                    {c.studentCount} Students Enrolled
                  </span>
                </div>
                <div className="p-4">
                  <div className="row g-3">
                    {c.skills.map((s) => (
                      <div className="col-md-4" key={s.skill}>
                        <div className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
                          <div>
                            <span className="fw-semibold text-primary-emphasis small">{s.skill}</span>
                            <div className="small text-muted font-monospace">
                              Avg: {s.avgCurrent.toFixed(1)} / 5.0
                            </div>
                          </div>
                          <span
                            className={`badge ${
                              s.avgGap <= 0 ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                            }`}
                          >
                            {s.avgGap <= 0 ? "On Track" : `Gap ${s.avgGap.toFixed(1)}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
