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
import MentorshipRequest from "../models/MentorshipRequest.js";
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
    MentorshipRequest.deleteMany({}),
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

  // 3. Four Comprehensive Diagnostic & Benchmarking Assessments
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

  await Assessment.create({
    title: "Data Structures & Algorithmic Problem Solving",
    description: "Evaluates algorithmic efficiency, asymptotic complexity analysis, graph traversals, and dynamic programming optimization.",
    category: "technical",
    durationMinutes: 30,
    passingScore: 3.5,
    questions: [
      {
        text: "What is the tightest upper bound time complexity for searching in a balanced Binary Search Tree?",
        skill: byName["Problem Solving"]._id,
        options: [
          { text: "O(n)", score: 1 },
          { text: "O(log n)", score: 5 },
          { text: "O(1)", score: 2 },
          { text: "O(n log n)", score: 2 },
        ],
      },
      {
        text: "How do you detect and handle cycles during graph traversal algorithms?",
        skill: byName["Problem Solving"]._id,
        options: [
          { text: "Naive recursion without tracking", score: 1 },
          { text: "Using a visited set and recursion stack tracking / colors", score: 5 },
          { text: "Queue without visited checks", score: 2 },
        ],
      },
    ],
  });

  await Assessment.create({
    title: "Cloud Native Microservices & System Design Benchmark",
    description: "Industry benchmark for REST API architecture, distributed caching, horizontal scaling, and transactional integrity.",
    category: "domain",
    durationMinutes: 25,
    passingScore: 3.0,
    questions: [
      {
        text: "How do you optimize multi-table SQL queries under high concurrent read traffic?",
        skill: byName["SQL"]._id,
        options: [
          { text: "Full table scans with wildcards", score: 1 },
          { text: "Composite B-tree indices and connection pool sizing", score: 5 },
          { text: "Client side in-memory filtering", score: 2 },
        ],
      },
      {
        text: "How do you structure stateless Node.js services for horizontal scaling behind a reverse proxy?",
        skill: byName["Node.js"]._id,
        options: [
          { text: "In-memory session state per process", score: 1 },
          { text: "Stateless authentication (JWT) with external Redis cache", score: 5 },
          { text: "Synchronous file-system logging", score: 1 },
        ],
      },
    ],
  });

  await Assessment.create({
    title: "Professional Communication & Workplace Cognitive Aptitude",
    description: "Evaluates cross-functional technical communication, stakeholder management, and collaborative problem solving.",
    category: "soft_skill",
    durationMinutes: 20,
    passingScore: 3.5,
    questions: [
      {
        text: "When communicating technical architectural decisions to cross-functional stakeholders, how do you frame trade-offs?",
        skill: byName["Communication"]._id,
        options: [
          { text: "Use pure implementation jargon without business context", score: 1 },
          { text: "Focus on business impact, risk mitigation, and visual architecture flowcharts", score: 5 },
          { text: "Provide raw pull request links without explanation", score: 1 },
        ],
      },
    ],
  });

  // 4. Exact 5 Core Demo Users (Password: Demo@1234)
  const passwordHash = await bcrypt.hash("Demo@1234", 12);

  const [student, academician, admin, industry, platformAdmin, student2, student3, mentor1, mentor2] = await User.insertMany([
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
      department: "Computer Science",
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
    // Cohort Student 2 (Information Technology)
    {
      name: "Rohan Gupta",
      email: "rohan@demo.skillsetu.local",
      passwordHash,
      role: "student",
      institution: institution._id,
      branch: "Information Technology",
      graduationYear: 2027,
      careerInterests: ["Backend Systems", "Cloud Computing"],
      targetRoles: ["backend"],
    },
    // Cohort Student 3 (Electronics)
    {
      name: "Priya Nair",
      email: "priya@demo.skillsetu.local",
      passwordHash,
      role: "student",
      institution: institution._id,
      branch: "Electronics",
      graduationYear: 2027,
      careerInterests: ["Embedded Systems", "IoT"],
      targetRoles: ["embedded"],
    },
    // Mentor 1: Full-Stack Architect
    {
      name: "Vikram Malhotra",
      email: "mentor@demo.skillsetu.local",
      passwordHash,
      role: "mentor",
      bio: "Principal Architect at CloudScale Tech with 12+ years building enterprise web apps and distributed microservices.",
      expertiseSkills: [byName["JavaScript"]._id, byName["React"]._id, byName["Problem Solving"]._id],
      isActive: true,
    },
    // Mentor 2: Lead Data Engineer
    {
      name: "Pooja Deshmukh",
      email: "pooja.mentor@demo.skillsetu.local",
      passwordHash,
      role: "mentor",
      bio: "Lead Data Engineer at AnalyticsPulse. Specializing in high-throughput query optimization and relational schema design.",
      expertiseSkills: [byName["SQL"]._id, byName["Problem Solving"]._id],
      isActive: true,
    },
  ]);

  // 5. Initial Assessment Results (Produces clear, multi-branch cohort analytics)
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
  await recomputeSkillGap(student._id);

  if (student2) {
    await AssessmentResult.create({
      student: student2._id,
      assessment: assessment._id,
      skillScores: [
        { skill: byName["React"]._id, score: 3.8 },
        { skill: byName["SQL"]._id, score: 4.0 },
        { skill: byName["JavaScript"]._id, score: 4.2 },
        { skill: byName["Problem Solving"]._id, score: 4.5 },
        { skill: byName["Communication"]._id, score: 3.5 },
      ],
    });
    await recomputeSkillGap(student2._id);
  }

  if (student3) {
    await AssessmentResult.create({
      student: student3._id,
      assessment: assessment._id,
      skillScores: [
        { skill: byName["React"]._id, score: 2.5 },
        { skill: byName["SQL"]._id, score: 2.0 },
        { skill: byName["JavaScript"]._id, score: 2.8 },
        { skill: byName["Problem Solving"]._id, score: 2.5 },
        { skill: byName["Communication"]._id, score: 3.0 },
      ],
    });
    await recomputeSkillGap(student3._id);
  }

  // 6. Industry Opportunities & Learning Marketplace Programs
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

  const liveProject = await Opportunity.create({
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

  await Opportunity.create({
    title: "Backend Systems & Cloud Engineering Intern",
    postedBy: industry._id,
    companyName: industry.companyName,
    type: "internship",
    description: "Design high-performance REST APIs, manage database schemas, and deploy containerized microservices to cloud infrastructure.",
    requiredSkills: [
      { skill: byName["Node.js"]._id, minProficiency: 3 },
      { skill: byName["SQL"]._id, minProficiency: 3 },
    ],
    stipend: "₹30,000 / month",
    duration: "6 Months",
    location: "Bengaluru / Hybrid",
    isRemote: false,
    eligibility: {
      minGpa: 7.5,
      eligibleBranches: ["Computer Science", "Information Technology"],
      graduationYears: [2026, 2027],
    },
  });

  // Learning Marketplace Programs
  await Opportunity.create({
    title: "Advanced React & Modern UI Architecture",
    postedBy: industry._id,
    companyName: "Meta / Coursera Open Education",
    type: "training_program",
    description: "Comprehensive 6-week industry module covering concurrent mode, server components, custom hook optimization, and accessible UI tokens.",
    requiredSkills: [
      { skill: byName["React"]._id, minProficiency: 3 },
      { skill: byName["JavaScript"]._id, minProficiency: 3 },
    ],
    stipend: "Industry Sponsored · Free Enrollment",
    duration: "6 Weeks",
    location: "Online / Self-Paced",
    isRemote: true,
  });

  await Opportunity.create({
    title: "Distributed Systems & Cloud Scale Architecture",
    postedBy: industry._id,
    companyName: "NPTEL & Google Cloud Campus",
    type: "certification_course",
    description: "Master horizontal scaling, distributed message queues (Kafka), microservice boundaries, and fault-tolerant cloud patterns.",
    requiredSkills: [
      { skill: byName["Node.js"]._id, minProficiency: 3 },
      { skill: byName["Problem Solving"]._id, minProficiency: 3 },
    ],
    stipend: "Verified National Certification",
    duration: "8 Weeks",
    location: "Online / Interactive",
    isRemote: true,
  });

  await Opportunity.create({
    title: "Enterprise PostgreSQL & Data Architecture Masterclass",
    postedBy: industry._id,
    companyName: "Scaler Topics / Open Guild",
    type: "workshop",
    description: "Hands-on weekend bootcamp on query plan analysis (EXPLAIN ANALYZE), connection pooling, vacuuming, and partitioning.",
    requiredSkills: [
      { skill: byName["SQL"]._id, minProficiency: 3 },
    ],
    stipend: "Hands-on Lab & Certificate",
    duration: "2 Weeks",
    location: "Live Virtual Bootcamp",
    isRemote: true,
  });

  await Opportunity.create({
    title: "Applied AI Systems & Prompt Engineering Bootcamp",
    postedBy: industry._id,
    companyName: "Vertex AI Research Labs",
    type: "training_program",
    description: "Build LLM applications using vector embeddings, semantic retrieval, RAG workflows, and evaluation pipelines.",
    requiredSkills: [
      { skill: byName["JavaScript"]._id, minProficiency: 3 },
      { skill: byName["Problem Solving"]._id, minProficiency: 3 },
    ],
    stipend: "Full Sponsorship",
    duration: "4 Weeks",
    location: "Online",
    isRemote: true,
  });

  // 7. Student Applications
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
      { status: "interview", note: "Scheduled for technical discussion round with engineering leadership." },
    ],
  });

  const { overallScore: score2, breakdown: bd2 } = await computeMatch(student._id, liveProject.requiredSkills);
  await Application.create({
    student: student._id,
    opportunity: liveProject._id,
    matchScore: score2 || 92,
    matchBreakdown: bd2,
    status: "shortlisted",
    timeline: [
      { status: "applied" },
      { status: "shortlisted", note: "Candidate qualified for 8-week industry development sprint." },
    ],
  });

  // 8. Active Milestones
  await Milestone.create({
    application: application._id,
    student: student._id,
    mentor: industry._id,
    title: "Milestone 1 — Component Library Architecture",
    description: "Implement 3 responsive, accessible UI components matching the design system specifications.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "pending",
  });

  await Milestone.create({
    application: application._id,
    student: student._id,
    mentor: industry._id,
    title: "Milestone 2 — State Management & API Integration",
    description: "Connect frontend form validation with asynchronous backend services and handle edge cases gracefully.",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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

  // 11. Mentorship Connections
  await MentorshipRequest.create({
    student: student._id,
    mentor: mentor1._id,
    message: "Looking forward to your guidance on React component architecture and system design.",
    status: "accepted",
    respondedAt: new Date("2026-05-18"),
  });

  await MentorshipRequest.create({
    student: student._id,
    mentor: mentor2._id,
    message: "Hi Pooja, I would appreciate your mentorship on PostgreSQL indexing and query plan optimization.",
    status: "pending",
  });

  // 12. Single Notification for Student
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
