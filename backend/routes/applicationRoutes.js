// backend/routes/applicationRoutes.js
import express from "express";
const router = express.Router();

import authenticateJWT from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import {
  applyToJob,
  viewOwnApplications,
  changeStage,
  viewAllApplicationsForJobs,
  viewApplication,
  getApplicationHistory
} from "../controllers/applicationController.js";

// -----------------------------
// Candidate: apply to job
// -----------------------------
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("candidate"),
  applyToJob
);

// -----------------------------
// Candidate: view own applications
// -----------------------------
router.get(
  "/my-applications",
  authenticateJWT,
  authorizeRoles("candidate"),
  viewOwnApplications
);

// -----------------------------
// Recruiter: view all applications for their jobs
// -----------------------------
router.get(
  "/jobs-applications",
  authenticateJWT,
  authorizeRoles("recruiter"),
  viewAllApplicationsForJobs
);

// -----------------------------
// Single application: candidate, recruiter, or hiring manager
// -----------------------------
router.get(
  "/:applicationId",
  authenticateJWT,
  authorizeRoles("candidate", "recruiter", "hiring_manager"),
  viewApplication
);

// -----------------------------
// Change stage: recruiter only
// -----------------------------
router.put(
  "/:applicationId/stage",
  authenticateJWT,
  authorizeRoles("recruiter"),
  changeStage
);

// -----------------------------
// Application history: candidate, recruiter, or hiring manager
// -----------------------------
router.get(
  "/:applicationId/history",
  authenticateJWT,
  authorizeRoles("candidate", "recruiter", "hiring_manager"),
  getApplicationHistory
);

export default router;
