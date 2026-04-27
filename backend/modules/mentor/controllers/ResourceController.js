const Resource = require("../models/Resource");

// ─────────────────────────────────────────────────────────────
// POST /api/mentor/resources
// Mentor shares a new resource with a student.
// ─────────────────────────────────────────────────────────────
const shareResource = async (req, res) => {
  try {
    const { studentId, studentName, type, title, section, description, url, notes } = req.body;

    // Make sure required fields are present
    if (!type || !title) {
      return res.status(400).json({ message: "type and title are required" });
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
// Returns ALL resources shared by this mentor.
// Supports ?type=... and ?search=...
// ─────────────────────────────────────────────────────────────
const getAllResources = async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = { mentorId: req.user._id };

    if (type && type !== "all") {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } }
      ];
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });

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
    })
    .populate("mentorId", "name")
    .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error("getMyResources error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/mentor/resources/:id
// Mentor updates a shared resource.
// ─────────────────────────────────────────────────────────────
const updateResource = async (req, res) => {
  try {
    const { title, description, url, notes, type, studentId, studentName } = req.body;

    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, mentorId: req.user._id },
      {
        $set: {
          ...(title && { title }),
          ...(description && { description }),
          ...(url && { url }),
          ...(notes && { notes }),
          ...(type && { type }),
          studentId, // can be null for "all"
          studentName
        }
      },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource updated!", resource });
  } catch (error) {
    console.error("updateResource error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/resources/stats
// Returns counts by type.
// ─────────────────────────────────────────────────────────────
const getResourceStats = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const [total, videos, docs, quizzes] = await Promise.all([
      Resource.countDocuments({ mentorId }),
      Resource.countDocuments({ mentorId, type: "video" }),
      Resource.countDocuments({ mentorId, type: "pdfppt" }),
      Resource.countDocuments({ mentorId, type: "quiz" }),
    ]);

    res.json({ total, videos, docs, quizzes });
  } catch (error) {
    console.error("getResourceStats error:", error.message);
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
      mentorId: req.user._id,
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
  updateResource,
  getResourceStats
};