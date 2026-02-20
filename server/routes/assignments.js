import express from "express";
import path from "path";

import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import { protect, restrictTo } from "../middleware/auth.js";
import {
  setUploadFolder,
  uploadAttachment,
} from "../middleware/upload.js";

const router = express.Router();

// ─── Get All Assignments ─────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.user.role === "teacher") {
      filter.teacher = req.user._id;
    }

    const assignments = await Assignment.find(filter)
      .populate("teacher", "name email")
      .sort({ deadline: 1 });

    if (req.user.role === "student") {
      const assignmentIds = assignments.map((a) => a._id);

      const submissions = await Submission.find({
        student: req.user._id,
        assignment: { $in: assignmentIds },
      }).select("assignment status marks");

      const subMap = {};
      submissions.forEach((s) => {
        subMap[s.assignment.toString()] = s;
      });

      return res.json(
        assignments.map((a) => ({
          ...a.toJSON(),
          mySubmission: subMap[a._id.toString()] || null,
        }))
      );
    }

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Get Single Assignment ───────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("teacher", "name email");

    if (!assignment || !assignment.isActive) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    let mySubmission = null;

    if (req.user.role === "student") {
      mySubmission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user._id,
      });
    }

    res.json({ ...assignment.toJSON(), mySubmission });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Create Assignment ───────────────────────────────────
router.post(
  "/",
  protect,
  restrictTo("teacher", "admin"),
  setUploadFolder("uploads/assignments"),
  uploadAttachment,
  async (req, res) => {
    try {
      const {
        title,
        description,
        subject,
        deadline,
        maxMarks,
        allowedFileTypes,
        maxFileSize,
      } = req.body;

      const attachments = (req.files || []).map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
      }));

      const assignment = await Assignment.create({
        title,
        description,
        subject,
        teacher: req.user._id,
        deadline: new Date(deadline),
        maxMarks: Number(maxMarks),
        allowedFileTypes: allowedFileTypes
          ? JSON.parse(allowedFileTypes)
          : undefined,
        maxFileSize: maxFileSize ? Number(maxFileSize) : undefined,
        attachments,
      });

      await assignment.populate("teacher", "name email");

      res.status(201).json(assignment);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ─── Update Assignment ───────────────────────────────────
router.put("/:id", protect, restrictTo("teacher", "admin"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (
      req.user.role === "teacher" &&
      assignment.teacher.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this assignment" });
    }

    const { title, description, subject, deadline, maxMarks, isActive } =
      req.body;

    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (subject) assignment.subject = subject;
    if (deadline) assignment.deadline = new Date(deadline);
    if (maxMarks) assignment.maxMarks = Number(maxMarks);
    if (isActive !== undefined) assignment.isActive = isActive;

    await assignment.save();

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Delete Assignment ───────────────────────────────────
router.delete("/:id", protect, restrictTo("teacher", "admin"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (
      req.user.role === "teacher" &&
      assignment.teacher.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    assignment.isActive = false;
    await assignment.save();

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Get Submissions for Assignment ──────────────────────
router.get(
  "/:id/submissions",
  protect,
  restrictTo("teacher", "admin"),
  async (req, res) => {
    try {
      const submissions = await Submission.find({
        assignment: req.params.id,
      })
        .populate("student", "name email")
        .sort({ submittedAt: -1 });

      const total = await Assignment.findById(req.params.id).select(
        "maxMarks"
      );

      res.json({ submissions, maxMarks: total?.maxMarks });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;
