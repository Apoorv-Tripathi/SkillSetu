import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
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
        eyebrow="Collaboration"
        title="Find a mentor"
        description="Mentors submit real evaluations that live-update your skill-gap heatmap."
      />

      {error && <ErrorState message={error} />}
      {mentors.length === 0 && !error && <EmptyState title={t("No mentors available yet")} />}

      <div className="row g-3">
        {mentors.map((m) => {
          const status = statusFor(m._id);
          return (
            <div className="col-md-6" key={m._id}>
              <div className="ss-panel h-100">
                <div className="ss-panel__body">
                  <h2 className="h6 mb-1">{m.name}</h2>
                  <p className="small text-secondary mb-2">{m.bio}</p>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {m.expertiseSkills.map((s) => (
                      <span key={s._id} className="ss-status ss-status--neutral">{s.name}</span>
                    ))}
                  </div>

                  {status ? (
                    <span className="ss-status ss-status--neutral text-capitalize">
                      {t("Request")} {t(status)}
                    </span>
                  ) : openId === m._id ? (
                    <div>
                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows={2}
                        placeholder={t("Why would you like this mentor's guidance?")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={submitting || message.trim().length < 5}
                          onClick={() => sendRequest(m._id)}
                        >
                          {submitting ? t("Sending…") : t("Send request")}
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setOpenId(null)}>
                          {t("Cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setOpenId(m._id)}>
                      {t("Request mentorship")}
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
