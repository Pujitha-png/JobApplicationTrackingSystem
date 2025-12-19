// backend/routes/jobRoutes.js
import express from "express";
const router = express.Router();

import authenticateJWT from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

/**
 * Recruiter-only Job CRUD
 */

// Create job
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("recruiter"),
  createJob
);

// Get jobs (company-wise)
router.get(
  "/",
  authenticateJWT,
  authorizeRoles("recruiter"),
  getJobs
);

// Update job
router.put(
  "/:jobId",
  authenticateJWT,
  authorizeRoles("recruiter"),
  updateJob
);

// Delete job
router.delete(
  "/:jobId",
  authenticateJWT,
  authorizeRoles("recruiter"),
  deleteJob
);

export default router;
