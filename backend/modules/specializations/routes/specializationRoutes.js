const express = require("express");
const Specialization = require("../models/specialization");
const SpecializationRequest = require("../models/SpecializationRequest");
const ContactRequest = require("../models/ContactRequest");
const User = require("../../auth/models/User");
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const specializations = await Specialization.find({ isActive: true }).sort({ name: 1 });
    res.json({ specializations });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch specializations" });
  }
});

// Admin gets all specializations (including inactive)
router.get("/all", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const specializations = await Specialization.find().sort({ name: 1 });
    res.json({ specializations });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch specializations" });
  }
});

// Admin creates a new specialization
router.post("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Specialization name is required" });

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existing = await Specialization.findOne({ slug });
    if (existing) return res.status(400).json({ message: "Specialization already exists" });

    const spec = new Specialization({ name, slug, isActive: true });
    await spec.save();

    res.status(201).json({ message: "Specialization created", specialization: spec });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create specialization" });
  }
});

// Admin toggles specialization active status
router.patch("/:id/toggle", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const spec = await Specialization.findById(req.params.id);
    if (!spec) return res.status(404).json({ message: "Specialization not found" });
    
    spec.isActive = !spec.isActive;
    await spec.save();
    
    res.json({ message: "Status toggled successfully", specialization: spec });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to toggle status" });
  }
});

// Educator gets their pending request
router.get("/requests/my", authMiddleware, roleMiddleware(["educator"]), async (req, res) => {
  try {
    const request = await SpecializationRequest.findOne({ educatorId: req.user._id, status: "pending" });
    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch request" });
  }
});

// Educator creates a request
router.post("/requests", authMiddleware, roleMiddleware(["educator"]), async (req, res) => {
  try {
    const { name, email, contactNumber, requestedSpecialization, reason } = req.body;
    
    // Validate all fields
    if (!name || !email || !contactNumber || !requestedSpecialization || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingRequest = await SpecializationRequest.findOne({ educatorId: req.user._id, status: "pending" });
    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending specialization change request" });
    }

    const newRequest = new SpecializationRequest({
      educatorId: req.user._id,
      name,
      email,
      contactNumber,
      requestedSpecialization,
      reason
    });
    
    await newRequest.save();
    res.status(201).json({ message: "Request submitted successfully", request: newRequest });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to submit request" });
  }
});

// Admin gets all requests
router.get("/requests", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const requests = await SpecializationRequest.find().sort({ createdAt: -1 }).populate('educatorId', 'profile.fullName profile.avatar email name profile.specialization specializationTag status isVerified');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch requests" });
  }
});

// Admin accepts or rejects request
router.patch("/requests/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { status } = req.body;
    console.log("[SpecRequest PATCH] id:", req.params.id, "status:", status);

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'." });
    }

    const request = await SpecializationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already processed (status: ${request.status})` });
    }

    request.status = status;
    await request.save();

    if (status === "accepted") {
      // Use findByIdAndUpdate to only change specializationTag without triggering full model validation
      await User.findByIdAndUpdate(request.educatorId, {
        specializationTag: request.requestedSpecialization,
        "profile.specialization": request.requestedSpecialization,
        "profile.specializationTag": request.requestedSpecialization,
      });
      console.log("[SpecRequest PATCH] Updated educator specializationTag to:", request.requestedSpecialization);
    }

    res.json({ message: `Request ${status} successfully`, request });
  } catch (err) {
    console.error("[SpecRequest PATCH] Error:", err);
    res.status(500).json({ message: err.message || "Failed to update request" });
  }
});

// =============================================
// CONTACT ADMIN ROUTES
// =============================================

// Educator submits a contact request
router.post("/contact", authMiddleware, roleMiddleware(["educator"]), async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const newContact = new ContactRequest({
      educatorId: req.user._id,
      name: req.user.name || req.user.profile?.fullName || "Unknown",
      email: req.user.email,
      subject,
      message
    });

    await newContact.save();
    res.status(201).json({ message: "Contact request submitted successfully", contact: newContact });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to submit contact request" });
  }
});

// Admin gets all contact requests
router.get("/contact", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const contacts = await ContactRequest.find().sort({ createdAt: -1 }).populate('educatorId', 'profile email name role status specializationTag');
    res.json({ contacts });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch contact requests" });
  }
});

// Admin gets a single contact request with full educator details
router.get("/contact/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const contact = await ContactRequest.findById(req.params.id).populate('educatorId', 'profile email name role status specializationTag');
    if (!contact) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    // Mark as reviewed when admin views it
    if (contact.status === "pending") {
      contact.status = "reviewed";
      await contact.save();
    }

    res.json({ contact });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch contact request" });
  }
});

module.exports = router;
