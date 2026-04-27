const MentorStudent = require("../models/MentorStudent");
const User = require("../../auth/models/User");
const Session = require("../models/Session");
const Resource = require("../models/Resource");
const mongoose = require("mongoose");

// GET /api/mentor/students
const getStudents = async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    const query = { mentorId: req.user._id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { track: { $regex: search, $options: "i" } }
      ];
    }

    let studentsQuery = MentorStudent.find(query);

    if (sort === "name_asc") studentsQuery = studentsQuery.sort({ studentName: 1 });
    else if (sort === "name_desc") studentsQuery = studentsQuery.sort({ studentName: -1 });
    else if (sort === "enrolled_asc") studentsQuery = studentsQuery.sort({ enrolledAt: 1 });
    else studentsQuery = studentsQuery.sort({ enrolledAt: -1 });

    const students = await studentsQuery;
    res.json(students);
  } catch (error) {
    console.error("getStudents error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// GET /api/mentor/students/stats
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

// GET /api/mentor/students/:studentId
const getStudentById = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { studentId } = req.params;

    console.log(`[getStudentById] studentId: ${studentId}, mentorId: ${mentorId}`);

    // 1. Validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      const mockStudents = {
        "S001": { name: "Priya Sharma", track: "Web Development", email: "priya@example.com" },
        "S002": { name: "Rahul Mehta", track: "Data Science & ML", email: "rahul@example.com" },
        "S003": { name: "Anjali Kumar", track: "React & TypeScript", email: "anjali@example.com" },
        "S004": { name: "Nimal Perera", track: "Networking", email: "nimal@example.com" },
        "S005": { name: "Sahana Jayasinghe", track: "Web Development", email: "sahana@example.com" },
        "S006": { name: "Kavindu Fernando", track: "Web Development", email: "kavindu@example.com" },
      };

      if (mockStudents[studentId]) {
        const mock = mockStudents[studentId];
        return res.json({
          studentId,
          name: mock.name,
          email: mock.email,
          track: mock.track,
          status: "mock",
          createdAt: new Date(),
          role: "student",
          sessions: [],
          resources: [],
          discussedTopics: []
        });
      }
      return res.status(400).json({ message: "Invalid student ID format." });
    }

    // 2. Get Basic Info from Relationship table
    let relationship = await MentorStudent.findOne({ mentorId, studentId });
    let studentData;

    if (relationship) {
      const u = await User.findById(studentId);
      studentData = {
        ...relationship.toObject(),
        name: relationship.studentName,
        email: u?.email || "",
        role: u?.role || "student"
      };
    } else {
      const u = await User.findById(studentId);
      if (!u) {
        return res.status(404).json({ message: "Student user not found" });
      }
      studentData = {
        studentId: u._id,
        name: u.name,
        email: u.email,
        track: u.learningPath || "Student",
        status: "potential",
        createdAt: u.createdAt,
        role: u.role
      };
    }

    // 3. Get Session History and Resources
    const [sessions, resources] = await Promise.all([
      Session.find({
        $or: [
          { mentorId, studentId },
          { mentorId, studentId: studentId.toString() }
        ]
      }).sort({ createdAt: -1 }),
      Resource.find({ mentorId, studentId }).sort({ createdAt: -1 })
    ]);

    const discussedTopics = sessions
      .filter(s => s.status === "completed" && s.note)
      .map(s => s.note);

    res.json({
      ...studentData,
      profile: studentData,
      sessions,
      resources,
      discussedTopics
    });
  } catch (error) {
    console.error("getStudentById error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// POST /api/mentor/students
const addStudent = async (req, res) => {
  try {
    const { studentId, studentName, track, status } = req.body;

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

// PUT /api/mentor/students/:studentId
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
      { new: true }
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

// DELETE /api/mentor/students/:studentId
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

// PATCH /api/mentor/students/:studentId/notes
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