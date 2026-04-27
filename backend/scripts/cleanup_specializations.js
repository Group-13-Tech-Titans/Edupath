const mongoose = require("mongoose");
const Specialization = require("../modules/specializations/models/specialization");
require("dotenv").config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:2017/edupath");
    console.log("Connected to MongoDB...");

    const all = await Specialization.find({});
    console.log(`Total specializations found: ${all.length}`);

    const seen = new Set();
    const toDelete = [];

    for (const spec of all) {
      const normalizedName = spec.name.trim().toLowerCase();
      if (seen.has(normalizedName)) {
        toDelete.push(spec._id);
      } else {
        seen.add(normalizedName);
      }
    }

    if (toDelete.length > 0) {
      console.log(`Deleting ${toDelete.length} duplicates...`);
      await Specialization.deleteMany({ _id: { $in: toDelete } });
      console.log("Cleanup successful!");
    } else {
      console.log("No duplicates found.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
};

cleanup();
