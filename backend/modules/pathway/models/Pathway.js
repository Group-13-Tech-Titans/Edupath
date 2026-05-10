const mongoose = require("mongoose");

const RESOURCE_TYPES = ["video", "pdf", "link"];
const PATHWAY_STATUSES = ["draft", "published", "in-progress", "completed"];

// Represents an individual milestone or lesson within a pathway.

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  resources: [
    {
      title: String,
      url: String,
      type: { type: String, enum: RESOURCE_TYPES, default: "video" }
    },
  ],
  linkedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    title: String,
    thumbnail: String,
    educatorName: String
  }],
  order: { type: Number, required: true },

  quiz: [{
    question: { type: String, required: true },
    options: { 
      type: [String], 
      // Validation to ensure a quiz has at least 2 options to be valid
      validate: [v => v.length >= 2, 'Quiz must have at least 2 options']
    }, 
    correctAnswerIndex: { type: Number, default: 0 }
  }],

  isCompleted: { type: Boolean, default: false },
  isUnlocked: { type: Boolean, default: false },
});

// Represents both Master Templates (Admin/Reviewer) and Individual Student Journeys.
const pathwaySchema = new mongoose.Schema(
  {
    // ADMIN / REVIEWER TEMPLATE FIELDS
    isTemplate: { type: Boolean, default: false },
    originalTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: "Pathway" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: PATHWAY_STATUSES,
      default: "draft",
    },

    // STUDENT FIELDS
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pathName: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },

    steps: [stepSchema],
  },
  { timestamps: true }
);

// Ensures only 1 Template per Specialization + Level exists globally. while allowing infinite student enrollments with the same name.
pathwaySchema.index(
  { pathName: 1, level: 1 },
  { unique: true, partialFilterExpression: { isTemplate: true } }
);

module.exports = mongoose.model("Pathway", pathwaySchema);