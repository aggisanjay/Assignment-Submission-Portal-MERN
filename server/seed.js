/**
 * Seed script to populate the database with demo data
 * Run: node seed.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Assignment from "./models/Assignment.js";
import Submission from "./models/Submission.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // ─── Clear existing data ───────────────────────────────
  await User.deleteMany({});
  await Assignment.deleteMany({});
  await Submission.deleteMany({});
  console.log("Cleared existing data");

  // ─── Create Users ──────────────────────────────────────
  const admin = await User.create({
    name: "Admin User",
    email: "admin@demo.com",
    password: "demo123",
    role: "admin",
  });

  const teacher = await User.create({
    name: "Prof. Sarah Johnson",
    email: "teacher@demo.com",
    password: "demo123",
    role: "teacher",
  });

  const teacher2 = await User.create({
    name: "Dr. Michael Chen",
    email: "teacher2@demo.com",
    password: "demo123",
    role: "teacher",
  });

  const student = await User.create({
    name: "Alice Smith",
    email: "student@demo.com",
    password: "demo123",
    role: "student",
  });

  const student2 = await User.create({
    name: "Bob Williams",
    email: "student2@demo.com",
    password: "demo123",
    role: "student",
  });

  console.log("Created users");

  // ─── Create Assignments ────────────────────────────────
  const now = new Date();

  const assignment1 = await Assignment.create({
    title: "Introduction to Data Structures",
    description:
      "Implement a Binary Search Tree with insert, delete, and search operations.",
    subject: "Computer Science",
    teacher: teacher._id,
    deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    maxMarks: 100,
  });

  const assignment2 = await Assignment.create({
    title: "Calculus Problem Set 3",
    description:
      "Solve all 20 problems in the attached PDF. Show all work.",
    subject: "Mathematics",
    teacher: teacher2._id,
    deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    maxMarks: 50,
  });

  const assignment3 = await Assignment.create({
    title: "Essay: Climate Change Solutions",
    description:
      "Write a 1500-word essay discussing innovative climate solutions.",
    subject: "Environmental Science",
    teacher: teacher._id,
    deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    maxMarks: 75,
  });

  const assignment4 = await Assignment.create({
    title: "Database Design Project",
    description:
      "Design a normalized relational database for a library system.",
    subject: "Database Systems",
    teacher: teacher2._id,
    deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    maxMarks: 100,
  });

  console.log("Created assignments");

  // ─── Create Submissions ────────────────────────────────
  await Submission.create({
    assignment: assignment2._id,
    student: student._id,
    files: [
      {
        filename: "calculus_ps3.pdf",
        originalName: "Calculus Problem Set 3 - Alice Smith.pdf",
        path: "uploads/submissions/calculus_ps3.pdf",
        size: 245760,
        mimetype: "application/pdf",
      },
    ],
    comments: "Problems 15-18 were challenging.",
    status: "graded",
    marks: 43,
    feedback: "Great work!",
    gradedBy: teacher2._id,
    gradedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  });

  await Submission.create({
    assignment: assignment3._id,
    student: student._id,
    files: [
      {
        filename: "climate_essay.docx",
        originalName: "Climate Change Essay - Alice Smith.docx",
        path: "uploads/submissions/climate_essay.docx",
        size: 52480,
        mimetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    ],
    comments: "Submitted on the deadline day.",
    status: "submitted",
  });

  await Submission.create({
    assignment: assignment2._id,
    student: student2._id,
    files: [
      {
        filename: "bob_calculus.pdf",
        originalName: "Calculus PS3 - Bob Williams.pdf",
        path: "uploads/submissions/bob_calculus.pdf",
        size: 198400,
        mimetype: "application/pdf",
      },
    ],
    status: "submitted",
  });

  console.log("Created submissions");

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Demo Login Credentials:");
  console.log("  Admin:    admin@demo.com   / demo123");
  console.log("  Teacher:  teacher@demo.com / demo123");
  console.log("  Student:  student@demo.com / demo123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
