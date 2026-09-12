import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import MatchBreakdown from "../components/ui/MatchBreakdown.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function OpportunityBrowse() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState(null);
  const [applied, setApplied] = useState({});
  const [error, setError] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([api.listOpportunities(token), api.getMyApplications(token)])
      .then(([{ opportunities }, { applications }]) => {
        setOpportunities(opportunities);
        const map = {};
        for (const a of applications) map[a.opportunity._id] = a;
        setApplied(map);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  async function handleApply(opportunityId) {
    setApplyingId(opportunityId);
    setError(null);
    try {
      const { application } = await api.applyToOpportunity(opportunityId, token);
      setApplied((m) => ({ ...m, [opportunityId]: application }));
    } catch (err) {
      setError(err.message);
    } finally {
      setApplyingId(null);
    }
  }

  const filteredOpportunities = opportunities
    ?.filter((o) => {
      if (!o.title) return false;
      if (/^[A-Z]{6,}$/.test(o.title.trim()) && !/[AEIOU]/.test(o.title.trim())) return false;
      return true;
    })
    ?.filter((o) => {
      if (activeTab === "all") return true;
      if (activeTab === "remote") return o.isRemote;
      return o.type === activeTab;
    })
    ?.filter((o) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.title?.toLowerCase().includes(q) ||
        o.companyName?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q)
      );
    });

  const appliedCount = Object.keys(applied).length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Industry Matching Engine"
        title="Browse Opportunities"
        description="Explore centralized internships, apprenticeships, and placement drives with verified skill requirements and match transparency."
        actions={
          <Link to="/applications" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            {t("View My Applications →")}
          </Link>
        }
      />

      {error && <ErrorState message={error} />}
      {!opportunities && !error && <LoadingRows count={3} height={140} />}
      {opportunities && opportunities.length === 0 && (
        <EmptyState
          title={t("No open opportunities yet")}
          description={t("Check back soon — postings appear here as industry partners publish them.")}
        />
      )}

      {opportunities && opportunities.length > 0 && (
        <>
          {/* KPI Summary Row */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Live Postings"
                value={opportunities.length}
                meta="Active verified openings"
                variant="surface-blue"
                icon="💼"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="My Applications"
                value={appliedCount}
                meta={appliedCount > 0 ? "Under review" : "Ready to apply"}
                variant="surface-purple"
                icon="📄"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Remote Openings"
                value={opportunities.filter((o) => o.isRemote).length}
                meta="Work from anywhere"
                variant="surface-green"
                icon="🌐"
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <MetricCard
                label="Match Transparency"
                value="100%"
                meta="Objective competency rubric"
                variant="surface-amber"
                icon="🎯"
              />
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="ss-data-panel p-3 mb-4" style={{ borderRadius: "16px" }}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="small fw-bold text-muted text-uppercase me-1" style={{ fontSize: "0.75rem" }}>
                  {t("Type:")}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`ss-filter-btn ${activeTab === "all" ? "is-active" : ""}`}
                >
                  {t("All Postings")} ({opportunities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("internship")}
                  className={`ss-filter-btn ${activeTab === "internship" ? "is-active" : ""}`}
                >
                  {t("Internships")} ({opportunities.filter((o) => o.type === "internship").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("apprenticeship")}
                  className={`ss-filter-btn ${activeTab === "apprenticeship" ? "is-active" : ""}`}
                >
                  {t("Apprenticeships")} ({opportunities.filter((o) => o.type === "apprenticeship").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("job")}
                  className={`ss-filter-btn ${activeTab === "job" ? "is-active" : ""}`}
                >
                  {t("Jobs")} ({opportunities.filter((o) => o.type === "job").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("remote")}
                  className={`ss-filter-btn ${activeTab === "remote" ? "is-active" : ""}`}
                >
                  {t("Remote")} ({opportunities.filter((o) => o.isRemote).length})
                </button>
              </div>

              <div style={{ minWidth: "220px" }}>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill px-3"
                  placeholder={t("Search opportunities...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="d-flex flex-column gap-3">
        {filteredOpportunities?.map((o) => {
          const existingApplication = applied[o._id];
          return (
            <div className="ss-card-modern" key={o._id}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <h2 className="h5 fw-bold mb-0">{o.title}</h2>
                    <span className="badge bg-primary-subtle text-primary text-uppercase font-monospace" style={{ fontSize: "0.7rem" }}>
                      {o.type.replace("_", " ")}
                    </span>
                    {o.isRemote && (
                      <span className="badge bg-success-subtle text-success" style={{ fontSize: "0.7rem" }}>
                        {t("Remote")}
                      </span>
                    )}
                    {o.stipend && (
                      <span className="badge bg-success-subtle text-success fw-bold text-nowrap" style={{ fontSize: "0.72rem" }}>
                        {o.stipend}
                      </span>
                    )}
                    {o.duration && (
                      <span className="badge bg-light text-secondary border fw-medium text-nowrap" style={{ fontSize: "0.72rem" }}>
                        ⏱ {o.duration}
                      </span>
                    )}
                  </div>
                  <p className="small text-secondary mb-2">
                    <strong className="text-dark">{o.companyName}</strong> · {o.location || t("Location flexible")}
                  </p>
                </div>

                <div>
                  {existingApplication ? (
                    <StatusBadge status={existingApplication.status} />
                  ) : (
                    <button
                      className="btn btn-primary btn-sm px-4 fw-semibold rounded-pill"
                      disabled={applyingId === o._id}
                      onClick={() => handleApply(o._id)}
                    >
                      {applyingId === o._id ? t("Applying…") : t("Apply Now")}
                    </button>
                  )}
                </div>
              </div>

              {o.description && (
                <p className="small text-secondary mt-2 mb-3" style={{ lineHeight: 1.55 }}>
                  {o.description}
                </p>
              )}

              {/* Eligibility details if any */}
              {o.eligibility && (o.eligibility.minGpa > 0 || o.eligibility.eligibleBranches?.length > 0) && (
                <div className="p-2.5 rounded-3 bg-light border mb-2.5 small text-secondary">
                  <strong className="text-dark">{t("Eligibility:")}</strong>{" "}
                  {o.eligibility.minGpa > 0 && <span>{t("Min CGPA:")} <strong className="text-dark">{o.eligibility.minGpa}</strong> · </span>}
                  {o.eligibility.eligibleBranches?.length > 0 && (
                    <span>{t("Branches:")} <span className="text-dark">{o.eligibility.eligibleBranches.join(", ")}</span> · </span>
                  )}
                  {o.eligibility.graduationYears?.length > 0 && (
                    <span>{t("Batches:")} <span className="text-dark">{o.eligibility.graduationYears.join(", ")}</span></span>
                  )}
                </div>
              )}

              <div className="d-flex flex-wrap align-items-center gap-2 pt-2.5 border-top">
                <span className="small text-secondary fw-semibold">{t("Required Skills:")}</span>
                {o.requiredSkills.map((rs) => (
                  <span key={rs.skill?._id || rs.skill} className="badge bg-light text-dark border fw-medium" style={{ fontSize: "0.75rem" }}>
                    {rs.skill?.name || "Skill"} <span className="text-primary fw-bold">≥ {rs.minProficiency}/5</span>
                  </span>
                ))}
              </div>

              {existingApplication && (
                <div className="mt-3 pt-2.5 border-top">
                  <details>
                    <summary className="small fw-bold text-primary py-1" style={{ cursor: "pointer", userSelect: "none" }}>
                      {t("Match Analysis")} — {existingApplication.matchScore}% {t("skill match")}
                    </summary>
                    <div className="mt-3">
                      <MatchBreakdown rows={existingApplication.matchBreakdown} />
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
