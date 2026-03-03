import mongoose from "mongoose";

const ReviewerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specializationTag: { type: String, default: "general" },
  password: { type: String, required: true }, 
}, 
{ timestamps: true });

export default mongoose.model("Reviewer", ReviewerSchema);