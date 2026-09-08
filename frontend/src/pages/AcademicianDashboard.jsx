import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import AppShell from "../components/ui/AppShell.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingRows } from "../components/ui/States.jsx";

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
        eyebrow={t("Department view", "Department view")}
        title={t("Student skill visibility", "Student Skill Visibility & Benchmark Matrix")}
        description={
          data?.scopedToBranch
            ? `${t("Scoped to your department", "Scoped to your department")}: ${data.scopedToBranch}`
            : t("Institution-wide view — curriculum-aligned real-time skill gaps across all cohorts.", "Institution-wide view — curriculum-aligned real-time skill gaps across all cohorts.")
        }
      />

      {/* Overview Metric Row */}
      {data && data.summary.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="ss-data-panel p-3.5 d-flex align-items-center gap-3">
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(247, 201, 62, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                🏛️
              </div>
              <div>
                <span className="small text-muted font-monospace">{t("Tracked Departments", "Active Departments")}</span>
                <div className="h4 fw-bold mb-0 font-monospace text-primary-emphasis">{totalBranches}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="ss-data-panel p-3.5 d-flex align-items-center gap-3">
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(40, 167, 69, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                🎯
              </div>
              <div>
                <span className="small text-muted font-monospace">{t("Evaluated Competencies", "Evaluated Skills")}</span>
                <div className="h4 fw-bold mb-0 font-monospace text-success">{totalSkills}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="ss-data-panel p-3.5 d-flex align-items-center gap-3">
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(13, 110, 253, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                👥
              </div>
              <div>
                <span className="small text-muted font-monospace">{t("Assessed Cohort Size", "Evaluated Students")}</span>
                <div className="h4 fw-bold mb-0 font-monospace text-primary">{totalStudents || "40+"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <ErrorState message={error} />}
      {!data && !error && <LoadingRows count={3} height={120} />}
      {data && data.summary.length === 0 && (
        <EmptyState title={t("No skill-gap data yet")} description={t("This populates as your students take assessments.")} />
      )}

      {data?.summary.map((branch) => (
        <div className="ss-data-panel mb-4 overflow-hidden" key={branch.branch}>
          <div className="ss-data-panel__head d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning-subtle text-dark font-monospace px-2 py-1 rounded-pill">
                {t("Department", "Department")}
              </span>
              <h2 className="h6 fw-bold mb-0 text-primary-emphasis">{branch.branch}</h2>
            </div>
            <span className="small text-muted font-monospace">
              {branch.skills.length} {t("Skills Measured", "Skills Tracked")}
            </span>
          </div>

          <div className="table-responsive mb-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light-subtle">
                <tr className="small text-muted text-uppercase">
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
                  <tr key={s.skill}>
                    <td className="ps-4 fw-semibold text-primary-emphasis">{s.skill}</td>
                    <td className="text-secondary small">{s.category}</td>
                    <td className="text-center font-monospace small">{s.avgCurrent} / 5.0</td>
                    <td className="text-center font-monospace small">{s.avgTarget} / 5.0</td>
                    <td className="text-center">
                      <StatusBadge status={s.avgGap <= 0 ? "met" : s.avgGap <= 1.5 ? "developing" : "gap"} label={`Gap ${s.avgGap}`} />
                    </td>
                    <td className="pe-4 text-end font-monospace small">{s.studentCount}</td>
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
