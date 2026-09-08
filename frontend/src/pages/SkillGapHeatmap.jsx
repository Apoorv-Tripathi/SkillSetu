import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
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
          <div className="col-md-4">
            <div className="ss-data-panel p-3">
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-muted small fw-semibold text-uppercase">{t("Meets target", "Meets Target")}</span>
                <span className="badge bg-success-subtle text-success small font-monospace">Mastered</span>
              </div>
              <div className="ss-stat-block__value mt-2" style={{ fontSize: "2.2rem", lineHeight: 1, color: "#10B981" }}>
                {counts.met}
              </div>
              <span className="small text-muted">{t("skills_aligned", "Skills match industry demand")}</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="ss-data-panel p-3">
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-muted small fw-semibold text-uppercase">{t("Developing", "Developing")}</span>
                <span className="badge bg-warning-subtle text-warning small font-monospace">In Progress</span>
              </div>
              <div className="ss-stat-block__value mt-2" style={{ fontSize: "2.2rem", lineHeight: 1, color: "#F59E0B" }}>
                {counts.developing}
              </div>
              <span className="small text-muted">{t("skills_near_target", "Skills within 20% of benchmark")}</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="ss-data-panel p-3">
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-muted small fw-semibold text-uppercase">{t("Significant gap", "Significant Gap")}</span>
                <span className="badge bg-danger-subtle text-danger small font-monospace">Remediation Req.</span>
              </div>
              <div className="ss-stat-block__value mt-2" style={{ fontSize: "2.2rem", lineHeight: 1, color: "#EF4444" }}>
                {counts.gap}
              </div>
              <span className="small text-muted">{t("skills_priority_fix", "Critical focus for placement")}</span>
            </div>
          </div>
        </div>
      )}

      {!heatmap && !error && <LoadingRows count={4} height={70} />}

      {heatmap && heatmap.length === 0 && (
        <EmptyState
          title={t("No evidence yet")}
          description={t("Take an assessment to generate your first heatmap.")}
          action={
            <Link to="/assessments" className="btn btn-brass btn-sm">
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
                        {t("Current")}: <strong className="text-dark font-monospace">{row.currentScore}/5</strong> · {t("Target")}: <strong className="font-monospace">{row.targetScore}/5</strong>
                      </span>
                      <span className={row.gap > 0 ? "text-danger fw-semibold" : "text-success fw-semibold"}>
                        {row.gap > 0 ? `Gap: -${row.gap} pts` : `Target Met`}
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
                      <Link to="/learning" className="text-decoration-none fw-semibold" style={{ color: "var(--gold, #F7C93E)" }}>
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
                <Link to="/learning" className="btn btn-brass btn-sm fw-bold">
                  Open Learning Hub →
                </Link>
                <Link to="/career-roadmap" className="ss-btn-ghost text-white border-secondary btn-sm text-center">
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
