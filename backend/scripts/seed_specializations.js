const mongoose = require("mongoose");
const Specialization = require("../modules/specializations/models/specialization");
require("dotenv").config();

const specializations = [
  "Artificial Intelligence",
  "Business Management",
  "Cyber Security",
  "Data Science",
  "Full Stack Development",
  "Mobile Development",
  "UI/UX Design",
  "Web Development",
  "python"
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:2017/edupath");
    console.log("Connected to MongoDB...");

    for (const name of specializations) {
      const slug = name.toLowerCase().replace(/ /g, "-");
      
      // Upsert: check if exists, if not create
      await Specialization.findOneAndUpdate(
        { slug },
        { name, slug, isActive: true },
        { upsert: true, new: true }
      );
      console.log(`Ensured specialization: ${name}`);
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
