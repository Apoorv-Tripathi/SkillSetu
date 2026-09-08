import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

const TYPE_LABEL = {
  certificate: "Certificate",
  project: "Project",
  document: "Document",
  resume: "Resume",
  internship_report: "Internship Report",
};

export default function PortfolioVerificationQueue() {
  const { token } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api
      .getVerificationQueue(token)
      .then(({ items }) => setItems(items))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);

  async function review(id, verificationStatus) {
    setSubmitting(true);
    setError(null);
    try {
      await api.reviewPortfolioItem(id, { verificationStatus, reviewNote: note }, token);
      setReviewingId(null);
      setNote("");
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
        eyebrow="Evidence review"
        title="Portfolio verification queue"
        description="Certificates, projects, and documents students have submitted as evidence — reviewed manually, never auto-approved."
      />

      {error && <ErrorState message={error} />}
      {!items && !error && <LoadingRows count={3} height={110} />}
      {items && items.length === 0 && <EmptyState title="Nothing pending review" description="You're caught up." />}

      <div className="d-flex flex-column gap-3" style={{ maxWidth: "720px" }}>
        {items?.map((item) => (
          <div className="ss-panel" key={item._id}>
            <div className="ss-panel__body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <span className="ss-status ss-status--neutral mb-2 d-inline-block">{TYPE_LABEL[item.type]}</span>
                  <h2 className="h6 mb-1">{item.title}</h2>
                  <p className="small text-secondary mb-0">
                    {item.student.name} · {item.student.branch || "Branch not set"} · Class of {item.student.graduationYear || "—"}
                  </p>
                </div>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="small">
                    View evidence ↗
                  </a>
                )}
              </div>

              {item.description && <p className="small mt-2 mb-2">{item.description}</p>}
              {item.issuer && <p className="small text-secondary mb-2">Issuer: {item.issuer}</p>}

              <div className="d-flex flex-wrap gap-1 mb-3">
                {item.skillsDemonstrated.map((s) => (
                  <span key={s._id} className="ss-status ss-status--neutral">{s.name}</span>
                ))}
              </div>

              {reviewingId === item._id ? (
                <div className="border-top pt-3">
                  <textarea
                    className="form-control form-control-sm mb-2"
                    rows={2}
                    placeholder="Review note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm" disabled={submitting} onClick={() => review(item._id, "verified")}>
                      Verify
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" disabled={submitting} onClick={() => review(item._id, "rejected")}>
                      Reject
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setReviewingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setReviewingId(item._id)}>
                  Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
