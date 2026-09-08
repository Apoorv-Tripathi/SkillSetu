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

  await Promise.all([
    User.deleteMany({ email: /@demo\.skillsetu/ }),
    Institution.deleteMany({ isSeedData: true }),
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

  // Institutions: All India Institute of Ayurveda (AIIA) - Ministry of Ayush & Engineering
  const aiiaInstitution = await Institution.create({
    name: "All India Institute of Ayurveda (AIIA) — Ministry of Ayush",
    type: "medical",
    city: "New Delhi",
    state: "Delhi",
    branches: ["Ayurvedic Medicine & Surgery", "Health Informatics", "Pharmacovigilance & Drug Standardization", "Clinical Research"],
    isSeedData: true,
  });

  const institution = await Institution.create({
    name: "Rajendra Institute of Technology",
    type: "engineering",
    city: "Kanpur",
    state: "Uttar Pradesh",
    branches: ["Computer Science", "Electronics", "Mechanical", "Civil"],
    isSeedData: true,
  });

  // Comprehensive Skills spanning Technical, Soft Skills, Aptitude, and Ayush Domain
  const skills = await Skill.insertMany([
    // Technical
    { name: "JavaScript", category: "Programming", skillType: "technical", expectedProficiency: 3.5 },
    { name: "React", category: "Programming", skillType: "technical", expectedProficiency: 3.5 },
    { name: "Node.js", category: "Programming", skillType: "technical", expectedProficiency: 3.5 },
    { name: "SQL", category: "Data", skillType: "technical", expectedProficiency: 3.0 },
    { name: "Python", category: "Data", skillType: "technical", expectedProficiency: 3.5 },
    // Soft Skills
    { name: "Communication", category: "Soft Skill", skillType: "soft_skill", expectedProficiency: 3.5 },
    { name: "Problem Solving", category: "Soft Skill", skillType: "soft_skill", expectedProficiency: 3.5 },
    { name: "Leadership", category: "Soft Skill", skillType: "soft_skill", expectedProficiency: 3.0 },
    // Aptitude
    { name: "Logical Reasoning", category: "Aptitude", skillType: "aptitude", expectedProficiency: 3.5 },
    { name: "Quantitative Aptitude", category: "Aptitude", skillType: "aptitude", expectedProficiency: 3.5 },
    // Domain - Ayush / Health-Tech
    { name: "Clinical Trials", category: "Healthcare", skillType: "domain", expectedProficiency: 3.5 },
    { name: "Pharmacovigilance", category: "Healthcare", skillType: "domain", expectedProficiency: 3.0 },
    { name: "Health Informatics", category: "Healthcare", skillType: "domain", expectedProficiency: 3.5 },
    { name: "Herbal Standardization", category: "Ayurveda", skillType: "domain", expectedProficiency: 3.5 },
    { name: "Ayurvedic Formulations", category: "Ayurveda", skillType: "domain", expectedProficiency: 3.5 },
    { name: "Research Methodology", category: "Research", skillType: "domain", expectedProficiency: 3.5 },
  ]);
  const byName = Object.fromEntries(skills.map((s) => [s.name, s]));

  // Assessments
  const assessmentTechnical = await Assessment.create({
    title: "General Software Readiness Assessment",
    description: "A baseline assessment covering core programming, component design, and full-stack fundamentals.",
    category: "technical",
    durationMinutes: 30,
    passingScore: 3.0,
    questions: [
      {
        text: "How comfortable are you writing asynchronous JavaScript (promises/async-await)?",
        skill: byName["JavaScript"]._id,
        options: [
          { text: "Never written any", score: 0 },
          { text: "I can follow along but need help", score: 2 },
          { text: "I write it independently", score: 4 },
          { text: "I can debug and optimize it", score: 5 },
        ],
      },
      {
        text: "How would you rate your experience building React components?",
        skill: byName["React"]._id,
        options: [
          { text: "No experience", score: 0 },
          { text: "Built basic components in tutorials", score: 2 },
          { text: "Built full features independently", score: 4 },
          { text: "Architected component systems", score: 5 },
        ],
      },
      {
        text: "How proficient are you in relational database design and SQL querying?",
        skill: byName["SQL"]._id,
        options: [
          { text: "Basic SELECT queries only", score: 1 },
          { text: "Joins, aggregations, and subqueries", score: 3 },
          { text: "Index optimization and schema normalization", score: 5 },
        ],
      },
    ],
  });

  const assessmentAptitude = await Assessment.create({
    title: "General Aptitude & Logical Reasoning Test",
    description: "Evaluates analytical ability, pattern recognition, and quantitative problem-solving speed.",
    category: "aptitude",
    durationMinutes: 25,
    passingScore: 3.0,
    questions: [
      {
        text: "How proficient are you with structured logical deduction, syllogisms, and sequence inference?",
        skill: byName["Logical Reasoning"]._id,
        options: [
          { text: "Struggle with logical patterns", score: 1 },
          { text: "Can solve standard pattern problems with practice", score: 3 },
          { text: "Fast and highly accurate on complex deductions", score: 5 },
        ],
      },
      {
        text: "How comfortable are you with quantitative data interpretation, percentages, and algebraic modeling?",
        skill: byName["Quantitative Aptitude"]._id,
        options: [
          { text: "Need calculator and formulas", score: 1 },
          { text: "Comfortable with standard business math", score: 3 },
          { text: "Advanced speed math and statistical modeling", score: 5 },
        ],
      },
      {
        text: "When approaching a multi-variable problem, how do you structure your solution?",
        skill: byName["Problem Solving"]._id,
        options: [
          { text: "Trial and error", score: 1 },
          { text: "Decompose into smaller sub-problems", score: 4 },
          { text: "Root cause analysis with algorithmic heuristics", score: 5 },
        ],
      },
    ],
  });

  const assessmentSoftSkill = await Assessment.create({
    title: "Professional Soft Skills & Workplace Communication",
    description: "Evaluates interpersonal communication, stakeholder management, and cross-functional team collaboration.",
    category: "soft_skill",
    durationMinutes: 20,
    passingScore: 3.0,
    questions: [
      {
        text: "How confident are you explaining a technical or scientific concept to a non-specialist audience?",
        skill: byName["Communication"]._id,
        options: [
          { text: "Not confident", score: 1 },
          { text: "Somewhat confident with preparation", score: 3 },
          { text: "Very confident and articulate", score: 5 },
        ],
      },
      {
        text: "How do you handle ambiguous team objectives or differing opinions during project milestones?",
        skill: byName["Leadership"]._id,
        options: [
          { text: "Wait for someone else to direct", score: 1 },
          { text: "Mediate consensus and align on common goals", score: 4 },
          { text: "Proactively propose structured solutions and lead execution", score: 5 },
        ],
      },
    ],
  });

  const assessmentAyush = await Assessment.create({
    title: "Ayush Health-Tech & Clinical Research Readiness",
    description: "Protocol assessment for All India Institute of Ayurveda & Ministry of Ayush clinical research standards.",
    category: "domain",
    durationMinutes: 30,
    passingScore: 3.5,
    questions: [
      {
        text: "How familiar are you with Good Clinical Practice (GCP) guidelines in Ayurvedic and integrative clinical trials?",
        skill: byName["Clinical Trials"]._id,
        options: [
          { text: "Heard of it", score: 1 },
          { text: "Familiar with protocol design and ethics committee clearance", score: 3 },
          { text: "Extensive experience in clinical trial documentation", score: 5 },
        ],
      },
      {
        text: "How confident are you with Pharmacovigilance reporting and adverse event tracking in traditional medicine?",
        skill: byName["Pharmacovigilance"]._id,
        options: [
          { text: "Basic theoretical knowledge", score: 2 },
          { text: "Experienced with ADR reporting formats & Ayush surveillance", score: 4 },
          { text: "Expert level", score: 5 },
        ],
      },
      {
        text: "How comfortable are you analyzing patient electronic health records (EHR) using health informatics standards?",
        skill: byName["Health Informatics"]._id,
        options: [
          { text: "No experience", score: 1 },
          { text: "Basic experience with health databases", score: 3 },
          { text: "Proficient in health data integration and automated reporting", score: 5 },
        ],
      },
    ],
  });

  const passwordHash = await bcrypt.hash("Demo@1234", 12);

  const [
    student,
    industry,
    admin,
    mentor,
    studentTwo,
    studentThree,
    academician,
    recruiter,
    platformAdmin,
    studentFour,
    aiiaStudent,
  ] = await User.insertMany([
    {
      name: "Aditi Sharma",
      email: "student@demo.skillsetu.local",
      passwordHash,
      role: "student",
      institution: institution._id,
      branch: "Computer Science",
      graduationYear: 2027,
      careerInterests: ["Full Stack Development", "Cloud Architecture", "Healthcare Software"],
      targetRoles: ["fullstack"],
    },
    {
      name: "Rakesh Verma",
      email: "industry@demo.skillsetu.local",
      passwordHash,
      role: "industry",
      companyName: "Vertex Systems Pvt. Ltd.",
      designation: "Engineering Director",
    },
    {
      name: "Dr. Meena Kulkarni",
      email: "admin@demo.skillsetu.local",
      passwordHash,
      role: "institution_admin",
      institutionManaged: institution._id,
    },
    {
      name: "Sanjay Iyer",
      email: "mentor@demo.skillsetu.local",
      passwordHash,
      role: "mentor",
      bio: "Senior Principal Engineer, 12 years in SaaS & health-tech. Mentors on full-stack systems and career readiness.",
      expertiseSkills: [byName["Node.js"]._id, byName["JavaScript"]._id, byName["React"]._id],
    },
    {
      name: "Priya Nair",
      email: "student2@demo.skillsetu.local",
      passwordHash,
      role: "student",
      institution: institution._id,
      branch: "Computer Science",
      graduationYear: 2027,
      careerInterests: ["Data Analytics", "Machine Learning"],
      targetRoles: ["data_analyst"],
    },
    {
      name: "Rohit Mishra",
      email: "student3@demo.skillsetu.local",
      passwordHash,
      role: "student",
      institution: institution._id,
      branch: "Electronics",
      graduationYear: 2026,
      careerInterests: ["Embedded Systems", "IoT"],
    },
    {
      name: "Dr. Anil Kapoor",
      email: "academician@demo.skillsetu.local",
      passwordHash,
      role: "academician",
      institution: institution._id,
      department: "Computer Science & Engineering",
    },
    {
      name: "Neha Kulshreshtha",
      email: "recruiter@demo.skillsetu.local",
      passwordHash,
      role: "recruiter",
      companyName: "Bluewave Analytics",
      designation: "Talent Acquisition Head",
    },
    {
      name: "Platform Admin",
      email: "platformadmin@demo.skillsetu.local",
      passwordHash,
      role: "platform_admin",
    },
    {
      name: "Karan Bhatt",
      email: "student4@demo.skillsetu.local",
      passwordHash,
      role: "student",
      institution: institution._id,
      branch: "Computer Science",
      graduationYear: 2026,
    },
    {
      name: "Dr. Rajeshwar Sharma",
      email: "ayushstudent@demo.skillsetu.local",
      passwordHash,
      role: "student",
      institution: aiiaInstitution._id,
      branch: "Clinical Research",
      graduationYear: 2026,
      careerInterests: ["Clinical Trials", "Ayurvedic Pharmacovigilance", "Health Informatics"],
      targetRoles: ["ayush_researcher"],
    },
  ]);

  // Assessment results for students
  await AssessmentResult.create({
    student: student._id,
    assessment: assessmentTechnical._id,
    skillScores: [
      { skill: byName["JavaScript"]._id, score: 4.0 },
      { skill: byName["React"]._id, score: 3.5 },
      { skill: byName["SQL"]._id, score: 3.0 },
    ],
  });
  await AssessmentResult.create({
    student: student._id,
    assessment: assessmentAptitude._id,
    skillScores: [
      { skill: byName["Logical Reasoning"]._id, score: 4.0 },
      { skill: byName["Quantitative Aptitude"]._id, score: 3.5 },
      { skill: byName["Problem Solving"]._id, score: 4.0 },
    ],
  });
  await AssessmentResult.create({
    student: student._id,
    assessment: assessmentSoftSkill._id,
    skillScores: [
      { skill: byName["Communication"]._id, score: 3.5 },
      { skill: byName["Leadership"]._id, score: 3.0 },
    ],
  });

  // Student 2
  await AssessmentResult.create({
    student: studentTwo._id,
    assessment: assessmentTechnical._id,
    skillScores: [
      { skill: byName["JavaScript"]._id, score: 2.5 },
      { skill: byName["React"]._id, score: 2.0 },
      { skill: byName["SQL"]._id, score: 3.5 },
    ],
  });
  await AssessmentResult.create({
    student: studentTwo._id,
    assessment: assessmentAptitude._id,
    skillScores: [
      { skill: byName["Logical Reasoning"]._id, score: 4.5 },
      { skill: byName["Quantitative Aptitude"]._id, score: 4.0 },
      { skill: byName["Problem Solving"]._id, score: 4.0 },
    ],
  });

  // AIIA Student
  await AssessmentResult.create({
    student: aiiaStudent._id,
    assessment: assessmentAyush._id,
    skillScores: [
      { skill: byName["Clinical Trials"]._id, score: 4.5 },
      { skill: byName["Pharmacovigilance"]._id, score: 4.0 },
      { skill: byName["Health Informatics"]._id, score: 3.5 },
    ],
  });

  // Recompute skill gaps
  await Promise.all(
    [student, studentTwo, studentThree, studentFour, aiiaStudent].map((s) => recomputeSkillGap(s._id))
  );

  // Opportunities
  const opportunity = await Opportunity.create({
    title: "Frontend Engineering Intern",
    postedBy: industry._id,
    companyName: industry.companyName,
    type: "internship",
    description:
      "Work on Vertex Systems' core dashboard platform, creating high-performance data-dense React interfaces for operations and analytics.",
    requiredSkills: [
      { skill: byName["JavaScript"]._id, minProficiency: 3 },
      { skill: byName["React"]._id, minProficiency: 3 },
      { skill: byName["Communication"]._id, minProficiency: 2 },
    ],
    stipend: "₹25,000 / month",
    duration: "6 Months",
    location: "Kanpur / Hybrid",
    isRemote: false,
    eligibility: {
      minGpa: 7.0,
      eligibleBranches: ["Computer Science", "Electronics"],
      graduationYears: [2026, 2027],
    },
  });

  const aiiaInternship = await Opportunity.create({
    title: "Ayush Health Informatics & Clinical Research Intern",
    postedBy: industry._id,
    companyName: "AIIA Collaborative Research Wing (Ministry of Ayush)",
    type: "internship",
    description:
      "Conduct structured digital data curation, health informatics pipeline management, and clinical trial standardization at AIIA New Delhi.",
    requiredSkills: [
      { skill: byName["Clinical Trials"]._id, minProficiency: 3 },
      { skill: byName["Health Informatics"]._id, minProficiency: 3 },
      { skill: byName["Communication"]._id, minProficiency: 3 },
    ],
    stipend: "₹20,000 / month + Gov Certification",
    duration: "4 Months",
    location: "New Delhi (AIIA Campus)",
    isRemote: false,
    eligibility: {
      minGpa: 6.5,
      eligibleBranches: ["Clinical Research", "Health Informatics", "Computer Science"],
      graduationYears: [2026, 2027],
    },
  });

  const apprenticeship = await Opportunity.create({
    title: "Herbal Drug Formulation & Standardization Apprenticeship",
    postedBy: industry._id,
    companyName: "Ayush Phytochem Labs Pvt. Ltd.",
    type: "apprenticeship",
    description:
      "Comprehensive 1-year industry apprenticeship under certified pharmacologists covering chromatographic drug assay and standardization protocols.",
    requiredSkills: [
      { skill: byName["Herbal Standardization"]._id, minProficiency: 3 },
      { skill: byName["Ayurvedic Formulations"]._id, minProficiency: 3 },
      { skill: byName["Problem Solving"]._id, minProficiency: 2 },
    ],
    stipend: "₹18,000 / month (Govt. NAPS Stipend Subsidized)",
    duration: "1 Year",
    location: "Kanpur",
    isRemote: false,
  });

  const recruiterOpportunity = await Opportunity.create({
    title: "Data Analyst — Graduate Placement Programme",
    postedBy: recruiter._id,
    companyName: recruiter.companyName,
    type: "job",
    description: "Full-time entry-level analytics role rotating across product, risk, and marketing analytics.",
    requiredSkills: [
      { skill: byName["SQL"]._id, minProficiency: 3 },
      { skill: byName["Problem Solving"]._id, minProficiency: 3 },
      { skill: byName["Logical Reasoning"]._id, minProficiency: 3 },
    ],
    stipend: "₹7.5 LPA CTC",
    duration: "Full-Time",
    location: "Bengaluru / Remote",
    isRemote: true,
    eligibility: {
      minGpa: 7.5,
      eligibleBranches: ["Computer Science", "Electronics", "Health Informatics"],
      graduationYears: [2026, 2027],
    },
  });

  const learningProgram1 = await Opportunity.create({
    title: "Industry Training: Advanced SQL & Health Data Modeling",
    postedBy: industry._id,
    companyName: "Vertex Academy x AIIA",
    type: "training_program",
    description: "Comprehensive 8-week training module covering relational databases, cohort querying, and health informatics schemas.",
    requiredSkills: [
      { skill: byName["SQL"]._id, minProficiency: 1 },
      { skill: byName["Problem Solving"]._id, minProficiency: 1 },
    ],
    stipend: "Free / Sponsored",
    duration: "8 Weeks (Self-paced)",
    location: "Online",
    isRemote: true,
  });

  const learningProgram2 = await Opportunity.create({
    title: "Certification: Good Clinical Practice (GCP) in Ayush Trials",
    postedBy: industry._id,
    companyName: "Ministry of Ayush Training Wing",
    type: "certification_course",
    description: "Official certificate program covering ethics, regulatory filings, electronic case reports, and data integrity.",
    requiredSkills: [
      { skill: byName["Clinical Trials"]._id, minProficiency: 2 },
      { skill: byName["Pharmacovigilance"]._id, minProficiency: 2 },
    ],
    stipend: "Govt Certified",
    duration: "6 Weeks",
    location: "Online / Hybrid",
    isRemote: true,
  });

  // Application for Aditi
  const { overallScore, breakdown } = await computeMatch(student._id, opportunity.requiredSkills);
  const application = await Application.create({
    student: student._id,
    opportunity: opportunity._id,
    matchScore: overallScore,
    matchBreakdown: breakdown,
    status: "interview",
    mentor: mentor._id,
    timeline: [
      { status: "applied" },
      { status: "shortlisted", note: "Strong JS/React baseline and logical aptitude" },
      { status: "interview", note: "Moved to technical & system design round" },
    ],
  });

  await Milestone.create({
    application: application._id,
    student: student._id,
    mentor: mentor._id,
    title: "Milestone 1 — Component Library Setup",
    description: "Develop 3 production-grade React components adhering to accessible design tokens.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "pending",
  });

  // Application for Student 2
  const { overallScore: score2, breakdown: breakdown2 } = await computeMatch(
    studentTwo._id,
    recruiterOpportunity.requiredSkills
  );
  await Application.create({
    student: studentTwo._id,
    opportunity: recruiterOpportunity._id,
    matchScore: score2,
    matchBreakdown: breakdown2,
    status: "shortlisted",
    starred: true,
    feedback: [
      {
        reviewer: recruiter._id,
        rating: 4,
        notes: "High logical reasoning and solid SQL fundamentals. Excellent candidate for graduate placement.",
      },
    ],
    timeline: [{ status: "applied" }, { status: "shortlisted", note: "Screened and shortlisted for drive" }],
  });

  // Portfolio items
  await PortfolioItem.create({
    student: student._id,
    type: "project",
    title: "Placement & Skill-Gap Intelligence Portal (AIIA Project)",
    description: "A React + Node.js smart automation dashboard connecting students and industry recruiters.",
    skillsDemonstrated: [byName["React"]._id, byName["JavaScript"]._id, byName["SQL"]._id],
    link: "https://github.com/example/skillsetu-portal",
    dateIssued: new Date("2026-03-15"),
    verificationStatus: "verified",
    reviewedBy: admin._id,
    reviewedAt: new Date("2026-03-20"),
    credentialId: "AIIA-PRJ-2026-092",
  });

  await PortfolioItem.create({
    student: student._id,
    type: "achievement",
    title: "1st Prize — Smart Automation Hackathon (Ministry of Ayush)",
    description: "Awarded top honor for developing automated herbal inventory and pharmacovigilance logging prototype.",
    issuer: "Ministry of Ayush",
    skillsDemonstrated: [byName["Problem Solving"]._id, byName["Leadership"]._id],
    link: "https://example.gov.in/ayush-hackathon-cert",
    dateIssued: new Date("2026-05-10"),
    verificationStatus: "verified",
    reviewedBy: admin._id,
    reviewedAt: new Date("2026-05-12"),
    credentialId: "AYUSH-HACK-1ST-44",
  });

  await PortfolioItem.create({
    student: student._id,
    type: "academic_record",
    title: "Official Grade Card — Semesters 1 to 4 (CGPA 8.6)",
    description: "Authenticated transcript authenticated by college registrar.",
    issuer: "Office of the Controller of Examinations",
    link: "https://drive.google.com/example-transcript",
    dateIssued: new Date("2026-07-01"),
    verificationStatus: "verified",
    reviewedBy: admin._id,
    reviewedAt: new Date("2026-07-05"),
    credentialId: "RIT-TRANSCRIPT-8821",
  });

  await PortfolioItem.create({
    student: student._id,
    type: "certificate",
    title: "Full Stack Web Developer Professional Certificate",
    issuer: "Meta / Coursera",
    skillsDemonstrated: [byName["React"]._id, byName["JavaScript"]._id],
    link: "https://coursera.org/verify/example-cert",
    dateIssued: new Date("2026-04-11"),
    verificationStatus: "verified",
    reviewedBy: admin._id,
    reviewedAt: new Date("2026-04-15"),
    credentialId: "COURSERA-FSD-7712",
  });

  // Collaboration marketplace for Academicians & Industry
  await CollaborationActivity.create({
    postedBy: industry._id,
    postedByRole: "industry",
    type: "faculty_internship",
    title: "Faculty Industrial Internship — Cloud Health Systems",
    description:
      "4-week industry immersion program for faculty members to gain hands-on exposure to scalable cloud architectures, CI/CD, and EHR integration.",
    institution: institution._id,
  });

  await CollaborationActivity.create({
    postedBy: industry._id,
    postedByRole: "industry",
    type: "industrial_training",
    title: "Industrial Training: Smart Automation in Ayush & Clinical Informatics",
    description:
      "A joint training initiative by Vertex Systems & AIIA to upskill academic faculty and research scholars in AI-driven health data analysis.",
    institution: aiiaInstitution._id,
  });

  await CollaborationActivity.create({
    postedBy: academician._id,
    postedByRole: "academician",
    type: "fdp",
    title: "Faculty Development Programme — Modern Web Architectures",
    description:
      "A 3-day FDP for CS and Health Informatics faculty covering API design, security, and automated verification workflows.",
    institution: institution._id,
  });

  await CollaborationActivity.create({
    postedBy: academician._id,
    postedByRole: "academician",
    type: "innovation_challenge",
    title: "All India Ayush Smart Automation Challenge 2026",
    description:
      "Industry-sponsored hackathon seeking automated solutions for medicinal plant cataloging, clinical record indexing, and quality assurance.",
    institution: aiiaInstitution._id,
  });

  // Notifications
  await Notification.insertMany([
    {
      user: student._id,
      type: "application_status",
      title: "Interview Scheduled",
      message: 'Your application for "Frontend Engineering Intern" has been shortlisted for technical interview.',
      link: "/applications",
    },
    {
      user: student._id,
      type: "milestone_assigned",
      title: "New Internship Milestone Assigned",
      message: 'Mentor Sanjay Iyer assigned "Milestone 1 — Component Library Setup".',
      link: "/applications",
    },
  ]);

  console.log("[seed] Done! Populated rich domain data for Ministry of Ayush / AIIA & Engineering.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
