const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const { authenticate } = require("../Middleware/auth");
const { authValidation } = require("../Middleware/validation");
const { authLimiter } = require("../Middleware/rateLimiter");

// Public routes
router.post("/register", authLimiter, authValidation.register, authController.register);
router.post("/login", authLimiter, authValidation.login, authController.login);
router.post("/refresh-token", authController.refreshToken);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.getProfile);

module.exports = router;