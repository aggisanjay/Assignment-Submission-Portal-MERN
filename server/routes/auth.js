import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ─── Generate JWT ────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });


// ─── Register ────────────────────────────────────────────
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be 6+ characters"),
    body("role")
      .isIn(["student", "teacher"])
      .withMessage("Role must be student or teacher"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: errors.array()[0].msg });
      }

      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email already registered" });
      }

      const user = await User.create({ name, email, password, role });
      const token = signToken(user._id);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);


// ─── Login ───────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.comparePassword(password))) {
        return res
          .status(401)
          .json({ message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(403).json({
          message: "Account deactivated. Contact admin.",
        });
      }

      const token = signToken(user._id);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);


// ─── Get Current User ─────────────────────────────────────
router.get("/me", protect, (req, res) => {
  const { _id, name, email, role, createdAt } = req.user;
  res.json({ id: _id, name, email, role, createdAt });
});


// ─── Update Profile ───────────────────────────────────────
router.put(
  "/profile",
  protect,
  [body("name").optional().trim().notEmpty()],
  async (req, res) => {
    try {
      const updates = {};

      if (req.body.name) updates.name = req.body.name;

      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res
            .status(400)
            .json({ message: "Password must be 6+ characters" });
        }
        updates.password = req.body.password;
      }

      const user = await User.findById(req.user._id);
      Object.assign(user, updates);
      await user.save();

      res.json({
        message: "Profile updated",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;
