import PortfolioItem from "../models/PortfolioItem.js";
import User from "../models/User.js";
import { createPortfolioItemSchema, reviewPortfolioItemSchema } from "../shared/validation/portfolioSchemas.js";
import { notify } from "../services/notificationService.js";

export async function createPortfolioItem(req, res, next) {
  try {
    const { error, value } = createPortfolioItemSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const item = await PortfolioItem.create({ ...value, student: req.user._id });
    const populated = await item.populate("skillsDemonstrated", "name category");
    res.status(201).json({ item: populated });
  } catch (err) {
    next(err);
  }
}

export async function listMyPortfolio(req, res, next) {
  try {
    const items = await PortfolioItem.find({ student: req.user._id })
      .populate("skillsDemonstrated", "name category")
      .sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

// Lets an industry user review an applicant's portfolio when assessing a match.
export async function listStudentPortfolio(req, res, next) {
  try {
    const items = await PortfolioItem.find({ student: req.params.studentId })
      .populate("skillsDemonstrated", "name category")
      .sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

// Institution admin's review queue — every pending item from a student at
// their own institution. Platform admin sees the queue across every
// institution (a global superuser view, no institution scoping).
export async function listVerificationQueue(req, res, next) {
  try {
    let studentFilter = { role: "student" };

    if (req.user.role === "institution_admin") {
      const institutionId = req.user.institutionManaged;
      if (!institutionId) {
        return res.status(400).json({ error: "No institution is assigned to this admin account" });
      }
      studentFilter.institution = institutionId;
    }

    const students = await User.find(studentFilter).select("_id");
    const studentIds = students.map((s) => s._id);

    const items = await PortfolioItem.find({ student: { $in: studentIds }, verificationStatus: "pending" })
      .populate("student", "name branch graduationYear institution")
      .populate("skillsDemonstrated", "name category")
      .sort({ createdAt: 1 });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function reviewPortfolioItem(req, res, next) {
  try {
    const { error, value } = reviewPortfolioItemSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const item = await PortfolioItem.findById(req.params.id).populate("student", "institution");
    if (!item) return res.status(404).json({ error: "Portfolio item not found" });

    if (
      req.user.role === "institution_admin" &&
      item.student.institution?.toString() !== req.user.institutionManaged?.toString()
    ) {
      return res.status(403).json({ error: "This item belongs to a student outside your institution" });
    }

    item.verificationStatus = value.verificationStatus;
    item.reviewNote = value.reviewNote;
    item.reviewedBy = req.user._id;
    item.reviewedAt = new Date();
    await item.save();

    await notify(item.student._id, {
      type: "portfolio_reviewed",
      title: `Portfolio item ${value.verificationStatus}`,
      message: `"${item.title}" was marked ${value.verificationStatus} by your institution.${
        value.reviewNote ? ` Note: ${value.reviewNote}` : ""
      }`,
      link: "/portfolio",
    });

    res.json({ item });
  } catch (err) {
    next(err);
  }
}
