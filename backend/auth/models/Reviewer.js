const mongoose = require("mongoose");

const reviewerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    expertise:{ type: String, required: true},
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Reviewer", reviewerSchema);