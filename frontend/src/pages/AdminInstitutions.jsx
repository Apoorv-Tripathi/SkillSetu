import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

const BLANK = { name: "", type: "engineering", city: "", state: "", branches: "" };

export default function AdminInstitutions() {
  const { token } = useAuth();
  const [institutions, setInstitutions] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [drilldownId, setDrilldownId] = useState(null);
  const [drilldownData, setDrilldownData] = useState(null);

  function load() {
    api
      .listAdminInstitutions(token)
      .then(({ institutions }) => setInstitutions(institutions))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);

  function startEdit(inst) {
    setEditingId(inst._id);
    setForm({ name: inst.name, type: inst.type, city: inst.city || "", state: inst.state || "", branches: (inst.branches || []).join(", ") });
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm(BLANK);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = { ...form, branches: form.branches.split(",").map((b) => b.trim()).filter(Boolean) };
    try {
      if (editingId) {
        await api.updateAdminInstitution(editingId, payload, token);
      } else {
        await api.createAdminInstitution(payload, token);
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

  async function viewSkillGap(id) {
    setDrilldownId(id);
    setDrilldownData(null);
    try {
      const { summary } = await api.getAdminInstitutionSkillGap(id, token);
      setDrilldownData(summary);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Platform administration"
        title="Institutions"
        actions={
          <button className="btn btn-primary btn-sm" onClick={showForm ? () => setShowForm(false) : startNew}>
            {showForm ? "Cancel" : "+ Add institution"}
          </button>
        }
      />

      {error && <ErrorState message={error} />}

      {showForm && (
        <form className="ss-data-panel mb-4 p-4" style={{ maxWidth: "580px", borderRadius: "24px" }} onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h2 className="h6 fw-bold mb-0 text-primary-emphasis">
              {editingId ? "Edit Institution" : "Register New Institution"}
            </h2>
            <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
          </div>
          <div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Institution Name</label>
              <input className="form-control" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Institutional Type</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="engineering">Engineering</option>
                <option value="polytechnic">Polytechnic</option>
                <option value="university">University</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">City</label>
                <input className="form-control" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">State</label>
                <input className="form-control" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Branches (comma-separated)</label>
              <input
                className="form-control"
                placeholder="Computer Science, Electronics, Mechanical"
                value={form.branches}
                onChange={(e) => setForm((f) => ({ ...f, branches: e.target.value }))}
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-brass btn-sm px-4 fw-bold shadow-sm" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save Changes" : "Create Institution"}
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {!institutions && !error && <LoadingRows count={2} height={70} />}
      {institutions && institutions.length === 0 && <EmptyState title="No institutions yet" />}

      {institutions && institutions.length > 0 && (
        <div className="ss-data-panel overflow-hidden mb-4" style={{ borderRadius: "24px" }}>
          <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
            <h2 className="h6 fw-bold mb-0 text-primary-emphasis">Registered Academic Partners</h2>
            <span className="badge bg-secondary-subtle text-dark font-monospace small">
              {institutions.length} Institutions Active
            </span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light-subtle">
                <tr className="small text-muted text-uppercase">
                  <th className="ps-4">Institution Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Active Departments</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst) => (
                  <tr key={inst._id}>
                    <td className="ps-4 fw-bold text-primary-emphasis">{inst.name}</td>
                    <td>
                      <span className="badge bg-light text-secondary border font-monospace text-capitalize">
                        {inst.type}
                      </span>
                    </td>
                    <td className="text-secondary small">{[inst.city, inst.state].filter(Boolean).join(", ") || "—"}</td>
                    <td className="text-secondary small">
                      {(inst.branches || []).slice(0, 3).join(", ") || "—"}
                      {(inst.branches || []).length > 3 && ` +${inst.branches.length - 3} more`}
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => startEdit(inst)}>
                          Edit
                        </button>
                        <button className="btn btn-brass btn-sm rounded-pill px-3 fw-bold" onClick={() => viewSkillGap(inst._id)}>
                          Skill Gap ↗
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

      {drilldownId && (
        <div className="ss-data-panel p-4 mt-4" style={{ borderRadius: "24px" }}>
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h2 className="h6 fw-bold mb-0 text-primary-emphasis">Institution Skill-Gap Drill-Down</h2>
            <button className="btn-close" onClick={() => setDrilldownId(null)} />
          </div>
          {!drilldownData && <LoadingRows count={2} height={60} />}
          {drilldownData?.length === 0 && <EmptyState title="No verified data for this institution yet" />}
          {drilldownData?.map((branch) => (
            <div className="mb-4" key={branch.branch}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-warning-subtle text-dark font-monospace">{branch.branch}</span>
              </div>
              <div className="border rounded-3 overflow-hidden">
                {branch.skills.map((s) => (
                  <div key={s.skill} className="d-flex justify-content-between align-items-center small py-2 px-3 border-bottom">
                    <span className="fw-semibold text-primary-emphasis">{s.skill}</span>
                    <StatusBadge status={s.avgGap <= 0 ? "met" : s.avgGap <= 1.5 ? "developing" : "gap"} label={`Gap ${s.avgGap}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
