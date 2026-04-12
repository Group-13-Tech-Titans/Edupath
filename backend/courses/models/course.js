const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "" },
  level: { type: String, default: "" },
  price: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  specializationTag: { type: String },
  thumbnailName: { type: String },
  thumbnailUrl: { type: String },
  rating: { type: Number, default: 0 },
  educatorName: { type: String },
  createdByEducatorEmail: { type: String, required: true },
  status: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "pending" },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  review: {
    decision: { type: String },
    rating: { type: Number },
    notes: { type: String },
    reviewerName: { type: String },
    reviewerEmail: { type: String },
    reviewedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
