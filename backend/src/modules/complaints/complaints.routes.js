import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { roleMiddleware } from "../../middleware/role.middleware.js";
import {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  generateComplaintUploadUrl,
} from "./complaints.controller.js";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
  uploadUrlSchema,
} from "./complaints.validator.js";

const router = express.Router();

// S3 Upload URL generation for complaint images
router.post("/upload-url", validate(uploadUrlSchema), generateComplaintUploadUrl);

// Standard CRUD endpoints
router.post("/", validate(createComplaintSchema), createComplaint);
router.get("/", getComplaints);
router.get("/me", getMyComplaints);
router.get("/:id", getComplaintById);

// Update complaint status (restricted to admin, leader, representative)
router.patch(
  "/:id/status",
  roleMiddleware("ADMINISTRATOR", "LEADER", "REPRESENTATIVE"),
  validate(updateComplaintStatusSchema),
  updateComplaintStatus
);

// Delete complaint
router.delete("/:id", deleteComplaint);

export default router;
