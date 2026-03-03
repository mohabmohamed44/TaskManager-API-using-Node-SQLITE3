const express = require("express");
const router = express.Router();
const weeklyGoalsController = require("../Controllers/weeklyGoalsController");
const { authenticate } = require("../Middleware/auth");
const { weeklyGoalValidation } = require("../Middleware/validation");
const { createLimiter } = require("../Middleware/rateLimiter");

// All routes require authentication
router.use(authenticate);

// Statistics
router.get("/stats", weeklyGoalsController.getWeeklyStatistics);

// Goal collection operations
router.get("/current", weeklyGoalsController.getCurrentWeekGoals);
router.get("/by-week", weeklyGoalsController.getGoalsByWeek);
router.patch("/bulk/update", weeklyGoalsController.bulkUpdateGoals);

// Standard CRUD
router.post(
  "/",
  createLimiter,
  weeklyGoalValidation.create,
  weeklyGoalsController.createGoal
);

router.get("/:id", weeklyGoalValidation.get, weeklyGoalsController.getGoalById);
router.put(
  "/:id",
  weeklyGoalValidation.update,
  weeklyGoalsController.updateGoal
);
router.delete(
  "/:id",
  weeklyGoalValidation.get,
  weeklyGoalsController.deleteGoal
);

// Advanced operations
router.post("/:id/reorder", weeklyGoalsController.reorderGoals);
router.post("/:id/duplicate", weeklyGoalsController.duplicateGoalToNextWeek);

// MILESTONES (Nested under goal)
router.post("/:goalId/milestones", weeklyGoalsController.createMilestone);
router.put(
  "/:goalId/milestones/:id",
  weeklyGoalsController.updateMilestone
);
router.delete(
  "/:goalId/milestones/:id",
  weeklyGoalsController.deleteMilestone
);
router.post(
  "/:goalId/milestones/:id/toggle",
  weeklyGoalsController.toggleMilestone
);

// TASK ASSOCIATIONS
router.post("/:goalId/tasks", weeklyGoalsController.addTaskToGoal);
router.delete(
  "/:goalId/tasks/:taskId",
  weeklyGoalsController.removeTaskFromGoal
);

module.exports = router;
