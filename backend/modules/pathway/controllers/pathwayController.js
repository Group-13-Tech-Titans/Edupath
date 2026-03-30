const Pathway = require("../models/Pathway");
const { generatePathway } = require("../../../services/aiService");


// ✅ CREATE / LOAD PATHWAY
exports.createPathway = async (req, res) => {
  try {
    const user = req.user;

    // ❌ Quiz not completed
    if (!user.quizCompleted) {
      return res.status(400).json({
        message: "Complete quiz first",
      });
    }

    // ✅ Check existing pathway
    let existingPathway = await Pathway.findOne({
      userId: user._id,
    });

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

    // ✅ Save pathway
    const pathway = await Pathway.create({
      userId: user._id,
      pathName: user.learningPath,
      level: user.level,
      steps: formattedSteps,
    });

    res.json({
      message: "New pathway created",
      pathway,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ COMPLETE STEP + UNLOCK NEXT
exports.completeStep = async (req, res) => {
  try {
    const { pathwayId, stepOrder } = req.body;

    // 🔒 Secure: only user's own pathway
    const pathway = await Pathway.findOne({
      _id: pathwayId,
      userId: req.user._id,
    });

    if (!pathway) {
      return res.status(404).json({
        message: "Pathway not found",
      });
    }

    const step = pathway.steps.find((s) => s.order === stepOrder);

    if (!step) {
      return res.status(404).json({
        message: "Step not found",
      });
    }

    if (!step.isUnlocked) {
      return res.status(400).json({
        message: "Step is locked",
      });
    }

    if (step.isCompleted) {
      return res.status(400).json({
        message: "Step already completed",
      });
    }

    // ✅ Mark completed
    step.isCompleted = true;

    // 🔓 Unlock next step
    const nextStep = pathway.steps.find(
      (s) => s.order === stepOrder + 1
    );

    if (nextStep) {
      nextStep.isUnlocked = true;
    }

    await pathway.save();

    res.json({
      message: "Step completed successfully",
      pathway,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ GET USER PATHWAY (AUTO LOAD)
exports.getMyPathway = async (req, res) => {
  try {
    const pathway = await Pathway.findOne({
      userId: req.user._id,
    });

    if (!pathway) {
      return res.json({
        message: "No pathway yet",
        hasPathway: false,
      });
    }

    res.json({
      hasPathway: true,
      pathway,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};