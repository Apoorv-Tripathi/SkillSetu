export const ROLES = Object.freeze({
  STUDENT: "student",
  ACADEMICIAN: "academician",
  INDUSTRY: "industry",
  INSTITUTION_ADMIN: "institution_admin",
  MENTOR: "mentor",
  RECRUITER: "recruiter",
  PLATFORM_ADMIN: "platform_admin",
});

// Phase 1 only supports registration for these three
export const PHASE1_REGISTERABLE_ROLES = [
  ROLES.STUDENT,
  ROLES.INDUSTRY,
  ROLES.INSTITUTION_ADMIN,
];

// Phase 2 adds Mentor — mentors submit live milestone evaluations that feed
// the skill-gap engine, so they need real accounts.
export const PHASE2_REGISTERABLE_ROLES = [
  ...PHASE1_REGISTERABLE_ROLES,
  ROLES.MENTOR,
];

// Phase 3 adds Academician (collaboration marketplace, institution visibility)
// and Recruiter (shortlisting + structured feedback on an industry account's
// postings). Platform Admin is deliberately excluded — it's a superuser role
// created only via the seed script / another admin, never self-registered.
export const PHASE3_REGISTERABLE_ROLES = [
  ...PHASE2_REGISTERABLE_ROLES,
  ROLES.ACADEMICIAN,
  ROLES.RECRUITER,
  ROLES.PLATFORM_ADMIN,
];

// Recruiters manage postings/applicants exactly like an Industry account —
// they're the same permission tier, just a different job title on the same
// hiring side of the platform.
export const HIRING_ROLES = [ROLES.INDUSTRY, ROLES.RECRUITER];
