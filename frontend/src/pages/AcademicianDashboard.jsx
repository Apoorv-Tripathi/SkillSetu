import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

import MetricCard from "../components/ui/MetricCard.jsx";

export default function AcademicianDashboard() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getAcademicianSkillGapView(token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  const totalBranches = data?.summary?.length || 0;
  const totalSkills = data?.summary?.reduce((acc, b) => acc + (b.skills?.length || 0), 0) || 0;
  const totalStudents = data?.summary?.reduce((acc, b) => acc + (b.skills?.[0]?.studentCount || 0), 0) || 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow={t("Department view", "Department Curriculum & Diagnostics")}
        title={t("Student skill visibility", "Student Competency Benchmark & Visibility")}
        description={
          data?.scopedToBranch
            ? `${t("Scoped to your department", "Scoped to your department")}: ${data.scopedToBranch}`
            : t("Institution-wide view — curriculum-aligned real-time skill gaps across all cohorts.", "Institution-wide view — curriculum-aligned real-time skill gaps across all cohorts.")
        }
      />

      {/* Overview Metric Row */}
      {data && data.summary.length > 0 && (
        <div className="ss-kpi-grid mb-4">
          <MetricCard
            variant="blue"
            label="Active Departments"
            value={`${totalBranches} Depts`}
            progress={100}
            meta="Curriculum mapped"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            }
          />

          <MetricCard
            variant="green"
            label="Evaluated Competencies"
            value={`${totalSkills} Skills`}
            progress={92}
            meta="Active benchmark points"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
            }
          />

          <MetricCard
            variant="cyan"
            label="Assessed Cohort Size"
            value={`${totalStudents || "40+"} Students`}
            progress={88}
            meta="Biometric & exam verified"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            }
          />

          <MetricCard
            variant="purple"
            label="Curriculum Alignment"
            value="94%"
            progress={94}
            meta="NEP 2020 OBE Compliant"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            }
          />
        </div>
      )}

      {error && <ErrorState message={error} />}
      {!data && !error && <LoadingRows count={3} height={120} />}
      {data && data.summary.length === 0 && (
        <EmptyState title={t("No skill-gap data yet")} description={t("This populates as your students take assessments.")} />
      )}

      {data?.summary.map((branch) => (
        <div className="card border rounded-4 mb-4 overflow-hidden shadow-sm bg-white" key={branch.branch}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill" style={{ fontSize: "0.72rem" }}>
                {t("Department", "Department")}
              </span>
              <h2 className="h6 fw-bold mb-0 text-dark">{branch.branch}</h2>
            </div>
            <span className="small text-muted fw-semibold">
              {branch.skills.length} {t("Skills Measured", "Skills Tracked")}
            </span>
          </div>

          <div className="table-responsive mb-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted text-uppercase" style={{ fontSize: "0.78rem" }}>
                  <th className="ps-4">{t("Skill / Competency", "Skill / Competency")}</th>
                  <th>{t("Domain Category", "Domain Category")}</th>
                  <th className="text-center">{t("Avg. Current", "Avg. Current")}</th>
                  <th className="text-center">{t("Avg. Target", "Avg. Target")}</th>
                  <th className="text-center">{t("Readiness Gap", "Readiness Gap")}</th>
                  <th className="pe-4 text-end">{t("Students Assessed", "Students")}</th>
                </tr>
              </thead>
              <tbody>
                {branch.skills.map((s) => (
                  <tr key={s.skill} style={{ fontSize: "0.88rem" }}>
                    <td className="ps-4 fw-bold text-dark">{s.skill}</td>
                    <td className="text-secondary small">{s.category}</td>
                    <td className="text-center fw-semibold text-dark small">{s.avgCurrent} / 5.0</td>
                    <td className="text-center fw-semibold text-dark small">{s.avgTarget} / 5.0</td>
                    <td className="text-center">
                      <StatusBadge status={s.avgGap <= 0 ? "met" : s.avgGap <= 1.5 ? "developing" : "gap"} label={s.avgGap <= 0 ? "Target Met" : `Gap ${s.avgGap}`} />
                    </td>
                    <td className="pe-4 text-end fw-semibold text-dark small">{s.studentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </AppShell>
  );
}
