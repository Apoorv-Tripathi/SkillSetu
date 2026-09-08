import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Institution from "../models/Institution.js";
import Skill from "../models/Skill.js";
import Assessment from "../models/Assessment.js";
import AssessmentResult from "../models/AssessmentResult.js";
import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import Milestone from "../models/Milestone.js";
import PortfolioItem from "../models/PortfolioItem.js";
import CollaborationActivity from "../models/CollaborationActivity.js";
import Notification from "../models/Notification.js";
import { recomputeSkillGap } from "../services/skillGapEngine.js";
import { computeMatch } from "../services/matchingEngine.js";

async function seed() {
  await connectDB();
  console.log("[seed] Connected to database. Preparing clean demo dataset...");

  // Clear existing collections completely
  await Promise.all([
    User.deleteMany({}),
    Institution.deleteMany({}),
    Skill.deleteMany({}),
    Assessment.deleteMany({}),
    AssessmentResult.deleteMany({}),
    Opportunity.deleteMany({}),
    Application.deleteMany({}),
    Milestone.deleteMany({}),
    PortfolioItem.deleteMany({}),
    CollaborationActivity.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log("[seed] Cleared old collections.");

  // 1. Single Primary Institution
  const institution = await Institution.create({
    name: "Rajendra Institute of Technology",
    type: "engineering",
    city: "Kanpur",
    state: "Uttar Pradesh",
    branches: ["Computer Science", "Electronics", "Information Technology"],
    isSeedData: true,
  });

  // 2. Focused Core Skills (6 Essential Skills)
  const skills = await Skill.insertMany([
    { name: "React", category: "Programming", skillType: "technical", expectedProficiency: 4.0 },
    { name: "JavaScript", category: "Programming", skillType: "technical", expectedProficiency: 4.0 },
    { name: "Node.js", category: "Programming", skillType: "technical", expectedProficiency: 3.5 },
    { name: "SQL", category: "Data", skillType: "technical", expectedProficiency: 3.5 },
    { name: "Problem Solving", category: "Soft Skill", skillType: "soft_skill", expectedProficiency: 3.5 },
    { name: "Communication", category: "Soft Skill", skillType: "soft_skill", expectedProficiency: 3.5 },
  ]);
  const byName = Object.fromEntries(skills.map((s) => [s.name, s]));

  // 3. One Comprehensive Diagnostic Assessment
  const assessment = await Assessment.create({
    title: "Engineering & Full-Stack Readiness Assessment",
    description: "Evaluates core competencies across front-end component architecture, database modeling, and analytical problem solving.",
    category: "technical",
    durationMinutes: 25,
    passingScore: 3.0,
    questions: [
      {
        text: "How proficient are you in building stateful React applications using hooks and custom components?",
        skill: byName["React"]._id,
        options: [
          { text: "Basic tutorial experience only", score: 1 },
          { text: "Can build stateful forms and basic components", score: 3 },
          { text: "Proficient with hooks, context, and state management", score: 4 },
          { text: "Production architecture and performance optimization", score: 5 },
        ],
      },
      {
        text: "How comfortable are you writing asynchronous JavaScript (Promises, async/await, event loop)?",
        skill: byName["JavaScript"]._id,
        options: [
          { text: "Need guidance with async callbacks", score: 2 },
          { text: "Write standard promises and async/await comfortably", score: 4 },
          { text: "Deep understanding of microtask queue and concurrency", score: 5 },
        ],
      },
      {
        text: "How proficient are you in relational SQL queries, joins, and schema normalization?",
        skill: byName["SQL"]._id,
        options: [
          { text: "Simple SELECT queries only", score: 1 },
          { text: "Multi-table joins, GROUP BY, and aggregations", score: 3 },
          { text: "Complex subqueries, indexing, and query optimization", score: 5 },
        ],
      },
      {
        text: "When approaching a complex technical challenge, how do you structure your problem-solving approach?",
        skill: byName["Problem Solving"]._id,
        options: [
          { text: "Trial and error based on documentation", score: 2 },
          { text: "Decompose requirements into verifiable sub-modules", score: 4 },
          { text: "Algorithmic breakdown with edge-case test planning", score: 5 },
        ],
      },
    ],
  });

  // 4. Exact 5 Core Demo Users (Password: Demo@1234)
  const passwordHash = await bcrypt.hash("Demo@1234", 12);

  const [student, academician, admin, industry, platformAdmin] = await User.insertMany([
    // Role 1: Student
    {
      name: "Aditi Sharma",
      email: "student@demo.skillsetu.local",
      passwordHash,
      role: "student",
      institution: institution._id,
      branch: "Computer Science",
      graduationYear: 2027,
      careerInterests: ["Full Stack Development", "Cloud Architecture"],
      targetRoles: ["fullstack"],
    },
    // Role 2: Academician / Faculty
    {
      name: "Dr. Anil Kapoor",
      email: "academician@demo.skillsetu.local",
      passwordHash,
      role: "academician",
      institution: institution._id,
      department: "Computer Science & Engineering",
    },
    // Role 3: Institution Admin / TPO
    {
      name: "Dr. Meena Kulkarni",
      email: "admin@demo.skillsetu.local",
      passwordHash,
      role: "institution_admin",
      institutionManaged: institution._id,
    },
    // Role 4: Industry / Employer
    {
      name: "Rakesh Verma",
      email: "industry@demo.skillsetu.local",
      passwordHash,
      role: "industry",
      companyName: "Vertex Systems Pvt. Ltd.",
      designation: "Engineering Director",
    },
    // Role 5: Platform Admin
    {
      name: "Platform Administrator",
      email: "platformadmin@demo.skillsetu.local",
      passwordHash,
      role: "platform_admin",
    },
  ]);

  // 5. Initial Assessment Result for Aditi (Produces clear, targeted skill gaps)
  await AssessmentResult.create({
    student: student._id,
    assessment: assessment._id,
    skillScores: [
      { skill: byName["React"]._id, score: 3.5 }, // 70% (target 4.0 -> actionable gap)
      { skill: byName["SQL"]._id, score: 3.0 },   // 60% (target 3.5 -> actionable gap)
      { skill: byName["JavaScript"]._id, score: 4.0 }, // 80% (strong)
      { skill: byName["Problem Solving"]._id, score: 4.0 }, // 80% (strong)
      { skill: byName["Communication"]._id, score: 3.5 }, // 70%
    ],
  });

  // Recompute deterministic skill gap metrics
  await recomputeSkillGap(student._id);

  // 6. Two Clean Industry Opportunities
  const internship = await Opportunity.create({
    title: "Frontend Engineering Intern",
    postedBy: industry._id,
    companyName: industry.companyName,
    type: "internship",
    description: "Join Vertex Systems to develop modern React dashboards, design token workflows, and accessible web interfaces.",
    requiredSkills: [
      { skill: byName["React"]._id, minProficiency: 3 },
      { skill: byName["JavaScript"]._id, minProficiency: 3 },
      { skill: byName["Problem Solving"]._id, minProficiency: 2 },
    ],
    stipend: "₹25,000 / month",
    duration: "6 Months",
    location: "Bengaluru / Hybrid",
    isRemote: true,
    eligibility: {
      minGpa: 7.0,
      eligibleBranches: ["Computer Science", "Information Technology"],
      graduationYears: [2026, 2027],
    },
  });

  await Opportunity.create({
    title: "Full Stack Web Development Project",
    postedBy: industry._id,
    companyName: industry.companyName,
    type: "live_project",
    description: "Collaborative 8-week industry live project focusing on building scalable Node.js microservices and React clients.",
    requiredSkills: [
      { skill: byName["Node.js"]._id, minProficiency: 2 },
      { skill: byName["SQL"]._id, minProficiency: 2 },
    ],
    stipend: "₹15,000 Project Award",
    duration: "8 Weeks",
    location: "Remote",
    isRemote: true,
  });

  // 7. Student Application for the Internship
  const { overallScore, breakdown } = await computeMatch(student._id, internship.requiredSkills);
  const application = await Application.create({
    student: student._id,
    opportunity: internship._id,
    matchScore: overallScore,
    matchBreakdown: breakdown,
    status: "interview",
    timeline: [
      { status: "applied" },
      { status: "shortlisted", note: "Verified portfolio and strong diagnostic scores in JavaScript and Problem Solving." },
      { status: "interview", note: "Scheduled for technical discussion round." },
    ],
  });

  // 8. One Active Milestone
  await Milestone.create({
    application: application._id,
    student: student._id,
    title: "Milestone 1 — Component Library Architecture",
    description: "Implement 3 responsive, accessible UI components matching the design system specifications.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "pending",
  });

  // 9. Verified Digital Passport Items (2 Clean Proofs)
  await PortfolioItem.create({
    student: student._id,
    type: "project",
    title: "SkillSetu — Skill Intelligence Platform",
    description: "An evidence-based skill evaluation portal connecting students, academia, and industry recruiters.",
    skillsDemonstrated: [byName["React"]._id, byName["JavaScript"]._id, byName["SQL"]._id],
    link: "https://github.com/Apoorv-Tripathi/SkillSetu",
    dateIssued: new Date("2026-05-15"),
    verificationStatus: "verified",
    reviewedBy: admin._id,
    reviewedAt: new Date("2026-05-20"),
    credentialId: "SKILLSETU-PRJ-2026-01",
  });

  await PortfolioItem.create({
    student: student._id,
    type: "certificate",
    title: "Full Stack Web Engineering Certification",
    issuer: "State Technical Board / Industry Consortium",
    skillsDemonstrated: [byName["React"]._id, byName["JavaScript"]._id],
    link: "https://example.org/verify/cert-8812",
    dateIssued: new Date("2026-04-10"),
    verificationStatus: "verified",
    reviewedBy: admin._id,
    reviewedAt: new Date("2026-04-12"),
    credentialId: "FSD-CERT-8812",
  });

  // 10. Collaboration Marketplace Entry (Faculty & Industry)
  await CollaborationActivity.create({
    postedBy: academician._id,
    postedByRole: "academician",
    type: "fdp",
    title: "Faculty Development Programme — Modern Web Architectures",
    description: "A 3-day joint workshop between RIT Faculty and Vertex Systems engineers on modern API design and full-stack testing.",
    institution: institution._id,
  });

  // 11. Single Notification for Student
  await Notification.create({
    user: student._id,
    type: "application_status",
    title: "Interview Round Scheduled",
    message: 'Your application for "Frontend Engineering Intern" has been shortlisted for technical interview.',
    link: "/applications",
  });

  console.log("[seed] Done! Injected minimal, uncluttered, and high-impact demo dataset.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
