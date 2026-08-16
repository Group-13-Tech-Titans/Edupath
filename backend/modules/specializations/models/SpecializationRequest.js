const mongoose = require("mongoose");

const specializationRequestSchema = new mongoose.Schema({
  educatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  requestedSpecialization: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("SpecializationRequest", specializationRequestSchema);
