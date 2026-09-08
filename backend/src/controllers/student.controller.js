import AssessmentResult from "../models/AssessmentResult.js";
import SkillGapRecord from "../models/SkillGapRecord.js";
import Opportunity from "../models/Opportunity.js";
import PortfolioItem from "../models/PortfolioItem.js";
import User from "../models/User.js";

// Aggregates every assessment result the student has ever submitted into one
// per-skill average — categorized by skill type.
export async function getMySkillProfile(req, res, next) {
  try {
    const results = await AssessmentResult.find({ student: req.user._id }).populate(
      "skillScores.skill",
      "name category skillType"
    );

    const bySkill = new Map();
    for (const result of results) {
      for (const { skill, score } of result.skillScores) {
        if (!skill) continue;
        const key = skill._id.toString();
        const entry = bySkill.get(key) || { skill, total: 0, count: 0 };
        entry.total += score;
        entry.count += 1;
        bySkill.set(key, entry);
      }
    }

    const profile = Array.from(bySkill.values())
      .map(({ skill, total, count }) => ({
        skill,
        averageScore: Math.round((total / count) * 10) / 10,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    res.json({ profile, assessmentsTaken: results.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Intelligent Career Guidance & Roadmap generator
 */
export async function getCareerRoadmap(req, res, next) {
  try {
    const studentId = req.user._id;
    const [user, gapRecords, portfolioItems, assessments] = await Promise.all([
      User.findById(studentId),
      SkillGapRecord.find({ student: studentId }).populate("skill"),
      PortfolioItem.find({ student: studentId }),
      AssessmentResult.find({ student: studentId }),
    ]);

    const verifiedPortfolioCount = portfolioItems.filter((p) => p.verificationStatus === "verified").length;
    const assessmentsTaken = assessments.length;

    // Career paths library
    const CAREER_PATHS = [
      {
        id: "fullstack",
        title: "Full Stack Software Engineer",
        domain: "Technology & Software",
        demand: "Very High",
        coreSkills: ["React", "JavaScript", "Node.js", "SQL", "Communication"],
        recommendedCertifications: ["Full Stack Web Development", "Cloud Architecture Fundamentals"],
      },
      {
        id: "data_analyst",
        title: "Health & Business Data Analyst",
        domain: "Data & Healthcare",
        demand: "High",
        coreSkills: ["SQL", "Problem Solving", "Communication", "Health Informatics"],
        recommendedCertifications: ["Advanced SQL for Analytics", "Healthcare Data Standards"],
      },
      {
        id: "ayush_researcher",
        title: "Ayurvedic Clinical Research Specialist",
        domain: "Ayush & Healthcare",
        demand: "Very High",
        coreSkills: ["Clinical Trials", "Pharmacovigilance", "Herbal Standardization", "Research Methodology"],
        recommendedCertifications: ["AIIA Clinical Trial Protocol", "GCP Guidelines in Ayush"],
      },
      {
        id: "formulation_scientist",
        title: "Ayurvedic Formulation Scientist",
        domain: "Ayush & Pharma",
        demand: "High",
        coreSkills: ["Ayurvedic Formulations", "Herbal Standardization", "Problem Solving"],
        recommendedCertifications: ["Herbal Drug Standardization & Quality Assurance"],
      },
    ];

    const currentScoresBySkill = new Map();
    for (const rec of gapRecords) {
      if (rec.skill) {
        currentScoresBySkill.set(rec.skill.name.toLowerCase(), rec.currentScore);
      }
    }

    const evaluatedPaths = CAREER_PATHS.map((path) => {
      let matchedCount = 0;
      const skillBreakdown = path.coreSkills.map((sName) => {
        const score = currentScoresBySkill.get(sName.toLowerCase()) || 0;
        const met = score >= 3.0;
        if (met) matchedCount++;
        return { skill: sName, score, met };
      });
      const matchPercentage = Math.round((matchedCount / path.coreSkills.length) * 100);

      return {
        ...path,
        matchPercentage,
        skillBreakdown,
      };
    });

    evaluatedPaths.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Selected path (defaults to highest match or user preference)
    const preferredRoleId = user.targetRoles?.[0] || evaluatedPaths[0]?.id;
    const activePath = evaluatedPaths.find((p) => p.id === preferredRoleId) || evaluatedPaths[0];

    // Compute 5-stage progress
    const stages = [
      {
        step: 1,
        title: "Skill Assessment & Baseline",
        description: "Complete technical, aptitude, and soft skills questionnaires",
        status: assessmentsTaken > 0 ? "completed" : "current",
        metrics: `${assessmentsTaken} assessment${assessmentsTaken === 1 ? "" : "s"} completed`,
      },
      {
        step: 2,
        title: "Core Skill-Gap Remediation",
        description: "Engage in targeted learning programs to close identified gaps",
        status:
          assessmentsTaken === 0
            ? "upcoming"
            : activePath.matchPercentage >= 70
            ? "completed"
            : "current",
        metrics: `${activePath.matchPercentage}% role alignment`,
      },
      {
        step: 3,
        title: "Verified Portfolio & Credentials",
        description: "Submit projects, certifications, and achievements for institutional verification",
        status:
          assessmentsTaken === 0
            ? "upcoming"
            : verifiedPortfolioCount >= 2
            ? "completed"
            : verifiedPortfolioCount > 0
            ? "current"
            : "upcoming",
        metrics: `${verifiedPortfolioCount} verified credential${verifiedPortfolioCount === 1 ? "" : "s"}`,
      },
      {
        step: 4,
        title: "Industry Internship / Apprenticeship",
        description: "Gain practical exposure with industry mentors and evaluate real-world milestones",
        status: verifiedPortfolioCount >= 1 && activePath.matchPercentage >= 50 ? "current" : "upcoming",
        metrics: "Matching active openings",
      },
      {
        step: 5,
        title: "Placement Readiness & Job Offers",
        description: "Final recruitment drives, campus placements, and direct industry hiring",
        status: activePath.matchPercentage >= 75 && verifiedPortfolioCount >= 2 ? "current" : "upcoming",
        metrics: activePath.matchPercentage >= 75 ? "Placement Ready" : "Building Competence",
      },
    ];

    // Find recommended training & opportunities
    const recommendedOpportunities = await Opportunity.find({ status: "open" })
      .limit(6)
      .populate("requiredSkills.skill");

    res.json({
      activePath,
      evaluatedPaths,
      stages,
      careerInterests: user.careerInterests || [],
      targetRoles: user.targetRoles || [],
      recommendedOpportunities,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update student career interests and target roles
 */
export async function updateCareerInterests(req, res, next) {
  try {
    const { careerInterests, targetRoles } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(careerInterests ? { careerInterests } : {}),
        ...(targetRoles ? { targetRoles } : {}),
      },
      { new: true }
    );
    res.json({ careerInterests: user.careerInterests, targetRoles: user.targetRoles });
  } catch (err) {
    next(err);
  }
}
