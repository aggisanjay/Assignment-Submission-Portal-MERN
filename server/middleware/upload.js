import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ─── Fix __dirname for ES modules ────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Ensure uploads directory exists ─────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ─── Storage engine ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || "uploads/general";
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ─── File filter ─────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
    "image/jpeg",
    "image/png",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ─── Dynamic upload folder middleware ────────────────────
export const setUploadFolder = (folder) => (req, res, next) => {
  req.uploadFolder = folder;
  next();
};

export const uploadSubmission = upload.array("files", 5);
export const uploadAttachment = upload.array("attachments", 3);

export default upload;
