const express = require("express");
const multer  = require("multer");
const cloudinary = require("../cloudinary");
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const router = express.Router();

// ── Multer: keep file in memory (no disk write) ──────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "video/mp4", "video/webm", "video/quicktime",           // Video
    "application/pdf",                                        // PDF / Certificate
    "application/vnd.ms-powerpoint",                          // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/msword",                                     // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",   // .docx
    "image/png", "image/jpeg", "image/webp",                  // Certificate images
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
});

// ── Helper: determine Cloudinary resource_type from mime ────────────────────
const getResourceType = (mimetype) => {
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("image/")) return "image";
  return "raw"; // PDFs, PPT, DOCX → raw
};

// ── Helper: upload buffer to Cloudinary via stream ──────────────────────────
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};

// ── Helper: build a clean, URL-safe filename from arbitrary text ─────────────
function sanitizeName(raw) {
  return (raw || "upload")
    .replace(/\.[^.]+$/, "")          // strip file extension if present
    .replace(/[^a-z0-9\s_-]/gi, "")  // keep alphanumeric, space, dash, underscore
    .trim()
    .replace(/\s+/g, "_")             // spaces → underscores
    .toLowerCase()
    .slice(0, 60) || "upload";        // max 60 chars, never empty
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload/content
// Upload a single course content file (video, PDF, PPT, doc, image)
// Body (multipart): file, contentType, itemName
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/content",
  authMiddleware,
  roleMiddleware(["educator", "admin", "reviewer"]),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided." });
      }

      // Prefer the user-entered item name; fall back to the original filename
      const rawName    = (req.body.itemName || "").trim() || req.file.originalname;
      const contentType = (req.body.contentType || "Document").trim();
      const friendlyName = rawName;   // keep the full original as display name

      const resourceType = getResourceType(req.file.mimetype);

      // Folder: edupath/courses/<educator-email>/<contentType>/
      const safeEmail = (req.user.email || "unknown").replace(/[^a-z0-9]/gi, "_");
      const folder = `edupath/courses/${safeEmail}/${contentType.toLowerCase()}`;

      // Build a readable public_id so Cloudinary doesn't fall back to "file_<random>"
      const publicIdBase = sanitizeName(rawName);
      // 🟢 FIXED: Grab the original file extension (e.g., "pdf", "pptx")
      const ext = req.file.originalname.includes(".")
        ? req.file.originalname.split(".").pop().toLowerCase()
        : "";

      // 🟢 FIXED: If it's a "raw" file, Cloudinary REQUIRES the extension in the public_id!
      let publicId = `${publicIdBase}_${Date.now()}`;
      if (resourceType === "raw" && ext) {
        publicId = `${publicId}.${ext}`;
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: resourceType,
        folder,
        public_id: publicId,          // explicit id = readable name in Cloudinary
        overwrite: false,
        // Allow streaming playback for videos
        ...(resourceType === "video" && {
          eager: [{ streaming_profile: "full_hd", format: "m3u8" }],
          eager_async: true,
        }),
      });

      // Derive format: Cloudinary may omit it for raw resources, so fall back
      // to the file extension from the original name.
      const format =
        result.format ||
        (req.file.originalname.includes(".")
          ? req.file.originalname.split(".").pop().toLowerCase()
          : "");

      res.json({
        success: true,
        item: {
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          name: friendlyName,
          type: contentType,
          url: result.secure_url,
          publicId: result.public_id,
          resourceType,
          bytes: result.bytes,
          duration: result.duration || null, // filled for videos
          format,
        },
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: err.message || "Upload failed." });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/upload/content
// Delete a file from Cloudinary by publicId
// Body: { publicId, resourceType }
// ─────────────────────────────────────────────────────────────────────────────
router.delete(
  "/content",
  authMiddleware,
  roleMiddleware(["educator", "admin", "reviewer"]),
  async (req, res) => {
    try {
      const { publicId, resourceType = "raw" } = req.body;
      if (!publicId) return res.status(400).json({ message: "publicId is required." });

      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      res.json({ success: true });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ message: err.message || "Delete failed." });
    }
  }
);

module.exports = router;
