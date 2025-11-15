const express = require("express");
const router = express.Router();
const historyController = require("../Controllers/historyController");
const { authenticate } = require("../Middleware/auth");

router.use(authenticate);

router.get("/:id/history", historyController.getTaskHistory);

module.exports = router;
