const express = require("express");
const router = express.Router();
const subtaskController = require("../Controllers/subtaskController");
const { authenticate } = require("../Middleware/auth");
const { subtaskValidation } = require("../Middleware/validation");

// All routes require authentication
router.use(authenticate);

// Subtask routes (nested under tasks)
router.get("/:id/subtasks", subtaskController.getSubtasks);
router.post(
  "/:id/subtasks",
  subtaskValidation.create,
  subtaskController.createSubtask,
);
router.put("/:id/subtasks/:subtaskId", subtaskController.updateSubtask);
router.delete("/:id/subtasks/:subtaskId", subtaskController.deleteSubtask);
router.post(
  "/:id/subtasks/:subtaskId/toggle",
  subtaskController.toggleComplete,
);

module.exports = router;
