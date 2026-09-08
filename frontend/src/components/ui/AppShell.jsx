import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTranslation } from "../../context/LanguageContext.jsx";
import NotificationBell from "./NotificationBell.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import LanguageSelector from "./LanguageSelector.jsx";

// ── Compact SVG Icons ──────────────────────────────────────
function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function IconAssessment() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="6" x2="9" y2="6.01" />
      <line x1="15" y1="6" x2="15" y2="6.01" />
      <line x1="9" y1="10" x2="9" y2="10.01" />
      <line x1="15" y1="10" x2="15" y2="10.01" />
      <line x1="9" y1="14" x2="9" y2="14.01" />
      <line x1="15" y1="14" x2="15" y2="14.01" />
      <line x1="9" y1="18" x2="9" y2="18.01" />
      <line x1="15" y1="18" x2="15" y2="18.01" />
    </svg>
  );
}
function IconCheckSquare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconAward() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}
// ── Sidebar Navigation sections by role ────────────────────────
const NAV_SECTIONS_BY_ROLE = {
  student: [
    {
      title: "SKILL INTELLIGENCE",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
        { to: "/skill-profile", label: "Skill Profile", icon: <IconUser /> },
        { to: "/skill-gap", label: "Skill Gap Intelligence", icon: <IconTarget /> },
        { to: "/career-roadmap", label: "Career Guidance & Roadmap", icon: <IconMap /> },
        { to: "/assessments", label: "Assessments", icon: <IconAssessment /> },
      ],
    },
    {
      title: "OPPORTUNITIES",
      links: [
        { to: "/learning", label: "Learning Marketplace", icon: <IconBook /> },
        { to: "/opportunities/browse", label: "Internship & Job Portal", icon: <IconBriefcase /> },
        { to: "/applications", label: "Applications & Milestones", icon: <IconSend /> },
      ],
    },
    {
      title: "CAREER & GROWTH",
      links: [
        { to: "/portfolio", label: "Digital Portfolio", icon: <IconFolder /> },
        { to: "/mentors", label: "Mentorship", icon: <IconUsers /> },
      ],
    },
  ],
  industry: [
    {
      title: "OPPORTUNITIES",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
        { to: "/opportunities", label: "Job & Internship Postings", icon: <IconBriefcase /> },
        { to: "/opportunities/new", label: "Post Opportunity", icon: <IconSend /> },
      ],
    },
    {
      title: "COLLABORATION",
      links: [
        { to: "/collaboration", label: "Collaboration Marketplace", icon: <IconUsers /> },
      ],
    },
  ],
  recruiter: [
    {
      title: "RECRUITING",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
        { to: "/opportunities", label: "Manage Postings", icon: <IconBriefcase /> },
        { to: "/opportunities/new", label: "Post Opportunity", icon: <IconSend /> },
        { to: "/collaboration", label: "Collaboration Board", icon: <IconUsers /> },
      ],
    },
  ],
  mentor: [
    {
      title: "MENTORSHIP",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
        { to: "/mentor/dashboard", label: "Milestone Evaluations", icon: <IconCheckSquare /> },
        { to: "/mentor/requests", label: "Student Requests", icon: <IconUsers /> },
      ],
    },
  ],
  academician: [
    {
      title: "ACADEMIC INTELLIGENCE",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
        { to: "/academician/skill-gap", label: "Department Skill-Gap", icon: <IconTarget /> },
        { to: "/collaboration", label: "Faculty Internships & Collab", icon: <IconUsers /> },
      ],
    },
  ],
  institution_admin: [
    {
      title: "INSTITUTION MANAGEMENT",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
        { to: "/institution/dashboard", label: "Skill-Gap Analytics", icon: <IconTarget /> },
        { to: "/institution/verification-queue", label: "Portfolio Verification", icon: <IconCheckSquare /> },
      ],
    },
  ],
  platform_admin: [
    {
      title: "PLATFORM OVERSIGHT",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
        { to: "/admin/institutions", label: "Institutions", icon: <IconBuilding /> },
        { to: "/admin/skills", label: "Skills Catalog", icon: <IconAward /> },
        { to: "/admin/assessments", label: "Assessments", icon: <IconAssessment /> },
        { to: "/institution/verification-queue", label: "Global Verification", icon: <IconCheckSquare /> },
      ],
    },
  ],
};

const LABEL_KEY_MAP = {
  "SKILL INTELLIGENCE": "sec_skill_intelligence",
  "OPPORTUNITIES": "sec_opportunities",
  "CAREER & GROWTH": "sec_career_growth",
  "COLLABORATION": "sec_collaboration",
  "ACADEMIC INTELLIGENCE": "sec_academic_intelligence",
  "INSTITUTION MANAGEMENT": "sec_institution_mgmt",
  "RECRUITING": "sec_opportunities",
  "MENTORSHIP": "nav_mentorship",
  "PLATFORM OVERSIGHT": "sec_institution_mgmt",
  "Dashboard": "nav_dashboard",
  "Skill Profile": "nav_skill_profile",
  "Skill Gap Intelligence": "nav_skill_gap",
  "Skill Gap": "nav_skill_gap",
  "Career Guidance & Roadmap": "nav_career_roadmap",
  "Roadmap": "nav_career_roadmap",
  "Assessments": "nav_assessments",
  "Learning Marketplace": "nav_learning",
  "Learning Hub": "nav_learning",
  "Internship & Job Portal": "nav_internships",
  "Jobs": "nav_internships",
  "Applications & Milestones": "nav_applications",
  "Applications": "nav_applications",
  "Digital Portfolio": "nav_portfolio",
  "Portfolio": "nav_portfolio",
  "Mentorship": "nav_mentorship",
  "Job & Internship Postings": "nav_postings",
  "Postings": "nav_postings",
  "Manage Postings": "nav_postings",
  "Post Opportunity": "nav_post_opportunity",
  "Post New": "nav_post_opportunity",
  "Collaboration Marketplace": "nav_collab_market",
  "Collaboration Board": "nav_collab_market",
  "Collaboration": "nav_collab_market",
  "Department Skill-Gap": "nav_dept_skill_gap",
  "Dept Skill-Gap": "nav_dept_skill_gap",
  "Faculty Internships & Collab": "nav_faculty_collab",
  "Institutions": "nav_institutions",
  "Skills Catalog": "nav_skills_mgmt",
  "Skills": "nav_skills_mgmt",
  "Skill-Gap Analytics": "nav_skill_gap",
  "Skill Analytics": "nav_skill_gap",
  "Portfolio Verification": "nav_portfolio",
  "Verification": "nav_portfolio",
  "Evaluations": "nav_assessments",
  "Requests": "nav_applications",
  "Global Verification": "nav_portfolio",
};

const ROLE_LABELS = {
  student: "Student",
  industry: "Industry Partner",
  institution_admin: "Institution Admin",
  mentor: "Industry Mentor",
  academician: "Academician",
  recruiter: "Recruiter",
  platform_admin: "Platform Admin",
};

// ── Main Shell Component ───────────────────────────────────
export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarSections = NAV_SECTIONS_BY_ROLE[user?.role] || [];

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const userSubtext =
    user?.role === "student"
      ? `${user?.branch || "B.Tech CSE"}, Year ${user?.graduationYear || "3"}`
      : user?.companyName || user?.department || ROLE_LABELS[user?.role] || "";

  return (
    <div className="ss-app-layout">
      {/* Mobile Sidebar Backdrop */}
      <div
        className={`ss-sidebar__backdrop ${sidebarOpen ? "is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Left Sidebar (Permanent on Desktop, Slide-in Drawer on Mobile) */}
      <aside className={`ss-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="ss-sidebar__header">
          <Link to="/dashboard" className="ss-brand-pill" style={{ textDecoration: "none" }}>
            <span className="ss-brand-pill__dot" />
            <span>{t("brand_title", "SkillSetu")}</span>
          </Link>
          <div className="small text-muted mt-1 ps-2" style={{ fontSize: "0.68rem" }}>
            {t("brand_subtitle", "Academia–Industry Intelligence")}
          </div>
        </div>

        <div className="ss-sidebar__nav">
          {sidebarSections.map((sec, idx) => (
            <div key={idx} className="ss-sidebar__section">
              <span className="ss-sidebar__section-title">
                {t(LABEL_KEY_MAP[sec.title] || sec.title)}
              </span>
              {sec.links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`ss-nav-item ${isActive ? "is-active" : ""}`}
                  >
                    <div className="ss-nav-item__left">
                      <span className="ss-nav-item__icon">{link.icon}</span>
                      <span>{t(LABEL_KEY_MAP[link.label] || link.label)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="ss-sidebar__footer">
          <Link to="/portfolio" className="ss-passport-card">
            <div className="ss-passport-card__bg">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M10,90 L50,20 L90,90 Z" />
              </svg>
            </div>
            <div className="ss-passport-card__badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="ss-passport-card__title">{t("digital_passport", "Digital Skill Passport")}</div>
            <div className="ss-passport-card__link">
              <span>{t("open_skill_passport", "Open Verified Passport")}</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Wrapper: Top Navigation + Content Area */}
      <div className="ss-main-wrapper">
        {/* Top Navigation Bar */}
        <nav className="ss-topnav">
          {/* Left: Mobile hamburger + Role Context Badge */}
          <div className="d-flex align-items-center gap-3">
            <button
              className="ss-icon-btn d-lg-none"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle Menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="d-flex align-items-center gap-2">
              <span className="ss-role-chip">
                <span className="ss-brand-pill__dot me-1" />
                {ROLE_LABELS[user?.role] || "Portal"} Workspace
              </span>
            </div>
          </div>

          {/* Right: Search, Language, Theme, Notifications, Profile */}
          <div className="ss-topnav__actions">
            <div className="d-none d-md-flex">
              <div className="ss-search-box">
                <span className="ss-search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="ss-search-input"
                  placeholder={t("search_placeholder", "Search skills, opportunities...")}
                />
                <span className="ss-search-key">⌘K</span>
              </div>
            </div>

            <LanguageSelector />
            <ThemeToggle />
            <NotificationBell />

            <div className="ss-user-profile">
              <div className="d-flex align-items-center gap-2">
                <div className="ss-avatar">{userInitials}</div>
                <div className="ss-user-meta d-none d-sm-flex flex-column text-start">
                  <span className="ss-user-name">{user?.name}</span>
                  <span className="ss-user-sub">{userSubtext}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline-secondary btn-sm ms-2"
                style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", borderRadius: "8px" }}
                title={t("logout")}
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </nav>

        {/* Content Body */}
        <main className="ss-content-area">{children}</main>
      </div>
    </div>
  );
}
