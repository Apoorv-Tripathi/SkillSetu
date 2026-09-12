import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { ErrorState } from "../components/ui/States.jsx";

export default function TakeAssessment() {
  const { id } = useParams();
  const { token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .getAssessment(id, token)
      .then(({ assessment }) => setAssessment(assessment))
      .catch((err) => setError(err.message));
  }, [id, token]);

  function selectOption(questionIndex, optionIndex) {
    setAnswers((a) => ({ ...a, [questionIndex]: optionIndex }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionIndex, selectedOptionIndex]) => ({
          questionIndex: Number(questionIndex),
          selectedOptionIndex,
        })),
      };
      await api.submitAssessment(id, payload, token);
      navigate("/skill-profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !assessment) {
    return (
      <AppShell>
        <ErrorState message={error} />
      </AppShell>
    );
  }
  if (!assessment) {
    return (
      <AppShell>
        <p className="text-secondary">{t("Loading…")}</p>
      </AppShell>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = assessment.questions.every((q) => answers[q.index] !== undefined);

  return (
    <AppShell>
      <div style={{ maxWidth: "720px" }}>
        <Link to="/assessments" className="d-inline-block mb-3 text-decoration-none small">
          &larr; {t("nav_assessments", "Assessments")}
        </Link>
        <PageHeader
          eyebrow={`${t("Question")} ${answeredCount} ${t("of")} ${assessment.questions.length} ${t("answered")}`}
          title={assessment.title}
          description={assessment.description}
        />

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          {assessment.questions.map((q, qi) => (
            <div className="ss-card-modern mb-3 p-4" key={q.index}>
              <p className="fw-bold fs-6 mb-3 text-dark">
                {qi + 1}. {q.text}
              </p>
              {q.options.map((opt) => (
                <div className="form-check mb-2" key={opt.index}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`q-${q.index}`}
                    id={`q-${q.index}-o-${opt.index}`}
                    checked={answers[q.index] === opt.index}
                    onChange={() => selectOption(q.index, opt.index)}
                    style={{ cursor: "pointer" }}
                  />
                  <label className="form-check-label small text-secondary" htmlFor={`q-${q.index}-o-${opt.index}`} style={{ cursor: "pointer" }}>
                    {opt.text}
                  </label>
                </div>
              ))}
            </div>
          ))}

          <button type="submit" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold" disabled={!allAnswered || submitting}>
            {submitting ? t("Submitting…") : t("Submit assessment")}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
