const Pathway = require("../models/Pathway");
const { generatePathway } = require("../../../services/aiService");

// ==========================================
//          STUDENT LOGIC (EXISTING)
// ==========================================

// ✅ CREATE / LOAD PATHWAY
exports.createPathway = async (req, res) => {
  try {
    const user = req.user;

    // ❌ Quiz not completed
    if (!user.quizCompleted) {
      return res.status(400).json({ message: "Complete quiz first" });
    }

    // ✅ Check existing pathway
    let existingPathway = await Pathway.findOne({ userId: user._id });

    if (existingPathway) {
      return res.json({
        message: "Existing pathway loaded",
        pathway: existingPathway,
      });
    }

    // 🔥 Generate new pathway (AI or static)
    const steps = await generatePathway({
      path: user.learningPath,
      level: user.level,
    });

    // ✅ Format steps
    const formattedSteps = steps.map((step, index) => ({
      ...step,
      order: index + 1,
      isUnlocked: index === 0,
      isCompleted: false,
    }));

    // ✅ Save pathway (Note: isTemplate defaults to false)
    const pathway = await Pathway.create({
      userId: user._id,
      pathName: user.learningPath,
      level: user.level,
      status: "in-progress",
      steps: formattedSteps,
    });

    res.json({ message: "New pathway created", pathway });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ COMPLETE STEP + UNLOCK NEXT
exports.completeStep = async (req, res) => {
  try {
    const { pathwayId, stepOrder } = req.body;

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      userId: req.user._id,
    });

    if (!pathway) return res.status(404).json({ message: "Pathway not found" });

    const step = pathway.steps.find((s) => s.order === stepOrder);

    if (!step) return res.status(404).json({ message: "Step not found" });
    if (!step.isUnlocked)
      return res.status(400).json({ message: "Step is locked" });
    if (step.isCompleted)
      return res.status(400).json({ message: "Step already completed" });

    // ✅ Mark completed
    step.isCompleted = true;

    // 🔓 Unlock next step
    const nextStep = pathway.steps.find((s) => s.order === stepOrder + 1);
    if (nextStep) nextStep.isUnlocked = true;

    const isFullyComplete = pathway.steps.every(
      (step) => step.isCompleted === true,
    );

    if (isFullyComplete) {
      pathway.status = "completed"; // Finished!
    } else {
      pathway.status = "in-progress"; // Automatically fixes old 'draft' records!
    }

    await pathway.save();

    res.json({ message: "Step completed successfully", pathway });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET USER PATHWAY (AUTO LOAD)
exports.getMyPathway = async (req, res) => {
  try {
    const pathway = await Pathway.findOne({ userId: req.user._id });

    if (!pathway) {
      return res.json({ message: "No pathway yet", hasPathway: false });
    }

    res.json({ hasPathway: true, pathway });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ SYNC ALL STEPS (Handles Admin Updates & New Steps Safely)
exports.syncPathwaySteps = async (req, res) => {
  try {
    // Notice we are expecting the full 'steps' array now from the frontend
    const { steps } = req.body;

    if (!steps || steps.length === 0) {
      return res.json({ success: true, message: "No steps to sync" });
    }

    // $set completely replaces the student's old steps array with the newly synced one.
    // This is 100% atomic and permanently prevents duplicate race conditions.
    const pathway = await Pathway.findOneAndUpdate(
      { userId: req.user._id, isTemplate: false },
      { $set: { steps: steps } },
      { new: true },
    );

    if (!pathway) return res.status(404).json({ message: "Pathway not found" });

    res.json({ success: true, message: "Pathway synchronized perfectly" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
//       ADMIN / REVIEWER LOGIC (UPDATED)
// ==========================================

// ✅ CREATE TEMPLATE PATHWAY (Admin & Reviewer)
exports.createTemplatePathway = async (req, res) => {
  try {
    let { pathName, level } = req.body;

    // 🛡️ SECURITY: Enforce Reviewer Specialization
    if (req.user.role === "reviewer") {
      // If they didn't provide a pathName, default to their specialization
      if (!pathName) {
        pathName = req.user.specializationTag;
      }
      // If they tried to create a pathway outside their specialization, block it
      else if (pathName !== req.user.specializationTag) {
        return res.status(403).json({
          success: false,
          message: `Reviewers can only create pathways for their specialization: ${req.user.specializationTag}`,
        });
      }
    }

    const template = await Pathway.create({
      isTemplate: true,
      createdBy: req.user._id,
      pathName,
      level,
      status: "draft",
      steps: [],
    });

    res.status(201).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ALL TEMPLATE PATHWAYS (Admin & Reviewer)
exports.getTemplatePathways = async (req, res) => {
  try {
    let query = { isTemplate: true };

    // 🛡️ SECURITY: Reviewers only see templates matching their specialization
    if (req.user.role === "reviewer") {
      query.pathName = req.user.specializationTag;
    }

    const templates = await Pathway.find(query);
    res.status(200).json({ success: true, count: templates.length, templates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ADD STEP TO TEMPLATE PATHWAY (Admin & Reviewer)
exports.addStepToTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    // 🟢 FIXED: We must explicitly extract the new 'resources' and 'quiz' arrays!
    const { title, description, type, resources, quiz, order } = req.body;

    let query = { _id: templateId, isTemplate: true };
    // 🛡️ SECURITY: Ensure reviewers only edit their own specializations
    if (req.user.role === "reviewer") {
      query.pathName = req.user.specializationTag;
    }

    const template = await Pathway.findOne(query);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found or unauthorized",
      });
    }

    // 🟢 FIXED: Push the new arrays into the database step
    template.steps.push({
      title,
      description,
      type,
      resources: resources || [], // Save learning materials
      quiz: quiz || [],           // Save the quizzes
      order,
      isUnlocked: true,
      isCompleted: false,
    });

    await template.save();

    res
      .status(200)
      .json({ success: true, message: "Step added to template", template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET SINGLE TEMPLATE BY ID (Admin & Reviewer)
exports.getTemplateById = async (req, res) => {
  try {
    let query = { _id: req.params.id, isTemplate: true };
    if (req.user.role === "reviewer")
      query.pathName = req.user.specializationTag;

    const template = await Pathway.findOne(query);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found or unauthorized",
      });
    }
    res.status(200).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE ENTIRE TEMPLATE & STEPS (Admin & Reviewer)
exports.updateTemplate = async (req, res) => {
  try {
    const { pathName, level, steps } = req.body;

    let query = { _id: req.params.id, isTemplate: true };

    // 🛡️ SECURITY: Reviewer Checks
    if (req.user.role === "reviewer") {
      query.pathName = req.user.specializationTag; // Must belong to their specialization

      // Block them from attempting to rename the pathway to a different specialization
      if (pathName && pathName !== req.user.specializationTag) {
        return res.status(403).json({
          success: false,
          message:
            "Reviewers cannot change the specialization topic of a pathway.",
        });
      }
    }

    const template = await Pathway.findOneAndUpdate(
      query,
      { pathName, level, steps },
      { returnDocument: "after", runValidators: true },
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found or unauthorized",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Template updated", template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE TEMPLATE PATHWAY (Admin & Reviewer)
exports.deleteTemplatePathway = async (req, res) => {
  try {
    let query = { _id: req.params.id, isTemplate: true };
    if (req.user.role === "reviewer")
      query.pathName = req.user.specializationTag;

    const template = await Pathway.findOneAndDelete(query);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found or unauthorized",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Template deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE TEMPLATE STATUS (Admin & Reviewer)
exports.updateTemplateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let query = { _id: req.params.id, isTemplate: true };
    if (req.user.role === "reviewer")
      query.pathName = req.user.specializationTag;

    const template = await Pathway.findOneAndUpdate(
      query,
      { status },
      { returnDocument: "after" },
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found or unauthorized",
      });
    }

    res.status(200).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET PUBLISHED TEMPLATES (For Students to browse)
exports.getPublishedTemplates = async (req, res) => {
  try {
    const templates = await Pathway.find({
      isTemplate: true,
      status: "published",
    });
    res.status(200).json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ENROLL IN A TEMPLATE (Student)
exports.enrollInTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    // 1. Find the published template
    const template = await Pathway.findOne({
      _id: templateId,
      isTemplate: true,
      status: "published",
    });
    if (!template) {
      return res
        .status(404)
        .json({ message: "Template not found or not available" });
    }

    // 2. Check if student is already enrolled in this specific pathway
    const existing = await Pathway.findOne({
      userId: req.user._id,
      originalTemplateId: template._id, // <-- Changed this line
      isTemplate: false,
    });
    if (existing) {
      return res.status(400).json({ message: "You are already enrolled in this specific pathway." });
    }

    // 3. Copy and format the steps for the student (Unlock only the first one)
    const formattedSteps = template.steps.map((step, index) => ({
      title: step.title,
      description: step.description,
      type: step.type,
      resources: step.resources || [],
      quiz: step.quiz || [],
      order: step.order || index + 1,
      isUnlocked: index === 0,
      isCompleted: false,
    }));

    // 4. Create the student's personal tracking pathway
    const newPathway = await Pathway.create({
      userId: req.user._id,
      isTemplate: false,
      originalTemplateId: template._id, // <-- ADD THIS LINE HERE
      pathName: template.pathName,
      level: template.level,
      status: "in-progress",
      steps: formattedSteps,
    });

    res.status(201).json({
      success: true,
      message: "Enrolled successfully!",
      pathway: newPathway,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ SUBMIT QUIZ & GET RECOMMENDATION (Student)
exports.recommendPathway = async (req, res) => {
  try {
    const { pathName, level } = req.body;

    if (!pathName || !level) {
      return res.status(400).json({ message: "Missing required path data." });
    }

    // 🟢 FOOLPROOF FIX: No need to require() the User model!
    // Since authMiddleware already gave us the user document, we just update and save it.
    req.user.quizCompleted = true;
    req.user.learningPath = pathName;
    req.user.level = level;
    
    await req.user.save(); // Saves directly to MongoDB!

    // Search for the exact matching published Template
    let matchingTemplate = await Pathway.findOne({
      isTemplate: true,
      status: "published",
      pathName: pathName,
      level: level
    });

    // Fallback 1: If that specific level isn't found, find ANY published template for that path
    if (!matchingTemplate) {
      matchingTemplate = await Pathway.findOne({
        isTemplate: true,
        status: "published",
        pathName: pathName
      });
    }

    // Final Fallback: Just give them the first published template available
    if (!matchingTemplate) {
      matchingTemplate = await Pathway.findOne({
        isTemplate: true,
        status: "published"
      });
    }

    res.status(200).json({
      success: true,
      message: "Pathway recommended successfully",
      template: matchingTemplate
    });

  } catch (err) {
    console.error("RECOMMENDATION ERROR:", err.message); 
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE STUDENT PATHWAY (Restart Journey)
exports.deleteMyPathway = async (req, res) => {
  try {
    // 1. Delete the student's active pathway
    const pathway = await Pathway.findOneAndDelete({
      userId: req.user._id,
      isTemplate: false
    });

    if (!pathway) {
      return res.status(404).json({ success: false, message: "No active pathway found." });
    }

    // 2. 🟢 FOOLPROOF FIX: Reset the User's profile using req.user directly!
    // No need to require() the User model, avoiding the 500 crash.
    req.user.quizCompleted = false;
    req.user.learningPath = null;
    req.user.level = null;
    
    await req.user.save(); // Saves directly to MongoDB

    res.status(200).json({ 
      success: true, 
      message: "Pathway deleted successfully. You can now start over." 
    });
  } catch (err) {
    console.error("DELETE PATHWAY ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};