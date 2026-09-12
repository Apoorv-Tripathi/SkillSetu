import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function AssessmentList() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [assessments, setAssessments] = useState(null);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api
      .listAssessments(token)
      .then(({ assessments }) => setAssessments(assessments))
      .catch((err) => setError(err.message));
  }, [token]);

  const filteredAssessments = assessments?.filter((a) => {
    if (activeCategory !== "all") {
      if (activeCategory === "technical" && a.category !== "technical") return false;
      if (activeCategory === "domain" && a.category !== "domain") return false;
      if (activeCategory === "soft_skill" && a.category !== "soft_skill") return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalQuestions = assessments?.reduce((acc, a) => acc + (a.questions?.length || 15), 0) || 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Skill Intelligence Engine"
        title="Diagnostic Skill Assessments"
        description="Structured, skill-mapped evaluations that directly update your verified competency radar and industry match scores."
        actions={
          <Link to="/career-roadmap" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            {t("View Career Roadmap →")}
          </Link>
        }
      />

      {error && <ErrorState message={error} />}
      {!assessments && !error && <LoadingRows count={3} height={120} />}

      {assessments && (
        <>
          {/* KPI Metric Summary Row */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Available Tests"
                value={assessments.length}
                meta="Mapped to live benchmarks"
                variant="surface-blue"
                icon="📋"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Total Questions"
                value={totalQuestions}
                meta="Adaptive diagnostic items"
                variant="surface-purple"
                icon="📝"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Avg. Duration"
                value="25 Mins"
                meta="Proctored & timed sessions"
                variant="surface-green"
                icon="⏱"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Passport Sync"
                value="Instant"
                meta="Auto-verified competencies"
                variant="surface-amber"
                icon="🛡"
              />
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="ss-data-panel p-3 mb-4" style={{ borderRadius: "16px" }}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="small fw-bold text-muted text-uppercase me-1" style={{ fontSize: "0.75rem" }}>
                  {t("Category:")}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`ss-filter-btn ${activeCategory === "all" ? "is-active" : ""}`}
                >
                  {t("All")} ({assessments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("technical")}
                  className={`ss-filter-btn ${activeCategory === "technical" ? "is-active" : ""}`}
                >
                  {t("Technical")} ({assessments.filter((a) => a.category === "technical").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("domain")}
                  className={`ss-filter-btn ${activeCategory === "domain" ? "is-active" : ""}`}
                >
                  {t("Systems & Cloud")} ({assessments.filter((a) => a.category === "domain").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("soft_skill")}
                  className={`ss-filter-btn ${activeCategory === "soft_skill" ? "is-active" : ""}`}
                >
                  {t("Soft Skills")} ({assessments.filter((a) => a.category === "soft_skill").length})
                </button>
              </div>

              <div style={{ minWidth: "220px" }}>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill px-3"
                  placeholder={t("Search evaluations...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredAssessments.length === 0 ? (
            <EmptyState
              title={t("No matching assessments")}
              description={t("Try switching categories or clearing your search query.")}
            />
          ) : (
            <div className="row g-4">
              {filteredAssessments.map((a) => {
                const isSoftSkill = a.category === "soft_skill" || a.category?.includes("soft");
                const isDomain = a.category === "domain";
                const badgeClass = isSoftSkill
                  ? "bg-info-subtle text-info border border-info-subtle"
                  : isDomain
                  ? "bg-purple-subtle text-purple border border-purple-subtle"
                  : "bg-primary-subtle text-primary border border-primary-subtle";

                return (
                  <div className="col-md-6" key={a._id}>
                    <div
                      className="ss-data-panel h-100 d-flex flex-column justify-content-between p-4"
                      style={{
                        borderRadius: "20px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span
                            className={`badge fw-bold text-uppercase px-2.5 py-1 rounded-pill ${
                              isSoftSkill
                                ? "bg-info-subtle text-info border border-info-subtle"
                                : "bg-primary-subtle text-primary border border-primary-subtle"
                            }`}
                            style={{ fontSize: "0.72rem" }}
                          >
                            {a.category === "domain"
                              ? "Systems & Cloud"
                              : a.category
                              ? a.category.replace(/_/g, " ")
                              : t("Diagnostic Evaluation")}
                          </span>
                          <span
                            className="badge bg-success-subtle text-success fw-semibold px-2.5 py-1 rounded-pill"
                            style={{ fontSize: "0.72rem" }}
                          >
                            ✓ {t("Skill-Mapped")}
                          </span>
                        </div>

                        <h2 className="h5 fw-bold mb-2 text-dark">{a.title}</h2>
                        <p className="text-secondary small mb-4" style={{ lineHeight: "1.6" }}>
                          {a.description ||
                            t("Evaluate and benchmark your real-world problem solving capabilities with industry-standard skill mapping.")}
                        </p>

                        <div className="d-flex flex-wrap gap-3 mb-4 pb-2">
                          <div className="d-flex align-items-center gap-1.5 text-muted small">
                            <span style={{ fontSize: "0.9rem" }}>⏱</span>
                            <span className="fw-semibold text-dark" style={{ fontSize: "0.8rem" }}>
                              {a.durationMinutes || 25} {t("Mins")}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-1.5 text-muted small">
                            <span style={{ fontSize: "0.9rem" }}>📝</span>
                            <span className="fw-semibold text-dark" style={{ fontSize: "0.8rem" }}>
                              {a.questions?.length || 15} {t("Questions")}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-1.5 text-muted small">
                            <span style={{ fontSize: "0.9rem" }}>🎯</span>
                            <span className="fw-semibold text-dark" style={{ fontSize: "0.8rem" }}>
                              {t("Adaptive Scoring")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                        <span
                          className="badge bg-light text-secondary border fw-medium px-2.5 py-1 rounded-pill"
                          style={{ fontSize: "0.72rem" }}
                        >
                          🛡 {t("Official Diagnostic")}
                        </span>
                        <Link
                          to={`/assessments/${a._id}`}
                          className="btn btn-primary btn-sm px-4 fw-bold shadow-sm rounded-pill"
                        >
                          {t("Start Assessment →")}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
