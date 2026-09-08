import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";

export default function PostOpportunity() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    title: "",
    type: "internship",
    description: "",
    location: "",
    isRemote: false,
    stipend: "₹20,000 / month",
    duration: "3 Months",
    minGpa: "",
    eligibleBranches: "",
    graduationYears: "2026, 2027",
  });
  const [requiredSkills, setRequiredSkills] = useState([{ skill: "", minProficiency: 3 }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .listSkills(token)
      .then(({ skills }) => setSkills(skills))
      .catch(() => {});
  }, [token]);

  function updateRow(i, field, value) {
    setRequiredSkills((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRequiredSkills((rows) => [...rows, { skill: "", minProficiency: 3 }]);
  }

  function removeRow(i) {
    setRequiredSkills((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        type: form.type,
        description: form.description,
        location: form.location,
        isRemote: form.isRemote,
        stipend: form.stipend,
        duration: form.duration,
        eligibility: {
          minGpa: form.minGpa ? Number(form.minGpa) : 0,
          eligibleBranches: form.eligibleBranches
            ? form.eligibleBranches.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          graduationYears: form.graduationYears
            ? form.graduationYears.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n))
            : [],
        },
        requiredSkills: requiredSkills.filter((r) => r.skill),
      };

      await api.createOpportunity(payload, token);
      navigate("/opportunities");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Industry & Recruiter Portal"
        title="Post an Opportunity or Program"
        description="Define required competencies, duration, stipend, and eligibility — powering the deterministic match score candidates see."
      />

      <div className="ss-card-modern" style={{ maxWidth: "720px" }}>
        <div className="ss-card-modern__head">
          <h2 className="ss-card-modern__title">Posting Details</h2>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label small fw-semibold">Title</label>
              <input
                className="form-control"
                required
                placeholder="e.g. Clinical Research Intern, Full Stack Developer, Data Analyst"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Opportunity Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="internship">Internship</option>
                <option value="apprenticeship">Apprenticeship</option>
                <option value="job">Placement / Full-Time Job</option>
                <option value="training_program">Training Program</option>
                <option value="certification_course">Certification Course</option>
                <option value="workshop">Technical Workshop</option>
                <option value="live_project">Live Industry Project</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows={3}
                required
                placeholder="Describe role responsibilities, deliverables, or syllabus..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Location / Base</label>
              <input
                className="form-control"
                placeholder="e.g. New Delhi / Kanpur / Bengaluru"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="col-md-6 d-flex align-items-center mt-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isRemote"
                  checked={form.isRemote}
                  onChange={(e) => setForm({ ...form, isRemote: e.target.checked })}
                />
                <label className="form-check-label small" htmlFor="isRemote">
                  Remote / Hybrid Work Allowed
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Stipend / CTC / Fee</label>
              <input
                className="form-control"
                placeholder="e.g. ₹25,000 / month or Free / Sponsored"
                value={form.stipend}
                onChange={(e) => setForm({ ...form, stipend: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Duration</label>
              <input
                className="form-control"
                placeholder="e.g. 3 Months, 6 Months, 8 Weeks"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>

            {/* Eligibility Section */}
            <div className="col-12 pt-2 border-top">
              <span className="small fw-bold text-secondary text-uppercase d-block mb-2">
                Candidate Eligibility (Optional)
              </span>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label small">Minimum CGPA (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    placeholder="e.g. 7.0"
                    value={form.minGpa}
                    onChange={(e) => setForm({ ...form, minGpa: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">Eligible Branches (comma separated)</label>
                  <input
                    className="form-control form-control-sm"
                    placeholder="e.g. Computer Science, Health Informatics"
                    value={form.eligibleBranches}
                    onChange={(e) => setForm({ ...form, eligibleBranches: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">Graduation Years (comma separated)</label>
                  <input
                    className="form-control form-control-sm"
                    placeholder="e.g. 2026, 2027"
                    value={form.graduationYears}
                    onChange={(e) => setForm({ ...form, graduationYears: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Required Competencies */}
            <div className="col-12 pt-2 border-top">
              <label className="form-label small fw-bold text-dark d-block">
                Required Competencies & Minimum Proficiency (1–5)
              </label>

              {requiredSkills.map((row, i) => (
                <div className="d-flex gap-2 mb-2 align-items-center" key={i}>
                  <select
                    className="form-select"
                    required
                    value={row.skill}
                    onChange={(e) => updateRow(i, "skill", e.target.value)}
                  >
                    <option value="">Select competency…</option>
                    {skills.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-select w-auto font-monospace"
                    value={row.minProficiency}
                    onChange={(e) => updateRow(i, "minProficiency", Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        ≥ {n}/5
                      </option>
                    ))}
                  </select>

                  {requiredSkills.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeRow(i)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mt-1"
                onClick={addRow}
              >
                + Add competency requirement
              </button>
            </div>

            <div className="col-12 pt-3 border-top">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Publishing…" : "Publish Opportunity / Program"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
