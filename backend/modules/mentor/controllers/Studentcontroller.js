const MentorStudent = require("../models/MentorStudent");

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/students
// Returns all students assigned to the logged-in mentor.
// Powers the main student list on the MentorStudents page.
// ─────────────────────────────────────────────────────────────
const getStudents = async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    const query = { mentorId: req.user._id };

    // 1. Filtering by Status
    if (status && status !== "all") {
      query.status = status;
    }

    // 2. Searching by Name or Track
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { track: { $regex: search, $options: "i" } }
      ];
    }

    let studentsQuery = MentorStudent.find(query);

    // 3. Sorting
    if (sort === "name_asc") studentsQuery = studentsQuery.sort({ studentName: 1 });
    else if (sort === "name_desc") studentsQuery = studentsQuery.sort({ studentName: -1 });
    else if (sort === "enrolled_asc") studentsQuery = studentsQuery.sort({ enrolledAt: 1 });
    else studentsQuery = studentsQuery.sort({ enrolledAt: -1 }); // Default: newest first

    const students = await studentsQuery;
    res.json(students);
  } catch (error) {
    console.error("getStudents error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/students/stats
// Returns counts: total, active, paused students.
// Powers the Overview sidebar on the MentorStudents page.
// ─────────────────────────────────────────────────────────────
const getStudentStats = async (req, res) => {
  try {
    const [total, active, paused, newStudents] = await Promise.all([
      MentorStudent.countDocuments({ mentorId: req.user._id }),
      MentorStudent.countDocuments({ mentorId: req.user._id, status: "active" }),
      MentorStudent.countDocuments({ mentorId: req.user._id, status: "paused" }),
      MentorStudent.countDocuments({ mentorId: req.user._id, status: "new" }),
    ]);

    res.json({ total, active, paused, new: newStudents });
  } catch (error) {
    console.error("getStudentStats error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/students/:studentId
// Returns a COMPREHENSIVE view of a student:
// - Basic Info
// - Session History
// - Shared Resources
// ─────────────────────────────────────────────────────────────
const getStudentById = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { studentId } = req.params;

    // 1. Get Basic Info
    const student = await MentorStudent.findOne({ mentorId, studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Get Session History (Completed and Scheduled)
    const [sessions, resources] = await Promise.all([
      require("../models/Session").find({ mentorId, studentId }).sort({ createdAt: -1 }),
      require("../models/Resource").find({ mentorId, studentId }).sort({ createdAt: -1 })
    ]);

    // 3. Aggregate "Previously Discussed" topics from completed sessions
    const discussedTopics = sessions
      .filter(s => s.status === "completed" && s.note)
      .map(s => s.note);

    res.json({
      profile: student,
      sessions,
      resources,
      discussedTopics
    });
  } catch (error) {
    console.error("getStudentById error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/mentor/students
// Adds a student under this mentor.
// In real life this would happen automatically when a student
// is assigned — but for now we create it manually for testing.
// ─────────────────────────────────────────────────────────────
const addStudent = async (req, res) => {
  try {
    const { studentId, studentName, track, status } = req.body;

    // Check if this student is already assigned to this mentor
    const existing = await MentorStudent.findOne({
      mentorId: req.user._id,
      studentId,
    });

    if (existing) {
      return res.status(400).json({ message: "This student is already assigned to you" });
    }

    const student = await MentorStudent.create({
      mentorId: req.user._id,
      studentId,
      studentName,
      track,
      status: status || "new",
    });

    res.status(201).json({ message: "Student added!", student });
  } catch (error) {
    console.error("addStudent error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/mentor/students/:studentId
// Update a student's status or notes.
// e.g. change status from "new" to "active", or add mentor notes
// ─────────────────────────────────────────────────────────────
const updateStudent = async (req, res) => {
  try {
    const { status, track, mentorNotes, lastActivity } = req.body;

    const student = await MentorStudent.findOneAndUpdate(
      {
        mentorId: req.user._id,
        studentId: req.params.studentId,
      },
      {
        $set: {
          ...(status && { status }),
          ...(track && { track }),
          ...(mentorNotes && { mentorNotes }),
          ...(lastActivity && { lastActivity }),
        },
      },
      { new: true } // return the updated version
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student updated!", student });
  } catch (error) {
    console.error("updateStudent error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/mentor/students/:studentId
// Remove a student from this mentor's list
// ─────────────────────────────────────────────────────────────
const removeStudent = async (req, res) => {
  try {
    const student = await MentorStudent.findOneAndDelete({
      mentorId: req.user._id,
      studentId: req.params.studentId,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student removed from your list" });
  } catch (error) {
    console.error("removeStudent error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/mentor/students/:studentId/notes
// Mentor updates their private notes about a student.
// ─────────────────────────────────────────────────────────────
const updateMentorNotes = async (req, res) => {
  try {
    const { mentorNotes } = req.body;
    const { studentId } = req.params;

    const student = await MentorStudent.findOneAndUpdate(
      { mentorId: req.user._id, studentId },
      { $set: { mentorNotes } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Notes updated!", mentorNotes: student.mentorNotes });
  } catch (error) {
    console.error("updateMentorNotes error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentStats,
  getStudentById,
  addStudent,
  updateStudent,
  removeStudent,
  updateMentorNotes,
};