import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import SkillBar from "../components/ui/SkillBar.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function MentorDashboard() {
  const { token } = useAuth();
  const [milestones, setMilestones] = useState(null);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  function load() {
    api
      .getMyMentorAssignments(token)
      .then(({ milestones }) => setMilestones(milestones))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);
  useEffect(() => {
    api
      .listSkills(token)
      .then(({ skills }) => setSkills(skills))
      .catch(() => {});
  }, [token]);

  function openEvaluation(milestone) {
    setOpenId(milestone._id);
    setLastResult(null);
    setForm({ overallFeedback: "", rows: [] });
  }

  function addRow() {
    setForm((f) => ({ ...f, rows: [...(f.rows || []), { skill: "", score: 3, comment: "" }] }));
  }

  function updateRow(i, field, value) {
    setForm((f) => ({ ...f, rows: f.rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)) }));
  }

  function removeRow(i) {
    setForm((f) => ({ ...f, rows: f.rows.filter((_, idx) => idx !== i) }));
  }

  async function submitEvaluation(milestoneId) {
    setSubmitting(true);
    setError(null);
    try {
      const skillEvaluations = (form.rows || [])
        .filter((r) => r.skill)
        .map((r) => ({ skill: r.skill, score: Number(r.score), comment: r.comment }));
      if (skillEvaluations.length === 0) {
        setError("Add at least one skill score before submitting.");
        return;
      }
      const { milestone, updatedHeatmap } = await api.submitMilestoneEvaluation(
        milestoneId,
        { skillEvaluations, overallFeedback: form.overallFeedback },
        token
      );
      setLastResult({ milestone, updatedHeatmap });
      setOpenId(null);
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
        eyebrow="Closed loop"
        title="Mentor dashboard"
        description="Submitting an evaluation here immediately recomputes the student's skill-gap heatmap — this is the real-time feedback loop."
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {!milestones && !error && <LoadingRows count={2} height={100} />}
      {milestones && milestones.length === 0 && <EmptyState title="No milestones assigned to you yet" />}

      {lastResult && (
        <div className="ss-panel mb-4" style={{ borderLeft: "4px solid #3D6B4F" }}>
          <div className="ss-panel__body">
            <p className="fw-semibold small mb-1">
              Evaluation submitted — {lastResult.milestone.student?.name || "the student"}'s heatmap just updated live
            </p>
            <p className="small text-secondary mb-3">
              Before: self-assessment only. After: weighted with your verified evaluation.
            </p>
            {lastResult.updatedHeatmap.slice(0, 4).map((row) => (
              <SkillBar
                key={row.skill._id}
                name={row.skill.name}
                current={row.currentScore}
                target={row.targetScore}
                status={row.status}
              />
            ))}
          </div>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {milestones?.map((m) => (
          <div className="ss-panel" key={m._id}>
            <div className="ss-panel__body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className="h6 mb-1">{m.title}</h2>
                  <p className="small text-secondary mb-1">
                    {m.student?.name} · {m.student?.branch || "Branch not set"}
                  </p>
                  <p className="small text-secondary mb-0">
                    {m.application?.opportunity?.title} — {m.application?.opportunity?.companyName}
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </div>

              {m.description && <p className="small mt-2 mb-0">{m.description}</p>}

              {m.status === "evaluated" && (
                <div className="ss-table-dense mt-3">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Score</th>
                        <th>Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.skillEvaluations.map((se, i) => (
                        <tr key={i}>
                          <td>{se.skill.name}</td>
                          <td>{se.score}/5</td>
                          <td className="text-secondary">{se.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {m.status === "pending" && openId !== m._id && (
                <button className="btn btn-primary btn-sm mt-3" onClick={() => openEvaluation(m)}>
                  Submit live evaluation
                </button>
              )}

              {m.status === "pending" && openId === m._id && (
                <div className="border-top pt-3 mt-3">
                  <label className="form-label small">Skill scores</label>
                  {(form.rows || []).map((row, i) => (
                    <div className="d-flex gap-2 mb-2" key={i}>
                      <select
                        className="form-select form-select-sm"
                        value={row.skill}
                        onChange={(e) => updateRow(i, "skill", e.target.value)}
                      >
                        <option value="">Select skill</option>
                        {skills.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                      <select
                        className="form-select form-select-sm"
                        style={{ maxWidth: "110px" }}
                        value={row.score}
                        onChange={(e) => updateRow(i, "score", e.target.value)}
                      >
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n}/5</option>
                        ))}
                      </select>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Comment (optional)"
                        value={row.comment}
                        onChange={(e) => updateRow(i, "comment", e.target.value)}
                      />
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => removeRow(i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={addRow}>
                    + Add skill score
                  </button>

                  <div className="mb-3">
                    <label className="form-label small">Overall feedback</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      value={form.overallFeedback || ""}
                      onChange={(e) => setForm((f) => ({ ...f, overallFeedback: e.target.value }))}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm" disabled={submitting} onClick={() => submitEvaluation(m._id)}>
                      {submitting ? "Submitting…" : "Submit evaluation"}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setOpenId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
