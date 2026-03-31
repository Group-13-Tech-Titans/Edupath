const express = require("express");
const router = express.Router();

// 1. ALL CONTROLLER IMPORTS CONSOLIDATED HERE
const {
  createPathway,
  completeStep,
  getMyPathway,
  createTemplatePathway,
  getTemplatePathways,
  addStepToTemplate,
  deleteTemplatePathway,
  updateTemplateStatus,
  getTemplateById,
  updateTemplate
} = require("../controllers/pathwayController");

// 2. MIDDLEWARE IMPORTS
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware"); 

// ==============================
//    STUDENT ROUTES (EXISTING)
// ==============================
router.post("/generate", authMiddleware, createPathway);
router.post("/complete-step", authMiddleware, completeStep);
router.get("/my", authMiddleware, getMyPathway);

// ==============================
//    ADMIN / REVIEWER ROUTES
// ==============================

// Create & Get All Templates
router.post("/template", authMiddleware, roleMiddleware(["admin", "reviewer"]), createTemplatePathway);
router.get("/template", authMiddleware, roleMiddleware(["admin", "reviewer"]), getTemplatePathways);

// Add Step to Template
router.post("/template/:templateId/steps", authMiddleware, roleMiddleware(["admin", "reviewer"]), addStepToTemplate);

// Delete & Update Status
router.delete("/template/:id", authMiddleware, roleMiddleware(["admin", "reviewer"]), deleteTemplatePathway);
router.put("/template/:id/status", authMiddleware, roleMiddleware(["admin", "reviewer"]), updateTemplateStatus);

// Get Single & Update Entire Template (For the Edit Page)
router.get("/template/:id", authMiddleware, roleMiddleware(["admin", "reviewer"]), getTemplateById);
router.put("/template/:id", authMiddleware, roleMiddleware(["admin", "reviewer"]), updateTemplate);

module.exports = router;