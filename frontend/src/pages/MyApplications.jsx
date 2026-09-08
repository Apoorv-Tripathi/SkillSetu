import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import ApplicationTimeline from "../components/ui/ApplicationTimeline.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function MyApplications() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [applications, setApplications] = useState(null);
  const [milestonesByApp, setMilestonesByApp] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMyApplications(token)
      .then(async ({ applications }) => {
        setApplications(applications);
        const inProgress = applications.filter((a) => ["interview", "offer"].includes(a.status));
        const entries = await Promise.all(
          inProgress.map((a) =>
            api
              .getMilestonesForApplication(a._id, token)
              .then(({ milestones }) => [a._id, milestones])
              .catch(() => [a._id, []])
          )
        );
        setMilestonesByApp(Object.fromEntries(entries));
      })
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Pipeline"
        title="Your applications"
        description="Applied → Shortlisted → Interview → Offer, with milestones tracked as they happen."
      />

      {error && <ErrorState message={error} />}
      {!applications && !error && <LoadingRows count={2} height={130} />}
      {applications && applications.length === 0 && (
        <EmptyState
          title={t("You haven't applied to anything yet")}
          action={
            <Link to="/opportunities/browse" className="btn btn-primary btn-sm">
              {t("Browse opportunities")}
            </Link>
          }
        />
      )}

      <div className="d-flex flex-column gap-3">
        {applications?.map((a) => (
          <div className="ss-card-modern" key={a._id}>
            <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
              <div>
                <h2 className="h5 fw-bold mb-1">{a.opportunity?.title || t("Role")}</h2>
                <p className="small text-secondary mb-0">{a.opportunity?.companyName || t("Company")}</p>
              </div>
              <span className="badge bg-primary-subtle text-primary font-monospace px-3 py-2 rounded-pill">
                {t("Match")} {a.matchScore}%
              </span>
            </div>

            <ApplicationTimeline status={a.status} />

            {a.mentor && (
              <div className="mt-3 p-2 bg-light rounded small text-secondary">
                <span className="fw-semibold">{t("Mentor assigned:")}</span> {a.mentor.name}
              </div>
            )}

            {milestonesByApp[a._id]?.length > 0 && (
              <div className="mt-3 pt-3 border-top">
                <p className="small fw-bold mb-2">{t("Milestones")}</p>
                <div className="d-flex flex-column gap-2">
                  {milestonesByApp[a._id].map((m) => (
                    <div key={m._id} className="d-flex justify-content-between align-items-center small p-2 bg-light rounded">
                      <span className="fw-medium">{m.title}</span>
                      <StatusBadge status={m.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
