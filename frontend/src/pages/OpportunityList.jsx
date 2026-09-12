import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function OpportunityList() {
  const { token } = useAuth();
  const [opportunities, setOpportunities] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api
      .getMyOpportunities(token)
      .then(({ opportunities }) => setOpportunities(opportunities))
      .catch((err) => setError(err.message));
  }, [token]);

  const filtered = opportunities?.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.title?.toLowerCase().includes(q) ||
      o.type?.toLowerCase().includes(q) ||
      o.location?.toLowerCase().includes(q)
    );
  });

  const formatLocation = (loc, isRemote) => {
    if (!loc && !isRemote) return "Not specified";
    if (loc && loc.toLowerCase().includes("remote")) return loc;
    if (!loc && isRemote) return "Remote";
    return isRemote ? `${loc} · Remote` : loc;
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Industry Recruiter Portal"
        title="Your Published Opportunities"
        description="Manage active job openings, internships, apprenticeships, and live projects with verified candidate matching."
        actions={
          <Link to="/opportunities/new" className="btn btn-primary btn-sm rounded-3 px-3.5 fw-semibold shadow-sm">
            + Post New Opening
          </Link>
        }
      />

      {error && <ErrorState message={error} />}
      {!opportunities && !error && <LoadingRows count={3} height={110} />}

      {opportunities && opportunities.length === 0 && (
        <EmptyState
          title="No opportunities posted yet"
          description="Create your first role opening to start receiving verified student applications and competency matches."
          action={
            <Link to="/opportunities/new" className="btn btn-primary btn-sm rounded-3 px-3.5 fw-semibold shadow-sm">
              Post Opportunity
            </Link>
          }
        />
      )}

      {opportunities && opportunities.length > 0 && (
        <>
          {/* Standard 4-Card Metric Grid */}
          <div className="ss-kpi-grid mb-4">
            <MetricCard
              label="Published Postings"
              value={opportunities.length}
              meta="Live in student marketplace"
              variant="blue"
              progress={100}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              }
            />
            <MetricCard
              label="Total Applications"
              value="2 Received"
              meta="Direct candidate submissions"
              variant="purple"
              progress={70}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              }
            />
            <MetricCard
              label="Matching Model"
              value="Verified Skills"
              meta="100% objective evaluation"
              variant="green"
              progress={90}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              }
            />
            <MetricCard
              label="Posting Status"
              value="Open & Active"
              meta="Continuous candidate pipeline"
              variant="cyan"
              progress={85}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              }
            />
          </div>

          {/* Table Container Card */}
          <div className="card border rounded-4 p-4 mb-4 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-3">
              <div>
                <h3 className="h6 fw-bold mb-0 text-dark">Active Role Postings ({opportunities.length})</h3>
                <p className="small text-muted mb-0">Candidate submissions are pre-scored against specified competencies</p>
              </div>
              <div style={{ minWidth: "220px" }}>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3 px-3"
                  placeholder="Filter by title or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
                    <th>Role Title</th>
                    <th>Engagement Type</th>
                    <th>Location</th>
                    <th>Required Competencies</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o._id} style={{ fontSize: "0.88rem" }}>
                      <td>
                        <span className="fw-bold text-dark d-block">{o.title}</span>
                        {o.stipend && (
                          <span className="badge bg-success-subtle text-success fw-semibold mt-1 rounded-3" style={{ fontSize: "0.72rem" }}>
                            {o.stipend}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold text-uppercase px-2.5 py-1 rounded-3"
                          style={{ fontSize: "0.72rem" }}
                        >
                          {o.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="text-secondary">
                        <span className="small fw-medium">
                          {formatLocation(o.location, o.isRemote)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1.5">
                          {o.requiredSkills?.map((rs) => (
                            <span
                              key={rs.skill?._id || rs.skill}
                              className="badge bg-light text-dark border px-2 py-1 rounded-3 fw-medium"
                              style={{ fontSize: "0.74rem" }}
                            >
                              {rs.skill?.name || "Skill"}{" "}
                              <span className="text-primary fw-bold">≥ {rs.minProficiency}/5</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/opportunities/${o._id}/applicants`}
                          className="btn btn-outline-secondary btn-sm rounded-3 px-3 fw-medium"
                        >
                          Applicants →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
