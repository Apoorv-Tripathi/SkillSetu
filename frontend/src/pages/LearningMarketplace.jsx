import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function LearningMarketplace() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState(null);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledMap, setEnrolledMap] = useState({});

  useEffect(() => {
    api
      .listOpportunities(token, { type: "learning" })
      .then(({ opportunities }) => setOpportunities(opportunities))
      .catch((err) => setError(err.message));
  }, [token]);

  const filtered = opportunities?.filter((opp) => {
    if (activeFilter !== "all" && opp.type !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        opp.title?.toLowerCase().includes(q) ||
        opp.companyName?.toLowerCase().includes(q) ||
        opp.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEnroll = (id) => {
    setEnrolledMap((prev) => ({ ...prev, [id]: true }));
  };

  const enrolledCount = Object.keys(enrolledMap).length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Industry Upskilling & Certifications"
        title="Learning Marketplace"
        description="Explore training programs, certification courses, and workshops published by industry partners to bridge your skill gaps."
        actions={
          <Link to="/skill-gap" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            {t("View My Skill Gaps →")}
          </Link>
        }
      />

      {error && <ErrorState message={error} />}
      {!opportunities && !error && <LoadingRows count={3} height={120} />}

      {opportunities && (
        <>
          {/* KPI Summary Row */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Available Programs"
                value={opportunities.length}
                meta="Industry-vetted modules"
                variant="surface-blue"
                icon="🎓"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Enrolled Courses"
                value={enrolledCount}
                meta={enrolledCount > 0 ? "Active in your profile" : "Select a track to enroll"}
                variant="surface-green"
                icon="📚"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Industry Partners"
                value="4 Partners"
                meta="Curated syllabus & labs"
                variant="surface-purple"
                icon="🏢"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Passport Sync"
                value="Verified"
                meta="Auto-awarded upon completion"
                variant="surface-amber"
                icon="🛡"
              />
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="ss-data-panel p-3 mb-4" style={{ borderRadius: "16px" }}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="small fw-bold text-muted text-uppercase me-1" style={{ fontSize: "0.75rem" }}>
                  {t("Filter:")}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={`ss-filter-btn ${activeFilter === "all" ? "is-active" : ""}`}
                >
                  {t("All Programs")} ({opportunities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("training_program")}
                  className={`ss-filter-btn ${activeFilter === "training_program" ? "is-active" : ""}`}
                >
                  {t("Training Modules")} ({opportunities.filter((o) => o.type === "training_program").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("certification_course")}
                  className={`ss-filter-btn ${activeFilter === "certification_course" ? "is-active" : ""}`}
                >
                  {t("Certifications")} ({opportunities.filter((o) => o.type === "certification_course").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("workshop")}
                  className={`ss-filter-btn ${activeFilter === "workshop" ? "is-active" : ""}`}
                >
                  {t("Workshops")} ({opportunities.filter((o) => o.type === "workshop").length})
                </button>
              </div>

              <div style={{ minWidth: "220px" }}>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill px-3"
                  placeholder={t("Search programs...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={t("No learning programs match your filter")}
              description={t("Industry partners and institutions regularly post new certification modules. Try selecting another filter.")}
            />
          ) : (
            <div className="row g-4">
              {filtered.map((opp) => (
                <div className="col-lg-6" key={opp._id}>
                  <div
                    className="ss-card-modern h-100 d-flex flex-column justify-content-between p-4"
                    style={{
                      borderRadius: "20px",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <div>
                      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span
                            className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold text-uppercase px-2.5 py-1 rounded-pill"
                            style={{ fontSize: "0.72rem" }}
                          >
                            {opp.type.replace(/_/g, " ")}
                          </span>
                          {opp.stipend && (
                            <span
                              className="badge bg-success-subtle text-success border border-success-subtle fw-bold text-nowrap px-2.5 py-1 rounded-pill"
                              style={{ fontSize: "0.72rem" }}
                            >
                              {opp.stipend}
                            </span>
                          )}
                        </div>
                        <span className="badge bg-light text-secondary border fw-semibold text-nowrap px-2.5 py-1 rounded-pill" style={{ fontSize: "0.72rem" }}>
                          ⏱ {opp.duration || t("Self-Paced")}
                        </span>
                      </div>

                      <h3 className="h5 fw-bold mb-1 text-dark">{opp.title}</h3>
                      <p className="small text-secondary mb-3">
                        {t("Offered by")} <strong className="text-dark">{opp.companyName}</strong> · {opp.location || t("Online")}
                      </p>

                      <p className="small text-secondary mb-4" style={{ lineHeight: 1.6 }}>
                        {opp.description}
                      </p>

                      {opp.requiredSkills?.length > 0 && (
                        <div className="mb-3">
                          <span className="small text-secondary fw-semibold d-block mb-2" style={{ fontSize: "0.75rem" }}>
                            {t("Target Competencies:")}
                          </span>
                          <div className="d-flex flex-wrap gap-1.5">
                            {opp.requiredSkills.map((rs) => (
                              <span
                                key={rs.skill?._id || rs.skill}
                                className="badge bg-light text-dark border px-2.5 py-1 fw-semibold rounded-pill"
                                style={{ fontSize: "0.74rem" }}
                              >
                                {rs.skill?.name || "Skill"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <span className="small text-muted fw-medium d-flex align-items-center gap-1.5" style={{ fontSize: "0.78rem" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {t("Verified Credential on Completion")}
                      </span>
                      {enrolledMap[opp._id] ? (
                        <span className="badge bg-success text-white py-2 px-3.5 rounded-pill fw-bold">
                          ✓ {t("Enrolled / Active")}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEnroll(opp._id)}
                          className="btn btn-primary btn-sm px-4 fw-bold rounded-pill shadow-sm"
                        >
                          {t("Start Learning →")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
