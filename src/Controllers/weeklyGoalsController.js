const weeklyGoalService = require("../services/weeklyGoalService");

class WeeklyGoalsController {
  async createGoal(req, res, next) {
    try {
      const goal = await weeklyGoalService.createGoal(req.user.id, req.body);
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentWeekGoals(req, res, next) {
    try {
      const goals = await weeklyGoalService.getCurrentWeekGoals(req.user.id);
      res.json(goals);
    } catch (error) {
      next(error);
    }
  }

  async getGoalsByWeek(req, res, next) {
    try {
      const goals = await weeklyGoalService.getGoalsByWeek(
        req.user.id,
        req.query.weekStart
      );
      res.json(goals);
    } catch (error) {
      next(error);
    }
  }

  async getGoalById(req, res, next) {
    try {
      const goal = await weeklyGoalService.getGoalById(
        req.params.id,
        req.user.id
      );
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req, res, next) {
    try {
      const goal = await weeklyGoalService.updateGoal(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req, res, next) {
    try {
      await weeklyGoalService.deleteGoal(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async reorderGoals(req, res, next) {
    try {
      const { weekStart, newPosition } = req.body;
      const result = await weeklyGoalService.reorderGoals(
        req.user.id,
        weekStart,
        req.params.id,
        newPosition
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // MILESTONES
  async createMilestone(req, res, next) {
    try {
      const milestone = await weeklyGoalService.createMilestone(
        req.params.goalId,
        req.user.id,
        req.body
      );
      res.status(201).json(milestone);
    } catch (error) {
      next(error);
    }
  }

  async updateMilestone(req, res, next) {
    try {
      const milestone = await weeklyGoalService.updateMilestone(
        req.params.id,
        req.user.id,
        req.params.goalId,
        req.body
      );
      res.json(milestone);
    } catch (error) {
      next(error);
    }
  }

  async deleteMilestone(req, res, next) {
    try {
      await weeklyGoalService.deleteMilestone(
        req.params.id,
        req.user.id,
        req.params.goalId
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async toggleMilestone(req, res, next) {
    try {
      const milestone = await weeklyGoalService.toggleMilestone(
        req.params.id,
        req.user.id,
        req.params.goalId
      );
      res.json(milestone);
    } catch (error) {
      next(error);
    }
  }

  // TASK ASSOCIATIONS
  async addTaskToGoal(req, res, next) {
    try {
      const result = await weeklyGoalService.addTaskToGoal(
        req.params.goalId,
        req.user.id,
        req.body.taskId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async removeTaskFromGoal(req, res, next) {
    try {
      await weeklyGoalService.removeTaskFromGoal(
        req.params.goalId,
        req.user.id,
        req.params.taskId
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // STATISTICS
  async getWeeklyStatistics(req, res, next) {
    try {
      const stats = await weeklyGoalService.getWeeklyStatistics(
        req.user.id,
        req.query.weekStart
      );
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // BULK OPERATIONS
  async bulkUpdateGoals(req, res, next) {
    try {
      const { goalIds, updates } = req.body;
      const result = await weeklyGoalService.bulkUpdateGoals(
        req.user.id,
        goalIds,
        updates
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // DUPLICATE
  async duplicateGoalToNextWeek(req, res, next) {
    try {
      const goal = await weeklyGoalService.duplicateGoalToNextWeek(
        req.params.id,
        req.user.id
      );
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WeeklyGoalsController();
