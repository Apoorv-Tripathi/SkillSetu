import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function AssessmentList() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [assessments, setAssessments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listAssessments(token)
      .then(({ assessments }) => setAssessments(assessments))
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Skill intelligence"
        title="Available assessments"
        description="Structured, skill-mapped assessments feed your verified skill-gap heatmap — not self-declared ratings."
      />

      {error && <ErrorState message={error} />}
      {!assessments && !error && <LoadingRows count={2} height={90} />}
      {assessments && assessments.length === 0 && (
        <EmptyState
          title={t("No assessments available yet")}
          description={t("Check back once your institution publishes one.")}
        />
      )}

      <div className="row g-4">
        {assessments?.map((a) => (
          <div className="col-md-6" key={a._id}>
            <div className="ss-data-panel h-100 d-flex flex-column justify-content-between p-4" style={{ borderRadius: "24px" }}>
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-warning-subtle text-dark font-monospace fw-semibold px-2.5 py-1 rounded-pill" style={{ fontSize: "0.72rem" }}>
                    {a.category || t("Technical Competency", "Technical Competency")}
                  </span>
                  <span className="badge bg-success-subtle text-success font-monospace px-2.5 py-1 rounded-pill" style={{ fontSize: "0.72rem" }}>
                    ✓ {t("Skill-Mapped", "Skill-Mapped")}
                  </span>
                </div>
                
                <h2 className="h5 fw-bold mb-2 text-primary-emphasis">{a.title}</h2>
                <p className="text-secondary small mb-4" style={{ lineHeight: "1.6" }}>
                  {a.description || t("Evaluate and benchmark your real-world problem solving capabilities with industry-standard skill mapping.")}
                </p>

                <div className="d-flex flex-wrap gap-3 mb-4 pb-2">
                  <div className="d-flex align-items-center gap-1.5 text-muted small">
                    <span style={{ fontSize: "0.9rem" }}>⏱</span>
                    <span className="font-monospace" style={{ fontSize: "0.76rem" }}>
                      {a.durationMinutes || 25} {t("Minutes", "Mins")}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-1.5 text-muted small">
                    <span style={{ fontSize: "0.9rem" }}>📝</span>
                    <span className="font-monospace" style={{ fontSize: "0.76rem" }}>
                      {a.questions?.length || 15} {t("Questions", "Questions")}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-1.5 text-muted small">
                    <span style={{ fontSize: "0.9rem" }}>🎯</span>
                    <span className="font-monospace" style={{ fontSize: "0.76rem" }}>
                      {t("Adaptive Scoring", "Adaptive")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                <div className="small text-muted font-monospace" style={{ fontSize: "0.72rem" }}>
                  {t("Official Evaluation", "Official Evaluation")}
                </div>
                <Link to={`/assessments/${a._id}`} className="btn btn-brass btn-sm px-4 fw-bold shadow-sm">
                  {t("Start Assessment →", "Start Assessment →")}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
