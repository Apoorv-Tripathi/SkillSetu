import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function SkillGapHeatmap() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [heatmap, setHeatmap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getSkillGap(token)
      .then(({ heatmap }) => setHeatmap(heatmap))
      .catch((err) => setError(err.message));
  }, [token]);

  const counts = heatmap
    ? {
        met: heatmap.filter((r) => r.status === "met").length,
        developing: heatmap.filter((r) => r.status === "developing").length,
        gap: heatmap.filter((r) => r.status === "gap").length,
      }
    : null;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Skill intelligence"
        title="Skill-gap heatmap"
        description="Evidence-based, not self-declared — built from assessments and mentor evaluations, weighted by how verified the evidence is."
      />

      {error && <ErrorState message={error} />}

      {counts && (
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <MetricCard
              title={t("Meets target", "Meets Target")}
              value={`${counts.met} Skills`}
              subtitle={t("skills_aligned", "Skills match industry demand")}
              variant="green"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <MetricCard
              title={t("Developing", "Developing")}
              value={`${counts.developing} Skills`}
              subtitle={t("skills_near_target", "Within 20% of benchmark")}
              variant="amber"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <MetricCard
              title={t("Significant gap", "Significant Gap")}
              value={`${counts.gap} Skills`}
              subtitle={t("skills_priority_fix", "Critical focus for placement")}
              variant="red"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <MetricCard
              title={t("Target Benchmark", "Target Benchmark")}
              value="Full Stack Dev"
              subtitle={t("Employer Calibrated", "Employer Calibrated")}
              variant="purple"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            />
          </div>
        </div>
      )}

      {!heatmap && !error && <LoadingRows count={4} height={70} />}

      {heatmap && heatmap.length === 0 && (
        <EmptyState
          title={t("No evidence yet")}
          description={t("Take an assessment to generate your first heatmap.")}
          action={
            <Link to="/assessments" className="btn btn-primary btn-sm rounded-pill">
              {t("Take an assessment")}
            </Link>
          }
        />
      )}

      {heatmap && heatmap.length > 0 && (
        <div className="row g-4">
          {/* Main Matrix (Left 8 cols) */}
          <div className="col-lg-8">
            <div className="ss-data-panel">
              <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-0" style={{ fontSize: "1.05rem" }}>{t("skill_gap_matrix", "Skill-Gap Heatmap Matrix")}</h2>
                  <span className="small text-muted" style={{ fontSize: "0.72rem" }}>
                    Deterministic Gap Analysis · Calibrated against Live Employer Standards
                  </span>
                </div>
                <Link to="/assessments" className="ss-card-arrow-btn" aria-label="Take Assessment">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>

              <div className="ss-data-panel__body p-3 d-flex flex-column gap-3">
                {heatmap.map((row) => (
                  <div key={row.skill._id} className="p-3 rounded-4 border" style={{ background: "rgba(0,0,0,0.015)" }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                      <div>
                        <strong style={{ fontSize: "0.95rem" }}>{row.skill.name}</strong>
                        <span className="badge bg-secondary-subtle text-muted ms-2 small">{row.skill.category}</span>
                      </div>
                      <StatusBadge
                        status={row.status}
                        label={t(row.status === "met" ? "Meets target" : row.status === "developing" ? "Developing" : "Significant gap")}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center small text-muted mb-1">
                      <span>
                        {t("Current")}: <strong className="text-dark fw-bold">{row.currentScore}/5</strong> · {t("Target")}: <strong className="fw-bold">{row.targetScore}/5</strong>
                      </span>
                      <span className={row.gap > 0 ? "badge bg-danger-subtle text-danger fw-bold" : "badge bg-success-subtle text-success fw-bold"}>
                        {row.gap > 0 ? `Gap: -${row.gap} pts` : `✓ Fully Aligned`}
                      </span>
                    </div>

                    {/* Dual Progress Bar with Target Marker */}
                    <div className="position-relative my-2" style={{ height: "10px", background: "rgba(0,0,0,0.06)", borderRadius: "9999px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(row.currentScore / 5) * 100}%`,
                          borderRadius: "9999px",
                          backgroundColor:
                            row.status === "met" ? "#10B981" : row.status === "developing" ? "#F59E0B" : "#EF4444",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center small text-muted mt-2 pt-1 border-top" style={{ fontSize: "0.72rem" }}>
                      <span>
                        {t("Last updated by")}:{" "}
                        <strong>{t(row.lastEvidenceType === "mentor_evaluation" ? "mentor evaluation" : "self-assessment")}</strong>
                      </span>
                      <Link
                        to="/learning"
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 py-0 fw-semibold"
                        style={{ fontSize: "0.72rem", lineHeight: "1.6" }}
                      >
                        Remediate in Hub →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="col-lg-4">
            {/* Priority Directive Action Card */}
            <div className="ss-directive-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="ss-directive-card__eyebrow">Priority Focus</span>
                <span className="ss-directive-card__impact">Immediate Impact</span>
              </div>
              <h3 className="ss-directive-card__title" style={{ fontSize: "1.05rem" }}>
                Targeted Remediation
              </h3>
              <p className="ss-directive-card__meta">
                Completing recommended learning programs directly closes identified gaps and unlocks verified interview shortlists.
              </p>
              <div className="d-flex flex-column gap-2 mt-3">
                <Link to="/learning" className="btn btn-primary btn-sm fw-bold rounded-pill">
                  Open Learning Hub →
                </Link>
                <Link to="/career-roadmap" className="btn btn-outline-secondary btn-sm rounded-pill text-center">
                  Review Career Roadmap
                </Link>
              </div>
            </div>

            {/* Benchmark Standard Card */}
            <div className="ss-data-panel">
              <div className="ss-data-panel__head">
                <h2 style={{ fontSize: "0.95rem" }}>Benchmark Standards</h2>
              </div>
              <div className="ss-data-panel__body p-3 small d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Target Framework:</span>
                  <strong>AIIA Standard v2.4</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Evaluation Vector:</span>
                  <strong>AICTE / NAPS Aligned</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Evidence Verification:</span>
                  <span className="badge bg-success-subtle text-success">Deterministic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
