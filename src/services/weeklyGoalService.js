const weeklyGoalsRepository = require("../Repositories/weeklyGoalsRepository");
const taskRepository = require("../Repositories/TaskRepository");
const { ValidationError, NotFoundError } = require("../utils/error");

class WeeklyGoalsService {
  // ==================== HELPER METHODS ====================
  
  getWeekDates(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      week_start: monday.toISOString().split('T')[0],
      week_end: sunday.toISOString().split('T')[0]
    };
  }

  validateGoalData(goalData) {
    const { title, week_start, week_end } = goalData;
    
    if (!title || title.trim() === "") {
      throw new ValidationError("Goal title is required");
    }

    if (!week_start || !week_end) {
      throw new ValidationError("Week start and end dates are required");
    }

    // Validate dates
    const start = new Date(week_start);
    const end = new Date(week_end);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError("Invalid date format");
    }

    if (start >= end) {
      throw new ValidationError("Week start must be before week end");
    }

    // Validate it's actually a week (7 days)
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff !== 6) {
      throw new ValidationError("Week must be exactly 7 days (start to end)");
    }
  }

  // ==================== GOALS ====================
  
  async createGoal(userId, goalData) {
    // Auto-calculate week dates if not provided
    if (!goalData.week_start || !goalData.week_end) {
      const dates = this.getWeekDates();
      goalData.week_start = dates.week_start;
      goalData.week_end = dates.week_end;
    }

    this.validateGoalData(goalData);

    return await weeklyGoalsRepository.createGoal(userId, goalData);
  }

  async getCurrentWeekGoals(userId) {
    return await weeklyGoalsRepository.getCurrentWeekGoals(userId);
  }

  async getGoalsByWeek(userId, weekStart) {
    if (!weekStart) {
      throw new ValidationError("Week start date is required");
    }

    return await weeklyGoalsRepository.getGoalsByWeek(userId, weekStart);
  }

  async getGoalById(goalId, userId) {
    return await weeklyGoalsRepository.getGoalById(goalId, userId);
  }

  async updateGoal(goalId, userId, updates) {
    if (updates.title && updates.title.trim() === "") {
      throw new ValidationError("Goal title cannot be empty");
    }

    if (updates.progress !== undefined) {
      if (updates.progress < 0 || updates.progress > 100) {
        throw new ValidationError("Progress must be between 0 and 100");
      }
    }

    if (updates.status) {
      const validStatuses = ["not_started", "in_progress", "completed", "abandoned"];
      if (!validStatuses.includes(updates.status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(", ")}`);
      }
    }

    return await weeklyGoalsRepository.updateGoal(goalId, userId, updates);
  }

  async deleteGoal(goalId, userId) {
    return await weeklyGoalsRepository.deleteGoal(goalId, userId);
  }

  async reorderGoals(userId, weekStart, goalId, newPosition) {
    if (newPosition < 0) {
      throw new ValidationError("Position must be non-negative");
    }

    return await weeklyGoalsRepository.reorderGoals(userId, weekStart, goalId, newPosition);
  }

  // ==================== MILESTONES ====================
  
  async createMilestone(goalId, userId, milestoneData) {
    // Verify user owns the goal
    await weeklyGoalsRepository.getGoalById(goalId, userId);
    
    const { title } = milestoneData;
    if (!title || title.trim() === "") {
      throw new ValidationError("Milestone title is required");
    }

    return await weeklyGoalsRepository.createMilestone(goalId, milestoneData);
  }

  async updateMilestone(milestoneId, userId, goalId, updates) {
    // Verify user owns the goal
    await weeklyGoalsRepository.getGoalById(goalId, userId);
    
    if (updates.title && updates.title.trim() === "") {
      throw new ValidationError("Milestone title cannot be empty");
    }

    return await weeklyGoalsRepository.updateMilestone(milestoneId, updates);
  }

  async deleteMilestone(milestoneId, userId, goalId) {
    // Verify user owns the goal
    await weeklyGoalsRepository.getGoalById(goalId, userId);
    
    return await weeklyGoalsRepository.deleteMilestone(milestoneId);
  }

  async toggleMilestone(milestoneId, userId, goalId) {
    // Verify user owns the goal
    await weeklyGoalsRepository.getGoalById(goalId, userId);
    
    return await weeklyGoalsRepository.toggleMilestone(milestoneId);
  }

  // ==================== TASK ASSOCIATIONS ====================
  
  async addTaskToGoal(goalId, userId, taskId) {
    // Verify user owns the goal
    await weeklyGoalsRepository.getGoalById(goalId, userId);
    
    // Verify user owns the task
    const task = await taskRepository.getById(taskId, userId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return await weeklyGoalsRepository.addTaskToGoal(goalId, taskId);
  }

  async removeTaskFromGoal(goalId, userId, taskId) {
    // Verify user owns the goal
    await weeklyGoalsRepository.getGoalById(goalId, userId);
    
    return await weeklyGoalsRepository.removeTaskFromGoal(goalId, taskId);
  }

  // ==================== STATISTICS ====================
  
  async getWeeklyStatistics(userId, weekStart) {
    if (!weekStart) {
      const dates = this.getWeekDates();
      weekStart = dates.week_start;
    }

    return await weeklyGoalsRepository.getWeeklyStatistics(userId, weekStart);
  }

  async getCurrentWeekStatistics(userId) {
    const dates = this.getWeekDates();
    return await weeklyGoalsRepository.getWeeklyStatistics(userId, dates.week_start);
  }

  // ==================== BULK OPERATIONS ====================
  
  async bulkUpdateGoals(userId, goalIds, updates) {
    const results = [];
    
    for (const goalId of goalIds) {
      try {
        const updated = await this.updateGoal(goalId, userId, updates);
        results.push({ goalId, success: true, data: updated });
      } catch (error) {
        results.push({ goalId, success: false, error: error.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    return {
      message: `${successCount}/${goalIds.length} goals updated`,
      results
    };
  }

  // ==================== TEMPLATES & RECURRING ====================
  
  async duplicateGoalToNextWeek(goalId, userId) {
    const goal = await weeklyGoalsRepository.getGoalById(goalId, userId);
    
    // Calculate next week's dates
    const nextWeekStart = new Date(goal.week_start);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    
    const nextWeekEnd = new Date(goal.week_end);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
    
    // Create new goal
    const newGoal = await weeklyGoalsRepository.createGoal(userId, {
      title: goal.title,
      description: goal.description,
      week_start: nextWeekStart.toISOString().split('T')[0],
      week_end: nextWeekEnd.toISOString().split('T')[0],
      priority: goal.priority,
      category: goal.category
    });
    
    // Duplicate milestones
    for (const milestone of goal.milestones) {
      await weeklyGoalsRepository.createMilestone(newGoal.id, {
        title: milestone.title
      });
    }
    
    return newGoal;
  }
}

module.exports = new WeeklyGoalsService();