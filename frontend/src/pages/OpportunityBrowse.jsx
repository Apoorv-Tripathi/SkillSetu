import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
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

  const filteredOpportunities = opportunities?.filter((o) => {
    if (activeTab === "all") return true;
    if (activeTab === "remote") return o.isRemote;
    return o.type === activeTab;
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Industry Matching Engine"
        title="Browse Opportunities"
        description="Explore centralized internships, apprenticeships, and placement drives with verified skill requirements and match transparency."
      />

      {error && <ErrorState message={error} />}
      {!opportunities && !error && <LoadingRows count={3} height={140} />}
      {opportunities && opportunities.length === 0 && (
        <EmptyState
          title={t("No open opportunities yet")}
          description={t("Check back soon — postings appear here as industry partners publish them.")}
        />
      )}

      {/* Filter Tabs */}
      {opportunities && opportunities.length > 0 && (
        <div className="ss-filter-bar mb-4">
          <span className="small fw-bold text-secondary text-uppercase me-2">{t("Type:")}</span>
          <button
            onClick={() => setActiveTab("all")}
            className={`badge px-3 py-2 rounded-pill border-0 ${
              activeTab === "all" ? "bg-primary text-white" : "bg-light text-secondary border"
            }`}
          >
            {t("All Postings")} ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab("internship")}
            className={`badge px-3 py-2 rounded-pill border-0 ${
              activeTab === "internship" ? "bg-primary text-white" : "bg-light text-secondary border"
            }`}
          >
            {t("Internships")} ({opportunities.filter((o) => o.type === "internship").length})
          </button>
          <button
            onClick={() => setActiveTab("apprenticeship")}
            className={`badge px-3 py-2 rounded-pill border-0 ${
              activeTab === "apprenticeship" ? "bg-primary text-white" : "bg-light text-secondary border"
            }`}
          >
            {t("Apprenticeships")} ({opportunities.filter((o) => o.type === "apprenticeship").length})
          </button>
          <button
            onClick={() => setActiveTab("job")}
            className={`badge px-3 py-2 rounded-pill border-0 ${
              activeTab === "job" ? "bg-primary text-white" : "bg-light text-secondary border"
            }`}
          >
            {t("Placements & Jobs")} ({opportunities.filter((o) => o.type === "job").length})
          </button>
          <button
            onClick={() => setActiveTab("remote")}
            className={`badge px-3 py-2 rounded-pill border-0 ${
              activeTab === "remote" ? "bg-primary text-white" : "bg-light text-secondary border"
            }`}
          >
            {t("Remote")} ({opportunities.filter((o) => o.isRemote).length})
          </button>
        </div>
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
                      <span className="badge bg-warning-subtle text-warning-emphasis font-monospace" style={{ fontSize: "0.7rem" }}>
                        {o.stipend}
                      </span>
                    )}
                    {o.duration && (
                      <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: "0.7rem" }}>
                        {o.duration}
                      </span>
                    )}
                  </div>
                  <p className="small text-secondary mb-2">
                    <strong>{o.companyName}</strong> · {o.location || t("Location flexible")}
                  </p>
                </div>

                <div>
                  {existingApplication ? (
                    <StatusBadge status={existingApplication.status} />
                  ) : (
                    <button
                      className="btn btn-primary btn-sm px-4 fw-semibold"
                      disabled={applyingId === o._id}
                      onClick={() => handleApply(o._id)}
                    >
                      {applyingId === o._id ? t("Applying…") : t("Apply Now")}
                    </button>
                  )}
                </div>
              </div>

              {o.description && (
                <p className="small text-secondary mt-2 mb-3" style={{ lineHeight: 1.5 }}>
                  {o.description}
                </p>
              )}

              {/* Eligibility details if any */}
              {o.eligibility && (o.eligibility.minGpa > 0 || o.eligibility.eligibleBranches?.length > 0) && (
                <div className="p-2 rounded bg-light border mb-2 small text-secondary">
                  <strong>{t("Eligibility:")}</strong>{" "}
                  {o.eligibility.minGpa > 0 && <span>{t("Min CGPA:")} {o.eligibility.minGpa} · </span>}
                  {o.eligibility.eligibleBranches?.length > 0 && (
                    <span>{t("Branches:")} {o.eligibility.eligibleBranches.join(", ")} · </span>
                  )}
                  {o.eligibility.graduationYears?.length > 0 && (
                    <span>{t("Batches:")} {o.eligibility.graduationYears.join(", ")}</span>
                  )}
                </div>
              )}

              <div className="d-flex flex-wrap align-items-center gap-2 pt-2 border-top">
                <span className="small text-secondary fw-semibold">{t("Required Skills:")}</span>
                {o.requiredSkills.map((rs) => (
                  <span key={rs.skill?._id || rs.skill} className="badge bg-light text-secondary border font-monospace">
                    {rs.skill?.name || "Skill"} ≥ {rs.minProficiency}/5
                  </span>
                ))}
              </div>

              {existingApplication && (
                <div className="mt-3 pt-2 border-top">
                  <details>
                    <summary className="small fw-semibold text-primary" style={{ cursor: "pointer" }}>
                      ► {t("Match Analysis")} — {existingApplication.matchScore}% {t("skill match")}
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
