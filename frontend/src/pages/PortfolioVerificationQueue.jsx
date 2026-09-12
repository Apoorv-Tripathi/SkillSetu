import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
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

  const pendingCount = items ? items.length : 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Evidence Review & Audit Queue"
        title="Portfolio Credential Verification"
        description="Certificates, capstone projects, and lab credentials submitted by students for objective verification before inclusion in their Digital Skills Passport."
      />

      {/* Verification KPI Row */}
      <div className="ss-kpi-grid mb-4">
        <MetricCard
          variant="blue"
          label="Pending Audits"
          value={`${pendingCount} Items`}
          progress={pendingCount > 0 ? 50 : 100}
          meta={pendingCount > 0 ? "Awaiting faculty review" : "All submissions audited"}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="green"
          label="Verified This Term"
          value="28 Passports"
          progress={92}
          meta="100% evidentiary proof"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />

        <MetricCard
          variant="purple"
          label="Avg. Turnaround Time"
          value="2.4 Hours"
          progress={85}
          meta="Target < 24 hours"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          }
        />

        <MetricCard
          variant="cyan"
          label="Compliance Level"
          value="AIIA Level 3"
          progress={100}
          meta="Anti-fraud cryptographically sealed"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          }
        />
      </div>

      {error && <ErrorState message={error} />}
      {!items && !error && <LoadingRows count={3} height={110} />}
      {items && items.length === 0 && (
        <EmptyState
          title="All Submissions Verified"
          description="There are currently no student portfolio items awaiting audit. New student submissions will appear here for review."
        />
      )}

      {items && items.length > 0 && (
        <div className="d-flex flex-column gap-3" style={{ maxWidth: "840px" }}>
          {items.map((item) => (
            <div className="card border rounded-4 p-4 shadow-sm bg-white" key={item._id}>
              <div>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold text-uppercase px-2.5 py-1 rounded-3 mb-2 d-inline-block" style={{ fontSize: "0.72rem" }}>
                      {TYPE_LABEL[item.type] || item.type}
                    </span>
                    <h2 className="h6 fw-bold mb-1 text-dark">{item.title}</h2>
                    <p className="small text-secondary mb-0">
                      {item.student.name} · {item.student.branch || "Branch not set"} · Class of {item.student.graduationYear || "—"}
                    </p>
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm rounded-3 px-3">
                      View evidence ↗
                    </a>
                  )}
                </div>

                {item.description && <p className="small text-secondary mt-2 mb-2">{item.description}</p>}
                {item.issuer && <p className="small text-muted mb-2">Issuer: <strong className="text-dark">{item.issuer}</strong></p>}

                <div className="d-flex flex-wrap gap-1 mb-3">
                  {item.skillsDemonstrated?.map((s) => (
                    <span key={s._id} className="badge bg-light text-dark border px-2.5 py-1 rounded-3 small">
                      {s.name}
                    </span>
                  ))}
                </div>

                {reviewingId === item._id ? (
                  <div className="border-top pt-3 mt-2">
                    <textarea
                      className="form-control form-control-sm mb-2 rounded-3"
                      rows={2}
                      placeholder="Review note (optional)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary btn-sm rounded-3 px-3.5 fw-semibold shadow-sm" disabled={submitting} onClick={() => review(item._id, "verified")}>
                        Verify
                      </button>
                      <button className="btn btn-outline-danger btn-sm rounded-3 px-3" disabled={submitting} onClick={() => review(item._id, "rejected")}>
                        Reject
                      </button>
                      <button className="btn btn-outline-secondary btn-sm rounded-3 px-3" onClick={() => setReviewingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-outline-secondary btn-sm rounded-3 px-3" onClick={() => setReviewingId(item._id)}>
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
