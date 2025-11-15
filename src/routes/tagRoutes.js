const express = require("express");
const router = express.Router();
const tagController = require("../Controllers/tagController");
const { authenticate } = require("../Middleware/auth");

// All routes require authentication
router.use(authenticate);

// Tag management
router.get("/", tagController.getAllTags);
router.post("/", tagController.createTag);
router.delete("/:id", tagController.deleteTag);

// Task-Tag association (nested under tasks)
router.get("/tasks/:id/tags", tagController.getTaskTags);
router.post("/tasks/:id/tags", tagController.addTagToTask);
router.delete("/tasks/:id/tags/:tagId", tagController.removeTagFromTask);

module.exports = router;
