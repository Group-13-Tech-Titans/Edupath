const mongoose = require("mongoose");

const specializationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Performance index for fast dropdowns and pathway name resolution
specializationSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model("Specialization", specializationSchema);
