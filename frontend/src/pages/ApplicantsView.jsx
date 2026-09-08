import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import MatchBreakdown from "../components/ui/MatchBreakdown.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

const NEXT_STATUS = {
  applied: ["shortlisted", "rejected"],
  shortlisted: ["interview", "rejected"],
  interview: ["offer", "rejected"],
  offer: [],
  rejected: [],
};

const STATUS_FILTERS = ["all", "applied", "shortlisted", "interview", "offer", "rejected"];

export default function ApplicantsView() {
  const { opportunityId } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const [feedbackForm, setFeedbackForm] = useState(null); // { applicationId, rating, notes }
  const [starBusyId, setStarBusyId] = useState(null);

  function load() {
    api
      .getApplicationsForOpportunity(opportunityId, token)
      .then(setData)
      .catch((err) => setError(err.message));
  }

  useEffect(load, [opportunityId, token]);
  useEffect(() => {
    api
      .listMentors(token)
      .then(({ mentors }) => setMentors(mentors))
      .catch(() => {});
  }, [token]);

  const visibleApplications = useMemo(() => {
    if (!data) return [];
    let rows = data.applications;
    if (statusFilter !== "all") rows = rows.filter((a) => a.status === statusFilter);
    rows = [...rows].sort((a, b) =>
      sortBy === "match" ? b.matchScore - a.matchScore : a.student.name.localeCompare(b.student.name)
    );
    return rows;
  }, [data, statusFilter, sortBy]);

  async function updateStatus(applicationId, status) {
    setBusyId(applicationId);
    setError(null);
    try {
      await api.updateApplicationStatus(applicationId, { status }, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function submitMilestone(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.createMilestone(
        { application: milestoneForm.applicationId, mentor: milestoneForm.mentor, title: milestoneForm.title },
        token
      );
      setMilestoneForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleStar(applicationId) {
    setStarBusyId(applicationId);
    setError(null);
    try {
      await api.toggleApplicationStar(applicationId, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setStarBusyId(null);
    }
  }

  async function submitFeedback(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.addApplicationFeedback(
        feedbackForm.applicationId,
        { rating: Number(feedbackForm.rating), notes: feedbackForm.notes },
        token
      );
      setFeedbackForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell>
      <Link to="/opportunities" className="d-inline-block mb-3 text-decoration-none small">
        &larr; Your postings
      </Link>
      <PageHeader
        eyebrow="Applicant review"
        title={data ? data.opportunity.title : "Applicants"}
        description="Ranked by explainable match score. Expand a row to see exactly which required skills are met, weak, or missing."
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <LoadingRows count={3} height={54} />}
      {data && data.applications.length === 0 && <EmptyState title="No applications yet" />}

      {data && data.applications.length > 0 && (
        <>
          <div className="ss-filter-bar">
            <select className="form-select form-select-sm w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <select className="form-select form-select-sm w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="match">Sort by match score</option>
              <option value="name">Sort by name</option>
            </select>
            <span className="small text-secondary ms-auto">{visibleApplications.length} of {data.applications.length}</span>
          </div>

          <div className="ss-table-dense">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th></th>
                  <th>Candidate</th>
                  <th>Branch</th>
                  <th>Match</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map((a) => (
                  <Fragment key={a._id}>
                    <tr onClick={() => setExpandedId(expandedId === a._id ? null : a._id)} style={{ cursor: "pointer" }}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-sm p-0 border-0 bg-transparent"
                          disabled={starBusyId === a._id}
                          onClick={() => toggleStar(a._id)}
                          title={a.starred ? "Remove from shortlist" : "Shortlist"}
                          style={{ fontSize: "1.1rem", color: a.starred ? "#A77B3D" : "#DDD6C8" }}
                        >
                          {a.starred ? "★" : "☆"}
                        </button>
                      </td>
                      <td className="fw-semibold">{a.student.name}</td>
                      <td className="text-secondary">
                        {a.student.branch || "—"} · {a.student.graduationYear || "—"}
                      </td>
                      <td>{a.matchScore}%</td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1 flex-wrap">
                          {NEXT_STATUS[a.status]?.map((status) => (
                            <button
                              key={status}
                              className="btn btn-outline-secondary btn-sm text-capitalize"
                              disabled={busyId === a._id}
                              onClick={() => updateStatus(a._id, status)}
                            >
                              → {status}
                            </button>
                          ))}
                          {["interview", "offer"].includes(a.status) && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setMilestoneForm({ applicationId: a._id, mentor: a.mentor?._id || "", title: "" })}
                            >
                              + Milestone
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === a._id && (
                      <tr>
                        <td colSpan={6} style={{ backgroundColor: "#fff" }}>
                          <MatchBreakdown rows={a.matchBreakdown} />

                          <div className="border-top pt-3 mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <p className="small fw-semibold mb-0">Structured feedback</p>
                              {feedbackForm?.applicationId !== a._id && (
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFeedbackForm({ applicationId: a._id, rating: 5, notes: "" });
                                  }}
                                >
                                  + Add feedback
                                </button>
                              )}
                            </div>

                            {a.feedback?.length === 0 && <p className="small text-secondary mb-0">No feedback recorded yet.</p>}
                            {a.feedback?.map((f, i) => (
                              <div key={i} className="small mb-2">
                                <span className="fw-semibold">{f.reviewer?.name || "Reviewer"}</span>{" "}
                                <span className="text-secondary">— {f.rating}/5</span>
                                <p className="mb-0">{f.notes}</p>
                              </div>
                            ))}

                            {feedbackForm?.applicationId === a._id && (
                              <form className="mt-2" onSubmit={submitFeedback} onClick={(e) => e.stopPropagation()}>
                                <div className="row g-2 align-items-end">
                                  <div className="col-md-2">
                                    <label className="form-label small">Rating</label>
                                    <select
                                      className="form-select form-select-sm"
                                      value={feedbackForm.rating}
                                      onChange={(e) => setFeedbackForm((f) => ({ ...f, rating: e.target.value }))}
                                    >
                                      {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>{n}/5</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-7">
                                    <label className="form-label small">Notes</label>
                                    <input
                                      className="form-control form-control-sm"
                                      required
                                      value={feedbackForm.notes}
                                      onChange={(e) => setFeedbackForm((f) => ({ ...f, notes: e.target.value }))}
                                    />
                                  </div>
                                  <div className="col-md-3 d-flex gap-2">
                                    <button type="submit" className="btn btn-primary btn-sm">Save</button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setFeedbackForm(null)}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </form>
                            )}
                          </div>

                          {milestoneForm?.applicationId === a._id && (
                            <form className="border-top pt-3 mt-3" onSubmit={submitMilestone} onClick={(e) => e.stopPropagation()}>
                              <div className="row g-2 align-items-end">
                                <div className="col-md-4">
                                  <label className="form-label small">Mentor</label>
                                  <select
                                    className="form-select form-select-sm"
                                    required
                                    value={milestoneForm.mentor}
                                    onChange={(e) => setMilestoneForm((f) => ({ ...f, mentor: e.target.value }))}
                                  >
                                    <option value="">Select a mentor</option>
                                    {mentors.map((m) => (
                                      <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-md-5">
                                  <label className="form-label small">Milestone title</label>
                                  <input
                                    className="form-control form-control-sm"
                                    required
                                    value={milestoneForm.title}
                                    onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
                                  />
                                </div>
                                <div className="col-md-3 d-flex gap-2">
                                  <button type="submit" className="btn btn-primary btn-sm">Create</button>
                                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setMilestoneForm(null)}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </form>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
