const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const { uploadProfilePicture } = require("../Controllers/userController");
const upload = require("../Middleware/upload");
const { authenticate } = require("../Middleware/auth");
const { authValidation } = require("../Middleware/validation");
const { authLimiter } = require("../Middleware/rateLimiter");
const oauthController = require("../Controllers/oauthController");

// Public routes
router.post("/register", authLimiter, authValidation.register, authController.register);
router.post("/login", authLimiter, authValidation.login, authController.login);
router.post("/refresh-token", authController.refreshToken);

// Profile picture upload with multer error handling
router.put("/profile-picture", authenticate, (req, res, next) => {
  upload.single("profilePicture")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: "File Upload Error",
        message: err.message
      });
    }
    next();
  });
}, uploadProfilePicture);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.getProfile);

// Step 1: OAuth callback (provider redirects here)
router.get("/oauth/callback", oauthController.handleCallback);
router.get("/oauth/providers", authenticate, oauthController.getLinkedProviders);

// Step 2: Initiate OAuth (get redirect URL)
router.get("/oauth/:provider", oauthController.initiateOAuth);

// Step 3: Frontend OAuth Sync (takes Supabase token, returns Backend JWT)
router.post("/oauth/sync", oauthController.syncAccount);

// Link/Unlink OAuth providers (protected)
router.post("/oauth/link", authenticate, oauthController.linkProvider);
router.delete("/oauth/unlink/:provider", authenticate, oauthController.unlinkProvider);


module.exports = router;