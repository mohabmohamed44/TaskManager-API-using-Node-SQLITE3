const express = require("express");
const router = express.Router();
const taskController = require("../Controllers/taskController");
const { authenticate } = require("../Middleware/auth");
const { taskValidation } = require("../Middleware/validation");
const { createLimiter } = require("../Middleware/rateLimiter");

// All routes require authentication
router.use(authenticate);

// Task statistics
router.get("/stats", taskController.getStatistics);

// Search tasks
router.get("/search", taskController.searchTasks);

// Shared tasks
router.get("/shared", taskController.getSharedTasks);

// Trash operations
router.get("/trash", taskController.getTrash);
router.post("/:id/restore", taskValidation.get, taskController.restoreTask);
router.delete(
  "/:id/permanent",
  taskValidation.get,
  taskController.permanentDelete,
);

// Bulk operations
router.patch("/bulk/update", taskController.bulkUpdate);
router.delete("/bulk/delete", taskController.bulkDelete);

// Standard CRUD operations
router.get("/", taskValidation.query, taskController.getAllTasks);
router.get("/:id", taskValidation.get, taskController.getTaskById);
router.post(
  "/",
  createLimiter,
  taskValidation.create,
  taskController.createTask,
);
router.put("/:id", taskValidation.update, taskController.updateTask);
router.delete("/:id", taskValidation.get, taskController.deleteTask);

module.exports = router;
