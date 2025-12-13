const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const { authenticate } = require("../Middleware/auth");
const { authValidation } = require("../Middleware/validation");

// Public routes
router.post("/register", authValidation.register, authController.register);
router.post("/login", authValidation.login, authController.login);
router.post("/refresh-token", authController.refreshToken);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.getProfile);

module.exports = router;