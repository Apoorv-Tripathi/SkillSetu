const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

function qs(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries).toString();
}

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.error) ? data.error.join(", ") : data.error || "Request failed";
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),

  listAssessments: (token) => request("/assessments", { token }),
  getAssessment: (id, token) => request(`/assessments/${id}`, { token }),
  submitAssessment: (id, payload, token) =>
    request(`/assessments/${id}/submit`, { method: "POST", body: payload, token }),

  getSkillProfile: (token) => request("/students/me/skill-profile", { token }),
  getSkillGap: (token) => request("/students/me/skill-gap", { token }),
  getCareerRoadmap: (token) => request("/students/me/career-roadmap", { token }),
  updateCareerInterests: (payload, token) =>
    request("/students/me/career-interests", { method: "PATCH", body: payload, token }),

  listSkills: (token) => request("/skills", { token }),

  createOpportunity: (payload, token) => request("/opportunities", { method: "POST", body: payload, token }),
  getMyOpportunities: (token) => request("/opportunities/mine", { token }),
  listOpportunities: (token, params) => request(`/opportunities${qs(params)}`, { token }),
  getOpportunity: (id, token) => request(`/opportunities/${id}`, { token }),

  // Applications
  applyToOpportunity: (opportunityId, token) =>
    request(`/applications/${opportunityId}/apply`, { method: "POST", token }),
  getMyApplications: (token) => request("/applications/mine", { token }),
  getApplicationsForOpportunity: (opportunityId, token) =>
    request(`/applications/opportunity/${opportunityId}`, { token }),
  updateApplicationStatus: (id, payload, token) =>
    request(`/applications/${id}/status`, { method: "PATCH", body: payload, token }),
  toggleApplicationStar: (id, token) => request(`/applications/${id}/star`, { method: "PATCH", token }),
  addApplicationFeedback: (id, payload, token) =>
    request(`/applications/${id}/feedback`, { method: "POST", body: payload, token }),

  // Milestones
  createMilestone: (payload, token) => request("/milestones", { method: "POST", body: payload, token }),
  getMyMentorAssignments: (token) => request("/milestones/mine", { token }),
  getMilestonesForApplication: (applicationId, token) =>
    request(`/milestones/application/${applicationId}`, { token }),
  submitMilestoneEvaluation: (id, payload, token) =>
    request(`/milestones/${id}/evaluate`, { method: "POST", body: payload, token }),

  // Portfolio
  createPortfolioItem: (payload, token) => request("/portfolio", { method: "POST", body: payload, token }),
  getMyPortfolio: (token) => request("/portfolio/mine", { token }),
  getStudentPortfolio: (studentId, token) => request(`/portfolio/student/${studentId}`, { token }),
  getVerificationQueue: (token) => request("/portfolio/verification-queue", { token }),
  reviewPortfolioItem: (id, payload, token) =>
    request(`/portfolio/${id}/review`, { method: "PATCH", body: payload, token }),

  // Mentorship
  listMentors: (token) => request("/mentorship/mentors", { token }),
  createMentorshipRequest: (payload, token) =>
    request("/mentorship/requests", { method: "POST", body: payload, token }),
  getMyMentorshipRequests: (token) => request("/mentorship/requests/mine", { token }),
  getIncomingMentorshipRequests: (token) => request("/mentorship/requests/incoming", { token }),
  respondToMentorshipRequest: (id, payload, token) =>
    request(`/mentorship/requests/${id}/respond`, { method: "PATCH", body: payload, token }),

  // Institution — advanced dashboard
  getInstitutionSkillGapSummary: (token, params) =>
    request(`/institutions/skill-gap-summary${qs(params)}`, { token }),
  getInstitutionFilterOptions: (token) => request("/institutions/filter-options", { token }),
  getBranchRoster: (branch, token, params) =>
    request(`/institutions/branches/${encodeURIComponent(branch)}/roster${qs(params)}`, { token }),
  getCohortComparison: (token) => request("/institutions/cohort-comparison", { token }),
  getPlacementReadiness: (token, params) => request(`/analytics/placement-readiness${qs(params)}`, { token }),
  getSkillDemandTrends: (token) => request("/analytics/skill-demand-trends", { token }),
  getInternshipOutcomes: (token) => request("/analytics/internship-outcomes", { token }),

  // Academician
  getAcademicianSkillGapView: (token) => request("/academician/skill-gap-view", { token }),

  // Collaboration marketplace
  listCollaborationActivities: (token, params) => request(`/collaboration${qs(params)}`, { token }),
  getMyCollaborationActivities: (token) => request("/collaboration/mine", { token }),
  createCollaborationActivity: (payload, token) =>
    request("/collaboration", { method: "POST", body: payload, token }),
  applyToActivity: (id, payload, token) =>
    request(`/collaboration/${id}/apply`, { method: "POST", body: payload, token }),
  respondToActivityApplicant: (activityId, applicantId, payload, token) =>
    request(`/collaboration/${activityId}/applicants/${applicantId}`, { method: "PATCH", body: payload, token }),
  closeActivity: (id, token) => request(`/collaboration/${id}/close`, { method: "PATCH", token }),

  // Notifications
  getMyNotifications: (token) => request("/notifications", { token }),
  markNotificationRead: (id, token) => request(`/notifications/${id}/read`, { method: "PATCH", token }),
  markAllNotificationsRead: (token) => request("/notifications/read-all", { method: "PATCH", token }),

  // Platform admin
  getPlatformStats: (token) => request("/admin/stats", { token }),
  listAdminUsers: (token, params) => request(`/admin/users${qs(params)}`, { token }),
  listAdminInstitutions: (token) => request("/admin/institutions", { token }),
  createAdminInstitution: (payload, token) => request("/admin/institutions", { method: "POST", body: payload, token }),
  updateAdminInstitution: (id, payload, token) =>
    request(`/admin/institutions/${id}`, { method: "PATCH", body: payload, token }),
  getAdminInstitutionSkillGap: (id, token, params) =>
    request(`/admin/institutions/${id}/skill-gap${qs(params)}`, { token }),
  listAdminSkills: (token) => request("/admin/skills", { token }),
  createAdminSkill: (payload, token) => request("/admin/skills", { method: "POST", body: payload, token }),
  updateAdminSkill: (id, payload, token) => request(`/admin/skills/${id}`, { method: "PATCH", body: payload, token }),
  deleteAdminSkill: (id, token) => request(`/admin/skills/${id}`, { method: "DELETE", token }),
  listAdminAssessments: (token) => request("/admin/assessments", { token }),
  createAdminAssessment: (payload, token) => request("/admin/assessments", { method: "POST", body: payload, token }),
  updateAdminAssessment: (id, payload, token) =>
    request(`/admin/assessments/${id}`, { method: "PATCH", body: payload, token }),
};
