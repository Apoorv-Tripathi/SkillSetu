import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

const TYPE_LABEL = {
  faculty_internship: "Faculty Industrial Internship",
  industrial_training: "Industrial Training Program",
  fdp: "Faculty Development Programme (FDP)",
  consultancy: "Consultancy Opportunity",
  guest_lecture: "Guest Lecture",
  research_partnership: "Collaborative Research Project",
  innovation_challenge: "Innovation Challenge / Hackathon",
  workshop: "Technical Workshop",
};

export default function CollaborationBoard() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState("browse");

  return (
    <AppShell>
      <PageHeader
        eyebrow="Collaboration"
        title="Faculty-industry marketplace"
        description="FDPs, consultancy, guest lectures, and research partnerships — posted by academicians, industry, and recruiters, open to all three."
      />

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === "browse" ? "active" : ""}`} onClick={() => setTab("browse")}>
            Browse open activities
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "post" ? "active" : ""}`} onClick={() => setTab("post")}>
            Post an activity
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")}>
            My postings
          </button>
        </li>
      </ul>

      {tab === "browse" && <BrowseTab token={token} currentUserId={user._id} />}
      {tab === "post" && <PostTab token={token} onPosted={() => setTab("mine")} />}
      {tab === "mine" && <MineTab token={token} />}
    </AppShell>
  );
}

function BrowseTab({ token, currentUserId }) {
  const [activities, setActivities] = useState(null);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [openId, setOpenId] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appliedIds, setAppliedIds] = useState(new Set());

  function load() {
    api
      .listCollaborationActivities(token, typeFilter ? { type: typeFilter } : {})
      .then(({ activities }) => setActivities(activities))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token, typeFilter]);

  async function apply(id) {
    setSubmitting(true);
    setError(null);
    try {
      await api.applyToActivity(id, { message }, token);
      setAppliedIds((s) => new Set(s).add(id));
      setOpenId(null);
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="ss-filter-bar">
        <select className="form-select form-select-sm w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {error && <ErrorState message={error} />}
      {!activities && !error && <LoadingRows count={2} height={110} />}
      {activities && activities.length === 0 && <EmptyState title="No open activities right now" />}

      <div className="d-flex flex-column gap-3">
        {activities?.map((a) => {
          const alreadyApplied = appliedIds.has(a._id) || a.applicants?.some((ap) => ap.user === currentUserId);
          const isOwn = a.postedBy?._id === currentUserId;
          return (
            <div className="ss-panel" key={a._id}>
              <div className="ss-panel__body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <span className="ss-status ss-status--neutral mb-2 d-inline-block">{TYPE_LABEL[a.type]}</span>
                    <h2 className="h6 mb-1">{a.title}</h2>
                    <p className="small text-secondary mb-0">
                      Posted by {a.postedBy?.name} {a.postedBy?.companyName ? `· ${a.postedBy.companyName}` : ""}
                    </p>
                  </div>
                  {!isOwn && (alreadyApplied ? (
                    <StatusBadge status="pending" label="Applied" />
                  ) : openId !== a._id ? (
                    <button className="btn btn-primary btn-sm" onClick={() => setOpenId(a._id)}>
                      Apply
                    </button>
                  ) : null)}
                </div>
                <p className="small mt-2 mb-0">{a.description}</p>

                {openId === a._id && (
                  <div className="border-top pt-3 mt-3">
                    <textarea
                      className="form-control form-control-sm mb-2"
                      rows={2}
                      placeholder="Why are you a good fit for this?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={submitting || message.trim().length < 5}
                        onClick={() => apply(a._id)}
                      >
                        {submitting ? "Sending…" : "Send application"}
                      </button>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => setOpenId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostTab({ token, onPosted }) {
  const [form, setForm] = useState({ type: "fdp", title: "", description: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createCollaborationActivity(form, token);
      setForm({ type: "fdp", title: "", description: "" });
      onPosted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ss-panel" style={{ maxWidth: "560px" }}>
      <div className="ss-panel__body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small">Type</label>
            <select className="form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small">Title</label>
            <input className="form-control" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label small">Description</label>
            <textarea
              className="form-control"
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Posting…" : "Post activity"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MineTab({ token }) {
  const [activities, setActivities] = useState(null);
  const [error, setError] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  function load() {
    api
      .getMyCollaborationActivities(token)
      .then(({ activities }) => setActivities(activities))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);

  async function respond(activityId, applicantId, status) {
    setBusyKey(applicantId);
    setError(null);
    try {
      await api.respondToActivityApplicant(activityId, applicantId, { status }, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  }

  async function close(id) {
    setBusyKey(id);
    setError(null);
    try {
      await api.closeActivity(id, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div>
      {error && <ErrorState message={error} />}
      {!activities && !error && <LoadingRows count={2} height={120} />}
      {activities && activities.length === 0 && <EmptyState title="You haven't posted any activities yet" />}

      <div className="d-flex flex-column gap-3">
        {activities?.map((a) => (
          <div className="ss-panel" key={a._id}>
            <div className="ss-panel__body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <span className="ss-status ss-status--neutral mb-2 d-inline-block">{TYPE_LABEL[a.type]}</span>
                  <h2 className="h6 mb-1">{a.title}</h2>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <StatusBadge status={a.status === "open" ? "met" : "neutral"} label={a.status} />
                  {a.status === "open" && (
                    <button className="btn btn-outline-secondary btn-sm" disabled={busyKey === a._id} onClick={() => close(a._id)}>
                      Close
                    </button>
                  )}
                </div>
              </div>

              {a.applicants.length === 0 && <p className="small text-secondary mb-0">No applicants yet.</p>}
              <div className="d-flex flex-column gap-2">
                {a.applicants.map((ap) => (
                  <div key={ap._id} className="d-flex justify-content-between align-items-center border-top pt-2">
                    <div>
                      <p className="small fw-semibold mb-0">
                        {ap.user?.name} {ap.user?.companyName ? `· ${ap.user.companyName}` : ""}
                      </p>
                      <p className="small text-secondary mb-0">{ap.message}</p>
                    </div>
                    {ap.status === "pending" ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={busyKey === ap._id}
                          onClick={() => respond(a._id, ap._id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          disabled={busyKey === ap._id}
                          onClick={() => respond(a._id, ap._id, "declined")}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <StatusBadge status={ap.status} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
