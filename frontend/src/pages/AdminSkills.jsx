import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

const BLANK = { name: "", category: "", description: "", expectedProficiency: 3.5 };

export default function AdminSkills() {
  const { token } = useAuth();
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api
      .listAdminSkills(token)
      .then(({ skills }) => setSkills(skills))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);

  function startEdit(skill) {
    setEditingId(skill._id);
    setForm({
      name: skill.name,
      category: skill.category,
      description: skill.description || "",
      expectedProficiency: skill.expectedProficiency,
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = { ...form, expectedProficiency: Number(form.expectedProficiency) };
      if (editingId) {
        await api.updateAdminSkill(editingId, payload, token);
      } else {
        await api.createAdminSkill(payload, token);
      }
      setShowForm(false);
      setForm(BLANK);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await api.deleteAdminSkill(id, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Platform administration"
        title="Skills catalog"
        description="Every skill's expected proficiency is the benchmark line used by the skill-gap engine platform-wide."
        actions={
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingId(null);
              setForm(BLANK);
              setShowForm((s) => !s);
            }}
          >
            {showForm ? "Cancel" : "+ Add skill"}
          </button>
        }
      />

      {error && <ErrorState message={error} />}

      {showForm && (
        <form className="ss-data-panel mb-4 p-4" style={{ maxWidth: "520px", borderRadius: "24px" }} onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h2 className="h6 fw-bold mb-0 text-primary-emphasis">
              {editingId ? "Edit Skill Benchmark" : "Define New Competency"}
            </h2>
            <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
          </div>
          <div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Skill / Competency Name</label>
              <input className="form-control" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Category</label>
              <input className="form-control" required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Expected Proficiency Benchmark (0 - 5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                className="form-control"
                value={form.expectedProficiency}
                onChange={(e) => setForm((f) => ({ ...f, expectedProficiency: e.target.value }))}
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-brass btn-sm px-4 fw-bold shadow-sm" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save Changes" : "Create Skill"}
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {!skills && !error && <LoadingRows count={2} height={50} />}
      {skills && skills.length === 0 && <EmptyState title="No skills yet" />}

      {skills && skills.length > 0 && (
        <div className="ss-data-panel overflow-hidden mb-4" style={{ borderRadius: "24px" }}>
          <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
            <h2 className="h6 fw-bold mb-0 text-primary-emphasis">Verified Industry Skill Library</h2>
            <span className="badge bg-secondary-subtle text-dark font-monospace small">
              {skills.length} Standardized Skills
            </span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light-subtle">
                <tr className="small text-muted text-uppercase">
                  <th className="ps-4">Competency Name</th>
                  <th>Category</th>
                  <th className="text-center">Target Benchmark</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s._id}>
                    <td className="ps-4 fw-semibold text-primary-emphasis">{s.name}</td>
                    <td>
                      <span className="badge bg-warning-subtle text-dark font-monospace small">
                        {s.category}
                      </span>
                    </td>
                    <td className="text-center font-monospace small fw-bold text-success">{s.expectedProficiency} / 5.0</td>
                    <td className="pe-4 text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => startEdit(s)}>
                          Edit
                        </button>
                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleDelete(s._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
