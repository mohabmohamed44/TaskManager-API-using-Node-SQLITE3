const supabase  = require("../config/database");

class HistoryRepository {
  // Generic create history entry
  async create(history) {
    const {
      taskId,
      userId,
      action,
      field = null,
      oldValue = null,
      newValue = null,
    } = history;

    const { data, error } = await supabase
      .from("task_history")
      .insert([
        {
          task_id: taskId,
          user_id: userId,
          action,
          field,
          old_value: oldValue,
          new_value: newValue,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data.id; // return inserted ID
  }

  // Get all history for a task (with user info)
  async getByTaskId(taskId) {
    const { data, error } = await supabase
      .from("task_history")
      .select(`
        *,
        users: user_id (name, email)
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Flatten user info
    return data.map((h) => ({
      ...h,
      userName: h.users?.name,
      userEmail: h.users?.email,
    }));
  }

  // Shortcut methods for logging actions
  async logTaskCreation(taskId, userId) {
    return this.create({ taskId, userId, action: "created" });
  }

  async logTaskUpdate(taskId, userId, field, oldValue, newValue) {
    return this.create({
      taskId,
      userId,
      action: "updated",
      field,
      oldValue: String(oldValue),
      newValue: String(newValue),
    });
  }

  async logTaskCompletion(taskId, userId, completed) {
    return this.create({
      taskId,
      userId,
      action: completed ? "completed" : "reopened",
    });
  }

  async logTaskDeletion(taskId, userId) {
    return this.create({ taskId, userId, action: "deleted" });
  }
}

module.exports = new HistoryRepository();