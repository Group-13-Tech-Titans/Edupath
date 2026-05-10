const express = require("express");
const router = express.Router();

const {
  createPathway,
  completeStep,
  getMyPathway,
  getPublishedTemplates,
  enrollInTemplate,
  syncPathwaySteps,
  createTemplatePathway,
  getTemplatePathways,
  addStepToTemplate,
  deleteTemplatePathway,
  updateTemplateStatus,
  getTemplateById,
  updateTemplate,
  recommendPathway,
  deleteMyPathway
} = require("../controllers/pathwayController");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");


//    STUDENT INTERACTION ROUTES

router.get("/published", authMiddleware, getPublishedTemplates);
router.post("/recommend", authMiddleware, recommendPathway);
router.post("/generate", authMiddleware, createPathway);
router.post("/enroll/:templateId", authMiddleware, enrollInTemplate);

// Pathway Operations
router.get("/my", authMiddleware, getMyPathway);
router.put("/my/sync", authMiddleware, syncPathwaySteps);
router.delete("/my/:id", authMiddleware, deleteMyPathway);
router.post("/complete-step", authMiddleware, completeStep);


//    ADMIN / REVIEWER TEMPLATE ROUTES

// Create / Read Collections
router.post("/template", authMiddleware, roleMiddleware(["admin", "reviewer"]), createTemplatePathway);
router.get("/template", authMiddleware, roleMiddleware(["admin", "reviewer"]), getTemplatePathways);

// Read / Update / Delete Document
router.get("/template/:id", authMiddleware, roleMiddleware(["admin", "reviewer"]), getTemplateById);
router.put("/template/:id", authMiddleware, roleMiddleware(["admin", "reviewer"]), updateTemplate);
router.delete("/template/:id", authMiddleware, roleMiddleware(["admin", "reviewer"]), deleteTemplatePathway);

// Specific Node Operations
router.post("/template/:templateId/steps", authMiddleware, roleMiddleware(["admin", "reviewer"]), addStepToTemplate);
router.put("/template/:id/status", authMiddleware, roleMiddleware(["admin", "reviewer"]), updateTemplateStatus);

module.exports = router;