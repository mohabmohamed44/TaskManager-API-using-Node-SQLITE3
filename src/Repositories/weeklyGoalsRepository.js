const supabase = require("../config/database");
const { DatabaseError, NotFoundError, ValidationError } = require("../utils/error");

class WeeklyGoalsRepository {
  // ==================== WEEKLY GOALS ====================
  
  async createGoal(userId, goalData) {
    try {
      const { title, description, week_start, week_end, priority, category } = goalData;
      
      // Get max position for this week
      const { data: maxPos } = await supabase
        .from("weekly_goals")
        .select("position")
        .eq("user_id", userId)
        .eq("week_start", week_start)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const position = maxPos ? maxPos.position + 1 : 0;

      const { data, error } = await supabase
        .from("weekly_goals")
        .insert([{
          user_id: userId,
          title,
          description,
          week_start,
          week_end,
          priority: priority || "medium",
          category: category || "general",
          position
        }])
        .select()
        .single();

      if (error) {
        console.error("Supabase error (createGoal):", error);
        throw new DatabaseError("Failed to create weekly goal", error);
      }
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error("Unexpected error (createGoal):", error);
      throw new DatabaseError("Unexpected error creating weekly goal", error);
    }
  }

  async getGoalsByWeek(userId, weekStart) {
    try {
      const { data, error } = await supabase
        .from("weekly_goals")
        .select(`
          *,
          milestones:weekly_goal_milestones(*),
          tasks:weekly_goal_tasks(
            task:tasks(*)
          )
        `)
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .order("position", { ascending: true });

      if (error) throw new DatabaseError("Failed to fetch weekly goals", error);
      
      // Transform the data
      return data.map(goal => ({
        ...goal,
        tasks: goal.tasks.map(t => t.task)
      }));
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error fetching weekly goals", error);
    }
  }

  async getCurrentWeekGoals(userId) {
    try {
      const { data: weekStart, error: weekError } = await supabase
        .rpc("get_week_start");

      if (weekError) throw new DatabaseError("Failed to get week start", weekError);
      
      return this.getGoalsByWeek(userId, weekStart);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error fetching current week goals", error);
    }
  }

  async getGoalById(goalId, userId) {
    try {
      const { data, error } = await supabase
        .from("weekly_goals")
        .select(`
          *,
          milestones:weekly_goal_milestones(*),
          tasks:weekly_goal_tasks(
            task:tasks(*)
          )
        `)
        .eq("id", goalId)
        .eq("user_id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        throw new NotFoundError("Weekly goal not found");
      }
      if (error) throw new DatabaseError("Failed to fetch weekly goal", error);
      
      return {
        ...data,
        tasks: data.tasks.map(t => t.task)
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error fetching weekly goal", error);
    }
  }

  async updateGoal(goalId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from("weekly_goals")
        .update(updates)
        .eq("id", goalId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to update weekly goal", error);
      if (!data) throw new NotFoundError("Weekly goal not found");
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error updating weekly goal", error);
    }
  }

  async deleteGoal(goalId, userId) {
    try {
      const { error } = await supabase
        .from("weekly_goals")
        .delete()
        .eq("id", goalId)
        .eq("user_id", userId);

      if (error) throw new DatabaseError("Failed to delete weekly goal", error);
      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error deleting weekly goal", error);
    }
  }

  async reorderGoals(userId, weekStart, goalId, newPosition) {
    try {
      const { data, error } = await supabase
        .from("weekly_goals")
        .update({ position: newPosition })
        .eq("id", goalId)
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to reorder weekly goals", error);
      if (!data) throw new NotFoundError("Weekly goal not found");
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error reordering weekly goals", error);
    }
  }

  // ==================== MILESTONES ====================
  
  async createMilestone(goalId, milestoneData) {
    try {
      const { title } = milestoneData;
      
      // Get max position
      const { data: maxPos } = await supabase
        .from("weekly_goal_milestones")
        .select("position")
        .eq("weekly_goal_id", goalId)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const position = maxPos ? maxPos.position + 1 : 0;

      const { data, error } = await supabase
        .from("weekly_goal_milestones")
        .insert([{
          weekly_goal_id: goalId,
          title,
          position
        }])
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to create milestone", error);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error creating milestone", error);
    }
  }

  async updateMilestone(milestoneId, updates) {
    try {
      const { data, error } = await supabase
        .from("weekly_goal_milestones")
        .update(updates)
        .eq("id", milestoneId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to update milestone", error);
      if (!data) throw new NotFoundError("Milestone not found");
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error updating milestone", error);
    }
  }

  async deleteMilestone(milestoneId) {
    try {
      const { error } = await supabase
        .from("weekly_goal_milestones")
        .delete()
        .eq("id", milestoneId);

      if (error) throw new DatabaseError("Failed to delete milestone", error);
      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error deleting milestone", error);
    }
  }

  async toggleMilestone(milestoneId) {
    try {
      // Get current state
      const { data: current } = await supabase
        .from("weekly_goal_milestones")
        .select("completed")
        .eq("id", milestoneId)
        .single();

      if (!current) throw new NotFoundError("Milestone not found");

      const { data, error } = await supabase
        .from("weekly_goal_milestones")
        .update({ completed: !current.completed })
        .eq("id", milestoneId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to toggle milestone", error);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error toggling milestone", error);
    }
  }

  // ==================== TASK ASSOCIATIONS ====================
  
  async addTaskToGoal(goalId, taskId) {
    try {
      const { data, error } = await supabase
        .from("weekly_goal_tasks")
        .insert([{
          weekly_goal_id: goalId,
          task_id: taskId
        }])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") { // Unique violation
          throw new ValidationError("Task already added to this goal");
        }
        throw new DatabaseError("Failed to add task to goal", error);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error adding task to goal", error);
    }
  }

  async removeTaskFromGoal(goalId, taskId) {
    try {
      const { error } = await supabase
        .from("weekly_goal_tasks")
        .delete()
        .eq("weekly_goal_id", goalId)
        .eq("task_id", taskId);

      if (error) throw new DatabaseError("Failed to remove task from goal", error);
      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error removing task from goal", error);
    }
  }

  // ==================== STATISTICS ====================
  
  async getWeeklyStatistics(userId, weekStart) {
    try {
      const goals = await this.getGoalsByWeek(userId, weekStart);
      
      const stats = {
        total: goals.length,
        notStarted: goals.filter(g => g.status === "not_started").length,
        inProgress: goals.filter(g => g.status === "in_progress").length,
        completed: goals.filter(g => g.status === "completed").length,
        abandoned: goals.filter(g => g.status === "abandoned").length,
        averageProgress: goals.length > 0 
          ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
          : 0,
        byPriority: {
          low: goals.filter(g => g.priority === "low").length,
          medium: goals.filter(g => g.priority === "medium").length,
          high: goals.filter(g => g.priority === "high").length,
          urgent: goals.filter(g => g.priority === "urgent").length,
        },
        byCategory: goals.reduce((acc, goal) => {
          acc[goal.category] = (acc[goal.category] || 0) + 1;
          return acc;
        }, {})
      };
      
      return stats;
    } catch (error) {
      throw new DatabaseError("Failed to calculate weekly statistics", error);
    }
  }
}

module.exports = new WeeklyGoalsRepository();