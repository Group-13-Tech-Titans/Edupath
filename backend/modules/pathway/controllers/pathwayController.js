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
    if (!step.isUnlocked) return res.status(400).json({ message: "Step is locked" });
    if (step.isCompleted) return res.status(400).json({ message: "Step already completed" });

    // ✅ Mark completed
    step.isCompleted = true;

    // 🔓 Unlock next step
    const nextStep = pathway.steps.find((s) => s.order === stepOrder + 1);
    if (nextStep) nextStep.isUnlocked = true;

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


// ==========================================
//       ADMIN / REVIEWER LOGIC (NEW)
// ==========================================

// ✅ CREATE TEMPLATE PATHWAY (Admin)
exports.createTemplatePathway = async (req, res) => {
  try {
    // Removed the unused 'description' variable to satisfy SonarLint
    const { pathName, level } = req.body;
    
    const template = await Pathway.create({
      isTemplate: true,
      createdBy: req.user._id, // Set the admin/reviewer as creator
      pathName,
      level,
      status: "draft",
      steps: [] 
    });

    res.status(201).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ALL TEMPLATE PATHWAYS (Admin)
exports.getTemplatePathways = async (req, res) => {
  try {
    const templates = await Pathway.find({ isTemplate: true });
    res.status(200).json({ success: true, count: templates.length, templates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ADD STEP TO TEMPLATE PATHWAY (Admin)
exports.addStepToTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { title, description, type, resource, order } = req.body;

    const template = await Pathway.findOne({ _id: templateId, isTemplate: true });
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    // Push new step into the array
    template.steps.push({
      title,
      description,
      type,
      resource,
      order,
      // Default unlocks for templates
      isUnlocked: true, 
      isCompleted: false 
    });

    await template.save();

    res.status(200).json({ success: true, message: "Step added to template", template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET SINGLE TEMPLATE BY ID (Admin)
exports.getTemplateById = async (req, res) => {
  try {
    const template = await Pathway.findOne({ _id: req.params.id, isTemplate: true });
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.status(200).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ENTIRE TEMPLATE & STEPS (Admin)
exports.updateTemplate = async (req, res) => {
  try {
    const { pathName, level, steps } = req.body;
    
    // This finds the template and completely replaces the details and the steps array
    const template = await Pathway.findOneAndUpdate(
      { _id: req.params.id, isTemplate: true },
      { pathName, level, steps },
      { returnDocument: 'after', runValidators: true } // <-- FIXED DEPRECATION WARNING
    );

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.status(200).json({ success: true, message: "Template updated", template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE TEMPLATE PATHWAY (Admin)
exports.deleteTemplatePathway = async (req, res) => {
  try {
    const template = await Pathway.findOneAndDelete({ 
      _id: req.params.id, 
      isTemplate: true 
    });

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.status(200).json({ success: true, message: "Template deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE TEMPLATE STATUS (Admin)
exports.updateTemplateStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expecting 'published' or 'draft'
    
    const template = await Pathway.findOneAndUpdate(
      { _id: req.params.id, isTemplate: true },
      { status },
      { returnDocument: 'after' } // <-- FIXED DEPRECATION WARNING
    );

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.status(200).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};