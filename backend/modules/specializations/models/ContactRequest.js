const mongoose = require("mongoose");

const contactRequestSchema = new mongoose.Schema({
  educatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "reviewed"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("ContactRequest", contactRequestSchema);
