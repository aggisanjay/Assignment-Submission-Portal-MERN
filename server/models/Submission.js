import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    files: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimetype: String,
      },
    ],
    comments: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["submitted", "late", "graded", "returned"],
      default: "submitted",
    },
    marks: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ─── Unique: one submission per student per assignment ───
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

// ─── Export (Serverless-safe) ─────────────────────────────
export default mongoose.models.Submission ||
  mongoose.model("Submission", submissionSchema);
