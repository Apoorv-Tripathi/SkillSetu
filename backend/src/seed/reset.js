import mongoose from "mongoose";
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
import SkillGapRecord from "../models/SkillGapRecord.js";
import MentorshipRequest from "../models/MentorshipRequest.js";
import CollaborationActivity from "../models/CollaborationActivity.js";
import Notification from "../models/Notification.js";

// Deletes every document from every SkillSetu collection, leaving the
// database structurally intact (collections/indexes stay) but empty.
// Run with: npm run reset   (from /backend)
// Follow with: npm run seed  to repopulate demo data.
async function reset() {
  await connectDB();

  const models = [
    User,
    Institution,
    Skill,
    Assessment,
    AssessmentResult,
    Opportunity,
    Application,
    Milestone,
    PortfolioItem,
    SkillGapRecord,
    MentorshipRequest,
    CollaborationActivity,
    Notification,
  ];

  const results = await Promise.all(
    models.map(async (Model) => {
      const { deletedCount } = await Model.deleteMany({});
      return { collection: Model.collection.collectionName, deletedCount };
    })
  );

  console.log("[reset] cleared collections:");
  for (const r of results) {
    console.log(`  - ${r.collection}: ${r.deletedCount} document(s) removed`);
  }
  console.log("[reset] done. Run `npm run seed` to repopulate demo data.");

  await mongoose.disconnect();
}

reset().catch((err) => {
  console.error("[reset] failed", err);
  process.exit(1);
});
