import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function CareerRoadmap() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [savingInterests, setSavingInterests] = useState(false);
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    api
      .getCareerRoadmap(token)
      .then((res) => {
        setData(res);
        if (res.activePath) {
          setSelectedPathId(res.activePath.id);
        }
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const activePath =
    data?.evaluatedPaths?.find((p) => p.id === selectedPathId) || data?.activePath;

  const handleSelectPath = async (pathId) => {
    setSelectedPathId(pathId);
    try {
      await api.updateCareerInterests({ targetRoles: [pathId] }, token);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddInterest = async (e) => {
    e.preventDefault();
    if (!interestInput.trim() || !data) return;
    const newInterests = Array.from(new Set([...(data.careerInterests || []), interestInput.trim()]));
    setSavingInterests(true);
    try {
      await api.updateCareerInterests({ careerInterests: newInterests }, token);
      setData((prev) => ({ ...prev, careerInterests: newInterests }));
      setInterestInput("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingInterests(false);
    }
  };

  const handleRemoveInterest = async (interestToRemove) => {
    if (!data) return;
    const newInterests = (data.careerInterests || []).filter((i) => i !== interestToRemove);
    try {
      await api.updateCareerInterests({ careerInterests: newInterests }, token);
      setData((prev) => ({ ...prev, careerInterests: newInterests }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="AI-Powered Career Intelligence"
        title="Career Guidance & Roadmap"
        description="Data-driven career pathways aligned with your verified competencies, career interests, and current industry demand."
        actions={
          <Link to="/opportunities/browse" className="btn btn-primary btn-sm">
            {t("Explore Openings →")}
          </Link>
        }
      />

      {error && <ErrorState message={error} />}
      {!data && !error && <LoadingRows count={3} height={120} />}

      {data && (
        <div>
          {/* Target Role Selector Bar */}
          <div className="ss-data-panel mb-4">
            <div className="ss-data-panel__head d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h2 className="mb-0" style={{ fontSize: "1.05rem" }}>{t("Select a career track to evaluate your roadmap", "Select Career Track")}</h2>
                <span className="small text-muted" style={{ fontSize: "0.72rem" }}>{t("Target Career Pathways", "AI-Powered Alignment against Live Demand")}</span>
              </div>
              <span className="badge bg-success-subtle text-success font-monospace">
                {t("Industry Benchmark Aligned", "Industry Benchmark Aligned")}
              </span>
            </div>

            <div className="ss-data-panel__body p-3">
              <div className="row g-3">
                {data.evaluatedPaths?.map((path) => {
                  const isSelected = path.id === activePath?.id;
                  return (
                    <div className="col-md-3 col-sm-6" key={path.id}>
                      <div
                        onClick={() => handleSelectPath(path.id)}
                        className={`p-3 h-100 transition-all cursor-pointer`}
                        style={{
                          borderRadius: "18px",
                          cursor: "pointer",
                          background: isSelected ? "#1C1C1E" : "rgba(0, 0, 0, 0.02)",
                          color: isSelected ? "#FFFFFF" : "inherit",
                          border: isSelected ? "1px solid #1C1C1E" : "1px solid rgba(0, 0, 0, 0.07)",
                          boxShadow: isSelected ? "0 8px 20px rgba(0, 0, 0, 0.15)" : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className={`small fw-bold ${isSelected ? "text-white-50" : "text-muted"}`} style={{ fontSize: "0.72rem" }}>
                            {path.domain}
                          </span>
                          <span
                            className="badge font-monospace"
                            style={{
                              background: isSelected ? "rgba(247, 201, 62, 0.2)" : "rgba(247, 201, 62, 0.15)",
                              color: isSelected ? "#F7C93E" : "#8A6D00",
                              fontSize: "0.72rem",
                            }}
                          >
                            {path.matchPercentage}% {t("match", "match")}
                          </span>
                        </div>
                        <div className={`fw-bold mb-2 text-truncate ${isSelected ? "text-white" : ""}`} title={path.title} style={{ fontSize: "0.92rem" }}>
                          {path.title}
                        </div>
                        <div className={`small ${isSelected ? "text-white-50" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
                          {t("Demand")}: <strong className={isSelected ? "text-white" : "text-dark"}>{path.demand}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Career Path Details & 5-Stage Stepper */}
          {activePath && (
            <div className="row g-4 mb-4">
              {/* Left Column: 5-Stage Visual Stepper */}
              <div className="col-lg-8">
                <div className="ss-data-panel">
                  <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-success-subtle text-success text-uppercase me-2 font-monospace" style={{ fontSize: "0.68rem" }}>
                        {t("Active Track")}
                      </span>
                      <h2 className="d-inline mb-0" style={{ fontSize: "1.05rem" }}>{activePath.title} {t("nav_career_roadmap")}</h2>
                    </div>
                    <span className="badge font-monospace px-3 py-2" style={{ background: "rgba(247, 201, 62, 0.2)", color: "#1C1C1E", fontSize: "0.85rem", fontWeight: 700 }}>
                      {activePath.matchPercentage}% {t("Ready")}
                    </span>
                  </div>

                  <div className="ss-data-panel__body p-4">
                    {/* Visual Stepper */}
                    <div className="ss-stepper">
                      {data.stages?.map((st) => (
                        <div className="ss-stepper__item" key={st.step}>
                          <div
                            className={`ss-stepper__circle ${
                              st.status === "completed"
                                ? "ss-stepper__circle--completed"
                                : st.status === "current"
                                ? "ss-stepper__circle--current"
                                : ""
                            }`}
                          >
                            {st.status === "completed" ? "✓" : st.step}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
                              <span className="fw-bold" style={{ fontSize: "0.92rem" }}>{t(st.title)}</span>
                              <span
                                className={`badge ${
                                  st.status === "completed"
                                    ? "bg-success-subtle text-success"
                                    : st.status === "current"
                                    ? "bg-warning-subtle text-dark"
                                    : "bg-secondary-subtle text-muted"
                                }`}
                                style={{ fontSize: "0.68rem" }}
                              >
                                {t(st.status.toUpperCase())}
                              </span>
                            </div>
                            <p className="small text-muted mb-1">{t(st.description)}</p>
                            <div className="small font-monospace text-muted" style={{ fontSize: "0.72rem" }}>{st.metrics}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Required Competencies Breakdown */}
                    <div className="mt-4 pt-3 border-top">
                      <h3 className="h6 fw-bold mb-3">{t("Target Competency Breakdown")}</h3>
                      <div className="row g-2">
                        {activePath.skillBreakdown?.map((item) => (
                          <div className="col-md-6" key={item.skill}>
                            <div className="p-2 px-3 rounded-3 border d-flex justify-content-between align-items-center" style={{ background: "rgba(0,0,0,0.015)" }}>
                              <div>
                                <span className="fw-semibold small">{item.skill}</span>
                                <div className="small text-muted font-monospace" style={{ fontSize: "0.7rem" }}>
                                  {t("Proficiency")}: {item.score ? `${item.score.toFixed(1)} / 5.0` : t("Not evaluated")}
                                </div>
                              </div>
                              <span
                                className={`badge ${
                                  item.met ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                                }`}
                                style={{ fontSize: "0.68rem" }}
                              >
                                {item.met ? t("Requirement Met") : t("Gap to Close")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Career Interests & Next Best Steps */}
              <div className="col-lg-4">
                {/* Career Interests Widget */}
                <div className="ss-data-panel mb-4">
                  <div className="ss-data-panel__head">
                    <h2 style={{ fontSize: "0.95rem" }}>{t("Your Career Interests")}</h2>
                  </div>
                  <div className="ss-data-panel__body p-3">
                    <p className="small text-muted mb-3">
                      {t("Add specific sectors or roles you are passionate about to refine recommendations.")}
                    </p>

                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {data.careerInterests?.map((ci) => (
                        <span
                          key={ci}
                          className="badge bg-secondary-subtle text-dark px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1"
                        >
                          {ci}
                          <button
                            type="button"
                            className="btn-close btn-close-xs"
                            style={{ fontSize: "0.55rem" }}
                            onClick={() => handleRemoveInterest(ci)}
                          />
                        </span>
                      ))}
                    </div>

                    <form onSubmit={handleAddInterest} className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-pill"
                        placeholder="e.g. Health Informatics"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                      />
                      <button type="submit" className="btn btn-secondary btn-sm rounded-pill px-3" disabled={savingInterests}>
                        {t("Add")}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Recommended Certifications: Deep Charcoal Focus Card */}
                <div className="ss-directive-card">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="ss-directive-card__eyebrow">{t("certifications", "Verified Credentials")}</span>
                    <span className="ss-directive-card__impact">High Value</span>
                  </div>
                  <h3 className="ss-directive-card__title" style={{ fontSize: "1.02rem" }}>
                    Accelerate {activePath.title}
                  </h3>
                  <div className="d-flex flex-column gap-2 my-3">
                    {activePath.recommendedCertifications?.map((rc) => (
                      <div key={rc} className="p-2 rounded-3 small fw-semibold" style={{ background: "rgba(255,255,255,0.08)", color: "#FFFFFF" }}>
                        ★ {rc}
                      </div>
                    ))}
                  </div>
                  <Link to="/learning" className="btn btn-brass btn-sm w-100 fw-bold">
                    {t("Browse Learning Modules →")}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Recommended Opportunities for Career Track */}
          {data.recommendedOpportunities?.length > 0 && (
            <div className="ss-data-panel">
              <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-0" style={{ fontSize: "1.05rem" }}>{t("Matching Opportunities for Your Roadmap")}</h2>
                  <span className="small text-muted" style={{ fontSize: "0.72rem" }}>
                    {t("Hand-picked internships and training programs matching your current skill profile.")}
                  </span>
                </div>
                <Link to="/opportunities/browse" className="ss-card-arrow-btn" aria-label="View Openings">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>

              <div className="ss-data-panel__body p-3">
                <div className="row g-3">
                  {data.recommendedOpportunities.map((opp) => (
                    <div className="col-md-4" key={opp._id}>
                      <div className="p-3 rounded-4 border h-100 d-flex flex-column justify-content-between" style={{ background: "rgba(0,0,0,0.015)" }}>
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-secondary-subtle text-dark font-monospace small">
                              {opp.type.toUpperCase()}
                            </span>
                            {opp.stipend && (
                              <span className="small text-success fw-bold font-monospace">{opp.stipend}</span>
                            )}
                          </div>
                          <h3 className="h6 fw-bold mb-1">{opp.title}</h3>
                          <p className="small text-muted mb-2">{opp.companyName}</p>
                        </div>
                        <div className="pt-2 border-top mt-auto">
                          <Link to="/opportunities/browse" className="btn btn-outline-secondary btn-sm w-100 rounded-pill">
                            {t("View Details & Apply")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
