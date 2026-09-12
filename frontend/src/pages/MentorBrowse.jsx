import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import { EmptyState, ErrorState } from "../components/ui/States.jsx";

export default function MentorBrowse() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    Promise.all([api.listMentors(token), api.getMyMentorshipRequests(token)])
      .then(([{ mentors }, { requests }]) => {
        setMentors(mentors);
        setRequests(requests);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);

  async function sendRequest(mentorId) {
    setSubmitting(true);
    setError(null);
    try {
      await api.createMentorshipRequest({ mentor: mentorId, message }, token);
      setOpenId(null);
      setMessage("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function statusFor(mentorId) {
    return requests.find((r) => r.mentor._id === mentorId)?.status;
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Collaboration & Guidance"
        title="Find an Industry Mentor"
        description="Connect with industry practitioners and senior engineers who submit direct skill endorsements that calibrate your skill-gap heatmap."
      />

      {error && <ErrorState message={error} />}

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <MetricCard
            title={t("Available Mentors", "Available Mentors")}
            value={`${mentors.length} Verified`}
            subtitle={t("Industry Practitioners", "Industry Practitioners")}
            variant="blue"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <MetricCard
            title={t("Active Connections", "Active Connections")}
            value={`${requests.filter((r) => r.status === "accepted").length} Active`}
            subtitle={t("Mentorship Guidance", "Mentorship Guidance")}
            variant="green"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <MetricCard
            title={t("Pending Requests", "Pending Requests")}
            value={`${requests.filter((r) => r.status === "pending").length} In Review`}
            subtitle={t("Awaiting Mentor Approval", "Awaiting Mentor Approval")}
            variant="amber"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <MetricCard
            title={t("Endorsement Power", "Endorsement Power")}
            value="Direct Audit"
            subtitle={t("Calibrates Skill Passport", "Calibrates Skill Passport")}
            variant="purple"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          />
        </div>
      </div>

      {mentors.length === 0 && !error && <EmptyState title={t("No mentors available yet")} />}

      <div className="row g-3">
        {mentors.map((m) => {
          const status = statusFor(m._id);
          return (
            <div className="col-md-6" key={m._id}>
              <div className="ss-card-modern h-100 p-4">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                    style={{
                      width: "44px",
                      height: "44px",
                      background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                      fontSize: "1.1rem",
                    }}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <h2 className="h6 fw-bold text-dark mb-0">{m.name}</h2>
                      <span className="badge bg-success-subtle text-success small fw-semibold">
                        ✓ Verified Mentor
                      </span>
                    </div>
                    <p className="small text-muted mb-0 mt-1">{m.bio || "Industry software engineer & technical mentor."}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small text-muted mb-1 fw-semibold" style={{ fontSize: "0.72rem" }}>
                    DOMAIN EXPERTISE:
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {m.expertiseSkills?.map((s) => (
                      <span key={s._id} className="ss-badge-pill ss-badge-pill--indigo">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-top mt-auto">
                  {status ? (
                    <span className={`badge ${status === "accepted" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} text-capitalize px-3 py-2 fw-semibold`}>
                      Request {t(status)}
                    </span>
                  ) : openId === m._id ? (
                    <div>
                      <textarea
                        className="form-control form-control-sm mb-2 rounded-3"
                        rows={2}
                        placeholder={t("Why would you like this mentor's guidance?")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold shadow-sm"
                          disabled={submitting || message.trim().length < 5}
                          onClick={() => sendRequest(m._id)}
                        >
                          {submitting ? t("Sending…") : t("Send Request")}
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                          onClick={() => setOpenId(null)}
                        >
                          {t("Cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                      onClick={() => setOpenId(m._id)}
                    >
                      Request Mentorship →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
