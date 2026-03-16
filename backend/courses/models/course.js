const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  specializationTag: { type: String },
  thumbnailName: { type: String },
  thumbnailUrl: { type: String },
  rating: { type: Number, default: 0 },
  educatorName: { type: String },
  createdByEducatorEmail: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  content: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
