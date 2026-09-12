import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

const EVIDENCE_TYPES = ["certificate", "project", "achievement", "document"];
const DOCUMENT_TYPES = ["resume", "internship_report", "academic_record"];

export default function Portfolio() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState(null);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [tab, setTab] = useState("evidence");
  const [form, setForm] = useState({
    type: "project",
    title: "",
    description: "",
    issuer: "",
    credentialId: "",
    link: "",
    skillsDemonstrated: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const TYPE_LABEL = {
    certificate: t("Certificate"),
    project: t("Project"),
    document: t("Document"),
    resume: t("Resume"),
    internship_report: t("Internship Report"),
    achievement: t("Achievement & Award"),
    academic_record: t("Academic Record / Transcript"),
  };

  function load() {
    api
      .getMyPortfolio(token)
      .then(({ items }) => setItems(items))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [token]);
  useEffect(() => {
    api.listSkills(token).then(({ skills }) => setSkills(skills)).catch(() => {});
  }, [token]);

  function toggleSkill(id) {
    setForm((f) => ({
      ...f,
      skillsDemonstrated: f.skillsDemonstrated.includes(id)
        ? f.skillsDemonstrated.filter((s) => s !== id)
        : [...f.skillsDemonstrated, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createPortfolioItem(form, token);
      setForm({
        type: tab === "documents" ? "resume" : "project",
        title: "",
        description: "",
        issuer: "",
        credentialId: "",
        link: "",
        skillsDemonstrated: [],
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const typesForTab = tab === "documents" ? DOCUMENT_TYPES : EVIDENCE_TYPES;
  const visibleItems = items?.filter((i) => typesForTab.includes(i.type));
  const verifiedItems = items?.filter((i) => i.verificationStatus === "verified") || [];
  const verificationPercent =
    items?.length > 0 ? Math.round((verifiedItems.length / items.length) * 100) : 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Verified Evidence & Credentials"
        title="Student Digital Portfolio"
        description="Maintain authenticated records of your verified skills, certifications, projects, internships, achievements, and academic transcripts."
        actions={
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm"
              onClick={() => setShowPassportModal(true)}
            >
              🛡️ {t("View Digital Skill Passport")}
            </button>
            <button
              className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
              onClick={() => {
                setForm((f) => ({ ...f, type: tab === "documents" ? "resume" : "project" }));
                setShowForm((s) => !s);
              }}
            >
              {showForm ? t("Cancel") : t("+ Add Item")}
            </button>
          </div>
        }
      />

      {items && (
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <MetricCard
              title={t("Verified Evidence", "Verified Evidence")}
              value={`${verifiedItems.length} Records`}
              subtitle={t("Institutional Trust Seal", "Institutional Trust Seal")}
              variant="green"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <MetricCard
              title={t("Verification Rate", "Verification Rate")}
              value={`${verificationPercent}%`}
              subtitle={t("Automated & Admin Audited", "Automated & Admin Audited")}
              variant="blue"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <MetricCard
              title={t("Pending Review", "Pending Review")}
              value={`${items.filter((i) => i.verificationStatus === "pending").length} Items`}
              subtitle={t("In Registrar Queue", "In Registrar Queue")}
              variant="amber"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <MetricCard
              title={t("Total Portfolio", "Total Portfolio")}
              value={`${items.length} Submissions`}
              subtitle={t("Across All Categories", "Across All Categories")}
              variant="purple"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            />
          </div>
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "evidence" ? "active" : ""}`}
            onClick={() => setTab("evidence")}
          >
            {t("Evidence & Projects")} ({items?.filter((i) => EVIDENCE_TYPES.includes(i.type)).length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "documents" ? "active" : ""}`}
            onClick={() => setTab("documents")}
          >
            {t("Official Documents & Records")} ({items?.filter((i) => DOCUMENT_TYPES.includes(i.type)).length || 0})
          </button>
        </li>
      </ul>

      {error && <ErrorState message={error} />}

      {showForm && (
        <div className="ss-card-modern mb-4" style={{ maxWidth: "680px" }}>
          <div className="ss-card-modern__head">
            <h2 className="ss-card-modern__title">{t("Add Portfolio Evidence")}</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">{t("Evidence Type")}</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {typesForTab.map((typ) => (
                    <option key={typ} value={typ}>
                      {TYPE_LABEL[typ]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">{t("Credential / Reference ID (Optional)")}</label>
                <input
                  className="form-control"
                  placeholder="e.g. CERT-2026-991"
                  value={form.credentialId}
                  onChange={(e) => setForm((f) => ({ ...f, credentialId: e.target.value }))}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold">{t("Title")}</label>
                <input
                  className="form-control"
                  required
                  placeholder="e.g. 1st Prize in Ayush Smart Automation Hackathon"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold">{t("Description")}</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Summarize the project scope, findings, or achievement details..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">{t("Issuer / Organization")}</label>
                <input
                  className="form-control"
                  placeholder="e.g. Ministry of Ayush, Meta, AIIA"
                  value={form.issuer}
                  onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">{t("Verification Link / Drive URL")}</label>
                <input
                  className="form-control"
                  placeholder="https://..."
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                />
              </div>

              {tab === "evidence" && (
                <div className="col-12">
                  <label className="form-label small fw-semibold">{t("Demonstrated Competencies")}</label>
                  <div className="d-flex flex-wrap gap-1 p-2 rounded bg-light border">
                    {skills.map((s) => (
                      <button
                        type="button"
                        key={s._id}
                        onClick={() => toggleSkill(s._id)}
                        className={`badge border-0 py-2 px-3 rounded-pill transition-all ${
                          form.skillsDemonstrated.includes(s._id)
                            ? "bg-primary text-white"
                            : "bg-light text-secondary border"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="col-12 pt-2">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? t("Saving & Submitting for Review…") : t("Save & Submit for Verification")}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!items && !error && <LoadingRows count={2} height={100} />}
      {items && visibleItems?.length === 0 && (
        <EmptyState
          title={tab === "documents" ? t("No official documents uploaded yet") : t("No portfolio evidence yet")}
          description={t("Upload project work, awards, or academic records to build your Verified Digital Skill Passport.")}
        />
      )}

      {/* 2-Column Main Layout */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-3">
            {visibleItems?.map((item) => (
              <div className="ss-card-modern" key={item._id}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h2 className="h6 fw-bold mb-1">{item.title}</h2>
                    <p className="small text-secondary mb-0">
                      <span className="badge bg-light text-secondary border me-2">{TYPE_LABEL[item.type]}</span>
                      {item.issuer && <span>{t("Issued by")} <strong>{item.issuer}</strong></span>}
                      {item.credentialId && (
                        <span className="ms-2 font-monospace text-secondary">· ID: {item.credentialId}</span>
                      )}
                    </p>
                  </div>
                  <StatusBadge
                    status={item.verificationStatus === "verified" ? "met" : item.verificationStatus === "rejected" ? "gap" : "pending"}
                    label={item.verificationStatus === "unverified" ? t("Not submitted") : t(item.verificationStatus)}
                  />
                </div>

                {item.description && <p className="small text-secondary mt-3 mb-2">{item.description}</p>}

                {item.reviewNote && (
                  <div className="alert alert-warning py-1 px-2 small mb-2" style={{ fontSize: "0.78rem" }}>
                    <strong>{t("Review note")}:</strong> {item.reviewNote}
                  </div>
                )}

                {item.skillsDemonstrated?.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mt-2 mb-2">
                    {item.skillsDemonstrated.map((s) => (
                      <span key={s._id} className="badge bg-secondary-subtle text-secondary small">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                {item.link && (
                  <div className="pt-2 border-top mt-2">
                    <a href={item.link} target="_blank" rel="noreferrer" className="ss-card-modern__link">
                      {t("View External Verification Document ↗")}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Passport Verification Summary */}
        <div className="col-lg-4">
          <div className="ss-card-modern mb-3">
            <div className="ss-card-modern__head">
              <h2 className="ss-card-modern__title">{t("Verification Status")}</h2>
            </div>
            <div className="ss-passport-shield mb-3 w-100">
              <div className="ss-passport-shield__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              </div>
              <div className="fw-bold h5 mb-0">{verificationPercent}% {t("Verified")}</div>
              <div className="small text-secondary">{t("Institutional Trust Score")}</div>
            </div>

            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between p-2 rounded bg-light">
                <span className="text-secondary">{t("Verified Evidence")}</span>
                <span className="fw-bold text-success font-monospace">{verifiedItems.length}</span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded bg-light">
                <span className="text-secondary">{t("Pending Institution Review")}</span>
                <span className="fw-bold text-warning font-monospace">
                  {items ? items.filter((i) => i.verificationStatus === "pending").length : 0}
                </span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded bg-light">
                <span className="text-secondary">{t("Total Submissions")}</span>
                <span className="fw-bold font-monospace">{items ? items.length : 0}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPassportModal(true)}
              className="btn btn-primary btn-sm w-100 mt-3 rounded-pill fw-semibold shadow-sm"
            >
              {t("Open Digital Passport Modal")}
            </button>
          </div>

          <div className="ss-card-modern bg-light border">
            <h3 className="h6 fw-bold mb-2">{t("Institutional Authenticity")}</h3>
            <p className="small text-secondary mb-0">
              {t("All portfolio items are validated against institutional guidelines and registrar records to prevent credential fabrication.")}
            </p>
          </div>
        </div>
      </div>

      {/* Digital Skill Passport Modal */}
      {showPassportModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 1050 }}
          onClick={() => setShowPassportModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              {/* Passport Header Banner */}
              <div
                className="p-4 text-white position-relative"
                style={{ background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning text-dark font-monospace text-uppercase">
                      {t("OFFICIAL SKILL PASSPORT")}
                    </span>
                    <span className="small text-white-50">{t("SkillSetu × Ministry of Ayush / AIIA")}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowPassportModal(false)}
                  />
                </div>
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                  <div>
                    <h2 className="h4 fw-bold mb-1">{user?.name || t("Student Passport")}</h2>
                    <p className="small text-white-50 mb-0">
                      {user?.branch || t("Department")} · {t("Batch")} {user?.graduationYear || 2027}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-success-subtle text-success px-3 py-2 font-monospace">
                      🛡️ {verificationPercent}% {t("VERIFIED TRUST SEAL")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Passport Body */}
              <div className="p-4">
                <div className="row g-4">
                  {/* Verified Credentials */}
                  <div className="col-md-7">
                    <h3 className="h6 fw-bold mb-3">{t("Authenticated Credentials & Evidence")}</h3>
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: "320px", overflowY: "auto" }}>
                      {verifiedItems.length === 0 ? (
                        <p className="small text-secondary">{t("No verified items yet.")}</p>
                      ) : (
                        verifiedItems.map((v) => (
                          <div key={v._id} className="p-2 px-3 rounded bg-light border">
                            <div className="d-flex justify-content-between align-items-start">
                              <span className="fw-bold small">{v.title}</span>
                              <span className="badge bg-success-subtle text-success small">{t("Verified")}</span>
                            </div>
                            <div className="small text-secondary">
                              {TYPE_LABEL[v.type]} · {v.issuer || t("Verified Entity")}
                              {v.credentialId && <span className="font-monospace"> · {v.credentialId}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Trust Seal & Passport Metadata */}
                  <div className="col-md-5 border-start">
                    <h3 className="h6 fw-bold mb-3">{t("Institutional Validation")}</h3>
                    <div className="p-3 bg-light rounded-3 mb-3 small">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">{t("Total Records:")}</span>
                        <span className="fw-bold font-monospace">{items?.length || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">{t("Verified by Admin:")}</span>
                        <span className="fw-bold font-monospace text-success">{verifiedItems.length}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">{t("Security Status:")}</span>
                        <span className="fw-bold text-success">{t("Cryptographically Hashed")}</span>
                      </div>
                    </div>

                    <p className="small text-secondary" style={{ fontSize: "0.75rem" }}>
                      {t("This digital passport serves as verifiable evidence of skills and competencies for campus placement drives and industry internships.")}
                    </p>

                    <button
                      onClick={() => window.print()}
                      className="btn btn-outline-primary btn-sm w-100"
                    >
                      🖨️ {t("Print / Save as PDF")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPassportModal(false)}
                >
                  {t("Close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
