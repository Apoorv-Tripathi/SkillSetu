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

      <div className="ss-tab-bar mb-4">
        <button
          className={`ss-tab-bar__item ${tab === "browse" ? "is-active" : ""}`}
          onClick={() => setTab("browse")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Browse Open Activities</span>
        </button>
        <button
          className={`ss-tab-bar__item ${tab === "post" ? "is-active" : ""}`}
          onClick={() => setTab("post")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Post an Activity</span>
        </button>
        <button
          className={`ss-tab-bar__item ${tab === "mine" ? "is-active" : ""}`}
          onClick={() => setTab("mine")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span>My Postings</span>
        </button>
      </div>

      {tab === "browse" && <BrowseTab token={token} currentUserId={user._id} onSwitchToPost={() => setTab("post")} />}
      {tab === "post" && <PostTab token={token} onPosted={() => setTab("mine")} />}
      {tab === "mine" && <MineTab token={token} />}
    </AppShell>
  );
}

function BrowseTab({ token, currentUserId, onSwitchToPost }) {
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
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white border rounded-4 shadow-sm flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="small fw-bold text-dark text-uppercase">Filter Activity:</span>
          </div>
          <select
            className="form-select form-select-sm w-auto rounded-3 px-3 py-1.5 border fw-medium"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Collaboration Types</option>
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
              <div className="card border rounded-4 p-4 shadow-sm bg-white" key={a._id}>
                <div>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold text-uppercase px-2.5 py-1 rounded-3 mb-2 d-inline-block" style={{ fontSize: "0.72rem" }}>
                        {TYPE_LABEL[a.type] || a.type}
                      </span>
                      <h2 className="h6 fw-bold mb-1 text-dark">{a.title}</h2>
                      <p className="small text-secondary mb-0">
                        Posted by <strong className="text-dark">{a.postedBy?.name}</strong> {a.postedBy?.companyName ? `· ${a.postedBy.companyName}` : ""}
                      </p>
                    </div>
                    {!isOwn && (alreadyApplied ? (
                      <StatusBadge status="pending" label="Applied" />
                    ) : openId !== a._id ? (
                      <button className="btn btn-primary btn-sm px-3.5 fw-semibold rounded-3 shadow-sm" onClick={() => setOpenId(a._id)}>
                        Apply
                      </button>
                    ) : null)}
                  </div>
                  <p className="small text-secondary mt-2 mb-0" style={{ lineHeight: 1.55 }}>{a.description}</p>

                  {openId === a._id && (
                    <div className="border-top pt-3 mt-3">
                      <textarea
                        className="form-control form-control-sm mb-2 rounded-3"
                        rows={2}
                        placeholder="Why are you a good fit for this collaboration?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm px-3.5 fw-semibold rounded-3 shadow-sm"
                          disabled={submitting || message.trim().length < 5}
                          onClick={() => apply(a._id)}
                        >
                          {submitting ? "Sending…" : "Send application"}
                        </button>
                        <button className="btn btn-outline-secondary btn-sm px-3 rounded-3" onClick={() => setOpenId(null)}>
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

      {/* Right Column: NEP 2020 Collaboration Advisory */}
      <div className="col-lg-4">
        <div className="card border rounded-4 p-4 shadow-sm bg-white mb-4">
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
            <span style={{ fontSize: "1.2rem" }}>🏛️</span>
            <h3 className="h6 fw-bold mb-0 text-dark">NEP 2020 Faculty Exchange</h3>
          </div>
          <p className="text-muted small mb-3">
            National Education Policy 2020 mandates active industry immersion and cross-institutional faculty development.
          </p>
          <div className="d-flex flex-column gap-2 mb-3">
            <div className="p-2.5 rounded-3 bg-light border">
              <div className="fw-semibold text-dark small">Industrial Apprenticeships</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>Faculty immersion in active engineering hubs</div>
            </div>
            <div className="p-2.5 rounded-3 bg-light border">
              <div className="fw-semibold text-dark small">Joint R&D Consultancies</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>Direct corporate grants and prototyping labs</div>
            </div>
          </div>
          {onSwitchToPost && (
            <button className="btn btn-outline-primary btn-sm w-100 rounded-3 fw-semibold" onClick={onSwitchToPost}>
              + Post New Activity
            </button>
          )}
        </div>
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
    <div className="card border rounded-4 p-4 shadow-sm bg-white" style={{ maxWidth: "680px" }}>
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="h6 fw-bold mb-0 text-dark">Create Collaboration Initiative</h3>
        <p className="text-muted small mb-0">Publish an FDP, guest lecture, or industry project opportunity</p>
      </div>
      {error && <div className="alert alert-danger rounded-3">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Activity Type</label>
          <select className="form-select rounded-3" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Title</label>
          <input className="form-control rounded-3" required placeholder="e.g. Modern Full-Stack System Design FDP" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Description & Objectives</label>
          <textarea
            className="form-control rounded-3"
            rows={4}
            required
            placeholder="Outline expected deliverables, duration, participating faculty, or industry expectations..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn btn-primary rounded-3 px-4 py-2 fw-semibold shadow-sm" disabled={submitting}>
          {submitting ? "Posting…" : "Post activity"}
        </button>
      </form>
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
          <div className="card border rounded-4 p-4 shadow-sm bg-white" key={a._id}>
            <div>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle fw-semibold text-uppercase px-2.5 py-1 rounded-3 mb-2 d-inline-block" style={{ fontSize: "0.72rem" }}>
                    {TYPE_LABEL[a.type]}
                  </span>
                  <h2 className="h6 fw-bold mb-1 text-dark">{a.title}</h2>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <StatusBadge status={a.status === "open" ? "met" : "neutral"} label={a.status} />
                  {a.status === "open" && (
                    <button className="btn btn-outline-secondary btn-sm rounded-3 px-3" disabled={busyKey === a._id} onClick={() => close(a._id)}>
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
                      <p className="small fw-semibold mb-0 text-dark">
                        {ap.user?.name} {ap.user?.companyName ? `· ${ap.user.companyName}` : ""}
                      </p>
                      <p className="small text-secondary mb-0">{ap.message}</p>
                    </div>
                    {ap.status === "pending" ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm rounded-3 px-3 fw-semibold shadow-sm"
                          disabled={busyKey === ap._id}
                          onClick={() => respond(a._id, ap._id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-3 px-3"
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
