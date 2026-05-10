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
  roleMiddleware(["educator", "admin"]),
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
      const publicId = `${publicIdBase}_${Date.now()}`;

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
// POST /api/upload/avatar
// Upload a profile picture to Cloudinary (any authenticated user)
// Body (multipart): file
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/avatar",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided." });
      }

      const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedImageTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Only PNG, JPEG, and WebP images are allowed." });
      }

      const userId = req.user._id.toString();
      const folder = `edupath/avatars/${userId}`;
      const publicId = `avatar_${Date.now()}`;

      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: "image",
        folder,
        public_id: publicId,
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error("Avatar upload error:", err);
      res.status(500).json({ message: err.message || "Avatar upload failed." });
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
  roleMiddleware(["educator", "admin"]),
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/upload/download
// Proxy a Cloudinary file to the browser with the correct Content-Disposition
// so the browser downloads it with the right filename and extension.
//
// Using fl_attachment in the Cloudinary URL requires strict transformations to
// be whitelisted, which causes 400 errors on many accounts. Proxying through
// the backend avoids that entirely and works on all Cloudinary plans.
//
// Query params:
//   url      – the original Cloudinary secure_url (required)
//   filename – desired download filename including extension (optional)
// ─────────────────────────────────────────────────────────────────────────────
// No authMiddleware here — <a href> links cannot send Authorization headers.
// Security is enforced by the Cloudinary-URL-only check below.
router.get("/download", async (req, res) => {
  const { url, filename } = req.query;

  if (!url) return res.status(400).json({ message: "url query param is required." });

  // Security: only proxy Cloudinary URLs — never allow arbitrary SSRF
  if (!url.startsWith("https://res.cloudinary.com/")) {
    return res.status(403).json({ message: "Only Cloudinary URLs are allowed." });
  }

  try {
    const axios = require("axios");

    // Strip any fl_attachment transformation we may have injected previously
    // so we fetch the raw file directly from Cloudinary
    const cleanUrl = url.replace(/\/fl_attachment:[^/]+/, "");

    const response = await axios.get(cleanUrl, { responseType: "stream" });

    const contentType = response.headers["content-type"] || "application/octet-stream";
    const safeFilename = ((filename || "download")
      .replace(/[^\w.\- ]/g, "_")
      .trim()) || "download";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    if (response.headers["content-length"]) {
      res.setHeader("Content-Length", response.headers["content-length"]);
    }

    response.data.pipe(res);
  } catch (err) {
    console.error("Download proxy error:", err.message);
    res.status(502).json({ message: "Failed to fetch file from Cloudinary." });
  }
});

module.exports = router;
