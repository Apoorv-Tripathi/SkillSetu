import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

export default function LearningMarketplace() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState(null);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [enrolledMap, setEnrolledMap] = useState({});

  useEffect(() => {
    api
      .listOpportunities(token, { type: "learning" })
      .then(({ opportunities }) => setOpportunities(opportunities))
      .catch((err) => setError(err.message));
  }, [token]);

  const filtered = opportunities?.filter((opp) => {
    if (activeFilter === "all") return true;
    return opp.type === activeFilter;
  });

  const handleEnroll = (id) => {
    setEnrolledMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Industry Upskilling & Certifications"
        title="Learning Marketplace"
        description="Explore training programs, certification courses, and workshops published by industry partners and research institutions to bridge your skill gaps."
        actions={
          <Link to="/skill-gap" className="btn btn-outline-primary btn-sm">
            {t("View My Skill Gaps →")}
          </Link>
        }
      />

      {/* Info Banner */}
      <div className="alert alert-info border-0 rounded-4 p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <strong>🎯 {t("Targeted Skill Gap Remediation:")}</strong>
          <span className="ms-2 small">
            {t("Completing these industry-vetted programs updates your verified Skill Profile and increases your placement match score.")}
          </span>
        </div>
        <Link to="/career-roadmap" className="btn btn-primary btn-sm px-3">
          {t("Check Career Roadmap")}
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="ss-filter-bar mb-4">
        <span className="small fw-bold text-secondary text-uppercase me-2">{t("Category:")}</span>
        <button
          onClick={() => setActiveFilter("all")}
          className={`badge px-3 py-2 rounded-pill border-0 ${
            activeFilter === "all" ? "bg-primary text-white" : "bg-light text-secondary border"
          }`}
        >
          {t("All Programs")} ({opportunities?.length || 0})
        </button>
        <button
          onClick={() => setActiveFilter("training_program")}
          className={`badge px-3 py-2 rounded-pill border-0 ${
            activeFilter === "training_program" ? "bg-primary text-white" : "bg-light text-secondary border"
          }`}
        >
          {t("Training Modules")} ({opportunities?.filter((o) => o.type === "training_program").length || 0})
        </button>
        <button
          onClick={() => setActiveFilter("certification_course")}
          className={`badge px-3 py-2 rounded-pill border-0 ${
            activeFilter === "certification_course" ? "bg-primary text-white" : "bg-light text-secondary border"
          }`}
        >
          {t("Certifications")} ({opportunities?.filter((o) => o.type === "certification_course").length || 0})
        </button>
        <button
          onClick={() => setActiveFilter("workshop")}
          className={`badge px-3 py-2 rounded-pill border-0 ${
            activeFilter === "workshop" ? "bg-primary text-white" : "bg-light text-secondary border"
          }`}
        >
          {t("Workshops")} ({opportunities?.filter((o) => o.type === "workshop").length || 0})
        </button>
      </div>

      {error && <ErrorState message={error} />}
      {!opportunities && !error && <LoadingRows count={3} height={110} />}

      {opportunities && filtered?.length === 0 && (
        <EmptyState
          title={t("No learning programs in this category")}
          description={t("Industry partners and institutions regularly post new certification modules. Check back soon!")}
        />
      )}

      {/* Opportunities Grid */}
      <div className="row g-3">
        {filtered?.map((opp) => (
          <div className="col-lg-6" key={opp._id}>
            <div className="ss-card-modern h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <span className="badge bg-primary-subtle text-primary font-monospace text-uppercase small me-2">
                      {opp.type.replace("_", " ")}
                    </span>
                    {opp.stipend && (
                      <span className="badge bg-success-subtle text-success font-monospace small">
                        {opp.stipend}
                      </span>
                    )}
                  </div>
                  <span className="small text-secondary font-monospace">
                    {opp.duration || t("Self-Paced")}
                  </span>
                </div>

                <h3 className="h5 fw-bold mb-1">{opp.title}</h3>
                <p className="small text-secondary mb-2">
                  {t("Offered by")} <strong>{opp.companyName}</strong> · {opp.location || t("Online")}
                </p>

                <p className="small text-secondary mb-3" style={{ lineHeight: 1.5 }}>
                  {opp.description}
                </p>

                {opp.requiredSkills?.length > 0 && (
                  <div className="mb-3">
                    <span className="small text-secondary fw-semibold d-block mb-1">{t("Target Competencies:")}</span>
                    <div className="d-flex flex-wrap gap-1">
                      {opp.requiredSkills.map((rs) => (
                        <span key={rs.skill?._id || rs.skill} className="badge bg-light text-secondary border font-monospace">
                          {rs.skill?.name || "Skill"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center">
                <span className="small text-secondary font-monospace">{t("Verified Certificate on Completion")}</span>
                {enrolledMap[opp._id] ? (
                  <span className="badge bg-success text-white py-2 px-3">
                    ✓ {t("Enrolled / Access Granted")}
                  </span>
                ) : (
                  <button
                    onClick={() => handleEnroll(opp._id)}
                    className="btn btn-primary btn-sm px-4 fw-semibold"
                  >
                    {t("Start Learning →")}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
