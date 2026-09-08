import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function MentorRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() {
    api
      .getIncomingMentorshipRequests(token)
      .then(({ requests }) => setRequests(requests))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);

  async function respond(id, status) {
    setBusyId(id);
    setError(null);
    try {
      await api.respondToMentorshipRequest(id, { status }, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Collaboration" title="Mentorship requests" />

      {error && <ErrorState message={error} />}
      {!requests && !error && <LoadingRows count={2} height={90} />}
      {requests && requests.length === 0 && <EmptyState title="No requests yet" />}

      <div className="d-flex flex-column gap-3" style={{ maxWidth: "640px" }}>
        {requests?.map((r) => (
          <div className="ss-panel" key={r._id}>
            <div className="ss-panel__body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h2 className="h6 mb-1">{r.student.name}</h2>
                  <p className="small text-secondary mb-0">{r.student.branch || "Branch not set"}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="small mb-3">{r.message}</p>
              {r.status === "pending" && (
                <div className="d-flex gap-2">
                  <button className="btn btn-primary btn-sm" disabled={busyId === r._id} onClick={() => respond(r._id, "accepted")}>
                    Accept
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={busyId === r._id} onClick={() => respond(r._id, "declined")}>
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
