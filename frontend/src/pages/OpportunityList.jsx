import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function OpportunityList() {
  const { token } = useAuth();
  const [opportunities, setOpportunities] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMyOpportunities(token)
      .then(({ opportunities }) => setOpportunities(opportunities))
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recruiting"
        title="Your postings"
        actions={
          <Link to="/opportunities/new" className="btn btn-primary btn-sm">
            + Post new
          </Link>
        }
      />

      {error && <ErrorState message={error} />}
      {!opportunities && !error && <LoadingRows count={2} height={100} />}
      {opportunities && opportunities.length === 0 && (
        <EmptyState
          title="No opportunities posted yet"
          action={
            <Link to="/opportunities/new" className="btn btn-primary btn-sm">
              Post opportunity
            </Link>
          }
        />
      )}

      <div className="ss-table-dense">
        {opportunities && opportunities.length > 0 && (
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Required skills</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o._id}>
                  <td className="fw-semibold">{o.title}</td>
                  <td className="text-capitalize">{o.type.replace("_", " ")}</td>
                  <td className="text-secondary">
                    {o.location || "Not specified"}
                    {o.isRemote ? " · Remote" : ""}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {o.requiredSkills.map((rs) => (
                        <span key={rs.skill._id} className="ss-status ss-status--neutral">
                          {rs.skill.name} ≥ {rs.minProficiency}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Link to={`/opportunities/${o._id}/applicants`} className="btn btn-outline-secondary btn-sm">
                      View applicants
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
