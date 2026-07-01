const Pathway = require("../models/Pathway");
const Specialization = require("../../specializations/models/specialization");

const MAX_ACTIVE_PATHWAYS = 3;
const MIN_SUBSTRING_LENGTH = 4;
const STATUS = {
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  DRAFT: "draft",
  PUBLISHED: "published",
};


// check and match template pathway name with specialization (Educator,Reviewer)
const specializationMatch = (name1, name2) => {
  //Reject processing immediately if inputs are missing or are not strings
  if (!name1 || !name2 || typeof name1 !== "string" || typeof name2 !== "string") return false;
  
  // strip all non-alphanumeric characters (spaces, dashes, slashes) and make lowercase
  const n1 = name1.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
  const n2 = name2.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
  
  // Ensure strings weren't completely made of stripped punctuation
  if (!n1 || !n2) return false;
  if (n1 === n2) return true; // Direct match
  
  // Domain-specific rule mapping
  if (n1.startsWith('uiux') && n2.startsWith('uiux')) return true;
  if (n1.startsWith('fullstack') && n2.startsWith('fullstack')) return true;

  // General substring match (avoids matching tiny strings by using MIN_FUZZY_LENGTH)
  // Match deep text containment while ensuring strings cross the length threshold
  if (n1.length > MIN_SUBSTRING_LENGTH && n2.includes(n1)) return true;
  if (n2.length > MIN_SUBSTRING_LENGTH && n1.includes(n2)) return true;

  return false;
};

// STUDENT LOGIC (MULTI-PATHWAY)
exports.createPathway = async (req, res) => {
  try {
    const user = req.user;

    // Validate user state
    if (!user.quizCompleted) {
      return res
        .status(400)
        .json({ success: false, message: "Complete quiz first" });
    }

    // Ensure Student can only create maximum 3 PathWays
    const activeCount = await Pathway.countDocuments({
      userId: user._id,
      isTemplate: false,
    });

    if (activeCount >= MAX_ACTIVE_PATHWAYS) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            `You can only have up to ${MAX_ACTIVE_PATHWAYS} active pathways. Please delete one to start a new journey.`,
        });
    }

    // Prevent duplicate pathway creation on double-clicks
    let existingPathway = await Pathway.findOne({
      userId: user._id,
      pathName: user.learningPath,
      level: user.level,
      isTemplate: false,
    });

    if (existingPathway) {
      return res.json({
        message: "Existing pathway loaded",
        pathway: existingPathway,
      });
    }

    // Try to find the exact matching published template
    let template = await Pathway.findOne({
      isTemplate: true,
      status: STATUS.PUBLISHED,
      pathName: user.learningPath,
      level: user.level,
    });

    // Fallback: Find ANY level for that specific path
    if (!template) {
      template = await Pathway.findOne({
        isTemplate: true,
        status: STATUS.PUBLISHED,
        pathName: user.learningPath,
      });
    }

    // Last Resort Fallback: Find ANY published template to prevent app crash
    if (!template) {
      template = await Pathway.findOne({
        isTemplate: true,
        status: STATUS.PUBLISHED,
      });
    }

    // If the database is completely empty of templates
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "No curriculum templates are currently available. Please contact an admin."
      });
    }

    // Map over the DB template to format it for the specific student
    const formattedSteps = template.steps.map((step, index) => ({
      title: step.title,
      description: step.description,
      type: step.type,
      resources: step.resources || [],
      linkedCourses: step.linkedCourses || [],
      quiz: step.quiz || [],
      order: step.order || index + 1,
      isUnlocked: index === 0, // Unlock only the first step
      isCompleted: false,
    }));

    const pathway = await Pathway.create({
      userId: user._id,
      originalTemplateId: template._id, // Track where this curriculum came from
      pathName: template.pathName,      // Use template's official name
      level: template.level,
      status: STATUS.IN_PROGRESS,
      steps: formattedSteps,
    });

    res.status(201).json({ success: true, message: "New pathway created from database template", pathway });
  } catch (err) {
    console.error("Error in createPathway:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Handle path-step completion
exports.completeStep = async (req, res) => {
  try {
    const { pathwayId, stepOrder } = req.body;

    // Input Validation
    if (!pathwayId || stepOrder == null) {
        return res.status(400).json({ success: false, message: "Missing pathwayId or stepOrder" });
    }

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      userId: req.user._id,
    })
      .select('steps.order steps.isUnlocked steps.isCompleted status')
      .lean();

    if (!pathway)
      return res
        .status(404)
        .json({ success: false, message: "Pathway not found" });

    const step = pathway.steps.find((step) => step.order === stepOrder);

    if (!step){
      return res
        .status(404)
        .json({ success: false, message: "Step not found" });
    }
      
    if (!step.isUnlocked){
      return res
        .status(400)
        .json({ success: false, message: "Step is locked" });
    }
      
    if (step.isCompleted){
      return res
        .status(400)
        .json({ success: false, message: "Step already completed" });
    }

    // Auto-unlock next step
    const nextStep = pathway.steps.find((step) => step.order === stepOrder + 1);

    // Check if entire pathway is completed
    const isFullyComplete = pathway.steps.every(
      (s) => s.order === stepOrder || s.isCompleted === true,
    );

    await Pathway.updateOne(
      { _id: pathway._id },
      {
        $set: {
          "steps.$[curr].isCompleted": true,
          ...(nextStep ? { "steps.$[next].isUnlocked": true } : {}),
          status: isFullyComplete ? STATUS.COMPLETED : STATUS.IN_PROGRESS,
        },
      },
      {
        arrayFilters: [
          { "curr.order": stepOrder },
          ...(nextStep ? [{ "next.order": stepOrder + 1 }] : []),
        ],
      }
    );

    res.json({
      success: true,
      message: "Step completed successfully",
      pathwayId: pathway._id,
    });
  } catch (err) {
    console.error("Error in completeStep:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// GET ALL PATHWAYS FOR STUDENT
exports.getMyPathway = async (req, res) => {
  try {
    const filter = {
      userId: req.user._id,
      isTemplate: false,
    };
    if (req.query.pathwayId) {
      filter._id = req.query.pathwayId;
    }
    let query = Pathway.find(filter).sort({ updatedAt: -1 });

    if (req.query.summary === 'true') {
      query = query.select('pathName level status isTemplate steps.isCompleted steps.order updatedAt createdAt userId');
    }

    const pathways = await query.lean();

    if (!pathways || pathways.length === 0) {
      return res.json({
        success: false,
        message: "No pathways yet",
        hasPathway: false,
        pathways: [],
      });
    }

    res.json({ success: true, hasPathway: true, pathways });
  } catch (err) {
    console.error("Error in getMyPathway:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// SYNC SPECIFIC PATHWAY/Step (requires pathwayId from frontend)
exports.syncPathwaySteps = async (req, res) => {
  try {
    const { pathwayId, steps } = req.body;

    if (!pathwayId)
      return res
        .status(400)
        .json({ success: false, message: "Pathway ID required for syncing." });
    if (!steps || steps.length === 0)
      return res.json({ success: true, message: "No steps to sync" });

    const pathway = await Pathway.findOneAndUpdate(
      { _id: pathwayId, userId: req.user._id, isTemplate: false },
      { $set: { steps: steps } },
      { new: true },
    );

    if (!pathway)
      return res
        .status(404)
        .json({ success: false, message: "Pathway not found" });

    res.json({ success: true, message: "Pathway synchronized perfectly" });
  } catch (err) {
    console.error("Error in syncPathwaySteps:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// ADMIN / REVIEWER LOGIC

// Handle Admin/Reviewer pathway creation
exports.createTemplatePathway = async (req, res) => {
  try {
    let { pathName, level } = req.body;

    if (req.user.role === "reviewer") {
      const spec = await Specialization.findOne({
        slug: req.user.specializationTag,
      });
      if (!spec) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Reviewer specialization not found in database.",
          });
      }
      pathName = spec.name;
    }

    const existingPathway = await Pathway.findOne({
      pathName,
      level,
      isTemplate: true,
    });

    if (existingPathway) {
      return res.status(400).json({
        success: false,
        message: `A ${level} pathway for "${pathName}" already exists. Only 1 pathway per level is allowed.`,
      });
    }

    const template = await Pathway.create({
      isTemplate: true,
      createdBy: req.user._id,
      pathName,
      level,
      status: STATUS.DRAFT,
      steps: [],
    });

    res.status(201).json({ success: true, template });
  } catch (err) {
    // 11000 is the MongoDB Duplicate Key Error Code
    if (err.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This level and specialization combination already exists globally.",
        });
    }
    console.error("Error in createTemplatePathway:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Get pathway Templates to show in Admin/Reviewer Pathway creation
exports.getTemplatePathways = async (req, res) => {
  try {
    let query = { isTemplate: true };

    // Filter what a reviewer is allowed to see
    if (req.user.role === "reviewer") {
      const spec = await Specialization.findOne({
        slug: req.user.specializationTag,
      });

      const officialName = spec ? spec.name : req.user.specializationTag;

      // Restrict the upcoming database search query to pathways matching either the official name or the slug
      query.pathName = { $in: [officialName, req.user.specializationTag] };
    }

    let dbQuery = Pathway.find(query);
    if (req.query.summary === 'true') {
      dbQuery = dbQuery.select('pathName level status isTemplate steps._id steps.order updatedAt createdAt');
    }
    const templates = await dbQuery.sort({ updatedAt: -1 }).lean();
    res.status(200).json({ success: true, count: templates.length, templates });
  } catch (err) {
    console.error("Error in getTemplatePathways:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Get pathway templetes using its id
exports.getTemplateById = async (req, res) => {
  try {
    const template = await Pathway.findOne({
      _id: req.params.id,
      isTemplate: true,
    });

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    // Verify reviewer owns this specific template
    if (req.user.role === "reviewer") {
      const spec = await Specialization.findOne({
        slug: req.user.specializationTag,
      });
      const officialName = spec ? spec.name : req.user.specializationTag;

      if (
        template.pathName !== officialName &&
        template.pathName !== req.user.specializationTag
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
      }
    }

    res.status(200).json({ success: true, template });
  } catch (err) {
    console.error("Error in getTemplateById:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Handle Pathway templates Edits
exports.updateTemplate = async (req, res) => {
  try {
    let { pathName, level, steps } = req.body;

    const templateToUpdate = await Pathway.findOne({
      _id: req.params.id,
      isTemplate: true,
    });
    if (!templateToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found." });
    }

    if (req.user.role === "reviewer") {
      const spec = await Specialization.findOne({
        slug: req.user.specializationTag,
      });
      const officialName = spec ? spec.name : req.user.specializationTag;

      if (
        templateToUpdate.pathName !== officialName &&
        templateToUpdate.pathName !== req.user.specializationTag
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      pathName = officialName;
    }

    // Check user did any changes/updates , if not skip the databse lookup
    if (
      templateToUpdate.level !== level ||
      templateToUpdate.pathName !== pathName
    ) {
      const existingPathway = await Pathway.findOne({
        pathName,
        level,
        isTemplate: true,
        _id: { $ne: req.params.id }, //$ne (Not Equal) MongoDB operator
      });

      if (existingPathway) {
        return res.status(400).json({
          success: false,
          message: `A ${level} pathway for "${pathName}" already exists.`,
        });
      }
    }

    templateToUpdate.pathName = pathName;
    templateToUpdate.level = level;
    templateToUpdate.steps = steps || templateToUpdate.steps;

    await templateToUpdate.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Template updated",
        template: templateToUpdate,
      });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This level and specialization combination already exists globally.",
        });
    }
    console.error("Error in updateTemplate:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Handle new pathway-step creations
exports.addStepToTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { title, description, type, resources, quiz, linkedCourses, order } = req.body;

    const template = await Pathway.findOne({
      _id: templateId,
      isTemplate: true,
    });

    if (
      !template ||
      (req.user.role === "reviewer" &&
        !specializationMatch(template.pathName, req.user.specializationTag))
    ) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Template not found or unauthorized",
        });
    }

    template.steps.push({
      title,
      description,
      type,
      resources: resources || [],
      linkedCourses: linkedCourses || [],
      quiz: quiz || [],
      order,
      isUnlocked: true,
      isCompleted: false,
    });

    await template.save();
    res
      .status(200)
      .json({ success: true, message: "Step added to template", template });
  } catch (err) {
    console.error("Error in addStepToTemplate:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Handle pathway Delete
exports.deleteTemplatePathway = async (req, res) => {
  try {
    const template = await Pathway.findOne({
      _id: req.params.id,
      isTemplate: true,
    });

    if (
      !template ||
      (req.user.role === "reviewer" &&
        !specializationMatch(template.pathName, req.user.specializationTag))
    ) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Template not found or unauthorized",
        });
    }

    await Pathway.deleteOne({ _id: req.params.id });
    res
      .status(200)
      .json({ success: true, message: "Template deleted successfully" });
  } catch (err) {
    console.error("Error in deleteTemplatePathway:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Handle pathway template enable/disable status
exports.updateTemplateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const templateToUpdate = await Pathway.findOne({
      _id: req.params.id,
      isTemplate: true,
    });

    if (
      !templateToUpdate ||
      (req.user.role === "reviewer" &&
        !specializationMatch(templateToUpdate.pathName, req.user.specializationTag))
    ) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Template not found or unauthorized",
        });
    }

    templateToUpdate.status = status;
    await templateToUpdate.save();

    res.status(200).json({ success: true, template: templateToUpdate });
  } catch (err) {
    console.error("Error in updateTemplateStatus:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Get all published/enable Templates
exports.getPublishedTemplates = async (req, res) => {
  try {
    const filter = {
      isTemplate: true,
      status: STATUS.PUBLISHED,
    };
    if (req.query.templateId) {
      filter._id = req.query.templateId;
    } else if (req.query.pathName && req.query.level) {
      filter.pathName = req.query.pathName;
      filter.level = req.query.level;
    }
    let query = Pathway.find(filter);

    // Performance optimization: return lightweight summary when full step details aren't needed
    if (req.query.summary === 'true') {
      query = query.select('-steps');
    }

    const templates = await query.lean();
    res.status(200).json({ success: true, templates });
  } catch (err) {
    console.error("Error in getPublishedTemplates:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Handle Student ENROLL IN A TEMPLATE (Enforces Max 3 Pathways)
exports.enrollInTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    // ENFORCE MAX 3 PATHWAYS RULE
    const activeCount = await Pathway.countDocuments({
      userId: req.user._id,
      isTemplate: false,
    });
    if (activeCount >= MAX_ACTIVE_PATHWAYS) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            `You can only have up to ${MAX_ACTIVE_PATHWAYS} active pathways. Please delete one to enroll in a new journey.`,
        });
    }

    const template = await Pathway.findOne({
      _id: templateId,
      isTemplate: true,
      status: STATUS.PUBLISHED,
    });
    if (!template) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Template not found or not available",
        });
    }

    const existing = await Pathway.findOne({
      userId: req.user._id,
      originalTemplateId: template._id,
      isTemplate: false,
    });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You are already enrolled in this specific pathway.",
        });
    }

    // Map over the template steps to create a copy for the user.
    // This ensures that user progress (isCompleted) doesn't affect the master template.
    const formattedSteps = template.steps.map((step, index) => ({
      title: step.title,
      description: step.description,
      type: step.type,
      resources: step.resources || [],
      linkedCourses: step.linkedCourses || [],
      quiz: step.quiz || [],
      order: step.order || index + 1,
      isUnlocked: index === 0,
      isCompleted: false,
    }));

    const newPathway = await Pathway.create({
      userId: req.user._id,
      isTemplate: false,
      originalTemplateId: template._id,
      pathName: template.pathName,
      level: template.level,
      status: STATUS.IN_PROGRESS,
      steps: formattedSteps,
    });

    res.status(201).json({
      success: true,
      message: "Enrolled successfully!",
      pathway: newPathway,
    });
  } catch (err) {
    console.error("Error in enrollInTemplate:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// Suggest Pathway according to student
exports.recommendPathway = async (req, res) => {
  try {
    const { pathName, level } = req.body;

    if (!pathName || !level) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required path data." });
    }

    req.user.quizCompleted = true;
    req.user.learningPath = pathName;
    req.user.level = level;

    await req.user.save();

    let matchingTemplate = await Pathway.findOne({
      isTemplate: true,
      status: STATUS.PUBLISHED,
      pathName: pathName,
      level: level,
    });

    if (!matchingTemplate) {
      matchingTemplate = await Pathway.findOne({
        isTemplate: true,
        status: STATUS.PUBLISHED,
        pathName: pathName,
      });
    }

    if (!matchingTemplate) {
      matchingTemplate = await Pathway.findOne({
        isTemplate: true,
        status: STATUS.PUBLISHED,
      });
    }

    res.status(200).json({
      success: true,
      message: "Pathway recommended successfully",
      template: matchingTemplate,
    });
  } catch (err) {
    console.error("Error in recommendPathway:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};

// DELETE SPECIFIC Student enroll pathway
exports.deleteMyPathway = async (req, res) => {
  try {
    const pathwayId = req.params.id;

    const pathway = await Pathway.findOneAndDelete({
      _id: pathwayId,
      userId: req.user._id,
      isTemplate: false,
    });

    if (!pathway) {
      return res
        .status(404)
        .json({ success: false, message: "Pathway not found." });
    }

    // Check if they have ANY remaining pathways
    const remainingCount = await Pathway.countDocuments({
      userId: req.user._id,
      isTemplate: false,
    });

    // Only reset their master profile tags if they deleted their VERY LAST pathway
    if (remainingCount === 0) {
      req.user.quizCompleted = false;
      req.user.learningPath = null;
      req.user.level = null;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: "Pathway deleted successfully.",
    });
  } catch (err) {
    console.error("Error in deleteMyPathway:", err);
    res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
};
