import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import ApplicationTimeline from "../components/ui/ApplicationTimeline.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function MyApplications() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [applications, setApplications] = useState(null);
  const [milestonesByApp, setMilestonesByApp] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMyApplications(token)
      .then(async ({ applications }) => {
        setApplications(applications);
        const inProgress = applications.filter((a) => ["interview", "offer", "shortlisted"].includes(a.status));
        const entries = await Promise.all(
          inProgress.map((a) =>
            api
              .getMilestonesForApplication(a._id, token)
              .then(({ milestones }) => [a._id, milestones])
              .catch(() => [a._id, []])
          )
        );
        setMilestonesByApp(Object.fromEntries(entries));
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const totalApps = applications?.length || 0;
  const interviewsCount = applications?.filter((a) => a.status === "interview").length || 0;
  const shortlistedCount = applications?.filter((a) => a.status === "shortlisted").length || 0;
  const totalMilestones = Object.values(milestonesByApp).reduce((acc, list) => acc + (list?.length || 0), 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Placement & Internship Pipeline"
        title="My Applications & Milestones"
        description="Track live recruitment stages from initial screening to technical interviews, offer releases, and mentored milestone reviews."
        actions={
          <Link to="/opportunities/browse" className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm">
            {t("Browse More Opportunities →")}
          </Link>
        }
      />

      {error && <ErrorState message={error} />}
      {!applications && !error && <LoadingRows count={2} height={130} />}

      {applications && applications.length === 0 && (
        <EmptyState
          title={t("You haven't applied to anything yet")}
          description={t("Discover curated internships and placement opportunities matching your skill competencies.")}
          action={
            <Link to="/opportunities/browse" className="btn btn-primary btn-sm rounded-pill px-4">
              {t("Browse opportunities")}
            </Link>
          }
        />
      )}

      {applications && applications.length > 0 && (
        <>
          {/* KPI Summary Row */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Total Applications"
                value={totalApps}
                meta="Submitted to recruiters"
                variant="surface-blue"
                icon="💼"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Technical Interviews"
                value={interviewsCount}
                meta="In active evaluation"
                variant="surface-purple"
                icon="🎯"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Shortlisted Profiles"
                value={shortlistedCount}
                meta="Stage 2 screening cleared"
                variant="surface-green"
                icon="✓"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Tracked Milestones"
                value={totalMilestones}
                meta="Mentored project tasks"
                variant="surface-amber"
                icon="🚩"
              />
            </div>
          </div>

          {/* Balanced 2-Column Layout */}
          <div className="row g-4">
            {/* Left Column: Applications Cards */}
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-3">
                {applications.map((a) => (
                  <div
                    className="ss-card-modern p-4"
                    key={a._id}
                    style={{
                      borderRadius: "20px",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <h2 className="h5 fw-bold mb-0 text-dark">{a.opportunity?.title || t("Role")}</h2>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="small text-secondary mb-0">
                          <strong className="text-dark">{a.opportunity?.companyName || t("Company")}</strong>
                          {a.opportunity?.location ? ` · ${a.opportunity.location}` : ""}
                        </p>
                      </div>
                      <span
                        className="badge fw-bold px-3 py-1.5 rounded-pill"
                        style={{
                          background: "rgba(79, 70, 229, 0.08)",
                          color: "#4f46e5",
                          fontSize: "0.82rem",
                        }}
                      >
                        {t("Match Score:")} {a.matchScore}%
                      </span>
                    </div>

                    <div className="py-2">
                      <ApplicationTimeline status={a.status} />
                    </div>

                    {a.mentor && (
                      <div className="mt-3 p-2.5 bg-light rounded-3 small text-secondary d-flex align-items-center gap-2 border">
                        <span>👨‍🏫</span>
                        <span>
                          <strong className="text-dark">{t("Industry Mentor:")}</strong> {a.mentor.name}
                        </span>
                      </div>
                    )}

                    {milestonesByApp[a._id]?.length > 0 && (
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center mb-2.5">
                          <span className="small fw-bold text-dark text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.04em" }}>
                            🏁 {t("Sprint Milestones & Deliverables")} ({milestonesByApp[a._id].length})
                          </span>
                          <span className="small text-muted" style={{ fontSize: "0.72rem" }}>
                            {t("Evaluated against verified skill rubrics")}
                          </span>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          {milestonesByApp[a._id].map((m) => (
                            <div
                              key={m._id}
                              className="d-flex justify-content-between align-items-center small p-2.5 bg-light rounded-3 border"
                            >
                              <div>
                                <div className="fw-semibold text-dark">{m.title}</div>
                                {m.description && (
                                  <div className="text-muted small mt-0.5" style={{ fontSize: "0.74rem" }}>
                                    {m.description}
                                  </div>
                                )}
                              </div>
                              <StatusBadge status={m.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Support & Preparation Guidance */}
            <div className="col-lg-4">
              {/* Interview Preparation Checklist */}
              <div className="ss-data-panel p-4 mb-4" style={{ borderRadius: "20px" }}>
                <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                  <span>🎯</span> {t("Interview Readiness Checklist")}
                </h3>
                <ul className="list-unstyled small mb-3 d-flex flex-column gap-2 text-secondary">
                  <li className="d-flex align-items-start gap-2">
                    <span className="text-success fw-bold">✓</span>
                    <span>Review your verified skill heatmap and high-match competencies.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <span className="text-success fw-bold">✓</span>
                    <span>Prepare explanations for project architecture decisions.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <span className="text-success fw-bold">✓</span>
                    <span>Ensure milestone deliverables are committed on your repository.</span>
                  </li>
                </ul>
                <Link to="/career-roadmap" className="btn btn-outline-primary btn-sm w-100 rounded-pill fw-semibold">
                  {t("Review Career Roadmap →")}
                </Link>
              </div>

              {/* Mentorship Support Card */}
              <div
                className="p-4 rounded-4"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e0e7ff",
                  borderLeft: "4px solid #4f46e5",
                  boxShadow: "0 4px 20px -4px rgba(79, 70, 229, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
                  borderRadius: "20px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    className="badge fw-bold"
                    style={{
                      background: "#eef2ff",
                      color: "#4338ca",
                      border: "1px solid #c7d2fe",
                      fontSize: "0.72rem",
                    }}
                  >
                    Industry Mentorship
                  </span>
                  <span className="small text-muted fw-medium" style={{ fontSize: "0.72rem" }}>
                    Verified
                  </span>
                </div>
                <h4 className="h6 fw-bold text-dark mb-2">{t("Milestone Evaluation Guide")}</h4>
                <p className="small text-muted mb-3" style={{ lineHeight: 1.55 }}>
                  {t("Every milestone is evaluated by industry mentors on code quality, test coverage, and documentation.")}
                </p>
                <Link
                  to="/assessments"
                  className="btn btn-primary btn-sm w-100 fw-bold rounded-pill shadow-sm"
                >
                  {t("Diagnostic Assessments →")}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
