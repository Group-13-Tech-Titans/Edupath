const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const authMiddleware = require("../../auth/middleware/authMiddleware");
const roleMiddleware = require("../../auth/middleware/roleMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "video/mp4", "video/webm", "video/quicktime",
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png", "image/jpeg", "image/webp"
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});

const getResourceType = (mimetype) => {
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("image/")) return "image";
  return "raw";
};

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};

function sanitizeName(raw) {
  return (raw || "upload")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9\s_-]/gi, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase()
    .slice(0, 60) || "upload";
}

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

      const rawName = (req.body.itemName || "").trim() || req.file.originalname;
      const contentType = (req.body.contentType || "Document").trim();
      const friendlyName = rawName;

      const resourceType = getResourceType(req.file.mimetype);
      const safeEmail = (req.user.email || "unknown").replace(/[^a-z0-9]/gi, "_");
      const folder = `edupath/courses/${safeEmail}/${contentType.toLowerCase()}`;

      const publicIdBase = sanitizeName(rawName);
      const publicId = `${publicIdBase}_${Date.now()}`;

      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: resourceType,
        folder,
        public_id: publicId,
        overwrite: false,
        ...(resourceType === "video" && {
          eager: [{ streaming_profile: "full_hd", format: "m3u8" }],
          eager_async: true
        })
      });

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
          duration: result.duration || null,
          format
        }
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: err.message || "Upload failed." });
    }
  }
);

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

module.exports = router;

