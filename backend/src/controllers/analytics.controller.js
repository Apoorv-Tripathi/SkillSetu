import User from "../models/User.js";
import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import Skill from "../models/Skill.js";
import SkillGapRecord from "../models/SkillGapRecord.js";
import Milestone from "../models/Milestone.js";

/**
 * Institutional & Platform Placement Readiness
 */
export async function getPlacementReadiness(req, res) {
  try {
    const institutionId = req.user.role === "institution_admin" ? req.user.institutionManaged : req.query.institutionId;
    const query = { role: "student" };
    if (institutionId) {
      query.institution = institutionId;
    }

    const students = await User.find(query).select("_id name branch graduationYear");
    const studentIds = students.map((s) => s._id);

    // Get skill gap records for these students
    const records = await SkillGapRecord.find({ student: { $in: studentIds } });
    const recordsByStudent = new Map();
    for (const rec of records) {
      const sId = rec.student.toString();
      if (!recordsByStudent.has(sId)) {
        recordsByStudent.set(sId, []);
      }
      recordsByStudent.get(sId).push(rec);
    }

    // Classify students
    let readyCount = 0;
    let developingCount = 0;
    let earlyCount = 0;

    const branchMap = new Map();

    for (const student of students) {
      const sId = student._id.toString();
      const recs = recordsByStudent.get(sId) || [];
      const branch = student.branch || "General";

      if (!branchMap.has(branch)) {
        branchMap.set(branch, { total: 0, ready: 0, developing: 0 });
      }
      const bStat = branchMap.get(branch);
      bStat.total++;

      if (recs.length === 0) {
        earlyCount++;
      } else {
        const avgScore = recs.reduce((acc, r) => acc + r.currentScore, 0) / recs.length;
        if (avgScore >= 3.2) {
          readyCount++;
          bStat.ready++;
        } else {
          developingCount++;
          bStat.developing++;
        }
      }
    }

    const branchWise = Array.from(branchMap.entries()).map(([branch, stat]) => ({
      branch,
      total: stat.total,
      ready: stat.ready,
      developing: stat.developing,
      readinessRate: stat.total > 0 ? Math.round((stat.ready / stat.total) * 100) : 0,
    }));

    const total = students.length;
    const overallReadiness = total > 0 ? Math.round((readyCount / total) * 100) : 0;

    return res.json({
      totalStudents: total,
      readyCount,
      developingCount,
      earlyCount,
      overallReadiness,
      branchWise,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Industry Skill Demand Trends
 */
export async function getSkillDemandTrends(req, res) {
  try {
    const opportunities = await Opportunity.find({ status: "open" }).populate("requiredSkills.skill");
    const skillCounts = new Map();

    for (const opp of opportunities) {
      for (const rs of opp.requiredSkills) {
        if (!rs.skill) continue;
        const sId = rs.skill._id.toString();
        if (!skillCounts.has(sId)) {
          skillCounts.set(sId, {
            skill: rs.skill,
            demandCount: 0,
            totalRequired: 0,
          });
        }
        const entry = skillCounts.get(sId);
        entry.demandCount++;
        entry.totalRequired += rs.minProficiency;
      }
    }

    const trends = [];
    for (const [sId, entry] of skillCounts.entries()) {
      // Calculate average student score for this skill
      const records = await SkillGapRecord.find({ skill: sId });
      const avgStudentScore =
        records.length > 0
          ? Number((records.reduce((acc, r) => acc + r.currentScore, 0) / records.length).toFixed(1))
          : 0;
      const avgRequired = Number((entry.totalRequired / entry.demandCount).toFixed(1));

      trends.push({
        skillId: sId,
        skillName: entry.skill.name,
        category: entry.skill.category,
        skillType: entry.skill.skillType || "technical",
        demandCount: entry.demandCount,
        avgRequired,
        avgStudentScore,
        gap: Number((avgRequired - avgStudentScore).toFixed(1)),
      });
    }

    trends.sort((a, b) => b.demandCount - a.demandCount);

    return res.json({ trends: trends.slice(0, 10) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Internship & Apprenticeship Outcomes
 */
export async function getInternshipOutcomes(req, res) {
  try {
    const [totalOpportunities, applications, milestones] = await Promise.all([
      Opportunity.find(),
      Application.find().populate("opportunity"),
      Milestone.find(),
    ]);

    const byType = {
      internship: 0,
      apprenticeship: 0,
      job: 0,
      training_program: 0,
      live_project: 0,
    };

    for (const o of totalOpportunities) {
      if (byType[o.type] !== undefined) {
        byType[o.type]++;
      }
    }

    const applicationStatusCounts = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    for (const app of applications) {
      if (applicationStatusCounts[app.status] !== undefined) {
        applicationStatusCounts[app.status]++;
      }
    }

    const evaluatedMilestones = milestones.filter((m) => m.status === "evaluated").length;
    const milestoneCompletionRate =
      milestones.length > 0 ? Math.round((evaluatedMilestones / milestones.length) * 100) : 100;

    return res.json({
      opportunitiesByType: byType,
      applicationStatusCounts,
      totalApplications: applications.length,
      milestones: {
        total: milestones.length,
        evaluated: evaluatedMilestones,
        completionRate: milestoneCompletionRate,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
