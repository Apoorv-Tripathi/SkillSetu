import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

const BLANK_QUESTION = { text: "", skill: "", options: [{ text: "", score: 0 }, { text: "", score: 5 }] };
const BLANK_FORM = { title: "", description: "", isActive: true, questions: [structuredClone(BLANK_QUESTION)] };

export default function AdminAssessments() {
  const { token } = useAuth();
  const [assessments, setAssessments] = useState(null);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api
      .listAdminAssessments(token)
      .then(({ assessments }) => setAssessments(assessments))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);
  useEffect(() => {
    api.listSkills(token).then(({ skills }) => setSkills(skills)).catch(() => {});
  }, [token]);

  function startNew() {
    setEditingId(null);
    setForm(structuredClone(BLANK_FORM));
    setShowForm(true);
  }

  function startEdit(a) {
    setEditingId(a._id);
    setForm({
      title: a.title,
      description: a.description || "",
      isActive: a.isActive,
      questions: a.questions.map((q) => ({ text: q.text, skill: q.skill?._id || q.skill, options: q.options })),
    });
    setShowForm(true);
  }

  function addQuestion() {
    setForm((f) => ({ ...f, questions: [...f.questions, structuredClone(BLANK_QUESTION)] }));
  }

  function updateQuestion(qi, field, value) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === qi ? { ...q, [field]: value } : q)),
    }));
  }

  function removeQuestion(qi) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));
  }

  function addOption(qi) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === qi ? { ...q, options: [...q.options, { text: "", score: 0 }] } : q)),
    }));
  }

  function updateOption(qi, oi, field, value) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, [field]: value } : o)) } : q
      ),
    }));
  }

  function removeOption(qi, oi) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q)),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...form,
        questions: form.questions.map((q) => ({
          ...q,
          options: q.options.map((o) => ({ text: o.text, score: Number(o.score) })),
        })),
      };
      if (editingId) {
        await api.updateAdminAssessment(editingId, payload, token);
      } else {
        await api.createAdminAssessment(payload, token);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Platform administration"
        title="Assessments"
        description="Every question maps to one skill — scoring stays deterministic and server-side, never an answer key sent to the client."
        actions={
          <button className="btn btn-primary btn-sm" onClick={showForm ? () => setShowForm(false) : startNew}>
            {showForm ? "Cancel" : "+ New assessment"}
          </button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <form className="ss-data-panel mb-4 p-4" style={{ maxWidth: "720px", borderRadius: "24px" }} onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h2 className="h6 fw-bold mb-0 text-primary-emphasis">
              {editingId ? "Edit Assessment" : "Author New Assessment"}
            </h2>
            <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
          </div>
          <div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Assessment Title</label>
              <input className="form-control" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-check form-switch mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              <label className="form-check-label small fw-semibold" htmlFor="isActive">Active & Published to Students</label>
            </div>

            <label className="form-label small fw-semibold mb-2">Diagnostic Question Bank</label>
            {form.questions.map((q, qi) => (
              <div key={qi} className="p-3 mb-3 rounded-3" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
                <div className="d-flex gap-2 mb-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder="Question prompt text"
                    required
                    value={q.text}
                    onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                  />
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: "180px" }}
                    required
                    value={q.skill}
                    onChange={(e) => updateQuestion(qi, "skill", e.target.value)}
                  >
                    <option value="">Map to Skill</option>
                    {skills.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeQuestion(qi)}>
                    Remove
                  </button>
                </div>

                {q.options.map((o, oi) => (
                  <div key={oi} className="d-flex gap-2 mb-1">
                    <input
                      className="form-control form-control-sm"
                      placeholder="Answer option text"
                      required
                      value={o.text}
                      onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="5"
                      className="form-control form-control-sm"
                      style={{ maxWidth: "90px" }}
                      value={o.score}
                      onChange={(e) => updateOption(qi, oi, "score", e.target.value)}
                    />
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => removeOption(qi, oi)}>
                      &times;
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-secondary btn-sm mt-1" onClick={() => addOption(qi)}>
                  + Add Option
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline-secondary btn-sm mb-4 rounded-pill px-3" onClick={addQuestion}>
              + Add Diagnostic Question
            </button>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-brass btn-sm px-4 fw-bold shadow-sm" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save Assessment" : "Publish Assessment"}
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {!assessments && !error && <LoadingRows count={2} height={70} />}
      {assessments && assessments.length === 0 && <EmptyState title="No assessments yet" />}

      <div className="row g-3">
        {assessments?.map((a) => (
          <div key={a._id} className="col-12">
            <div className="ss-data-panel p-3.5 d-flex justify-content-between align-items-center" style={{ borderRadius: "20px" }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(247, 201, 62, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                  📋
                </div>
                <div>
                  <h3 className="h6 fw-bold mb-1 text-primary-emphasis">{a.title}</h3>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <span className="font-monospace">{a.questions.length} Diagnostic Item(s)</span>
                    <span>•</span>
                    <span>Deterministic Server Scoring</span>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <StatusBadge status={a.isActive ? "met" : "neutral"} label={a.isActive ? "Published" : "Draft"} />
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => startEdit(a)}>
                  Configure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
