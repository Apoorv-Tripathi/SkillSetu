import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTranslation } from "../../context/LanguageContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

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
function IconShieldCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function IconSparkles() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
function IconHelpCircle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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
      title: "CAREER & CREDENTIALS",
      links: [
        { to: "/portfolio", label: "Digital Skill Passport", icon: <IconShieldCheck />, badge: "Verified" },
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

const ROLE_LABELS = {
  student: "Student",
  industry: "Industry Partner",
  institution_admin: "Institution Admin",
  mentor: "Industry Mentor",
  academician: "Academician",
  recruiter: "Recruiter",
  platform_admin: "Platform Admin",
};

const ROLE_QUICK_PROMPTS = {
  student: [
    "What are my highest priority skill gaps for Full Stack Developer?",
    "Recommend top 3 courses for Semester 5",
    "How do I export my verified Skill Passport?",
  ],
  academician: [
    "Show curriculum alignment for Cloud Computing",
    "Which students are in the developing mastery band?",
    "Explore faculty-industry research opportunities",
  ],
  institution_admin: [
    "Generate NIRF & NAAC placement readiness summary",
    "List students flagged at-risk across departments",
    "Review unverified portfolio queue",
  ],
  industry: [
    "Find candidates matching React & Distributed Systems",
    "Review applicant milestone completion rates",
    "Post a new sponsored internship",
  ],
  recruiter: [
    "Shortlist top 5 candidates for Backend Engineer",
    "Filter candidates with >8.5 CGPA and Verified Passport",
    "View applicant assessment scores",
  ],
  mentor: [
    "Review pending milestone evaluations",
    "Prepare industry feedback for mentee sprint",
    "Check mentee skill advancement progress",
  ],
  platform_admin: [
    "Inspect cross-institution verification health",
    "List newly added skills and standard taxonomy",
    "Check platform uptime and active sessions",
  ],
};

function getCopilotResponse(q, role, name) {
  const query = q.toLowerCase();
  if (query.includes("skill gap") || query.includes("priority")) {
    return "Based on your recent assessments in Computer Science, your priority remediation areas are Cloud Architecture (Distributed Systems) and Advanced Microservices. Reaching Level 4 in these competencies will increase your hiring match score by +24%.";
  }
  if (query.includes("course") || query.includes("recommend") || query.includes("semester")) {
    return "Recommended 3 high-impact modules for Semester 5: 1) AWS Solution Architecture Deep Dive (Vertex Labs), 2) Kubernetes Microservices Mastery (Cloud Native Org), 3) Data Engineering Pipelines with Spark.";
  }
  if (query.includes("passport") || query.includes("export") || query.includes("verif")) {
    return "Your Digital Skill Passport is cryptographically signed and APAAR-verified. You can export the shareable PDF credential or embed the live verifiable badge directly from your Career & Credentials tab.";
  }
  if (query.includes("placement") || query.includes("naac") || query.includes("nirf") || query.includes("readiness")) {
    return "Current Institutional Placement Readiness stands at 82.4% across 1,420 enrolled engineering students. 411 students are categorized in the developing mastery band. NAAC Grade: A++, NEP 2020 Compliant.";
  }
  if (query.includes("candidate") || query.includes("shortlist") || query.includes("hire") || query.includes("filter")) {
    return "Found 14 candidates exceeding the 8.5 CGPA threshold with verified credentials in React & Node.js distributed systems. 3 have already passed technical benchmark assessments.";
  }
  if (query.includes("milestone") || query.includes("feedback") || query.includes("mentee")) {
    return "You have 3 active student milestone evaluations awaiting verification. Real-time feedback feeds directly into their verified Skill Passport ledger.";
  }
  return `SkillSetu Copilot has analyzed your query: "${q}". All telemetry data and curriculum competencies are synchronized with your verified workspace.`;
}

// ── Main Shell Component ───────────────────────────────────
export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotMessages, setCopilotMessages] = useState([]);
  const searchInputRef = useRef(null);

  const sidebarSections = NAV_SECTIONS_BY_ROLE[user?.role] || [];

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Global Keyboard Shortcuts (⌘K = search, ⌘J = copilot, Esc = close)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setCopilotOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setCopilotOpen(false);
        setShortcutsOpen(false);
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleCopilotSubmit(e, customPrompt) {
    if (e) e.preventDefault();
    const q = customPrompt || copilotQuery;
    if (!q.trim()) return;
    const userMsg = { role: "user", text: q };
    const botMsg = {
      role: "assistant",
      text: getCopilotResponse(q, user?.role, user?.name),
    };
    setCopilotMessages((prev) => [...prev, userMsg, botMsg]);
    setCopilotQuery("");
  }

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
          <Link to="/dashboard" className="ss-brand-anchor">
            <div className="ss-brand-icon ss-brand-icon--sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="ss-brand-text">
              <span className="ss-brand-title">{t("brand_title", "SkillSetu")}</span>
              <span className="ss-brand-subtitle">{t("brand_subtitle", "Skill Intelligence Platform")}</span>
            </div>
          </Link>
          <button
            type="button"
            className="ss-sidebar__close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ss-sidebar__nav">
          {sidebarSections.map((sec, idx) => (
            <div key={idx} className="ss-sidebar__section">
              <span className="ss-sidebar__section-title">
                {t(sec.title)}
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
                      <span className="ss-nav-item__label">{t(link.label)}</span>
                    </div>
                    {link.badge && (
                      <span className="ss-nav-item__badge">{link.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Unified Minimalist Utility Footer */}
        <div className="ss-sidebar__footer">
          <button
            type="button"
            className="ss-sidebar__copilot-trigger"
            onClick={() => setCopilotOpen(true)}
            title="Open SkillSetu AI Assistant (⌘J)"
          >
            <div className="ss-sidebar__copilot-left">
              <span className="ss-sidebar__copilot-icon">
                <IconSparkles />
              </span>
              <span className="ss-sidebar__copilot-label">{t("ask_ai_assistant", "AI Copilot")}</span>
            </div>
            <kbd className="ss-sidebar__kbd">⌘J</kbd>
          </button>

          <div className="ss-sidebar__utility-row">
            <button
              type="button"
              className="ss-sidebar__util-link"
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts & platform help"
            >
              <IconHelpCircle />
              <span>Shortcuts</span>
            </button>
            <span className="ss-sidebar__util-version">v2.4</span>
          </div>
        </div>
      </aside>

      {/* Main Wrapper: Top Navigation + Content Area */}
      <div className="ss-main-wrapper">
        {/* Top Navigation Bar */}
        <nav className="ss-topnav">
          {/* Left: Mobile hamburger & Mobile Brand only, or on Desktop: Context Breadcrumb */}
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

            {/* Mobile-only brand badge (when sidebar drawer is closed) */}
            <Link to="/dashboard" className="d-flex d-lg-none align-items-center gap-2 text-decoration-none">
              <div className="ss-brand-icon ss-brand-icon--sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="fw-bold fs-6" style={{ color: "#4f46e5" }}>
                SkillSetu
              </span>
            </Link>

            {/* Desktop Left: Workspace Context (Eliminates duplication with sidebar) */}
            <div className="d-none d-lg-flex align-items-center gap-2">
              <div className="ss-topnav__context">
                <span className="ss-topnav__context-dot" />
                <span className="ss-topnav__context-label">
                  {location.pathname === "/dashboard"
                    ? "Dashboard Overview"
                    : location.pathname.replace(/^\//, "").split("/")[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Search, Notifications, Profile Group (User + Role Badge + Logout) */}
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
                  ref={searchInputRef}
                  type="text"
                  className="ss-search-input"
                  placeholder={t("search_placeholder", "Search skills, opportunities, analytics... (⌘K)")}
                />
                <span className="ss-search-key">⌘K</span>
              </div>
            </div>

            <NotificationBell />

            <div className="ss-topnav__divider d-none d-sm-block" />

            <div className="ss-user-profile d-flex align-items-center gap-2">
              <div className="ss-user-avatar">
                {userInitials}
              </div>

              <div className="ss-user-meta d-none d-sm-flex flex-column text-start">
                <div className="d-flex align-items-center gap-2">
                  <span className="ss-user-name">{user?.name}</span>
                  {/* Role Badge Aligned Beside User Identity */}
                  <span className={`ss-role-badge ss-role-badge--${user?.role || "student"}`}>
                    {ROLE_LABELS[user?.role] || "Member"}
                  </span>
                </div>
                <span className="ss-user-sub">{userSubtext}</span>
              </div>

              {/* Mobile-only role pill when user text is hidden */}
              <span className={`ss-role-badge ss-role-badge--${user?.role || "student"} d-sm-none`}>
                {ROLE_LABELS[user?.role] || "Member"}
              </span>

              {/* Red-bordered outline logout button */}
              <button
                onClick={logout}
                className="ss-logout-btn ms-2"
                title={t("logout", "Sign Out")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span className="d-none d-sm-inline">{t("logout", "Sign Out")}</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Content Body */}
        <main className="ss-content-area">{children}</main>
      </div>

      {/* AI Copilot Slide-Over Drawer */}
      {copilotOpen && (
        <>
          <div
            className="ss-copilot-backdrop"
            onClick={() => setCopilotOpen(false)}
          />
          <aside className="ss-copilot-drawer">
            <div className="ss-copilot-drawer__header">
              <div className="d-flex align-items-center gap-2">
                <div className="ss-brand-icon ss-brand-icon--sm">
                  <IconSparkles />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                    SkillSetu Copilot
                  </h6>
                  <span className="text-muted" style={{ fontSize: "0.68rem" }}>
                    Gemini 2.0 Skill Intelligence · Online
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setCopilotOpen(false)}
                aria-label="Close Copilot"
              />
            </div>

            <div className="ss-copilot-drawer__body">
              {/* Context Banner */}
              <div className="p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-primary" style={{ fontSize: "0.65rem" }}>
                    {ROLE_LABELS[user?.role] || "Member"} Context
                  </span>
                  <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                    Real-time workspace assistant
                  </span>
                </div>
                <p className="mb-0 text-secondary" style={{ fontSize: "0.78rem" }}>
                  Ask questions about skill gaps, learning modules, placement readiness, or platform analytics.
                </p>
              </div>

              {/* Quick Prompt Suggestions */}
              <div>
                <span className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                  Suggested Prompts
                </span>
                <div className="d-flex flex-column gap-2 mt-2">
                  {(ROLE_QUICK_PROMPTS[user?.role] || ROLE_QUICK_PROMPTS.student).map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      className="text-start p-2 rounded-2 border bg-white small text-dark"
                      style={{ fontSize: "0.8rem", transition: "all 0.15s ease" }}
                      onClick={() => handleCopilotSubmit(null, prompt)}
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation Stream */}
              {copilotMessages.length > 0 && (
                <div className="d-flex flex-column gap-3 mt-2">
                  {copilotMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-3 small ${
                        msg.role === "user"
                          ? "bg-primary text-white align-self-end ms-4"
                          : "bg-light border text-dark align-self-start me-4"
                      }`}
                      style={{ maxWidth: "90%", lineHeight: 1.5 }}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ss-copilot-drawer__footer">
              <form onSubmit={handleCopilotSubmit} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ask a question or type a command…"
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-primary px-3">
                  Send
                </button>
              </form>
            </div>
          </aside>
        </>
      )}

      {/* Keyboard Shortcuts Modal */}
      {shortcutsOpen && (
        <div className="ss-copilot-backdrop" onClick={() => setShortcutsOpen(false)}>
          <div
            className="bg-white rounded-3 shadow-lg border p-4 position-fixed top-50 start-50 translate-middle"
            style={{ width: 380, maxWidth: "90vw", zIndex: 310 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0 fw-bold">Platform Shortcuts</h6>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShortcutsOpen(false)}
              />
            </div>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-secondary">Global Search</span>
                <kbd className="ss-sidebar__kbd">⌘K</kbd>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-secondary">Toggle AI Copilot</span>
                <kbd className="ss-sidebar__kbd">⌘J</kbd>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-secondary">Close Dialog / Drawer</span>
                <kbd className="ss-sidebar__kbd">Esc</kbd>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-secondary">Keyboard Navigation</span>
                <kbd className="ss-sidebar__kbd">Tab</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
