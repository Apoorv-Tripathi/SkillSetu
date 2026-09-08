import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AssessmentList from "./pages/AssessmentList.jsx";
import TakeAssessment from "./pages/TakeAssessment.jsx";
import SkillProfile from "./pages/SkillProfile.jsx";
import PostOpportunity from "./pages/PostOpportunity.jsx";
import OpportunityList from "./pages/OpportunityList.jsx";
import SkillGapHeatmap from "./pages/SkillGapHeatmap.jsx";
import OpportunityBrowse from "./pages/OpportunityBrowse.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import ApplicantsView from "./pages/ApplicantsView.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import MentorBrowse from "./pages/MentorBrowse.jsx";
import MentorRequests from "./pages/MentorRequests.jsx";
import MentorDashboard from "./pages/MentorDashboard.jsx";
import InstitutionDashboard from "./pages/InstitutionDashboard.jsx";
import CollaborationBoard from "./pages/CollaborationBoard.jsx";
import PortfolioVerificationQueue from "./pages/PortfolioVerificationQueue.jsx";
import AcademicianDashboard from "./pages/AcademicianDashboard.jsx";
import AdminInstitutions from "./pages/AdminInstitutions.jsx";
import AdminSkills from "./pages/AdminSkills.jsx";
import AdminAssessments from "./pages/AdminAssessments.jsx";
import CareerRoadmap from "./pages/CareerRoadmap.jsx";
import LearningMarketplace from "./pages/LearningMarketplace.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const HIRING_ROLES = ["industry", "recruiter"];
const POSTER_ROLES = ["academician", "industry", "recruiter"];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Student */}
      <Route path="/assessments" element={<ProtectedRoute roles={["student"]}><AssessmentList /></ProtectedRoute>} />
      <Route path="/assessments/:id" element={<ProtectedRoute roles={["student"]}><TakeAssessment /></ProtectedRoute>} />
      <Route path="/skill-profile" element={<ProtectedRoute roles={["student"]}><SkillProfile /></ProtectedRoute>} />
      <Route path="/skill-gap" element={<ProtectedRoute roles={["student"]}><SkillGapHeatmap /></ProtectedRoute>} />
      <Route path="/career-roadmap" element={<ProtectedRoute roles={["student"]}><CareerRoadmap /></ProtectedRoute>} />
      <Route path="/learning" element={<ProtectedRoute roles={["student"]}><LearningMarketplace /></ProtectedRoute>} />
      <Route path="/opportunities/browse" element={<ProtectedRoute roles={["student"]}><OpportunityBrowse /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute roles={["student"]}><MyApplications /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute roles={["student"]}><Portfolio /></ProtectedRoute>} />
      <Route path="/mentors" element={<ProtectedRoute roles={["student"]}><MentorBrowse /></ProtectedRoute>} />

      {/* Industry & Recruiter */}
      <Route path="/opportunities/new" element={<ProtectedRoute roles={HIRING_ROLES}><PostOpportunity /></ProtectedRoute>} />
      <Route path="/opportunities" element={<ProtectedRoute roles={HIRING_ROLES}><OpportunityList /></ProtectedRoute>} />
      <Route
        path="/opportunities/:opportunityId/applicants"
        element={<ProtectedRoute roles={HIRING_ROLES}><ApplicantsView /></ProtectedRoute>}
      />

      {/* Mentor */}
      <Route path="/mentor/dashboard" element={<ProtectedRoute roles={["mentor"]}><MentorDashboard /></ProtectedRoute>} />
      <Route path="/mentor/requests" element={<ProtectedRoute roles={["mentor"]}><MentorRequests /></ProtectedRoute>} />

      {/* Academician */}
      <Route path="/academician/skill-gap" element={<ProtectedRoute roles={["academician"]}><AcademicianDashboard /></ProtectedRoute>} />

      {/* Collaboration marketplace — academician, industry, recruiter */}
      <Route path="/collaboration" element={<ProtectedRoute roles={POSTER_ROLES}><CollaborationBoard /></ProtectedRoute>} />

      {/* Institution Admin */}
      <Route path="/institution/dashboard" element={<ProtectedRoute roles={["institution_admin"]}><InstitutionDashboard /></ProtectedRoute>} />
      <Route
        path="/institution/verification-queue"
        element={
          <ProtectedRoute roles={["institution_admin", "platform_admin"]}>
            <PortfolioVerificationQueue />
          </ProtectedRoute>
        }
      />

      {/* Platform Admin */}
      <Route path="/admin/institutions" element={<ProtectedRoute roles={["platform_admin"]}><AdminInstitutions /></ProtectedRoute>} />
      <Route path="/admin/skills" element={<ProtectedRoute roles={["platform_admin"]}><AdminSkills /></ProtectedRoute>} />
      <Route path="/admin/assessments" element={<ProtectedRoute roles={["platform_admin"]}><AdminAssessments /></ProtectedRoute>} />
    </Routes>
  );
}
