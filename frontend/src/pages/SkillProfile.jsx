import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import SkillBar from "../components/ui/SkillBar.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function SkillProfile() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getSkillProfile(token).then(setProfile).catch((err) => setError(err.message));
  }, [token]);

  const skillsList = profile?.profile || [];
  const avgScore = skillsList.length > 0
    ? (skillsList.reduce((acc, curr) => acc + curr.averageScore, 0) / skillsList.length).toFixed(1)
    : 0;
  const topSkill = skillsList.length > 0
    ? [...skillsList].sort((a, b) => b.averageScore - a.averageScore)[0]
    : null;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Assessment results"
        title="Your skill profile"
        description="Average score per skill across every assessment you've completed."
        actions={
          <Link to="/assessments" className="btn btn-primary btn-sm">
            {t("+ Take New Assessment")}
          </Link>
        }
      />

      {error && <ErrorState message={error} />}
      {!profile && !error && <LoadingRows count={3} height={60} />}

      {profile && skillsList.length === 0 && (
        <EmptyState
          title={t("No assessments completed yet")}
          description={t("Your profile populates once you take your first assessment.")}
          action={
            <Link to="/assessments" className="btn btn-primary btn-sm">
              {t("Take an assessment")}
            </Link>
          }
        />
      )}

      {profile && skillsList.length > 0 && (
        <div>
          {/* Top Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="ss-data-panel p-3">
                <span className="text-muted small fw-semibold text-uppercase">{t("Tracked Skills", "Tracked Skills")}</span>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="ss-stat-block__value" style={{ fontSize: "2.2rem", lineHeight: 1 }}>
                    {skillsList.length}
                  </span>
                  <span className="small text-muted">{t("across_tech_soft", "Verified Competencies")}</span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="ss-data-panel p-3">
                <span className="text-muted small fw-semibold text-uppercase">{t("Overall Average", "Overall Average")}</span>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="ss-stat-block__value" style={{ fontSize: "2.2rem", lineHeight: 1 }}>
                    {avgScore}
                  </span>
                  <span className="small text-muted">/ 5.0</span>
                  <span className="badge bg-success-subtle text-success ms-auto small">
                    {avgScore >= 3 ? t("proficient", "Proficient") : t("developing", "Developing")}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="ss-data-panel p-3">
                <span className="text-muted small fw-semibold text-uppercase">{t("Top Strength", "Top Strength")}</span>
                <div className="d-flex align-items-baseline justify-content-between mt-1">
                  <span className="h5 fw-bold mb-0 text-truncate">
                    {topSkill ? topSkill.skill.name : "—"}
                  </span>
                  <span className="badge bg-warning-subtle text-warning font-monospace">
                    {topSkill ? `${topSkill.averageScore.toFixed(1)} / 5.0` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="ss-data-panel">
                <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-0" style={{ fontSize: "1.05rem" }}>{t("Evaluated Skill Ratings", "Evaluated Skill Ratings")}</h2>
                    <span className="small text-muted" style={{ fontSize: "0.72rem" }}>
                      {t("Scale")}: 0.0 – 5.0 · Deterministic Multi-Point Verification
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
                  {skillsList.map(({ skill, averageScore }) => (
                    <div key={skill._id} className="p-3 rounded-4 border" style={{ background: "rgba(0,0,0,0.015)" }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong style={{ fontSize: "0.92rem" }}>{skill.name}</strong>
                          {skill.category && (
                            <span className="badge bg-secondary-subtle text-muted ms-2 small">
                              {skill.category}
                            </span>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-warning-subtle text-dark font-monospace fw-bold" style={{ fontSize: "0.75rem" }}>
                            {averageScore.toFixed(1)} / 5.0
                          </span>
                        </div>
                      </div>
                      <SkillBar name="" current={averageScore} scale={5} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              {/* Graphical Competency Distribution */}
              <div className="ss-data-panel mb-4">
                <div className="ss-data-panel__head">
                  <h2 style={{ fontSize: "0.95rem" }}>{t("skill_composition", "Skill Composition")}</h2>
                  <span className="small text-muted" style={{ fontSize: "0.7rem" }}>8 Vectors</span>
                </div>
                <div className="ss-data-panel__body p-3">
                  <div className="d-flex align-items-center justify-content-center py-2">
                    <div style={{ width: "130px", height: "130px", position: "relative" }}>
                      <svg viewBox="0 0 100 100" width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
                        {/* Segment 1: Technical 60% */}
                        <circle cx="50" cy="50" r="38" stroke="#F7C93E" strokeWidth="12" strokeDasharray="143 238" strokeDashoffset="0" fill="none" />
                        {/* Segment 2: Aptitude 25% */}
                        <circle cx="50" cy="50" r="38" stroke="#1C1C1E" strokeWidth="12" strokeDasharray="60 238" strokeDashoffset="-143" fill="none" />
                        {/* Segment 3: Soft Skills 15% */}
                        <circle cx="50" cy="50" r="38" stroke="#9CA3AF" strokeWidth="12" strokeDasharray="35 238" strokeDashoffset="-203" fill="none" />
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ transform: "translate(-50%, -50%)" }}>
                        <div className="fw-bold font-monospace" style={{ fontSize: "1.05rem", lineHeight: 1 }}>{skillsList.length}</div>
                        <div className="text-muted" style={{ fontSize: "0.62rem" }}>Skills</div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-around text-center pt-2 border-top mt-2" style={{ fontSize: "0.72rem" }}>
                    <div>
                      <span className="d-inline-block rounded-circle me-1" style={{ width: "8px", height: "8px", background: "#F7C93E" }} />
                      <span className="text-muted">Tech (60%)</span>
                    </div>
                    <div>
                      <span className="d-inline-block rounded-circle me-1" style={{ width: "8px", height: "8px", background: "#1C1C1E" }} />
                      <span className="text-muted">Logic (25%)</span>
                    </div>
                    <div>
                      <span className="d-inline-block rounded-circle me-1" style={{ width: "8px", height: "8px", background: "#9CA3AF" }} />
                      <span className="text-muted">Soft (15%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benchmark Reference */}
              <div className="ss-data-panel mb-4">
                <div className="ss-data-panel__head">
                  <h2 style={{ fontSize: "0.95rem" }}>{t("Proficiency Scale", "Proficiency Scale")}</h2>
                </div>
                <div className="ss-data-panel__body p-3 d-flex flex-column gap-2 small">
                  <div className="d-flex justify-content-between p-2 rounded-3" style={{ background: "rgba(16, 185, 129, 0.08)" }}>
                    <span className="fw-semibold">4.0 – 5.0</span>
                    <span className="text-success fw-semibold">{t("Advanced / Mastery")}</span>
                  </div>
                  <div className="d-flex justify-content-between p-2 rounded-3" style={{ background: "rgba(59, 130, 246, 0.08)" }}>
                    <span className="fw-semibold">3.0 – 3.9</span>
                    <span className="text-primary fw-semibold">{t("Proficient / Job Ready")}</span>
                  </div>
                  <div className="d-flex justify-content-between p-2 rounded-3" style={{ background: "rgba(245, 158, 11, 0.08)" }}>
                    <span className="fw-semibold">2.0 – 2.9</span>
                    <span className="text-warning fw-semibold">{t("Developing")}</span>
                  </div>
                  <div className="d-flex justify-content-between p-2 rounded-3" style={{ background: "rgba(239, 68, 68, 0.08)" }}>
                    <span className="fw-semibold">0.0 – 1.9</span>
                    <span className="text-danger fw-semibold">{t("Beginner / Gap")}</span>
                  </div>
                </div>
              </div>

              {/* Action Card: Deep Charcoal Priority Focus */}
              <div className="ss-directive-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="ss-directive-card__eyebrow">{t("next_steps", "Next Best Steps")}</span>
                  <span className="ss-directive-card__impact">Actionable</span>
                </div>
                <h3 className="ss-directive-card__title" style={{ fontSize: "1.05rem" }}>
                  {t("close_priority_gaps", "Targeted Gap Remediation")}
                </h3>
                <p className="ss-directive-card__meta">
                  {t("Check your personalized skill gaps to discover what industry roles require and close your gaps.")}
                </p>
                <div className="d-flex flex-column gap-2 mt-3">
                  <Link to="/skill-gap" className="btn btn-brass btn-sm fw-bold">
                    {t("View Skill-Gap Heatmap →")}
                  </Link>
                  <Link to="/opportunities/browse" className="ss-btn-ghost text-white border-secondary btn-sm text-center">
                    {t("Browse Matching Roles")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
