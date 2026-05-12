const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const { authenticate } = require("../Middleware/auth");

router.get("/", authenticate, userController.getAllUsers);

module.exports = router;
