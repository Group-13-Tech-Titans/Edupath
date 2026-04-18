const Resource = require("../models/Resource");

// ─────────────────────────────────────────────────────────────
// POST /api/mentor/resources
// Mentor shares a new resource with a student.
// ─────────────────────────────────────────────────────────────
const shareResource = async (req, res) => {
  try {
    const { studentId, studentName, type, title, section, description, url, notes } = req.body;

    // Make sure required fields are present
    if (!studentId || !type || !title) {
      return res.status(400).json({ message: "studentId, type and title are required" });
    }

    const resource = await Resource.create({
      mentorId: req.user._id,
      studentId,
      studentName,
      type,
      title,
      section,
      description,
      url,
      notes,
    });

    res.status(201).json({ message: "Resource shared!", resource });
  } catch (error) {
    console.error("shareResource error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/resources
// Returns ALL resources shared by this mentor (all students).
// ─────────────────────────────────────────────────────────────
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      mentorId: req.user._id,
    }).sort({ createdAt: -1 }); // newest first

    res.json(resources);
  } catch (error) {
    console.error("getAllResources error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/resources/student/:studentId
// Returns resources shared with ONE specific student.
// ─────────────────────────────────────────────────────────────
const getResourcesByStudent = async (req, res) => {
  try {
    const resources = await Resource.find({
      mentorId: req.user._id,
      studentId: req.params.studentId,
    }).sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error("getResourcesByStudent error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/resources/student/:studentId (for student view)
// A student can see resources shared WITH them.
// ─────────────────────────────────────────────────────────────
const getMyResources = async (req, res) => {
  try {
    // The logged-in user is the student — find resources where studentId = their ID
    const resources = await Resource.find({
      studentId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error("getMyResources error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/mentor/resources/:id
// Mentor deletes a resource they shared.
// ─────────────────────────────────────────────────────────────
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({
      _id: req.params.id,
      mentorId: req.user._id, // only the mentor who shared it can delete it
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted!" });
  } catch (error) {
    console.error("deleteResource error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

module.exports = {
  shareResource,
  getAllResources,
  getResourcesByStudent,
  getMyResources,
  deleteResource,
};