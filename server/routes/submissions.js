import express from "express";

import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import { protect, restrictTo } from "../middleware/auth.js";
import {
  setUploadFolder,
  uploadSubmission,
} from "../middleware/upload.js";

const router = express.Router();

// ─── Submit Assignment (Student) ─────────────────────────
router.post(
  "/",
  protect,
  restrictTo("student"),
  setUploadFolder("uploads/submissions"),
  uploadSubmission,
  async (req, res) => {
    try {
      const { assignmentId, comments } = req.body;

      const assignment = await Assignment.findById(assignmentId);

      if (!assignment || !assignment.isActive) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check existing submission
      const existing = await Submission.findOne({
        assignment: assignmentId,
        student: req.user._id,
      });

      if (existing) {
        return res.status(400).json({
          message: "You have already submitted this assignment",
        });
      }

      // Check deadline
      const isLate = new Date() > new Date(assignment.deadline);

      const files = (req.files || []).map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));

      if (files.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one file is required" });
      }

      const submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        files,
        comments,
        status: isLate ? "late" : "submitted",
      });

      await submission.populate(
        "assignment",
        "title subject deadline maxMarks"
      );

      res.status(201).json({ submission, isLate });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          message: "You have already submitted this assignment",
        });
      }

      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ─── Get My Submissions ──────────────────────────────────
router.get("/my", protect, restrictTo("student"), async (req, res) => {
  try {
    const submissions = await Submission.find({
      student: req.user._id,
    })
      .populate(
        "assignment",
        "title subject deadline maxMarks teacher"
      )
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Get Single Submission ───────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("student", "name email")
      .populate("assignment", "title subject deadline maxMarks")
      .populate("gradedBy", "name");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Students only see their own
    if (
      req.user.role === "student" &&
      submission.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Grade Submission ────────────────────────────────────
router.put(
  "/:id/grade",
  protect,
  restrictTo("teacher", "admin"),
  async (req, res) => {
    try {
      const { marks, feedback } = req.body;

      const submission = await Submission.findById(req.params.id)
        .populate("assignment");

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      if (marks < 0 || marks > submission.assignment.maxMarks) {
        return res.status(400).json({
          message: `Marks must be between 0 and ${submission.assignment.maxMarks}`,
        });
      }

      submission.marks = Number(marks);
      submission.feedback = feedback || "";
      submission.status = "graded";
      submission.gradedBy = req.user._id;
      submission.gradedAt = new Date();

      await submission.save();

      await submission.populate("student", "name email");
      await submission.populate("gradedBy", "name");

      res.json(submission);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ─── Return Submission ───────────────────────────────────
router.put(
  "/:id/return",
  protect,
  restrictTo("teacher", "admin"),
  async (req, res) => {
    try {
      const submission = await Submission.findByIdAndUpdate(
        req.params.id,
        { status: "returned", feedback: req.body.feedback },
        { new: true }
      ).populate("student", "name email");

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      res.json(submission);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;
