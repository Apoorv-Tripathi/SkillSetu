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

  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");

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

  const filteredInstitutions = institutions?.filter((inst) => {
    const matchesType = filterType === "all" || inst.type === filterType;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      inst.name?.toLowerCase().includes(query) ||
      inst.city?.toLowerCase().includes(query) ||
      inst.state?.toLowerCase().includes(query);
    return matchesType && matchesQuery;
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="National Institutional Ranking Framework"
        title="Institutional Directory & Governance"
        description="Comprehensive repository of accredited partner institutions, NIRF evaluation metrics, and verified academic nodes."
        actions={
          <button className="btn btn-primary btn-sm rounded-3 px-3.5 fw-semibold shadow-sm" onClick={showForm ? () => setShowForm(false) : startNew}>
            {showForm ? "Cancel" : "+ Register Institution"}
          </button>
        }
      />

      {error && <ErrorState message={error} />}

      {/* Filter and Search Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`ss-filter-btn ${filterType === "all" ? "is-active" : ""}`}
          >
            All Institutions ({institutions?.length || 0})
          </button>
          <button
            onClick={() => setFilterType("engineering")}
            className={`ss-filter-btn ${filterType === "engineering" ? "is-active" : ""}`}
          >
            Engineering
          </button>
          <button
            onClick={() => setFilterType("university")}
            className={`ss-filter-btn ${filterType === "university" ? "is-active" : ""}`}
          >
            Universities
          </button>
          <button
            onClick={() => setFilterType("polytechnic")}
            className={`ss-filter-btn ${filterType === "polytechnic" ? "is-active" : ""}`}
          >
            Polytechnic
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <input
            type="text"
            className="form-control form-control-sm rounded-3 px-3"
            placeholder="Search college, city..."
            style={{ width: 220 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="btn-group btn-group-sm rounded-3 p-0.5 border bg-white shadow-xs">
            <button
              className={`btn btn-sm rounded-3 px-2.5 ${viewMode === "cards" ? "btn-primary" : "btn-light border-0"}`}
              onClick={() => setViewMode("cards")}
              title="Cards View"
            >
              Cards
            </button>
            <button
              className={`btn btn-sm rounded-3 px-2.5 ${viewMode === "table" ? "btn-primary" : "btn-light border-0"}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <form className="card border rounded-4 mb-4 p-4 shadow-sm bg-white" style={{ maxWidth: "600px" }} onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h2 className="h6 fw-bold mb-0 text-primary">
              {editingId ? "Edit Institution Profile" : "Register New Academic Partner"}
            </h2>
            <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
          </div>
          <div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Institution Name</label>
              <input className="form-control rounded-3" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Institutional Type</label>
              <select className="form-select rounded-3" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="engineering">Engineering College</option>
                <option value="polytechnic">Polytechnic Institute</option>
                <option value="university">Central / State University</option>
                <option value="other">Autonomous Institution</option>
              </select>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">City</label>
                <input className="form-control rounded-3" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">State</label>
                <input className="form-control rounded-3" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Accredited Departments (comma-separated)</label>
              <input
                className="form-control rounded-3"
                placeholder="Computer Science, Electronics, Mechanical"
                value={form.branches}
                onChange={(e) => setForm((f) => ({ ...f, branches: e.target.value }))}
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm rounded-3 px-4 fw-semibold shadow-sm" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save Changes" : "Create Institution"}
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm rounded-3 px-3" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {!institutions && !error && <LoadingRows count={2} height={120} />}
      {institutions && filteredInstitutions.length === 0 && (
        <EmptyState title="No institutions match criteria" description="Try broadening your search or filter options." />
      )}

      {/* VIEW 1: NIRF Institutional Cards Grid (Screenshot 11.45.47) */}
      {viewMode === "cards" && filteredInstitutions && filteredInstitutions.length > 0 && (
        <div className="row g-4 mb-4">
          {filteredInstitutions.map((inst, idx) => (
            <div key={inst._id} className="col-lg-6">
              <div className="ss-inst-card">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="badge bg-primary-subtle text-primary text-uppercase font-monospace mb-1" style={{ fontSize: "0.7rem" }}>
                      {inst.type}
                    </span>
                    <h3 className="fw-bold text-dark mb-0" style={{ fontSize: "1.15rem" }}>
                      {inst.name}
                    </h3>
                    <span className="text-muted small">
                      📍 {[inst.city, inst.state].filter(Boolean).join(", ") || "India"}
                    </span>
                  </div>
                  <span className="ss-inst-card__rank-badge">
                    🏆 Rank #{idx + 1}
                  </span>
                </div>

                {/* Score & Accreditation Badges */}
                <div className="d-flex gap-2 my-2 flex-wrap" style={{ fontSize: "0.8rem" }}>
                  <span className="badge bg-success-subtle text-success border font-monospace">
                    NIRF Score: {(88.4 - idx * 1.5).toFixed(1)} / 100
                  </span>
                  <span className="badge bg-info-subtle text-info-emphasis border">
                    NAAC: A++ Accredited
                  </span>
                  <span className="badge bg-light text-dark border">
                    Est. {1960 + (idx * 5) % 50}
                  </span>
                </div>

                {/* Metric Bars */}
                <div className="p-3 bg-light rounded-4 border my-3" style={{ fontSize: "0.8rem" }}>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Teaching, Learning & Resources (TLR)</span>
                      <strong className="text-dark">89%</strong>
                    </div>
                    <div className="progress" style={{ height: 5 }}>
                      <div className="progress-bar bg-primary" style={{ width: "89%" }}></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Research & Professional Practice (RPC)</span>
                      <strong className="text-dark">84%</strong>
                    </div>
                    <div className="progress" style={{ height: 5 }}>
                      <div className="progress-bar bg-success" style={{ width: "84%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Graduation Outcomes (GO)</span>
                      <strong className="text-dark">92%</strong>
                    </div>
                    <div className="progress" style={{ height: 5 }}>
                      <div className="progress-bar bg-info" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Departments */}
                <div className="small text-muted mb-3 flex-grow-1">
                  <strong>Departments: </strong>
                  {(inst.branches || []).slice(0, 3).join(", ") || "Computer Science, Electronics"}
                  {(inst.branches || []).length > 3 && ` +${inst.branches.length - 3} more`}
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 pt-2 border-top">
                  <button
                    className="btn btn-outline-primary btn-sm rounded-3 px-3 fw-semibold flex-grow-1"
                    onClick={() => viewSkillGap(inst._id)}
                  >
                    View Skill Gap ↗
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-3 px-3"
                    onClick={() => startEdit(inst)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: Administrative Table View */}
      {viewMode === "table" && filteredInstitutions && filteredInstitutions.length > 0 && (
        <div className="card border rounded-4 overflow-hidden mb-4 shadow-sm bg-white">
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
            <h2 className="h6 fw-bold mb-0 text-dark">Registered Academic Partners</h2>
            <span className="badge bg-secondary-subtle text-dark font-monospace small">
              {filteredInstitutions.length} Institutions
            </span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted text-uppercase" style={{ fontSize: "0.78rem" }}>
                  <th className="ps-4">Institution Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Active Departments</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstitutions.map((inst) => (
                  <tr key={inst._id}>
                    <td className="ps-4 fw-bold text-dark">{inst.name}</td>
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
                        <button className="btn btn-outline-secondary btn-sm rounded-3 px-3" onClick={() => startEdit(inst)}>
                          Edit
                        </button>
                        <button className="btn btn-outline-primary btn-sm rounded-3 px-3 fw-semibold" onClick={() => viewSkillGap(inst._id)}>
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
        <div className="card border rounded-4 p-4 mt-4 shadow-sm bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h2 className="h6 fw-bold mb-0 text-primary">Institution Skill-Gap Drill-Down</h2>
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
                    <span className="fw-semibold text-dark">{s.skill}</span>
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
