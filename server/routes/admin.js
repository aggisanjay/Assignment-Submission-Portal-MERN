import express from "express";

import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// ─── All admin routes protected ──────────────────────────
router.use(protect, restrictTo("admin"));


// ─── Dashboard Stats ─────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalAssignments,
      totalSubmissions,
      gradedSubmissions,
      lateSubmissions,
      recentSubmissions,
      recentAssignments,
    ] = await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      User.countDocuments({ role: "teacher", isActive: true }),
      Assignment.countDocuments({ isActive: true }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: "graded" }),
      Submission.countDocuments({ status: "late" }),
      Submission.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate("student", "name email")
        .populate("assignment", "title subject"),
      Assignment.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("teacher", "name"),
    ]);

    const avgResult = await Submission.aggregate([
      { $match: { status: "graded", marks: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$marks" } } },
    ]);

    const averageMarks = avgResult[0]?.avg?.toFixed(1) || 0;

    res.json({
      overview: {
        totalStudents,
        totalTeachers,
        totalAssignments,
        totalSubmissions,
        gradedSubmissions,
        lateSubmissions,
        averageMarks,
        pendingGrading: totalSubmissions - gradedSubmissions,
      },
      recentSubmissions,
      recentAssignments,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ─── Get All Users ───────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ─── Create User ─────────────────────────────────────────
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ─── Toggle User Active ──────────────────────────────────
router.put("/users/:id/toggle", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ─── Delete User ─────────────────────────────────────────
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ─── Get All Submissions ─────────────────────────────────
router.get("/submissions", async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("student", "name email")
      .populate("assignment", "title subject maxMarks deadline")
      .populate("gradedBy", "name")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
