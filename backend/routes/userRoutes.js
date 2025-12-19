// backend/routes/userRoutes.js
import express from "express";
const router = express.Router();

import {
  registerUser,
  loginUser,
  updateProfile,
  getAllUsers
} from "../controllers/userController.js";

import authenticateJWT from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.put(
  "/profile",
  authenticateJWT,
  authorizeRoles("candidate"),
  updateProfile
);

router.get(
  "/",
  authenticateJWT,
  authorizeRoles("recruiter"),
  getAllUsers
);

export default router;
