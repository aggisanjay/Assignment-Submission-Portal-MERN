import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ─── Fix __dirname in ES Modules ─────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.options("*", cors()); // important for preflight

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Database ────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ─── Routes ──────────────────────────────────────────────
import authRoutes from "./routes/auth.js";
import assignmentRoutes from "./routes/assignments.js";
import submissionRoutes from "./routes/submissions.js";
import adminRoutes from "./routes/admin.js";

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() })
);

// ─── Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
