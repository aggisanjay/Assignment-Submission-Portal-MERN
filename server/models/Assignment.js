import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    maxMarks: {
      type: Number,
      required: [true, "Max marks are required"],
      min: 1,
    },
    allowedFileTypes: {
      type: [String],
      default: ["pdf", "doc", "docx", "txt", "zip"],
    },
    maxFileSize: {
      type: Number,
      default: 10, // MB
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── Virtual: past deadline ──────────────────────────────
assignmentSchema.virtual("isPastDeadline").get(function () {
  return new Date() > this.deadline;
});

assignmentSchema.set("toJSON", { virtuals: true });

// ─── Export (Vercel-safe) ────────────────────────────────
export default mongoose.models.Assignment ||
  mongoose.model("Assignment", assignmentSchema);
